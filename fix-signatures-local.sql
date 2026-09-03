-- SQL Script to Fix Signature Paths
-- Run this on BOTH local and production databases

-- Update Crisanta Concepcion (Zoning Administrator)
UPDATE users 
SET signature_url = '/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png' 
WHERE email = 'crisanta@cpdo.com';

-- Update Jeffrey Paguig (Zoning Officer)
UPDATE users 
SET signature_url = '/images/E-signitures/Jeffrey Paguig.png' 
WHERE email = 'jeff@cpdo.com';

-- Update Kay Aggarao (Zoning Officer)
UPDATE users 
SET signature_url = '/images/E-signitures/Kay B. Aggarao.png' 
WHERE email = 'kay@cpdo.com';

-- Update April Cuntapay (Zoning Officer)
UPDATE users 
SET signature_url = '/images/E-signitures/April U. Cuntapay.png' 
WHERE email = 'april@cpdo.com';

-- Update Mary Jane Bulauan (Admin)
UPDATE users 
SET signature_url = '/images/E-signitures/Mary Jane P. Bulauan.png' 
WHERE email = 'admin@cpdo.com';

-- Verify updates
SELECT 
    name, 
    email, 
    user_type,
    signature_url 
FROM users 
WHERE email IN (
    'crisanta@cpdo.com',
    'jeff@cpdo.com',
    'kay@cpdo.com',
    'april@cpdo.com',
    'admin@cpdo.com'
)
ORDER BY email;
