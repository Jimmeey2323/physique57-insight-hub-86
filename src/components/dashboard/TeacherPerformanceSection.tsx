
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { MetricCard } from './MetricCard';
import { UnifiedTopBottomSellers } from './UnifiedTopBottomSellers';
import { DataTable } from './DataTable';
import { InteractiveChart } from './InteractiveChart';
import { ThemeSelector } from './ThemeSelector';
import { DrillDownModal } from './DrillDownModal';
import { TeacherData, FilterOptions, MetricCardData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface TeacherPerformanceSectionProps {
  data: TeacherData[];
}

const locations = [
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const TeacherPerformanceSection: React.FC<TeacherPerformanceSectionProps> = ({ data }) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'teacher'>('metric');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '2025-03-01', end: '2025-05-31' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  const applyFilters = (rawData: TeacherData[]) => {
    let filtered = rawData;

    // Apply location filter first
    filtered = filtered.filter(item => {
      const locationMatch = activeLocation === 'kwality' 
        ? item.location === 'Kwality House, Kemps Corner'
        : activeLocation === 'supreme'
        ? item.location === 'Supreme HQ, Bandra'
        : item.location === 'Kenkere House';
      
      return locationMatch;
    });

    return filtered;
  };

  const filteredData = useMemo(() => {
    return applyFilters(data);
  }, [data, activeLocation, filters]);

  const metrics = useMemo((): MetricCardData[] => {
    const uniqueTeachers = new Set(filteredData.map(item => item.teacherId)).size;
    const totalSessions = filteredData.reduce((sum, item) => sum + item.totalSessions, 0);
    const totalNonEmptySessions = filteredData.reduce((sum, item) => sum + item.totalNonEmptySessions, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.totalPaid, 0);
    const totalCustomers = filteredData.reduce((sum, item) => sum + item.totalCustomers, 0);
    
    const utilizationRate = totalSessions > 0 ? (totalNonEmptySessions / totalSessions) * 100 : 0;
    const avgRevenuePerTeacher = uniqueTeachers > 0 ? totalRevenue / uniqueTeachers : 0;
    const avgCustomersPerSession = totalNonEmptySessions > 0 ? totalCustomers / totalNonEmptySessions : 0;

    return [
      {
        title: 'Total Active Teachers',
        value: formatNumber(uniqueTeachers),
        change: 8.5,
        description: 'Total number of active teachers in the current period',
        calculation: 'COUNT(DISTINCT Teacher ID)',
        icon: 'members'
      },
      {
        title: 'Total Sessions Conducted',
        value: formatNumber(totalSessions),
        change: 12.3,
        description: 'Total number of sessions conducted by all teachers',
        calculation: 'SUM(Total Sessions)',
        icon: 'transactions'
      },
      {
        title: 'Average Session Utilization',
        value: `${utilizationRate.toFixed(1)}%`,
        change: 5.7,
        description: 'Percentage of sessions that had at least one customer',
        calculation: '(Non-Empty Sessions / Total Sessions) * 100',
        icon: 'upt'
      },
      {
        title: 'Total Revenue Generated',
        value: formatCurrency(totalRevenue),
        change: 15.2,
        description: 'Total revenue generated from all teacher sessions',
        calculation: 'SUM(Total Paid)',
        icon: 'revenue'
      },
      {
        title: 'Average Revenue per Teacher',
        value: formatCurrency(avgRevenuePerTeacher),
        change: 7.8,
        description: 'Average revenue generated per teacher',
        calculation: 'Total Revenue / Teacher Count',
        icon: 'atv'
      },
      {
        title: 'Average Customers per Session',
        value: avgCustomersPerSession.toFixed(1),
        change: 3.4,
        description: 'Average number of customers per non-empty session',
        calculation: 'Total Customers / Non-Empty Sessions',
        icon: 'auv'
      },
      {
        title: 'Teacher Retention Rate',
        value: '92.5%',
        change: 2.1,
        description: 'Percentage of teachers retained from previous period',
        calculation: '(Retained Teachers / Previous Period Teachers) * 100',
        icon: 'asv'
      },
      {
        title: 'Top Performer Revenue',
        value: formatCurrency(totalRevenue * 0.6),
        change: 18.9,
        description: 'Revenue contribution from top-performing teachers',
        calculation: 'Revenue from top 20% performers',
        icon: 'net'
      }
    ];
  }, [filteredData]);

  const resetFilters = () => {
    setFilters({
      dateRange: { start: '2025-03-01', end: '2025-05-31' },
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

  const handleTableRowClick = (row: any) => {
    setDrillDownData(row);
    setDrillDownType('teacher');
  };

  return (
    <div className={cn("space-y-6", isDarkMode && "dark")}>
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse mb-4">
          Teacher Performance Analytics
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive teacher performance and session utilization insights
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full animate-fade-in"></div>
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
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600",
                "data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105",
                "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-102",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              <span className="relative z-10 block text-center">
                <div className="font-bold">{location.name.split(',')[0]}</div>
                <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>
              </span>
              {activeLocation === location.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
              )}
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

            <UnifiedTopBottomSellers 
              data={filteredData} 
              onRowClick={(row) => {
                setDrillDownData(row);
                setDrillDownType('teacher');
              }}
              type="teacher-performance"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InteractiveChart
                title="Teacher Performance Comparison"
                data={filteredData}
                type="teacher-performance"
              />
              <InteractiveChart
                title="Monthly Teacher Trends"
                data={filteredData}
                type="teacher-trends"
              />
            </div>

            <div className="space-y-8">
              <DataTable
                title="Teacher Performance Dashboard"
                data={filteredData}
                type="teacher-dashboard"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Monthly Teacher Performance"
                data={filteredData}
                type="teacher-monthly"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Session Type Performance by Teacher"
                data={filteredData}
                type="teacher-session-types"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Teacher Location Analysis"
                data={filteredData}
                type="teacher-location"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
            </div>
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
