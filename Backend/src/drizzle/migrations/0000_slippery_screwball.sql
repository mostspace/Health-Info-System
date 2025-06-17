CREATE TYPE "public"."user_role" AS ENUM('client', 'doctor', 'admin');--> statement-breakpoint
CREATE TABLE "client" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"gender" varchar(10) NOT NULL,
	"phone" varchar(20),
	"address" text
);
--> statement-breakpoint
CREATE TABLE "doctor" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"license_number" varchar(50),
	"specialization" varchar(100),
	CONSTRAINT "doctor_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"program_id" varchar(50) NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0,
	"notes" text,
	"last_accessed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "health_program" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"image_url" varchar(255),
	"duration" varchar(50),
	"difficulty" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "health_program_program_id_unique" UNIQUE("program_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'client' NOT NULL,
	"image_url" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_token" varchar(255),
	"verification_token_expires_at" timestamp,
	"password_reset_token" varchar(255),
	"password_reset_expires_at" timestamp,
	CONSTRAINT "user_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_program_id_health_program_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."health_program"("program_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_program_idx" ON "enrollment" USING btree ("user_id","program_id");--> statement-breakpoint
CREATE INDEX "enrollment_status_idx" ON "enrollment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "program_name_idx" ON "health_program" USING btree ("name");--> statement-breakpoint
CREATE INDEX "email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "role_idx" ON "user" USING btree ("role");