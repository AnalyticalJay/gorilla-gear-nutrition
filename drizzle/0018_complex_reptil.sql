ALTER TABLE `cart_items` ADD `selectedSize` varchar(8);--> statement-breakpoint
ALTER TABLE `order_items` ADD `selectedSizeSnapshot` varchar(8);--> statement-breakpoint
ALTER TABLE `products` ADD `availableSizes` json;