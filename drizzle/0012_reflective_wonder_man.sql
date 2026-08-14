ALTER TABLE `orders` ADD `packedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `packedBy` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `courierBookedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `courierBookedBy` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `waybillNumber` varchar(128);