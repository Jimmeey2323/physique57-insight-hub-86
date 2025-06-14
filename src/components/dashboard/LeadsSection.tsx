
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
import { LeadsFilterOptions, LeadsMetricType } from '@/types/leads';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

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

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply location filter
    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => item.center === activeLocation);
    }

    // Apply other filters
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

    if (filters.trialStatus.length > 0) {
      filtered = filtered.filter(item => filters.trialStatus.includes(item.trialStatus));
    }

    if (filters.conversionStatus.length > 0) {
      filtered = filtered.filter(item => filters.conversionStatus.includes(item.conversionStatus));
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
    }

    // LTV range filter
    if (filters.minLTV !== undefined) {
      filtered = filtered.filter(item => item.ltv >= filters.minLTV!);
    }
    if (filters.maxLTV !== undefined) {
      filtered = filtered.filter(item => item.ltv <= filters.maxLTV!);
    }

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

  const metrics = useMemo(() => {
    const totalLeads = filteredData.length;
    const trialScheduled = filteredData.filter(item => item.trialStatus !== 'Not Tried').length;
    const trialCompleted = filteredData.filter(item => item.visits > 0).length;
    const membershipsSold = filteredData.filter(item => item.conversionStatus === 'Converted').length;
    const avgLTV = filteredData.reduce((sum, item) => sum + item.ltv, 0) / totalLeads || 0;
    const leadToTrialRate = totalLeads > 0 ? (trialScheduled / totalLeads) * 100 : 0;
    const trialToMembershipRate = trialCompleted > 0 ? (membershipsSold / trialCompleted) * 100 : 0;

    return {
      totalLeads,
      trialScheduled,
      trialCompleted,
      membershipsSold,
      avgLTV,
      leadToTrialRate,
      trialToMembershipRate,
    };
  }, [filteredData]);

  const chartData = useMemo(() => {
    // Group data by month for trend analysis
    const monthlyData = filteredData.reduce((acc, item) => {
      const month = item.createdAt.substring(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = {
          totalLeads: 0,
          trialScheduled: 0,
          membershipsSold: 0,
          avgLTV: 0,
        };
      }
      acc[month].totalLeads++;
      if (item.trialStatus !== 'Not Tried') acc[month].trialScheduled++;
      if (item.conversionStatus === 'Converted') acc[month].membershipsSold++;
      acc[month].avgLTV += item.ltv;
      return acc;
    }, {} as Record<string, any>);

    // Convert to the format expected by InteractiveChart (simulating SalesData structure)
    return Object.entries(monthlyData).map(([month, data]) => ({
      memberId: month,
      customerName: month,
      customerEmail: '',
      payingMemberId: '',
      transactionDate: month,
      expiryDate: '',
      packageName: '',
      packageAmount: data[activeMetric] || data.totalLeads,
      paymentMode: '',
      createdAt: month,
      trainerName: '',
      trainerImageUrl: '',
      transactionId: '',
      membershipType: '',
      duration: 0,
      sessions: 0,
      packageType: '',
      discount: 0,
      taxAmount: 0,
      totalAmount: data[activeMetric] || data.totalLeads,
      status: '',
      center: '',
      source: '',
      notes: '',
      saleItemId: month,
      paymentCategory: '',
      paymentDate: month,
      paymentValue: data[activeMetric] || data.totalLeads,
      memberName: month,
      trainerTeam: '',
      studiosLocation: '',
      dateOfJoining: month,
      subscriptionStartDate: month,
      subscriptionEndDate: month,
      subscriptionCycle: '',
      totalSessions: 0,
      sessionsCompleted: 0,
      sessionsRemaining: 0,
      avgSessionsPerWeek: 0,
      conversionRate: 0,
      retentionRate: 0
    })).sort((a, b) => a.transactionDate.localeCompare(b.transactionDate));
  }, [filteredData, activeMetric]);

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

  // Create table data in the format expected by DataTable
  const tableData = useMemo(() => {
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
      retentionRate: 0
    }));
  }, [filteredData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <div>
              <p className="text-lg font-semibold text-white">Loading Leads Data</p>
              <p className="text-sm text-white/70">Fetching lead performance metrics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="p-8 bg-white/10 backdrop-blur-xl border border-red-500/30 shadow-2xl max-w-md">
          <CardContent className="text-center space-y-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Connection Error</p>
              <p className="text-sm text-white/70 mt-2">{error}</p>
            </div>
            <Button 
              onClick={refetch} 
              className="gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Lead Performance Analytics
          </h1>
          <p className="text-lg text-white/80">
            Track and optimize your lead conversion funnel
          </p>
        </div>

        {/* Location Tabs */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-6">
            <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
              <TabsList className="grid w-full grid-cols-auto bg-black/20 backdrop-blur-sm border border-white/10">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/70"
                >
                  All Locations
                </TabsTrigger>
                {availableOptions.locations.map((location) => (
                  <TabsTrigger 
                    key={location} 
                    value={location}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/70"
                  >
                    {location}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <LeadsFilterSection
            filters={filters}
            onFiltersChange={setFilters}
            availableOptions={availableOptions}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
        </Card>

        {/* Funnel Visualization */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/10">
            <CardTitle className="text-white text-xl">Lead Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <LeadsFunnelVisualization
              data={{
                totalLeads: metrics.totalLeads,
                trialScheduled: metrics.trialScheduled,
                trialCompleted: metrics.trialCompleted,
                membershipsSold: metrics.membershipsSold,
              }}
            />
          </CardContent>
        </Card>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-400/30 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
            <MetricCard
              data={{
                title: "Total Leads",
                value: formatNumber(metrics.totalLeads),
                change: 0,
                description: "Leads in funnel",
                calculation: "Total lead count",
                icon: "users"
              }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-400/30 shadow-2xl hover:shadow-green-500/25 transition-all duration-300">
            <MetricCard
              data={{
                title: "Lead to Trial Rate",
                value: `${metrics.leadToTrialRate.toFixed(1)}%`,
                change: 0,
                description: "Trial conversion",
                calculation: "Trials scheduled / Total leads",
                icon: "target"
              }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-400/30 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
            <MetricCard
              data={{
                title: "Trial to Membership",
                value: `${metrics.trialToMembershipRate.toFixed(1)}%`,
                change: 0,
                description: "Final conversion",
                calculation: "Memberships sold / Trials completed",
                icon: "credit-card"
              }}
            />
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl border border-orange-400/30 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300">
            <MetricCard
              data={{
                title: "Average LTV",
                value: formatCurrency(metrics.avgLTV),
                change: 0,
                description: "Customer lifetime value",
                calculation: "Total LTV / Converted customers",
                icon: "trending-up"
              }}
            />
          </Card>
        </div>

        {/* Top/Bottom Lists and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-b border-white/10">
              <CardTitle className="text-white">Top Lead Sources</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TopBottomTrainerList
                title="Top Lead Sources"
                trainers={topSources}
                variant="top"
              />
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
              <CardTitle className="text-white">Top Associates</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TopBottomTrainerList
                title="Top Associates"
                trainers={topAssociates}
                variant="top"
              />
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border-b border-white/10">
              <CardTitle className="text-white flex items-center justify-between">
                Leads Trend
                <Select value={activeMetric} onValueChange={(value: LeadsMetricType) => setActiveMetric(value)}>
                  <SelectTrigger className="w-48 bg-black/20 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
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

        {/* Data Tables */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-slate-500/20 to-gray-500/20 border-b border-white/10">
            <CardTitle className="text-white text-xl">Leads Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
              <DataTable
                data={tableData}
                title="All Leads Data"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
