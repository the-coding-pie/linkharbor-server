import { NextFunction, Response } from "express";
import { APP_NAME, CLIENT_URL, EMAIL_TOKEN_LENGTH } from "../config";
import { failure, success } from "../utils/responses";
import { db } from "../db";
import { userTable } from "../db/schemas/user";
import { and, eq, gt } from "drizzle-orm";
import { emailVerificationTable } from "../db/schemas/emailVerification";
import createRandomToken from "../utils/createRandomToken";
import nodemailer from "nodemailer";
import getCurrentUTCDate from "../utils/getCurrentUTCDate";
import { add } from "date-fns";

// email verify
export const emailVerify = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { wuid }: any = req.query;
    const { token } = req.params;

    if (!wuid || !token || token.length !== EMAIL_TOKEN_LENGTH) {
      return failure(res, {
        status: 400,
        message:
          "Sorry, your email validation link has expired or is malformed",
      });
    }

    // check if user is valid
    const userExists = await db
      .select()
      .from(userTable)
      .limit(1)
      .where(eq(userTable.id, parseInt(wuid)));

    if (userExists.length === 0) {
      return failure(res, {
        status: 400,
        message:
          "Sorry, your email validation link has expired or is malformed",
      });
    }

    // when the req comes, make sure that the user.email (wuid user) === the requesting user's email
    if (userExists[0].email !== req.user?.email) {
      return failure(res, {
        status: 400,
        message:
          "Verification failed. The verification email you clicked on was for a different account.",
      });
    }

    // if wuid user's email is already verified
    if (userExists[0].emailVerified === true) {
      return success(res, {
        message: "Email verified!",
      });
    }

    // check for a record in emailVerification collection
    const emailVer = await db
      .select()
      .from(emailVerificationTable)
      .limit(1)
      .where(
        and(
          eq(emailVerificationTable.userId, userExists[0].id),
          eq(emailVerificationTable.token, token),
          gt(emailVerificationTable.expiresAt, getCurrentUTCDate())
        )
      );

    if (emailVer.length === 0) {
      return failure(res, {
        status: 400,
        message:
          "Sorry, your email validation link has expired or is malformed",
      });
    }

    // got valid token -> update user info and delete the record, then redirect user to client
    await db
      .update(userTable)
      .set({
        emailVerified: true,
        updatedAt: getCurrentUTCDate(),
      })
      .where(eq(userTable.id, userExists[0].id));

    await db
      .delete(emailVerificationTable)
      .where(eq(emailVerificationTable.id, emailVer[0].id));

    return success(res, {
      message: "Email verified!",
    });
  } catch (err) {
    next(err);
  }
};

// resend verify email
export const resendVerifyEmail = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    // check if user's email already verified
    if (user.emailVerified) {
      return success(res, {
        message: "Email already verified!",
      });
    }

    // to prevent email attack
    // check if prev email verification is still valid
    const emailVerification = await db
      .select()
      .from(emailVerificationTable)
      .where(
        and(
          eq(emailVerificationTable.userId, user.id),
          gt(emailVerificationTable.expiresAt, getCurrentUTCDate())
        )
      );

    if (emailVerification.length > 0) {
      // still the old email verification is valid
      return success(res, {
        message: "Email resent!",
      });
    }

    // delete old record in emailVerification collection if any exists
    await db
      .delete(emailVerificationTable)
      .where(eq(emailVerificationTable.userId, user.id));

    // create a new token and store it
    const newRandomToken = await createRandomToken(EMAIL_TOKEN_LENGTH);

    const newEmailVerification = await db
      .insert(emailVerificationTable)
      .values({
        userId: user.id,
        token: newRandomToken,
        expiresAt: add(getCurrentUTCDate(), {
          minutes: 30,
        }),
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
      to: user.email,
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

    return success(res, {
      message: "Email resent!",
    });
  } catch (err) {
    next(err);
  }
};
