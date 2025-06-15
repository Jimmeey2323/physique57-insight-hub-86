
import React, { useMemo, useState } from 'react';
import { SalesData, FilterOptions, YearOnYearMetricType } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Grid, TrendingUp, Star, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryPerformanceTableProps {
  data: SalesData[];
  filters?: FilterOptions;
  onRowClick: (row: any) => void;
  selectedMetric?: YearOnYearMetricType;
}

export const CategoryPerformanceTable: React.FC<CategoryPerformanceTableProps> = ({
  data,
  filters = {
    dateRange: { start: '', end: '' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  },
  onRowClick,
  selectedMetric: initialMetric = 'revenue'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<YearOnYearMetricType>(initialMetric);

  const getMetricValue = (items: SalesData[], metric: YearOnYearMetricType) => {
    if (!items.length) return 0;
    switch (metric) {
      case 'revenue':
        return items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
      case 'transactions':
        return items.length;
      case 'members':
        return new Set(items.map(item => item.memberId)).size;
      case 'atv':
        const totalRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        return items.length > 0 ? totalRevenue / items.length : 0;
      case 'auv':
        const revenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        const uniqueMembers = new Set(items.map(item => item.memberId)).size;
        return uniqueMembers > 0 ? revenue / uniqueMembers : 0;
      default:
        return 0;
    }
  };

  const formatMetricValue = (value: number, metric: YearOnYearMetricType) => {
    switch (metric) {
      case 'revenue':
      case 'auv':
      case 'atv':
        return formatCurrency(value);
      case 'transactions':
      case 'members':
        return formatNumber(value);
      default:
        return formatNumber(value);
    }
  };

  const processedData = useMemo(() => {
    const categoryGroups = data.reduce((acc: Record<string, SalesData[]>, item) => {
      const category = item.cleanedCategory || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    const categoryData = Object.entries(categoryGroups).map(([category, items]) => {
      const metricValue = getMetricValue(items, selectedMetric);
      const revenue = getMetricValue(items, 'revenue');
      const transactions = getMetricValue(items, 'transactions');
      const members = getMetricValue(items, 'members');
      
      // Get unique products in this category
      const uniqueProducts = new Set(items.map(item => item.cleanedProduct)).size;
      
      // Calculate average per product
      const avgRevenuePerProduct = uniqueProducts > 0 ? revenue / uniqueProducts : 0;

      return {
        category,
        metricValue,
        revenue,
        transactions,
        members,
        uniqueProducts,
        avgRevenuePerProduct,
        rawData: items
      };
    });

    return categoryData.sort((a, b) => b.metricValue - a.metricValue);
  }, [data, selectedMetric]);

  // Calculate summary
  const summary = useMemo(() => {
    const totalRevenue = processedData.reduce((sum, item) => sum + item.revenue, 0);
    const totalTransactions = processedData.reduce((sum, item) => sum + item.transactions, 0);
    const totalMembers = processedData.reduce((sum, item) => sum + item.members, 0);
    const totalProducts = processedData.reduce((sum, item) => sum + item.uniqueProducts, 0);
    const topPerformer = processedData[0];
    
    return { totalRevenue, totalTransactions, totalMembers, totalProducts, topPerformer };
  }, [processedData]);

  const getPerformanceIndicator = (value: number, index: number) => {
    if (index === 0) return <Star className="w-4 h-4 text-yellow-500" />;
    if (index < 3) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Grid className="w-5 h-5 text-purple-600" />
                Category Performance Analysis
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Detailed performance metrics for all categories ranked by selected metric
              </p>
            </div>
          </div>
          
          <YearOnYearMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-t border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-purple-700 to-purple-900 text-white font-semibold text-sm uppercase tracking-wider">
              <tr>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-left">Rank</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-left">Category</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-center">Products</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-center">Revenue</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-center">Transactions</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-center">Members</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-center">Avg/Product</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-center">{selectedMetric.toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((category, index) => (
                <tr key={category.category} className="hover:bg-purple-50 cursor-pointer border-b border-gray-100 transition-colors duration-200" onClick={() => onRowClick(category.rawData)}>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-slate-700">#{index + 1}</span>
                      {getPerformanceIndicator(category.metricValue, index)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <Grid className="w-4 h-4 text-purple-600" />
                      {category.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {category.uniqueProducts}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{formatCurrency(category.revenue)}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{formatNumber(category.transactions)}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{formatNumber(category.members)}</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600 font-medium">{formatCurrency(category.avgRevenuePerProduct)}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-purple-700">{formatMetricValue(category.metricValue, selectedMetric)}</td>
                </tr>
              ))}
              
              {/* Summary Section */}
              <tr className="bg-gradient-to-r from-slate-100 to-slate-200 border-t-2 border-slate-300 font-bold">
                <td className="px-6 py-4 text-slate-800 text-sm" colSpan={2}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    TOTAL SUMMARY ({processedData.length} categories)
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-slate-800 text-sm font-bold">{formatNumber(summary.totalProducts)}</td>
                <td className="px-6 py-4 text-center text-slate-800 text-sm font-bold">{formatCurrency(summary.totalRevenue)}</td>
                <td className="px-6 py-4 text-center text-slate-800 text-sm font-bold">{formatNumber(summary.totalTransactions)}</td>
                <td className="px-6 py-4 text-center text-slate-800 text-sm font-bold">{formatNumber(summary.totalMembers)}</td>
                <td className="px-6 py-4 text-center text-slate-800 text-sm font-bold">
                  {formatCurrency(summary.totalRevenue / summary.totalProducts)}
                </td>
                <td className="px-6 py-4 text-center text-slate-800 text-sm font-bold">
                  {summary.topPerformer && (
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">{summary.topPerformer.category}</span>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
