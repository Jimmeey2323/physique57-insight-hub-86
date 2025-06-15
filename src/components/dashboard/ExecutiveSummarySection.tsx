
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
  ArrowDownRight
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { SalesData } from '@/types/dashboard';

export const ExecutiveSummarySection = () => {
  const { data } = useGoogleSheets();

  // Calculate key metrics from the data
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalRevenue: 0,
        totalSales: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        monthlyGrowth: 0,
        topPackage: 'N/A',
        recentSales: []
      };
    }

    const totalRevenue = data.reduce((sum: number, item: SalesData) => sum + (item.amount || 0), 0);
    const totalSales = data.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Mock conversion rate and growth for demo
    const conversionRate = 75 + Math.random() * 20; // 75-95%
    const monthlyGrowth = -10 + Math.random() * 30; // -10% to +20%
    
    // Find most popular package
    const packageCounts: { [key: string]: number } = {};
    data.forEach((item: SalesData) => {
      const packageName = item.packageName || item.item || 'Unknown';
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
      recentSales
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

  return (
    <div className="space-y-8">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  {metrics.monthlyGrowth >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${metrics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metrics.monthlyGrowth).toFixed(1)}% vs last month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Sales</p>
                <p className="text-2xl font-bold text-green-900">{metrics.totalSales}</p>
                <p className="text-sm text-green-600 mt-1">Active transactions</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(metrics.averageOrderValue)}
                </p>
                <p className="text-sm text-purple-600 mt-1">Per transaction</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-900">
                  {metrics.conversionRate.toFixed(1)}%
                </p>
                <Progress value={metrics.conversionRate} className="mt-2 h-2" />
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performing Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Badge variant="secondary" className="text-lg px-4 py-2 mb-2">
                {metrics.topPackage}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Most popular choice among clients
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentSales.length > 0 ? (
                metrics.recentSales.slice(0, 3).map((sale: SalesData, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium text-sm">
                        {sale.packageName || sale.item || 'Package Sale'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sale.createdAt || sale.date || new Date().toISOString())}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {formatCurrency(sale.amount || 0)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent sales data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-indigo-500" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-blue-900">Client Retention</p>
              <p className="text-sm text-blue-600">Focus on existing clients for growth</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-900">Sales Momentum</p>
              <p className="text-sm text-green-600">Strong performance trajectory</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold text-purple-900">Peak Seasons</p>
              <p className="text-sm text-purple-600">Plan for seasonal variations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
