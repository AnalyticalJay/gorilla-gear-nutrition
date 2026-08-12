ALTER TABLE `orders` ADD `proofStatus` enum('not_submitted','pending','approved','rejected') DEFAULT 'not_submitted' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `proofReviewNote` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `proofReviewedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `proofReviewedBy` int;