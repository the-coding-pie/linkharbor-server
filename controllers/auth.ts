import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { userTable } from "../db/schemas/user";
import validator from "validator";
import { and, eq, gt, or } from "drizzle-orm";
import { emailVerificationTable } from "../db/schemas/emailVerification";
import { forgotPasswordTable } from "../db/schemas/forgotPassword";
import genUsername from "../utils/genUsername";
import argon2 from "argon2";
import createRandomToken from "../utils/createRandomToken";
import { APP_NAME, CLIENT_URL, EMAIL_TOKEN_LENGTH } from "../config";
import nodemailer from "nodemailer";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { refreshTokenTable } from "../db/schemas/refreshToken";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { failure, success } from "../utils/responses";
import getCurrentUTCDate from "../utils/getCurrentUTCDate";
import { PayloadObj } from "../types/interfaces";

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken: token } = req.body;

    // if no refreshToken, or if it is invalid one
    if (!token) {
      return failure(res, {
        status: 401,
        message: "refreshToken is required",
      });
    }

    // check validity of refresh token
    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!,
      async function (err: any, payload: any) {
        if (err) {
          return failure(res, {
            status: 401,
            message: "Invalid refresh token, please login to continue",
          });
        }

        // check in db
        const isValidRefreshToken = await db
          .select()
          .from(refreshTokenTable)
          .limit(1)
          .where(
            and(
              eq(refreshTokenTable.userId, payload.id),
              eq(refreshTokenTable.token, token)
            )
          );

        if (isValidRefreshToken.length === 0) {
          return failure(res, {
            status: 401,
            message: "Invalid refresh token",
          });
        }

        // valid refresh token, so generate a new accessToken and send it
        const newAccessToken = generateAccessToken({
          id: payload.id,
        });

        return success(res, {
          data: {
            accessToken: newAccessToken,
          },
          message: "",
        });
      }
    );
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { name, email, password } = req.body;

    // validation
    // name
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

    // email
    if (!email) {
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

    // password
    if (!password) {
      return failure(res, {
        status: 400,
        message: "Password is required",
      });
    } else if (password.length < 8) {
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
    // else if (!/[A-Z]/.test(password)) {
    //   return failure(res, {
    //     status: 400,
    //     message: "Password must contain at least one uppercase letter",
    //   });
    // } else if (!/[a-z]/.test(password)) {
    //   return failure(res, {
    //     status: 400,
    //     message: "Password must contain at least one lowercase letter",
    //   });
    // } else if (!/[0-9]/.test(password)) {
    //   return failure(res, {
    //     status: 400,
    //     message: "Password must contain at least one digit",
    //   });
    // } else if (!/[!@#$%^&*]/.test(password)) {
    //   return failure(res, {
    //     status: 400,
    //     message: "Password must contain at least special character",
    //   });
    // }

    // trim all values
    name = name.trim();
    email = email.trim();
    password = password.trim();

    // check if user with same email already exists
    const userExists = await db
      .select()
      .from(userTable)
      .limit(1)
      .where(eq(userTable.email, email));

    if (userExists.length > 0) {
      const emailVer = await db
        .select()
        .from(emailVerificationTable)
        .limit(1)
        .where(
          and(
            eq(emailVerificationTable.userId, userExists[0].id),
            gt(emailVerificationTable.expiresAt, getCurrentUTCDate())
          )
        );

      // if email verified or link not expired
      if (userExists[0].emailVerified === true || emailVer.length > 0) {
        return failure(res, {
          status: 409,
          message: "This email is already taken. Please log in.",
        });
      }

      // if email not verified or link has expired
      // remove the user, the emailVer record, forgotPassword, and refreshToken
      // then create a new user
      await db
        .delete(forgotPasswordTable)
        .where(eq(forgotPasswordTable.userId, userExists[0].id));
      await db
        .delete(emailVerificationTable)
        .where(eq(emailVerificationTable.userId, userExists[0].id));
      await db
        .delete(refreshTokenTable)
        .where(eq(refreshTokenTable.userId, userExists[0].id));
      await db.delete(userTable).where(eq(userTable.id, userExists[0].id));
    }

    // create new user
    const username = await genUsername();
    const hashedPassword = await argon2.hash(password);

    const newUser = await db
      .insert(userTable)
      .values({
        name,
        email,
        password: hashedPassword,
        username,
      })
      .returning();

    // token generation for email verification
    // store it in database
    const newRandomToken = await createRandomToken(EMAIL_TOKEN_LENGTH);

    const newEmailVerification = await db
      .insert(emailVerificationTable)
      .values({
        userId: newUser[0].id,
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
      to: newUser[0].email,
      subject: "Verify Email",
      html: `
      <h1>Verify your email address</h1>
      <p style="font-size: 16px; font-weight: 600;">To start using ${APP_NAME}, make sure you are logged in first, then just click the verify link below:</p>
      <p style="font-size: 14px; font-weight: 600; color: red;">And only click the link if you are the person who initiated this process.</p>
      <br />
      <a style="font-size: 14px;" href=${CLIENT_URL}/email/verify/${newEmailVerification[0].token}?wuid=${newEmailVerification[0].userId} target="_blank">Click here to verify your email</a>
      `,
    };

    // fail silently if error happens
    transporter.sendMail(mailOptions, function (err, info) {
      transporter.close();
    });

    // generate accessToken & refreshToken
    const newAccessToken = generateAccessToken({
      id: newUser[0].id,
    });
    const newRefreshToken = await generateRefreshToken({
      id: newUser[0].id,
    });

    return success(res, {
      status: 201,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      message:
        "Your account has been created successfully! Please verify your email.",
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // email can be email or username
    const { email, password } = req.body;

    if (!email) {
      return failure(res, {
        status: 400,
        message: "Email/Username is required",
      });
    }

    if (!password) {
      return failure(res, {
        status: 400,
        message: "Password is required",
      });
    }

    // check if user exists or not
    const userExists = await db
      .select()
      .from(userTable)
      .limit(1)
      .where(or(eq(userTable.email, email), eq(userTable.username, email)));

    //  if sso
    if (userExists.length > 0 && userExists[0].isOAuth) {
      return failure(res, {
        status: 401,
        message: "This account can only be logged into with Google",
      });
    }

    // if no user / passwords doesn't match
    if (
      userExists.length === 0 ||
      (userExists.length > 0 &&
        !(await argon2.verify(userExists[0].password!, password)))
    ) {
      return failure(res, {
        status: 401,
        message: "Invalid credentials",
      });
    }

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
      message: "",
    });
  } catch (err) {
    next(err);
  }
};

// google oauth
export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let payload: PayloadObj | undefined = undefined;

    const { code } = req.body;

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // validate tokenId
    try {
      const { tokens } = await client.getToken(code);

      payload = jwt.decode(tokens.id_token!) as PayloadObj;
    } catch (err) {
      return failure(res, {
        status: 400,
        message: "Google OAuth failed",
      });
    }

    // register or login
    // send tokens

    // if user doesn't exists with this email, create the user
    const userExists = await db
      .select()
      .from(userTable)
      .limit(1)
      .where(eq(userTable.email, payload?.email!));

    let user;
    let newAccessToken;
    let newRefreshToken;

    if (userExists.length === 0) {
      // create valid username
      const username = await genUsername();

      const newUser = await db
        .insert(userTable)
        .values({
          username,
          email: payload.email!.trim(),
          profile: payload.picture!,
          emailVerified: true,
          isOAuth: true,
          name: payload.name! || "",
        })
        .returning();

      newAccessToken = generateAccessToken({
        id: newUser[0].id,
      });

      newRefreshToken = await generateRefreshToken({
        id: newUser[0].id,
      });

      user = newUser;
    } else {
      // emailVerified false (manual registration)
      if (userExists[0].emailVerified === false) {
        // delete the old user
        // delete record in the emailVerification collection
        // create new user with isOAuth=true & emailVerified=true
        await db
          .delete(refreshTokenTable)
          .where(eq(refreshTokenTable.userId, userExists[0].id));
        await db
          .delete(forgotPasswordTable)
          .where(eq(forgotPasswordTable.userId, userExists[0].id));
        await db.delete(userTable).where(eq(userTable.id, userExists[0].id));
        await db
          .delete(emailVerificationTable)
          .where(eq(emailVerificationTable.userId, userExists[0].id));

        // create valid username
        const username = await genUsername();

        const newUser = await db
          .insert(userTable)
          .values({
            username: username,
            email: payload.email!.trim(),
            profile: payload.picture!,
            emailVerified: true,
            isOAuth: true,
            name: payload.name! || "",
          })
          .returning();

        // generate tokens
        newAccessToken = generateAccessToken({
          id: newUser[0].id,
        });
        newRefreshToken = await generateRefreshToken({
          id: newUser[0].id,
        });

        user = newUser;
      } else {
        // user already verified email, so allow Google OAuth
        // generate tokens
        newAccessToken = generateAccessToken({
          id: userExists[0].id,
        });
        newRefreshToken = await generateRefreshToken({
          id: userExists[0].id,
        });

        user = userExists;
      }
    }

    return success(res, {
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      message: "Google OAuth successfull",
    });
  } catch (err) {
    next(err);
  }
};
