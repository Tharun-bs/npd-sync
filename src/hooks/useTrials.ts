import { useState, useEffect } from 'react';
import { Trial, TrialStep } from '../types/trial';

// Mock data store (in real app, this would be replaced with API calls)
const STORAGE_KEY = 'npd_trials';

const getStoredTrials = (): Trial[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const storeTrials = (trials: Trial[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
};

export const useTrials = () => {
  const [trials, setTrials] = useState<Trial[]>(getStoredTrials);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    storeTrials(trials);
  }, [trials]);

  const createTrial = (trialNo: string, partName: string): Trial => {
    const newTrial: Trial = {
      id: crypto.randomUUID(),
      trialNo,
      partName,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: []
    };

    setTrials(prev => [...prev, newTrial]);
    return newTrial;
  };

  const updateTrialStep = (trialId: string, stepCode: string, data: Record<string, any>, validationStatus: 'ok' | 'not_ok' | 'pending' = 'pending') => {
    setTrials(prev => prev.map(trial => {
      if (trial.id !== trialId) return trial;

      const existingStepIndex = trial.steps.findIndex(s => s.stepCode === stepCode);
      const updatedStep: TrialStep = {
        id: existingStepIndex >= 0 ? trial.steps[existingStepIndex].id : crypto.randomUUID(),
        stepCode,
        stepName: stepCode,
        orderIndex: parseInt(stepCode.replace('DPT', '')),
        data,
        validationStatus,
        completedAt: validationStatus !== 'pending' ? new Date().toISOString() : undefined
      };

      let updatedSteps;
      if (existingStepIndex >= 0) {
        updatedSteps = [...trial.steps];
        updatedSteps[existingStepIndex] = updatedStep;
      } else {
        updatedSteps = [...trial.steps, updatedStep];
      }

      // Update trial status based on validation
      let newStatus = trial.status;
      let haltedStepCode = trial.haltedStepCode;

      if (validationStatus === 'not_ok') {
        newStatus = 'halted';
        haltedStepCode = stepCode;
      } else if (validationStatus === 'ok' && trial.status === 'halted' && trial.haltedStepCode === stepCode) {
        newStatus = 'in_progress';
        haltedStepCode = undefined;
      }

      // Check if all steps are completed
      const allStepsCompleted = updatedSteps.length === 6 && updatedSteps.every(s => s.validationStatus === 'ok');
      if (allStepsCompleted) {
        newStatus = 'completed';
      }

      return {
        ...trial,
        status: newStatus,
        haltedStepCode,
        steps: updatedSteps,
        updatedAt: new Date().toISOString()
      };
    }));
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
    createTrial,
    updateTrialStep,
    getTrialByNo,
    getTrialById
  };
};