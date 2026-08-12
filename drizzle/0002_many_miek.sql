ALTER TABLE `orders` MODIFY COLUMN `status` enum('pending','quote_pending','quote_approved','quote_rejected','awaiting_payment','paid','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'quote_pending';--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `paymentStatus` enum('pending','awaiting_eft','paid','failed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentMethod` enum('eft','payfast');--> statement-breakpoint
ALTER TABLE `orders` ADD `quoteNotes` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `rejectionReason` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `reviewedBy` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `reviewedAt` timestamp;