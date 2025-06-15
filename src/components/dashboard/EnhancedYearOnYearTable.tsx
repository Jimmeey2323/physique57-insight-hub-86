
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, ChevronRight, TrendingUp, TrendingDown, Minus, ShoppingBag, RefreshCw, Download, Eye } from 'lucide-react';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { YearOnYearMetricType, SalesData } from '@/types/dashboard';

interface EnhancedYearOnYearTableProps {
  data: SalesData[];
  activeMetric: YearOnYearMetricType;
  onProductClick: (product: string, data: any) => void;
  collapsedGroups?: Set<string>;
  onGroupToggle?: (groupKey: string) => void;
}

export const EnhancedYearOnYearTable: React.FC<EnhancedYearOnYearTableProps> = ({
  data,
  activeMetric,
  onProductClick,
  collapsedGroups = new Set(),
  onGroupToggle
}) => {
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedMetric, setSelectedMetric] = useState<YearOnYearMetricType>(activeMetric);
  const [showLastMonthOnly, setShowLastMonthOnly] = useState(false);

  // Process data for year-on-year comparison using actual cleaned categories
  const yearOnYearData = useMemo(() => {
    if (!data?.length) return { processedData: [], months: [], products: [], categories: [] };

    const dataByProduct: Record<string, Record<string, any>> = {};
    const months = new Set<string>();
    const products = new Set<string>();
    const categories = new Set<string>();

    data.forEach(item => {
      if (!item.cleanedProduct || item.cleanedProduct.trim() === '' || item.cleanedProduct === '-') return;
      if (!item.cleanedCategory || item.cleanedCategory.trim() === '' || item.cleanedCategory === '-') return;
      
      const product = item.cleanedProduct;
      const category = item.cleanedCategory;
      const date = new Date(item.paymentDate);
      
      if (isNaN(date.getTime())) return;
      
      const monthKey = `${date.toLocaleDateString('en-US', { month: 'short' })}-${date.getFullYear()}`;
      
      if (!dataByProduct[product]) {
        dataByProduct[product] = { category, months: {} };
      }
      
      if (!dataByProduct[product].months[monthKey]) {
        dataByProduct[product].months[monthKey] = {
          revenue: 0,
          transactions: 0,
          members: new Set(),
          vat: 0,
          units: 0
        };
      }
      
      dataByProduct[product].months[monthKey].revenue += item.paymentValue || 0;
      dataByProduct[product].months[monthKey].transactions += 1;
      dataByProduct[product].months[monthKey].members.add(item.memberId);
      dataByProduct[product].months[monthKey].vat += item.paymentVAT || 0;
      dataByProduct[product].months[monthKey].units += 1;
      
      months.add(monthKey);
      products.add(product);
      categories.add(category);
    });

    // Convert sets to numbers for calculations
    Object.keys(dataByProduct).forEach(product => {
      Object.keys(dataByProduct[product].months).forEach(month => {
        const monthData = dataByProduct[product].months[month];
        monthData.memberCount = monthData.members.size;
        delete monthData.members;
      });
    });

    const sortedMonths = Array.from(months).sort((a, b) => {
      const [monthA, yearA] = a.split('-');
      const [monthB, yearB] = b.split('-');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateB.getTime() - dateA.getTime();
    });

    return {
      processedData: dataByProduct,
      months: sortedMonths,
      products: Array.from(products).sort(),
      categories: Array.from(categories).sort()
    };
  }, [data]);

  const getMetricValue = (monthData: any, metric: YearOnYearMetricType) => {
    if (!monthData) return 0;
    
    switch (metric) {
      case 'revenue':
        return monthData.revenue || 0;
      case 'transactions':
        return monthData.transactions || 0;
      case 'members':
        return monthData.memberCount || 0;
      case 'atv':
        return monthData.transactions > 0 ? (monthData.revenue / monthData.transactions) : 0;
      case 'auv':
        return monthData.units > 0 ? (monthData.revenue / monthData.units) : 0;
      case 'asv':
        return monthData.memberCount > 0 ? (monthData.revenue / monthData.memberCount) : 0;
      case 'upt':
        return monthData.transactions > 0 ? (monthData.units / monthData.transactions) : 0;
      case 'vat':
        return monthData.vat || 0;
      case 'netRevenue':
        return (monthData.revenue || 0) - (monthData.vat || 0);
      default:
        return 0;
    }
  };

  const formatValue = (value: number) => {
    if (selectedMetric === 'revenue' || selectedMetric === 'vat' || selectedMetric === 'netRevenue' || 
        selectedMetric === 'atv' || selectedMetric === 'auv' || selectedMetric === 'asv') {
      return formatCurrency(value);
    }
    if (selectedMetric === 'upt') {
      return value.toFixed(1);
    }
    return formatNumber(value);
  };

  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 5) return 'text-green-600';
    if (change < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups: Record<string, string[]> = {};

    yearOnYearData.products.forEach(product => {
      const productData = yearOnYearData.processedData[product];
      const category = productData?.category || 'Uncategorized';
      
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });

    // Sort products within each category by total revenue
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => {
        const totalA = yearOnYearData.months.reduce((sum, month) => 
          sum + getMetricValue(yearOnYearData.processedData[a]?.months[month], selectedMetric), 0);
        const totalB = yearOnYearData.months.reduce((sum, month) => 
          sum + getMetricValue(yearOnYearData.processedData[b]?.months[month], selectedMetric), 0);
        return totalB - totalA;
      });
    });

    return groups;
  }, [yearOnYearData, selectedMetric]);

  const handleGroupToggle = (groupName: string) => {
    if (onGroupToggle) {
      onGroupToggle(`yoy-${groupName}`);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // Get unique months for display
  const displayMonths = showLastMonthOnly ? yearOnYearData.months.slice(0, 2) : yearOnYearData.months;
  const uniqueMonthNames = [...new Set(displayMonths.map(m => m.split('-')[0]))].sort((a, b) => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
  });

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  if (!yearOnYearData.products.length || uniqueMonthNames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Year-on-Year Product Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">No product data available for year-on-year comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Year-on-Year Analysis ({currentYear} vs {previousYear})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLastMonthOnly(!showLastMonthOnly)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showLastMonthOnly ? 'Show All' : 'Last Month Only'}
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <YearOnYearMetricTabs
          value={selectedMetric}
          onValueChange={setSelectedMetric}
        />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-[250px]">
                  <Button variant="ghost" onClick={() => handleSort('product')}>
                    Product / Category
                    {sortBy === 'product' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                </TableHead>
                {uniqueMonthNames.map(month => (
                  <TableHead key={month} className="text-center min-w-[200px]">
                    <div className="space-y-1">
                      <div className="font-bold">{month}</div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-blue-600">{previousYear}</div>
                        <div className="text-green-600">{currentYear}</div>
                      </div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-[120px]">YoY Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedProducts).map(([groupName, groupProducts]) => {
                const isCollapsed = collapsedGroups.has(`yoy-${groupName}`);
                
                return (
                  <React.Fragment key={groupName}>
                    {/* Group Header */}
                    <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 font-semibold">
                      <TableCell className="sticky left-0 bg-gradient-to-r from-slate-100 to-slate-50 z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGroupToggle(groupName)}
                          className="flex items-center gap-2 font-bold text-slate-700"
                        >
                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {groupName} ({groupProducts.length})
                        </Button>
                      </TableCell>
                      {uniqueMonthNames.map(month => {
                        const currentYearMonth = `${month}-${currentYear}`;
                        const previousYearMonth = `${month}-${previousYear}`;
                        
                        const monthTotal = groupProducts.reduce((sum, product) => {
                          const productData = yearOnYearData.processedData[product];
                          return sum + getMetricValue(productData?.months[currentYearMonth], selectedMetric);
                        }, 0);
                        
                        const monthPrevious = groupProducts.reduce((sum, product) => {
                          const productData = yearOnYearData.processedData[product];
                          return sum + getMetricValue(productData?.months[previousYearMonth], selectedMetric);
                        }, 0);
                        
                        return (
                          <TableCell key={month} className="text-center">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-1 bg-blue-100 rounded text-blue-700 font-mono text-xs">
                                {formatValue(monthPrevious)}
                              </div>
                              <div className="p-1 bg-green-100 rounded text-green-700 font-mono text-xs">
                                {formatValue(monthTotal)}
                              </div>
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <Badge className="bg-slate-200 text-slate-700">
                          Category Total
                        </Badge>
                      </TableCell>
                    </TableRow>

                    {/* Group Members */}
                    {!isCollapsed && groupProducts.map((product) => {
                      const productData = yearOnYearData.processedData[product];
                      if (!productData) return null;

                      return (
                        <TableRow 
                          key={product} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => onProductClick(product, productData)}
                        >
                          <TableCell className="sticky left-0 bg-white z-10 pl-8">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                {product.charAt(0)}
                              </div>
                              <span className="font-medium">{product}</span>
                            </div>
                          </TableCell>
                          {uniqueMonthNames.map(month => {
                            const currentYearMonth = `${month}-${currentYear}`;
                            const previousYearMonth = `${month}-${previousYear}`;
                            
                            const currentValue = getMetricValue(productData.months[currentYearMonth], selectedMetric);
                            const previousValue = getMetricValue(productData.months[previousYearMonth], selectedMetric);
                            const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
                            
                            return (
                              <TableCell key={month} className="text-center">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 bg-blue-50 rounded text-blue-700 font-mono text-sm">
                                    {formatValue(previousValue)}
                                  </div>
                                  <div className="p-2 bg-green-50 rounded text-green-700 font-mono text-sm">
                                    {formatValue(currentValue)}
                                  </div>
                                </div>
                                <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${getTrendColor(change)}`}>
                                  {getTrendIcon(change)}
                                  <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
                                </div>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center">
                            <div className="text-sm text-slate-600">
                              Product
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
