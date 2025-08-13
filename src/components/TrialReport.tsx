import React from 'react';
import { ArrowLeft, Download, QrCode, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Trial, DEPARTMENTS } from '../types/trial';

interface TrialReportProps {
  trial: Trial;
  onBack: () => void;
}

export const TrialReport: React.FC<TrialReportProps> = ({ trial, onBack }) => {
  const getStepStatus = (stepCode: string) => {
    return trial.steps.find(s => s.stepCode === stepCode);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ok': return <CheckCircle size={16} className="text-green-500" />;
      case 'not_ok': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'not_ok': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const generateQRCode = () => {
    // Mock QR code generation - in real app would generate actual QR
    const qrData = `https://npd-workflow.com/r/${trial.trialNo}`;
    alert(`QR Code would be generated for: ${qrData}`);
  };

  const downloadPDF = () => {
    // Mock PDF generation - in real app would generate actual PDF
    alert('PDF report would be downloaded');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft size={20} className="mr-1" />
                Back
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trial Report</h2>
                <p className="text-gray-600">{trial.trialNo} - {trial.partName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={generateQRCode}
                className="flex items-center px-4 py-2 text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200"
              >
                <QrCode size={16} className="mr-2" />
                QR Code
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download size={16} className="mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Trial Summary */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="flex items-center mt-1">
                {getStatusIcon(trial.status === 'completed' ? 'ok' : trial.status === 'halted' ? 'not_ok' : 'pending')}
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(trial.status === 'completed' ? 'ok' : trial.status === 'halted' ? 'not_ok' : 'pending')}`}>
                  {trial.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-sm font-medium">{new Date(trial.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-sm font-medium">{new Date(trial.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Department Details */}
        <div className="p-6">
          <div className="space-y-6">
            {DEPARTMENTS.map(department => {
              const stepData = getStepStatus(department.code);
              
              return (
                <div key={department.code} className="border border-gray-200 rounded-lg">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                    <div className="flex items-center">
                      {getStatusIcon(stepData?.validationStatus)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(stepData?.validationStatus)}`}>
                        {stepData?.validationStatus ? stepData.validationStatus.replace('_', ' ').toUpperCase() : 'NOT STARTED'}
                      </span>
                    </div>
                  </div>
                  
                  {stepData ? (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {department.fields.map(field => {
                          const value = stepData.data[field.name];
                          return (
                            <div key={field.name} className={field.type === 'textarea' || field.name === 'visualRemarks' || field.name === 'dimensionalRemarks' || field.name === 'dimensionalReportRemarks' ? 'md:col-span-2' : ''}>
                              <label className="block text-sm font-medium text-gray-600">{field.label}</label>
                              <p className="mt-1 text-sm text-gray-900">
                                {field.type === 'checkbox' 
                                  ? (value ? 'Yes' : 'No')
                                  : (value !== undefined && value !== null && value !== '') ? value : 'Not specified'
                                }
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Special formatting for Department 6 sections */}
                      {department.code === 'DPT6' && stepData && (
                        <div className="space-y-6 border-t pt-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-3">Visual Inspection</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-600">Quantity Inspected:</span>
                                <span className="ml-2 text-sm text-gray-900">{stepData.data.quantityInspected || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">Quantity Rejected:</span>
                                <span className="ml-2 text-sm text-gray-900">{stepData.data.quantityRejected || 'Not specified'}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-sm font-medium text-gray-600">HOD:</span>
                                <span className="ml-2 text-sm text-gray-900">{stepData.data.visualHod || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-3">Dimensional Inspection</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-600">Bunch Weight:</span>
                                <span className="ml-2 text-sm text-gray-900">{stepData.data.bunchWeight || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">HOD:</span>
                                <span className="ml-2 text-sm text-gray-900">{stepData.data.dimensionalHod || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-3">M/C Shop</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-600">Quantity Received:</span>
                                <span className="ml-2 text-sm text-gray-900">{stepData.data.quantityReceived || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">Quantity Machined:</span>
                                <span className="ml-2 text-sm text-gray-900">{stepData.data.quantityMachined || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">Quantity Rejected:</span>
                                <span className="ml-2 text-sm text-gray-900">{stepData.data.quantityRejectedMc || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">HOD:</span>
                                <span className="ml-2 text-sm text-gray-900">{stepData.data.mcShopHod || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Special formatting for Department 2 composition */}
                      {department.code === 'DPT2' && stepData && (
                        <div className="bg-blue-50 p-4 rounded-lg border-t mt-4">
                          <h4 className="font-semibold text-gray-800 mb-3">Chemical Composition</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Carbon:</span>
                              <span className="ml-1 text-gray-900">{stepData.data.carbon || 'N/A'}%</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Silicon:</span>
                              <span className="ml-1 text-gray-900">{stepData.data.silicon || 'N/A'}%</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Manganese:</span>
                              <span className="ml-1 text-gray-900">{stepData.data.manganese || 'N/A'}%</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Phosphorous:</span>
                              <span className="ml-1 text-gray-900">{stepData.data.phosphorous || 'N/A'}%</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Sulphur:</span>
                              <span className="ml-1 text-gray-900">{stepData.data.sulphur || 'N/A'}%</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Magnesium:</span>
                              <span className="ml-1 text-gray-900">{stepData.data.magnesium || 'N/A'}%</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Copper:</span>
                              <span className="ml-1 text-gray-900">{stepData.data.copper || 'N/A'}%</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Chromium:</span>
                              <span className="ml-1 text-gray-900">{stepData.data.chromium || 'N/A'}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {stepData.remarks && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <label className="block text-sm font-medium text-gray-600">Remarks</label>
                          <p className="mt-1 text-sm text-gray-900">{stepData.remarks}</p>
                        </div>
                      )}
                      
                      {stepData.completedAt && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <label className="block text-sm font-medium text-gray-600">Completed At</label>
                          <p className="mt-1 text-sm text-gray-900">{new Date(stepData.completedAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-gray-500 text-center">
                      This step has not been started yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};