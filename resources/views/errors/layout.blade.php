{{--
    Shared shell for the error pages. Self-contained on purpose: an error page
    must render even when the asset pipeline, the database or the session is
    the thing that broke, so it pulls in no Vite bundle and reads no user.
--}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') — CPDO City of Ilagan</title>
    <link rel="icon" type="image/png" href="{{ asset('images/Ilagan.png') }}">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            background: #f5f7ff; color: #0d1f5c; padding: 24px;
        }
        .card {
            width: 100%; max-width: 480px; background: #fff; border-radius: 16px;
            border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(13,31,92,.08);
            padding: 36px 32px; text-align: center;
        }
        .seal { width: 64px; height: 64px; margin: 0 auto 18px; display: block; }
        .code { font-size: 12px; letter-spacing: .25em; text-transform: uppercase; color: #d4a017; font-weight: 700; }
        h1 { font-size: 22px; margin: 8px 0 10px; }
        p { font-size: 15px; line-height: 1.55; color: #4b5563; }
        .actions { margin-top: 24px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        a.btn {
            display: inline-block; padding: 10px 18px; border-radius: 8px; font-weight: 700;
            font-size: 14px; text-decoration: none; transition: background .15s;
        }
        a.primary { background: #0d1f5c; color: #fff; }
        a.primary:hover { background: #1a3a8f; }
        a.ghost { background: #fff; color: #0d1f5c; border: 1px solid #d1d5db; }
        a.ghost:hover { border-color: #0d1f5c; }
        .office { margin-top: 26px; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #9ca3af; }
    </style>
</head>
<body>
    <main class="card" role="main">
        <img class="seal" src="{{ asset('images/ilagan1logo.png') }}" alt="">
        <div class="code">@yield('code')</div>
        <h1>@yield('title')</h1>
        <p>@yield('message')</p>
        <div class="actions">
            <a class="btn primary" href="{{ url('/') }}">Go to the home page</a>
            @hasSection('secondary')
                @yield('secondary')
            @else
                <a class="btn ghost" href="javascript:history.back()">Go back</a>
            @endif
        </div>
        <div class="office">City Planning &amp; Development Office · City of Ilagan</div>
    </main>
</body>
</html>
