
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  Award,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  GraduationCap,
  Clock,
  Percent
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

export const ExecutiveSummarySection = () => {
  const { data } = useGoogleSheets();

  // Calculate comprehensive metrics from the data
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalRevenue: 0,
        totalSales: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        monthlyGrowth: 0,
        topPackage: 'N/A',
        recentSales: [],
        totalMembers: 0,
        activeTrainers: 0,
        classUtilization: 0,
        retentionRate: 0,
        leadConversion: 0,
        avgSessionAttendance: 0
      };
    }

    const totalRevenue = data.reduce((sum: number, item: any) => sum + (item.revenue || item.price || 0), 0);
    const totalSales = data.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Mock additional metrics for comprehensive dashboard
    const conversionRate = 75 + Math.random() * 20; // 75-95%
    const monthlyGrowth = -10 + Math.random() * 30; // -10% to +20%
    const totalMembers = 450 + Math.floor(Math.random() * 200); // 450-650
    const activeTrainers = 12 + Math.floor(Math.random() * 8); // 12-20
    const classUtilization = 65 + Math.random() * 25; // 65-90%
    const retentionRate = 80 + Math.random() * 15; // 80-95%
    const leadConversion = 25 + Math.random() * 20; // 25-45%
    const avgSessionAttendance = 15 + Math.random() * 10; // 15-25
    
    // Find most popular package
    const packageCounts: { [key: string]: number } = {};
    data.forEach((item: any) => {
      const packageName = item.package || item.name || item.title || 'Unknown';
      packageCounts[packageName] = (packageCounts[packageName] || 0) + 1;
    });
    
    const topPackage = Object.keys(packageCounts).reduce((a, b) => 
      packageCounts[a] > packageCounts[b] ? a : b, 'N/A'
    );
    
    // Get recent sales (last 5)
    const recentSales = data.slice(-5).reverse();
    
    return {
      totalRevenue,
      totalSales,
      averageOrderValue,
      conversionRate,
      monthlyGrowth,
      topPackage,
      recentSales,
      totalMembers,
      activeTrainers,
      classUtilization,
      retentionRate,
      leadConversion,
      avgSessionAttendance
    };
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return dateString;
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, progress }: any) => (
    <Card className={`relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-105 border-0 bg-gradient-to-br ${color}`}>
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white`}>
              {change >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-white/80 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          
          {progress !== undefined && (
            <div className="mt-3">
              <Progress value={progress} className="h-2 bg-white/20" />
              <p className="text-xs text-white/70 mt-1">{progress.toFixed(0)}% of target</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Hero Metrics Section */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-light text-slate-800 mb-2 font-serif">
          <span className="font-extralight">Business</span>{' '}
          <span className="font-bold bg-gradient-to-r from-slate-800 via-gray-800 to-black bg-clip-text text-transparent">Overview</span>
        </h2>
        <p className="text-lg text-slate-600/80 font-light">Comprehensive performance insights across all operations</p>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto mt-4"></div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={metrics.monthlyGrowth}
          icon={DollarSign}
          color="from-slate-800 to-slate-900"
          progress={75}
        />
        
        <MetricCard
          title="Active Members"
          value={metrics.totalMembers.toLocaleString()}
          change={8.5}
          icon={Users}
          color="from-gray-700 to-gray-800"
          progress={metrics.retentionRate}
        />
        
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change={metrics.leadConversion - 30}
          icon={Target}
          color="from-slate-700 to-slate-800"
          progress={metrics.conversionRate}
        />
        
        <MetricCard
          title="Class Utilization"
          value={`${metrics.classUtilization.toFixed(0)}%`}
          change={5.2}
          icon={Calendar}
          color="from-gray-800 to-slate-900"
          progress={metrics.classUtilization}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(metrics.averageOrderValue)}
          change={12.3}
          icon={BarChart3}
          color="from-slate-600 to-slate-700"
        />
        
        <MetricCard
          title="Lead Conversion"
          value={`${metrics.leadConversion.toFixed(1)}%`}
          change={-2.1}
          icon={TrendingUp}
          color="from-gray-600 to-gray-700"
        />
        
        <MetricCard
          title="Active Trainers"
          value={metrics.activeTrainers.toString()}
          change={0}
          icon={Award}
          color="from-slate-700 to-gray-800"
        />
      </div>

      {/* Detailed Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Insights */}
        <Card className="bg-gradient-to-br from-white via-slate-50/50 to-white border-0 shadow-xl">
          <CardHeader className="border-b border-slate-200/50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Activity className="h-5 w-5 text-blue-600" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">New Member Growth</p>
                    <p className="text-sm text-slate-600">Monthly acquisition rate</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  +{(metrics.totalMembers * 0.08).toFixed(0)} this month
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Trainer Excellence</p>
                    <p className="text-sm text-slate-600">Average class size</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {metrics.avgSessionAttendance.toFixed(0)} members/class
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Retention Success</p>
                    <p className="text-sm text-slate-600">Member loyalty rate</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {metrics.retentionRate.toFixed(0)}% retained
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-gradient-to-br from-white via-slate-50/50 to-white border-0 shadow-xl">
          <CardHeader className="border-b border-slate-200/50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Award className="h-5 w-5 text-yellow-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200/50">
                <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-2">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="font-bold text-lg text-slate-800">{metrics.topPackage}</p>
                <p className="text-sm text-slate-600">Most Popular Package</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">{metrics.totalSales}</p>
                  <p className="text-xs text-slate-600">Total Sales</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">{((metrics.conversionRate + metrics.retentionRate) / 2).toFixed(0)}%</p>
                  <p className="text-xs text-slate-600">Success Rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card className="bg-gradient-to-br from-white via-slate-50/50 to-white border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200/50">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <PieChart className="h-5 w-5 text-indigo-600" />
            Business Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-blue-900">Excellent</p>
              <p className="text-sm text-blue-600">Revenue Performance</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-green-900">Growing</p>
              <p className="text-sm text-green-600">Member Base</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-bold text-purple-900">High</p>
              <p className="text-sm text-purple-600">Engagement</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <Percent className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="font-bold text-orange-900">Optimal</p>
              <p className="text-sm text-orange-600">Conversion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
