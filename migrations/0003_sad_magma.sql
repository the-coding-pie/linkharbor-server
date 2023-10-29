ALTER TABLE "email_verification" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-29 19:47:31.000';--> statement-breakpoint
ALTER TABLE "forgot_password" ALTER COLUMN "expires_at" SET DEFAULT '2023-11-01 19:17:31.000';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username_updated" boolean DEFAULT false;