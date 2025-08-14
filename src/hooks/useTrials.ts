import { useState, useEffect } from 'react';
import { Trial, TrialStep } from '../types/trial';

const API_BASE_URL = 'http://localhost:3001/api';

// API helper functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API request failed');
  }
  
  return response.json();
};

export const useTrials = () => {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load trials from API
  useEffect(() => {
    loadTrials();
  }, []);

  const loadTrials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall('/trials');
      
      // Transform API data to match frontend format
      const transformedTrials = data.map((trial: any) => ({
        id: trial.id.toString(),
        trialNo: trial.trial_no,
        partName: trial.part_name,
        status: trial.status,
        haltedStepCode: trial.halted_step_code,
        createdAt: trial.created_at,
        updatedAt: trial.updated_at,
        steps: []
      }));
      
      setTrials(transformedTrials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trials');
      console.error('Error loading trials:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTrial = async (trialNo: string, partName: string): Promise<Trial> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall('/trials', {
        method: 'POST',
        body: JSON.stringify({ trialNo, partName }),
      });
      
      const newTrial: Trial = {
        id: data.id.toString(),
        trialNo: data.trial_no,
        partName: data.part_name,
        status: data.status,
        haltedStepCode: data.halted_step_code,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        steps: []
      };
      
      setTrials(prev => [...prev, newTrial]);
      return newTrial;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trial');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadTrialDetails = async (trialId: string): Promise<Trial> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall(`/trials/${trialId}`);
      
      const trial: Trial = {
        id: data.id.toString(),
        trialNo: data.trial_no,
        partName: data.part_name,
        status: data.status,
        haltedStepCode: data.halted_step_code,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        steps: data.steps.map((step: any) => ({
          id: step.id.toString(),
          stepCode: step.step_code,
          stepName: `Department ${step.step_code.replace('DPT', '')}`,
          orderIndex: parseInt(step.step_code.replace('DPT', '')),
          data: step.data,
          validationStatus: step.validation_status,
          remarks: step.remarks,
          completedAt: step.updated_at
        }))
      };
      
      // Update trial in local state
      setTrials(prev => prev.map(t => t.id === trialId ? trial : t));
      return trial;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trial details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTrialStep = async (trialId: string, stepCode: string, data: Record<string, any>, validationStatus: 'ok' | 'not_ok' | 'pending' = 'pending') => {
    try {
      setLoading(true);
      setError(null);
      
      const { remarks, ...stepData } = data;
      
      await apiCall(`/trials/${trialId}/steps/${stepCode}`, {
        method: 'POST',
        body: JSON.stringify({
          data: stepData,
          validationStatus,
          remarks
        }),
      });
      
      // Reload trial details to get updated status
      await loadTrialDetails(trialId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trial step');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTrialByNo = (trialNo: string): Trial | undefined => {
    return trials.find(t => t.trialNo === trialNo);
  };

  const getTrialById = (id: string): Trial | undefined => {
    return trials.find(t => t.id === id);
  };

  return {
    trials,
    loading,
    error,
    createTrial,
    loadTrialDetails,
    updateTrialStep,
    getTrialByNo,
    getTrialById,
    refreshTrials: loadTrials
  };
};