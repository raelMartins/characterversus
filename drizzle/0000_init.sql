CREATE TABLE "characters" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"franchise" text NOT NULL,
	"is_real_person" boolean DEFAULT false NOT NULL,
	"search_text" text NOT NULL,
	"profile" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispute_votes" (
	"dispute_id" text NOT NULL,
	"voter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" text PRIMARY KEY NOT NULL,
	"matchup_id" text NOT NULL,
	"text" text NOT NULL,
	"author_id" text NOT NULL,
	"votes" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"reply" text,
	"reviewed_in_version" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matchup_votes" (
	"matchup_id" text NOT NULL,
	"verdict_version" integer NOT NULL,
	"voter_id" text NOT NULL,
	"agree" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matchups" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"a_id" text NOT NULL,
	"a_version" text NOT NULL,
	"b_id" text NOT NULL,
	"b_version" text NOT NULL,
	"arena" text NOT NULL,
	"mode" text NOT NULL,
	"prep" text NOT NULL,
	"current_version" integer DEFAULT 1 NOT NULL,
	"review_started_at" timestamp with time zone,
	"views" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verdicts" (
	"id" text PRIMARY KEY NOT NULL,
	"matchup_id" text NOT NULL,
	"version" integer NOT NULL,
	"data" jsonb NOT NULL,
	"change_note" text NOT NULL,
	"winner_changed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dispute_votes" ADD CONSTRAINT "dispute_votes_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_matchup_id_matchups_id_fk" FOREIGN KEY ("matchup_id") REFERENCES "public"."matchups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matchup_votes" ADD CONSTRAINT "matchup_votes_matchup_id_matchups_id_fk" FOREIGN KEY ("matchup_id") REFERENCES "public"."matchups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matchups" ADD CONSTRAINT "matchups_a_id_characters_id_fk" FOREIGN KEY ("a_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matchups" ADD CONSTRAINT "matchups_b_id_characters_id_fk" FOREIGN KEY ("b_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verdicts" ADD CONSTRAINT "verdicts_matchup_id_matchups_id_fk" FOREIGN KEY ("matchup_id") REFERENCES "public"."matchups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "characters_slug_idx" ON "characters" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "dispute_votes_unique_idx" ON "dispute_votes" USING btree ("dispute_id","voter_id");--> statement-breakpoint
CREATE INDEX "disputes_matchup_idx" ON "disputes" USING btree ("matchup_id");--> statement-breakpoint
CREATE UNIQUE INDEX "matchup_votes_unique_idx" ON "matchup_votes" USING btree ("matchup_id","verdict_version","voter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "matchups_key_idx" ON "matchups" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "verdicts_matchup_version_idx" ON "verdicts" USING btree ("matchup_id","version");