CREATE TABLE "echo_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"role" text NOT NULL,
	"event_type" text NOT NULL,
	"message" text NOT NULL,
	"payload" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
