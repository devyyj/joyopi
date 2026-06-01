CREATE TABLE "shingeki_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
