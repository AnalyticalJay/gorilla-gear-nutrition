ALTER TABLE `orders` MODIFY COLUMN `paymentMethod` enum('eft','payfast','ikhokha');--> statement-breakpoint
ALTER TABLE `orders` ADD `ikhokhaReference` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `ikhokhaPaylinkId` varchar(255);