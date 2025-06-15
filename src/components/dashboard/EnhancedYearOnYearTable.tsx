import React, { useMemo } from 'react';
import { SalesData, FilterOptions, YearOnYearMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface EnhancedYearOnYearTableProps {
  data: SalesData[];
  filters: FilterOptions;
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

export const EnhancedYearOnYearTable: React.FC<EnhancedYearOnYearTableProps> = ({
  data,
  filters,
  onRowClick,
  collapsedGroups = new Set(),
  onGroupToggle = () => {},
  selectedMetric = 'revenue'
}) => {

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
    return data.filter(item => {
      const paymentDate = new Date(item.paymentDate);
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      if (startDate && paymentDate < startDate) return false;
      if (endDate && paymentDate > endDate) return false;

      if (filters.location.length > 0 && !filters.location.includes(item.calculatedLocation)) return false;
      if (filters.category.length > 0 && !filters.category.includes(item.cleanedCategory)) return false;
      if (filters.product.length > 0 && !filters.product.includes(item.cleanedProduct)) return false;
      if (filters.soldBy.length > 0 && !filters.soldBy.includes(item.soldBy)) return false;
      if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(item.paymentMethod)) return false;

      if (filters.minAmount !== undefined && item.paymentValue < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && item.paymentValue > filters.maxAmount) return false;

      return true;
    });
  }, [data, filters]);

  const processedData = useMemo(() => {
    const grouped = groupDataByCategory(filteredData);
    
    return Object.entries(grouped).map(([category, products]) => {
      const categoryData = {
        category,
        products: Object.entries(products).map(([product, items]) => {
          const currentYearItems = items.filter(item => {
            const year = new Date(item.paymentDate).getFullYear();
            return year === 2024;
          });
          
          const lastYearItems = items.filter(item => {
            const year = new Date(item.paymentDate).getFullYear();
            return year === 2023;
          });

          const currentValue = getMetricValue(currentYearItems, selectedMetric);
          const lastYearValue = getMetricValue(lastYearItems, selectedMetric);
          const change = lastYearValue !== 0 ? ((currentValue - lastYearValue) / lastYearValue) * 100 : 0;

          return {
            product,
            currentYear: currentValue,
            lastYear: lastYearValue,
            change,
            rawData: items
          };
        })
      };

      // Calculate category totals
      const categoryCurrentYear = categoryData.products.reduce((sum, p) => sum + p.currentYear, 0);
      const categoryLastYear = categoryData.products.reduce((sum, p) => sum + p.lastYear, 0);
      const categoryChange = categoryLastYear !== 0 ? ((categoryCurrentYear - categoryLastYear) / categoryLastYear) * 100 : 0;

      return {
        ...categoryData,
        currentYear: categoryCurrentYear,
        lastYear: categoryLastYear,
        change: categoryChange
      };
    });
  }, [filteredData, selectedMetric]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider border-b border-blue-200">
                Product/Category
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase tracking-wider border-b border-blue-200">
                2024
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase tracking-wider border-b border-blue-200">
                2023
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase tracking-wider border-b border-blue-200">
                Change %
              </th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((categoryGroup) => (
              <React.Fragment key={categoryGroup.category}>
                <tr 
                  className="bg-gray-50 hover:bg-gray-100 cursor-pointer border-b border-gray-200 group"
                  onClick={() => onGroupToggle(categoryGroup.category)}
                >
                  <td className="px-6 py-4 font-semibold text-gray-900 group-hover:text-blue-700">
                    <div className="flex items-center">
                      {collapsedGroups.has(categoryGroup.category) ? (
                        <ChevronRight className="w-4 h-4 mr-2 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
                      )}
                      {categoryGroup.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    {formatMetricValue(categoryGroup.currentYear, selectedMetric)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    {formatMetricValue(categoryGroup.lastYear, selectedMetric)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    <span className={`${categoryGroup.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {categoryGroup.change > 0 ? '+' : ''}{formatPercentage(categoryGroup.change / 100)}
                    </span>
                  </td>
                </tr>

                {!collapsedGroups.has(categoryGroup.category) && categoryGroup.products.map((product) => (
                  <tr 
                    key={`${categoryGroup.category}-${product.product}`}
                    className="hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    onClick={() => onRowClick(product.rawData)}
                  >
                    <td className="px-8 py-3 text-sm text-gray-700 hover:text-blue-700">
                      {product.product}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-gray-900">
                      {formatMetricValue(product.currentYear, selectedMetric)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-gray-900">
                      {formatMetricValue(product.lastYear, selectedMetric)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm">
                      <span className={`${product.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.change > 0 ? '+' : ''}{formatPercentage(product.change / 100)}
                      </span>
                    </td>
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
