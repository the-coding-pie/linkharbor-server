import { NextFunction, Request, Response } from "express";
import validator from "validator";
import { db } from "../db";
import { userTable } from "../db/schemas/user";
import { and, eq, gt } from "drizzle-orm";
import { forgotPasswordTable } from "../db/schemas/forgotPassword";
import createRandomToken from "../utils/createRandomToken";
import {
  APP_NAME,
  CLIENT_URL,
  DEFAULT_PROFILE_IMG_NAME,
  FORGOT_PASSWORD_TOKEN_LENGTH,
  PROFILE_PICS_DIR_NAME,
  PROFILE_SIZE,
  PUBLIC_DIR_NAME,
} from "../config";
import nodemailer from "nodemailer";
import { emailVerificationTable } from "../db/schemas/emailVerification";
import { refreshTokenTable } from "../db/schemas/refreshToken";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { failure, success } from "../utils/responses";
import argon2 from "argon2";
import getCurrentUTCDate from "../utils/getCurrentUTCDate";
import { removeFile, saveFile } from "../utils/file";
import path from "path";

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      // if no email exists
      return failure(res, {
        status: 400,
        message: "Email is required",
      });
    } else if (!validator.isEmail(email)) {
      return failure(res, {
        status: 400,
        message: "Invalid email",
      });
    }

    const userExists = await db
      .select()
      .from(userTable)
      .limit(1)
      .where(eq(userTable.email, email));

    if (userExists.length > 0) {
      // delete old record if any exists
      await db
        .delete(forgotPasswordTable)
        .where(eq(forgotPasswordTable.userId, userExists[0].id));

      // send an email with token with a validity of 3 days
      const newRandomToken = await createRandomToken(
        FORGOT_PASSWORD_TOKEN_LENGTH
      );

      const newForgotPassword = await db
        .insert(forgotPasswordTable)
        .values({
          userId: userExists[0].id,
          token: newRandomToken,
        })
        .returning();

      // send email
      // create a transport
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL!,
          pass: process.env.GMAIL_PASSWORD!,
        },
      });

      // mail options
      const mailOptions = {
        from: `${APP_NAME} ${process.env.GMAIL}`,
        to: userExists[0].email,
        subject: "Forgot Your Password?",
        html: `
          <h1>Forgot your password? It happens to the best of us.</h1>
          <p style="font-size: 16px; font-weight: 600;">To reset your password, click the link below. The link will self-destruct after three days.</p>
          
          <a style="font-size: 14px;" href=${CLIENT_URL}/reset-password/${newForgotPassword[0].token} target="_blank">Click here to reset your password</a>
  
          <br />
          <br />
  
          <p style="font-size: 14px;">If you do not want to change your password or didn't request a reset, you can ignore and delete this email.</p>
        `,
      };

      // fail silently if error happens
      transporter.sendMail(mailOptions, function (err, info) {
        transporter.close();
      });
    }

    return success(res, {
      message:
        "If an account exists for the email address, you will get an email with instructions on resetting your password. If it doesn't arrive, be sure to check your spam folder.",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    let { password } = req.body;

    if (!token || token.length !== FORGOT_PASSWORD_TOKEN_LENGTH) {
      return failure(res, {
        status: 404,
        message: "Sorry, your password reset link has expired or is malformed",
      });
    }

    if (!password) {
      return failure(res, {
        status: 400,
        message: "New password is required",
      });
    } else if (password.length < 8) {
      return failure(res, {
        status: 400,
        message: "Password must be at least 8 characters long",
      });
    } else if (!/[A-Z]/.test(password)) {
      return failure(res, {
        status: 400,
        message: "Password must contain at least one uppercase letter",
      });
    } else if (!/[a-z]/.test(password)) {
      return failure(res, {
        status: 400,
        message: "Password must contain at least one lowercase letter",
      });
    } else if (!/[0-9]/.test(password)) {
      return failure(res, {
        status: 400,
        message: "Password must contain at least one digit",
      });
    } else if (!/[!@#$%^&*]/.test(password)) {
      return failure(res, {
        status: 400,
        message: "Password must contain at least special character",
      });
    }

    password = password.trim();

    // check if it is a valid token
    const validToken = await db
      .select()
      .from(forgotPasswordTable)
      .limit(1)
      .where(
        and(
          eq(forgotPasswordTable.token, token),
          gt(forgotPasswordTable.expiresAt, getCurrentUTCDate())
        )
      );

    if (validToken.length === 0) {
      return failure(res, {
        status: 404,
        message: "Sorry, your password reset link has expired or is malformed",
      });
    }

    // find the user and reset their password, then delete the row from forgotPassword table
    const userExists = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, validToken[0].userId));

    // rare foolish case -> token exists no user
    if (userExists.length === 0) {
      await db
        .delete(forgotPasswordTable)
        .where(eq(forgotPasswordTable.id, validToken[0].id));
      await db
        .delete(emailVerificationTable)
        .where(eq(emailVerificationTable.userId, validToken[0].userId));
      await db
        .delete(refreshTokenTable)
        .where(eq(refreshTokenTable.userId, validToken[0].userId));

      return failure(res, {
        status: 401,
        message: "Invalid user",
      });
    }

    const hashedPassword = await argon2.hash(password);

    // if user clicks on the link, that indirectly means they verified their email
    await db
      .delete(emailVerificationTable)
      .where(eq(emailVerificationTable.userId, userExists[0].id));
    await db
      .update(userTable)
      .set({
        password: hashedPassword,
        isOAuth: false,
        emailVerified: true,
        updatedAt: getCurrentUTCDate(),
      })
      .where(eq(userTable.id, userExists[0].id));
    await db
      .delete(refreshTokenTable)
      .where(eq(refreshTokenTable.userId, userExists[0].id));
    await db
      .delete(forgotPasswordTable)
      .where(eq(forgotPasswordTable.id, validToken[0].id));

    // generate new tokens and send
    // generate accessToken & refreshToken
    const newAccessToken = generateAccessToken({
      id: userExists[0].id,
    });
    const newRefreshToken = await generateRefreshToken({
      id: userExists[0].id,
    });

    return success(res, {
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      message: "Password changed successfully!",
    });
  } catch (err) {
    next(err);
  }
};

