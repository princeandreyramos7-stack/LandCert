import { Head } from '@inertiajs/react';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export default function Error({ status = 500, message = 'An unexpected error occurred.' }) {
    const title = {
        503: 'Service Unavailable',
        500: 'Server Error',
        404: 'Page Not Found',
        403: 'Forbidden',
    }[status] || 'Error';

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: message || 'An unexpected error occurred. Our team has been notified.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
    }[status] || message;

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gradient-to-br from-[#0d1f5c] to-[#1a3a8f] flex items-center justify-center px-4">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    
                    <h1 className="text-4xl font-bold text-[#0d1f5c] mb-3">
                        {title}
                    </h1>
                    
                    <p className="text-lg text-gray-600 mb-8">
                        {description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0d1f5c] to-[#1a3a8f] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                            <Home className="w-4 h-4" />
                            Return to Home
                        </a>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#0d1f5c] border-2 border-[#0d1f5c] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            <strong>Need help?</strong><br />
                            Contact CPDO Support<br />
                            Email: cpdo@ilagan.gov.ph<br />
                            Reference: {new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
