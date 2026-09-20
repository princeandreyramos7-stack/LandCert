<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Prevent caching for security (disable back button after logout) -->
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="{{ asset('images/Ilagan-64.png') }}">
        <link rel="shortcut icon" type="image/png" href="{{ asset('images/Ilagan-64.png') }}">
        <link rel="apple-touch-icon" href="{{ asset('images/Ilagan-64.png') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        {{-- Leaflet used to be pulled from unpkg.com here. Nothing in
             the application draws a map: no component references L or
             imports leaflet, so this was 144 KB of JavaScript and a
             stylesheet fetched from a third party on every page load,
             for nothing. It also meant every visitor's browser
             contacted an address outside the office's control, which
             is a supply-chain surface and a thing the Cookie Policy
             would have had to account for. Removed.

             If a map is added later, import leaflet from the bundle
             (it is already in package.json) rather than from a CDN. --}}

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
