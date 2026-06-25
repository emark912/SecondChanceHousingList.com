CREATE TABLE `email_logs` (
	`id` varchar(36) NOT NULL,
	`recipient_email` varchar(255) NOT NULL,
	`email_type` varchar(50) NOT NULL,
	`status` enum('sent','failed','bounced') DEFAULT 'sent',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(36) NOT NULL,
	`user_email` varchar(255) NOT NULL,
	`user_name` varchar(255),
	`amount_cents` int NOT NULL,
	`payment_method` varchar(50) DEFAULT 'stripe',
	`stripe_session_id` varchar(255),
	`stripe_payment_intent_id` varchar(255),
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`list_access_granted_until` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_user_email_unique` UNIQUE(`user_email`)
);
--> statement-breakpoint
CREATE TABLE `property_searches` (
	`id` varchar(36) NOT NULL,
	`search_query` json NOT NULL,
	`results_count` int DEFAULT 0,
	`user_email` varchar(255),
	`user_name` varchar(255),
	`user_phone` varchar(20),
	`credit_challenges` json,
	`created_at` timestamp DEFAULT (now()),
	`converted_to_donation` boolean DEFAULT false,
	`payment_id` varchar(36),
	CONSTRAINT `property_searches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_views` (
	`id` varchar(36) NOT NULL,
	`property_id` varchar(36) NOT NULL,
	`user_email` varchar(255),
	`viewed_at` timestamp DEFAULT (now()),
	`contact_requested` boolean DEFAULT false,
	CONSTRAINT `property_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rental_properties` (
	`id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`address` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`zip_code` varchar(10),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`property_type` enum('apartment','house','townhome','condo','mobile_home','other') NOT NULL,
	`bedrooms` int,
	`bathrooms` decimal(3,1),
	`rent_price` int NOT NULL,
	`pet_friendly` boolean DEFAULT false,
	`accepts_no_credit` boolean DEFAULT true,
	`accepts_evictions` boolean DEFAULT false,
	`accepts_criminal_history` boolean DEFAULT false,
	`accepts_low_income` boolean DEFAULT true,
	`landlord_name` varchar(255),
	`landlord_phone` varchar(255),
	`landlord_email` varchar(255),
	`property_manager_name` varchar(255),
	`property_manager_phone` varchar(255),
	`property_manager_email` varchar(255),
	`application_fee` int,
	`lease_terms` varchar(255),
	`move_in_date` timestamp,
	`images` json,
	`amenities` json,
	`approval_notes` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by_user_id` int,
	CONSTRAINT `rental_properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
