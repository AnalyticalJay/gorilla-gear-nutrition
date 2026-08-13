CREATE TABLE `order_tracking_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`eventCode` varchar(64) NOT NULL,
	`statusLabel` varchar(128) NOT NULL,
	`description` text,
	`location` varchar(255),
	`externalEventId` varchar(191),
	`source` varchar(32) NOT NULL DEFAULT 'courier_api',
	`occurredAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_tracking_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `order_tracking_events` ADD CONSTRAINT `order_tracking_events_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;