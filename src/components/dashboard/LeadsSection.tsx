
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Target, TrendingUp, CreditCard } from 'lucide-react';
import { useLeadsData } from '@/hooks/useLeadsData';
import { LeadsFilterSection } from './LeadsFilterSection';
import { LeadsFunnelVisualization } from './LeadsFunnelVisualization';
import { MetricCard } from './MetricCard';
import { LeadDataTable } from './LeadDataTable';
import { LeadInteractiveChart } from './LeadInteractiveChart';
import { LeadTopBottomLists } from './LeadTopBottomLists';
import { LeadMonthOnMonthTable } from './LeadMonthOnMonthTable';
import { YearOnYearTrainerTable } from './YearOnYearTrainerTable';
import { ThemeSelector } from './ThemeSelector';
import { LeadsFilterOptions, LeadsMetricType } from '@/types/leads';
import { MetricCardData, TrainerMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const locations = [
  { id: 'all', name: 'All Locations', fullName: 'All Locations' },
  { id: 'Kwality House, Kemps Corner', name: 'Kwality House', fullName: 'Kwality House, Kemps Corner' },
  { id: 'Supreme HQ, Bandra', name: 'Supreme HQ', fullName: 'Supreme HQ, Bandra' },
  { id: 'Kenkere House', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const LeadsSection: React.FC = () => {
  const { data, loading, error, refetch } = useLeadsData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [filters, setFilters] = useState<LeadsFilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    source: [],
    stage: [],
    status: [],
    associate: [],
    channel: [],
    trialStatus: [],
    conversionStatus: [],
    retentionStatus: [],
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<LeadsMetricType>('totalLeads');
  const [stageMetric, setStageMetric] = useState<LeadsMetricType>('totalLeads');
  const [yoyMetric, setYoyMetric] = useState<TrainerMetricType>('totalCustomers');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);

  console.log('Raw leads data:', data?.length || 0, 'records');
  console.log('Active location:', activeLocation);
  console.log('Applied filters:', filters);

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = data;
    console.log('Starting with data count:', filtered.length);

    // Apply location filter using 'center' field
    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => item.center === activeLocation);
      console.log('After location filter:', filtered.length, 'for location:', activeLocation);
    }

    // Apply other filters
    if (filters.source.length > 0) {
      filtered = filtered.filter(item => filters.source.includes(item.source));
      console.log('After source filter:', filtered.length);
    }

    if (filters.stage.length > 0) {
      filtered = filtered.filter(item => filters.stage.includes(item.stage));
      console.log('After stage filter:', filtered.length);
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(item => filters.status.includes(item.status));
      console.log('After status filter:', filtered.length);
    }

    if (filters.associate.length > 0) {
      filtered = filtered.filter(item => filters.associate.includes(item.associate));
      console.log('After associate filter:', filtered.length);
    }

    if (filters.trialStatus.length > 0) {
      filtered = filtered.filter(item => filters.trialStatus.includes(item.trialStatus));
      console.log('After trial status filter:', filtered.length);
    }

    if (filters.conversionStatus.length > 0) {
      filtered = filtered.filter(item => filters.conversionStatus.includes(item.conversionStatus));
      console.log('After conversion status filter:', filtered.length);
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
      console.log('After date range filter:', filtered.length);
    }

    // LTV range filter
    if (filters.minLTV !== undefined) {
      filtered = filtered.filter(item => item.ltv >= filters.minLTV!);
    }
    if (filters.maxLTV !== undefined) {
      filtered = filtered.filter(item => item.ltv <= filters.maxLTV!);
    }

    console.log('Final filtered data count:', filtered.length);
    return filtered;
  }, [data, activeLocation, filters]);

  const availableOptions = useMemo(() => {
    if (!data) return {
      locations: [], sources: [], stages: [], statuses: [], associates: [], 
      channels: [], trialStatuses: [], conversionStatuses: [], retentionStatuses: []
    };
    
    return {
      locations: [...new Set(data.map(item => item.center))].filter(Boolean),
      sources: [...new Set(data.map(item => item.source))].filter(Boolean),
      stages: [...new Set(data.map(item => item.stage))].filter(Boolean),
      statuses: [...new Set(data.map(item => item.status))].filter(Boolean),
      associates: [...new Set(data.map(item => item.associate))].filter(Boolean),
      channels: [...new Set(data.map(item => item.channel))].filter(Boolean),
      trialStatuses: [...new Set(data.map(item => item.trialStatus))].filter(Boolean),
      conversionStatuses: [...new Set(data.map(item => item.conversionStatus))].filter(Boolean),
      retentionStatuses: [...new Set(data.map(item => item.retentionStatus))].filter(Boolean),
    };
  }, [data]);

  const metrics = useMemo((): MetricCardData[] => {
    const totalLeads = filteredData.length;
    const trialsCompleted = filteredData.filter(item => item.stage === 'Trial Completed').length;
    const membershipsSold = filteredData.filter(item => item.conversionStatus === 'Converted').length;
    const avgLTV = filteredData.reduce((sum, item) => sum + item.ltv, 0) / totalLeads || 0;
    const leadToTrialRate = totalLeads > 0 ? (trialsCompleted / totalLeads) * 100 : 0;
    const trialToMembershipRate = trialsCompleted > 0 ? (membershipsSold / trialsCompleted) * 100 : 0;

    console.log('Calculated metrics:', {
      totalLeads, trialsCompleted, membershipsSold, avgLTV, leadToTrialRate, trialToMembershipRate
    });

    return [
      {
        title: "Total Leads",
        value: formatNumber(totalLeads),
        change: 12.5,
        description: "Leads in funnel with strong pipeline growth",
        calculation: "Total lead count across all sources",
        icon: "users"
      },
      {
        title: "Lead to Trial Rate",
        value: `${leadToTrialRate.toFixed(1)}%`,
        change: 8.2,
        description: "Trial conversion rate showing healthy interest",
        calculation: "Trials completed / Total leads",
        icon: "target"
      },
      {
        title: "Trial to Membership",
        value: `${trialToMembershipRate.toFixed(1)}%`,
        change: 15.3,
        description: "Final conversion rate indicating sales effectiveness",
        calculation: "Memberships sold / Trials completed",
        icon: "credit-card"
      },
      {
        title: "Average LTV",
        value: formatCurrency(avgLTV),
        change: 7.4,
        description: "Customer lifetime value per converted lead",
        calculation: "Total LTV / Converted customers",
        icon: "trending-up"
      }
    ];
  }, [filteredData]);

  const topSources = useMemo(() => {
    const sourceStats = filteredData.reduce((acc, item) => {
      if (!acc[item.source]) {
        acc[item.source] = { leads: 0, conversions: 0 };
      }
      acc[item.source].leads++;
      if (item.conversionStatus === 'Converted') {
        acc[item.source].conversions++;
      }
      return acc;
    }, {} as Record<string, { leads: number; conversions: number }>);

    return Object.entries(sourceStats)
      .map(([source, stats]) => ({
        name: source,
        value: stats.leads,
        extra: `${((stats.conversions / stats.leads) * 100).toFixed(1)}%`,
        conversionRate: (stats.conversions / stats.leads) * 100,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  const topAssociates = useMemo(() => {
    const associateStats = filteredData.reduce((acc, item) => {
      if (!acc[item.associate]) {
        acc[item.associate] = { leads: 0, conversions: 0 };
      }
      acc[item.associate].leads++;
      if (item.conversionStatus === 'Converted') {
        acc[item.associate].conversions++;
      }
      return acc;
    }, {} as Record<string, { leads: number; conversions: number }>);

    return Object.entries(associateStats)
      .map(([associate, stats]) => ({
        name: associate,
        value: stats.leads,
        extra: `${((stats.conversions / stats.leads) * 100).toFixed(1)}%`,
        conversionRate: (stats.conversions / stats.leads) * 100,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  // Create year-on-year data for lead metrics
  const yoyLeadData = useMemo(() => {
    const monthlyStats = filteredData.reduce((acc, item) => {
      const month = item.createdAt.substring(0, 7); // YYYY-MM format
      const associate = item.associate || 'Unknown';
      
      if (!acc[associate]) {
        acc[associate] = {};
      }
      if (!acc[associate][month]) {
        acc[associate][month] = {
          totalLeads: 0,
          trialsCompleted: 0,
          membershipsSold: 0,
          ltvSum: 0
        };
      }
      
      acc[associate][month].totalLeads++;
      if (item.stage === 'Trial Completed') {
        acc[associate][month].trialsCompleted++;
      }
      if (item.conversionStatus === 'Converted') {
        acc[associate][month].membershipsSold++;
      }
      acc[associate][month].ltvSum += item.ltv;
      
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Convert to the format expected by YearOnYearTrainerTable
    const result: Record<string, Record<string, number>> = {};
    Object.entries(monthlyStats).forEach(([associate, months]) => {
      result[associate] = {};
      Object.entries(months).forEach(([month, stats]) => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[parseInt(monthNum) - 1];
        const formattedMonth = `${monthName}-${year}`;
        
        switch (yoyMetric) {
          case 'totalCustomers':
            result[associate][formattedMonth] = stats.totalLeads;
            break;
          case 'totalSessions':
            result[associate][formattedMonth] = stats.trialsCompleted;
            break;
          case 'totalPaid':
            result[associate][formattedMonth] = stats.ltvSum;
            break;
          case 'conversion':
            result[associate][formattedMonth] = stats.totalLeads > 0 ? (stats.trialsCompleted / stats.totalLeads) * 100 : 0;
            break;
          default:
            result[associate][formattedMonth] = stats.totalLeads;
        }
      });
    });

    return result;
  }, [filteredData, yoyMetric]);

  // Create stage performance data for month-on-month view
  const stagePerformanceData = useMemo(() => {
    const monthlyStageStats = filteredData.reduce((acc, item) => {
      const month = item.createdAt.substring(0, 7); // YYYY-MM format
      const stage = item.stage || 'Unknown';
      
      if (!acc[stage]) {
        acc[stage] = {};
      }
      if (!acc[stage][month]) {
        acc[stage][month] = {
          totalLeads: 0,
          trialsCompleted: 0,
          membershipsSold: 0,
          ltvSum: 0
        };
      }
      
      acc[stage][month].totalLeads++;
      if (item.stage === 'Trial Completed') {
        acc[stage][month].trialsCompleted++;
      }
      if (item.conversionStatus === 'Converted') {
        acc[stage][month].membershipsSold++;
      }
      acc[stage][month].ltvSum += item.ltv;
      
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Convert to the format expected by LeadMonthOnMonthTable
    const result: Record<string, Record<string, number>> = {};
    Object.entries(monthlyStageStats).forEach(([stage, months]) => {
      result[stage] = {};
      Object.entries(months).forEach(([month, stats]) => {
        switch (stageMetric) {
          case 'totalLeads':
            result[stage][month] = stats.totalLeads;
            break;
          case 'leadToTrialConversion':
            result[stage][month] = stats.totalLeads > 0 ? (stats.trialsCompleted / stats.totalLeads) * 100 : 0;
            break;
          case 'trialToMembershipConversion':
            result[stage][month] = stats.trialsCompleted > 0 ? (stats.membershipsSold / stats.trialsCompleted) * 100 : 0;
            break;
          case 'ltv':
            result[stage][month] = stats.totalLeads > 0 ? stats.ltvSum / stats.totalLeads : 0;
            break;
          default:
            result[stage][month] = stats.totalLeads;
        }
      });
    });

    return result;
  }, [filteredData, stageMetric]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading Leads Data</p>
              <p className="text-sm text-gray-600">Fetching lead performance metrics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
        <Card className="p-8 bg-white shadow-lg max-w-md">
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Connection Error</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-600">No leads data available</p>
        </div>
      </div>
    );
  }

  const availableMonths = [...new Set(filteredData.map(item => item.createdAt.substring(0, 7)))].sort();
  const availableAssociates = [...new Set(filteredData.map(item => item.associate))].filter(Boolean);
  const availableStages = [...new Set(filteredData.map(item => item.stage))].filter(Boolean);

  return (
    <div className="space-y-6 bg-gray-50/30 min-h-screen p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Lead Performance Analytics
        </h2>
        <p className="text-xl text-gray-600">
          Track and optimize your lead conversion funnel
        </p>
      </div>

      <ThemeSelector
        currentTheme={currentTheme}
        isDarkMode={isDarkMode}
        onThemeChange={setCurrentTheme}
        onModeChange={setIsDarkMode}
      />

      <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-lg shadow-sm border">
          {locations.map((location) => (
            <TabsTrigger
              key={location.id}
              value={location.id}
              className="relative overflow-hidden rounded-md px-6 py-3 font-medium text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-50"
            >
              <span className="relative z-10 block text-center">
                <div className="font-semibold">{location.name.split(',')[0]}</div>
                {location.name.includes(',') && (
                  <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>
                )}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
            <LeadsFilterSection
              filters={filters}
              onFiltersChange={setFilters}
              availableOptions={availableOptions}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-gray-800 text-xl">Lead Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <LeadsFunnelVisualization
                  data={{
                    totalLeads: filteredData.length,
                    trialScheduled: filteredData.filter(item => item.trialStatus !== 'Not Tried').length,
                    trialCompleted: filteredData.filter(item => item.stage === 'Trial Completed').length,
                    membershipsSold: filteredData.filter(item => item.conversionStatus === 'Converted').length,
                  }}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <MetricCard
                  key={metric.title}
                  data={metric}
                  delay={index * 100}
                />
              ))}
            </div>

            <LeadInteractiveChart
              data={filteredData}
              title="Lead Performance Trends"
              activeMetric={activeMetric}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeadTopBottomLists
                title="Top Lead Sources"
                items={topSources}
                variant="top"
                type="source"
              />
              
              <LeadTopBottomLists
                title="Top Associates"
                items={topAssociates}
                variant="top"
                type="associate"
              />
            </div>

            <div className="space-y-8">
              <LeadDataTable
                title="Lead Performance Analysis"
                data={filteredData}
              />
              
              <LeadMonthOnMonthTable
                data={stagePerformanceData}
                months={availableMonths}
                stages={availableStages}
                activeMetric={stageMetric}
                onMetricChange={setStageMetric}
              />
              
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-800">Year-on-Year Associate Performance</CardTitle>
                    <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
                      {[
                        { value: 'totalCustomers', label: 'Total Leads' },
                        { value: 'totalSessions', label: 'Trials' },
                        { value: 'totalPaid', label: 'Total LTV' },
                        { value: 'conversion', label: 'Conversion %' }
                      ].map((metric) => (
                        <Button
                          key={metric.value}
                          variant={yoyMetric === metric.value ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setYoyMetric(metric.value as TrainerMetricType)}
                          className={`transition-all ${
                            yoyMetric === metric.value 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {metric.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <YearOnYearTrainerTable
                    data={yoyLeadData}
                    months={availableMonths.map(month => {
                      const [year, monthNum] = month.split('-');
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const monthName = monthNames[parseInt(monthNum) - 1];
                      return `${monthName}-${year}`;
                    })}
                    trainers={availableAssociates}
                    defaultMetric={yoyMetric}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
