ALTER TABLE "category" ALTER COLUMN "created_at" SET DEFAULT '2023-10-29 18:56:20.000';--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-29 18:56:20.000';--> statement-breakpoint
ALTER TABLE "email_verification" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-29 19:26:20.000';--> statement-breakpoint
ALTER TABLE "forgot_password" ALTER COLUMN "expires_at" SET DEFAULT '2023-11-01 18:56:20.000';--> statement-breakpoint
ALTER TABLE "resource" ALTER COLUMN "created_at" SET DEFAULT '2023-10-29 18:56:20.000';--> statement-breakpoint
ALTER TABLE "resource" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-29 18:56:20.000';--> statement-breakpoint
ALTER TABLE "sub_category" ALTER COLUMN "created_at" SET DEFAULT '2023-10-29 18:56:20.000';--> statement-breakpoint
ALTER TABLE "sub_category" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-29 18:56:20.000';--> statement-breakpoint
ALTER TABLE "temp_resource" ALTER COLUMN "created_at" SET DEFAULT '2023-10-29 18:56:20.000';--> statement-breakpoint
ALTER TABLE "temp_resource" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-29 18:56:20.000';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "username" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '2023-10-29 18:56:20.000';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-29 18:56:20.000';--> statement-breakpoint
ALTER TABLE "vote" ALTER COLUMN "created_at" SET DEFAULT '2023-10-29 18:56:20.000';