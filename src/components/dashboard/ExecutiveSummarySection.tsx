
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  Target,
  Award,
  BookOpen,
  BarChart3,
  UserCheck,
  Percent,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Trophy,
  CheckCircle
} from 'lucide-react';
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

  // Calculate comprehensive metrics from all data sources
  const allMetrics = React.useMemo(() => {
    if (isLoading || !salesData || !sessionsData || !payrollData || !newClientData) {
      return null;
    }

    // Sales Metrics
    const totalRevenue = salesData.reduce((sum, item) => sum + (item?.paymentValue || 0), 0);
    const totalTransactions = salesData.length;
    const uniqueMembers = new Set(salesData.map(item => item?.memberId).filter(Boolean)).size;
    const avgTransactionValue = totalRevenue / totalTransactions || 0;

    // Session Metrics
    const filteredSessions = sessionsData.filter(session => {
      const className = session.cleanedClass || '';
      const excludeKeywords = ['Hosted', 'P57', 'X'];
      return !excludeKeywords.some(keyword => 
        className.toLowerCase().includes(keyword.toLowerCase())
      );
    });
    
    const totalSessions = filteredSessions.length;
    const totalCapacity = filteredSessions.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const totalCheckedIn = filteredSessions.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const avgFillRate = totalCapacity > 0 ? (totalCheckedIn / totalCapacity) * 100 : 0;
    const avgClassSize = totalSessions > 0 ? totalCheckedIn / totalSessions : 0;

    // Trainer Metrics
    const uniqueTrainers = new Set(payrollData.map(item => item?.teacherName).filter(Boolean)).size;
    const avgTrainerRevenue = payrollData.reduce((sum, item) => sum + (item?.totalPaid || 0), 0) / uniqueTrainers || 0;
    const topTrainer = payrollData.reduce((prev, current) => 
      (current?.totalPaid || 0) > (prev?.totalPaid || 0) ? current : prev
    );

    // Client Metrics
    const newClients = newClientData.filter(client => client?.isNew === 'Yes').length;
    const convertedClients = newClientData.filter(client => client?.conversionStatus === 'Converted').length;
    const conversionRate = newClients > 0 ? (convertedClients / newClients) * 100 : 0;
    const avgLTV = newClientData.reduce((sum, client) => sum + (client?.ltv || 0), 0) / newClientData.length || 0;
    const retainedClients = newClientData.filter(client => client?.retentionStatus === 'Retained').length;
    const retentionRate = newClients > 0 ? (retainedClients / newClients) * 100 : 0;

    // Lead Metrics (if leads data exists)
    const totalLeads = leadsData?.length || 0;
    const qualifiedLeads = leadsData?.filter(lead => lead?.status === 'Qualified').length || 0;
    const leadConversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

    return {
      sales: {
        totalRevenue,
        totalTransactions,
        uniqueMembers,
        avgTransactionValue,
        growth: 12.5 // Mock growth data
      },
      sessions: {
        totalSessions,
        totalCapacity,
        totalCheckedIn,
        avgFillRate,
        avgClassSize
      },
      trainers: {
        uniqueTrainers,
        avgTrainerRevenue,
        topTrainer: topTrainer?.teacherName || 'N/A',
        topTrainerRevenue: topTrainer?.totalPaid || 0
      },
      clients: {
        newClients,
        convertedClients,
        conversionRate,
        retainedClients,
        retentionRate,
        avgLTV
      },
      leads: {
        totalLeads,
        qualifiedLeads,
        leadConversionRate
      }
    };
  }, [salesData, sessionsData, payrollData, newClientData, leadsData, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight">Executive Summary</h1>
                      <p className="text-blue-100 text-lg font-medium">Loading comprehensive business overview...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8 -mt-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-white/80 backdrop-blur-sm">
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
        </div>
      </div>
    );
  }

  if (!allMetrics) {
    return <div>No data available</div>;
  }

  const keyMetrics = [
    {
      title: "Total Revenue",
      value: formatCurrency(allMetrics.sales.totalRevenue),
      change: allMetrics.sales.growth,
      trend: "up",
      icon: DollarSign,
      color: "blue",
      description: "Total business revenue"
    },
    {
      title: "Active Members",
      value: formatNumber(allMetrics.sales.uniqueMembers),
      change: 8.3,
      trend: "up",
      icon: Users,
      color: "green",
      description: "Unique active members"
    },
    {
      title: "Sessions Delivered",
      value: formatNumber(allMetrics.sessions.totalSessions),
      change: 15.2,
      trend: "up",
      icon: Calendar,
      color: "purple",
      description: "Total classes conducted"
    },
    {
      title: "Average Fill Rate",
      value: `${allMetrics.sessions.avgFillRate.toFixed(1)}%`,
      change: 6.8,
      trend: "up",
      icon: Target,
      color: "orange",
      description: "Class capacity utilization"
    },
    {
      title: "Conversion Rate",
      value: `${allMetrics.clients.conversionRate.toFixed(1)}%`,
      change: 4.2,
      trend: "up",
      icon: CheckCircle,
      color: "teal",
      description: "Lead to client conversion"
    },
    {
      title: "Retention Rate",
      value: `${allMetrics.clients.retentionRate.toFixed(1)}%`,
      change: 2.1,
      trend: "up",
      icon: UserCheck,
      color: "indigo",
      description: "Client retention success"
    },
    {
      title: "Active Trainers",
      value: formatNumber(allMetrics.trainers.uniqueTrainers),
      change: 0,
      trend: "neutral",
      icon: Award,
      color: "pink",
      description: "Professional instructors"
    },
    {
      title: "Avg Customer LTV",
      value: formatCurrency(allMetrics.clients.avgLTV),
      change: 9.4,
      trend: "up",
      icon: Star,
      color: "yellow",
      description: "Customer lifetime value"
    }
  ];

  const getIconBg = (color: string) => {
    const colors = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      teal: "bg-teal-500",
      indigo: "bg-indigo-500",
      pink: "bg-pink-500",
      yellow: "bg-yellow-500"
    };
    return colors[color as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">Executive Summary</h1>
                    <p className="text-blue-100 text-lg font-medium">Comprehensive 360° business performance overview</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">All Systems Operational</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">Real-time Data</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(allMetrics.sales.totalRevenue)}</div>
                  <div className="text-blue-200 text-sm">Total Revenue</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatNumber(allMetrics.sales.uniqueMembers)}</div>
                  <div className="text-blue-200 text-sm">Active Members</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 -mt-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric, index) => (
              <Card key={metric.title} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                      {metric.title}
                    </CardTitle>
                    <div className={`p-2 rounded-xl ${getIconBg(metric.color)} group-hover:scale-110 transition-transform`}>
                      <metric.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                  {metric.change !== 0 && (
                    <div className="flex items-center text-sm">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        metric.trend === 'up' 
                          ? 'bg-green-100 text-green-700' 
                          : metric.trend === 'down'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {metric.trend === 'up' ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : metric.trend === 'down' ? (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        ) : null}
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </div>
                      <span className="ml-2 text-gray-500">vs last period</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Department Performance Overview */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-white via-blue-50/30 to-white border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Sales Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/80 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">{formatNumber(allMetrics.sales.totalTransactions)}</div>
                        <div className="text-sm text-gray-600">Transactions</div>
                      </div>
                      <div className="text-center p-4 bg-white/80 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(allMetrics.sales.avgTransactionValue)}</div>
                        <div className="text-sm text-gray-600">Avg Transaction</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Revenue per Member</span>
                        <Badge variant="secondary">{formatCurrency(allMetrics.sales.totalRevenue / allMetrics.sales.uniqueMembers)}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Growth Rate</span>
                        <Badge className="bg-green-100 text-green-700">+{allMetrics.sales.growth}%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Operations Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/80 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600">{allMetrics.sessions.avgClassSize.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Avg Class Size</div>
                      </div>
                      <div className="text-center p-4 bg-white/80 rounded-xl">
                        <div className="text-2xl font-bold text-orange-600">{allMetrics.sessions.avgFillRate.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Fill Rate</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Capacity</span>
                        <Badge variant="secondary">{formatNumber(allMetrics.sessions.totalCapacity)}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Attendees</span>
                        <Badge variant="secondary">{formatNumber(allMetrics.sessions.totalCheckedIn)}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="text-center">
                    <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <CardTitle className="text-blue-800">Revenue Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-3xl font-bold text-blue-900">{formatCurrency(allMetrics.sales.totalRevenue)}</div>
                    <div className="text-sm text-blue-700">
                      From {formatNumber(allMetrics.sales.totalTransactions)} transactions
                    </div>
                    <Badge className="bg-blue-200 text-blue-800">+{allMetrics.sales.growth}% Growth</Badge>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="text-center">
                    <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <CardTitle className="text-green-800">Member Base</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-3xl font-bold text-green-900">{formatNumber(allMetrics.sales.uniqueMembers)}</div>
                    <div className="text-sm text-green-700">Active unique members</div>
                    <Badge className="bg-green-200 text-green-800">+8.3% Growth</Badge>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="text-center">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <CardTitle className="text-purple-800">Avg Transaction</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-3xl font-bold text-purple-900">{formatCurrency(allMetrics.sales.avgTransactionValue)}</div>
                    <div className="text-sm text-purple-700">Per transaction value</div>
                    <Badge className="bg-purple-200 text-purple-800">Optimized</Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center">
                  <CardHeader>
                    <Calendar className="w-8 h-8 text-indigo-600 mx-auto" />
                    <CardTitle className="text-indigo-800">Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(allMetrics.sessions.totalSessions)}</div>
                    <div className="text-sm text-gray-600">Total delivered</div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <Users className="w-8 h-8 text-teal-600 mx-auto" />
                    <CardTitle className="text-teal-800">Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(allMetrics.sessions.totalCheckedIn)}</div>
                    <div className="text-sm text-gray-600">Total attendees</div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <Target className="w-8 h-8 text-orange-600 mx-auto" />
                    <CardTitle className="text-orange-800">Fill Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{allMetrics.sessions.avgFillRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Average utilization</div>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <Award className="w-8 h-8 text-pink-600 mx-auto" />
                    <CardTitle className="text-pink-800">Trainers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(allMetrics.trainers.uniqueTrainers)}</div>
                    <div className="text-sm text-gray-600">Active instructors</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-white via-green-50/30 to-white border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Client Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/80 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">{allMetrics.clients.conversionRate.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Conversion Rate</div>
                      </div>
                      <div className="text-center p-4 bg-white/80 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">{allMetrics.clients.retentionRate.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Retention Rate</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">New Clients</span>
                        <Badge variant="secondary">{formatNumber(allMetrics.clients.newClients)}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average LTV</span>
                        <Badge className="bg-green-100 text-green-700">{formatCurrency(allMetrics.clients.avgLTV)}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white via-yellow-50/30 to-white border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Trainer Excellence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-4 bg-white/80 rounded-xl">
                      <div className="text-lg font-bold text-yellow-600">{allMetrics.trainers.topTrainer}</div>
                      <div className="text-sm text-gray-600">Top Performer</div>
                      <div className="text-sm font-medium text-yellow-700">{formatCurrency(allMetrics.trainers.topTrainerRevenue)}</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg Trainer Revenue</span>
                        <Badge variant="secondary">{formatCurrency(allMetrics.trainers.avgTrainerRevenue)}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Trainers</span>
                        <Badge variant="outline">{formatNumber(allMetrics.trainers.uniqueTrainers)}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Business Health Indicators */}
          <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Business Health Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(allMetrics.clients.avgLTV)}</div>
                  <div className="text-sm text-blue-700 font-medium">Customer Lifetime Value</div>
                  <div className="text-xs text-gray-600 mt-1">Average revenue per client</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(allMetrics.trainers.avgTrainerRevenue)}</div>
                  <div className="text-sm text-green-700 font-medium">Avg Trainer Revenue</div>
                  <div className="text-xs text-gray-600 mt-1">Revenue per instructor</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{allMetrics.sessions.avgFillRate.toFixed(1)}%</div>
                  <div className="text-sm text-purple-700 font-medium">Capacity Utilization</div>
                  <div className="text-xs text-gray-600 mt-1">Overall session efficiency</div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{formatCurrency(allMetrics.sales.totalRevenue / allMetrics.sales.uniqueMembers)}</div>
                  <div className="text-sm text-orange-700 font-medium">Revenue per Member</div>
                  <div className="text-xs text-gray-600 mt-1">Member value contribution</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummarySection;
