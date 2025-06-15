
import React, { useMemo, useState } from 'react';
import { SalesData, FilterOptions, YearOnYearMetricType, EnhancedYearOnYearTableProps } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { ChevronDown, ChevronRight } from 'lucide-react';

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

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    return data.filter(item => {
      const paymentDate = parseDate(item.paymentDate);
      if (!paymentDate) return false;

      const startDate = filters?.dateRange?.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters?.dateRange?.end ? new Date(filters.dateRange.end) : null;

      if (startDate && paymentDate < startDate) return false;
      if (endDate && paymentDate > endDate) return false;

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

  // Generate monthly data from Jan 2024 to Jan 2025
  const monthlyData = useMemo(() => {
    const months = [];
    for (let year = 2024; year <= 2025; year++) {
      const startMonth = year === 2024 ? 1 : 1;
      const endMonth = year === 2025 ? 1 : 12;
      
      for (let month = startMonth; month <= endMonth; month++) {
        months.push({
          key: `${year}-${String(month).padStart(2, '0')}`,
          display: `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`,
          year,
          month
        });
      }
    }
    return months.reverse(); // Start with Jan 2025
  }, []);

  const processedData = useMemo(() => {
    const grouped = groupDataByCategory(filteredData);
    
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

          return {
            product,
            monthlyValues,
            rawData: items
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
  }, [filteredData, selectedMetric, monthlyData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Year-on-Year Performance Analysis
          </h3>
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
              {monthlyData.map(({ key, display }) => (
                <th key={key} className="px-4 py-4 text-center text-xs font-bold text-blue-800 uppercase tracking-wider border-b border-blue-200 min-w-[100px]">
                  {display}
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
                      {product.product}
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
