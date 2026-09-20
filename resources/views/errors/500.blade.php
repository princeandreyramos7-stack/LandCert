<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Error - CPDO</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0d1f5c 0%, #1a3a8f 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .error-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 48px 32px;
            text-align: center;
        }
        .error-icon {
            width: 80px;
            height: 80px;
            background: #fee;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 40px;
            color: #c00;
        }
        h1 {
            font-size: 28px;
            color: #0d1f5c;
            margin-bottom: 16px;
            font-weight: 700;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 24px;
            font-size: 16px;
        }
        .actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn {
            padding: 12px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s;
            display: inline-block;
        }
        .btn-primary {
            background: linear-gradient(90deg, #0d1f5c, #1a3a8f);
            color: white;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(13, 31, 92, 0.3);
        }
        .btn-secondary {
            background: white;
            color: #0d1f5c;
            border: 2px solid #0d1f5c;
        }
        .btn-secondary:hover {
            background: #f8f9fa;
        }
        .support-info {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1>Something Went Wrong</h1>
        <p>We apologize for the inconvenience. An unexpected error occurred while processing your request. Our technical team has been automatically notified and is working to resolve the issue.</p>
        
        <div class="actions">
            <a href="/" class="btn btn-primary">Return to Home</a>
            <a href="javascript:history.back()" class="btn btn-secondary">Go Back</a>
        </div>

        <div class="support-info">
            <p><strong>Need immediate assistance?</strong><br>
            Contact CPDO Support<br>
            Email: cpdo@ilagan.gov.ph<br>
            Reference: {{ date('Y-m-d H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
