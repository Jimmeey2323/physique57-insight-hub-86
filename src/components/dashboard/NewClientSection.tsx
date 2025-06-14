
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Target, TrendingUp, CreditCard, MapPin, Building2 } from 'lucide-react';
import { useNewClientData } from '@/hooks/useNewClientData';
import { NewClientFilterSection } from './NewClientFilterSection';
import { MetricCard } from './MetricCard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { getNewClientMetrics, calculateNewClientMetrics, getUniqueTrainers, getUniqueLocations, getTopBottomTrainers } from '@/utils/newClientMetrics';
import { NewClientFilterOptions } from '@/types/dashboard';

const locations = [
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const NewClientSection: React.FC = () => {
  const { data, loading, error, refetch } = useNewClientData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [filters, setFilters] = useState<NewClientFilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    homeLocation: [],
    trainer: [],
    paymentMethod: [],
    retentionStatus: [],
    conversionStatus: [],
    isNew: []
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = data;

    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => item.homeLocation === activeLocation);
    }

    // Apply additional filters
    if (filters.location.length > 0) {
      filtered = filtered.filter(item => filters.location.includes(item.firstVisitLocation));
    }

    if (filters.trainer.length > 0) {
      filtered = filtered.filter(item => filters.trainer.includes(item.trainerName));
    }

    if (filters.retentionStatus.length > 0) {
      filtered = filtered.filter(item => filters.retentionStatus.includes(item.retentionStatus));
    }

    if (filters.conversionStatus.length > 0) {
      filtered = filtered.filter(item => filters.conversionStatus.includes(item.conversionStatus));
    }

    return filtered;
  }, [data, activeLocation, filters]);

  const metrics = useMemo(() => {
    return getNewClientMetrics(filteredData);
  }, [filteredData]);

  const calculatedMetrics = useMemo(() => {
    return calculateNewClientMetrics(filteredData);
  }, [filteredData]);

  const topBottomTrainers = useMemo(() => {
    return getTopBottomTrainers(calculatedMetrics, 'newMembers', 5);
  }, [calculatedMetrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading New Client Data</p>
              <p className="text-sm text-gray-600">Analyzing customer acquisition...</p>
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
          <p className="text-slate-600">No new client data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-30">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
            <g fill="none" fillRule="evenodd">
              <g fill="#ffffff" fillOpacity="0.05">
                <circle cx="60" cy="60" r="30"/>
              </g>
            </g>
          </svg>
        </div>
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                <Users className="w-5 h-5" />
                <span className="font-medium">New Client Analytics</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
                Client Acquisition Hub
              </h1>
              
              <p className="text-xl text-green-100 max-w-2xl mx-auto leading-relaxed">
                Track new customer onboarding and optimize acquisition strategies
              </p>
              
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{formatNumber(data?.length || 0)}</div>
                  <div className="text-sm text-green-200">New Clients</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {data ? formatNumber(data.filter(item => item.conversionStatus === 'Converted').length) : '0'}
                  </div>
                  <div className="text-sm text-green-200">Conversions</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {data && data.length > 0 ? 
                      formatCurrency(data.reduce((sum, item) => sum + item.ltv, 0) / data.length) : 
                      '$0'
                    }
                  </div>
                  <div className="text-sm text-green-200">Avg LTV</div>
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
                    data={data || []}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, index) => (
                      <MetricCard
                        key={metric.title}
                        data={metric}
                        delay={index * 100}
                      />
                    ))}
                  </div>

                  {/* Top/Bottom Trainers Performance */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-white shadow-sm border border-gray-200">
                      <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Top Performing Trainers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {topBottomTrainers.top.slice(0, 5).map((trainer, index) => (
                            <div key={trainer.trainerName} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800">{trainer.trainerName}</div>
                                  <div className="text-sm text-gray-600">
                                    {trainer.totalNewMembers} new members • {trainer.averageConversionRate.toFixed(1)}% conversion
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600">{formatCurrency(trainer.averageLtv)}</div>
                                <div className="text-xs text-gray-500">Avg LTV</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border border-gray-200">
                      <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                          <Target className="w-5 h-5 text-orange-600" />
                          Trainers Needing Support
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {topBottomTrainers.bottom.slice(0, 5).map((trainer, index) => (
                            <div key={trainer.trainerName} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800">{trainer.trainerName}</div>
                                  <div className="text-sm text-gray-600">
                                    {trainer.totalNewMembers} new members • {trainer.averageConversionRate.toFixed(1)}% conversion
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-orange-600">{formatCurrency(trainer.averageLtv)}</div>
                                <div className="text-xs text-gray-500">Avg LTV</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* New Client Data Summary */}
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-gray-800 text-xl">New Client Data Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                          <div className="text-2xl font-bold text-blue-700">{filteredData.length}</div>
                          <div className="text-sm text-blue-600">Total New Clients</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                          <div className="text-2xl font-bold text-green-700">
                            {filteredData.filter(item => item.conversionStatus === 'Converted').length}
                          </div>
                          <div className="text-sm text-green-600">Successful Conversions</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                          <div className="text-2xl font-bold text-purple-700">
                            {filteredData.length > 0 ? 
                              formatCurrency(filteredData.reduce((sum, item) => sum + item.ltv, 0) / filteredData.length) : 
                              '$0'
                            }
                          </div>
                          <div className="text-sm text-purple-600">Average LTV</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Monthly Performance Table */}
                  {calculatedMetrics.length > 0 && (
                    <Card className="bg-white shadow-sm border border-gray-200">
                      <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-gray-800 text-xl">Monthly Performance by Trainer</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Members</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retained</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Converted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg LTV</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retention %</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion %</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {calculatedMetrics.slice(0, 20).map((metric, index) => (
                                <tr key={`${metric.trainerName}-${metric.monthYear}`} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {metric.trainerName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {metric.monthYear}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {metric.newMembers}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {metric.retainedMembers}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {metric.convertedMembers}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(metric.averageLtv)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      metric.retentionPercentage >= 70 ? 'bg-green-100 text-green-800' :
                                      metric.retentionPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {metric.retentionPercentage.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      metric.conversionPercentage >= 60 ? 'bg-green-100 text-green-800' :
                                      metric.conversionPercentage >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {metric.conversionPercentage.toFixed(1)}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
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
