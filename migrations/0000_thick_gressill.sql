CREATE TABLE IF NOT EXISTS "resources" (
	"id" serial NOT NULL,
	"url" text,
	"title" varchar(256),
	"description" text,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial NOT NULL,
	"name" text,
	"email" text,
	"dname" text,
	"password" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
