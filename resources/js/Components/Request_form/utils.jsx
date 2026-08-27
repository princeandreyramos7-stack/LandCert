/**
 * Validation utilities for Request Form
 */

// Validation regex patterns
const PATTERNS = {
    // Only letters, spaces, hyphens, apostrophes, periods, and forward slash (for N/A)
    NAME: /^[a-zA-Z0-9\s\-'./]+$/,
    // Letters, numbers, spaces, and common address characters (including parentheses)
    ADDRESS: /^[a-zA-Z0-9\s,.\-#/()]+$/,
    // Valid email format
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // Only numbers (positive integers)
    NUMBER: /^\d+$/,
    // Decimal numbers (for area, cost)
    DECIMAL: /^\d+(\.\d{1,2})?$/,
    // Phone number (Philippine format)
    PHONE: /^(09|\+639)\d{9}$/,
};

// Check if a value is N/A (user explicitly marking field as not applicable)
const isNA = (value) => {
    if (!value) return false;
    const v = value.trim().toLowerCase();
    return v === 'n/a' || v === 'na' || v === 'n.a.' || v === 'none';
};

// Validation helper functions
const validateName = (value, fieldName) => {
    if (!value || value.trim() === "") {
        return `${fieldName} is required`;
    }
    // Allow N/A explicitly
    if (isNA(value)) return null;
    if (!PATTERNS.NAME.test(value.trim())) {
        return `${fieldName} must contain only letters, spaces, hyphens, apostrophes, periods, or N/A`;
    }
    if (value.trim().length < 2) {
        return `${fieldName} must be at least 2 characters long`;
    }
    if (value.trim().length > 100) {
        return `${fieldName} must not exceed 100 characters`;
    }
    return null;
};

const validateAddress = (value, fieldName) => {
    if (!value || value.trim() === "") {
        return `${fieldName} is required`;
    }
    // Allow N/A explicitly
    if (isNA(value)) return null;
    if (!PATTERNS.ADDRESS.test(value.trim())) {
        return `${fieldName} contains invalid characters`;
    }
    if (value.trim().length < 5) {
        return `${fieldName} must be at least 5 characters long`;
    }
    if (value.trim().length > 255) {
        return `${fieldName} must not exceed 255 characters`;
    }
    return null;
};

const validateEmail = (value, fieldName) => {
    if (!value || value.trim() === "") {
        return `${fieldName} is required`;
    }
    if (!PATTERNS.EMAIL.test(value.trim())) {
        return `${fieldName} must be a valid email address`;
    }
    return null;
};

const validateNumber = (value, fieldName, min = 0, max = null) => {
    if (!value || value.toString().trim() === "") {
        return `${fieldName} is required`;
    }
    if (!PATTERNS.DECIMAL.test(value.toString())) {
        return `${fieldName} must be a valid number`;
    }
    const numValue = parseFloat(value);
    if (numValue < min) {
        return `${fieldName} must be at least ${min}`;
    }
    if (max !== null && numValue > max) {
        return `${fieldName} must not exceed ${max}`;
    }
    return null;
};

export const validateStep1 = (data) => {
    const errors = [];

    // Applicant Name (Required, letters only)
    const nameError = validateName(data.applicant_name, "Applicant Name");
    if (nameError) errors.push(nameError);

    // Applicant Address (Required)
    const addressError = validateAddress(data.applicant_address, "Applicant Address");
    if (addressError) errors.push(addressError);

    // Corporation validation (if provided)
    if (data.corporation_name && data.corporation_name.trim() !== "") {
        // Corporation name validation — allow N/A
        if (!isNA(data.corporation_name) && !PATTERNS.NAME.test(data.corporation_name.trim()) && !PATTERNS.ADDRESS.test(data.corporation_name.trim())) {
            errors.push("Corporation Name contains invalid characters");
        }
        
        // Corporation address required only if corp name is not N/A
        if (!isNA(data.corporation_name)) {
            const corpAddressError = validateAddress(data.corporation_address, "Corporation Address");
            if (corpAddressError) errors.push(corpAddressError);
        }
    }

    // Authorized Representative validation (if provided)
    if (data.authorized_representative_name && data.authorized_representative_name.trim() !== "") {
        // Representative name validation
        const repNameError = validateName(data.authorized_representative_name, "Authorized Representative Name");
        if (repNameError) errors.push(repNameError);
        
        // Representative address validation
        const repAddressError = validateAddress(data.authorized_representative_address, "Authorized Representative Address");
        if (repAddressError) errors.push(repAddressError);
        
        // Representative email validation
        const repEmailError = validateEmail(data.authorized_representative_email, "Authorized Representative Email");
        if (repEmailError) errors.push(repEmailError);
        
        // Authorization letter required
        if (!data.authorization_letter) {
            errors.push("Authorization Letter is required when Authorized Representative is provided");
        }
    }

    return errors;
};

export const validateStep2 = (data) => {
    const errors = [];

    // Project Type is now optional - admin can update later
    // No validation needed for project_type

    // Project Nature (Required)
    if (!data.project_nature || data.project_nature.trim() === "") {
        errors.push("Project Nature is required");
    }

    // Project Location validations
    const locationFields = {
        project_location_street: "Project Location Street",
        project_location_barangay: "Project Location Barangay",
        project_location_municipality: "Project Location Municipality/City",
        project_location_province: "Project Location Province",
    };

    Object.keys(locationFields).forEach((field) => {
        const error = validateAddress(data[field], locationFields[field]);
        if (error) errors.push(error);
    });

    // Project Area validation (must be positive number)
    const areaError = validateNumber(data.project_area_sqm, "Project Area (sqm)", 1, 999999999);
    if (areaError) errors.push(areaError);

    // Lot Area validation (must be positive number)
    const lotError = validateNumber(data.lot_area_sqm, "Lot Area (sqm)", 1, 999999999);
    if (lotError) errors.push(lotError);

    // Validate that lot area >= project area
    if (data.lot_area_sqm && data.project_area_sqm) {
        const lotArea = parseFloat(data.lot_area_sqm);
        const projectArea = parseFloat(data.project_area_sqm);
        if (lotArea < projectArea) {
            errors.push("Lot Area must be greater than or equal to Project Area");
        }
    }

    // Right Over Land (Required)
    if (!data.right_over_land || data.right_over_land.trim() === "") {
        errors.push("Right Over Land is required");
    }

    // Project Nature Duration (Required)
    if (!data.project_nature_duration || data.project_nature_duration.trim() === "") {
        errors.push("Project Nature Duration is required");
    }

    // Conditional validation for project nature duration
    if (data.project_nature_duration === "temporary") {
        const yearsError = validateNumber(data.project_nature_years, "Project Nature Years", 1, 99);
        if (yearsError) errors.push(yearsError);
    }

    // Project Cost validation (must be positive number)
    const costError = validateNumber(data.project_cost, "Project Cost", 1, 999999999999);
    if (costError) errors.push(costError);

    return errors;
};

export const validateStep3 = (data) => {
    const errors = [];

    // Existing Land Use (Required)
    if (!data.existing_land_use || data.existing_land_use.trim() === "") {
        errors.push("Existing Land Use is required");
    } else if (data.existing_land_use.trim().length < 3) {
        errors.push("Existing Land Use must be at least 3 characters long");
    }

    // Written Notice to Tenants (Required)
    if (!data.has_written_notice || data.has_written_notice.trim() === "") {
        errors.push("Written Notice to Tenants is required");
    }

    // Similar Application Filed (Required)
    if (!data.has_similar_application || data.has_similar_application.trim() === "") {
        errors.push("Similar Application Filed is required");
    }

    // Preferred Release Mode (Required)
    if (!data.preferred_release_mode || data.preferred_release_mode.trim() === "") {
        errors.push("Preferred Release Mode is required");
    }

    // Conditional validations for written notice
    if (data.has_written_notice === "yes") {
        const officerError = validateName(data.notice_officer_name, "Notice Officer Name");
        if (officerError) errors.push(officerError);
        
        if (!data.notice_dates || data.notice_dates.trim() === "") {
            errors.push("Notice Dates is required when written notice is yes");
        }
    }

    // Conditional validations for similar application
    if (data.has_similar_application === "yes") {
        if (!data.similar_application_offices || data.similar_application_offices.trim() === "") {
            errors.push("Similar Application Offices is required when similar application is yes");
        } else if (data.similar_application_offices.trim().length < 3) {
            errors.push("Similar Application Offices must be at least 3 characters long");
        }
        
        if (!data.similar_application_dates || data.similar_application_dates.trim() === "") {
            errors.push("Similar Application Dates is required when similar application is yes");
        }
    }

    return errors;
};

export const validateStep4 = (data, requirements = [], existingDocuments = {}) => {
    const errors = [];

    // Get main requirements
    const mainRequirements = requirements.filter((req) => (req.section || 'main') === 'main');
    
    // Get Barangay Clearance from additional requirements
    const barangayClearance = requirements.find((req) => 
        req.section === 'additional' && req.name.toLowerCase().includes('barangay')
    );

    // Check if at least one file is uploaded for each main requirement
    // Consider BOTH new uploads AND existing documents
    const uploads = data.requirement_uploads || {};
    
    mainRequirements.forEach((req) => {
        const reqFiles = uploads[req.id] || [];
        const existingFiles = existingDocuments[req.id] || [];
        
        // Valid if either new files uploaded OR existing files present
        if (reqFiles.length === 0 && existingFiles.length === 0) {
            errors.push(`${req.name} is required - please upload at least one file`);
        }
    });

    // Check for Barangay Clearance (required from additional requirements)
    if (barangayClearance) {
        const barangayFiles = uploads[barangayClearance.id] || [];
        const existingBarangayFiles = existingDocuments[barangayClearance.id] || [];
        
        if (barangayFiles.length === 0 && existingBarangayFiles.length === 0) {
            errors.push(`${barangayClearance.name} is required - please upload at least one file`);
        }
    }

    // If no main requirements, at least check that some files were uploaded
    if (mainRequirements.length === 0 && !barangayClearance) {
        const totalNewFiles = Object.values(uploads).reduce((sum, files) => sum + files.length, 0);
        const totalExistingFiles = Object.values(existingDocuments).reduce((sum, files) => sum + files.length, 0);
        
        if (totalNewFiles === 0 && totalExistingFiles === 0) {
            errors.push("Please upload at least one requirement document");
        }
    }

    return errors;
};

export const validateAllSteps = (data, requirements = [], existingDocuments = {}) => {
    const step1Errors = validateStep1(data);
    const step2Errors = validateStep2(data);
    const step3Errors = validateStep3(data);
    const step4Errors = validateStep4(data, requirements, existingDocuments);

    return [...step1Errors, ...step2Errors, ...step3Errors, ...step4Errors];
};

/**
 * Check if a step is completed
 */
export const isStepCompleted = (step, data, requirements = [], existingDocuments = {}) => {
    switch (step) {
        case 1:
            return validateStep1(data).length === 0;
        case 2:
            return validateStep2(data).length === 0;
        case 3:
            return validateStep3(data).length === 0;
        case 4:
            return validateStep4(data, requirements, existingDocuments).length === 0;
        default:
            return false;
    }
};

/**
 * Get step icon based on completion status
 */
export const getStepIcon = (step, currentStep, completedSteps) => {
    if (completedSteps.includes(step)) {
        return "completed";
    } else if (step === currentStep) {
        return "current";
    } else {
        return "pending";
    }
};

/**
 * Real-time field validation
 * Returns error message or null if valid
 */
export const validateField = (fieldName, value, allData = {}) => {
    switch (fieldName) {
        case "applicant_name":
        case "authorized_representative_name":
        case "notice_officer_name":
            return validateName(value, fieldName.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()));
        
        case "applicant_address":
        case "corporation_address":
        case "authorized_representative_address":
        case "project_location_street":
        case "project_location_barangay":
        case "project_location_municipality":
        case "project_location_province":
        case "release_address":
            return validateAddress(value, fieldName.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()));
        
        case "authorized_representative_email":
            return validateEmail(value, "Email");
        
        case "project_area_sqm":
            const areaError = validateNumber(value, "Project Area", 1, 999999999);
            if (areaError) return areaError;
            // Check against lot area if available
            if (allData.lot_area_sqm && parseFloat(value) > parseFloat(allData.lot_area_sqm)) {
                return "Project Area cannot exceed Lot Area";
            }
            return null;
        
        case "lot_area_sqm":
            const lotError = validateNumber(value, "Lot Area", 1, 999999999);
            if (lotError) return lotError;
            // Check against project area if available
            if (allData.project_area_sqm && parseFloat(value) < parseFloat(allData.project_area_sqm)) {
                return "Lot Area must be greater than or equal to Project Area";
            }
            return null;
        
        case "project_cost":
            return validateNumber(value, "Project Cost", 1, 999999999999);
        
        case "project_nature_years":
            return validateNumber(value, "Years", 1, 99);
        
        default:
            return null;
    }
};

/**
 * Sanitize input - remove potentially harmful characters
 */
export const sanitizeInput = (value, type = "text") => {
    if (!value) return value;
    
    let sanitized = value.toString().trim();
    
    switch (type) {
        case "name":
            // Remove numbers and special characters except spaces, hyphens, apostrophes, periods
            sanitized = sanitized.replace(/[^a-zA-Z\s\-'.]/g, "");
            break;
        case "number":
            // Remove non-numeric characters except decimal point
            sanitized = sanitized.replace(/[^\d.]/g, "");
            // Ensure only one decimal point
            const parts = sanitized.split(".");
            if (parts.length > 2) {
                sanitized = parts[0] + "." + parts.slice(1).join("");
            }
            break;
        case "address":
            // Remove potentially harmful characters but keep common address chars
            sanitized = sanitized.replace(/[^a-zA-Z0-9\s,.\-#/]/g, "");
            break;
        default:
            // Basic sanitization - remove control characters
            sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
    }
    
    return sanitized;
};

/**
 * Format error messages for display
 */
export const formatErrorMessage = (error) => {
    if (typeof error === "string") {
        return error;
    }
    return "Invalid input";
};
