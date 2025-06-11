
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface InteractiveChartProps {
  title: string;
  data: SalesData[];
  type: 'revenue' | 'performance';
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ title, data, type }) => {
  const [activeChart, setActiveChart] = useState('bar');
  const [activeMetric, setActiveMetric] = useState('revenue');

  const processChartData = () => {
    if (type === 'revenue') {
      const monthlyData = data.reduce((acc, item) => {
        const month = new Date(item.paymentDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { month, revenue: 0, transactions: 0, units: 0 };
        }
        acc[month].revenue += item.paymentValue;
        acc[month].transactions += 1;
        acc[month].units += 1;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(monthlyData);
    }

    const categoryData = data.reduce((acc, item) => {
      const category = item.cleanedCategory;
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0 };
      }
      acc[category].value += item.paymentValue;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categoryData);
  };

  const chartData = processChartData();

  const renderChart = () => {
    switch (activeChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={type === 'revenue' ? 'month' : 'name'} stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), activeMetric === 'revenue' ? 'Revenue' : 'Value']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey={activeMetric === 'revenue' ? 'revenue' : 'value'} 
                fill="url(#barGradient)" 
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={type === 'revenue' ? 'month' : 'name'} stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), activeMetric === 'revenue' ? 'Revenue' : 'Value']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={activeMetric === 'revenue' ? 'revenue' : 'value'} 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.slice(0, 5)}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey={activeMetric === 'revenue' ? 'revenue' : 'value'}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [formatCurrency(value), 'Value']} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeChart === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('bar')}
              className="gap-1"
            >
              <BarChart3 className="w-4 h-4" />
              Bar
            </Button>
            <Button
              variant={activeChart === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('line')}
              className="gap-1"
            >
              <Activity className="w-4 h-4" />
              Line
            </Button>
            <Button
              variant={activeChart === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('pie')}
              className="gap-1"
            >
              <PieChartIcon className="w-4 h-4" />
              Pie
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeMetric} onValueChange={setActiveMetric} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          {renderChart()}
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Chart Insights</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Peak performance period shows {formatCurrency(Math.max(...chartData.map((d: any) => d.revenue || d.value || 0)))} in sales</li>
            <li>• Consistent growth trend observed across {chartData.length} data points</li>
            <li>• Interactive controls allow deep-dive analysis across multiple metrics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
