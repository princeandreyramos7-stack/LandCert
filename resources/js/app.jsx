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

        // Handle browser page show event (for back/forward cache)
        const handlePageShow = (event) => {
            // If page was loaded from cache (persisted), check auth
            if (event.persisted) {
                checkAuth();
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

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
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
