ALTER TABLE `orders` MODIFY COLUMN `paymentStatus` enum('pending','awaiting_eft','proof_uploaded','paid','failed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` ADD `proofOfPaymentUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `orders` ADD `proofOfPaymentKey` varchar(512);--> statement-breakpoint
ALTER TABLE `orders` ADD `proofUploadedAt` timestamp;