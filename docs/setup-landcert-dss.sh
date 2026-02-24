#!/bin/bash

echo "========================================="
echo "LandCert DSS Setup Script"
echo "========================================="
echo ""

# Run migrations
echo "Running migrations..."
php artisan migrate

# Seed zoning rules
echo "Seeding zoning rules..."
php artisan db:seed --class=ZoningRuleSeeder

# Seed risk factors
echo "Seeding risk factors..."
php artisan db:seed --class=RiskFactorSeeder

# Clear cache
echo "Clearing cache..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Build frontend assets
echo "Building frontend assets..."
npm run build

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Add GOOGLE_MAPS_API_KEY to your .env file"
echo "2. Add Google Maps script to resources/views/app.blade.php"
echo "3. Visit /admin/zoning-map to view the GIS map"
echo "4. Create property locations for requests"
echo "5. Run DSS evaluations on requests"
echo ""
echo "See LANDCERT_DSS_IMPLEMENTATION.md for detailed documentation"
echo ""
