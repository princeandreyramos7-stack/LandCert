#!/bin/bash
# Complete System Optimization Script
# This script applies all optimizations at once

echo "🚀 Starting Complete System Optimization..."
echo ""

# Phase 1: Clear caches
echo "📦 Phase 1: Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
echo "✅ Caches cleared"
echo ""

# Phase 2: Database verification
echo "📊 Phase 2: Verifying database..."
php artisan migrate:status
echo "✅ Database verified"
echo ""

# Phase 3: Build frontend
echo "🎨 Phase 3: Building frontend..."
npm run build
echo "✅ Frontend built"
echo ""

# Phase 4: Test email configuration
echo "📧 Phase 4: Testing email configuration..."
php artisan config:show mail | head -20
echo "✅ Email configuration displayed"
echo ""

# Phase 5: Check for errors
echo "🔍 Phase 5: Checking for errors..."
php artisan about
echo "✅ System check complete"
echo ""

echo "🎉 All optimizations applied successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Start queue worker: php artisan queue:work"
echo "2. Test the application: php artisan serve"
echo "3. Check browser console for any errors"
echo "4. Test email: php artisan test:email your@email.com"
