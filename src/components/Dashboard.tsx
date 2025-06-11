
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SalesAnalytics from './dashboard/SalesAnalytics';
import { BarChart3, TrendingUp, Users, DollarSign, Target, Gift, FileText } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    { id: 'sales', label: 'Sales Analytics', icon: BarChart3, component: SalesAnalytics },
    { id: 'funnel', label: 'Funnel & Lead Performance', icon: TrendingUp },
    { id: 'conversion', label: 'New Client Conversion & Retention', icon: Users },
    { id: 'trainer', label: 'Trainer Performance & Analytics', icon: Target },
    { id: 'attendance', label: 'Class Attendance', icon: Users },
    { id: 'promotions', label: 'Discounts & Promotions', icon: Gift },
    { id: 'executive', label: 'Executive Summary', icon: FileText },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || (() => (
    <div className="flex items-center justify-center h-96">
      <p className="text-muted-foreground">Coming Soon</p>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">P57</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Physique 57 India</h1>
                <p className="text-slate-400 text-sm">Data Analytics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-400 text-sm">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 bg-slate-950/30 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-yellow-400 border-b-2 border-yellow-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-t-lg"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-6 py-8"
      >
        <ActiveComponent />
      </motion.div>
    </div>
  );
};

export default Dashboard;
