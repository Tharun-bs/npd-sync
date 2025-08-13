import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useTrials } from '../hooks/useTrials';

interface TrialFormProps {
  onBack: () => void;
  onTrialCreated: (trialId: string) => void;
}

export const TrialForm: React.FC<TrialFormProps> = ({ onBack, onTrialCreated }) => {
  const [trialNo, setTrialNo] = useState('');
  const [partName, setPartName] = useState('');
  const [error, setError] = useState('');
  const { createTrial, getTrialByNo } = useTrials();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate unique trial number
    if (getTrialByNo(trialNo)) {
      setError('Trial number already exists');
      return;
    }

    const trial = createTrial(trialNo, partName);
    onTrialCreated(trial.id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Create New Trial</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trial Number *
            </label>
            <input
              type="text"
              value={trialNo}
              onChange={(e) => {
                setTrialNo(e.target.value);
                setError('');
              }}
              placeholder="Enter unique trial number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Part Name *
            </label>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="Enter part name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-6 border-t">
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Save size={16} className="mr-2" />
              Create Trial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};