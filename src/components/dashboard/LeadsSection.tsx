
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, Users, Target, TrendingUp, CreditCard, Phone, Mail } from 'lucide-react';
import { useLeadsData } from '@/hooks/useLeadsData';
import { LeadsFilterSection } from './LeadsFilterSection';
import { LeadsFunnelVisualization } from './LeadsFunnelVisualization';
import { MetricCard } from './MetricCard';
import { TopBottomTrainerList } from './TopBottomTrainerList';
import { InteractiveChart } from './InteractiveChart';
import { DataTable } from './DataTable';
import { ThemeSelector } from './ThemeSelector';
import { YearOnYearTrainerTable } from './YearOnYearTrainerTable';
import { MonthOnMonthTrainerTable } from './MonthOnMonthTrainerTable';
import { LeadsFilterOptions, LeadsMetricType } from '@/types/leads';
import { MetricCardData, SalesData, TrainerMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

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
  const [yoyMetric, setYoyMetric] = useState<TrainerMetricType>('totalCustomers');
  const [stageMetric, setStageMetric] = useState<LeadsMetricType>('totalLeads');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);

  console.log('Raw leads data:', data);
  console.log('Active location:', activeLocation);
  console.log('Applied filters:', filters);

  const filteredData = useMemo(() => {
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
    const locations = [...new Set(data.map(item => item.center))].filter(Boolean);
    const sources = [...new Set(data.map(item => item.source))].filter(Boolean);
    const stages = [...new Set(data.map(item => item.stage))].filter(Boolean);
    const statuses = [...new Set(data.map(item => item.status))].filter(Boolean);
    const associates = [...new Set(data.map(item => item.associate))].filter(Boolean);
    const channels = [...new Set(data.map(item => item.channel))].filter(Boolean);
    const trialStatuses = [...new Set(data.map(item => item.trialStatus))].filter(Boolean);
    const conversionStatuses = [...new Set(data.map(item => item.conversionStatus))].filter(Boolean);
    const retentionStatuses = [...new Set(data.map(item => item.retentionStatus))].filter(Boolean);

    console.log('Available options:', {
      locations, sources, stages, statuses, associates, channels, 
      trialStatuses, conversionStatuses, retentionStatuses
    });

    return {
      locations,
      sources,
      stages,
      statuses,
      associates,
      channels,
      trialStatuses,
      conversionStatuses,
      retentionStatuses,
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

  // Create chart data with complete SalesData structure
  const chartData = useMemo((): SalesData[] => {
    const monthlyData = filteredData.reduce((acc, item) => {
      const month = item.createdAt.substring(0, 7);
      if (!acc[month]) {
        acc[month] = {
          totalLeads: 0,
          trialsCompleted: 0,
          membershipsSold: 0,
          avgLTV: 0,
        };
      }
      acc[month].totalLeads++;
      if (item.stage === 'Trial Completed') acc[month].trialsCompleted++;
      if (item.conversionStatus === 'Converted') acc[month].membershipsSold++;
      acc[month].avgLTV += item.ltv;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(monthlyData).map(([month, data]) => ({
      memberId: month,
      customerName: month,
      customerEmail: '',
      payingMemberId: '',
      transactionDate: month,
      expiryDate: '',
      packageName: 'Lead Generation',
      packageAmount: data[activeMetric] || data.totalLeads,
      paymentMode: 'Lead Source',
      createdAt: month,
      trainerName: '',
      trainerImageUrl: '',
      transactionId: month,
      membershipType: '',
      duration: 0,
      sessions: 0,
      packageType: 'Lead',
      discount: 0,
      taxAmount: 0,
      totalAmount: data[activeMetric] || data.totalLeads,
      status: 'Active',
      center: activeLocation,
      source: 'Lead Funnel',
      notes: '',
      saleItemId: month,
      paymentCategory: 'Leads',
      paymentDate: month,
      paymentValue: data[activeMetric] || data.totalLeads,
      memberName: month,
      trainerTeam: '',
      studiosLocation: activeLocation,
      dateOfJoining: month,
      subscriptionStartDate: month,
      subscriptionEndDate: month,
      subscriptionCycle: '',
      totalSessions: 0,
      sessionsCompleted: 0,
      sessionsRemaining: 0,
      avgSessionsPerWeek: 0,
      conversionRate: 0,
      retentionRate: 0,
      paidInMoneyCredits: 0,
      paymentVAT: 0,
      paymentItem: 'Lead',
      paymentStatus: 'Succeeded',
      soldBy: '',
      calculatedLocation: activeLocation,
      cleanedCategory: 'Leads',
      cleanedName: 'Lead Generation',
      // Add missing required properties
      paymentMethod: 'Lead Source',
      paymentTransactionId: month,
      stripeToken: '',
      saleReference: month,
      cleanedProduct: 'Lead Generation'
    })).sort((a, b) => a.transactionDate.localeCompare(b.transactionDate));
  }, [filteredData, activeMetric, activeLocation]);

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

    console.log('Source stats:', sourceStats);

    return Object.entries(sourceStats)
      .map(([source, stats]) => ({
        name: source,
        value: stats.leads,
        extra: `${((stats.conversions / stats.leads) * 100).toFixed(1)}%`,
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
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  // Create table data with complete SalesData structure
  const tableData = useMemo((): SalesData[] => {
    console.log('Creating table data from filtered data:', filteredData.length);
    
    return filteredData.map(item => ({
      memberId: item.id,
      customerName: item.fullName,
      customerEmail: item.email,
      payingMemberId: item.phone,
      transactionDate: item.createdAt,
      expiryDate: item.convertedToCustomerAt,
      packageName: item.source,
      packageAmount: item.ltv,
      paymentMode: item.stage,
      createdAt: item.createdAt,
      trainerName: item.associate,
      trainerImageUrl: '',
      transactionId: item.id,
      membershipType: item.status,
      duration: item.visits,
      sessions: item.purchasesMade,
      packageType: item.classType,
      discount: 0,
      taxAmount: 0,
      totalAmount: item.ltv,
      status: item.conversionStatus,
      center: item.center,
      source: item.source,
      notes: item.remarks,
      saleItemId: item.id,
      paymentCategory: item.source,
      paymentDate: item.createdAt,
      paymentValue: item.ltv,
      memberName: item.fullName,
      trainerTeam: item.associate,
      studiosLocation: item.center,
      dateOfJoining: item.createdAt,
      subscriptionStartDate: item.createdAt,
      subscriptionEndDate: item.convertedToCustomerAt,
      subscriptionCycle: '',
      totalSessions: item.visits,
      sessionsCompleted: item.visits,
      sessionsRemaining: 0,
      avgSessionsPerWeek: 0,
      conversionRate: 0,
      retentionRate: 0,
      paidInMoneyCredits: 0,
      paymentVAT: 0,
      paymentItem: item.source,
      paymentStatus: 'Succeeded',
      soldBy: item.associate,
      calculatedLocation: item.center,
      cleanedCategory: item.source,
      cleanedName: item.fullName,
      // Add missing required properties
      paymentMethod: item.stage,
      paymentTransactionId: item.id,
      stripeToken: '',
      saleReference: item.id,
      cleanedProduct: item.source
    }));
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
          avgLTV: 0,
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
      acc[associate][month].avgLTV = acc[associate][month].ltvSum / acc[associate][month].totalLeads;
      
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

    console.log('YoY lead data:', result);
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
          avgLTV: 0,
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
      acc[stage][month].avgLTV = acc[stage][month].ltvSum / acc[stage][month].totalLeads;
      
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Convert to the format expected by MonthOnMonthTrainerTable
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
            result[stage][month] = stats.avgLTV;
            break;
          default:
            result[stage][month] = stats.totalLeads;
        }
      });
    });

    console.log('Stage performance data:', result);
    return result;
  }, [filteredData, stageMetric]);

  const resetFilters = () => {
    setFilters({
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
  };

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
                    totalLeads: metrics.find(m => m.title === "Total Leads")?.value.replace(/,/g, '') ? parseInt(metrics.find(m => m.title === "Total Leads")!.value.replace(/,/g, '')) : 0,
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-800">Top Lead Sources</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <TopBottomTrainerList
                    title="Top Lead Sources"
                    trainers={topSources}
                    variant="top"
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-800">Top Associates</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <TopBottomTrainerList
                    title="Top Associates"
                    trainers={topAssociates}
                    variant="top"
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-800 flex items-center justify-between">
                    Leads Trend
                    <Select value={activeMetric} onValueChange={(value: LeadsMetricType) => setActiveMetric(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="totalLeads">Total Leads</SelectItem>
                        <SelectItem value="leadToTrialConversion">Lead to Trial</SelectItem>
                        <SelectItem value="trialToMembershipConversion">Trial to Membership</SelectItem>
                        <SelectItem value="ltv">Average LTV</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <InteractiveChart
                    data={chartData}
                    title="Leads Trend"
                    type="revenue"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <DataTable
                title="Lead Source Performance Analysis"
                data={tableData}
                type="product"
                filters={{
                  dateRange: filters.dateRange,
                  location: [],
                  category: [],
                  product: [],
                  soldBy: [],
                  paymentMethod: []
                }}
              />
              
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-800">Stage Performance Breakdown</CardTitle>
                    <Select value={stageMetric} onValueChange={(value: LeadsMetricType) => setStageMetric(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="totalLeads">Total Leads</SelectItem>
                        <SelectItem value="leadToTrialConversion">Lead to Trial Rate</SelectItem>
                        <SelectItem value="trialToMembershipConversion">Trial to Membership Rate</SelectItem>
                        <SelectItem value="ltv">Average LTV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <MonthOnMonthTrainerTable
                    data={stagePerformanceData}
                    months={availableMonths}
                    trainers={availableStages}
                    defaultMetric={stageMetric as TrainerMetricType}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-800">Year-on-Year Associate Performance</CardTitle>
                    <Select value={yoyMetric} onValueChange={(value: TrainerMetricType) => setYoyMetric(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="totalCustomers">Total Leads</SelectItem>
                        <SelectItem value="totalSessions">Trials Completed</SelectItem>
                        <SelectItem value="totalPaid">Total LTV</SelectItem>
                        <SelectItem value="conversion">Lead to Trial Rate</SelectItem>
                      </SelectContent>
                    </Select>
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
              
              <DataTable
                title="Month-on-Month Performance Matrix"
                data={tableData}
                type="monthly"
                filters={{
                  dateRange: filters.dateRange,
                  location: [],
                  category: [],
                  product: [],
                  soldBy: [],
                  paymentMethod: []
                }}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
