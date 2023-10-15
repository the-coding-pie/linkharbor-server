CREATE TABLE IF NOT EXISTS "vote" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"resource_id" integer NOT NULL,
	"created_at" timestamp DEFAULT '2023-10-14 18:26:35.000' NOT NULL,
	"updated_at" timestamp DEFAULT '2023-10-14 18:26:35.000' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_verification" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-14 18:56:35.000';--> statement-breakpoint
ALTER TABLE "forgot_password" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-17 18:26:35.000';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '2023-10-14 18:26:35.000';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT '2023-10-14 18:26:35.000';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vote" ADD CONSTRAINT "vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vote" ADD CONSTRAINT "vote_resource_id_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "resource"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
