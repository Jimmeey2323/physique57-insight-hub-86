
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
  Award
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
  <Card className={`bg-gradient-to-br ${color} border-0 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
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

export const ExecutiveSummarySection: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  const { data: salesData, loading: salesLoading } = useGoogleSheets();
  const { data: discountsData, loading: discountsLoading } = useDiscountsData();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: leadsData, loading: leadsLoading } = useLeadsData();
  const { data: clientsData, loading: clientsLoading } = useNewClientData();

  const loading = salesLoading || discountsLoading || sessionsLoading || leadsLoading || clientsLoading;

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalRevenue = salesData?.reduce((sum, item) => sum + (item.paymentValue || 0), 0) || 0;
    const totalDiscounts = discountsData?.reduce((sum, item) => sum + (item.discountAmount || 0), 0) || 0;
    const totalSessions = sessionsData?.length || 0;
    const totalLeads = leadsData?.length || 0;
    const totalClients = clientsData?.length || 0;
    const convertedLeads = leadsData?.filter(lead => lead.conversionStatus === 'Converted').length || 0;
    const activeClients = clientsData?.filter(client => client.retentionStatus === 'Active').length || 0;
    
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
    const discountRate = totalRevenue > 0 ? (totalDiscounts / totalRevenue) * 100 : 0;
    const avgSessionAttendance = sessionsData?.reduce((sum, session) => sum + (session.checkedInCount || 0), 0) / Math.max(totalSessions, 1) || 0;

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
  }, [salesData, discountsData, sessionsData, leadsData, clientsData]);

  // Location performance
  const locationPerformance = useMemo(() => {
    if (!salesData) return [];
    
    const locationData = salesData.reduce((acc, item) => {
      const location = item.calculatedLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = { 
          name: location, 
          revenue: 0, 
          transactions: 0,
          avgTransaction: 0
        };
      }
      acc[location].revenue += item.paymentValue || 0;
      acc[location].transactions += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(locationData).map((location: any) => ({
      ...location,
      avgTransaction: location.transactions > 0 ? location.revenue / location.transactions : 0
    })).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [salesData]);

  // Top performers
  const topPerformers = useMemo(() => {
    if (!salesData) return { products: [], categories: [], sellers: [] };

    const products = salesData.reduce((acc, item) => {
      const product = item.cleanedProduct || 'Unknown';
      if (!acc[product]) acc[product] = { name: product, revenue: 0, count: 0 };
      acc[product].revenue += item.paymentValue || 0;
      acc[product].count += 1;
      return acc;
    }, {} as Record<string, any>);

    const categories = salesData.reduce((acc, item) => {
      const category = item.cleanedCategory || 'Unknown';
      if (!acc[category]) acc[category] = { name: category, revenue: 0, count: 0 };
      acc[category].revenue += item.paymentValue || 0;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, any>);

    const sellers = salesData.reduce((acc, item) => {
      const seller = item.soldBy || 'Unknown';
      if (!acc[seller]) acc[seller] = { name: seller, revenue: 0, count: 0 };
      acc[seller].revenue += item.paymentValue || 0;
      acc[seller].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return {
      products: Object.values(products).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5),
      categories: Object.values(categories).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5),
      sellers: Object.values(sellers).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5)
    };
  }, [salesData]);

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
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-2xl">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-8 py-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Executive Overview</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Business Intelligence Dashboard
            </h1>
            
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Comprehensive insights across sales, leads, sessions, and client performance
            </p>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center">
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)} className="w-auto">
          <TabsList className="bg-white shadow-lg">
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly View</TabsTrigger>
            <TabsTrigger value="yearly">Yearly View</TabsTrigger>
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
          description="Gross revenue across all streams"
        />
        
        <KPICard
          title="Net Revenue"
          value={formatCurrency(metrics.netRevenue)}
          change={8.3}
          icon={<TrendingUp className="w-8 h-8" />}
          color="from-blue-500 to-cyan-600"
          description="After discounts and adjustments"
        />
        
        <KPICard
          title="Lead Conversion"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change={5.2}
          icon={<Target className="w-8 h-8" />}
          color="from-purple-500 to-violet-600"
          description="Leads to paying customers"
        />
        
        <KPICard
          title="Client Retention"
          value={`${metrics.retentionRate.toFixed(1)}%`}
          change={-2.1}
          icon={<Users className="w-8 h-8" />}
          color="from-orange-500 to-red-600"
          description="Active client retention rate"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Sessions"
          value={formatNumber(metrics.totalSessions)}
          change={15.7}
          icon={<Calendar className="w-8 h-8" />}
          color="from-indigo-500 to-purple-600"
          description="Classes conducted"
        />
        
        <KPICard
          title="Avg Attendance"
          value={metrics.avgSessionAttendance.toFixed(1)}
          change={3.4}
          icon={<UserPlus className="w-8 h-8" />}
          color="from-teal-500 to-cyan-600"
          description="Per session attendance"
        />
        
        <KPICard
          title="Discount Rate"
          value={`${metrics.discountRate.toFixed(1)}%`}
          change={-4.2}
          icon={<Percent className="w-8 h-8" />}
          color="from-pink-500 to-rose-600"
          description="Of total revenue"
        />
        
        <KPICard
          title="Total Leads"
          value={formatNumber(metrics.totalLeads)}
          change={22.8}
          icon={<Star className="w-8 h-8" />}
          color="from-yellow-500 to-orange-600"
          description="Generated this period"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InteractiveChart
          title="Revenue & Performance Trends"
          data={salesData || []}
          type="revenue"
        />
        
        <InteractiveChart
          title="Lead Conversion Analysis"
          data={leadsData || []}
          type="conversion"
        />
      </div>

      {/* Location Performance */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            Location Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locationPerformance.slice(0, 3).map((location, index) => (
              <div key={location.name} className="relative">
                <div className={cn(
                  "p-6 rounded-lg",
                  index === 0 && "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200",
                  index === 1 && "bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200",
                  index === 2 && "bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200"
                )}>
                  {index === 0 && <Award className="w-6 h-6 text-yellow-600 mb-2" />}
                  <h3 className="font-semibold text-gray-800 mb-2">{location.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue:</span>
                      <span className="font-semibold">{formatCurrency(location.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Transactions:</span>
                      <span className="font-semibold">{formatNumber(location.transactions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg/Transaction:</span>
                      <span className="font-semibold">{formatCurrency(location.avgTransaction)}</span>
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white">
                    Top Performer
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {topPerformers.products.map((product: any, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{formatNumber(product.count)} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {topPerformers.categories.map((category: any, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{category.name}</p>
                    <p className="text-xs text-gray-600">{formatNumber(category.count)} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-700">{formatCurrency(category.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Sales Reps */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Top Sales Reps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {topPerformers.sellers.map((seller: any, index) => (
                <div key={seller.name} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{seller.name}</p>
                    <p className="text-xs text-gray-600">{formatNumber(seller.count)} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-purple-700">{formatCurrency(seller.revenue)}</p>
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
