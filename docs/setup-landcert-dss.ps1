# LandCert DSS Setup Script for Windows PowerShell

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "LandCert DSS Setup Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Run migrations
Write-Host "Running migrations..." -ForegroundColor Yellow
php artisan migrate

# Seed zoning rules
Write-Host "Seeding zoning rules..." -ForegroundColor Yellow
php artisan db:seed --class=ZoningRuleSeeder

# Seed risk factors
Write-Host "Seeding risk factors..." -ForegroundColor Yellow
php artisan db:seed --class=RiskFactorSeeder

# Clear cache
Write-Host "Clearing cache..." -ForegroundColor Yellow
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Build frontend assets
Write-Host "Building frontend assets..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Add GOOGLE_MAPS_API_KEY to your .env file"
Write-Host "2. Add Google Maps script to resources/views/app.blade.php"
Write-Host "3. Visit /admin/zoning-map to view the GIS map"
Write-Host "4. Create property locations for requests"
Write-Host "5. Run DSS evaluations on requests"
Write-Host ""
Write-Host "See LANDCERT_DSS_IMPLEMENTATION.md for detailed documentation" -ForegroundColor Yellow
Write-Host ""
