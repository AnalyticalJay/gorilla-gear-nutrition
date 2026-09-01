CREATE TABLE `catalogue_brand_aliases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandId` int NOT NULL,
	`alias` varchar(128) NOT NULL,
	`normalizedAlias` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalogue_brand_aliases_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalogue_brand_aliases_normalizedAlias_unique` UNIQUE(`normalizedAlias`)
);
--> statement-breakpoint
CREATE TABLE `catalogue_brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalogue_brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalogue_brands_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `catalogue_product_taxonomy` (
	`productId` int NOT NULL,
	`brandId` int NOT NULL,
	`subcategoryId` int,
	`shopCollectionId` int,
	`sourceLabel` varchar(255),
	`reviewStatus` enum('confirmed','needs_review','unmapped') NOT NULL DEFAULT 'needs_review',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalogue_product_taxonomy_productId` PRIMARY KEY(`productId`)
);
--> statement-breakpoint
CREATE TABLE `catalogue_shop_collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalogue_shop_collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalogue_shop_collections_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `catalogue_subcategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalogue_subcategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalogue_subcategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `catalogue_brand_aliases` ADD CONSTRAINT `catalogue_brand_aliases_brandId_catalogue_brands_id_fk` FOREIGN KEY (`brandId`) REFERENCES `catalogue_brands`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `catalogue_product_taxonomy` ADD CONSTRAINT `cpt_product_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `catalogue_product_taxonomy` ADD CONSTRAINT `cpt_brand_fk` FOREIGN KEY (`brandId`) REFERENCES `catalogue_brands`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `catalogue_product_taxonomy` ADD CONSTRAINT `cpt_subcategory_fk` FOREIGN KEY (`subcategoryId`) REFERENCES `catalogue_subcategories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `catalogue_product_taxonomy` ADD CONSTRAINT `cpt_collection_fk` FOREIGN KEY (`shopCollectionId`) REFERENCES `catalogue_shop_collections`(`id`) ON DELETE no action ON UPDATE no action;