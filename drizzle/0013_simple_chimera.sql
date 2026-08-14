CREATE TABLE `coaching_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`firstName` varchar(128) NOT NULL,
	`lastName` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`address` text NOT NULL,
	`primaryGoal` varchar(255) NOT NULL,
	`experienceLevel` enum('beginner','intermediate','advanced') NOT NULL,
	`availability` varchar(255) NOT NULL,
	`status` enum('new','reviewing','consultation_scheduled','accepted','closed') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coaching_enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `coaching_enquiries` ADD CONSTRAINT `coaching_enquiries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_enquiries` ADD CONSTRAINT `coaching_enquiries_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;