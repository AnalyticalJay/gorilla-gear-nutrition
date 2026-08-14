CREATE TABLE `password_reset_audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`emailHash` varchar(64) NOT NULL,
	`maskedEmail` varchar(320) NOT NULL,
	`eventType` enum('request_received','token_issued','email_sent','email_failed','token_consumed','token_invalid','token_expired','account_not_eligible') NOT NULL,
	`tokenHashPrefix` varchar(16),
	`detail` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `password_reset_audit_events` ADD CONSTRAINT `password_reset_audit_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;