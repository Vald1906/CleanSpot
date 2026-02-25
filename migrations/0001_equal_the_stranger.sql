CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spot_id` int NOT NULL,
	`author` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spot_id` int NOT NULL,
	`user_name` varchar(100) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `participations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spot_id` int NOT NULL,
	`user_name` varchar(100) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `participations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `spots` ADD `materials` json;