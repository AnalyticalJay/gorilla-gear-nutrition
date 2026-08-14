ALTER TABLE `users` ADD `resetTokenHash` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `resetTokenExpiresAt` timestamp;