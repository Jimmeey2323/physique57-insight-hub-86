
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Settings, Download, RefreshCw, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FilterPanel from './sales/FilterPanel';
import KPICards from './sales/KPICards';
import TopBottomPerformers from './sales/TopBottomPerformers';
import DataTables from './sales/DataTables';
import Charts from './sales/Charts';
import { useSalesData } from '@/hooks/useSalesData';
import { useTheme } from '@/contexts/ThemeContext';

const SalesAnalytics = () => {
  const [activeLocation, setActiveLocation] = useState('kwality-house');
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [dateRange, setDateRange] = useState('this-month');
  const [appliedFilters, setAppliedFilters] = useState({});
  const { data, loading, error, refreshData } = useSalesData();
  const { currentTheme } = useTheme();

  const locations = [
    { 
      id: 'kwality-house', 
      name: 'Kwality House, Kemps Corner', 
      color: 'from-blue-500 to-blue-600',
      short: 'Kemps Corner'
    },
    { 
      id: 'supreme-hq', 
      name: 'Supreme HQ, Bandra', 
      color: 'from-purple-500 to-purple-600',
      short: 'Bandra'
    },
    { 
      id: 'kenkere-house', 
      name: 'Kenkere House', 
      color: 'from-green-500 to-green-600',
      short: 'Kenkere'
    },
  ];

  const dateRanges = [
    { id: 'this-month', label: 'This Month' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'this-quarter', label: 'This Quarter' },
    { id: 'this-year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const filteredData = data?.filter(item => {
    const locationMap = {
      'kwality-house': 'Kwality House, Kemps Corner',
      'supreme-hq': 'Supreme HQ, Bandra',
      'kenkere-house': 'Kenkere House'
    };
    
    let matches = item['Calculated Location'] === locationMap[activeLocation];
    
    // Apply date range filter
    if (dateRange !== 'custom') {
      const itemDate = new Date(item['Payment Date']);
      const now = new Date();
      
      switch (dateRange) {
        case 'this-month':
          matches = matches && itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
          break;
        case 'last-month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          matches = matches && itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
          break;
        case 'this-quarter':
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          matches = matches && itemDate >= quarterStart;
          break;
        case 'this-year':
          matches = matches && itemDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matches;
  });

  return (
    <div className="space-y-8">
      {/* Enhanced Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <motion.div
            className="relative"
            animate={{ 
              textShadow: [
                '0 0 20px rgba(59, 130, 246, 0.5)',
                '0 0 30px rgba(147, 51, 234, 0.5)',
                '0 0 20px rgba(59, 130, 246, 0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <h2 className={`text-4xl font-black ${currentTheme.text} bg-gradient-to-r ${currentTheme.primary} bg-clip-text text-transparent tracking-wide`}>
              📊 SALES ANALYTICS
            </h2>
            <motion.div
              className={`absolute -bottom-2 left-0 h-1 bg-gradient-to-r ${currentTheme.primary} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </motion.div>
          <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400 animate-pulse">
            Live Data
          </Badge>
        </div>
        <div className="flex items-center space-x-3">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2">
            {dateRanges.map((range) => (
              <Button
                key={range.id}
                variant={dateRange === range.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(range.id)}
                className={`${
                  dateRange === range.id 
                    ? `bg-gradient-to-r ${currentTheme.primary} text-white` 
                    : `${currentTheme.border} ${currentTheme.text} hover:opacity-80`
                }`}
              >
                <Calendar className="w-4 h-4 mr-1" />
                {range.label}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshData()}
            disabled={loading}
            className={`${currentTheme.border} hover:opacity-80`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`${currentTheme.border} hover:opacity-80`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${currentTheme.border} hover:opacity-80`}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Enhanced Location Tabs */}
      <Card className={`${currentTheme.surface} ${currentTheme.border} backdrop-blur-sm shadow-xl`}>
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-2 bg-transparent">
            {locations.map((location, index) => (
              <TabsTrigger
                key={location.id}
                value={location.id}
                className={`relative p-6 text-left space-y-2 data-[state=active]:bg-gradient-to-r data-[state=active]:${location.color} data-[state=active]:text-white transition-all duration-300 hover:scale-105`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">{location.short}</div>
                    <div className="text-sm opacity-80">{location.name}</div>
                  </div>
                  {activeLocation === location.id && (
                    <motion.div 
                      className="w-3 h-3 bg-green-400 rounded-full animate-pulse"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    />
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {locations.map((location) => (
            <TabsContent key={location.id} value={location.id} className="mt-6 space-y-8">
              {/* Customization Panel */}
              {isCustomizing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`${currentTheme.surface} ${currentTheme.border} rounded-xl p-6 backdrop-blur-sm shadow-lg`}
                >
                  <h3 className={`text-lg font-semibold ${currentTheme.text} mb-4`}>Customize Dashboard</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${currentTheme.text} opacity-80 mb-2`}>Refresh Rate</label>
                      <select className={`w-full ${currentTheme.surface} ${currentTheme.border} rounded-lg px-3 py-2 ${currentTheme.text}`}>
                        <option>30 seconds</option>
                        <option>1 minute</option>
                        <option>5 minutes</option>
                        <option>Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${currentTheme.text} opacity-80 mb-2`}>Layout Density</label>
                      <select className={`w-full ${currentTheme.surface} ${currentTheme.border} rounded-lg px-3 py-2 ${currentTheme.text}`}>
                        <option>Compact</option>
                        <option>Standard</option>
                        <option>Comfortable</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${currentTheme.text} opacity-80 mb-2`}>Data View</label>
                      <select className={`w-full ${currentTheme.surface} ${currentTheme.border} rounded-lg px-3 py-2 ${currentTheme.text}`}>
                        <option>Detailed</option>
                        <option>Summary</option>
                        <option>Executive</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Filter Panel */}
              <Card className={`${currentTheme.surface} ${currentTheme.border} backdrop-blur-sm shadow-lg`}>
                <div className="p-4">
                  <Button
                    variant="ghost"
                    onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                    className={`w-full justify-between ${currentTheme.text} hover:bg-gray-100 dark:hover:bg-slate-800/50`}
                  >
                    <span className="flex items-center space-x-3">
                      <Filter className="w-5 h-5" />
                      <span className="font-semibold">Advanced Filters</span>
                      <Badge variant="secondary" className={`bg-gradient-to-r ${currentTheme.primary} text-white`}>
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
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
                  <p className="text-red-600 dark:text-red-400">Error loading data: {error}</p>
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
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default SalesAnalytics;
