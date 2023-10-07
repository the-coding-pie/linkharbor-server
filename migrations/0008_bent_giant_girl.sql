ALTER TABLE "email_verification" DROP CONSTRAINT "email_verification_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "email_verification" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-01 10:01:54.652';--> statement-breakpoint
ALTER TABLE "forgot_password" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-04 09:31:54.658';