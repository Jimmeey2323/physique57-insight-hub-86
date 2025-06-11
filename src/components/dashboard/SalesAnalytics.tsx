
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Settings, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FilterPanel from './sales/FilterPanel';
import KPICards from './sales/KPICards';
import TopBottomPerformers from './sales/TopBottomPerformers';
import DataTables from './sales/DataTables';
import Charts from './sales/Charts';
import { useSalesData } from '@/hooks/useSalesData';

const SalesAnalytics = () => {
  const [activeLocation, setActiveLocation] = useState('kwality-house');
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { data, loading, error, refreshData } = useSalesData();

  const locations = [
    { id: 'kwality-house', name: 'Kwality House, Kemps Corner', color: 'from-blue-500 to-blue-600' },
    { id: 'supreme-hq', name: 'Supreme HQ, Bandra', color: 'from-purple-500 to-purple-600' },
    { id: 'kenkere-house', name: 'Kenkere House', color: 'from-green-500 to-green-600' },
  ];

  const filteredData = data?.filter(item => {
    const locationMap = {
      'kwality-house': 'Kwality House, Kemps Corner',
      'supreme-hq': 'Supreme HQ, Bandra',
      'kenkere-house': 'Kenkere House'
    };
    return item['Calculated Location'] === locationMap[activeLocation];
  });

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            📊 SALES ANALYTICS
          </motion.h2>
          <Badge variant="outline" className="border-green-500 text-green-400">
            Live Data
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshData()}
            disabled={loading}
            className="border-slate-700 hover:border-yellow-400"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="border-slate-700 hover:border-yellow-400"
          >
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 hover:border-yellow-400"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Location Tabs */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <div className="flex w-full">
          {locations.map((location, index) => (
            <motion.button
              key={location.id}
              onClick={() => setActiveLocation(location.id)}
              className={`flex-1 relative px-6 py-4 text-sm font-medium transition-all duration-300 ${
                activeLocation === location.id
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              } ${index === 0 ? 'rounded-tl-lg' : ''} ${index === locations.length - 1 ? 'rounded-tr-lg' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10 flex items-center justify-center space-x-2">
                <span>{location.name}</span>
                {activeLocation === location.id && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              {activeLocation === location.id && (
                <motion.div
                  layoutId="activeLocationTab"
                  className={`absolute inset-0 bg-gradient-to-r ${location.color} opacity-20 rounded-lg`}
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Customization Panel */}
      {isCustomizing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Customize Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white">
                <option>Dark Premium</option>
                <option>Light Modern</option>
                <option>Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Refresh Rate</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white">
                <option>30 seconds</option>
                <option>1 minute</option>
                <option>5 minutes</option>
                <option>Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Layout Density</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white">
                <option>Compact</option>
                <option>Standard</option>
                <option>Comfortable</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Panel */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={() => setFiltersCollapsed(!filtersCollapsed)}
            className="w-full justify-between text-white hover:bg-slate-800/50"
          >
            <span className="flex items-center space-x-2">
              <span>Advanced Filters</span>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                {filtersCollapsed ? 'Collapsed' : 'Expanded'}
              </Badge>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${filtersCollapsed ? '' : 'rotate-180'}`} />
          </Button>
          {!filtersCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <FilterPanel />
            </motion.div>
          )}
        </div>
      </Card>

      {error && (
        <Card className="bg-red-900/20 border-red-800 p-4">
          <p className="text-red-400">Error loading data: {error}</p>
        </Card>
      )}

      {/* KPI Cards */}
      <KPICards data={filteredData} loading={loading} />

      {/* Top/Bottom Performers */}
      <TopBottomPerformers data={filteredData} loading={loading} />

      {/* Charts */}
      <Charts data={filteredData} loading={loading} />

      {/* Data Tables */}
      <DataTables data={filteredData} loading={loading} />
    </div>
  );
};

export default SalesAnalytics;
