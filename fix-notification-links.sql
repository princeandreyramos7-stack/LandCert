-- Fix outdated notification links
-- This updates all notification links to point to the new view-application routes

-- Fix admin notification links from /admin/requests/{id} to /admin/requests/{id}/view-application
UPDATE notifications 
SET link = CONCAT(
    SUBSTRING_INDEX(link, '/admin/requests/', 1), 
    '/admin/requests/', 
    SUBSTRING_INDEX(SUBSTRING_INDEX(link, '/admin/requests/', -1), '/', 1),
    '/view-application'
)
WHERE link LIKE '/admin/requests/%' 
AND link NOT LIKE '%/view-application%'
AND link NOT LIKE '%/document-verification%'
AND link NOT LIKE '%/review%'
AND link REGEXP '^/admin/requests/[0-9]+$';

-- Fix admin notification links from /admin/requests/{id}/review to /admin/requests/{id}/view-application
UPDATE notifications 
SET link = REPLACE(link, '/review', '/view-application')
WHERE link LIKE '/admin/requests/%/review';

-- Fix super-admin notification links from /super-admin/requests/{id}/review to /super-admin/requests/{id}/view-application
UPDATE notifications 
SET link = REPLACE(link, '/review', '/view-application')
WHERE link LIKE '/super-admin/requests/%/review';

-- Fix super-admin notification links from /super-admin/requests/{id} to /super-admin/requests/{id}/view-application
UPDATE notifications 
SET link = CONCAT(
    SUBSTRING_INDEX(link, '/super-admin/requests/', 1), 
    '/super-admin/requests/', 
    SUBSTRING_INDEX(SUBSTRING_INDEX(link, '/super-admin/requests/', -1), '/', 1),
    '/view-application'
)
WHERE link LIKE '/super-admin/requests/%' 
AND link NOT LIKE '%/view-application%'
AND link NOT LIKE '%/document-verification%'
AND link NOT LIKE '%/review%'
AND link REGEXP '^/super-admin/requests/[0-9]+$';

-- Display results
SELECT 
    'Notification links updated' as Status,
    COUNT(*) as TotalNotifications,
    SUM(CASE WHEN link LIKE '%/view-application%' THEN 1 ELSE 0 END) as WithViewApplicationLink,
    SUM(CASE WHEN link LIKE '%/document-verification%' THEN 1 ELSE 0 END) as WithDocVerificationLink,
    SUM(CASE WHEN link LIKE '%/my-applications%' THEN 1 ELSE 0 END) as ApplicantLinks,
    SUM(CASE WHEN link LIKE '%/payments%' THEN 1 ELSE 0 END) as PaymentLinks,
    SUM(CASE WHEN link LIKE '%/certificates%' THEN 1 ELSE 0 END) as CertificateLinks
FROM notifications;
