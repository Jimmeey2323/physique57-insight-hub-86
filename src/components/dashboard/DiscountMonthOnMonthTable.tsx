
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { SalesData, FilterOptions } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TrendingUp, Calendar, Package } from 'lucide-react';

interface DiscountMonthOnMonthTableProps {
  data: SalesData[];
  filters: FilterOptions;
  onRowClick: (row: any) => void;
}

export const DiscountMonthOnMonthTable: React.FC<DiscountMonthOnMonthTableProps> = ({
  data,
  filters,
  onRowClick
}) => {
  const monthlyProductData = useMemo(() => {
    // Group data by month and product
    const monthlyGroups = data.reduce((acc, item) => {
      if (!item.paymentDate || !item.cleanedProduct) return acc;
      
      // Parse DD/MM/YYYY format
      const ddmmyyyy = item.paymentDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!ddmmyyyy) return acc;
      
      const [, day, month, year] = ddmmyyyy;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const productKey = `${monthKey}-${item.cleanedProduct}`;
      
      if (!acc[productKey]) {
        acc[productKey] = {
          month: monthKey,
          monthDisplay: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          product: item.cleanedProduct,
          category: item.cleanedCategory || 'Uncategorized',
          totalRevenue: 0,
          totalDiscounts: 0,
          totalGrossRevenue: 0,
          totalNetRevenue: 0,
          unitsSold: 0,
          unitsWithDiscount: 0,
          totalGrossDiscountPercent: 0,
          totalNetDiscountPercent: 0,
          discountedTransactions: 0,
          totalTransactions: 0
        };
      }
      
      const group = acc[productKey];
      group.totalRevenue += item.paymentValue || 0;
      group.totalDiscounts += item.discountAmount || 0;
      group.totalGrossRevenue += item.grossRevenue || 0;
      group.totalNetRevenue += item.netRevenue || 0;
      group.unitsSold += 1;
      group.totalTransactions += 1;
      
      if ((item.discountAmount || 0) > 0) {
        group.unitsWithDiscount += 1;
        group.discountedTransactions += 1;
        group.totalGrossDiscountPercent += item.grossDiscountPercent || 0;
        group.totalNetDiscountPercent += item.netDiscountPercent || 0;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate averages
    return Object.values(monthlyGroups).map((group: any) => ({
      ...group,
      avgGrossDiscountPercent: group.discountedTransactions > 0 
        ? group.totalGrossDiscountPercent / group.discountedTransactions 
        : 0,
      avgNetDiscountPercent: group.discountedTransactions > 0 
        ? group.totalNetDiscountPercent / group.discountedTransactions 
        : 0,
      discountPenetration: group.totalTransactions > 0 
        ? (group.discountedTransactions / group.totalTransactions) * 100 
        : 0,
      avgDiscountPerUnit: group.unitsWithDiscount > 0 
        ? group.totalDiscounts / group.unitsWithDiscount 
        : 0,
      discountRate: group.totalGrossRevenue > 0 
        ? (group.totalDiscounts / group.totalGrossRevenue) * 100 
        : 0
    })).sort((a, b) => `${a.month}-${a.product}`.localeCompare(`${b.month}-${b.product}`));
  }, [data]);

  const headers = [
    'Month',
    'Product',
    'Category',
    'Units Sold',
    'Units w/ Discount',
    'Total Discounts',
    'Discount Rate (%)',
    'Avg Gross Discount (%)',
    'Avg Net Discount (%)',
    'Discount Penetration (%)',
    'Total Revenue',
    'Net Revenue'
  ];

  const tableData = monthlyProductData.map(item => ({
    'Month': item.monthDisplay,
    'Product': item.product,
    'Category': item.category,
    'Units Sold': item.unitsSold,
    'Units w/ Discount': item.unitsWithDiscount,
    'Total Discounts': formatCurrency(item.totalDiscounts),
    'Discount Rate (%)': `${item.discountRate.toFixed(1)}%`,
    'Avg Gross Discount (%)': `${item.avgGrossDiscountPercent.toFixed(1)}%`,
    'Avg Net Discount (%)': `${item.avgNetDiscountPercent.toFixed(1)}%`,
    'Discount Penetration (%)': `${item.discountPenetration.toFixed(1)}%`,
    'Total Revenue': formatCurrency(item.totalRevenue),
    'Net Revenue': formatCurrency(item.totalNetRevenue),
    rawData: item
  }));

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Month-on-Month Product Discount Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ModernDataTable
          headers={headers}
          data={tableData}
          className="max-h-96"
        />
      </CardContent>
    </Card>
  );
};
