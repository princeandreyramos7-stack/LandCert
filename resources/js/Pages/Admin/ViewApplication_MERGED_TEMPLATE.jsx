import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import {
    User,
    Building2,
    MapPin,
    Home,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Check,
    Edit2,
    Save,
    Loader2,
    Printer,
    FileCheck,
    Sparkles,
    History,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/Components/ui/use-toast";
import { Toaster } from "@/Components/ui/toaster";
import axios from "axios";
import { getStatusConfig } from "@/lib/applicationStatus";

/**
 * Display-only formatting for peso amount fields.
 */
const formatAmountForDisplay = (rawValue) => {
    if (rawValue === null || rawValue === undefined || rawValue === "") return "";
    const raw = String(rawValue);
    const [integerPart, ...decimalParts] = raw.split(".");
    const hasDecimalPoint = raw.includes(".");
    const groupedInteger = integerPart === "" ? "" : Number(integerPart).toLocaleString("en-US");
    return hasDecimalPoint ? `${groupedInteger}.${decimalParts.join("")}` : groupedInteger;
};

const parseAmountInput = (displayValue) => {
    let cleaned = String(displayValue).replace(/[^\d.]/g, "");
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
        const integerPart = cleaned.slice(0, firstDot);
        const decimalPart = cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
        cleaned = `${integerPart}.${decimalPart}`;
    }
    return cleaned;
};

export default function ViewApplication({ request, uploadedRequirements = [] }) {
    // Tab navigation state
    const [activeTab, setActiveTab] = useState("details");
    const requirementsRef = useRef(null);
    
    // Handle URL hash for direct navigation
    useEffect(() => {
        const hash = window.location.hash;
        if (hash === "#requirements") {
            setActiveTab("requirements");
            setTimeout(() => {
                requirementsRef.current?.scrollIntoView({ 
                    behavior: "smooth", 
                    block: "start" 
                });
            }, 100);
        }
    }, []);

    // ============================================
    // STATE FROM ViewApplication.jsx
    // ============================================
    const [currentStep, setCurrentStep] = useState(1);
    const [editingProjectType, setEditingProjectType] = useState(false);
    const [projectType, setProjectType] = useState(request.project_type || '');
    const [savingProjectType, setSavingProjectType] = useState(false);
    const [editingAppNumber, setEditingAppNumber] = useState(false);
    const [applicationNumber, setApplicationNumber] = useState(request.application_number || '');
    const [savingAppNumber, setSavingAppNumber] = useState(false);
    const [editingProjectCost, setEditingProjectCost] = useState(false);
    const [projectCost, setProjectCost] = useState(
        request.project_cost === null || request.project_cost === undefined ? '' : String(request.project_cost)
    );
    const [savingProjectCost, setSavingProjectCost] = useState(false);
    const { toast } = useToast();

    // ============================================
    // STATE FROM DocumentVerification.jsx
    // TODO: Copy all state from DocumentVerification.jsx here
    // ============================================
    // Example:
    // const [selectedRequirements, setSelectedRequirements] = useState([]);
    // const [titleNumber, setTitleNumber] = useState(request.title_number || "");
    // ... etc

    // ============================================
    // HANDLERS FROM ViewApplication.jsx
    // ============================================
    const handleSaveAppNumber = async () => {
        setSavingAppNumber(true);
        try {
            await axios.post(`/admin/requests/${request.id}/application-details`, {
                application_number: applicationNumber,
            });
            request.application_number = applicationNumber;
            toast({
                title: "Success!",
                description: "Application number updated successfully.",
            });
            setEditingAppNumber(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description:
                    error.response?.data?.errors?.application_number?.[0] ||
                    "Failed to update the application number.",
            });
        } finally {
            setSavingAppNumber(false);
        }
    };

    // TODO: Copy all other handlers from ViewApplication.jsx

    // ============================================
    // HANDLERS FROM DocumentVerification.jsx
    // TODO: Copy all handlers from DocumentVerification.jsx here
    // ============================================

    // Status config
    const statusConfig = getStatusConfig(request.status || "pending");
    const StatusIcon = statusConfig.icon;
    const isZC = String(request.project_type || "").toUpperCase() === "ZC";

    return (
        <AdminLayout 
            title={activeTab === "details" ? "View Application" : "Document Verification"}
            breadcrumbs={[
                { label: "Dashboard", href: "/admin/dashboard" },
                { label: "Applications", href: "/admin/requests" },
            ]}
        >
            <Head title={`${activeTab === "details" ? "View Application" : "Document Verification"} ${request.application_number || `TPZ-${request.id}`}`} />

            <div className="max-w-7xl mx-auto">
                {/* ============================================ */}
                {/* TAB NAVIGATION */}
                {/* ============================================ */}
                <div className="mb-6 border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        <button
                            onClick={() => {
                                setActiveTab("details");
                                window.history.pushState({}, '', window.location.pathname);
                            }}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === "details"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Application Details
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("requirements");
                                window.history.pushState({}, '', window.location.pathname + '#requirements');
                                setTimeout(() => {
                                    requirementsRef.current?.scrollIntoView({ behavior: "smooth" });
                                }, 100);
                            }}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === "requirements"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <FileCheck className="h-4 w-4" />
                                Requirements Verification
                            </div>
                        </button>
                    </nav>
                </div>

                {/* ============================================ */}
                {/* TAB CONTENT */}
                {/* ============================================ */}
                
                {/* SECTION 1: APPLICATION DETAILS */}
                {activeTab === "details" && (
                    <div>
                        {/* ============================================
                            TODO: PASTE THE ENTIRE CONTENT FROM 
                            ViewApplication.jsx HERE
                            (Everything currently inside the return statement)
                            ============================================ */}
                        
                        <div className="text-center py-12 text-gray-500">
                            <p>Copy content from ViewApplication.jsx here</p>
                            <p className="text-sm mt-2">Include: Print button, Application Details Card, all step content, etc.</p>
                        </div>
                    </div>
                )}

                {/* SECTION 2: REQUIREMENTS VERIFICATION */}
                {activeTab === "requirements" && (
                    <div ref={requirementsRef} id="requirements">
                        {/* ============================================
                            TODO: PASTE THE ENTIRE CONTENT FROM 
                            DocumentVerification.jsx HERE
                            (Everything currently inside the return statement)
                            ============================================ */}
                        
                        <div className="text-center py-12 text-gray-500">
                            <p>Copy content from DocumentVerification.jsx here</p>
                            <p className="text-sm mt-2">Include: Requirements checklist, document uploads, mark as reviewed button, etc.</p>
                        </div>
                    </div>
                )}
            </div>
            
            <Toaster />
        </AdminLayout>
    );
}

// ============================================
// TODO: COPY ALL HELPER COMPONENTS FROM BOTH FILES
// ============================================
// - StepIndicator
// - Step1Content, Step2Content, Step3Content
// - SectionTitle
// - InfoField
// - PropertyDetailsEditor
// - All other components from both files
