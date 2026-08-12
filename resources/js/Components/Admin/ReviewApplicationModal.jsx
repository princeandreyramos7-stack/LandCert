import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, XCircle, Calendar, Clock, DollarSign, FileCheck, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function ReviewApplicationModal({ request, isOpen, onClose, onSuccess }) {
    const [action, setAction] = useState('');
    const [formData, setFormData] = useState({
        appointment_date: '',
        appointment_time: '09:00',
        payment_amount: '',
        requirements: [],
        admin_notes: '',
        rejection_reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [availableRequirements, setAvailableRequirements] = useState([]);
    const [loadingRequirements, setLoadingRequirements] = useState(false);

    useEffect(() => {
        if (action === 'reviewed' && request?.project_type) {
            fetchRequirements(request.project_type);
        }
    }, [action, request?.project_type]);

    useEffect(() => {
        if (!isOpen) {
            setAction('');
            setFormData({
                appointment_date: '',
                appointment_time: '09:00',
                payment_amount: '',
                requirements: [],
                admin_notes: '',
                rejection_reason: ''
            });
            setAvailableRequirements([]);
        }
    }, [isOpen]);

    const fetchRequirements = async (projectType) => {
        setLoadingRequirements(true);
        try {
            const response = await axios.get('/admin/get-requirements', {
                params: { project_type: projectType }
            });
            
            const requirements = response.data.requirements.map(req => ({
                ...req,
                checked: req.required
            }));
            
            setAvailableRequirements(requirements);
            setFormData(prev => ({ ...prev, requirements }));
        } catch (error) {
            console.error('Failed to fetch requirements:', error);
        } finally {
            setLoadingRequirements(false);
        }
    };

    const handleRequirementToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.map(req =>
                req.id === id ? { ...req, checked: !req.checked } : req
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/admin/review-application', {
                request_id: request.id,
                action: action,
                ...formData
            });

            onSuccess?.();
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Review failed:', error);
            
            // Show validation errors if available
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat().join('\n');
                alert('Validation Error:\n\n' + errorMessages);
            } else if (error.response?.data?.message) {
                alert('Error: ' + error.response.data.message);
            } else {
                alert('Failed to submit review. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                {/* Header with Gradient */}
                <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                                <h2 className="text-2xl font-bold text-white">
                                    Review Application
                                </h2>
                            </div>
                            <p className="text-blue-100 text-sm font-medium">
                                {request?.applicant_name} • Application #{request?.id}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>
                    </div>
                    
                    {/* Decorative wave */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-white" style={{
                        clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)'
                    }}></div>
                </div>

                {/* Application Info Card */}
                <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-blue-100">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 font-medium mb-0.5">Project Type</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{request?.project_type || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-green-100">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 font-medium mb-0.5">Location</p>
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {request?.project_location_city || request?.city_municipality || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-amber-100">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 font-medium mb-0.5">Status</p>
                                <p className="text-sm font-bold text-amber-700 capitalize">{request?.status || 'pending'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Action Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Select Action <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    action === 'reviewed' 
                                        ? 'border-green-500 bg-green-50 shadow-md scale-[1.02]' 
                                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                                }`}>
                                    <input
                                        type="radio"
                                        name="action"
                                        value="reviewed"
                                        checked={action === 'reviewed'}
                                        onChange={(e) => setAction(e.target.value)}
                                        className="w-5 h-5 text-green-600"
                                        required
                                    />
                                    <div className="ml-3">
                                        <div className="flex items-center gap-2 font-semibold text-green-700 mb-1">
                                            <CheckCircle2 className="h-5 w-5" />
                                            REVIEWED
                                        </div>
                                        <div className="text-xs text-gray-600">Set appointment & requirements</div>
                                    </div>
                                    {action === 'reviewed' && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    )}
                                </label>

                                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    action === 'rejected' 
                                        ? 'border-red-500 bg-red-50 shadow-md scale-[1.02]' 
                                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                                }`}>
                                    <input
                                        type="radio"
                                        name="action"
                                        value="rejected"
                                        checked={action === 'rejected'}
                                        onChange={(e) => setAction(e.target.value)}
                                        className="w-5 h-5 text-red-600"
                                        required
                                    />
                                    <div className="ml-3">
                                        <div className="flex items-center gap-2 font-semibold text-red-700 mb-1">
                                            <XCircle className="h-5 w-5" />
                                            REJECT
                                        </div>
                                        <div className="text-xs text-gray-600">Decline with reason</div>
                                    </div>
                                    {action === 'rejected' && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                                            <XCircle className="h-4 w-4" />
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Reviewed Form */}
                        {action === 'reviewed' && (
                            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                {/* Appointment Details */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-blue-600 rounded-lg">
                                            <Calendar className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">Appointment Details</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.appointment_date}
                                                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Time <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <select
                                                    value={formData.appointment_time}
                                                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                                                    required
                                                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                                                >
                                                    <option value="08:00">08:00 AM</option>
                                                    <option value="09:00">09:00 AM</option>
                                                    <option value="10:00">10:00 AM</option>
                                                    <option value="11:00">11:00 AM</option>
                                                    <option value="13:00">01:00 PM</option>
                                                    <option value="14:00">02:00 PM</option>
                                                    <option value="15:00">03:00 PM</option>
                                                    <option value="16:00">04:00 PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Amount */}
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-emerald-600 rounded-lg">
                                            <DollarSign className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">Payment Information</h3>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount to Pay <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₱</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.payment_amount}
                                                onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                                                required
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-purple-600 rounded-lg">
                                            <FileCheck className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">Requirements Checklist</h3>
                                    </div>
                                    
                                    <div className="bg-white/70 border border-purple-200 rounded-lg p-3 mb-4">
                                        <p className="text-sm font-medium text-purple-900">
                                            <span className="font-bold">Project Type:</span> {request?.project_type}
                                        </p>
                                    </div>

                                    {loadingRequirements ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                                            <span className="ml-2 text-sm text-gray-600">Loading requirements...</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {formData.requirements.map((req) => (
                                                <label
                                                    key={req.id}
                                                    className="flex items-start p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all duration-200"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={req.checked}
                                                        onChange={() => handleRequirementToggle(req.id)}
                                                        className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-800">
                                                        {req.name}
                                                        {req.required && (
                                                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                                                                Required
                                                            </span>
                                                        )}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Admin Notes */}
                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        value={formData.admin_notes}
                                        onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                                        rows="3"
                                        maxLength="1000"
                                        placeholder="Any special instructions or notes for the applicant..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-gray-500">
                                            {formData.admin_notes.length}/1000 characters
                                        </p>
                                        <div className={`h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden`}>
                                            <div 
                                                className="h-full bg-blue-500 transition-all duration-300"
                                                style={{ width: `${(formData.admin_notes.length / 1000) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reject Form */}
                        {action === 'rejected' && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border-2 border-red-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-red-600 rounded-lg">
                                            <XCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">Rejection Reason</h3>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Detailed Reason <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.rejection_reason}
                                            onChange={(e) => setFormData({ ...formData, rejection_reason: e.target.value })}
                                            rows="4"
                                            required
                                            maxLength="1000"
                                            placeholder="Please provide a clear and detailed reason for rejection..."
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-gray-500">
                                                {formData.rejection_reason.length}/1000 characters
                                            </p>
                                            <div className={`h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden`}>
                                                <div 
                                                    className="h-full bg-red-500 transition-all duration-300"
                                                    style={{ width: `${(formData.rejection_reason.length / 1000) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Reasons */}
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Quick Select:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                'Incomplete Documents',
                                                'Invalid Location',
                                                'Zoning Violation',
                                                'Missing Information'
                                            ].map((reason) => (
                                                <button
                                                    key={reason}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rejection_reason: reason })}
                                                    className="px-3 py-1.5 text-sm font-medium bg-white border-2 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all duration-200"
                                                >
                                                    {reason}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Warning */}
                                    <div className="mt-4 flex items-start gap-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-yellow-800">
                                            <span className="font-semibold">Note:</span> The applicant will receive an email with your rejection reason. Please ensure it's clear and professional.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading || !action}
                        className={`px-8 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2 ${
                            action === 'reviewed'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                                : action === 'rejected'
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl'
                                : 'bg-gray-400 cursor-not-allowed'
                        } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                {action === 'reviewed' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                Submit Review
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
