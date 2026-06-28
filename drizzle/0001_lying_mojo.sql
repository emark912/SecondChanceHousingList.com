CREATE TABLE `deliveredLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`submissionId` int NOT NULL,
	`emailSentAt` timestamp NOT NULL DEFAULT (now()),
	`emailOpenedAt` timestamp,
	`linkClickedAt` timestamp,
	`leadPurchased` boolean NOT NULL DEFAULT false,
	`purchasedAt` timestamp,
	`leadViewedAt` timestamp,
	`isTrial` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deliveredLeads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadPackages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`packageName` varchar(200) NOT NULL,
	`leadsIncluded` int NOT NULL,
	`leadsRemaining` int NOT NULL,
	`pricePerLead` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`status` enum('active','expired') NOT NULL DEFAULT 'active',
	`expiresAt` timestamp NOT NULL,
	`stripePaymentIntentId` varchar(200),
	`stripeSessionId` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leadPackages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`deliveredLeadId` int NOT NULL,
	`packageId` int,
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	`leadDetails` json,
	`amountPaid` decimal(10,2),
	CONSTRAINT `leadPurchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`url` text NOT NULL,
	`filename` varchar(300),
	`mimeType` varchar(100),
	`sizeBytes` int,
	`fileType` enum('profile_doc','lead_attachment','rental_pdf') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerPrograms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(512) NOT NULL,
	`partnerName` varchar(200) NOT NULL,
	`businessName` varchar(200) NOT NULL,
	`isVerified` boolean NOT NULL DEFAULT false,
	`verificationCode` varchar(10),
	`verificationCodeExpires` timestamp,
	`trialLeadsRemaining` int NOT NULL DEFAULT 0,
	`trialLeadsUsed` int NOT NULL DEFAULT 0,
	`stripeCustomerId` varchar(200),
	`lastLoginAt` timestamp,
	`loginAttempts` int NOT NULL DEFAULT 0,
	`lockedUntil` timestamp,
	`businessPhone` varchar(30),
	`businessAddress` varchar(300),
	`businessCity` varchar(100),
	`state` varchar(50),
	`zip` varchar(20),
	`resetToken` varchar(200),
	`resetTokenExpires` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerPrograms_id` PRIMARY KEY(`id`),
	CONSTRAINT `partnerPrograms_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `rentalSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`city` varchar(100),
	`state` varchar(50),
	`zip` varchar(20),
	`creditChallenges` text,
	`housingType` varchar(100),
	`budgetMin` int,
	`budgetMax` int,
	`moveInDate` varchar(50),
	`additionalNotes` text,
	`pdfS3Key` varchar(500),
	`pdfUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rentalSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `deliveredLeads` ADD CONSTRAINT `deliveredLeads_partnerId_partnerPrograms_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partnerPrograms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveredLeads` ADD CONSTRAINT `deliveredLeads_submissionId_rentalSubmissions_id_fk` FOREIGN KEY (`submissionId`) REFERENCES `rentalSubmissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leadPackages` ADD CONSTRAINT `leadPackages_partnerId_partnerPrograms_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partnerPrograms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leadPurchases` ADD CONSTRAINT `leadPurchases_partnerId_partnerPrograms_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partnerPrograms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leadPurchases` ADD CONSTRAINT `leadPurchases_deliveredLeadId_deliveredLeads_id_fk` FOREIGN KEY (`deliveredLeadId`) REFERENCES `deliveredLeads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leadPurchases` ADD CONSTRAINT `leadPurchases_packageId_leadPackages_id_fk` FOREIGN KEY (`packageId`) REFERENCES `leadPackages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnerFiles` ADD CONSTRAINT `partnerFiles_partnerId_partnerPrograms_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partnerPrograms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_deliveredlead_partner` ON `deliveredLeads` (`partnerId`);--> statement-breakpoint
CREATE INDEX `idx_deliveredlead_submission` ON `deliveredLeads` (`submissionId`);--> statement-breakpoint
CREATE INDEX `idx_leadpackage_partner` ON `leadPackages` (`partnerId`);--> statement-breakpoint
CREATE INDEX `idx_leadpurchase_partner` ON `leadPurchases` (`partnerId`);--> statement-breakpoint
CREATE INDEX `idx_partnerfile_partner` ON `partnerFiles` (`partnerId`);--> statement-breakpoint
CREATE INDEX `idx_partner_email` ON `partnerPrograms` (`email`);