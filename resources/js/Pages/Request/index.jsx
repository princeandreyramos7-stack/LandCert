import { AppSidebar } from "@/Components/app-sidebar";
import { AdminSidebar } from "@/Components/admin-sidebar";
import { Head, usePage } from "@inertiajs/react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar";
import RequestForm from "@/Components/Request_form";
import { Toaster } from "@/Components/ui/toaster";

export default function RequestPage() {
    const { auth } = usePage();
    const isAdmin = auth?.user?.roles?.some((role) => role.name === "admin");
    const Sidebar = isAdmin ? AdminSidebar : AppSidebar;

    return (
        <SidebarProvider>
            <Head title="Request" />
            <Sidebar />
            <Toaster />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        Request Application
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Enhanced background with animated gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60 pointer-events-none" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMC41NTItLjQ0OC0xLTEtMXMtMSAuNDQ4LTEgMSAuNDQ4IDEgMSAxIDEtLjQ0OCAxLTF6bS0yIDFjLS41NTIgMC0xLS40NDgtMS0xczQuNDQ4LTEgMS0xIDEgLjQ0OCAxIDEtLjQ0OCAxLTEgMXoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30 pointer-events-none" />
                    
                    {/* Main content container with enhanced styling */}
                    <div className="relative rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-2xl shadow-blue-200/50 p-8 animate-fadeIn">
                        {/* Decorative gradient border */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
                        
                        {/* Enhanced header with icon */}
                        <div className="mb-8 text-center animate-slideDown">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-300/50 mb-4 animate-bounce-slow">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                                Submit New Request
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Fill out the form below to submit your land certification request
                            </p>
                            
                            {/* Progress indicator line */}
                            <div className="mt-6 h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-pulse" />
                        </div>
                        
                        <RequestForm />
                    </div>
                </div>
                
                {/* Add custom animations in style tag */}
                <style>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes bounce-slow {
                        0%, 100% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-10px);
                        }
                    }
                    
                    .animate-fadeIn {
                        animation: fadeIn 0.6s ease-out;
                    }
                    
                    .animate-slideDown {
                        animation: slideDown 0.5s ease-out;
                    }
                    
                    .animate-bounce-slow {
                        animation: bounce-slow 2s ease-in-out infinite;
                    }
                `}</style>
            </SidebarInset>
        </SidebarProvider>
    );
}
