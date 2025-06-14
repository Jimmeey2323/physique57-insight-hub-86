
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Percent, TrendingDown, DollarSign, Target, MapPin, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useDiscountsData } from '@/hooks/useDiscountsData';
import { MetricCard } from './MetricCard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const locations = [
  { 
    id: 'all', 
    name: 'All Locations', 
    fullName: 'All Locations',
    icon: <Building2 className="w-4 h-4" />,
    gradient: 'from-blue-500 to-indigo-600'
  },
  { 
    id: 'Kwality House, Kemps Corner', 
    name: 'Kwality House', 
    fullName: 'Kwality House, Kemps Corner',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-600'
  },
  { 
    id: 'Supreme HQ, Bandra', 
    name: 'Supreme HQ', 
    fullName: 'Supreme HQ, Bandra',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-purple-500 to-violet-600'
  },
  { 
    id: 'Kenkere House', 
    name: 'Kenkere House', 
    fullName: 'Kenkere House',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-orange-500 to-red-600'
  }
];

export const DiscountsSection: React.FC = () => {
  const { data, loading, error, refetch } = useDiscountsData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = data;

    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => item.calculatedLocation === activeLocation);
    }

    return filtered;
  }, [data, activeLocation]);

  const metrics = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.grossRevenue || 0), 0);
    const totalDiscounts = filteredData.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const avgDiscountPercent = filteredData.length > 0 ? 
      filteredData.reduce((sum, item) => sum + (item.grossDiscountPercent || 0), 0) / filteredData.length : 0;
    const transactionsWithDiscount = filteredData.filter(item => (item.discountAmount || 0) > 0).length;

    return [
      {
        title: "Total Revenue",
        value: formatCurrency(totalRevenue),
        change: 12.5,
        description: "Gross revenue across all transactions",
        calculation: "Sum of all gross revenue",
        icon: "dollar-sign"
      },
      {
        title: "Total Discounts",
        value: formatCurrency(totalDiscounts),
        change: -8.2,
        description: "Total discount amount given",
        calculation: "Sum of all discount amounts",
        icon: "trending-down"
      },
      {
        title: "Avg Discount %",
        value: `${avgDiscountPercent.toFixed(1)}%`,
        change: -3.1,
        description: "Average discount percentage",
        calculation: "Average of all discount percentages",
        icon: "percent"
      },
      {
        title: "Discounted Transactions",
        value: formatNumber(transactionsWithDiscount),
        change: 5.7,
        description: "Transactions with discounts applied",
        calculation: "Count of transactions with discount > 0",
        icon: "target"
      }
    ];
  }, [filteredData]);

  // Month-on-Month analysis
  const monthOnMonthData = useMemo(() => {
    const monthlyData = filteredData.reduce((acc, item) => {
      if (!item.paymentDate) return acc;
      const date = new Date(item.paymentDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[month]) {
        acc[month] = {
          revenue: 0,
          discounts: 0,
          transactions: 0,
          discountedTransactions: 0
        };
      }
      
      acc[month].revenue += item.grossRevenue || 0;
      acc[month].discounts += item.discountAmount || 0;
      acc[month].transactions++;
      if ((item.discountAmount || 0) > 0) acc[month].discountedTransactions++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      discounts: data.discounts,
      transactions: data.transactions,
      discountedTransactions: data.discountedTransactions,
      discountRate: ((data.discounts / data.revenue) * 100).toFixed(1),
      discountPenetration: ((data.discountedTransactions / data.transactions) * 100).toFixed(1)
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  // Product/Category analysis
  const productDiscountData = useMemo(() => {
    const productStats = filteredData.reduce((acc, item) => {
      const product = item.cleanedProduct || 'Unknown';
      if (!acc[product]) {
        acc[product] = {
          revenue: 0,
          discounts: 0,
          transactions: 0,
          discountedTransactions: 0
        };
      }
      
      acc[product].revenue += item.grossRevenue || 0;
      acc[product].discounts += item.discountAmount || 0;
      acc[product].transactions++;
      if ((item.discountAmount || 0) > 0) acc[product].discountedTransactions++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(productStats).map(([product, data]) => ({
      product,
      revenue: data.revenue,
      discounts: data.discounts,
      transactions: data.transactions,
      discountedTransactions: data.discountedTransactions,
      discountRate: ((data.discounts / data.revenue) * 100).toFixed(1),
      discountPenetration: ((data.discountedTransactions / data.transactions) * 100).toFixed(1),
      avgDiscountPerTransaction: (data.discounts / data.discountedTransactions).toFixed(0)
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredData]);

  // Sales rep analysis
  const salesRepData = useMemo(() => {
    const repStats = filteredData.reduce((acc, item) => {
      const rep = item.soldBy || 'Unknown';
      if (!acc[rep]) {
        acc[rep] = {
          revenue: 0,
          discounts: 0,
          transactions: 0,
          discountedTransactions: 0
        };
      }
      
      acc[rep].revenue += item.grossRevenue || 0;
      acc[rep].discounts += item.discountAmount || 0;
      acc[rep].transactions++;
      if ((item.discountAmount || 0) > 0) acc[rep].discountedTransactions++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(repStats).map(([rep, data]) => ({
      rep,
      revenue: data.revenue,
      discounts: data.discounts,
      transactions: data.transactions,
      discountedTransactions: data.discountedTransactions,
      discountRate: ((data.discounts / data.revenue) * 100).toFixed(1),
      discountPenetration: ((data.discountedTransactions / data.transactions) * 100).toFixed(1),
      avgDiscountPerTransaction: (data.discounts / data.discountedTransactions).toFixed(0)
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredData]);

  // Chart data for revenue vs discounts
  const chartData = useMemo(() => {
    return monthOnMonthData.map(item => ({
      month: item.month,
      revenue: item.revenue,
      discounts: item.discounts,
      discountRate: parseFloat(item.discountRate)
    }));
  }, [monthOnMonthData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading Discounts Data</p>
              <p className="text-sm text-gray-600">Analyzing discount patterns...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
        <Card className="p-8 bg-white shadow-lg max-w-md">
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Connection Error</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-600">No discount data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/20">
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-pink-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-30">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
            <g fill="none" fillRule="evenodd">
              <g fill="#ffffff" fillOpacity="0.05">
                <circle cx="60" cy="60" r="30"/>
              </g>
            </g>
          </svg>
        </div>
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                <Percent className="w-5 h-5" />
                <span className="font-medium">Discount Analytics</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-red-100 to-orange-100 bg-clip-text text-transparent">
                Discount Intelligence Hub
              </h1>
              
              <p className="text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
                Optimize pricing strategies and track discount performance across all channels
              </p>
              
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(filteredData.reduce((sum, item) => sum + (item.grossRevenue || 0), 0))}
                  </div>
                  <div className="text-sm text-red-200">Total Revenue</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(filteredData.reduce((sum, item) => sum + (item.discountAmount || 0), 0))}
                  </div>
                  <div className="text-sm text-red-200">Total Discounts</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {filteredData.length > 0 ? 
                      `${(filteredData.reduce((sum, item) => sum + (item.discountAmount || 0), 0) / 
                      filteredData.reduce((sum, item) => sum + (item.grossRevenue || 0), 0) * 100).toFixed(1)}%` : 
                      '0%'
                    }
                  </div>
                  <div className="text-sm text-red-200">Discount Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Location Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
          <CardContent className="p-2">
            <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl h-auto gap-2">
                {locations.map((location) => (
                  <TabsTrigger
                    key={location.id}
                    value={location.id}
                    className={`
                      relative group overflow-hidden rounded-xl px-6 py-4 font-semibold text-sm 
                      transition-all duration-300 ease-out hover:scale-105
                      data-[state=active]:bg-gradient-to-r data-[state=active]:${location.gradient}
                      data-[state=active]:text-white data-[state=active]:shadow-lg
                      data-[state=active]:border-0 hover:bg-white/80
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative z-10">
                        {location.icon}
                      </div>
                      <div className="relative z-10 text-left">
                        <div className="font-bold">{location.name}</div>
                        <div className="text-xs opacity-75">{location.fullName}</div>
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              {locations.map((location) => (
                <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
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

                  {/* Revenue vs Discounts Chart */}
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-gray-800 text-xl">Revenue vs Discounts Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ChartContainer
                        config={{
                          revenue: {
                            label: "Revenue",
                            color: "hsl(var(--chart-1))",
                          },
                          discounts: {
                            label: "Discounts",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="revenue" fill="var(--color-revenue)" />
                            <Bar dataKey="discounts" fill="var(--color-discounts)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Month-on-Month Performance Table */}
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-gray-800 text-xl">Month-on-Month Discount Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead>Month</TableHead>
                              <TableHead>Revenue</TableHead>
                              <TableHead>Discounts</TableHead>
                              <TableHead>Transactions</TableHead>
                              <TableHead>Discounted</TableHead>
                              <TableHead>Discount Rate</TableHead>
                              <TableHead>Penetration</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {monthOnMonthData.map((row, index) => (
                              <TableRow key={row.month} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{row.month}</TableCell>
                                <TableCell className="font-bold text-green-600">{formatCurrency(row.revenue)}</TableCell>
                                <TableCell className="font-bold text-red-600">{formatCurrency(row.discounts)}</TableCell>
                                <TableCell>{row.transactions}</TableCell>
                                <TableCell>{row.discountedTransactions}</TableCell>
                                <TableCell>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    parseFloat(row.discountRate) <= 10 ? 'bg-green-100 text-green-800' :
                                    parseFloat(row.discountRate) <= 20 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {row.discountRate}%
                                  </span>
                                </TableCell>
                                <TableCell>{row.discountPenetration}%</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-gray-100 font-bold">
                              <TableCell>Total</TableCell>
                              <TableCell className="text-green-600">
                                {formatCurrency(monthOnMonthData.reduce((sum, row) => sum + row.revenue, 0))}
                              </TableCell>
                              <TableCell className="text-red-600">
                                {formatCurrency(monthOnMonthData.reduce((sum, row) => sum + row.discounts, 0))}
                              </TableCell>
                              <TableCell>{monthOnMonthData.reduce((sum, row) => sum + row.transactions, 0)}</TableCell>
                              <TableCell>{monthOnMonthData.reduce((sum, row) => sum + row.discountedTransactions, 0)}</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>-</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Discount Performance */}
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-gray-800 text-xl">Product Discount Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead>Product</TableHead>
                              <TableHead>Revenue</TableHead>
                              <TableHead>Discounts</TableHead>
                              <TableHead>Discount Rate</TableHead>
                              <TableHead>Penetration</TableHead>
                              <TableHead>Avg Discount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productDiscountData.slice(0, 10).map((row, index) => (
                              <TableRow key={row.product} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{row.product}</TableCell>
                                <TableCell className="font-bold text-green-600">{formatCurrency(row.revenue)}</TableCell>
                                <TableCell className="font-bold text-red-600">{formatCurrency(row.discounts)}</TableCell>
                                <TableCell>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    parseFloat(row.discountRate) <= 10 ? 'bg-green-100 text-green-800' :
                                    parseFloat(row.discountRate) <= 20 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {row.discountRate}%
                                  </span>
                                </TableCell>
                                <TableCell>{row.discountPenetration}%</TableCell>
                                <TableCell>{formatCurrency(parseFloat(row.avgDiscountPerTransaction))}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-gray-100 font-bold">
                              <TableCell>Total</TableCell>
                              <TableCell className="text-green-600">
                                {formatCurrency(productDiscountData.reduce((sum, row) => sum + row.revenue, 0))}
                              </TableCell>
                              <TableCell className="text-red-600">
                                {formatCurrency(productDiscountData.reduce((sum, row) => sum + row.discounts, 0))}
                              </TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>-</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sales Rep Performance */}
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-gray-800 text-xl">Sales Rep Discount Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead>Sales Rep</TableHead>
                              <TableHead>Revenue</TableHead>
                              <TableHead>Discounts</TableHead>
                              <TableHead>Discount Rate</TableHead>
                              <TableHead>Penetration</TableHead>
                              <TableHead>Avg Discount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {salesRepData.slice(0, 10).map((row, index) => (
                              <TableRow key={row.rep} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{row.rep}</TableCell>
                                <TableCell className="font-bold text-green-600">{formatCurrency(row.revenue)}</TableCell>
                                <TableCell className="font-bold text-red-600">{formatCurrency(row.discounts)}</TableCell>
                                <TableCell>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    parseFloat(row.discountRate) <= 10 ? 'bg-green-100 text-green-800' :
                                    parseFloat(row.discountRate) <= 20 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {row.discountRate}%
                                  </span>
                                </TableCell>
                                <TableCell>{row.discountPenetration}%</TableCell>
                                <TableCell>{formatCurrency(parseFloat(row.avgDiscountPerTransaction))}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-gray-100 font-bold">
                              <TableCell>Total</TableCell>
                              <TableCell className="text-green-600">
                                {formatCurrency(salesRepData.reduce((sum, row) => sum + row.revenue, 0))}
                              </TableCell>
                              <TableCell className="text-red-600">
                                {formatCurrency(salesRepData.reduce((sum, row) => sum + row.discounts, 0))}
                              </TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>-</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
