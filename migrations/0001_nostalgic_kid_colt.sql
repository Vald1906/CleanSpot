CREATE TABLE `contact` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`email` varchar(180) NOT NULL,
	`nom` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `contact_id` PRIMARY KEY(`id`)
);
