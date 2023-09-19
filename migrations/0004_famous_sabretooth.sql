CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL,
	"username" varchar(20) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "user";--> statement-breakpoint
ALTER TABLE "resources" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "title" SET DATA TYPE varchar(40);--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "description" SET DATA TYPE varchar(60);