
import React, { useMemo, useState } from 'react';
import { SalesData, FilterOptions, YearOnYearMetricType } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Package, TrendingUp, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductPerformanceTableProps {
  data: SalesData[];
  filters?: FilterOptions;
  onRowClick: (row: any) => void;
  selectedMetric?: YearOnYearMetricType;
}

export const ProductPerformanceTable: React.FC<ProductPerformanceTableProps> = ({
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
    const productGroups = data.reduce((acc: Record<string, SalesData[]>, item) => {
      const product = item.cleanedProduct || 'Unspecified';
      if (!acc[product]) {
        acc[product] = [];
      }
      acc[product].push(item);
      return acc;
    }, {});

    const productData = Object.entries(productGroups).map(([product, items]) => {
      const metricValue = getMetricValue(items, selectedMetric);
      const revenue = getMetricValue(items, 'revenue');
      const transactions = getMetricValue(items, 'transactions');
      const members = getMetricValue(items, 'members');
      const category = items[0]?.cleanedCategory || 'Uncategorized';

      return {
        product,
        category,
        metricValue,
        revenue,
        transactions,
        members,
        rawData: items
      };
    });

    return productData.sort((a, b) => b.metricValue - a.metricValue);
  }, [data, selectedMetric]);

  // Calculate summary
  const summary = useMemo(() => {
    const totalRevenue = processedData.reduce((sum, item) => sum + item.revenue, 0);
    const totalTransactions = processedData.reduce((sum, item) => sum + item.transactions, 0);
    const totalMembers = processedData.reduce((sum, item) => sum + item.members, 0);
    const topPerformer = processedData[0];
    
    return { totalRevenue, totalTransactions, totalMembers, topPerformer };
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
                <Package className="w-5 h-5 text-green-600" />
                Product Performance Analysis
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Detailed performance metrics for all products ranked by selected metric
              </p>
            </div>
          </div>
          
          <YearOnYearMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-t border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-green-700 to-green-900 text-white font-semibold text-sm uppercase tracking-wider">
              <tr>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-left">Rank</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-left">Product</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-left">Category</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-center">Revenue</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-center">Transactions</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-center">Members</th>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-center">{selectedMetric.toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((product, index) => (
                <tr key={product.product} className="hover:bg-green-50 cursor-pointer border-b border-gray-100 transition-colors duration-200" onClick={() => onRowClick(product.rawData)}>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-slate-700">#{index + 1}</span>
                      {getPerformanceIndicator(product.metricValue, index)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.product}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{formatNumber(product.transactions)}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{formatNumber(product.members)}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-green-700">{formatMetricValue(product.metricValue, selectedMetric)}</td>
                </tr>
              ))}
              
              {/* Summary Section */}
              <tr className="bg-gradient-to-r from-slate-100 to-slate-200 border-t-2 border-slate-300 font-bold">
                <td className="px-6 py-4 text-slate-800 text-sm" colSpan={3}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    TOTAL SUMMARY ({processedData.length} products)
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-slate-800 text-sm font-bold">{formatCurrency(summary.totalRevenue)}</td>
                <td className="px-6 py-4 text-center text-slate-800 text-sm font-bold">{formatNumber(summary.totalTransactions)}</td>
                <td className="px-6 py-4 text-center text-slate-800 text-sm font-bold">{formatNumber(summary.totalMembers)}</td>
                <td className="px-6 py-4 text-center text-slate-800 text-sm font-bold">
                  {summary.topPerformer && (
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">{summary.topPerformer.product}</span>
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
