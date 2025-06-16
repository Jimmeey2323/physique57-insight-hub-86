
import React, { useMemo, useState } from 'react';
import { SalesData, FilterOptions, YearOnYearMetricType } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Calendar, TrendingUp, TrendingDown, Star, Edit3, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface MonthOnMonthTableProps {
  data: SalesData[];
  filters?: FilterOptions;
  onRowClick: (row: any) => void;
  collapsedGroups: Set<string>;
  onGroupToggle: (groupKey: string) => void;
  selectedMetric?: YearOnYearMetricType;
}

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
  collapsedGroups,
  onGroupToggle,
  selectedMetric: initialMetric = 'revenue'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<YearOnYearMetricType>(initialMetric);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('• Month-on-month analysis shows seasonal patterns\n• Strong performance in peak months with growth opportunities identified\n• Consistent upward trend in key metrics');

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

  // Generate monthly data from Jun 2025 to Jan 2024 (current date backwards)
  const monthlyData = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Start from Jun 2025 and go backwards to Jan 2024
    // 2025 months (Jun to Jan) - descending
    for (let i = 5; i >= 0; i--) {
      const monthName = monthNames[i];
      const monthNum = i + 1;
      months.push({
        key: `2025-${String(monthNum).padStart(2, '0')}`,
        display: `${monthName} 2025`,
        year: 2025,
        month: monthNum,
        quarter: Math.ceil(monthNum / 3)
      });
    }
    
    // 2024 months (Dec to Jan) - descending
    for (let i = 11; i >= 0; i--) {
      const monthName = monthNames[i];
      const monthNum = i + 1;
      months.push({
        key: `2024-${String(monthNum).padStart(2, '0')}`,
        display: `${monthName} 2024`,
        year: 2024,
        month: monthNum,
        quarter: Math.ceil(monthNum / 3)
      });
    }
    
    return months;
  }, []);

  const processedData = useMemo(() => {
    // Group by unique products
    const productGroups = data.reduce((acc: Record<string, SalesData[]>, item) => {
      const product = item.cleanedProduct || 'Unspecified';
      if (!acc[product]) {
        acc[product] = [];
      }
      acc[product].push(item);
      return acc;
    }, {});

    const productData = Object.entries(productGroups).map(([product, items]) => {
      const monthlyValues: Record<string, number> = {};

      monthlyData.forEach(({ key, year, month }) => {
        const monthItems = items.filter(item => {
          const itemDate = parseDate(item.paymentDate);
          return itemDate && itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
        });
        monthlyValues[key] = getMetricValue(monthItems, selectedMetric);
      });

      const metricValue = getMetricValue(items, selectedMetric);
      const totalRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
      const totalTransactions = items.length;
      const uniqueMembers = new Set(items.map(item => item.memberId)).size;
      const totalVAT = items.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
      
      // Calculate correct metrics
      const asv = uniqueMembers > 0 ? totalRevenue / uniqueMembers : 0; // Average Spend per Member
      const upt = totalTransactions; // Units per Transaction (1 unit = 1 transaction in this context)
      const atv = totalTransactions > 0 ? totalRevenue / totalTransactions : 0; // Average Transaction Value
      
      return {
        product,
        metricValue,
        totalRevenue,
        totalTransactions,
        uniqueMembers,
        totalVAT,
        asv,
        upt,
        atv,
        monthlyValues,
        rawData: items
      };
    });

    return productData.sort((a, b) => b.metricValue - a.metricValue);
  }, [data, selectedMetric, monthlyData]);

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return <TrendingUp className="w-3 h-3 text-green-500 inline ml-1" />;
    const growth = ((current - previous) / previous) * 100;
    if (growth > 5) {
      return <TrendingUp className="w-3 h-3 text-green-500 inline ml-1" />;
    } else if (growth < -5) {
      return <TrendingDown className="w-3 h-3 text-red-500 inline ml-1" />;
    }
    return null;
  };

  // Calculate totals row
  const totalsRow = useMemo(() => {
    const monthlyTotals: Record<string, number> = {};
    monthlyData.forEach(({ key }) => {
      monthlyTotals[key] = processedData.reduce((sum, item) => sum + (item.monthlyValues[key] || 0), 0);
    });
    
    const totalRevenue = processedData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalTransactions = processedData.reduce((sum, item) => sum + item.totalTransactions, 0);
    const totalMembers = new Set(data.map(item => item.memberId)).size;
    const totalVAT = processedData.reduce((sum, item) => sum + item.totalVAT, 0);
    
    return {
      product: 'TOTAL',
      metricValue: processedData.reduce((sum, item) => sum + item.metricValue, 0),
      totalRevenue,
      totalTransactions,
      totalMembers,
      totalVAT,
      asv: totalMembers > 0 ? totalRevenue / totalMembers : 0,
      upt: totalTransactions,
      atv: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      monthlyValues: monthlyTotals
    };
  }, [processedData, monthlyData, data]);

  const saveSummary = () => {
    setIsEditingSummary(false);
    localStorage.setItem('monthOnMonthSummary', summaryText);
  };

  const cancelEdit = () => {
    setIsEditingSummary(false);
    const saved = localStorage.getItem('monthOnMonthSummary');
    if (saved) setSummaryText(saved);
  };

  // Group months by quarters and years
  const groupedMonths = useMemo(() => {
    const quarters: Record<string, typeof monthlyData> = {};
    monthlyData.forEach(month => {
      const quarterKey = `${month.year}-Q${month.quarter}`;
      if (!quarters[quarterKey]) quarters[quarterKey] = [];
      quarters[quarterKey].push(month);
    });
    return quarters;
  }, [monthlyData]);

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Product Month-on-Month Analysis
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Monthly performance metrics by product with quarterly grouping (Jun 2025 - Jan 2024)
              </p>
            </div>
          </div>
          
          <YearOnYearMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full bg-white border-t border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold text-sm uppercase tracking-wider sticky top-0 z-20">
              <tr>
                <th rowSpan={2} className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-left rounded-tl-lg sticky left-0 bg-blue-800 z-30">Product</th>
                <th rowSpan={2} className="text-white font-semibold uppercase tracking-wider px-3 py-3 text-center">ATV</th>
                <th rowSpan={2} className="text-white font-semibold uppercase tracking-wider px-3 py-3 text-center">ASV</th>
                <th rowSpan={2} className="text-white font-semibold uppercase tracking-wider px-3 py-3 text-center">UPT</th>
                <th rowSpan={2} className="text-white font-semibold uppercase tracking-wider px-3 py-3 text-center">VAT</th>
                {Object.entries(groupedMonths).map(([quarterKey, months]) => (
                  <th key={quarterKey} colSpan={months.length} className="text-white font-semibold text-sm uppercase tracking-wider px-4 py-2 text-center border-l border-blue-600">
                    {quarterKey}
                  </th>
                ))}
              </tr>
              <tr>
                {monthlyData.map(({ key, display }) => (
                  <th key={key} className="text-white font-semibold text-xs uppercase tracking-wider px-3 py-2 bg-blue-800 border-l border-blue-600">
                    <div className="flex flex-col">
                      <span className="text-sm">{display.split(' ')[0]}</span>
                      <span className="text-blue-200 text-xs">{display.split(' ')[1]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((product, index) => (
                <tr 
                  key={product.product} 
                  className="hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors duration-200" 
                  onClick={() => onRowClick(product.rawData)}
                >
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 max-w-48">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">#{index + 1}</span>
                      <span className="truncate">{product.product}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center text-sm text-gray-900 font-mono">
                    {formatCurrency(product.atv)}
                  </td>
                  <td className="px-3 py-3 text-center text-sm text-gray-900 font-mono">
                    {formatCurrency(product.asv)}
                  </td>
                  <td className="px-3 py-3 text-center text-sm text-gray-900 font-mono">
                    {formatNumber(product.upt)}
                  </td>
                  <td className="px-3 py-3 text-center text-sm text-gray-900 font-mono">
                    {formatCurrency(product.totalVAT)}
                  </td>
                  {monthlyData.map(({ key }, monthIndex) => {
                    const current = product.monthlyValues[key] || 0;
                    const previous = monthIndex > 0 ? product.monthlyValues[monthlyData[monthIndex - 1].key] || 0 : 0;
                    return (
                      <td key={key} className="px-3 py-3 text-center text-sm text-gray-900 font-mono border-l border-gray-100">
                        <div className="flex items-center justify-center">
                          {formatMetricValue(current, selectedMetric)}
                          {getGrowthIndicator(current, previous)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200 font-bold">
                <td className="px-6 py-3 text-sm font-bold text-blue-900 sticky left-0 bg-blue-100 border-r border-blue-200">
                  TOTAL
                </td>
                <td className="px-3 py-3 text-center text-sm text-blue-900 font-mono font-bold">
                  {formatCurrency(totalsRow.atv)}
                </td>
                <td className="px-3 py-3 text-center text-sm text-blue-900 font-mono font-bold">
                  {formatCurrency(totalsRow.asv)}
                </td>
                <td className="px-3 py-3 text-center text-sm text-blue-900 font-mono font-bold">
                  {formatNumber(totalsRow.upt)}
                </td>
                <td className="px-3 py-3 text-center text-sm text-blue-900 font-mono font-bold">
                  {formatCurrency(totalsRow.totalVAT)}
                </td>
                {monthlyData.map(({ key }) => (
                  <td key={key} className="px-3 py-3 text-center text-sm text-blue-900 font-mono font-bold border-l border-blue-200">
                    {formatMetricValue(totalsRow.monthlyValues[key] || 0, selectedMetric)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary/Insights Section */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-slate-50 to-white rounded-b-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Product Month-on-Month Insights
            </h4>
            {!isEditingSummary ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditingSummary(true)} className="gap-2">
                <Edit3 className="w-4 h-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveSummary} className="gap-2 text-green-600">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={cancelEdit} className="gap-2 text-red-600">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
          
          {isEditingSummary ? (
            <Textarea
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="Enter month-on-month insights using bullet points (• )"
              className="min-h-32 text-sm"
            />
          ) : (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {summaryText}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
