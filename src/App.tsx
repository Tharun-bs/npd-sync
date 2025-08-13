import React, { useState } from 'react';
import { TrialDashboard } from './components/TrialDashboard';
import { TrialForm } from './components/TrialForm';
import { TrialWizard } from './components/TrialWizard';
import { TrialReport } from './components/TrialReport';
import { useTrials } from './hooks/useTrials';
import { Trial } from './types/trial';

type AppState = 'dashboard' | 'create-trial' | 'trial-wizard' | 'trial-report';

function App() {
  const [currentView, setCurrentView] = useState<AppState>('dashboard');
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const { getTrialById } = useTrials();

  const handleCreateTrial = () => {
    setCurrentView('create-trial');
  };

  const handleTrialCreated = (trialId: string) => {
    const trial = getTrialById(trialId);
    if (trial) {
      setSelectedTrial(trial);
      setCurrentView('trial-wizard');
    }
  };

  const handleViewTrial = (trial: Trial) => {
    setSelectedTrial(trial);
    if (trial.status === 'completed') {
      setCurrentView('trial-report');
    } else {
      setCurrentView('trial-wizard');
    }
  };

  const handleTrialComplete = () => {
    setCurrentView('trial-report');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedTrial(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <TrialDashboard 
            onCreateTrial={handleCreateTrial}
            onViewTrial={handleViewTrial}
          />
        )}
        
        {currentView === 'create-trial' && (
          <TrialForm 
            onBack={handleBackToDashboard}
            onTrialCreated={handleTrialCreated}
          />
        )}
        
        {currentView === 'trial-wizard' && selectedTrial && (
          <TrialWizard 
            trial={selectedTrial}
            onComplete={handleTrialComplete}
          />
        )}
        
        {currentView === 'trial-report' && selectedTrial && (
          <TrialReport 
            trial={selectedTrial}
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </div>
  );
}

export default App;