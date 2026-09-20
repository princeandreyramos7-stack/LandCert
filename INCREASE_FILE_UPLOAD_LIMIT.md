# Increase File Upload Limits

## 1. PHP Configuration (php.ini)

Location: `C:\xampp\php\php.ini`

Find and change these lines:

```ini
upload_max_filesize = 50M
post_max_size = 50M
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
```

**How to find them:**
1. Open `C:\xampp\php\php.ini` in Notepad
2. Press `Ctrl+F` to search
3. Search for `upload_max_filesize`
4. Change from `2M` to `50M`
5. Search for `post_max_size`
6. Change from `8M` to `50M`
7. Search for `max_execution_time`
8. Change from `30` to `300`
9. Save the file

## 2. Restart Apache

After changing php.ini:
1. Open XAMPP Control Panel
2. Click "Stop" on Apache
3. Click "Start" on Apache

## 3. Verify Changes

Create a file `C:\xampp\htdocs\info.php`:
```php
<?php
phpinfo();
```

Visit: `http://localhost/info.php`

Look for:
- `upload_max_filesize` should show `50M`
- `post_max_size` should show `50M`

## Done!

Files up to 50MB can now be uploaded.
