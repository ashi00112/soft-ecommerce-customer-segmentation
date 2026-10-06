import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  const prefersReducedMotion = useReducedMotion();

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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === 'overview' && <OverviewSection />}
              {activeTab === 'analysis' && <CustomerAnalysis />}
              {activeTab === 'methodology' && <MethodologySection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
