CREATE TABLE "backgrounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brackets" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commanders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"colors" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decks" (
	"id" serial PRIMARY KEY NOT NULL,
	"commander_id" integer NOT NULL,
	"partner_commander_id" integer,
	"background_id" integer,
	"title" text NOT NULL,
	"bracket_id" integer NOT NULL,
	"description" text NOT NULL,
	"win_condition" text NOT NULL,
	"core_cards" text,
	"deck_list_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_commander_id_commanders_id_fk" FOREIGN KEY ("commander_id") REFERENCES "public"."commanders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_partner_commander_id_commanders_id_fk" FOREIGN KEY ("partner_commander_id") REFERENCES "public"."commanders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_background_id_backgrounds_id_fk" FOREIGN KEY ("background_id") REFERENCES "public"."backgrounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_bracket_id_brackets_id_fk" FOREIGN KEY ("bracket_id") REFERENCES "public"."brackets"("id") ON DELETE no action ON UPDATE no action;