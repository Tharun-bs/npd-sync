import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, QrCode, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTrials } from '../hooks/useTrials';
import { Trial } from '../types/trial';

interface TrialDashboardProps {
  onCreateTrial: () => void;
  onViewTrial: (trial: Trial) => void;
}

export const TrialDashboard: React.FC<TrialDashboardProps> = ({ onCreateTrial, onViewTrial }) => {
  const { trials } = useTrials();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTrials = trials.filter(trial => {
    const matchesSearch = trial.trialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trial.partName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trial.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'halted': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'halted': return 'bg-red-100 text-red-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  const getProgressPercentage = (trial: Trial) => {
    const completedSteps = trial.steps.filter(s => s.validationStatus === 'ok').length;
    return Math.round((completedSteps / 6) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NPD Workflow Dashboard</h1>
          <p className="text-gray-600 mt-2">Track and manage your trial progress</p>
        </div>
        <button
          onClick={onCreateTrial}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Trial
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Trials</p>
              <p className="text-2xl font-bold text-gray-900">{trials.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock size={24} className="text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {trials.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {trials.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle size={24} className="text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Halted</p>
              <p className="text-2xl font-bold text-gray-900">
                {trials.filter(t => t.status === 'halted').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by trial number or part name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="halted">Halted</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trials List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredTrials.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl mb-2">No trials found</p>
            <p>Create your first trial to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrials.map((trial) => (
                  <tr key={trial.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{trial.trialNo}</div>
                        <div className="text-sm text-gray-500">{trial.partName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(trial.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(trial.status)}`}>
                          {trial.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${getProgressPercentage(trial)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{getProgressPercentage(trial)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(trial.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onViewTrial(trial)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Trial"
                        >
                          <Eye size={16} />
                        </button>
                        {trial.status === 'completed' && (
                          <>
                            <button className="text-green-600 hover:text-green-900 p-1 rounded" title="Download Report">
                              <FileText size={16} />
                            </button>
                            <button className="text-purple-600 hover:text-purple-900 p-1 rounded" title="View QR Code">
                              <QrCode size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};