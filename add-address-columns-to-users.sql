-- Add address parts columns to users table for live database
-- This corresponds to migration: 2026_09_15_000004_add_address_parts_to_users.php

ALTER TABLE `users` 
ADD COLUMN `address_region_code` CHAR(9) NULL AFTER `address`,
ADD COLUMN `address_province_code` CHAR(9) NULL AFTER `address_region_code`,
ADD COLUMN `address_city_code` CHAR(9) NULL AFTER `address_province_code`,
ADD COLUMN `address_barangay_code` CHAR(9) NULL AFTER `address_city_code`,
ADD COLUMN `address_street` VARCHAR(255) NULL AFTER `address_barangay_code`;
