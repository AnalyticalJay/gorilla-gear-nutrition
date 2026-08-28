CREATE TABLE `auth_rate_limits` (
	`key` varchar(128) NOT NULL,
	`windowStartedAt` timestamp NOT NULL,
	`hitCount` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auth_rate_limits_key` PRIMARY KEY(`key`)
);
