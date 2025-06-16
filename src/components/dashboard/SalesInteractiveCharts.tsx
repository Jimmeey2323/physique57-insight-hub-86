
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface SalesInteractiveChartsProps {
  data: SalesData[];
}

export const SalesInteractiveCharts: React.FC<SalesInteractiveChartsProps> = ({ data }) => {
  const [activeChart, setActiveChart] = useState('revenue');

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return null;
  };

  const monthlyData = useMemo(() => {
    const months = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    data.forEach(item => {
      const date = parseDate(item.paymentDate);
      if (date) {
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (!months[key]) {
          months[key] = {
            month: key,
            revenue: 0,
            transactions: 0,
            members: new Set(),
            vat: 0
          };
        }
        months[key].revenue += item.paymentValue || 0;
        months[key].transactions += 1;
        months[key].members.add(item.memberId);
        months[key].vat += item.paymentVAT || 0;
      }
    });

    return Object.values(months).map(month => ({
      ...month,
      members: month.members.size,
      atv: month.revenue / month.transactions || 0
    }));
  }, [data]);

  const categoryData = useMemo(() => {
    const categories = {};
    data.forEach(item => {
      const category = item.cleanedCategory || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = { name: category, value: 0, count: 0 };
      }
      categories[category].value += item.paymentValue || 0;
      categories[category].count += 1;
    });
    return Object.values(categories);
  }, [data]);

  const productData = useMemo(() => {
    const products = {};
    data.forEach(item => {
      const product = item.cleanedProduct || 'Uncategorized';
      if (!products[product]) {
        products[product] = { name: product, value: 0, count: 0 };
      }
      products[product].value += item.paymentValue || 0;
      products[product].count += 1;
    });
    return Object.values(products).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [data]);

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#84CC16'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Revenue Trend */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Monthly Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} className="text-xs" />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(value), name]}
                labelClassName="text-sm font-medium"
                contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fill="url(#colorRevenue)" 
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            Category Revenue Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products Performance */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Top 10 Products by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} className="text-xs" />
              <YAxis dataKey="name" type="category" width={120} className="text-xs" />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelClassName="text-sm font-medium"
                contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Multi-Metric Comparison */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Activity className="w-5 h-5 text-orange-600" />
            Multi-Metric Monthly Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue" className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} className="text-xs" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="transactions" className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(value) => formatNumber(value)} className="text-xs" />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Line type="monotone" dataKey="transactions" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="members" className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(value) => formatNumber(value)} className="text-xs" />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Line type="monotone" dataKey="members" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
