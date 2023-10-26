ALTER TABLE "category" ALTER COLUMN "created_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "email_verification" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-26 07:17:06.000';--> statement-breakpoint
ALTER TABLE "forgot_password" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-29 06:47:06.000';--> statement-breakpoint
ALTER TABLE "resource" ALTER COLUMN "created_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "resource" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "sub_category" ALTER COLUMN "created_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "sub_category" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "temp_resource" ALTER COLUMN "created_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "temp_resource" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "vote" ALTER COLUMN "created_at" SET DEFAULT '2023-10-26 06:47:06.000';--> statement-breakpoint
ALTER TABLE "email_verification" ADD COLUMN "emailSent" boolean DEFAULT true;