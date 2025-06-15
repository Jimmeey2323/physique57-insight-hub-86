
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { MetricCard } from './MetricCard';
import { DataTable } from './DataTable';
import { InteractiveChart } from './InteractiveChart';
import { ThemeSelector } from './ThemeSelector';
import { DrillDownModal } from './DrillDownModal';
import { PowerCycleVsBarreTopBottomLists } from './PowerCycleVsBarreTopBottomLists';
import { PowerCycleVsBarreCharts } from './PowerCycleVsBarreCharts';
import { PowerCycleVsBarreTables } from './PowerCycleVsBarreTables';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { FilterOptions, MetricCardData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const locations = [
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const PowerCycleVsBarreSection: React.FC = () => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'trainer' | 'class'>('metric');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '2025-01-01', end: '2025-05-31' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  const { data: payrollData, loading: payrollLoading } = usePayrollData();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: salesData } = useGoogleSheets();

  // Filter data by location and date range
  const filteredData = useMemo(() => {
    if (!payrollData) return [];
    
    return payrollData.filter(item => {
      const locationMatch = activeLocation === 'kwality' 
        ? item.location === 'Kwality House, Kemps Corner'
        : activeLocation === 'supreme'
        ? item.location === 'Supreme HQ, Bandra'
        : item.location === 'Kenkere House';
      
      return locationMatch;
    });
  }, [payrollData, activeLocation, filters]);

  const filteredSessions = useMemo(() => {
    if (!sessionsData) return [];
    
    return sessionsData.filter(session => {
      const locationMatch = activeLocation === 'kwality' 
        ? session.location === 'Kwality House, Kemps Corner'
        : activeLocation === 'supreme'
        ? session.location === 'Supreme HQ, Bandra'
        : session.location === 'Kenkere House';
      
      return locationMatch;
    });
  }, [sessionsData, activeLocation, filters]);

  const metrics = useMemo((): MetricCardData[] => {
    const totalCycleRevenue = filteredData.reduce((sum, item) => sum + item.cyclePaid, 0);
    const totalBarreRevenue = filteredData.reduce((sum, item) => sum + item.barrePaid, 0);
    const totalCycleSessions = filteredData.reduce((sum, item) => sum + item.cycleSessions, 0);
    const totalBarreSessions = filteredData.reduce((sum, item) => sum + item.barreSessions, 0);
    const emptyCycleSessions = filteredData.reduce((sum, item) => sum + item.emptyCycleSessions, 0);
    const emptyBarreSessions = filteredData.reduce((sum, item) => sum + item.emptyBarreSessions, 0);
    const cycleAverage = filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + item.classAverageExclEmpty, 0) / filteredData.length : 0;
    const barreAverage = filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + item.classAverageExclEmpty, 0) / filteredData.length : 0;

    return [
      {
        title: 'PowerCycle Revenue',
        value: formatCurrency(totalCycleRevenue),
        change: 15.3,
        description: 'Total revenue from PowerCycle classes',
        calculation: 'Sum of cyclePaid across all trainers',
        icon: 'revenue',
        rawValue: totalCycleRevenue,
        breakdown: {
          current: totalCycleRevenue,
          sessions: totalCycleSessions,
          revenuePerSession: totalCycleSessions > 0 ? totalCycleRevenue / totalCycleSessions : 0
        }
      },
      {
        title: 'Barre Revenue',
        value: formatCurrency(totalBarreRevenue),
        change: 8.7,
        description: 'Total revenue from Barre classes',
        calculation: 'Sum of barrePaid across all trainers',
        icon: 'revenue',
        rawValue: totalBarreRevenue,
        breakdown: {
          current: totalBarreRevenue,
          sessions: totalBarreSessions,
          revenuePerSession: totalBarreSessions > 0 ? totalBarreRevenue / totalBarreSessions : 0
        }
      },
      {
        title: 'PowerCycle Sessions',
        value: formatNumber(totalCycleSessions),
        change: 12.1,
        description: 'Total PowerCycle sessions conducted',
        calculation: 'Sum of cycleSessions across all trainers',
        icon: 'sessions',
        rawValue: totalCycleSessions,
        breakdown: {
          current: totalCycleSessions,
          empty: emptyCycleSessions,
          filled: totalCycleSessions - emptyCycleSessions
        }
      },
      {
        title: 'Barre Sessions',
        value: formatNumber(totalBarreSessions),
        change: 9.4,
        description: 'Total Barre sessions conducted',
        calculation: 'Sum of barreSessions across all trainers',
        icon: 'sessions',
        rawValue: totalBarreSessions,
        breakdown: {
          current: totalBarreSessions,
          empty: emptyBarreSessions,
          filled: totalBarreSessions - emptyBarreSessions
        }
      },
      {
        title: 'PowerCycle Class Average',
        value: cycleAverage.toFixed(1),
        change: 5.2,
        description: 'Average attendance per PowerCycle class',
        calculation: 'Average classAverageExclEmpty for PowerCycle',
        icon: 'average',
        rawValue: cycleAverage,
        breakdown: {
          current: cycleAverage,
          totalSessions: totalCycleSessions,
          revenue: totalCycleRevenue
        }
      },
      {
        title: 'Barre Class Average',
        value: barreAverage.toFixed(1),
        change: 7.8,
        description: 'Average attendance per Barre class',
        calculation: 'Average classAverageExclEmpty for Barre',
        icon: 'average',
        rawValue: barreAverage,
        breakdown: {
          current: barreAverage,
          totalSessions: totalBarreSessions,
          revenue: totalBarreRevenue
        }
      },
      {
        title: 'PowerCycle Empty Sessions',
        value: formatNumber(emptyCycleSessions),
        change: -15.2,
        description: 'PowerCycle sessions with no attendees',
        calculation: 'Sum of emptyCycleSessions',
        icon: 'empty',
        rawValue: emptyCycleSessions,
        breakdown: {
          current: emptyCycleSessions,
          total: totalCycleSessions,
          percentage: totalCycleSessions > 0 ? (emptyCycleSessions / totalCycleSessions) * 100 : 0
        }
      },
      {
        title: 'Barre Empty Sessions',
        value: formatNumber(emptyBarreSessions),
        change: -8.9,
        description: 'Barre sessions with no attendees',
        calculation: 'Sum of emptyBarreSessions',
        icon: 'empty',
        rawValue: emptyBarreSessions,
        breakdown: {
          current: emptyBarreSessions,
          total: totalBarreSessions,
          percentage: totalBarreSessions > 0 ? (emptyBarreSessions / totalBarreSessions) * 100 : 0
        }
      }
    ];
  }, [filteredData]);

  const resetFilters = () => {
    setFilters({
      dateRange: { start: '2025-01-01', end: '2025-05-31' },
      location: [],
      category: [],
      product: [],
      soldBy: [],
      paymentMethod: []
    });
  };

  const handleMetricClick = (metric: MetricCardData) => {
    setDrillDownData(metric);
    setDrillDownType('metric');
  };

  if (payrollLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Loading PowerCycle vs Barre data...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", isDarkMode && "dark")}>
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent animate-pulse mb-4">
          PowerCycle vs Barre Analytics
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive comparison of PowerCycle and Barre class performance
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-4 rounded-full animate-fade-in"></div>
      </div>

      <ThemeSelector
        currentTheme={currentTheme}
        isDarkMode={isDarkMode}
        onThemeChange={setCurrentTheme}
        onModeChange={setIsDarkMode}
      />

      <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 via-white to-slate-100 p-2 rounded-2xl shadow-lg">
          {locations.map((location) => (
            <TabsTrigger
              key={location.id}
              value={location.id}
              className={cn(
                "relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-sm transition-all duration-500",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600",
                "data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105",
                "hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:scale-102"
              )}
            >
              <span className="relative z-10 block text-center">
                <div className="font-bold">{location.name.split(',')[0]}</div>
                <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
            <AutoCloseFilterSection
              filters={filters}
              onFiltersChange={setFilters}
              onReset={resetFilters}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <MetricCard
                  key={metric.title}
                  data={metric}
                  delay={index * 100}
                  onClick={() => handleMetricClick(metric)}
                />
              ))}
            </div>

            <PowerCycleVsBarreTopBottomLists 
              data={filteredData} 
              sessionsData={filteredSessions}
              onRowClick={(row) => {
                setDrillDownData(row);
                setDrillDownType('trainer');
              }}
            />

            <PowerCycleVsBarreCharts
              payrollData={filteredData}
              sessionsData={filteredSessions}
              salesData={salesData}
            />

            <PowerCycleVsBarreTables
              payrollData={filteredData}
              sessionsData={filteredSessions}
              filters={filters}
              onRowClick={(row) => {
                setDrillDownData(row);
                setDrillDownType('class');
              }}
            />
          </TabsContent>
        ))}
      </Tabs>

      <DrillDownModal
        isOpen={!!drillDownData}
        onClose={() => setDrillDownData(null)}
        data={drillDownData}
        type={drillDownType}
      />
    </div>
  );
};
