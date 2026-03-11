CREATE TABLE "decks_to_commander_prints" (
	"deck_id" integer NOT NULL,
	"commander_id" integer NOT NULL,
	"commander_print_uri" text NOT NULL,
	CONSTRAINT "decks_to_commander_prints_deck_id_commander_id_pk" PRIMARY KEY("deck_id","commander_id")
);
--> statement-breakpoint
ALTER TABLE "decks_to_commander_prints" ADD CONSTRAINT "decks_to_commander_prints_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decks_to_commander_prints" ADD CONSTRAINT "decks_to_commander_prints_commander_id_commanders_id_fk" FOREIGN KEY ("commander_id") REFERENCES "public"."commanders"("id") ON DELETE no action ON UPDATE no action;