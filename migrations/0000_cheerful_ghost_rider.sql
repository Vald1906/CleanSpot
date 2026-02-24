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
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `spots_id` PRIMARY KEY(`id`)
);

