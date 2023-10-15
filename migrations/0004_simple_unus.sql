ALTER TABLE "email_verification" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-15 06:32:23.000';--> statement-breakpoint
ALTER TABLE "forgot_password" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-18 06:02:23.000';--> statement-breakpoint
ALTER TABLE "resource" ALTER COLUMN "created_at" SET DEFAULT '2023-10-15 06:02:23.000';--> statement-breakpoint
ALTER TABLE "resource" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-15 06:02:23.000';--> statement-breakpoint
ALTER TABLE "temp_resource" ALTER COLUMN "created_at" SET DEFAULT '2023-10-15 06:02:23.000';--> statement-breakpoint
ALTER TABLE "temp_resource" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-15 06:02:23.000';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '2023-10-15 06:02:23.000';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-15 06:02:23.000';--> statement-breakpoint
ALTER TABLE "vote" ALTER COLUMN "created_at" SET DEFAULT '2023-10-15 06:02:23.000';--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "created_at" timestamp DEFAULT '2023-10-15 06:02:23.000' NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "updated_at" timestamp DEFAULT '2023-10-15 06:02:23.000' NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_category" ADD COLUMN "created_at" timestamp DEFAULT '2023-10-15 06:02:23.000' NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_category" ADD COLUMN "updated_at" timestamp DEFAULT '2023-10-15 06:02:23.000' NOT NULL;--> statement-breakpoint
ALTER TABLE "vote" DROP COLUMN IF EXISTS "updated_at";