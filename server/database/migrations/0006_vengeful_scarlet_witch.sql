UPDATE "decks" SET "core_cards" = NULL WHERE "core_cards" IS NOT NULL;
ALTER TABLE "decks" ALTER COLUMN "core_cards" SET DATA TYPE jsonb USING "core_cards"::jsonb;
