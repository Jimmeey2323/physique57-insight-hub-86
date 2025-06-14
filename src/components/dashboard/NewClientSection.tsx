import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Target, BarChart3, Users, UserPlus, MapPin, Building2 } from 'lucide-react';
import { useNewClientData } from '@/hooks/useNewClientData';
import { calculateNewClientMetrics, getTopBottomTrainers } from '@/utils/newClientMetrics';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { NewClientFilterSection } from './NewClientFilterSection';
import { MonthOnMonthTrainerTable } from './MonthOnMonthTrainerTable';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientFilterOptions, NewClientData, TrainerMetricType } from '@/types/dashboard';
import { EnhancedYearOnYearTable } from './EnhancedYearOnYearTable';
import { TrainerDrillDownModal } from './TrainerDrillDownModal';

const locations = [
  { 
    id: 'all', 
    name: 'All Locations', 
    fullName: 'All Locations',
    icon: <Building2 className="w-4 h-4" />,
    gradient: 'from-blue-500 to-indigo-600'
  },
  { 
    id: 'location1', 
    name: 'Downtown', 
    fullName: 'Downtown Location',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-600'
  },
  { 
    id: 'location2', 
    name: 'Uptown', 
    fullName: 'Uptown Location',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-purple-500 to-violet-600'
  },
  { 
    id: 'location3', 
    name: 'Suburb', 
    fullName: 'Suburban Location',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-orange-500 to-red-600'
  }
];

