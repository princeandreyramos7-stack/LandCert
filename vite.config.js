import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            // Left at the plugin's default outDir (matches laravel-vite-plugin's
            // build.outDir, public/build) so sw.js sits next to the exact
            // assets it precaches and every reference between them stays a
            // plain relative path - no manual URL-prefixing to get wrong.
            //
            // That does mean the file is served from /build/sw.js, whose
            // own directory is /build/ - too narrow a scope to control the
            // rest of the site by default. `scope: '/'` below asks the
            // plugin to register it for the whole origin anyway; the other
            // half of that is the host actually being willing to grant it,
            // which only happens if /build/sw.js is served with a
            // `Service-Worker-Allowed: /` response header (see public/.htaccess).
            scope: '/',
            base: '/build/',
            // The app registers the service worker itself (see app.jsx), on
            // its own schedule and with its own update-prompt handling - a
            // form mid-fill is not a moment to swap the running code out
            // from under it.
            injectRegister: false,
            // The service worker only precaches the built JS/CSS/image
            // assets so the app *shell* still loads with no connection.
            // Actual page data (the applications list, a document, a PSGC
            // list) is never cached here - this app already has its own,
            // more careful story for that (drafts, fetchUntilOnline), and a
            // generic network-first/stale-while-revalidate rule over every
            // API response risks showing one applicant a page built from
            // another's cached data.
            registerType: 'prompt',
            manifest: {
                name: 'CPDO City of Ilagan',
                short_name: 'CPDO Ilagan',
                description: 'Zoning and land use permit applications for the City of Ilagan, Isabela.',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#0d1f5c',
                icons: [
                    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
                    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
                    { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
                    { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                // The manifest.json Laravel itself reads to resolve built
                // asset paths must never be served from a stale cache, or a
                // deploy's new page could ask for a chunk the old
                // precache list never learned about.
                globIgnores: ['**/manifest.json'],
                // generateSW mode builds sw.js from a Workbox recipe, not
                // from a source file of ours - this is the one hook it gives
                // for adding plain event-listener code (push,
                // notificationclick) that Workbox itself has no opinion
                // about. Emitted as a literal importScripts() call in the
                // generated file; see public/sw-push.js for why it lives
                // there rather than in resources/js.
                importScripts: ['/sw-push.js'],
                // This is a server-rendered app (Laravel + Inertia, a
                // different page per route), not a single static-HTML SPA
                // shell - there is no one fallback page a generic offline
                // navigation could show for a route that was never visited,
                // and the plugin's own default ("fall back to index.html")
                // is a file that does not exist here. Left on, the very
                // first offline navigation it ever handled would break
                // instead of simply not applying.
                navigateFallback: null,
            },
        }),
    ],
    server: {
        host: 'localhost',
        hmr: {
            host: 'localhost',
        },
    },
    build: {
        rollupOptions: {
            output: {
                // Force new filenames to break browser cache
                entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
                chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
                assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
                manualChunks: undefined,
            },
        },
    },
    optimizeDeps: {
        include: ['leaflet'],
    },
});
