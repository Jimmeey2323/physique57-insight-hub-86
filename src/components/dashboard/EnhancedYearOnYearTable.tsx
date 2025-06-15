
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, ChevronRight, TrendingUp, TrendingDown, Minus, ShoppingBag } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface EnhancedYearOnYearTableProps {
  data: Record<string, Record<string, number>>;
  months: string[];
  products: string[];
  activeMetric: string;
  onProductClick: (product: string, data: any) => void;
  collapsedGroups?: Set<string>;
  onGroupToggle?: (groupKey: string) => void;
}

export const EnhancedYearOnYearTable: React.FC<EnhancedYearOnYearTableProps> = ({
  data,
  months,
  products,
  activeMetric,
  onProductClick,
  collapsedGroups = new Set(),
  onGroupToggle
}) => {
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Get product avatar/icon
  const getProductIcon = (productName: string) => {
    const hash = productName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[Math.abs(hash) % colors.length];
  };

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups: Record<string, string[]> = {};

    products.forEach(product => {
      // Extract category from product name or use a default categorization
      let category = 'Other';
      
      if (product.toLowerCase().includes('membership') || product.toLowerCase().includes('package')) {
        category = 'Memberships & Packages';
      } else if (product.toLowerCase().includes('class') || product.toLowerCase().includes('session')) {
        category = 'Classes & Sessions';
      } else if (product.toLowerCase().includes('retail') || product.toLowerCase().includes('merchandise')) {
        category = 'Retail & Merchandise';
      } else if (product.toLowerCase().includes('personal') || product.toLowerCase().includes('training')) {
        category = 'Personal Training';
      } else if (product.toLowerCase().includes('workshop') || product.toLowerCase().includes('event')) {
        category = 'Workshops & Events';
      }

      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });

    // Sort products within each category by total revenue
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => {
        const totalA = months.reduce((sum, month) => sum + (data[a]?.[month] || 0), 0);
        const totalB = months.reduce((sum, month) => sum + (data[b]?.[month] || 0), 0);
        return totalB - totalA;
      });
    });

    return groups;
  }, [products, data, months]);

  // Process data for year-on-year comparison
  const yearOnYearData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    // Group months by year
    const monthsByYear = months.reduce((acc, month) => {
      const year = parseInt(month.split('-')[1]);
      if (!acc[year]) acc[year] = [];
      acc[year].push(month);
      return acc;
    }, {} as Record<number, string[]>);

    // Get all unique month names (Jan, Feb, etc.)
    const uniqueMonths = [...new Set(months.map(m => m.split('-')[0]))].sort((a, b) => {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    return products.map(product => {
      const productData: any = {
        product,
        months: {},
        totalCurrent: 0,
        totalPrevious: 0
      };

      uniqueMonths.forEach(monthName => {
        // Find data for this month in both years
        const currentYearMonth = `${monthName}-${currentYear}`;
        const previousYearMonth = `${monthName}-${previousYear}`;
        
        const currentValue = data[product]?.[currentYearMonth] || 0;
        const previousValue = data[product]?.[previousYearMonth] || 0;
        
        productData.months[monthName] = {
          current: currentValue,
          previous: previousValue,
          change: previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
        };

        productData.totalCurrent += currentValue;
        productData.totalPrevious += previousValue;
      });

      productData.totalChange = productData.totalPrevious > 0 
        ? ((productData.totalCurrent - productData.totalPrevious) / productData.totalPrevious) * 100 
        : 0;

      return productData;
    });
  }, [data, months, products]);

  const formatValue = (value: number) => {
    if (activeMetric.includes('Percentage') || activeMetric.includes('Rate')) {
      return `${value.toFixed(1)}%`;
    }
    return formatCurrency(value);
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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const handleGroupToggle = (groupName: string) => {
    if (onGroupToggle) {
      onGroupToggle(`yoy-${groupName}`);
    }
  };

  // Get unique months for column headers
  const uniqueMonths = [...new Set(months.map(m => m.split('-')[0]))].sort((a, b) => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
  });

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  if (!products.length || uniqueMonths.length === 0) {
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          Year-on-Year Product Performance Analysis ({currentYear} vs {previousYear})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-[250px]">
                  <Button variant="ghost" onClick={() => handleSort('product')}>
                    Product
                    {sortBy === 'product' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                </TableHead>
                {uniqueMonths.map(month => (
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
                <TableHead className="text-center min-w-[120px]">Total Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedProducts).map(([groupName, groupProducts]) => {
                const isCollapsed = collapsedGroups.has(`yoy-${groupName}`);
                const groupTotal = groupProducts.reduce((sum, product) => {
                  const productData = yearOnYearData.find(p => p.product === product);
                  return sum + (productData?.totalCurrent || 0);
                }, 0);
                
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
                      {uniqueMonths.map(month => {
                        const monthTotal = groupProducts.reduce((sum, product) => {
                          const productData = yearOnYearData.find(p => p.product === product);
                          return sum + (productData?.months[month]?.current || 0);
                        }, 0);
                        const monthPrevious = groupProducts.reduce((sum, product) => {
                          const productData = yearOnYearData.find(p => p.product === product);
                          return sum + (productData?.months[month]?.previous || 0);
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
                          {formatCurrency(groupTotal)}
                        </Badge>
                      </TableCell>
                    </TableRow>

                    {/* Group Members */}
                    {!isCollapsed && groupProducts.map((product) => {
                      const productData = yearOnYearData.find(p => p.product === product);
                      if (!productData) return null;

                      return (
                        <TableRow 
                          key={product} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => onProductClick(product, productData)}
                        >
                          <TableCell className="sticky left-0 bg-white z-10 pl-8">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${getProductIcon(product)} flex items-center justify-center text-white text-xs font-bold`}>
                                {product.charAt(0)}
                              </div>
                              <span className="font-medium">{product}</span>
                            </div>
                          </TableCell>
                          {uniqueMonths.map(month => {
                            const monthData = productData.months[month];
                            return (
                              <TableCell key={month} className="text-center">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 bg-blue-50 rounded text-blue-700 font-mono text-sm">
                                    {formatValue(monthData.previous)}
                                  </div>
                                  <div className="p-2 bg-green-50 rounded text-green-700 font-mono text-sm">
                                    {formatValue(monthData.current)}
                                  </div>
                                </div>
                                <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${getTrendColor(monthData.change)}`}>
                                  {getTrendIcon(monthData.change)}
                                  <span>{monthData.change > 0 ? '+' : ''}{monthData.change.toFixed(1)}%</span>
                                </div>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center">
                            <div className={`flex items-center justify-center gap-1 text-sm ${getTrendColor(productData.totalChange)}`}>
                              {getTrendIcon(productData.totalChange)}
                              <span>{productData.totalChange > 0 ? '+' : ''}{productData.totalChange.toFixed(1)}%</span>
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

