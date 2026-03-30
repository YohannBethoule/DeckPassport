CREATE INDEX "decks_created_at_idx" ON "decks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "decks_user_id_idx" ON "decks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "decks_commander_id_idx" ON "decks" USING btree ("commander_id");--> statement-breakpoint
CREATE INDEX "decks_partner_commander_id_idx" ON "decks" USING btree ("partner_commander_id");--> statement-breakpoint
CREATE INDEX "decks_bracket_id_idx" ON "decks" USING btree ("bracket_id");--> statement-breakpoint
CREATE INDEX "decks_to_archetypes_deck_id_idx" ON "decks_to_archetypes" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "decks_to_archetypes_archetype_id_idx" ON "decks_to_archetypes" USING btree ("archetype_id");