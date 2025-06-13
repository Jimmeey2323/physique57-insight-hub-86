
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
import { NewClientData, FilterOptions, MetricCardData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface NewClientAnalyticsSectionProps {
  data: NewClientData[];
}

const locations = [
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const NewClientAnalyticsSection: React.FC<NewClientAnalyticsSectionProps> = ({ data }) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'member'>('metric');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '2025-03-01', end: '2025-05-31' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  const applyFilters = (rawData: NewClientData[]) => {
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
        if (!item.firstVisitDate) return false;
        
        let itemDate: Date | null = null;
        
        const ddmmyyyy = item.firstVisitDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
          const [, day, month, year] = ddmmyyyy;
          itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          itemDate = new Date(item.firstVisitDate);
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
    const totalNewClients = filteredData.length;
    const paidNewClients = filteredData.filter(item => item.isNew === 'New - Paid First Visit').length;
    const freeTrialClients = filteredData.filter(item => item.isNew === 'New - Others').length;
    const convertedClients = filteredData.filter(item => item.conversionStatus === 'Converted').length;
    const retainedClients = filteredData.filter(item => item.retentionStatus === 'Retained').length;
    const averageLTV = filteredData.reduce((sum, item) => sum + item.ltv, 0) / totalNewClients || 0;
    const averageVisitsPostTrial = filteredData
      .filter(item => item.visitsPostTrial > 0)
      .reduce((sum, item) => sum + item.visitsPostTrial, 0) / 
      filteredData.filter(item => item.visitsPostTrial > 0).length || 0;

    const conversionRate = totalNewClients > 0 ? (convertedClients / totalNewClients) * 100 : 0;
    const retentionRate = totalNewClients > 0 ? (retainedClients / totalNewClients) * 100 : 0;

    return [
      {
        title: 'Total New Clients',
        value: formatNumber(totalNewClients),
        change: 15.3,
        description: 'Total unique new clients who visited for the first time this period',
        calculation: 'COUNT(DISTINCT Member Id WHERE Is New LIKE "New%")',
        icon: 'members'
      },
      {
        title: 'Paid New Clients',
        value: formatNumber(paidNewClients),
        change: 12.8,
        description: 'New clients who made a payment on their first visit',
        calculation: 'COUNT(DISTINCT Member Id WHERE Is New = "New - Paid First Visit")',
        icon: 'revenue'
      },
      {
        title: 'Free Trial Clients',
        value: formatNumber(freeTrialClients),
        change: 18.9,
        description: 'New clients who started with a free trial or complimentary session',
        calculation: 'COUNT(DISTINCT Member Id WHERE Is New = "New - Others")',
        icon: 'members'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: 5.7,
        description: 'Percentage of new clients who purchased memberships after trial',
        calculation: '(Converted Clients / Total New Clients) * 100',
        icon: 'transactions'
      },
      {
        title: 'Average First Visit LTV',
        value: formatCurrency(averageLTV),
        change: 8.2,
        description: 'Average lifetime value of new clients based on their first purchase',
        calculation: 'AVERAGE(LTV WHERE Is New LIKE "New%")',
        icon: 'atv'
      },
      {
        title: 'Retention Rate',
        value: `${retentionRate.toFixed(1)}%`,
        change: 7.4,
        description: 'Percentage of new clients who returned after their first visit',
        calculation: '(Retained Clients / Total New Clients) * 100',
        icon: 'asv'
      },
      {
        title: 'Average Visits Post Trial',
        value: averageVisitsPostTrial.toFixed(1),
        change: 3.2,
        description: 'Average number of visits by clients after completing their trial period',
        calculation: 'AVERAGE(Visits Post Trial WHERE Visits Post Trial > 0)',
        icon: 'upt'
      },
      {
        title: 'New Client Growth Rate',
        value: '+22.5%',
        change: 22.5,
        description: 'Month-over-month growth rate of new client acquisition',
        calculation: '((This Month - Last Month) / Last Month) * 100',
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
    setDrillDownType('member');
  };

  return (
    <div className={cn("space-y-6", isDarkMode && "dark")}>
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse mb-4">
          New Client Analytics Dashboard
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive new client acquisition and conversion insights
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
                setDrillDownType('member');
              }}
              type="new-client"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InteractiveChart
                title="New Client Acquisition Trends"
                data={filteredData}
                type="new-client-trends"
              />
              <InteractiveChart
                title="Conversion Funnel Analysis"
                data={filteredData}
                type="conversion-funnel"
              />
            </div>

            <div className="space-y-8">
              <DataTable
                title="New Client Master List"
                data={filteredData}
                type="new-client-master"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Monthly New Client Performance"
                data={filteredData}
                type="new-client-monthly"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Location-wise New Client Analysis"
                data={filteredData}
                type="new-client-location"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Membership Package Performance for New Clients"
                data={filteredData}
                type="new-client-packages"
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
