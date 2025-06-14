
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, TrendingUp, Target, Clock, DollarSign, Filter } from 'lucide-react';
import { useNewClientData } from '@/hooks/useNewClientData';
import { calculateNewClientMetrics, getTopBottomTrainers } from '@/utils/newClientMetrics';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { DataTable } from './DataTable';
import { DrillDownModal } from './DrillDownModal';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientFilterOptions, NewClientData } from '@/types/dashboard';

export const NewClientSection = () => {
  const { data, loading, error } = useNewClientData();
  const [activeMetric, setActiveMetric] = useState('newMembers');
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topBottomCriterion, setTopBottomCriterion] = useState('newMembers');
  const [filters, setFilters] = useState<NewClientFilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    homeLocation: [],
    trainer: [],
    paymentMethod: [],
    retentionStatus: [],
    conversionStatus: [],
    isNew: [],
    minLTV: undefined,
    maxLTV: undefined,
  });

  console.log('NewClientSection - Raw data:', data?.length || 0, 'records');

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter(client => {
      // Apply filters
      if (filters.location.length > 0 && !filters.location.includes(client.firstVisitLocation)) return false;
      if (filters.homeLocation.length > 0 && !filters.homeLocation.includes(client.homeLocation)) return false;
      if (filters.trainer.length > 0 && !filters.trainer.includes(client.trainerName)) return false;
      if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(client.paymentMethod)) return false;
      if (filters.retentionStatus.length > 0 && !filters.retentionStatus.includes(client.retentionStatus)) return false;
      if (filters.conversionStatus.length > 0 && !filters.conversionStatus.includes(client.conversionStatus)) return false;
      if (filters.isNew.length > 0 && !filters.isNew.some(status => client.isNew.includes(status))) return false;
      if (filters.minLTV !== undefined && client.ltv < filters.minLTV) return false;
      if (filters.maxLTV !== undefined && client.ltv > filters.maxLTV) return false;
      
      return true;
    });
  }, [data, filters]);

  const metrics = useMemo(() => {
    if (!filteredData.length) return [];
    return calculateNewClientMetrics(filteredData);
  }, [filteredData]);

  const overallMetrics = useMemo(() => {
    if (!metrics.length) return null;

    const totals = metrics.reduce((acc, metric) => ({
      totalNewMembers: acc.totalNewMembers + metric.newMembers,
      totalRetainedMembers: acc.totalRetainedMembers + metric.retainedMembers,
      totalConvertedMembers: acc.totalConvertedMembers + metric.convertedMembers,
      totalMembers: acc.totalMembers + metric.totalMembers,
      totalLtv: acc.totalLtv + metric.totalLtv,
      totalConversionSpan: acc.totalConversionSpan + metric.totalConversionSpan,
      conversionSpanCount: acc.conversionSpanCount + metric.conversionSpanCount,
    }), {
      totalNewMembers: 0,
      totalRetainedMembers: 0,
      totalConvertedMembers: 0,
      totalMembers: 0,
      totalLtv: 0,
      totalConversionSpan: 0,
      conversionSpanCount: 0,
    });

    return {
      ...totals,
      retentionRate: totals.totalMembers > 0 ? (totals.totalRetainedMembers / totals.totalMembers) * 100 : 0,
      conversionRate: totals.totalMembers > 0 ? (totals.totalConvertedMembers / totals.totalMembers) * 100 : 0,
      averageLtv: totals.totalMembers > 0 ? totals.totalLtv / totals.totalMembers : 0,
      averageConversionSpan: totals.conversionSpanCount > 0 ? totals.totalConversionSpan / totals.conversionSpanCount : 0,
    };
  }, [metrics]);

  const topBottomTrainers = useMemo(() => {
    if (!metrics.length) return { top: [], bottom: [] };
    return getTopBottomTrainers(metrics, topBottomCriterion);
  }, [metrics, topBottomCriterion]);

  const handleMetricCardClick = (metric: string) => {
    const relatedData = filteredData.filter(client => {
      switch (metric) {
        case 'newMembers':
          return client.isNew.includes('New');
        case 'retainedMembers':
          return client.retentionStatus === 'Retained';
        case 'convertedMembers':
          return client.conversionStatus === 'Converted';
        default:
          return true;
      }
    });

    setDrillDownData(relatedData);
    setIsModalOpen(true);
  };

  const handleTrainerDrillDown = (trainerName: string) => {
    const trainerData = filteredData.filter(client => client.trainerName === trainerName);
    setDrillDownData(trainerData);
    setSelectedTrainer(trainerName);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading new client data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error loading new client data: {error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-600">No new client data available</p>
        </div>
      </div>
    );
  }

  const getUniqueValues = (field: keyof NewClientData) => {
    return [...new Set(data.map(item => item[field]).filter(Boolean))].sort();
  };

  const metricCards = [
    {
      title: 'Total New Members',
      value: formatNumber(overallMetrics?.totalNewMembers || 0),
      change: 0,
      description: 'Total number of new members acquired',
      calculation: 'Count of members with "New" status',
      icon: 'members',
    },
    {
      title: 'Retention Rate',
      value: `${(overallMetrics?.retentionRate || 0).toFixed(1)}%`,
      change: 0,
      description: 'Percentage of members retained',
      calculation: '(Retained Members / Total Members) × 100',
      icon: 'revenue',
    },
    {
      title: 'Conversion Rate',
      value: `${(overallMetrics?.conversionRate || 0).toFixed(1)}%`,
      change: 0,
      description: 'Percentage of members converted',
      calculation: '(Converted Members / Total Members) × 100',
      icon: 'transactions',
    },
    {
      title: 'Average LTV',
      value: formatCurrency(overallMetrics?.averageLtv || 0),
      change: 0,
      description: 'Average lifetime value per customer',
      calculation: 'Total LTV / Total Members',
      icon: 'revenue',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            New Client Analytics
          </h2>
          <p className="text-slate-600 mt-1">
            Track client acquisition, retention, and conversion metrics
          </p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          {formatNumber(filteredData.length)} Total Records
        </Badge>
      </div>

      {/* Filter Section */}
      <AutoCloseFilterSection title="New Client Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Visit Location</label>
            <Select 
              value={filters.location[0] || ''} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, location: value ? [value] : [] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All locations</SelectItem>
                {getUniqueValues('firstVisitLocation').map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Trainer</label>
            <Select 
              value={filters.trainer[0] || ''} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, trainer: value ? [value] : [] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All trainers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All trainers</SelectItem>
                {getUniqueValues('trainerName').map(trainer => (
                  <SelectItem key={trainer} value={trainer}>{trainer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Retention Status</label>
            <Select 
              value={filters.retentionStatus[0] || ''} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, retentionStatus: value ? [value] : [] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {getUniqueValues('retentionStatus').map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Conversion Status</label>
            <Select 
              value={filters.conversionStatus[0] || ''} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, conversionStatus: value ? [value] : [] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {getUniqueValues('conversionStatus').map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </AutoCloseFilterSection>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <MetricCard
            key={card.title}
            data={card}
            delay={index * 150}
            onClick={() => handleMetricCardClick(card.title.toLowerCase().replace(/\s+/g, ''))}
          />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          title="Client Conversion Trends"
          data={filteredData}
          type="conversion"
        />
        <InteractiveChart
          title="Retention Analytics"
          data={filteredData}
          type="retention"
        />
      </div>

      {/* Trainer Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trainer Performance Summary</CardTitle>
            <div className="flex gap-2">
              <Select value={activeMetric} onValueChange={setActiveMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newMembers">New Members</SelectItem>
                  <SelectItem value="retentionRate">Retention Rate</SelectItem>
                  <SelectItem value="conversionRate">Conversion Rate</SelectItem>
                  <SelectItem value="averageLtv">Average LTV</SelectItem>
                  <SelectItem value="averageConversionSpan">Avg Conversion Span</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={metrics}
            columns={[
              { key: 'monthYear', title: 'Month' },
              { key: 'trainerName', title: 'Trainer' },
              { key: 'newMembers', title: 'New Members' },
              { key: 'retainedMembers', title: 'Retained' },
              { key: 'retentionPercentage', title: 'Retention %', format: (val) => `${val.toFixed(1)}%` },
              { key: 'convertedMembers', title: 'Converted' },
              { key: 'conversionPercentage', title: 'Conversion %', format: (val) => `${val.toFixed(1)}%` },
              { key: 'averageLtv', title: 'Avg LTV', format: formatCurrency },
              { key: 'averageConversionSpan', title: 'Avg Conv. Span', format: (val) => `${val.toFixed(0)} days` },
            ]}
            onRowClick={(row) => handleTrainerDrillDown(row.trainerName)}
            sortable
            showTotals
          />
        </CardContent>
      </Card>

      {/* Top/Bottom Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Top Performers
              </CardTitle>
              <Select value={topBottomCriterion} onValueChange={setTopBottomCriterion}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newMembers">New Members</SelectItem>
                  <SelectItem value="retentionRate">Retention Rate</SelectItem>
                  <SelectItem value="conversionRate">Conversion Rate</SelectItem>
                  <SelectItem value="ltv">Average LTV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBottomTrainers.top.map((trainer, index) => (
                <div
                  key={trainer.trainerName}
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleTrainerDrillDown(trainer.trainerName)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{trainer.trainerName}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-700">
                      {topBottomCriterion === 'ltv' ? formatCurrency(trainer.averageLtv) : 
                       topBottomCriterion.includes('Rate') ? `${trainer[`average${topBottomCriterion.charAt(0).toUpperCase() + topBottomCriterion.slice(1)}`].toFixed(1)}%` :
                       formatNumber(trainer[`total${topBottomCriterion.charAt(0).toUpperCase() + topBottomCriterion.slice(1)}`])}
                    </div>
                    <div className="text-xs text-green-600">
                      {trainer.totalMembers} total members
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Improvement Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBottomTrainers.bottom.map((trainer, index) => (
                <div
                  key={trainer.trainerName}
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleTrainerDrillDown(trainer.trainerName)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{trainer.trainerName}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-700">
                      {topBottomCriterion === 'ltv' ? formatCurrency(trainer.averageLtv) : 
                       topBottomCriterion.includes('Rate') ? `${trainer[`average${topBottomCriterion.charAt(0).toUpperCase() + topBottomCriterion.slice(1)}`].toFixed(1)}%` :
                       formatNumber(trainer[`total${topBottomCriterion.charAt(0).toUpperCase() + topBottomCriterion.slice(1)}`])}
                    </div>
                    <div className="text-xs text-orange-600">
                      {trainer.totalMembers} total members
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drill Down Modal */}
      <DrillDownModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrainer(null);
        }}
        title={selectedTrainer ? `${selectedTrainer} - Client Details` : 'Client Details'}
        data={drillDownData}
        columns={[
          { key: 'firstName', title: 'First Name' },
          { key: 'lastName', title: 'Last Name' },
          { key: 'email', title: 'Email' },
          { key: 'firstVisitDate', title: 'First Visit' },
          { key: 'firstVisitLocation', title: 'Location' },
          { key: 'trainerName', title: 'Trainer' },
          { key: 'retentionStatus', title: 'Retention' },
          { key: 'conversionStatus', title: 'Conversion' },
          { key: 'ltv', title: 'LTV', format: formatCurrency },
          { key: 'conversionSpan', title: 'Conv. Span', format: (val) => `${val} days` },
        ]}
      />
    </div>
  );
};
