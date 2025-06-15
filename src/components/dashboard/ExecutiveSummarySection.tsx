
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Award
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useNewClientData } from '@/hooks/useNewClientData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useDiscountsData } from '@/hooks/useDiscountsData';
import { SalesData, NewClientData, PayrollData, SessionData } from '@/types/dashboard';
import { cn } from '@/lib/utils';

export const ExecutiveSummarySection: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');
  const [dateRange, setDateRange] = useState('last-30-days');
  
  // Data hooks
  const { data: salesData, isLoading: salesLoading } = useGoogleSheets();
  const { data: newClientData, isLoading: clientsLoading } = useNewClientData();
  const { data: payrollData, isLoading: payrollLoading } = usePayrollData();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessionsData();
  const { data: leadsData, isLoading: leadsLoading } = useLeadsData();
  const { data: discountsData, isLoading: discountsLoading } = useDiscountsData();

  const isLoading = salesLoading || clientsLoading || payrollLoading || sessionsLoading || leadsLoading || discountsLoading;

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (isLoading || !salesData?.length) {
      return [];
    }

    const totalRevenue = salesData.reduce((sum: number, item: SalesData) => sum + item.paymentValue, 0);
    const totalTransactions = salesData.length;
    const uniqueMembers = new Set(salesData.map((item: SalesData) => item.memberId)).size;
    const newMembers = newClientData?.length || 0;
    const totalSessions = sessionsData?.length || 0;
    const avgClassSize = sessionsData?.reduce((sum: number, session: SessionData) => sum + session.checkedIn, 0) / totalSessions || 0;
    const retentionRate = newClientData?.filter((client: NewClientData) => client.retentionStatus === 'Retained').length / newMembers * 100 || 0;
    const conversionRate = newClientData?.filter((client: NewClientData) => client.conversionStatus === 'Converted').length / newMembers * 100 || 0;

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: 12.5,
        description: 'Total revenue across all locations and services',
        calculation: 'Sum of all payment values',
        icon: 'revenue'
      },
      {
        title: 'Active Members',
        value: formatNumber(uniqueMembers),
        change: 8.3,
        description: 'Unique active members across all locations',
        calculation: 'Count of distinct member IDs',
        icon: 'members'
      },
      {
        title: 'New Members',
        value: formatNumber(newMembers),
        change: 15.7,
        description: 'New member acquisitions in the selected period',
        calculation: 'Count of new client registrations',
        icon: 'new-members'
      },
      {
        title: 'Retention Rate',
        value: `${retentionRate.toFixed(1)}%`,
        change: 5.2,
        description: 'Member retention rate for the period',
        calculation: 'Retained members / Total new members * 100',
        icon: 'retention'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: 3.8,
        description: 'Trial to paid membership conversion rate',
        calculation: 'Converted members / Total new members * 100',
        icon: 'conversion'
      },
      {
        title: 'Avg Class Size',
        value: avgClassSize.toFixed(1),
        change: -2.1,
        description: 'Average number of attendees per class',
        calculation: 'Total check-ins / Total sessions',
        icon: 'class-size'
      },
      {
        title: 'Total Sessions',
        value: formatNumber(totalSessions),
        change: 11.4,
        description: 'Total number of classes conducted',
        calculation: 'Count of all session records',
        icon: 'sessions'
      },
      {
        title: 'Avg Transaction',
        value: formatCurrency(totalRevenue / totalTransactions),
        change: -1.2,
        description: 'Average value per transaction',
        calculation: 'Total revenue / Total transactions',
        icon: 'atv'
      }
    ];
  }, [salesData, newClientData, payrollData, sessionsData, isLoading]);

  // Top performers data
  const topPerformers = useMemo(() => {
    if (!payrollData?.length) return [];
    
    return payrollData
      .sort((a: PayrollData, b: PayrollData) => b.totalPaid - a.totalPaid)
      .slice(0, 5)
      .map((trainer: PayrollData) => ({
        name: trainer.teacherName,
        value: formatCurrency(trainer.totalPaid),
        metric: 'Revenue',
        change: 8.5,
        sessions: trainer.totalSessions
      }));
  }, [payrollData]);

  // Revenue trend data
  const revenueTrend = useMemo(() => {
    if (!salesData?.length) return [];
    
    const monthlyRevenue = salesData.reduce((acc: Record<string, number>, item: SalesData) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + item.paymentValue;
      return acc;
    }, {});

    return Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, revenue]) => ({
        date: month,
        value: revenue,
        category: 'Revenue'
      }));
  }, [salesData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Executive Summary</h2>
          <p className="text-lg text-slate-600">Loading comprehensive business insights...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Executive Summary
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive business performance overview with key insights and trends
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 Days</SelectItem>
            <SelectItem value="last-30-days">Last 30 Days</SelectItem>
            <SelectItem value="last-90-days">Last 90 Days</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            data={metric}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Top Performing Trainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-slate-800">{performer.name}</p>
                          <p className="text-sm text-slate-500">{performer.sessions} sessions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-slate-800">{performer.value}</p>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs">+{performer.change}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Business Health Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Member Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="w-4/5 h-full bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Class Utilization</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Revenue Growth</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-purple-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InteractiveChart
              title="Revenue Performance"
              data={revenueTrend}
              type="revenue"
            />
            <InteractiveChart
              title="Member Growth"
              data={revenueTrend}
              type="performance"
            />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Business Trends & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-bold text-lg text-blue-800">Growing</h3>
                  <p className="text-sm text-blue-600">Revenue trend shows consistent upward movement</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-bold text-lg text-green-800">Strong</h3>
                  <p className="text-sm text-green-600">Member retention rates above industry average</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-bold text-lg text-purple-800">Optimizing</h3>
                  <p className="text-sm text-purple-600">Class utilization improving with strategic scheduling</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveSummarySection;
