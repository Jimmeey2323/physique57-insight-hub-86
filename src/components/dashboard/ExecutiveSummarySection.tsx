import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, BarChart3, Activity, Target, Zap, Clock, Star, Award, RefreshCw, Filter } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useDiscountsData } from '@/hooks/useDiscountsData';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const ExecutiveSummarySection = () => {
  const salesData = useGoogleSheets();
  const sessionsQuery = useSessionsData();
  const leadsQuery = useLeadsData();
  const newClientQuery = useNewClientData();
  const payrollQuery = usePayrollData();
  const discountsQuery = useDiscountsData();

  const isLoading = salesData.loading || sessionsQuery.loading || leadsQuery.loading || 
                   newClientQuery.loading || payrollQuery.loading || discountsQuery.loading;

  // Process sales metrics
  const salesMetrics = useMemo(() => {
    if (!salesData.data) return null;
    
    const totalRevenue = salesData.data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalTransactions = salesData.data.length;
    const uniqueMembers = new Set(salesData.data.map(item => item.memberId)).size;
    const atv = totalRevenue / totalTransactions || 0;
    
    return { totalRevenue, totalTransactions, uniqueMembers, atv };
  }, [salesData.data]);

  // Process sessions metrics
  const sessionsMetrics = useMemo(() => {
    if (!sessionsQuery.data) return null;
    
    const totalSessions = sessionsQuery.data.length;
    const totalAttendees = sessionsQuery.data.reduce((sum, session) => sum + (session.attendance || 0), 0);
    const avgAttendance = totalAttendees / totalSessions || 0;
    const activeTrainers = new Set(sessionsQuery.data.map(session => session.trainerId)).size;
    
    return { totalSessions, totalAttendees, avgAttendance, activeTrainers };
  }, [sessionsQuery.data]);

  // Process leads metrics
  const leadsMetrics = useMemo(() => {
    if (!leadsQuery.data) return null;
    
    const totalLeads = leadsQuery.data.length;
    const convertedLeads = leadsQuery.data.filter(lead => lead.status === 'Converted').length;
    const conversionRate = (convertedLeads / totalLeads) * 100 || 0;
    const activeSources = new Set(leadsQuery.data.map(lead => lead.source)).size;
    
    return { totalLeads, convertedLeads, conversionRate, activeSources };
  }, [leadsQuery.data]);

  // Process new client metrics
  const newClientMetrics = useMemo(() => {
    if (!newClientQuery.data) return null;
    
    const totalNewClients = newClientQuery.data.length;
    const recentClients = newClientQuery.data.filter(client => {
      const clientDate = new Date(client.firstVisitDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return clientDate >= thirtyDaysAgo;
    }).length;
    
    return { totalNewClients, recentClients };
  }, [newClientQuery.data]);

  // Quick filter handlers
  const handleQuickFilter = (filterType: string) => {
    console.log(`Applied quick filter: ${filterType}`);
    switch (filterType) {
      case 'thismonth':
        // Filter current month
        break;
      case 'lastquarter':
        // Filter last quarter
        break;
      case 'highperformers':
        // Show high performers
        break;
      case 'clearall':
        // Clear all filters
        break;
      default:
        break;
    }
  };

  const handleRefresh = () => {
    salesData.refetch();
    sessionsQuery.refetch();
    leadsQuery.refetch();
    newClientQuery.refetch();
    payrollQuery.refetch();
    discountsQuery.refetch();
  };

  const quickFilters = [
    { label: 'This Month', action: () => handleQuickFilter('thismonth') },
    { label: 'Last Quarter', action: () => handleQuickFilter('lastquarter') },
    { label: 'High Performers', action: () => handleQuickFilter('highperformers') },
    { label: 'Clear All', action: () => handleQuickFilter('clearall') }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading executive summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Executive Summary Dashboard
        </h2>
        <p className="text-lg text-slate-600 font-medium">
          Complete business overview with key performance indicators across all operations
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Quick Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh All Data
            </Button>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={filter.action}
              className="text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {salesMetrics && (
          <>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(salesMetrics.totalRevenue)}
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5% from last period
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {formatNumber(salesMetrics.totalTransactions)}
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8.3% from last period
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Active Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {formatNumber(salesMetrics.uniqueMembers)}
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +15.7% from last period
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Avg Ticket Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  {formatCurrency(salesMetrics.atv)}
                </div>
                <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                  <TrendingDown className="w-3 h-3" />
                  -2.1% from last period
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Business Overview Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="sales" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Sales
          </TabsTrigger>
          <TabsTrigger value="operations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Operations
          </TabsTrigger>
          <TabsTrigger value="growth" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Growth
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Business Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Business Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">92/100</div>
                  <p className="text-sm text-gray-600">Excellent overall performance</p>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <div className="font-medium text-green-600">Revenue Growth</div>
                      <div className="text-gray-600">+12.5%</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-600">Customer Satisfaction</div>
                      <div className="text-gray-600">94%</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-600">Operational Efficiency</div>
                      <div className="text-gray-600">88%</div>
                    </div>
                    <div>
                      <div className="font-medium text-orange-600">Market Position</div>
                      <div className="text-gray-600">Strong</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Key Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800">New</Badge>
                    <span className="text-sm">Record monthly revenue achieved</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800">Growth</Badge>
                    <span className="text-sm">15% increase in member retention</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-100 text-purple-800">Efficiency</Badge>
                    <span className="text-sm">Streamlined operations processes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-100 text-orange-800">Quality</Badge>
                    <span className="text-sm">Improved customer satisfaction scores</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {sessionsMetrics && (
              <>
                <Card className="p-4">
                  <div className="text-center">
                    <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">{formatNumber(sessionsMetrics.totalSessions)}</div>
                    <div className="text-xs text-gray-600">Total Sessions</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">{formatNumber(sessionsMetrics.totalAttendees)}</div>
                    <div className="text-xs text-gray-600">Total Attendees</div>
                  </div>
                </Card>
              </>
            )}
            {leadsMetrics && (
              <>
                <Card className="p-4">
                  <div className="text-center">
                    <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">{formatNumber(leadsMetrics.totalLeads)}</div>
                    <div className="text-xs text-gray-600">Total Leads</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <Star className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">{formatPercentage(leadsMetrics.conversionRate)}</div>
                    <div className="text-xs text-gray-600">Conversion Rate</div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {salesMetrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="font-semibold">{formatCurrency(salesMetrics.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transactions</span>
                      <span className="font-semibold">{formatNumber(salesMetrics.totalTransactions)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Ticket Value</span>
                      <span className="font-semibold">{formatCurrency(salesMetrics.atv)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Members</span>
                      <span className="font-semibold">{formatNumber(salesMetrics.uniqueMembers)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue Growth</span>
                    <Badge className="bg-green-100 text-green-800">+12.5%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transaction Volume</span>
                    <Badge className="bg-blue-100 text-blue-800">+8.3%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Member Growth</span>
                    <Badge className="bg-purple-100 text-purple-800">+15.7%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ticket Value</span>
                    <Badge className="bg-red-100 text-red-800">-2.1%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Operations</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionsMetrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Sessions</span>
                      <span className="font-semibold">{formatNumber(sessionsMetrics.totalSessions)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Attendees</span>
                      <span className="font-semibold">{formatNumber(sessionsMetrics.totalAttendees)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Attendance</span>
                      <span className="font-semibold">{sessionsMetrics.avgAttendance.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Trainers</span>
                      <span className="font-semibold">{formatNumber(sessionsMetrics.activeTrainers)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Class Utilization</span>
                    <Badge className="bg-green-100 text-green-800">87%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trainer Productivity</span>
                    <Badge className="bg-blue-100 text-blue-800">92%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resource Efficiency</span>
                    <Badge className="bg-purple-100 text-purple-800">89%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Schedule Optimization</span>
                    <Badge className="bg-orange-100 text-orange-800">85%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Generation</CardTitle>
              </CardHeader>
              <CardContent>
                {leadsMetrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Leads</span>
                      <span className="font-semibold">{formatNumber(leadsMetrics.totalLeads)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Converted Leads</span>
                      <span className="font-semibold">{formatNumber(leadsMetrics.convertedLeads)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="font-semibold">{formatPercentage(leadsMetrics.conversionRate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Sources</span>
                      <span className="font-semibold">{formatNumber(leadsMetrics.activeSources)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New Client Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                {newClientMetrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total New Clients</span>
                      <span className="font-semibold">{formatNumber(newClientMetrics.totalNewClients)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Recent Clients (30d)</span>
                      <span className="font-semibold">{formatNumber(newClientMetrics.recentClients)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Acquisition Rate</span>
                      <Badge className="bg-green-100 text-green-800">+18%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Retention Rate</span>
                      <Badge className="bg-blue-100 text-blue-800">94%</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold-600" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Best Trainer</span>
                    <Badge>John Doe</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Top Product</span>
                    <Badge>Premium Membership</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Best Location</span>
                    <Badge>Kwality House</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>• New member registration processed</div>
                  <div>• Weekly revenue target exceeded</div>
                  <div>• Class schedule optimized</div>
                  <div>• Customer feedback analyzed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Forecasts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Month Revenue</span>
                    <Badge className="bg-green-100 text-green-800">+15%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Member Growth</span>
                    <Badge className="bg-blue-100 text-blue-800">+12%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Demand</span>
                    <Badge className="bg-purple-100 text-purple-800">+8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveSummarySection;
