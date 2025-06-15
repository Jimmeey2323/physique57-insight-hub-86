
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Target, Activity, BarChart3 } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export const ExecutiveSummarySection = () => {
  const { data: salesData, loading: salesLoading } = useGoogleSheets();
  const { data: clientData, loading: clientLoading } = useNewClientData();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: leadsData, loading: leadsLoading } = useLeadsData();
  const { data: payrollData, isLoading: payrollLoading } = usePayrollData();

  // Calculate key metrics using proper formatters
  const metrics = useMemo(() => {
    if (salesLoading || clientLoading || sessionsLoading || leadsLoading || payrollLoading) {
      return {
        totalRevenue: 0,
        totalSessions: 0,
        totalClients: 0,
        totalLeads: 0,
        averageClassSize: 0,
        retention: 0,
        conversion: 0,
        growth: 0
      };
    }

    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.paymentValue || 0), 0);
    const totalSessions = sessionsData.reduce((sum, session) => sum + (session.sessionCount || 0), 0);
    const totalClients = new Set(clientData.map(client => client.memberId)).size;
    const totalLeads = leadsData.length;
    
    const totalCapacity = sessionsData.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const totalBooked = sessionsData.reduce((sum, session) => sum + (session.booked || 0), 0);
    const averageClassSize = totalCapacity > 0 ? (totalBooked / sessionsData.length) : 0;
    
    const retainedClients = clientData.filter(client => client.retentionStatus === 'Retained').length;
    const retention = totalClients > 0 ? (retainedClients / totalClients) * 100 : 0;
    
    const convertedClients = clientData.filter(client => client.conversionStatus === 'Converted').length;
    const conversion = totalClients > 0 ? (convertedClients / totalClients) * 100 : 0;
    
    // Calculate month-over-month growth
    const currentMonth = new Date().getMonth();
    const currentMonthRevenue = salesData
      .filter(sale => new Date(sale.paymentDate).getMonth() === currentMonth)
      .reduce((sum, sale) => sum + sale.paymentValue, 0);
    
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthRevenue = salesData
      .filter(sale => new Date(sale.paymentDate).getMonth() === previousMonth)
      .reduce((sum, sale) => sum + sale.paymentValue, 0);
    
    const growth = previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalSessions,
      totalClients,
      totalLeads,
      averageClassSize,
      retention,
      conversion,
      growth
    };
  }, [salesData, clientData, sessionsData, leadsData, payrollData, salesLoading, clientLoading, sessionsLoading, leadsLoading, payrollLoading]);

  const isLoading = salesLoading || clientLoading || sessionsLoading || leadsLoading || payrollLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse mb-4">
          Executive Dashboard
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Strategic overview and key performance indicators
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 via-white to-slate-100 p-2 rounded-2xl shadow-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="operations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">
            Operations
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(metrics.totalRevenue)}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  {metrics.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {formatPercentage(metrics.growth)} from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{formatNumber(metrics.totalSessions)}</div>
                <p className="text-xs text-blue-600">
                  Avg class size: {metrics.averageClassSize.toFixed(1)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{formatNumber(metrics.totalClients)}</div>
                <p className="text-xs text-purple-600">
                  {formatPercentage(metrics.retention)} retention rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Total Leads</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{formatNumber(metrics.totalLeads)}</div>
                <p className="text-xs text-orange-600">
                  {formatPercentage(metrics.conversion)} conversion rate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-800 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Gross Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-900 mb-2">{formatCurrency(metrics.totalRevenue)}</div>
                <Badge className="bg-emerald-200 text-emerald-800">
                  Monthly Growth: {formatPercentage(metrics.growth)}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Average Transaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-900 mb-2">
                  {formatCurrency(metrics.totalRevenue / Math.max(salesData.length, 1))}
                </div>
                <Badge className="bg-teal-200 text-teal-800">
                  Per Transaction
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-800 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Revenue per Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-900 mb-2">
                  {formatCurrency(metrics.totalRevenue / Math.max(metrics.totalClients, 1))}
                </div>
                <Badge className="bg-cyan-200 text-cyan-800">
                  Average LTV
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Operational metrics with proper formatting */}
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-indigo-600 mb-2">Sessions Delivered</div>
                <div className="text-2xl font-bold text-indigo-900">{formatNumber(metrics.totalSessions)}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-pink-600 mb-2">Average Class Size</div>
                <div className="text-2xl font-bold text-pink-900">{metrics.averageClassSize.toFixed(1)}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-violet-600 mb-2">Client Retention</div>
                <div className="text-2xl font-bold text-violet-900">{formatPercentage(metrics.retention)}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-amber-600 mb-2">Lead Conversion</div>
                <div className="text-2xl font-bold text-amber-900">{formatPercentage(metrics.conversion)}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Revenue Growth</span>
                  <Badge className={cn(
                    "text-white",
                    metrics.growth >= 0 ? "bg-green-500" : "bg-red-500"
                  )}>
                    {formatPercentage(metrics.growth)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Client Retention</span>
                  <Badge className="bg-blue-500 text-white">
                    {formatPercentage(metrics.retention)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Lead Conversion</span>
                  <Badge className="bg-purple-500 text-white">
                    {formatPercentage(metrics.conversion)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Average Class Fill</span>
                  <Badge className="bg-orange-500 text-white">
                    {((metrics.averageClassSize / 20) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800">Business Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {Math.round((metrics.retention + metrics.conversion + (metrics.growth > 0 ? 25 : 0)) / 3)}%
                  </div>
                  <p className="text-gray-600">Overall Performance</p>
                  <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {Math.round((metrics.retention + metrics.conversion + (metrics.growth > 0 ? 25 : 0)) / 3) >= 70 ? 'Excellent' : 
                     Math.round((metrics.retention + metrics.conversion + (metrics.growth > 0 ? 25 : 0)) / 3) >= 50 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

