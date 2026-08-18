CREATE TABLE `ikhokha_payment_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`externalReference` varchar(255) NOT NULL,
	`paylinkId` varchar(255),
	`amountCents` int NOT NULL,
	`status` enum('link_created','pending','paid','failed','link_failed') NOT NULL DEFAULT 'pending',
	`gatewayStatus` varchar(128),
	`failureReason` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `ikhokha_payment_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ikhokha_payment_attempts` ADD CONSTRAINT `ikhokha_payment_attempts_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;