export const NewClientSection = () => {
  const { data, loading, error } = useNewClientData();
  const [activeLocation, setActiveLocation] = useState('all');
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

  // Prepare month-on-month data for tables
  const monthOnMonthData = useMemo(() => {
    if (!metrics.length) return { data: {}, months: [], trainers: [] };

    const trainers = [...new Set(metrics.map(m => m.trainerName))];
    const months = [...new Set(metrics.map(m => m.monthYear))].sort();
    
    const data: Record<string, Record<string, number>> = {};
    
    trainers.forEach(trainer => {
      data[trainer] = {};
      months.forEach(month => {
        const metric = metrics.find(m => m.trainerName === trainer && m.monthYear === month);
        data[trainer][month] = metric?.[activeMetric as keyof typeof metric] || 0;
      });
    });

    return { data, months, trainers };
  }, [metrics, activeMetric]);

  // Retention vs Conversion comparison data
  const retentionVsConversionData = useMemo(() => {
    if (!metrics.length) return [];

    const trainerSummary = metrics.reduce((acc, metric) => {
      const trainer = metric.trainerName;
      if (!acc[trainer]) {
        acc[trainer] = {
          trainerName: trainer,
          totalMembers: 0,
          totalRetained: 0,
          totalConverted: 0,
        };
      }
      acc[trainer].totalMembers += metric.totalMembers;
      acc[trainer].totalRetained += metric.retainedMembers;
      acc[trainer].totalConverted += metric.convertedMembers;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(trainerSummary).map((trainer: any) => ({
      ...trainer,
      retentionRate: trainer.totalMembers > 0 ? (trainer.totalRetained / trainer.totalMembers) * 100 : 0,
      conversionRate: trainer.totalMembers > 0 ? (trainer.totalConverted / trainer.totalMembers) * 100 : 0,
    }));
  }, [metrics]);

  const [selectedTrainerModal, setSelectedTrainerModal] = useState<{
    trainer: string;
    data: any;
  } | null>(null);

  const handleTrainerClick = (trainer: string, data: any) => {
    setSelectedTrainerModal({ trainer, data });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/20">
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="60" cy="60" r="30"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">New Client Analytics</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent">
                Client Success Hub
              </h1>
              
              <p className="text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
                Track client acquisition, retention, and conversion metrics with precision
              </p>
              
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{formatNumber(filteredData.length)}</div>
                  <div className="text-sm text-emerald-200">Total Clients</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {overallMetrics ? `${overallMetrics.retentionRate.toFixed(1)}%` : '0%'}
                  </div>
                  <div className="text-sm text-emerald-200">Retention Rate</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {overallMetrics ? formatCurrency(overallMetrics.averageLtv) : '$0'}
                  </div>
                  <div className="text-sm text-emerald-200">Average LTV</div>
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
                        <div className="font-bold">{location.name}</div>
                        <div className="text-xs opacity-75">{location.fullName}</div>
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              {locations.map((location) => (
                <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
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

                  {/* Enhanced Month-on-Month and Year-on-Year Tables */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Performance Tables
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Metric Selection */}
                        <div className="flex items-center gap-4">
                          <label className="text-sm font-medium">Metric:</label>
                          <Select value={activeMetric} onValueChange={setActiveMetric}>
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="newMembers">New Members</SelectItem>
                              <SelectItem value="retainedMembers">Retained Members</SelectItem>
                              <SelectItem value="convertedMembers">Converted Members</SelectItem>
                              <SelectItem value="retentionPercentage">Retention %</SelectItem>
                              <SelectItem value="conversionPercentage">Conversion %</SelectItem>
                              <SelectItem value="averageLtv">Average LTV</SelectItem>
                              <SelectItem value="averageConversionSpan">Avg Conversion Span</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Tabs defaultValue="month-on-month" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="month-on-month">Month on Month</TabsTrigger>
                            <TabsTrigger value="year-on-year">Year on Year</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="month-on-month" className="space-y-4">
                            <MonthOnMonthTrainerTable
                              data={monthOnMonthData.data}
                              months={monthOnMonthData.months}
                              trainers={monthOnMonthData.trainers}
                              defaultMetric={activeMetric as TrainerMetricType}
                            />
                          </TabsContent>
                          
                          <TabsContent value="year-on-year" className="space-y-4">
                            <EnhancedYearOnYearTable
                              data={monthOnMonthData.data}
                              months={monthOnMonthData.months}
                              trainers={monthOnMonthData.trainers}
                              activeMetric={activeMetric}
                              onTrainerClick={handleTrainerClick}
                            />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Retention vs Conversion Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Retention vs Conversion Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {retentionVsConversionData.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                                  <th className="text-left p-3 font-bold text-slate-700">Trainer</th>
                                  <th className="text-center p-3 font-bold text-slate-700">Total Members</th>
                                  <th className="text-center p-3 font-bold text-purple-700">Retention Rate</th>
                                  <th className="text-center p-3 font-bold text-blue-700">Conversion Rate</th>
                                  <th className="text-center p-3 font-bold text-slate-700">Performance Score</th>
                                  <th className="text-center p-3 font-bold text-slate-700">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {retentionVsConversionData
                                  .sort((a, b) => (b.retentionRate + b.conversionRate) - (a.retentionRate + a.conversionRate))
                                  .map((trainer, index) => {
                                    const performanceScore = (trainer.retentionRate + trainer.conversionRate) / 2;
                                    const isTopPerformer = performanceScore >= 70;
                                    const isGoodPerformer = performanceScore >= 50;
                                    
                                    return (
                                      <tr key={trainer.trainerName} className="border-b hover:bg-slate-50/50 transition-colors">
                                        <td className="p-3 font-medium text-slate-800">{trainer.trainerName}</td>
                                        <td className="p-3 text-center font-mono">{formatNumber(trainer.totalMembers)}</td>
                                        <td className="p-3 text-center">
                                          <div className="flex items-center justify-center gap-2">
                                            <span className="font-bold text-purple-700">{trainer.retentionRate.toFixed(1)}%</span>
                                            <div className="w-16 h-2 bg-purple-100 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full bg-purple-600 transition-all"
                                                style={{ width: `${Math.min(trainer.retentionRate, 100)}%` }}
                                              />
                                            </div>
                                          </div>
                                        </td>
                                        <td className="p-3 text-center">
                                          <div className="flex items-center justify-center gap-2">
                                            <span className="font-bold text-blue-700">{trainer.conversionRate.toFixed(1)}%</span>
                                            <div className="w-16 h-2 bg-blue-100 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full bg-blue-600 transition-all"
                                                style={{ width: `${Math.min(trainer.conversionRate, 100)}%` }}
                                              />
                                            </div>
                                          </div>
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className={`font-bold ${
                                            isTopPerformer ? 'text-green-700' : 
                                            isGoodPerformer ? 'text-yellow-700' : 'text-red-700'
                                          }`}>
                                            {performanceScore.toFixed(1)}%
                                          </span>
                                        </td>
                                        <td className="p-3 text-center">
                                          <Badge
                                            variant={isTopPerformer ? "default" : isGoodPerformer ? "secondary" : "destructive"}
                                            className={
                                              isTopPerformer ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                              isGoodPerformer ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                              'bg-red-100 text-red-800 hover:bg-red-200'
                                            }
                                          >
                                            {isTopPerformer ? 'Excellent' : isGoodPerformer ? 'Good' : 'Needs Improvement'}
                                          </Badge>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-slate-600 text-center py-8">No retention vs conversion data available</p>
                        )}
                      </div>
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

                  {/* Trainer Drill-Down Modal */}
                  {selectedTrainerModal && (
                    <TrainerDrillDownModal
                      isOpen={!!selectedTrainerModal}
                      onClose={() => setSelectedTrainerModal(null)}
                      trainerName={selectedTrainerModal.trainer}
                      trainerData={selectedTrainerModal.data}
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
