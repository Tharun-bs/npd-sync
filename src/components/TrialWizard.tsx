import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X, AlertCircle } from 'lucide-react';
import { Trial, DEPARTMENTS, Department, FieldConfig } from '../types/trial';
import { useTrials } from '../hooks/useTrials';

interface TrialWizardProps {
  trial: Trial;
  onComplete: () => void;
}

export const TrialWizard: React.FC<TrialWizardProps> = ({ trial, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [validationStatus, setValidationStatus] = useState<'ok' | 'not_ok' | 'pending'>('pending');
  const [remarks, setRemarks] = useState('');
  const { updateTrialStep } = useTrials();

  const currentDepartment = DEPARTMENTS[currentStepIndex];
  const currentStep = trial.steps.find(s => s.stepCode === currentDepartment.code);
  const isStepCompleted = currentStep?.validationStatus !== 'pending';
  const canProceed = currentStepIndex === 0 || trial.steps.find(s => s.orderIndex === currentStepIndex)?.validationStatus === 'ok';

  useEffect(() => {
    if (currentStep) {
      setStepData(currentStep.data);
      setValidationStatus(currentStep.validationStatus);
      setRemarks(currentStep.remarks || '');
    } else {
      setStepData({});
      setValidationStatus('pending');
      setRemarks('');
    }
  }, [currentStepIndex, currentStep]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setStepData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmitStep = () => {
    updateTrialStep(trial.id, currentDepartment.code, stepData, validationStatus);
    
    if (validationStatus === 'ok' && currentStepIndex < DEPARTMENTS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentStepIndex === DEPARTMENTS.length - 1 && validationStatus === 'ok') {
      onComplete();
    }
  };

  const renderField = (field: FieldConfig) => {
    const value = stepData[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );
      
      default:
        return null;
    }
  };

  const getStepStatus = (index: number) => {
    const step = trial.steps.find(s => s.orderIndex === index + 1);
    if (!step) return 'pending';
    return step.validationStatus;
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-500';
      case 'not_ok': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {DEPARTMENTS.map((dept, index) => (
            <div key={dept.code} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                index === currentStepIndex ? 'bg-blue-500' : getStepStatusColor(getStepStatus(index))
              }`}>
                {getStepStatus(index) === 'ok' ? <Check size={16} /> : 
                 getStepStatus(index) === 'not_ok' ? <X size={16} /> : 
                 index + 1}
              </div>
              {index < DEPARTMENTS.length - 1 && (
                <div className={`w-12 h-0.5 ${index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{currentDepartment.name}</h2>
          <p className="text-gray-600">Step {currentStepIndex + 1} of {DEPARTMENTS.length}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {!canProceed && currentStepIndex > 0 ? (
          <div className="flex items-center justify-center py-12 text-amber-600">
            <AlertCircle size={24} className="mr-2" />
            <span>Previous step must be validated as OK to proceed</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {currentDepartment.fields.map(field => (
                <div key={field.name} className={field.type === 'textarea' || field.name === 'visualRemarks' || field.name === 'dimensionalRemarks' || field.name === 'dimensionalReportRemarks' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            {/* Validation Section */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validation Status *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="validation"
                        value="ok"
                        checked={validationStatus === 'ok'}
                        onChange={(e) => setValidationStatus(e.target.value as any)}
                        className="mr-2"
                      />
                      <Check size={16} className="text-green-500 mr-1" />
                      OK - Proceed to next step
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="validation"
                        value="not_ok"
                        checked={validationStatus === 'not_ok'}
                        onChange={(e) => setValidationStatus(e.target.value as any)}
                        className="mr-2"
                      />
                      <X size={16} className="text-red-500 mr-1" />
                      NOT OK - Halt trial
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any remarks or observations..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <button
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>

              <button
                onClick={handleSubmitStep}
                disabled={validationStatus === 'pending'}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStepIndex === DEPARTMENTS.length - 1 ? 'Complete Trial' : 'Save & Continue'}
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};