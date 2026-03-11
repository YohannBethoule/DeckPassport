CREATE TABLE "decks_to_background_prints" (
	"deck_id" integer NOT NULL,
	"background_id" integer NOT NULL,
	"background_print_uri" text NOT NULL,
	CONSTRAINT "decks_to_background_prints_deck_id_background_id_pk" PRIMARY KEY("deck_id","background_id")
);
--> statement-breakpoint
ALTER TABLE "decks_to_background_prints" ADD CONSTRAINT "decks_to_background_prints_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decks_to_background_prints" ADD CONSTRAINT "decks_to_background_prints_background_id_backgrounds_id_fk" FOREIGN KEY ("background_id") REFERENCES "public"."backgrounds"("id") ON DELETE no action ON UPDATE no action;