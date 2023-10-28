CREATE TABLE IF NOT EXISTS "category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"image" varchar DEFAULT 'category.png' NOT NULL,
	"created_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL,
	"updated_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(94) NOT NULL,
	"emailSent" boolean DEFAULT true,
	"expires_at" timestamp DEFAULT '2023-10-28 20:23:21.000',
	CONSTRAINT "email_verification_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forgot_password" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(124) NOT NULL,
	"expires_at" timestamp DEFAULT '2023-10-31 19:53:21.000',
	CONSTRAINT "forgot_password_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refresh_token" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	CONSTRAINT "refresh_token_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resource" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" varchar(40) NOT NULL,
	"description" varchar(60) NOT NULL,
	"user_id" integer NOT NULL,
	"subcategory_id" integer NOT NULL,
	"created_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL,
	"updated_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sub_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"image" varchar DEFAULT 'sub_category.png' NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL,
	"updated_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "temp_resource" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" varchar(40) NOT NULL,
	"description" varchar(60) NOT NULL,
	"user_id" integer NOT NULL,
	"category" text NOT NULL,
	"subcategory" text NOT NULL,
	"created_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL,
	"updated_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL,
	"username" varchar(20) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" text,
	"profile" text DEFAULT 'default.jpg' NOT NULL,
	"is_oauth" boolean DEFAULT false NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL,
	"updated_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vote" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"resource_id" integer NOT NULL,
	"created_at" timestamp DEFAULT '2023-10-28 19:53:21.000' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_verification" ADD CONSTRAINT "email_verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forgot_password" ADD CONSTRAINT "forgot_password_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resource" ADD CONSTRAINT "resource_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resource" ADD CONSTRAINT "resource_subcategory_id_sub_category_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "sub_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_category" ADD CONSTRAINT "sub_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "temp_resource" ADD CONSTRAINT "temp_resource_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
