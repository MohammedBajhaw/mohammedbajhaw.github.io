CREATE TABLE `service_areas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(240) NOT NULL,
	`description` text,
	`accent` varchar(40) NOT NULL DEFAULT 'teal',
	`icon` varchar(80) NOT NULL DEFAULT 'robotics',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_areas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`areaId` int NOT NULL,
	`title` varchar(320) NOT NULL,
	`summary` text,
	`deliverables` json NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_areaId_service_areas_id_fk` FOREIGN KEY (`areaId`) REFERENCES `service_areas`(`id`) ON DELETE cascade ON UPDATE no action;