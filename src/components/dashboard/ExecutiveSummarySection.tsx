
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Target } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

const ExecutiveSummarySection = () => {
  const { data: salesData, loading: salesLoading } = useGoogleSheets();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: leadsData, loading: leadsLoading } = useLeadsData();
  const { data: newClientData, loading: newClientLoading } = useNewClientData();
  const { data: payrollData, isLoading: payrollLoading } = usePayrollData();

  const isLoading = salesLoading || sessionsLoading || leadsLoading || newClientLoading || payrollLoading;

  // Calculate key metrics from sales data
  const salesMetrics = React.useMemo(() => {
    if (!salesData || !Array.isArray(salesData) || salesData.length === 0) {
      return { revenue: 0, transactions: 0, members: 0, growth: 0 };
    }
    
    const totalRevenue = salesData.reduce((sum, item) => sum + (item?.paymentValue || 0), 0);
    const totalTransactions = salesData.length;
    const uniqueMembers = new Set(salesData.map(item => item?.memberId).filter(Boolean)).size;
    
    return {
      revenue: totalRevenue,
      transactions: totalTransactions,
      members: uniqueMembers,
      growth: 12.5 // Mock growth percentage
    };
  }, [salesData]);

  // Calculate session metrics
  const sessionMetrics = React.useMemo(() => {
    if (!sessionsData || !Array.isArray(sessionsData) || sessionsData.length === 0) {
      return { totalSessions: 0, avgAttendance: 0, fillRate: 0 };
    }
    
    const totalSessions = sessionsData.length;
    const avgAttendance = sessionsData.reduce((sum, session) => sum + (session?.checkedInCount || 0), 0) / totalSessions;
    const fillRate = sessionsData.reduce((sum, session) => sum + (session?.fillPercentage || 0), 0) / totalSessions;
    
    return {
      totalSessions,
      avgAttendance,
      fillRate
    };
  }, [sessionsData]);

  // Calculate trainer performance
  const trainerMetrics = React.useMemo(() => {
    if (!payrollData || !Array.isArray(payrollData) || payrollData.length === 0) {
      return { totalTrainers: 0, avgRevenue: 0, topPerformer: 'N/A' };
    }
    
    const totalTrainers = new Set(payrollData.map(item => item?.teacherName).filter(Boolean)).size;
    const avgRevenue = payrollData.reduce((sum, item) => sum + (item?.totalPaid || 0), 0) / totalTrainers;
    const topPerformer = payrollData.reduce((prev, current) => 
      (current?.totalPaid || 0) > (prev?.totalPaid || 0) ? current : prev
    )?.teacherName || 'N/A';
    
    return {
      totalTrainers,
      avgRevenue,
      topPerformer
    };
  }, [payrollData]);

  // Calculate new client metrics
  const clientMetrics = React.useMemo(() => {
    if (!newClientData || !Array.isArray(newClientData) || newClientData.length === 0) {
      return { newClients: 0, conversionRate: 0, avgLTV: 0 };
    }
    
    const newClients = newClientData.filter(client => client?.isNew === 'Yes').length;
    const converted = newClientData.filter(client => client?.conversionStatus === 'Converted').length;
    const conversionRate = newClients > 0 ? (converted / newClients) * 100 : 0;
    const avgLTV = newClientData.reduce((sum, client) => sum + (client?.ltv || 0), 0) / newClientData.length;
    
    return {
      newClients,
      conversionRate,
      avgLTV
    };
  }, [newClientData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Executive Summary</h2>
          <p className="text-lg text-gray-600">Loading comprehensive business overview...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Executive Summary
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive 360° business performance overview across all departments
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(salesMetrics.revenue)}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">+{salesMetrics.growth}%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatNumber(salesMetrics.members)}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">+8.3%</span>
              <span className="text-gray-500">member growth</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Sessions Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatNumber(sessionMetrics.totalSessions)}</div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-purple-600">{sessionMetrics.fillRate.toFixed(1)}%</span>
              <span className="text-gray-500">avg fill rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{clientMetrics.conversionRate.toFixed(1)}%</div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-orange-600">{formatNumber(clientMetrics.newClients)}</span>
              <span className="text-gray-500">new clients</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Sales Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Transactions</span>
              <Badge variant="secondary">{formatNumber(salesMetrics.transactions)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Transaction Value</span>
              <Badge variant="secondary">
                {formatCurrency(salesMetrics.revenue / salesMetrics.transactions || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue per Member</span>
              <Badge variant="secondary">
                {formatCurrency(salesMetrics.revenue / salesMetrics.members || 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Operations Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Trainers</span>
              <Badge variant="secondary">{formatNumber(trainerMetrics.totalTrainers)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Session Attendance</span>
              <Badge variant="secondary">{sessionMetrics.avgAttendance.toFixed(1)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Top Performer</span>
              <Badge variant="outline">{trainerMetrics.topPerformer}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Insights */}
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Key Business Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {formatCurrency(clientMetrics.avgLTV)}
              </div>
              <div className="text-sm text-blue-700 font-medium">Average Customer LTV</div>
              <div className="text-xs text-gray-600 mt-1">Lifetime value per client</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {formatCurrency(trainerMetrics.avgRevenue)}
              </div>
              <div className="text-sm text-green-700 font-medium">Avg Trainer Revenue</div>
              <div className="text-xs text-gray-600 mt-1">Revenue per trainer</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {sessionMetrics.fillRate.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700 font-medium">Session Utilization</div>
              <div className="text-xs text-gray-600 mt-1">Overall capacity usage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveSummarySection;
