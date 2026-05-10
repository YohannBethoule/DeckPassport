CREATE TABLE "playgroup_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"playgroup_id" integer NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playgroup_members" (
	"playgroup_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "playgroup_members_playgroup_id_user_id_pk" PRIMARY KEY("playgroup_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "playgroups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "playgroup_invitations" ADD CONSTRAINT "playgroup_invitations_playgroup_id_playgroups_id_fk" FOREIGN KEY ("playgroup_id") REFERENCES "public"."playgroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playgroup_invitations" ADD CONSTRAINT "playgroup_invitations_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playgroup_invitations" ADD CONSTRAINT "playgroup_invitations_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playgroup_members" ADD CONSTRAINT "playgroup_members_playgroup_id_playgroups_id_fk" FOREIGN KEY ("playgroup_id") REFERENCES "public"."playgroups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playgroup_members" ADD CONSTRAINT "playgroup_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playgroups" ADD CONSTRAINT "playgroups_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "playgroup_invitations_playgroup_receiver_idx" ON "playgroup_invitations" USING btree ("playgroup_id","receiver_id");--> statement-breakpoint
CREATE INDEX "playgroup_invitations_receiver_id_idx" ON "playgroup_invitations" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "playgroup_members_user_id_idx" ON "playgroup_members" USING btree ("user_id");