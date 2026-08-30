import React from 'react';
import { CheckCircle2, Clock, XCircle, FileText, CreditCard, Award } from 'lucide-react';

const statusSteps = [
  {
    key: 'submitted',
    label: 'Application Submitted',
    icon: FileText,
    description: 'Your application has been received'
  },
  {
    key: 'under_review',
    label: 'Under Review',
    icon: Clock,
    description: 'Application is being evaluated'
  },
  {
    key: 'payment_required',
    label: 'Payment Required',
    icon: CreditCard,
    description: 'Payment needed to proceed'
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: CheckCircle2,
    description: 'Application approved'
  },
  {
    key: 'certificate_issued',
    label: 'Certificate Issued',
    icon: Award,
    description: 'Certificate ready for download'
  }
];

const rejectedStep = {
  key: 'rejected',
  label: 'Application Denied',
  icon: XCircle,
  description: 'Application was not approved'
};

export function ProgressIndicator({ currentStatus, rejectionReason = null, className = '' }) {
  // Handle denied status separately
  if (currentStatus === 'rejected') {
    const IconComponent = rejectedStep.icon;
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <IconComponent className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-700">{rejectedStep.label}</h3>
            <p className="text-sm text-red-600">{rejectedStep.description}</p>
            {rejectionReason && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Reason:</span> {rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Get current step index
  const currentStepIndex = statusSteps.findIndex(step => step.key === currentStatus);
  const validCurrentIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {statusSteps.map((step, index) => {
          const IconComponent = step.icon;
          // Special handling for certificate_issued - it should always show as completed (green) when reached
          const isCompleted = index < validCurrentIndex || (currentStatus === 'certificate_issued' && index === validCurrentIndex);
          const isCurrent = index === validCurrentIndex && currentStatus !== 'certificate_issued';
          const isPending = index > validCurrentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className={`
                relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                ${isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }
              `}>
                <IconComponent className="w-6 h-6" />
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center max-w-24">
                <p className={`text-xs font-medium ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-1 ${
                  isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>

              {/* Connector Line */}
              {index < statusSteps.length - 1 && (
                <div className={`
                  absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2 transition-all duration-300
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                `} style={{ 
                  left: 'calc(50% + 24px)', 
                  width: 'calc(100% - 48px)',
                  zIndex: -1 
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status Description */}
      <div className={`mt-6 p-4 rounded-lg border ${
        currentStatus === 'certificate_issued' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {currentStatus === 'certificate_issued' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            )}
          </div>
          <div>
            <h4 className={`text-sm font-medium ${
              currentStatus === 'certificate_issued' ? 'text-green-900' : 'text-blue-900'
            }`}>
              Current Status
            </h4>
            <p className={`text-sm mt-1 ${
              currentStatus === 'certificate_issued' ? 'text-green-700' : 'text-blue-700'
            }`}>
              {statusSteps[validCurrentIndex]?.description || 'Processing your application'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for cards/smaller spaces
export function CompactProgressIndicator({ currentStatus, className = '' }) {
  if (currentStatus === 'rejected') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <XCircle className="w-4 h-4 text-red-500" />
        <span className="text-sm font-medium text-red-700">Denied</span>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(step => step.key === currentStatus);
  const validCurrentIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const currentStep = statusSteps[validCurrentIndex];
  const IconComponent = currentStep?.icon || Clock;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <IconComponent className={`w-4 h-4 ${
        currentStatus === 'certificate_issued' ? 'text-green-500' : 'text-blue-500'
      }`} />
      <span className={`text-sm font-medium ${
        currentStatus === 'certificate_issued' ? 'text-green-700' : 'text-gray-700'
      }`}>
        {currentStep?.label || 'Processing'}
      </span>
      <div className="flex space-x-1">
        {statusSteps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index <= validCurrentIndex ? (currentStatus === 'certificate_issued' ? 'bg-green-500' : 'bg-blue-500') : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}