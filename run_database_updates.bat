@echo off
REM ===================================================
REM CPDO Database Update Script
REM Run this to apply all database migrations safely
REM ===================================================

echo.
echo ========================================
echo CPDO DATABASE UPDATE SCRIPT
echo ========================================
echo.

REM Check if we're in the correct directory
if not exist "artisan" (
    echo ERROR: artisan file not found!
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Step 1: Checking database connection...
php artisan db:show
if errorlevel 1 (
    echo ERROR: Cannot connect to database!
    echo Please check your .env file and ensure MySQL is running
    pause
    exit /b 1
)

echo.
echo Step 2: Backing up current migration status...
php artisan migrate:status > migration_status_before.txt
echo Migration status saved to migration_status_before.txt

echo.
echo Step 3: Running database migrations...
echo.
echo The following migrations will be applied:
echo - 2026_08_28_000001_optimize_payment_and_certificate_workflow.php
echo - 2026_08_28_000002_add_system_flow_constraints.php  
echo - 2026_08_28_000003_comprehensive_database_cleanup.php
echo.

set /p CONTINUE="Do you want to continue? (Y/N): "
if /i not "%CONTINUE%"=="Y" (
    echo Migration cancelled.
    pause
    exit /b 0
)

echo.
echo Running migrations...
php artisan migrate --force

if errorlevel 1 (
    echo.
    echo ERROR: Migration failed!
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo Step 4: Verifying database integrity...
php artisan app:verify-database-integrity

if errorlevel 1 (
    echo.
    echo WARNING: Some integrity checks failed
    echo Please review the output above
)

echo.
echo Step 5: Saving final migration status...
php artisan migrate:status > migration_status_after.txt
echo Migration status saved to migration_status_after.txt

echo.
echo Step 6: Clearing application cache...
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear

echo.
echo ========================================
echo DATABASE UPDATE COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Review the output above for any warnings
echo 2. Test the application thoroughly
echo 3. Check migration_status_after.txt for final state
echo.

pause
