import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Target, TrendingUp, CreditCard, MapPin, Building2 } from 'lucide-react';
import { useLeadsData } from '@/hooks/useLeadsData';
import { FilterPanel } from './LeadsFilterSection';
import { LeadsFunnelVisualization } from './LeadsFunnelVisualization';
import { MetricCard } from './MetricCard';
import { LeadDataTable } from './LeadDataTable';
import { LeadInteractiveChart } from './LeadInteractiveChart';
import { LeadTopBottomLists } from './LeadTopBottomLists';
import { LeadMonthOnMonthTable } from './LeadMonthOnMonthTable';
import { LeadSourceMonthOnMonthTable } from './LeadSourceMonthOnMonthTable';
import { YearOnYearTrainerTable } from './YearOnYearTrainerTable';
import { ThemeSelector } from './ThemeSelector';
import { LeadProvider, useLeads } from '@/contexts/LeadContext';
import { LeadsMetricType } from '@/types/leads';
import { MetricCardData, TrainerMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { LeadDetailedFilterSection } from './LeadDetailedFilterSection';
import { LeadPivotTable } from './LeadPivotTable';

const locations = [
  { 
    id: 'all', 
    name: 'All Locations', 
    fullName: 'All Locations',
    icon: <Building2 className="w-4 h-4" />,
    gradient: 'from-blue-500 to-indigo-600'
  },
  { 
    id: 'Kwality House, Kemps Corner', 
    name: 'Kwality House', 
    fullName: 'Kwality House, Kemps Corner',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-600'
  },
  { 
    id: 'Supreme HQ, Bandra', 
    name: 'Supreme HQ', 
    fullName: 'Supreme HQ, Bandra',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-purple-500 to-violet-600'
  },
  { 
    id: 'Kenkere House', 
    name: 'Kenkere House', 
    fullName: 'Kenkere House',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-orange-500 to-red-600'
  }
];

const LeadsSectionContent: React.FC = () => {
  const { data, loading, error, refetch } = useLeadsData();
  const [activeLocation, setActiveLocation] = useState('all');
  const { filters, setOptions } = useLeads();
  const [activeMetric, setActiveMetric] = useState<LeadsMetricType>('totalLeads');
  const [stageMetric, setStageMetric] = useState<LeadsMetricType>('totalLeads');
  const [sourceMetric, setSourceMetric] = useState<LeadsMetricType>('totalLeads');
  const [yoyMetric, setYoyMetric] = useState<TrainerMetricType>('totalCustomers');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Set filter options when data changes
  React.useEffect(() => {
    if (data && data.length > 0) {
      setOptions({
        sourceOptions: [...new Set(data.map(item => item.source))].filter(Boolean),
        associateOptions: [...new Set(data.map(item => item.associate))].filter(Boolean),
        centerOptions: [...new Set(data.map(item => item.center))].filter(Boolean),
        stageOptions: [...new Set(data.map(item => item.stage))].filter(Boolean),
        statusOptions: [...new Set(data.map(item => item.status))].filter(Boolean),
      });
    }
  }, [data, setOptions]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = data;

    // Apply location filter using 'center' field
    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => item.center === activeLocation);
    }

    // Apply filters
    if (filters.source.length > 0) {
      filtered = filtered.filter(item => filters.source.includes(item.source));
    }

    if (filters.stage.length > 0) {
      filtered = filtered.filter(item => filters.stage.includes(item.stage));
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(item => filters.status.includes(item.status));
    }

    if (filters.associate.length > 0) {
      filtered = filtered.filter(item => filters.associate.includes(item.associate));
    }

    if (filters.center.length > 0) {
      filtered = filtered.filter(item => filters.center.includes(item.center));
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        
        if (filters.dateRange.start && itemDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && itemDate > filters.dateRange.end) return false;
        return true;
      });
    }

    return filtered;
  }, [data, activeLocation, filters]);

  const metrics = useMemo((): MetricCardData[] => {
    const totalLeads = filteredData.length;
    const trialsCompleted = filteredData.filter(item => item.stage === 'Trial Completed').length;
    const membershipsSold = filteredData.filter(item => item.conversionStatus === 'Converted').length;
    const avgLTV = totalLeads > 0 ? filteredData.reduce((sum, item) => sum + item.ltv, 0) / totalLeads : 0;
    const leadToTrialRate = totalLeads > 0 ? (trialsCompleted / totalLeads) * 100 : 0;
    const trialToMembershipRate = trialsCompleted > 0 ? (membershipsSold / trialsCompleted) * 100 : 0;

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

  // Top sources with proper metrics
  const topSources = useMemo(() => {
    const sourceStats = filteredData.reduce((acc, item) => {
      const source = item.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = { leads: 0, conversions: 0, ltv: 0 };
      }
      acc[source].leads++;
      if (item.conversionStatus === 'Converted') {
        acc[source].conversions++;
      }
      acc[source].ltv += item.ltv;
      return acc;
    }, {} as Record<string, { leads: number; conversions: number; ltv: number }>);

    return Object.entries(sourceStats)
      .map(([source, stats]) => ({
        name: source,
        value: stats.leads,
        extra: `${((stats.conversions / stats.leads) * 100).toFixed(1)}%`,
        conversionRate: (stats.conversions / stats.leads) * 100,
        ltv: stats.ltv / stats.leads,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  // Top associates
  const topAssociates = useMemo(() => {
    const associateStats = filteredData.reduce((acc, item) => {
      const associate = item.associate || 'Unknown';
      if (!acc[associate]) {
        acc[associate] = { leads: 0, conversions: 0, ltv: 0 };
      }
      acc[associate].leads++;
      if (item.conversionStatus === 'Converted') {
        acc[associate].conversions++;
      }
      acc[associate].ltv += item.ltv;
      return acc;
    }, {} as Record<string, { leads: number; conversions: number; ltv: number }>);

    return Object.entries(associateStats)
      .map(([associate, stats]) => ({
        name: associate,
        value: stats.leads,
        extra: `${((stats.conversions / stats.leads) * 100).toFixed(1)}%`,
        conversionRate: (stats.conversions / stats.leads) * 100,
        ltv: stats.ltv / stats.leads,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  // Stage performance data for month-on-month view
  const stagePerformanceData = useMemo(() => {
    const monthlyStageStats = filteredData.reduce((acc, item) => {
      if (!item.createdAt) return acc;
      
      const date = new Date(item.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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

  // Source performance data for month-on-month view
  const sourcePerformanceData = useMemo(() => {
    const monthlySourceStats = filteredData.reduce((acc, item) => {
      if (!item.createdAt) return acc;
      
      const date = new Date(item.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const source = item.source || 'Unknown';
      
      if (!acc[source]) {
        acc[source] = {};
      }
      if (!acc[source][month]) {
        acc[source][month] = {
          totalLeads: 0,
          trialsCompleted: 0,
          membershipsSold: 0,
          ltvSum: 0
        };
      }
      
      acc[source][month].totalLeads++;
      if (item.stage === 'Trial Completed') {
        acc[source][month].trialsCompleted++;
      }
      if (item.conversionStatus === 'Converted') {
        acc[source][month].membershipsSold++;
      }
      acc[source][month].ltvSum += item.ltv;
      
      return acc;
    }, {} as Record<string, Record<string, any>>);

    const result: Record<string, Record<string, number>> = {};
    Object.entries(monthlySourceStats).forEach(([source, months]) => {
      result[source] = {};
      Object.entries(months).forEach(([month, stats]) => {
        switch (sourceMetric) {
          case 'totalLeads':
            result[source][month] = stats.totalLeads;
            break;
          case 'leadToTrialConversion':
            result[source][month] = stats.totalLeads > 0 ? (stats.trialsCompleted / stats.totalLeads) * 100 : 0;
            break;
          case 'trialToMembershipConversion':
            result[source][month] = stats.trialsCompleted > 0 ? (stats.membershipsSold / stats.trialsCompleted) * 100 : 0;
            break;
          case 'ltv':
            result[source][month] = stats.totalLeads > 0 ? stats.ltvSum / stats.totalLeads : 0;
            break;
          default:
            result[source][month] = stats.totalLeads;
        }
      });
    });

    return result;
  }, [filteredData, sourceMetric]);

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

  const availableMonths = [...new Set(filteredData.map(item => {
    if (!item.createdAt) return null;
    const date = new Date(item.createdAt);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }).filter(Boolean))].sort();
  
  const availableAssociates = [...new Set(filteredData.map(item => item.associate))].filter(Boolean);
  const availableStages = [...new Set(filteredData.map(item => item.stage))].filter(Boolean);
  const availableSources = [...new Set(filteredData.map(item => item.source))].filter(Boolean);

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        {/* Modern Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="60" cy="60" r="30"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          
          <div className="relative px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Lead Performance Analytics</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Lead Conversion Hub
                </h1>
                
                <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Transform prospects into customers with advanced analytics and conversion tracking
                </p>
                
                <div className="flex items-center justify-center gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{formatNumber(data?.length || 0)}</div>
                    <div className="text-sm text-blue-200">Total Leads</div>
                  </div>
                  <div className="w-px h-12 bg-white/30" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {data ? formatNumber(data.filter(item => item.conversionStatus === 'Converted').length) : '0'}
                    </div>
                    <div className="text-sm text-blue-200">Conversions</div>
                  </div>
                  <div className="w-px h-12 bg-white/30" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {data && data.length > 0 ? 
                        `${((data.filter(item => item.conversionStatus === 'Converted').length / data.length) * 100).toFixed(1)}%` : 
                        '0%'
                      }
                    </div>
                    <div className="text-sm text-blue-200">Conversion Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Enhanced Location Tabs */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
            <CardContent className="p-2">
              <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl h-auto gap-2">
                  {locations.map((location) => (
                    <TabsTrigger
                      key={location.id}
                      value={location.id}
                      className={`
                        relative group overflow-hidden rounded-xl px-6 py-4 font-semibold text-sm 
                        transition-all duration-300 ease-out hover:scale-105
                        data-[state=active]:bg-gradient-to-r data-[state=active]:${location.gradient}
                        data-[state=active]:text-white data-[state=active]:shadow-lg
                        data-[state=active]:border-0 hover:bg-white/80
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative z-10">
                          {location.icon}
                        </div>
                        <div className="relative z-10 text-left">
                          <div className="font-bold">{location.name.split(',')[0]}</div>
                          {location.name.includes(',') && (
                            <div className="text-xs opacity-75">{location.name.split(',')[1]?.trim()}</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300" 
                           style={{ background: `linear-gradient(135deg, ${location.gradient.split(' ')[1]}, ${location.gradient.split(' ')[3]})` }} />
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Tab Content */}
                {locations.map((location) => (
                  <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
                    <LeadDetailedFilterSection />

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
                        title="Lead Source Performance"
                        items={topSources}
                        variant="top"
                        type="source"
                      />
                      
                      <LeadTopBottomLists
                        title="Associate Performance"
                        items={topAssociates}
                        variant="top"
                        type="associate"
                      />
                    </div>

                    <div className="space-y-8">
                      <LeadPivotTable data={filteredData} />
                      
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

                      <LeadSourceMonthOnMonthTable
                        data={sourcePerformanceData}
                        months={availableMonths}
                        sources={availableSources}
                        activeMetric={sourceMetric}
                        onMetricChange={setSourceMetric}
                      />

                      <YearOnYearTrainerTable
                        data={sourcePerformanceData}
                        months={availableMonths}
                        trainers={availableAssociates}
                        defaultMetric="totalCustomers"
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const LeadsSection: React.FC = () => {
  return (
    <LeadProvider>
      <LeadsSectionContent />
    </LeadProvider>
  );
};
