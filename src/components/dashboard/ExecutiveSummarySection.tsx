
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SalesData, NewClientData, SessionData } from '@/types/dashboard';
import { TrendingUp, Users, Calendar, Target, DollarSign, BarChart3 } from 'lucide-react';

const ExecutiveSummarySection = () => {
  const { data: salesData, loading: salesLoading, error: salesError } = useGoogleSheets();
  const { data: newClientData, loading: clientLoading, error: clientError } = useNewClientData();
  const { data: sessionsData, loading: sessionsLoading, error: sessionsError } = useSessionsData();
  const { data: leadsData, loading: leadsLoading, error: leadsError } = useLeadsData();

  const isLoading = salesLoading || clientLoading || sessionsLoading || leadsLoading;

  // Calculate key metrics
  const executiveMetrics = useMemo(() => {
    if (!salesData?.length || !newClientData?.length || !sessionsData?.length) {
      return [];
    }

    // Sales metrics
    const totalRevenue = salesData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalTransactions = salesData.length;
    const uniqueMembers = new Set(salesData.map(item => item.memberId)).size;
    const avgTransactionValue = totalRevenue / totalTransactions || 0;

    // Session metrics
    const totalSessions = sessionsData.length;
    const totalCapacity = sessionsData.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const totalBooked = sessionsData.reduce((sum, session) => sum + (session.booked || 0), 0);
    const avgUtilization = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

    // New client metrics
    const newClients = newClientData.filter(client => client.isNew === 'Yes').length;
    const avgLTV = newClientData.reduce((sum, client) => sum + (client.ltv || 0), 0) / newClientData.length || 0;

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: 12.5,
        description: 'Total revenue across all locations',
        calculation: 'Sum of all payment values',
        icon: 'revenue',
        rawValue: totalRevenue,
        breakdown: { totalTransactions, uniqueMembers, avgTransactionValue }
      },
      {
        title: 'New Members',
        value: formatNumber(newClients),
        change: 8.2,
        description: 'New member acquisitions',
        calculation: 'Count of new members',
        icon: 'members',
        rawValue: newClients,
        breakdown: { avgLTV, totalMembers: newClientData.length }
      },
      {
        title: 'Session Utilization',
        value: formatPercentage(avgUtilization),
        change: 5.7,
        description: 'Average class fill rate',
        calculation: 'Booked / Capacity across all sessions',
        icon: 'sessions',
        rawValue: avgUtilization,
        breakdown: { totalSessions, totalCapacity, totalBooked }
      },
      {
        title: 'Avg Transaction Value',
        value: formatCurrency(avgTransactionValue),
        change: -2.1,
        description: 'Average revenue per transaction',
        calculation: 'Total Revenue / Total Transactions',
        icon: 'atv',
        rawValue: avgTransactionValue,
        breakdown: { totalRevenue, totalTransactions }
      },
      {
        title: 'Member Lifetime Value',
        value: formatCurrency(avgLTV),
        change: 15.3,
        description: 'Average customer lifetime value',
        calculation: 'Average LTV across all members',
        icon: 'ltv',
        rawValue: avgLTV,
        breakdown: { newClients, totalMembers: newClientData.length }
      },
      {
        title: 'Active Sessions',
        value: formatNumber(totalSessions),
        change: 6.8,
        description: 'Total number of sessions conducted',
        calculation: 'Count of all sessions',
        icon: 'sessions',
        rawValue: totalSessions,
        breakdown: { avgUtilization, totalCapacity, totalBooked }
      }
    ];
  }, [salesData, newClientData, sessionsData]);

  // Performance trends data
  const performanceTrends = useMemo(() => {
    if (!salesData?.length) return [];

    const monthlyData = salesData.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      if (isNaN(date.getTime())) return acc;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { revenue: 0, transactions: 0 };
      }
      
      acc[monthKey].revenue += item.paymentValue || 0;
      acc[monthKey].transactions += 1;
      
      return acc;
    }, {} as Record<string, { revenue: number; transactions: number }>);

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([date, data]) => ({
        date,
        value: data.revenue,
        category: 'Revenue'
      }));
  }, [salesData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (salesError || clientError || sessionsError || leadsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading data. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Executive Summary Dashboard
        </h2>
        <p className="text-lg text-slate-600">
          High-level business performance overview across all key metrics
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {executiveMetrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            data={metric}
            delay={index * 100}
            onClick={() => console.log('Executive metric clicked:', metric)}
          />
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InteractiveChart
          title="Revenue Performance Trends"
          data={performanceTrends}
          type="revenue"
        />
        <InteractiveChart
          title="Business Growth Overview"
          data={performanceTrends}
          type="performance"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <TrendingUp className="w-5 h-5" />
              Revenue Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(salesData?.reduce((sum, item) => sum + (item.paymentValue || 0), 0) || 0)}
            </p>
            <p className="text-sm text-blue-700">Total revenue generated</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Users className="w-5 h-5" />
              Member Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-900">
              {formatNumber(new Set(salesData?.map(item => item.memberId)).size || 0)}
            </p>
            <p className="text-sm text-green-700">Unique active members</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Calendar className="w-5 h-5" />
              Session Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-900">
              {formatNumber(sessionsData?.length || 0)}
            </p>
            <p className="text-sm text-purple-700">Total sessions conducted</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveSummarySection;