// update user profile
// PUT /accounts
export const updateAccount = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, name, password } = req.body;
    const profile = req.file;

    let values: any = {};

    let fileName;

    if (Object.keys(req.body).includes("name")) {
      if (!name) {
        return failure(res, {
          status: 400,
          message: "Name is required",
        });
      } else if (name.length < 2 || name.length > 30) {
        return failure(res, {
          status: 400,
          message: "Name must be between 2-30 characters long",
        });
      }

      values.name = validator.escape(name.trim());
    }

    // if password key is present, and it contains a value, then its validation
    if (password) {
      if (password.length < 8) {
        return failure(res, {
          status: 400,
          message: "Password must be at least 8 characters long",
        });
      } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        // check if password has atleast one digit and one letter
        return failure(res, {
          status: 400,
          message: "Password must contain at least one letter and one number",
        });
      }

      values.password = await argon2.hash(password.trim());
    }

    // current user can change username, then it's validation
    if (Object.keys(req.body).includes("username")) {
      // if user already used his 1 chance
      if (req.user.usernameUpdated) {
        return failure(res, {
          status: 403,
          message:
            "You already updated your username, you can't update anymore 😔",
        });
      } else {
        if (username !== req.user.username) {
          // validation of username
          if (!username) {
            return failure(res, {
              status: 400,
              message: "Username cannot be empty",
            });
          } else if (username.length < 2) {
            return failure(res, {
              status: 400,
              message: "Username must be atleast 2 chars long",
            });
          } else if (username.length > 30) {
            return failure(res, {
              status: 400,
              message: "Username must be atleast 2 chars long",
            });
          } else if (!/^[A-Za-z0-9_-]*$/.test(username)) {
            return failure(res, {
              status: 400,
              message:
                "Username must only contain letters, numbers, underscores and dashes",
            });
          }

          values.username = validator.escape(username.trim());
          values.usernameUpdated = true;
        }
      }
    }

    if (profile) {
      // remove old image and upload new image
      if (req.user.profile !== DEFAULT_PROFILE_IMG_NAME) {
        await removeFile(
          path.join(PUBLIC_DIR_NAME, PROFILE_PICS_DIR_NAME, req.user.profile)
        );
      }

      fileName = await saveFile(
        profile,
        PROFILE_SIZE.WIDTH,
        PROFILE_SIZE.HEIGHT,
        PROFILE_PICS_DIR_NAME
      );
    } else {
      fileName = req.user.profile;
    }

    if (values.password) {
      values.isOAuth = false;
    }

    // update user
    await db
      .update(userTable)
      .set({
        ...values,
        profile: fileName,
      })
      .where(eq(userTable.id, req.user.id));

    return success(res, {
      message: "Informations updated successfully",
    });
  } catch (err) {
    next(err);
  }
};
