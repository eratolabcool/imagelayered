-- WeChat Mini Program V1.1 Step A: identity + session foundation (D1).
-- Not applied to production or preview in this step.

CREATE TABLE `mini_program_identity` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`app_id` text NOT NULL,
	`openid` text NOT NULL,
	`unionid` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_mini_identity_app_openid` ON `mini_program_identity` (`app_id`,`openid`);--> statement-breakpoint
CREATE INDEX `idx_mini_identity_user` ON `mini_program_identity` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_mini_identity_unionid` ON `mini_program_identity` (`unionid`);--> statement-breakpoint
CREATE TABLE `mini_program_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`identity_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`last_used_at` integer,
	`revoked_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`identity_id`) REFERENCES `mini_program_identity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mini_program_session_token_hash_unique` ON `mini_program_session` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_mini_session_user` ON `mini_program_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_mini_session_expires` ON `mini_program_session` (`expires_at`);
