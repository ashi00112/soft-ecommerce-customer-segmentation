import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import OverviewSection from './components/overview/OverviewSection';
import CustomerAnalysis from './components/analysis/CustomerAnalysis';
import MethodologySection from './components/methodology/MethodologySection';
import { getHealth } from './services/api';

/**
 * Root Application Component.
 * Manages active navigation tabs and global backend health polling.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [healthStatus, setHealthStatus] = useState('checking');
  const [healthData, setHealthData] = useState(null);

  const checkHealth = useCallback(async () => {
    setHealthStatus('checking');
    try {
      const data = await getHealth();
      if (data && data.status === 'healthy') {
        setHealthStatus('healthy');
        setHealthData(data);
      } else {
        setHealthStatus('offline');
        setHealthData(null);
      }
    } catch {
      setHealthStatus('offline');
      setHealthData(null);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="app-layout">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        healthStatus={healthStatus}
        healthData={healthData}
        onRefreshHealth={checkHealth}
      />

      <main className="app-main">
        <div className="container">
          {activeTab === 'overview' && <OverviewSection />}
          {activeTab === 'analysis' && <CustomerAnalysis />}
          {activeTab === 'methodology' && <MethodologySection />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
