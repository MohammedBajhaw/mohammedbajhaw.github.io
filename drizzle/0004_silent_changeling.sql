CREATE TABLE `section_icons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionKey` varchar(60) NOT NULL,
	`label` varchar(160) NOT NULL,
	`url` varchar(1200) NOT NULL,
	`storageKey` varchar(1200),
	`alt` varchar(320),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `section_icons_id` PRIMARY KEY(`id`)
);
