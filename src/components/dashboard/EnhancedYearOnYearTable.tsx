
import React, { useMemo, useState } from 'react';
import { SalesData, FilterOptions, YearOnYearMetricType, EnhancedYearOnYearTableProps } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { ChevronDown, ChevronRight, RefreshCw, Filter, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

export const EnhancedYearOnYearTable: React.FC<EnhancedYearOnYearTableProps> = ({
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
  const [showFilters, setShowFilters] = useState(false);

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Handle DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Try other formats
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
      case 'asv':
        const sessionRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        const sessions = new Set(items.map(item => item.saleItemId)).size;
        return sessions > 0 ? sessionRevenue / sessions : 0;
      case 'upt':
        const totalItems = items.length;
        const totalTransactions = new Set(items.map(item => item.paymentTransactionId)).size;
        return totalTransactions > 0 ? totalItems / totalTransactions : 0;
      case 'vat':
        return items.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
      case 'netRevenue':
        const gross = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        const vat = items.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
        return gross - vat;
      default:
        return 0;
    }
  };

  const formatMetricValue = (value: number, metric: YearOnYearMetricType) => {
    switch (metric) {
      case 'revenue':
      case 'auv':
      case 'asv':
      case 'atv':
      case 'vat':
      case 'netRevenue':
        return formatCurrency(value);
      case 'transactions':
      case 'members':
        return formatNumber(value);
      case 'upt':
        return value.toFixed(2);
      default:
        return formatNumber(value);
    }
  };

  // Get all data for historic comparison (ignore date filters for YoY)
  const allHistoricData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    return data.filter(item => {
      // Apply only non-date filters for YoY comparison
      if (filters?.location?.length > 0 && !filters.location.includes(item.calculatedLocation)) return false;
      if (filters?.category?.length > 0 && !filters.category.includes(item.cleanedCategory)) return false;
      if (filters?.product?.length > 0 && !filters.product.includes(item.cleanedProduct)) return false;
      if (filters?.soldBy?.length > 0 && !filters.soldBy.includes(item.soldBy)) return false;
      if (filters?.paymentMethod?.length > 0 && !filters.paymentMethod.includes(item.paymentMethod)) return false;
      if (filters?.minAmount !== undefined && item.paymentValue < filters.minAmount) return false;
      if (filters?.maxAmount !== undefined && item.paymentValue > filters.maxAmount) return false;

      return true;
    });
  }, [data, filters]);

  // Generate monthly data with 2024/2025 grouping in descending order
  const monthlyData = useMemo(() => {
    const months = [];
    const monthNames = ['Jun', 'May', 'Apr', 'Mar', 'Feb', 'Jan', 'Dec', 'Nov', 'Oct', 'Sep', 'Aug', 'Jul'];
    const monthNumbers = [6, 5, 4, 3, 2, 1, 12, 11, 10, 9, 8, 7];
    
    // Create alternating pattern: Jun-2025, Jun-2024, May-2025, May-2024, etc.
    for (let i = 0; i < monthNames.length; i++) {
      const monthName = monthNames[i];
      const monthNum = monthNumbers[i];
      
      // 2025 first
      if (monthNum <= 6) { // Jan-Jun 2025
        months.push({
          key: `2025-${String(monthNum).padStart(2, '0')}`,
          display: `${monthName} 2025`,
          year: 2025,
          month: monthNum,
          sortOrder: i * 2
        });
      }
      
      // Then 2024
      const year2024 = monthNum <= 6 ? 2024 : 2024; // All months for 2024
      months.push({
        key: `${year2024}-${String(monthNum).padStart(2, '0')}`,
        display: `${monthName} 2024`,
        year: year2024,
        month: monthNum,
        sortOrder: i * 2 + 1
      });
      
      // If it's Jul-Dec, also add 2025
      if (monthNum > 6) {
        months.push({
          key: `2025-${String(monthNum).padStart(2, '0')}`,
          display: `${monthName} 2025`,
          year: 2025,
          month: monthNum,
          sortOrder: i * 2 + 0.5
        });
      }
    }
    
    // Sort by the custom order and remove duplicates
    const uniqueMonths = months
      .filter((month, index, self) => 
        index === self.findIndex(m => m.key === month.key)
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    return uniqueMonths.slice(0, 14); // Limit to reasonable number
  }, []);

  const processedData = useMemo(() => {
    const grouped = groupDataByCategory(allHistoricData);
    
    return Object.entries(grouped).map(([category, products]) => {
      const categoryData = {
        category,
        products: Object.entries(products).map(([product, items]) => {
          const monthlyValues: Record<string, number> = {};
          
          // Calculate values for each month
          monthlyData.forEach(({ key, year, month }) => {
            const monthItems = (items as SalesData[]).filter(item => {
              const itemDate = parseDate(item.paymentDate);
              return itemDate && 
                     itemDate.getFullYear() === year && 
                     itemDate.getMonth() + 1 === month;
            });
            
            monthlyValues[key] = getMetricValue(monthItems, selectedMetric);
          });

          // Calculate averages for collapsed view
          const values = Object.values(monthlyValues).filter(v => v > 0);
          const averages = {
            atv: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
            auv: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
            asv: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
            upt: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
          };

          return {
            product,
            monthlyValues,
            rawData: items,
            averages
          };
        })
      };

      // Calculate category totals for each month
      const categoryMonthlyValues: Record<string, number> = {};
      monthlyData.forEach(({ key }) => {
        categoryMonthlyValues[key] = categoryData.products.reduce(
          (sum, p) => sum + (p.monthlyValues[key] || 0), 
          0
        );
      });

      return {
        ...categoryData,
        monthlyValues: categoryMonthlyValues
      };
    });
  }, [allHistoricData, selectedMetric, monthlyData]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const quickFilters = [
    { label: 'Last 6 Months', action: () => console.log('Last 6 months filter') },
    { label: 'High Value', action: () => console.log('High value filter') },
    { label: 'Top Categories', action: () => console.log('Top categories filter') },
    { label: 'Clear All', action: () => console.log('Clear filters') }
  ];

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Year-on-Year Performance Analysis
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Monthly comparison between 2024 and 2025 with alternating year display
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
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
              className="text-xs"
            >
              {filter.label}
            </Button>
          ))}
        </div>
        
        <YearOnYearMetricTabs
          value={selectedMetric}
          onValueChange={setSelectedMetric}
          className="w-full"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider border-b border-blue-200 sticky left-0 bg-gradient-to-r from-blue-50 to-blue-100 z-10">
                Product/Category
              </th>
              {monthlyData.map(({ key, display, year }) => (
                <th key={key} className={`px-4 py-4 text-center text-xs font-bold uppercase tracking-wider border-b border-blue-200 min-w-[100px] ${
                  year === 2025 ? 'text-blue-800' : 'text-purple-800'
                }`}>
                  <div className="flex flex-col">
                    <span>{display.split(' ')[0]}</span>
                    <span className={`text-xs ${year === 2025 ? 'text-blue-600' : 'text-purple-600'}`}>
                      {display.split(' ')[1]}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.map((categoryGroup) => (
              <React.Fragment key={categoryGroup.category}>
                <tr 
                  className="bg-gray-50 hover:bg-gray-100 cursor-pointer border-b border-gray-200 group"
                  onClick={() => onGroupToggle(categoryGroup.category)}
                >
                  <td className="px-6 py-4 font-semibold text-gray-900 group-hover:text-blue-700 sticky left-0 bg-gray-50 z-10">
                    <div className="flex items-center">
                      {collapsedGroups.has(categoryGroup.category) ? (
                        <ChevronRight className="w-4 h-4 mr-2 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
                      )}
                      {categoryGroup.category}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {categoryGroup.products.length} products
                      </Badge>
                    </div>
                  </td>
                  {monthlyData.map(({ key }) => (
                    <td key={key} className="px-4 py-4 text-center font-semibold text-gray-900">
                      {formatMetricValue(categoryGroup.monthlyValues[key] || 0, selectedMetric)}
                    </td>
                  ))}
                </tr>

                {!collapsedGroups.has(categoryGroup.category) && categoryGroup.products.map((product) => (
                  <tr 
                    key={`${categoryGroup.category}-${product.product}`}
                    className="hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    onClick={() => onRowClick(product.rawData)}
                  >
                    <td className="px-8 py-3 text-sm text-gray-700 hover:text-blue-700 sticky left-0 bg-white z-10">
                      <div className="flex items-center justify-between">
                        <span>{product.product}</span>
                        {['atv', 'auv', 'asv', 'upt'].includes(selectedMetric) && (
                          <Badge variant="outline" className="text-xs ml-2">
                            Avg: {formatMetricValue(product.averages[selectedMetric as keyof typeof product.averages] || 0, selectedMetric)}
                          </Badge>
                        )}
                      </div>
                    </td>
                    {monthlyData.map(({ key }) => (
                      <td key={key} className="px-4 py-3 text-center text-sm text-gray-900">
                        {formatMetricValue(product.monthlyValues[key] || 0, selectedMetric)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
