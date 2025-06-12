
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from './MetricCard';
import DataTable from './DataTable';
import { InteractiveChart } from './InteractiveChart';
import { ThemeSelector } from './ThemeSelector';
import { DrillDownModal } from './DrillDownModal';
import { NewClientData, NewClientFilterOptions, MetricCardData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface NewClientSectionProps {
  data: NewClientData[];
}

const locations = [
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const NewClientSection: React.FC<NewClientSectionProps> = ({ data }) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'member'>('metric');
  const [filters, setFilters] = useState<NewClientFilterOptions>({
    dateRange: { start: '2020-01-01', end: '2025-12-31' },
    location: [],
    trainer: [],
    paymentMethod: [],
    retentionStatus: [],
    conversionStatus: [],
    isNew: []
  });

  // Filter data by location and other filters
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply location filter
    filtered = filtered.filter(item => {
      const locationMatch = activeLocation === 'kwality' 
        ? item.firstVisitLocation === 'Kwality House, Kemps Corner' || item.homeLocation === 'Kwality House, Kemps Corner'
        : activeLocation === 'supreme'
        ? item.firstVisitLocation === 'Supreme HQ, Bandra' || item.homeLocation === 'Supreme HQ, Bandra'
        : item.firstVisitLocation === 'Kenkere House' || item.homeLocation === 'Kenkere House';
      
      return locationMatch;
    });

    // Apply other filters
    if (filters.trainer?.length) {
      filtered = filtered.filter(item => 
        filters.trainer!.some(trainer => item.trainerName?.toLowerCase().includes(trainer.toLowerCase()))
      );
    }

    if (filters.paymentMethod?.length) {
      filtered = filtered.filter(item => 
        filters.paymentMethod!.some(method => item.paymentMethod?.toLowerCase().includes(method.toLowerCase()))
      );
    }

    if (filters.retentionStatus?.length) {
      filtered = filtered.filter(item => 
        filters.retentionStatus!.some(status => item.retentionStatus?.toLowerCase().includes(status.toLowerCase()))
      );
    }

    if (filters.isNew?.length) {
      filtered = filtered.filter(item => 
        filters.isNew!.some(status => item.isNew?.toLowerCase().includes(status.toLowerCase()))
      );
    }

    return filtered;
  }, [data, activeLocation, filters]);

  const metrics = useMemo((): MetricCardData[] => {
    const totalClients = new Set(filteredData.map(item => item.memberId)).size;
    const newClients = filteredData.filter(item => item.isNew.toLowerCase().includes('new')).length;
    const returningClients = totalClients - newClients;
    const convertedMembers = filteredData.filter(item => item.membershipsBoughtPostTrial?.toLowerCase() === 'yes');
    const notNewMembers = filteredData.filter(item => item.conversionStatus?.toLowerCase() !== 'new');
    const conversionRate = notNewMembers.length > 0 ? (convertedMembers.length / notNewMembers.length) * 100 : 0;
    
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.ltv, 0);
    const avgRevenuePerMember = totalClients > 0 ? totalRevenue / totalClients : 0;
    const revenueFromConverted = convertedMembers.reduce((sum, item) => sum + item.ltv, 0);
    
    const avgVisitsPostTrial = convertedMembers.length > 0 
      ? convertedMembers.reduce((sum, item) => sum + item.visitsPostTrial, 0) / convertedMembers.length 
      : 0;
    
    const avgLTV = filteredData.length > 0 
      ? filteredData.reduce((sum, item) => sum + item.ltv, 0) / filteredData.length 
      : 0;

    const retainedMembers = filteredData.filter(item => 
      item.retentionStatus?.toLowerCase().includes('active') || 
      item.retentionStatus?.toLowerCase().includes('retained')
    ).length;
    const retentionRate = totalClients > 0 ? (retainedMembers / totalClients) * 100 : 0;

    return [
      {
        title: 'Total Clients',
        value: formatNumber(totalClients),
        change: 12.5,
        description: 'Total unique members across all locations and time periods',
        calculation: 'Count of unique Member IDs',
        icon: 'members'
      },
      {
        title: 'New vs Returning',
        value: `${formatNumber(newClients)} / ${formatNumber(returningClients)}`,
        change: 8.2,
        description: 'Split between new and returning clients based on membership status',
        calculation: 'Count based on Is New field',
        icon: 'members'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: 15.3,
        description: 'Percentage of trial members who purchased memberships',
        calculation: 'Converted members / Not New members * 100',
        icon: 'revenue'
      },
      {
        title: 'Avg. Visits Post Trial',
        value: avgVisitsPostTrial.toFixed(1),
        change: -2.1,
        description: 'Average visits by members after trial conversion',
        calculation: 'Sum of visits post trial / Converted members',
        icon: 'transactions'
      },
      {
        title: 'Avg. Lifetime Value',
        value: formatCurrency(avgLTV),
        change: 5.7,
        description: 'Average revenue generated per member over their lifetime',
        calculation: 'Sum of LTV / Total members',
        icon: 'revenue'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: 18.9,
        description: 'Total revenue generated from all members',
        calculation: 'Sum of all LTV values',
        icon: 'revenue'
      },
      {
        title: 'Revenue per Member',
        value: formatCurrency(avgRevenuePerMember),
        change: 7.4,
        description: 'Average revenue contribution per member',
        calculation: 'Total Revenue / Total Clients',
        icon: 'revenue'
      },
      {
        title: 'Retention Rate',
        value: `${retentionRate.toFixed(1)}%`,
        change: 3.2,
        description: 'Percentage of members who remain active or retained',
        calculation: 'Active/Retained members / Total members * 100',
        icon: 'members'
      }
    ];
  }, [filteredData]);

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
        <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-800 bg-clip-text text-transparent animate-pulse mb-4">
          Client Conversion & Retention
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive client lifecycle analytics and retention insights
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto mt-4 rounded-full animate-fade-in"></div>
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
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-600",
                "data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105",
                "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 hover:scale-102",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              <span className="relative z-10 block text-center">
                <div className="font-bold">{location.name.split(',')[0]}</div>
                <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>
              </span>
              {activeLocation === location.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 animate-pulse" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InteractiveChart
                title="Conversion Funnel Analysis"
                data={filteredData}
                type="conversion"
              />
              <InteractiveChart
                title="Retention Trends"
                data={filteredData}
                type="retention"
              />
            </div>

            <div className="space-y-8">
              <DataTable
                title="Member Detail Analysis"
                data={filteredData}
                type="member-detail"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Conversion Funnel View"
                data={filteredData}
                type="conversion-funnel"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Location Performance Analysis"
                data={filteredData}
                type="location-analysis"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Trainer Performance Breakdown"
                data={filteredData}
                type="trainer-performance"
                filters={filters}
                onRowClick={handleTableRowClick}
              />

              <DataTable
                title="Revenue Distribution Analysis"
                data={filteredData}
                type="revenue-distribution"
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

export default NewClientSection;
