import React, { useState } from 'react';
import { CRMProvider } from './context/CRMContext';
import { Header } from './components/Header';
import { AgentPortal } from './components/AgentPortal';
import { ManagementDashboard } from './components/ManagementDashboard';
import { GoogleAppsScriptVault } from './components/GoogleAppsScriptVault';

export default function App() {
  const [currentView, setCurrentView] = useState<'agent' | 'dashboard' | 'gas'>('agent');

  return (
    <CRMProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Cairo',sans-serif]">
        <Header currentView={currentView} setCurrentView={setCurrentView} />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {currentView === 'agent' && <AgentPortal />}
          {currentView === 'dashboard' && <ManagementDashboard />}
          {currentView === 'gas' && <GoogleAppsScriptVault />}
        </main>

        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-semibold">مجموعة إكسبرتس كير الطبية © 2026 — Experts-Care Medical Group CRM (v27)</p>
            <p className="text-slate-400">نظام إدارة علاقات المرضى المتكامل والتحليلات الطبية المتقدمة</p>
          </div>
        </footer>
      </div>
    </CRMProvider>
  );
}
