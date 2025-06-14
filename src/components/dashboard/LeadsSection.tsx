
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
    }));
  }, [filteredData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading leads data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Tabs */}
      <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
        <TabsList className="grid w-full grid-cols-auto">
          <TabsTrigger value="all">All Locations</TabsTrigger>
          {availableOptions.locations.map((location) => (
            <TabsTrigger key={location} value={location}>
              {location}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <LeadsFilterSection
        filters={filters}
        onFiltersChange={setFilters}
        availableOptions={availableOptions}
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
      />

      {/* Funnel Visualization */}
      <LeadsFunnelVisualization
        data={{
          totalLeads: metrics.totalLeads,
          trialScheduled: metrics.trialScheduled,
          trialCompleted: metrics.trialCompleted,
          membershipsSold: metrics.membershipsSold,
        }}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Top/Bottom Lists and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopBottomTrainerList
          title="Top Lead Sources"
          trainers={topSources}
          variant="top"
        />
        <TopBottomTrainerList
          title="Top Associates"
          trainers={topAssociates}
          variant="top"
        />
        <div className="space-y-4">
          <Select value={activeMetric} onValueChange={(value: LeadsMetricType) => setActiveMetric(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalLeads">Total Leads</SelectItem>
              <SelectItem value="leadToTrialConversion">Lead to Trial</SelectItem>
              <SelectItem value="trialToMembershipConversion">Trial to Membership</SelectItem>
              <SelectItem value="ltv">Average LTV</SelectItem>
            </SelectContent>
          </Select>
          <InteractiveChart
            data={chartData}
            title="Leads Trend"
            type="revenue"
          />
        </div>
      </div>

      {/* Data Tables */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={tableData}
              title="All Leads Data"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
