CREATE TABLE `education` (
	`id` int AUTO_INCREMENT NOT NULL,
	`institution` varchar(240) NOT NULL,
	`degree` varchar(240) NOT NULL,
	`field` varchar(240),
	`location` varchar(220),
	`startYear` varchar(12),
	`endYear` varchar(12),
	`description` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `education_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(240) NOT NULL,
	`organization` varchar(240) NOT NULL,
	`location` varchar(220),
	`startDate` varchar(40),
	`endDate` varchar(40),
	`isCurrent` boolean NOT NULL DEFAULT false,
	`summary` text,
	`highlights` json NOT NULL DEFAULT ('[]'),
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`professionalTitle` varchar(220) NOT NULL,
	`location` varchar(220),
	`email` varchar(320),
	`linkedinUrl` varchar(500),
	`bio` text,
	`photoUrl` varchar(1000),
	`photoKey` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`url` varchar(1200) NOT NULL,
	`storageKey` varchar(1200),
	`alt` varchar(320),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(240) NOT NULL,
	`title` varchar(320) NOT NULL,
	`subtitle` varchar(400),
	`summary` text,
	`description` text,
	`status` varchar(120),
	`startDate` varchar(40),
	`endDate` varchar(40),
	`tags` json NOT NULL DEFAULT ('[]'),
	`tools` json NOT NULL DEFAULT ('[]'),
	`outcomes` json NOT NULL DEFAULT ('[]'),
	`featured` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `publications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(700) NOT NULL,
	`venue` varchar(240),
	`publicationDate` varchar(40),
	`status` varchar(120),
	`authors` text,
	`summary` text,
	`url` varchar(1000),
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `publications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(160) NOT NULL,
	`category` varchar(160) NOT NULL,
	`icon` varchar(100),
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `project_media` ADD CONSTRAINT `project_media_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;