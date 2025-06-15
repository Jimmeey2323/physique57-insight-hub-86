
import React, { useMemo, useState } from 'react';
import { SalesData, FilterOptions, YearOnYearMetricType } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { ChevronDown, ChevronRight, RefreshCw, Filter, Calendar, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthOnMonthTableProps {
  data: SalesData[];
  filters?: FilterOptions;
  onRowClick: (row: any) => void;
  collapsedGroups?: Set<string>;
  onGroupToggle?: (groupKey: string) => void;
  selectedMetric?: YearOnYearMetricType;
}

const groupDataByCategory = (data: SalesData[]) => {
  return data.reduce((acc: Record<string, any>, item) => {
    const category = item.cleanedCategory || 'Uncategorized';
    const product = item.cleanedProduct || 'Unspecified';
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][product]) {
      acc[category][product] = [];
    }
    acc[category][product].push(item);
    return acc;
  }, {});
};

export const MonthOnMonthTable: React.FC<MonthOnMonthTableProps> = ({
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
  collapsedGroups = new Set(),
  onGroupToggle = () => {},
  selectedMetric: initialMetric = 'revenue'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<YearOnYearMetricType>(initialMetric);

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

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

  // Generate monthly data for 2025 in descending order
  const monthlyData = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 11; i >= 0; i--) {
      const monthName = monthNames[i];
      const monthNum = i + 1;
      months.push({
        key: `2025-${String(monthNum).padStart(2, '0')}`,
        display: `${monthName} 2025`,
        year: 2025,
        month: monthNum
      });
    }
    return months;
  }, []);

  const processedData = useMemo(() => {
    const grouped = groupDataByCategory(data);
    return Object.entries(grouped).map(([category, products]) => {
      const categoryData = {
        category,
        products: Object.entries(products).map(([product, items]) => {
          const monthlyValues: Record<string, number> = {};

          monthlyData.forEach(({ key, year, month }) => {
            const monthItems = (items as SalesData[]).filter(item => {
              const itemDate = parseDate(item.paymentDate);
              return itemDate && itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
            });
            monthlyValues[key] = getMetricValue(monthItems, selectedMetric);
          });

          return {
            product,
            monthlyValues,
            rawData: items
          };
        })
      };

      const categoryMonthlyValues: Record<string, number> = {};
      monthlyData.forEach(({ key }) => {
        categoryMonthlyValues[key] = categoryData.products.reduce((sum, p) => sum + (p.monthlyValues[key] || 0), 0);
      });

      return {
        ...categoryData,
        monthlyValues: categoryMonthlyValues
      };
    });
  }, [data, selectedMetric, monthlyData]);

  // Calculate summary
  const summary = useMemo(() => {
    const totals: Record<string, number> = {};
    monthlyData.forEach(({ key }) => {
      totals[key] = processedData.reduce((sum, cat) => sum + (cat.monthlyValues[key] || 0), 0);
    });
    
    const overallTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);
    const averageMonthly = overallTotal / monthlyData.length;
    
    return { totals, overallTotal, averageMonthly };
  }, [processedData, monthlyData]);

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Month-on-Month Performance Analysis
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Monthly performance comparison for 2025 with descending month display
              </p>
            </div>
          </div>
          
          <YearOnYearMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-t border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold text-sm uppercase tracking-wider px-4 py-2 sticky top-0 z-20">
              <tr>
                <th className="text-white font-semibold uppercase tracking-wider px-12 py-2 text-left text-sm">
                  Product/Category
                </th>
                {monthlyData.map(({ key, display }) => (
                  <th key={key} className="text-white font-semibold text-sm uppercase tracking-wider px-4 py-2">
                    <div className="flex flex-col">
                      <span className="text-base">{display.split(' ')[0]}</span>
                      <span className="text-blue-200 text-xs">{display.split(' ')[1]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map(categoryGroup => (
                <React.Fragment key={categoryGroup.category}>
                  <tr onClick={() => onGroupToggle(categoryGroup.category)} className="bg-white hover:bg-gray-100 cursor-pointer border-b border-gray-200 group transition-colors duration-200">
                    <td className="py-4 font-semibold text-gray-800 bg-white sticky left-0 z-10 px-[10px] min-w-80 text-sm">
                      <div className="flex justify-between items-center min-w-full text-md text-bold">
                        {collapsedGroups.has(categoryGroup.category) ? 
                          <ChevronRight className="w-4 h-4 mr-2 text-gray-500" /> : 
                          <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
                        }
                        {categoryGroup.category}
                        <Badge variant="secondary" className="ml-auto text-sm text-white bg-blue-900 min-w-32 text-right py-1 capitalize rounded-lg px-[12px]">
                          {categoryGroup.products.length} products
                        </Badge>
                      </div>
                    </td>
                    {monthlyData.map(({ key }) => (
                      <td key={key} className="px-4 py-4 text-center font-semibold text-gray-900 text-sm">
                        {formatMetricValue(categoryGroup.monthlyValues[key] || 0, selectedMetric)}
                      </td>
                    ))}
                  </tr>

                  {!collapsedGroups.has(categoryGroup.category) && categoryGroup.products.map(product => (
                    <tr key={`${categoryGroup.category}-${product.product}`} className="hover:bg-blue-50 cursor-pointer border-b border-gray-100" onClick={() => onRowClick && onRowClick(product.rawData)}>
                      <td className="px-8 py-3 text-sm text-gray-700 hover:text-blue-700 sticky left-0 bg-white hover:bg-blue-50 z-10">
                        {product.product}
                      </td>
                      {monthlyData.map(({ key }) => (
                        <td key={key} className="px-4 py-3 text-center text-sm text-gray-900 font-mono">
                          {formatMetricValue(product.monthlyValues[key] || 0, selectedMetric)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Summary Section */}
              <tr className="bg-gradient-to-r from-slate-100 to-slate-200 border-t-2 border-slate-300 font-bold">
                <td className="py-4 px-12 text-slate-800 text-sm sticky left-0 z-10 bg-gradient-to-r from-slate-100 to-slate-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    TOTAL SUMMARY
                  </div>
                </td>
                {monthlyData.map(({ key }) => (
                  <td key={key} className="px-4 py-4 text-center text-slate-800 text-sm font-bold">
                    {formatMetricValue(summary.totals[key] || 0, selectedMetric)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
