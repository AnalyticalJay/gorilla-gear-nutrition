CREATE TABLE `order_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `order_comments` ADD CONSTRAINT `order_comments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_comments` ADD CONSTRAINT `order_comments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;