ALTER TABLE `experiences` MODIFY COLUMN `highlights` json NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `tags` json NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `tools` json NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `outcomes` json NOT NULL;