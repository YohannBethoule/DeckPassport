CREATE TABLE "playgroup_notifications" (
	"notification_id" integer PRIMARY KEY NOT NULL,
	"playgroup_id" integer,
	"actor_id" text,
	"invitation_id" integer
);
--> statement-breakpoint
ALTER TABLE "playgroup_notifications" ADD CONSTRAINT "playgroup_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playgroup_notifications" ADD CONSTRAINT "playgroup_notifications_playgroup_id_playgroups_id_fk" FOREIGN KEY ("playgroup_id") REFERENCES "public"."playgroups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playgroup_notifications" ADD CONSTRAINT "playgroup_notifications_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playgroup_notifications" ADD CONSTRAINT "playgroup_notifications_invitation_id_playgroup_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."playgroup_invitations"("id") ON DELETE set null ON UPDATE no action;