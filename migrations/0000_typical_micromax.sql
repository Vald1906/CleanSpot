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
CREATE TABLE `spots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('Event','Signalement','Point de Tri') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`author` varchar(100) NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`address` varchar(255) NOT NULL,
	`image` longtext,
	`date` date,
	`hours` varchar(100),
	`urgency` varchar(50),
	`materials` json,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `spots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(180) NOT NULL,
	`roles` json NOT NULL,
	`password` varchar(255) NOT NULL,
	`nom` varchar(255) NOT NULL,
	`statut_pro` varchar(255) NOT NULL,
	`prenom` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
