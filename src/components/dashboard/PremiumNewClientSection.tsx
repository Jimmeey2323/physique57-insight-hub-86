
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Award, 
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Heart,
  Star
} from 'lucide-react';
import { useNewClientData } from '@/hooks/useNewClientData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const LOCATION_MAPPING = [
  { id: 'kwality', name: 'Kwality House', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const PremiumNewClientSection = () => {
  const { data: newClientData, loading: newClientLoading, error: newClientError } = useNewClientData();
  const { data: payrollData, isLoading: payrollLoading, error: payrollError } = usePayrollData();
  const [activeLocation, setActiveLocation] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('conversion');

  const loading = newClientLoading || payrollLoading;
  const error = newClientError || payrollError;

  const processedData = useMemo(() => {
    if (!payrollData || payrollData.length === 0) return [];
    
    let filtered = payrollData;
    
    if (activeLocation !== 'all') {
      const activeLocationName = LOCATION_MAPPING.find(loc => loc.id === activeLocation)?.fullName;
      if (activeLocationName) {
        filtered = filtered.filter(item => item.location === activeLocationName);
      }
    }
    
    return filtered;
  }, [payrollData, activeLocation]);

  const summaryMetrics = useMemo(() => {
    if (!processedData.length) return null;

    const totalNew = processedData.reduce((sum, item) => sum + (item.new || 0), 0);
    const totalRetained = processedData.reduce((sum, item) => sum + (item.retained || 0), 0);
    const totalConverted = processedData.reduce((sum, item) => sum + (item.converted || 0), 0);
    const totalRevenue = processedData.reduce((sum, item) => sum + (item.totalPaid || 0), 0);
    
    const avgConversion = processedData.length > 0 ? 
      processedData.reduce((sum, item) => {
        const conversionValue = typeof item.conversion === 'string' 
          ? parseFloat(item.conversion.replace('%', '') || '0') 
          : (item.conversion || 0);
        return sum + conversionValue;
      }, 0) / processedData.length : 0;

    const avgRetention = processedData.length > 0 ? 
      processedData.reduce((sum, item) => {
        const retentionValue = typeof item.retention === 'string' 
          ? parseFloat(item.retention.replace('%', '') || '0') 
          : (item.retention || 0);
        return sum + retentionValue;
      }, 0) / processedData.length : 0;

    return {
      totalNew,
      totalRetained,
      totalConverted,
      totalRevenue,
      avgConversion,
      avgRetention,
      conversionRate: totalNew > 0 ? (totalConverted / totalNew) * 100 : 0,
      retentionRate: totalNew > 0 ? (totalRetained / totalNew) * 100 : 0
    };
  }, [processedData]);

  const clientMetrics = useMemo(() => {
    if (!newClientData || newClientData.length === 0) return null;

    const totalClients = newClientData.length;
    const newClients = newClientData.filter(client => client.isNew === 'Yes').length;
    const convertedClients = newClientData.filter(client => client.conversionStatus === 'Converted').length;
    const retainedClients = newClientData.filter(client => client.retentionStatus === 'Retained').length;
    const totalLTV = newClientData.reduce((sum, client) => sum + (client.ltv || 0), 0);

    return {
      totalClients,
      newClients,
      convertedClients,
      retainedClients,
      totalLTV,
      conversionRate: newClients > 0 ? (convertedClients / newClients) * 100 : 0,
      retentionRate: totalClients > 0 ? (retainedClients / totalClients) * 100 : 0,
      averageLTV: totalClients > 0 ? totalLTV / totalClients : 0
    };
  }, [newClientData]);

  const displayMetrics = summaryMetrics || clientMetrics;

  const metricCards = [
    {
      title: 'New Clients',
      value: formatNumber(
        (summaryMetrics?.totalNew) || 
        (clientMetrics?.newClients) || 
        0
      ),
      change: 15.2,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      description: 'Fresh acquisitions this period'
    },
    {
      title: 'Conversion Rate',
      value: `${(
        (summaryMetrics?.avgConversion) || 
        (clientMetrics?.conversionRate) || 
        0
      ).toFixed(1)}%`,
      change: 8.7,
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      description: 'Lead to client conversion'
    },
    {
      title: 'Retention Rate',
      value: `${(
        (summaryMetrics?.avgRetention) || 
        (clientMetrics?.retentionRate) || 
        0
      ).toFixed(1)}%`,
      change: 12.3,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      description: 'Client loyalty & engagement'
    },
    {
      title: 'Revenue Impact',
      value: formatCurrency(
        (summaryMetrics?.totalRevenue) || 
        (clientMetrics?.totalLTV) || 
        0
      ),
      change: 22.1,
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50',
      description: 'Total revenue generated'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 font-medium">Loading premium analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <div className="text-red-600">Error loading client data: {typeof error === 'string' ? error : 'Unknown error'}</div>
          <Button variant="outline" className="mt-4" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <Card className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-0 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-pink-600/5"></div>
        <CardHeader className="relative pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-purple-800 bg-clip-text text-transparent">
                  Client Conversion & Retention Analytics
                </CardTitle>
                <p className="text-slate-600 mt-2 font-medium">Premium insights into client acquisition and loyalty metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Location Selector */}
      <Card className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-0 shadow-xl">
        <CardContent className="p-6">
          <Tabs value={activeLocation} onValueChange={setActiveLocation}>
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 p-2 rounded-2xl shadow-inner border border-purple-200/30">
              <TabsTrigger 
                value="all"
                className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
              >
                <div className="text-center">
                  <div className="font-bold">All Locations</div>
                  <div className="text-xs opacity-80">Combined View</div>
                </div>
              </TabsTrigger>
              {LOCATION_MAPPING.map((location) => (
                <TabsTrigger 
                  key={location.id} 
                  value={location.id}
                  className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
                >
                  <div className="text-center">
                    <div className="font-bold">{location.name}</div>
                    <div className="text-xs opacity-80">Studio</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Premium Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <Card 
            key={card.title}
            className={cn(
              "relative overflow-hidden border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
              "bg-gradient-to-br", card.bgColor
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", card.color)}></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-2xl bg-gradient-to-r shadow-lg",
                  card.color
                )}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-sm font-semibold text-green-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +{card.change}%
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-slate-600 font-medium text-sm">{card.title}</h3>
                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium Data Table */}
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-3">
              <Star className="w-7 h-7 text-yellow-500" />
              Detailed Performance Analysis
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                {processedData.length} Records
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Month</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">New Clients</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Conversion</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Retention</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.map((item, index) => (
                    <tr 
                      key={`${item.location}-${item.monthYear}`}
                      className={cn(
                        "border-b border-slate-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30",
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-sm">{item.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="border-slate-300 text-slate-700">
                          {item.monthYear}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-blue-600">{formatNumber(item.new || 0)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-green-600">
                            {typeof item.conversion === 'string' ? item.conversion : `${item.conversion || 0}%`}
                          </span>
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(100, parseFloat(typeof item.conversion === 'string' ? item.conversion.replace('%', '') : String(item.conversion || 0)))}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-pink-600">
                            {typeof item.retention === 'string' ? item.retention : `${item.retention || 0}%`}
                          </span>
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(100, parseFloat(typeof item.retention === 'string' ? item.retention.replace('%', '') : String(item.retention || 0)))}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-purple-600">{formatCurrency(item.totalPaid || 0)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {processedData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-slate-600 font-medium">No client data available for the selected location</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
