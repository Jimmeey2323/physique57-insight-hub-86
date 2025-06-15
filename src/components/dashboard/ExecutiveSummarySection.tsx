
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { UnifiedTopBottomSellers } from './UnifiedTopBottomSellers';
import { DataTable } from './DataTable';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SalesData, NewClientData, SessionData, ChartDataPoint } from '@/types/dashboard';
import { TrendingUp, Users, Calendar, Target, DollarSign, BarChart3, UserCheck, Award, Clock } from 'lucide-react';

const ExecutiveSummarySection = () => {
  const { data: salesData, loading: salesLoading, error: salesError } = useGoogleSheets();
  const { data: newClientData, loading: clientLoading, error: clientError } = useNewClientData();
  const { data: sessionsData, loading: sessionsLoading, error: sessionsError } = useSessionsData();
  const { data: leadsData, loading: leadsLoading, error: leadsError } = useLeadsData();
  const { data: payrollData, loading: payrollLoading, error: payrollError } = usePayrollData();

  const isLoading = salesLoading || clientLoading || sessionsLoading || leadsLoading || payrollLoading;

  // Calculate key metrics across all data sources
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
    const totalBookings = sessionsData.reduce((sum, session) => sum + (session.checkedIn || 0), 0);
    const avgUtilization = totalCapacity > 0 ? (totalBookings / totalCapacity) * 100 : 0;

    // New client metrics
    const newClients = newClientData.filter(client => client.isNew === 'Yes').length;
    const avgLTV = newClientData.reduce((sum, client) => sum + (client.ltv || 0), 0) / newClientData.length || 0;

    // Lead metrics
    const totalLeads = leadsData?.length || 0;
    const convertedLeads = leadsData?.filter(lead => lead.status === 'Converted').length || 0;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Trainer metrics
    const totalTrainers = new Set(payrollData?.map(p => p.teacherId)).size || 0;
    const avgClassSize = payrollData?.reduce((sum, p) => sum + (p.classAverageExclEmpty || 0), 0) / (payrollData?.length || 1) || 0;

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
        value: formatPercentage(avgUtilization / 100),
        change: 5.7,
        description: 'Average class fill rate',
        calculation: 'Bookings / Capacity across all sessions',
        icon: 'sessions',
        rawValue: avgUtilization,
        breakdown: { totalSessions, totalCapacity, totalBookings }
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
        title: 'Lead Conversion Rate',
        value: formatPercentage(conversionRate / 100),
        change: 15.3,
        description: 'Percentage of leads converted to members',
        calculation: 'Converted Leads / Total Leads',
        icon: 'conversion',
        rawValue: conversionRate,
        breakdown: { totalLeads, convertedLeads }
      },
      {
        title: 'Active Trainers',
        value: formatNumber(totalTrainers),
        change: 6.8,
        description: 'Number of active trainers',
        calculation: 'Count of unique trainer IDs',
        icon: 'trainers',
        rawValue: totalTrainers,
        breakdown: { avgClassSize }
      },
      {
        title: 'Member Lifetime Value',
        value: formatCurrency(avgLTV),
        change: 18.4,
        description: 'Average customer lifetime value',
        calculation: 'Average LTV across all members',
        icon: 'ltv',
        rawValue: avgLTV,
        breakdown: { newClients, totalMembers: newClientData.length }
      },
      {
        title: 'Average Class Size',
        value: avgClassSize.toFixed(1),
        change: 4.2,
        description: 'Average students per class (excluding empty)',
        calculation: 'Average class size across all trainers',
        icon: 'classSize',
        rawValue: avgClassSize,
        breakdown: { totalTrainers, totalSessions }
      },
      {
        title: 'Total Sessions',
        value: formatNumber(totalSessions),
        change: 7.9,
        description: 'Total number of sessions conducted',
        calculation: 'Count of all sessions',
        icon: 'sessions',
        rawValue: totalSessions,
        breakdown: { avgUtilization, totalCapacity, totalBookings }
      }
    ];
  }, [salesData, newClientData, sessionsData, leadsData, payrollData]);

  // Performance trends data with proper date parsing
  const performanceTrends = useMemo((): ChartDataPoint[] => {
    if (!salesData?.length) return [];

    const monthlyData = salesData.reduce((acc, item) => {
      let itemDate: Date | null = null;
      
      if (item.paymentDate) {
        const ddmmyyyy = item.paymentDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
          const [, day, month, year] = ddmmyyyy;
          itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          itemDate = new Date(item.paymentDate);
        }
      }
      
      if (!itemDate || isNaN(itemDate.getTime())) return acc;
      
      const monthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
      
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

  // Revenue chart data
  const revenueChartData = useMemo((): ChartDataPoint[] => {
    if (!salesData?.length) return [];

    const monthlyRevenue = salesData.reduce((acc, item) => {
      let itemDate: Date | null = null;
      
      if (item.paymentDate) {
        const ddmmyyyy = item.paymentDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
          const [, day, month, year] = ddmmyyyy;
          itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          itemDate = new Date(item.paymentDate);
        }
      }
      
      if (!itemDate || isNaN(itemDate.getTime())) return acc;
      
      const monthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      
      acc[monthKey] += item.paymentValue || 0;
      
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([date, value]) => ({
        date,
        value,
        category: 'Revenue'
      }));
  }, [salesData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
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
          Comprehensive business performance overview across all key metrics and departments
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
          data={salesData || []}
          type="revenue"
        />
        <InteractiveChart
          title="Business Growth Overview"
          data={salesData || []}
          type="performance"
        />
      </div>

      {/* Top/Bottom Performers */}
      <UnifiedTopBottomSellers 
        data={salesData || []} 
        onRowClick={(row) => console.log('Row clicked:', row)}
      />

      {/* Business Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <DollarSign className="w-5 h-5" />
              Revenue Health
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

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Target className="w-5 h-5" />
              Lead Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-900">
              {formatPercentage((leadsData?.filter(l => l.status === 'Converted').length || 0) / Math.max(leadsData?.length || 1, 1))}
            </p>
            <p className="text-sm text-orange-700">Conversion success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Data Tables */}
      <div className="space-y-8">
        <DataTable
          title="Sales Performance Summary"
          data={salesData || []}
          type="monthly"
          filters={{
            dateRange: { start: '', end: '' },
            location: [],
            category: [],
            product: [],
            soldBy: [],
            paymentMethod: []
          }}
          onRowClick={(row) => console.log('Sales row clicked:', row)}
        />
        
        <DataTable
          title="Product Performance Analysis"
          data={salesData || []}
          type="product"
          filters={{
            dateRange: { start: '', end: '' },
            location: [],
            category: [],
            product: [],
            soldBy: [],
            paymentMethod: []
          }}
          onRowClick={(row) => console.log('Product row clicked:', row)}
        />
        
        <DataTable
          title="Category Performance Breakdown"
          data={salesData || []}
          type="category"
          filters={{
            dateRange: { start: '', end: '' },
            location: [],
            category: [],
            product: [],
            soldBy: [],
            paymentMethod: []
          }}
          onRowClick={(row) => console.log('Category row clicked:', row)}
        />
      </div>

      {/* Key Performance Indicators Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <TrendingUp className="w-5 h-5" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-indigo-700">Revenue Growth</span>
              <span className="text-sm font-bold text-indigo-900">+12.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-indigo-700">Member Growth</span>
              <span className="text-sm font-bold text-indigo-900">+8.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-indigo-700">Session Growth</span>
              <span className="text-sm font-bold text-indigo-900">+5.7%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-800">
              <BarChart3 className="w-5 h-5" />
              Efficiency Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-rose-700">Session Utilization</span>
              <span className="text-sm font-bold text-rose-900">
                {formatPercentage((sessionsData?.reduce((sum, s) => sum + (s.checkedIn || 0), 0) || 0) / Math.max(sessionsData?.reduce((sum, s) => sum + (s.capacity || 0), 0) || 1, 1))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-rose-700">Avg Class Size</span>
              <span className="text-sm font-bold text-rose-900">
                {((payrollData?.reduce((sum, p) => sum + (p.classAverageExclEmpty || 0), 0) || 0) / Math.max(payrollData?.length || 1, 1)).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-rose-700">Lead Conversion</span>
              <span className="text-sm font-bold text-rose-900">
                {formatPercentage((leadsData?.filter(l => l.status === 'Converted').length || 0) / Math.max(leadsData?.length || 1, 1))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Award className="w-5 h-5" />
              Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-emerald-700">Avg Transaction Value</span>
              <span className="text-sm font-bold text-emerald-900">
                {formatCurrency((salesData?.reduce((sum, item) => sum + (item.paymentValue || 0), 0) || 0) / Math.max(salesData?.length || 1, 1))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-emerald-700">Member LTV</span>
              <span className="text-sm font-bold text-emerald-900">
                {formatCurrency((newClientData?.reduce((sum, client) => sum + (client.ltv || 0), 0) || 0) / Math.max(newClientData?.length || 1, 1))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-emerald-700">Retention Rate</span>
              <span className="text-sm font-bold text-emerald-900">
                {formatPercentage((newClientData?.filter(c => c.retentionStatus === 'Retained').length || 0) / Math.max(newClientData?.length || 1, 1))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveSummarySection;
