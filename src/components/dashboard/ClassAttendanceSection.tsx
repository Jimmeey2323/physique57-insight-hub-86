
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
import { SessionData, FilterOptions, MetricCardData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface ClassAttendanceSectionProps {
  data: SessionData[];
}

const locations = [
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const ClassAttendanceSection: React.FC<ClassAttendanceSectionProps> = ({ data }) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'session'>('metric');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '2025-03-01', end: '2025-05-31' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  const applyFilters = (rawData: SessionData[]) => {
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

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      filtered = filtered.filter(item => {
        if (!item.date) return false;
        
        let itemDate: Date | null = null;
        
        const ddmmyyyy = item.date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
          const [, day, month, year] = ddmmyyyy;
          itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          itemDate = new Date(item.date);
        }
        
        if (!itemDate || isNaN(itemDate.getTime())) return false;
        
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        
        return true;
      });
    }

    return filtered;
  };

  const filteredData = useMemo(() => {
    return applyFilters(data);
  }, [data, activeLocation, filters]);

  const metrics = useMemo((): MetricCardData[] => {
    const totalSessions = filteredData.length;
    const totalCapacity = filteredData.reduce((sum, item) => sum + item.capacity, 0);
    const totalBooked = filteredData.reduce((sum, item) => sum + item.countCustomersBooked, 0);
    const totalCheckedIn = filteredData.reduce((sum, item) => sum + item.countCustomersCheckedIn, 0);
    const totalLateCancelled = filteredData.reduce((sum, item) => sum + item.countCustomersLateCancelled, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.totalPaid, 0);
    
    const attendanceRate = totalBooked > 0 ? (totalCheckedIn / totalBooked) * 100 : 0;
    const utilizationRate = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;
    const lateCancellationRate = totalBooked > 0 ? (totalLateCancelled / totalBooked) * 100 : 0;
    const revenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;

    // Calculate peak time utilization (assuming 7-9 AM and 6-8 PM are peak times)
    const peakTimeSessions = filteredData.filter(item => {
      const hour = parseInt(item.time.split(':')[0]);
      return (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20);
    });
    const peakTimeUtilization = peakTimeSessions.length > 0 ? 
      (peakTimeSessions.reduce((sum, item) => sum + item.countCustomersBooked, 0) / 
       peakTimeSessions.reduce((sum, item) => sum + item.capacity, 0)) * 100 : 0;

    return [
      {
        title: 'Total Sessions Scheduled',
        value: formatNumber(totalSessions),
        change: 8.3,
        description: 'Total number of sessions scheduled across all locations',
        calculation: 'COUNT(Session ID)',
        icon: 'transactions'
      },
      {
        title: 'Average Attendance Rate',
        value: `${attendanceRate.toFixed(1)}%`,
        change: 5.7,
        description: 'Percentage of booked customers who actually attended',
        calculation: '(Checked In / Booked) * 100',
        icon: 'upt'
      },
      {
        title: 'Total Check-ins',
        value: formatNumber(totalCheckedIn),
        change: 12.4,
        description: 'Total number of customer check-ins across all sessions',
        calculation: 'SUM(Count of Customers Checked In)',
        icon: 'members'
      },
      {
        title: 'Average Class Utilization',
        value: `${utilizationRate.toFixed(1)}%`,
        change: 3.8,
        description: 'Percentage of class capacity utilized on average',
        calculation: '(Booked / Capacity) * 100',
        icon: 'auv'
      },
      {
        title: 'Late Cancellation Rate',
        value: `${lateCancellationRate.toFixed(1)}%`,
        change: -2.1,
        description: 'Percentage of bookings that were cancelled late',
        calculation: '(Late Cancelled / Booked) * 100',
        icon: 'asv'
      },
      {
        title: 'Revenue per Session',
        value: formatCurrency(revenuePerSession),
        change: 7.9,
        description: 'Average revenue generated per session',
        calculation: 'Total Revenue / Session Count',
        icon: 'atv'
      },
      {
        title: 'Peak Time Utilization',
        value: `${peakTimeUtilization.toFixed(1)}%`,
        change: 15.6,
        description: 'Class utilization during peak time slots',
        calculation: 'Utilization rate during 7-9 AM, 6-8 PM',
        icon: 'revenue'
      },
      {
        title: 'Class Type Performance',
        value: 'Barre 57',
        change: 22.3,
        description: 'Most popular class type based on attendance rates',
        calculation: 'Best performing class type by attendance',
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
    setDrillDownType('session');
  };

  return (
    <div className={cn("space-y-6", isDarkMode && "dark")}>
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse mb-4">
          Class Attendance Analytics
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive class utilization and attendance pattern insights
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
                setDrillDownType('session');
              }}
              type="class-attendance"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InteractiveChart
                title="Attendance Trends"
                data={filteredData}
                type="attendance-trends"
              />
              <InteractiveChart
                title="Class Utilization Heatmap"
                data={filteredData}
                type="utilization-heatmap"
              />
            </div>

            <div className="space-y-8">
              <DataTable
                title="Session Attendance Details"
                data={filteredData}
                type="session-attendance"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Monthly Attendance Summary"
                data={filteredData}
                type="attendance-monthly"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Time Slot Performance Analysis"
                data={filteredData}
                type="time-slot-performance"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Class Type Performance"
                data={filteredData}
                type="class-type-performance"
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
