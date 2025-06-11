
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SalesAnalytics from './dashboard/SalesAnalytics';
import { BarChart3, TrendingUp, Users, DollarSign, Target, Gift, FileText } from 'lucide-react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import ThemeSelector from '@/components/ui/theme-selector';

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const { currentTheme } = useTheme();

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
      <div className="text-center space-y-4">
        <div className="text-6xl">🚧</div>
        <p className={`text-xl font-semibold ${currentTheme.text}`}>Coming Soon</p>
        <p className={`${currentTheme.text} opacity-70`}>This section is under development</p>
      </div>
    </div>
  ));

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      {/* Header */}
      <div className={`border-b ${currentTheme.border} ${currentTheme.surface} backdrop-blur-xl`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-white font-bold text-lg">P57</span>
              </motion.div>
              <div>
                <motion.h1 
                  className={`text-3xl font-bold ${currentTheme.text} bg-gradient-to-r ${currentTheme.primary} bg-clip-text text-transparent`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Physique 57 India
                </motion.h1>
                <motion.p 
                  className={`${currentTheme.text} opacity-70 text-sm`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Advanced Data Analytics Dashboard
                </motion.p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`${currentTheme.text} opacity-70 text-sm font-medium`}>Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${currentTheme.border} ${currentTheme.surface} backdrop-blur-sm`}>
        <div className="container mx-auto px-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-3 px-8 py-6 text-sm font-semibold transition-all duration-300 whitespace-nowrap group ${
                    activeTab === tab.id
                      ? `${currentTheme.text} border-b-3 border-blue-500`
                      : `${currentTheme.text} opacity-70 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-slate-800/50`
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`p-2 rounded-lg ${activeTab === tab.id ? `bg-gradient-to-r ${currentTheme.primary} text-white` : `bg-gray-100 dark:bg-slate-800 ${currentTheme.text} opacity-70 group-hover:opacity-100`} transition-all duration-300`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="font-medium tracking-wide">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 bg-gradient-to-r ${currentTheme.primary} opacity-10 rounded-t-lg`}
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
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

const Dashboard = () => {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
};

export default Dashboard;
