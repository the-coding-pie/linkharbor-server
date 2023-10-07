ALTER TABLE "email_verification" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-07 15:09:37.604';--> statement-breakpoint
ALTER TABLE "forgot_password" ALTER COLUMN "expires_at" SET DEFAULT '2023-10-10 14:39:37.606';--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "img" text NOT NULL;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "is_draft" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "subcategory_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resource" ADD CONSTRAINT "resource_subcategory_id_sub_category_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "sub_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
