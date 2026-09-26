import React from "react";
import { router } from "@inertiajs/react";

/**
 * Catches a render error anywhere in the current page instead of leaving the
 * whole app a blank white screen with no way back. React error boundaries
 * only work as class components — there is no hook equivalent.
 *
 * Resets itself on the next successful Inertia navigation (not on a timer or
 * a prop change: this component's own props never change after mount), so a
 * crash on one page does not permanently strand the user once they navigate
 * away from it — including via the buttons in the fallback below.
 */
export default class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Unhandled UI error:", error, info?.componentStack);
    }

    componentDidMount() {
        this.stopListening = router.on("navigate", () => {
            if (this.state.hasError) this.setState({ hasError: false });
        });
    }

    componentWillUnmount() {
        this.stopListening?.();
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
                <h1 className="text-xl font-bold text-[#0d1f5c]">Something went wrong</h1>
                <p className="max-w-md text-sm text-gray-500">
                    This page ran into an unexpected error. Reloading usually fixes it —
                    nothing you did elsewhere in the system was affected.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="rounded-lg bg-[#0d1f5c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d1f5c]/90"
                    >
                        Reload the page
                    </button>
                    <a
                        href="/"
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Go to the homepage
                    </a>
                </div>
            </div>
        );
    }
}
