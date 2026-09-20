-- ========================================
-- Production Database Migration Check
-- Run this on production to verify all tables/columns exist
-- ========================================

USE u988863428_zone_clear;

-- Check if consent columns exist in users table
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u988863428_zone_clear'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME IN ('consented_at', 'consent_version', 'consent_ip')
ORDER BY ORDINAL_POSITION;

-- If the above returns 0 rows, the columns are missing

-- Check if corporation address columns exist in applicants table
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u988863428_zone_clear'
  AND TABLE_NAME = 'applicants'
  AND COLUMN_NAME IN ('corporation_region_code', 'corporation_province_code', 'corporation_city_code', 'corporation_barangay_code', 'corporation_street')
ORDER BY ORDINAL_POSITION;

-- Check if address parts exist in users table
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u988863428_zone_clear'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME IN ('address_region_code', 'address_province_code', 'address_city_code', 'address_barangay_code', 'address_street')
ORDER BY ORDINAL_POSITION;

-- Show all recent migrations that have been run
SELECT * FROM migrations 
ORDER BY id DESC 
LIMIT 20;
