-- Mark the consent migration as complete (since we added columns manually)
USE u988863428_zone_clear;

-- Check current migrations
SELECT * FROM migrations WHERE migration LIKE '%consent%';

-- Mark as complete
INSERT INTO `migrations` (`migration`, `batch`) 
VALUES ('2026_09_20_000001_record_consent_to_the_published_notices', 
        (SELECT COALESCE(MAX(batch), 0) + 1 FROM (SELECT batch FROM migrations) as m))
ON DUPLICATE KEY UPDATE batch = batch;

-- Mark the new consent fields migration as complete too
INSERT INTO `migrations` (`migration`, `batch`) 
VALUES ('2026_09_21_040402_add_consent_fields_to_users_table', 
        (SELECT COALESCE(MAX(batch), 0) + 1 FROM (SELECT batch FROM migrations) as m))
ON DUPLICATE KEY UPDATE batch = batch;

-- Verify
SELECT * FROM migrations WHERE migration LIKE '%consent%';
