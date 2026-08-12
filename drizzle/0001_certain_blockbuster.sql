CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `delivery_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationName` varchar(128) NOT NULL,
	`deliveryType` enum('free','flat_rate') NOT NULL,
	`fee` decimal(10,2) NOT NULL DEFAULT '0',
	CONSTRAINT `delivery_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`priceAtPurchase` decimal(10,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT '0',
	`deliveryType` enum('free','flat_rate') NOT NULL DEFAULT 'flat_rate',
	`status` enum('pending','paid','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
	`payfastReference` varchar(255),
	`trackingNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`imageUrl` varchar(1024) NOT NULL,
	`imageKey` varchar(512),
	`isPrimary` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`dosageInfo` text,
	`categoryId` int,
	`price` decimal(10,2) NOT NULL,
	`stockQuantity` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `shipping_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`addressLine1` varchar(255) NOT NULL,
	`addressLine2` varchar(255),
	`city` varchar(128) NOT NULL,
	`postalCode` varchar(16) NOT NULL,
	`country` varchar(64) NOT NULL DEFAULT 'South Africa',
	CONSTRAINT `shipping_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`submittedData` json,
	`adminNotes` text,
	`approvedBy` int,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(64) DEFAULT 'email';--> statement-breakpoint
ALTER TABLE `users` ADD `fullName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isOver18` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipping_details` ADD CONSTRAINT `shipping_details_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_approvals` ADD CONSTRAINT `user_approvals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `name`;