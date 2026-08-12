ALTER TABLE `orders` ADD `trackingNumber` varchar(128);--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingCarrier` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `orders` ADD `dispatchedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveredAt` timestamp;