CREATE TABLE "system_notifications" (
	"notification_id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"link" text
);
--> statement-breakpoint
ALTER TABLE "system_notifications" ADD CONSTRAINT "system_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;