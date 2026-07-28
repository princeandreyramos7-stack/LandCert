import { Link } from '@inertiajs/react';
import { Toaster } from '@/Components/ui/toaster';
import { Building2, MapPin, Shield } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Branding & Design (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-400/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-300/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
                </div>

                {/* Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzMuMzEgMCA2LTIuNjkgNi02cy0yLjY5LTYtNi02LTYgMi42OS02IDYgMi42OSA2IDYgNk0wIDM2YzMuMzEgMCA2LTIuNjkgNi02cy0yLjY5LTYtNi02LTYgMi42OS02IDYgMi42OSA2IDYgNiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    {/* Logo & Header */}
                    <div>
                        <Link href="/" className="inline-block group">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-30"></div>
                                    <img 
                                        src="/images/Ilagan.png" 
                                        alt="CPDO Logo" 
                                        className="relative h-16 w-16 object-contain transform group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold group-hover:translate-x-1 transition-transform">
                                        CPDO - Ilagan City
                                    </h1>
                                    <p className="text-blue-100 text-sm mt-1">
                                        City Planning & Development Office
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Middle Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold leading-tight mb-4">
                                Welcome to<br />Digital CPDO Services
                            </h2>
                            <p className="text-blue-100 text-lg">
                                Streamlined building permit applications and certificate processing for Ilagan City residents.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 group">
                                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Building Permit Processing</h3>
                                    <p className="text-sm text-blue-100">Fast and efficient permit applications</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 group">
                                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Certificate Management</h3>
                                    <p className="text-sm text-blue-100">Track your certificates in real-time</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 group">
                                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Land Use Information</h3>
                                    <p className="text-sm text-blue-100">Access zoning and land use data</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-blue-100 text-sm">
                        <p>&copy; {new Date().getFullYear()} CPDO Ilagan City. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative">
                {/* Mobile Logo (Visible only on mobile) */}
                <div className="lg:hidden w-full mb-8 mt-4">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img 
                            src="/images/Ilagan.png" 
                            alt="CPDO Logo" 
                            className="h-12 w-12 object-contain"
                        />
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">CPDO</h1>
                            <p className="text-xs text-gray-600">Ilagan City</p>
                        </div>
                    </Link>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md">
                    {children}
                    
                    {/* Mobile Footer */}
                    <div className="lg:hidden mt-8 text-center text-sm text-gray-600">
                        <p>&copy; {new Date().getFullYear()} CPDO Ilagan City</p>
                    </div>
                </div>
            </div>

            <Toaster />
        </div>
    );
}
