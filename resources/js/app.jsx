import '../css/app.css';
import './bootstrap';
import 'leaflet/dist/leaflet.css';

import { createInertiaApp, router as inertiaRouter } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import IdleLogout from '@/Components/IdleLogout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Global component to handle auth state and browser navigation
function AppWrapper({ children, auth: initialAuth }) {
    // `initialPage` is captured once at setup, so signing in through Inertia —
    // which never reloads the document — would leave this reading the guest
    // value and the idle watcher would never mount. Track it per navigation.
    const [auth, setAuth] = useState(initialAuth);

    useEffect(() => {
        const stopListening = inertiaRouter.on('navigate', (event) => {
            setAuth(event.detail.page?.props?.auth ?? null);
        });

        return () => {
            if (typeof stopListening === 'function') stopListening();
        };
    }, []);

    useEffect(() => {
        // Function to check auth and redirect if needed
        const checkAuth = () => {
            const currentPath = window.location.pathname;
            const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
            const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith('/reset-password/'));
            
            // If on a protected route but not authenticated, redirect to login
            if (!isPublicRoute && !auth?.user) {
                window.location.href = '/login';
            }
        };

        // Check auth on mount
        checkAuth();

        // Handle browser back/forward navigation (popstate event)
        const handlePopState = (event) => {
            // Small delay to let the navigation happen first
            setTimeout(() => {
                checkAuth();
            }, 0);
        };

        // A page brought back from the browser's back/forward cache is the
        // page exactly as it was left - props, session and all - so asking it
        // whether the user is signed in only repeats what it remembered. On a
        // protected route it is reloaded instead, and the server answers with
        // the truth: the page, or the login screen.
        const handlePageShow = (event) => {
            if (!event.persisted) return;
            const currentPath = window.location.pathname;
            const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
            const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith('/reset-password/'));
            if (isPublicRoute) {
                checkAuth();
            } else {
                window.location.reload();
            }
        };

        // Add event listeners
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('pageshow', handlePageShow);

        // Cleanup
        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [auth]);

    return (
        <>
            {children}
            {/* Mounted here rather than in the layouts. It was in all three of
                them, but the application form builds its own chrome from
                SidebarProvider instead of using ApplicantLayout, so it never
                got the keep-alive ping — and an applicant who spent longer than
                the session lifetime filling the form had it expire underneath
                them and lost everything to a 401 on submit. At the root, no
                page can miss it. */}
            {auth?.user && <IdleLogout />}
        </>
    );
}

// Set up Inertia event listeners for auth checking
inertiaRouter.on('navigate', (event) => {
    // After navigation, check if we're on a protected route without auth
    setTimeout(() => {
        const currentPath = window.location.pathname;
        const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
        const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith('/reset-password/'));
        
        // Check auth data in Inertia page
        const page = event.detail.page;
        if (!isPublicRoute && !page?.props?.auth?.user) {
            window.location.href = '/login';
        }
    }, 0);
});

/**
 * Recover from a page chunk that no longer exists on the server.
 *
 * Every build gives the page chunks new hashed names and the deploy removes the
 * old ones. A browser still holding the previous app.js — from its own cache,
 * or a tab left open across the deploy — asks for a chunk that has since been
 * deleted, gets a 404, and the page simply never renders.
 *
 * Reloading fetches the current document and with it the current asset names.
 * The flag guards against a loop: if the chunk is still missing after a reload
 * the cause is not a stale page, and looping would hide that rather than fix it.
 */
const RELOAD_FLAG = 'cpdo:reloaded-for-stale-chunk';

const reloadOnceForStaleChunk = (error) => {
    if (sessionStorage.getItem(RELOAD_FLAG)) {
        console.error('Asset still missing after reload:', error);
        return false;
    }

    try {
        sessionStorage.setItem(RELOAD_FLAG, '1');
    } catch {
        // Private mode and the like: reloading blind risks a loop, so don't.
        return false;
    }

    window.location.reload();
    return true;
};

// Vite raises this for a failed module preload.
window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnceForStaleChunk(event?.payload)) event.preventDefault();
});

// A successful load means whatever we have is current.
window.addEventListener('load', () => {
    try {
        sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
        /* nothing to clear */
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ).catch((error) => {
            // preloadError does not fire for every failure path, so the import
            // itself is guarded too.
            reloadOnceForStaleChunk(error);
            throw error;
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <AppWrapper auth={props.initialPage.props.auth}>
                <App {...props} />
            </AppWrapper>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
