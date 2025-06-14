
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Target } from 'lucide-react';
import { useNewClientData } from '@/hooks/useNewClientData';
import { calculateNewClientMetrics, getTopBottomTrainers } from '@/utils/newClientMetrics';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { NewClientFilterSection } from './NewClientFilterSection';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientFilterOptions, NewClientData } from '@/types/dashboard';

export const NewClientSection = () => {
  const { data, loading, error } = useNewClientData();
  const [activeMetric, setActiveMetric] = useState('newMembers');
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
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
      if (filters.location.length > 0 && !filters.location.includes(String(client.firstVisitLocation))) return false;
      if (filters.homeLocation.length > 0 && !filters.homeLocation.includes(String(client.homeLocation))) return false;
      if (filters.trainer.length > 0 && !filters.trainer.includes(String(client.trainerName))) return false;
      if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(String(client.paymentMethod))) return false;
      if (filters.retentionStatus.length > 0 && !filters.retentionStatus.includes(String(client.retentionStatus))) return false;
      if (filters.conversionStatus.length > 0 && !filters.conversionStatus.includes(String(client.conversionStatus))) return false;
      if (filters.isNew.length > 0 && !filters.isNew.some(status => String(client.isNew).includes(status))) return false;
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
      <NewClientFilterSection 
        filters={filters}
        onFiltersChange={setFilters}
        data={data}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <MetricCard
            key={card.title}
            data={card}
            delay={index * 150}
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

      {/* Trainer Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Trainer Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Month</th>
                    <th className="text-left p-2">Trainer</th>
                    <th className="text-left p-2">New Members</th>
                    <th className="text-left p-2">Retained</th>
                    <th className="text-left p-2">Retention %</th>
                    <th className="text-left p-2">Converted</th>
                    <th className="text-left p-2">Conversion %</th>
                    <th className="text-left p-2">Avg LTV</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-2">{metric.monthYear}</td>
                      <td className="p-2">{metric.trainerName}</td>
                      <td className="p-2">{metric.newMembers}</td>
                      <td className="p-2">{metric.retainedMembers}</td>
                      <td className="p-2">{metric.retentionPercentage.toFixed(1)}%</td>
                      <td className="p-2">{metric.convertedMembers}</td>
                      <td className="p-2">{metric.conversionPercentage.toFixed(1)}%</td>
                      <td className="p-2">{formatCurrency(metric.averageLtv)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600">No trainer performance data available</p>
          )}
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
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
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
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
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
    </div>
  );
};
