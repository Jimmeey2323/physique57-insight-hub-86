
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Target, 
  Calendar,
  MapPin,
  Star,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Percent,
  UserPlus,
  Award,
  Sparkles,
  TrendingDown,
  Eye,
  Infinity
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useDiscountsData } from '@/hooks/useDiscountsData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { InteractiveChart } from './InteractiveChart';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, color, description }) => (
  <Card className={`bg-gradient-to-br ${color} border-0 shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {description && (
            <p className="text-white/70 text-xs">{description}</p>
          )}
        </div>
        <div className="text-white/90 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        {change >= 0 ? (
          <ArrowUpRight className="w-4 h-4 text-green-200" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-200" />
        )}
        <span className={cn(
          "text-sm font-medium",
          change >= 0 ? "text-green-200" : "text-red-200"
        )}>
          {Math.abs(change)}%
        </span>
        <span className="text-white/70 text-sm">vs last period</span>
      </div>
    </CardContent>
  </Card>
);

const AnimatedHeader = () => (
  <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white rounded-2xl">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-700/20" />
    <div className="absolute inset-0">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
    
    <div className="relative px-8 py-16">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 animate-fade-in">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="font-medium">Schedule Analytics</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-fade-in">
          Executive Dashboard
        </h1>
        
        <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed animate-fade-in">
          Intelligent insights for modern fitness management. <span className="font-semibold text-white">Data-driven decisions</span> made simple.
        </p>
        
        <div className="flex justify-center items-center gap-8 mt-8 animate-fade-in">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">8+</div>
            <div className="text-purple-200 text-sm">View Modes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">∞</div>
            <div className="text-purple-200 text-sm">Insights</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">24/7</div>
            <div className="text-purple-200 text-sm">Analytics</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ExecutiveSummarySection: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  const { data: salesData, loading: salesLoading } = useGoogleSheets();
  const { data: discountsData, loading: discountsLoading } = useDiscountsData();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: leadsData, loading: leadsLoading } = useLeadsData();
  const { data: clientsData, loading: clientsLoading } = useNewClientData();

  const loading = salesLoading || discountsLoading || sessionsLoading || leadsLoading || clientsLoading;

  // Filter data based on timeframe
  const getDateRange = (timeframe: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch (timeframe) {
      case 'monthly':
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0)
        };
      case 'quarterly':
        const quarterStart = Math.floor(currentMonth / 3) * 3;
        return {
          start: new Date(currentYear, quarterStart, 1),
          end: new Date(currentYear, quarterStart + 3, 0)
        };
      case 'yearly':
        return {
          start: new Date(currentYear, 0, 1),
          end: new Date(currentYear, 11, 31)
        };
      default:
        return { start: new Date(0), end: new Date() };
    }
  };

  const filteredData = useMemo(() => {
    const dateRange = getDateRange(timeframe);
    
    const filteredSales = salesData?.filter(item => {
      const itemDate = new Date(item.paymentDate);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    }) || [];

    const filteredLeads = leadsData?.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    }) || [];

    const filteredSessions = sessionsData?.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    }) || [];

    const filteredClients = clientsData?.filter(item => {
      const itemDate = new Date(item.firstVisitDate);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    }) || [];

    return {
      sales: filteredSales,
      leads: filteredLeads,
      sessions: filteredSessions,
      clients: filteredClients
    };
  }, [salesData, leadsData, sessionsData, clientsData, timeframe]);

  // Calculate key metrics based on filtered data
  const metrics = useMemo(() => {
    const totalRevenue = filteredData.sales.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalDiscounts = filteredData.sales.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalSessions = filteredData.sessions.length;
    const totalLeads = filteredData.leads.length;
    const totalClients = filteredData.clients.length;
    const convertedLeads = filteredData.leads.filter(lead => lead.conversionStatus === 'Converted').length;
    const activeClients = filteredData.clients.filter(client => client.retentionStatus === 'Active').length;
    
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
    const discountRate = totalRevenue > 0 ? (totalDiscounts / totalRevenue) * 100 : 0;
    const avgSessionAttendance = filteredData.sessions.reduce((sum, session) => sum + (session.checkedInCount || 0), 0) / Math.max(totalSessions, 1) || 0;

    return {
      totalRevenue,
      totalDiscounts,
      totalSessions,
      totalLeads,
      totalClients,
      conversionRate,
      retentionRate,
      discountRate,
      avgSessionAttendance,
      netRevenue: totalRevenue - totalDiscounts
    };
  }, [filteredData]);

  // Lead sources analysis
  const leadSources = useMemo(() => {
    const sourceData = filteredData.leads.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = { name: source, count: 0, converted: 0, conversionRate: 0 };
      }
      acc[source].count += 1;
      if (lead.conversionStatus === 'Converted') {
        acc[source].converted += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    const sources = Object.values(sourceData).map((source: any) => ({
      ...source,
      conversionRate: source.count > 0 ? (source.converted / source.count) * 100 : 0
    }));

    return {
      top: sources.sort((a: any, b: any) => b.count - a.count).slice(0, 5),
      bottom: sources.sort((a: any, b: any) => a.count - b.count).slice(0, 5)
    };
  }, [filteredData.leads]);

  // Location performance
  const locationPerformance = useMemo(() => {
    const locationData = filteredData.sales.reduce((acc, item) => {
      const location = item.calculatedLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = { 
          name: location, 
          revenue: 0, 
          transactions: 0,
          avgTransaction: 0,
          sessions: 0,
          attendance: 0
        };
      }
      acc[location].revenue += item.paymentValue || 0;
      acc[location].transactions += 1;
      return acc;
    }, {} as Record<string, any>);

    // Add session data to locations
    filteredData.sessions.forEach(session => {
      const location = session.location || 'Unknown';
      if (locationData[location]) {
        locationData[location].sessions += 1;
        locationData[location].attendance += session.checkedInCount || 0;
      }
    });

    return Object.values(locationData).map((location: any) => ({
      ...location,
      avgTransaction: location.transactions > 0 ? location.revenue / location.transactions : 0,
      avgAttendance: location.sessions > 0 ? location.attendance / location.sessions : 0
    })).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [filteredData.sales, filteredData.sessions]);

  // Trainer performance
  const trainerPerformance = useMemo(() => {
    const trainerData = filteredData.sessions.reduce((acc, session) => {
      const trainer = session.trainerName || 'Unknown';
      if (!acc[trainer]) {
        acc[trainer] = {
          name: trainer,
          sessions: 0,
          totalAttendance: 0,
          avgAttendance: 0,
          revenue: 0
        };
      }
      acc[trainer].sessions += 1;
      acc[trainer].totalAttendance += session.checkedInCount || 0;
      acc[trainer].revenue += session.revenue || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(trainerData).map((trainer: any) => ({
      ...trainer,
      avgAttendance: trainer.sessions > 0 ? trainer.totalAttendance / trainer.sessions : 0
    })).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 10);
  }, [filteredData.sessions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="flex items-center gap-4">
            <Activity className="w-8 h-8 animate-spin text-blue-600" />
            <div>
              <p className="text-lg font-semibold text-slate-800">Loading Executive Summary</p>
              <p className="text-sm text-slate-600">Aggregating data from all sources...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 min-h-screen">
      {/* Animated Header */}
      <AnimatedHeader />

      {/* Timeframe Selector */}
      <div className="flex justify-center">
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)} className="w-auto">
          <TabsList className="bg-white shadow-lg border border-gray-200">
            <TabsTrigger value="monthly" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Monthly View
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Quarterly View
            </TabsTrigger>
            <TabsTrigger value="yearly" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Yearly View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={12.5}
          icon={<DollarSign className="w-8 h-8" />}
          color="from-green-500 to-emerald-600"
          description={`Gross revenue (${timeframe})`}
        />
        
        <KPICard
          title="Lead Conversion"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change={5.2}
          icon={<Target className="w-8 h-8" />}
          color="from-purple-500 to-violet-600"
          description={`${filteredData.leads.filter(l => l.conversionStatus === 'Converted').length} converted`}
        />
        
        <KPICard
          title="Client Retention"
          value={`${metrics.retentionRate.toFixed(1)}%`}
          change={-2.1}
          icon={<Users className="w-8 h-8" />}
          color="from-orange-500 to-red-600"
          description={`${filteredData.clients.filter(c => c.retentionStatus === 'Active').length} active clients`}
        />
        
        <KPICard
          title="Session Attendance"
          value={metrics.avgSessionAttendance.toFixed(1)}
          change={8.7}
          icon={<Calendar className="w-8 h-8" />}
          color="from-blue-500 to-cyan-600"
          description={`Avg per session (${metrics.totalSessions} total)`}
        />
      </div>

      {/* Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Top Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {leadSources.top.map((source: any, index) => (
                <div key={source.name} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{source.name}</p>
                    <p className="text-sm text-gray-600">{formatNumber(source.count)} leads</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700">{source.conversionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">{source.converted} converted</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100">
            <CardTitle className="flex items-center gap-3">
              <TrendingDown className="w-6 h-6 text-red-600" />
              Bottom Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {leadSources.bottom.map((source: any, index) => (
                <div key={source.name} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{source.name}</p>
                    <p className="text-sm text-gray-600">{formatNumber(source.count)} leads</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-700">{source.conversionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">{source.converted} converted</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InteractiveChart
          title="Revenue & Discount Analysis"
          data={filteredData.sales}
          type="revenue"
        />
        
        <InteractiveChart
          title="Lead Conversion Trends"
          data={filteredData.leads}
          type="conversion"
        />
      </div>

      {/* Combined Metrics Table */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Comprehensive Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="trainers" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="trainers">Trainers</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trainers" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 font-semibold text-gray-700">Trainer</th>
                      <th className="pb-3 font-semibold text-gray-700">Sessions</th>
                      <th className="pb-3 font-semibold text-gray-700">Avg Attendance</th>
                      <th className="pb-3 font-semibold text-gray-700">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainerPerformance.map((trainer: any, index) => (
                      <tr key={trainer.name} className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-800">{trainer.name}</td>
                        <td className="py-3 text-gray-600">{formatNumber(trainer.sessions)}</td>
                        <td className="py-3 text-gray-600">{trainer.avgAttendance.toFixed(1)}</td>
                        <td className="py-3 font-semibold text-green-600">{formatCurrency(trainer.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="locations" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 font-semibold text-gray-700">Location</th>
                      <th className="pb-3 font-semibold text-gray-700">Revenue</th>
                      <th className="pb-3 font-semibold text-gray-700">Transactions</th>
                      <th className="pb-3 font-semibold text-gray-700">Avg Transaction</th>
                      <th className="pb-3 font-semibold text-gray-700">Sessions</th>
                      <th className="pb-3 font-semibold text-gray-700">Avg Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationPerformance.slice(0, 10).map((location: any, index) => (
                      <tr key={location.name} className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-800">{location.name}</td>
                        <td className="py-3 font-semibold text-green-600">{formatCurrency(location.revenue)}</td>
                        <td className="py-3 text-gray-600">{formatNumber(location.transactions)}</td>
                        <td className="py-3 text-gray-600">{formatCurrency(location.avgTransaction)}</td>
                        <td className="py-3 text-gray-600">{formatNumber(location.sessions)}</td>
                        <td className="py-3 text-gray-600">{location.avgAttendance.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Add other tabs content as needed */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
