
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Percent, TrendingDown, MapPin, Building2 } from 'lucide-react';
import { useDiscountsData } from '@/hooks/useDiscountsData';
import { MetricCard } from './MetricCard';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { InteractiveChart } from './InteractiveChart';
import { DataTable } from './DataTable';
import { ThemeSelector } from './ThemeSelector';
import { DrillDownModal } from './DrillDownModal';
import { SalesData, FilterOptions, MetricCardData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const locations = [
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const DiscountsSection: React.FC = () => {
  const { data, loading, error, refetch } = useDiscountsData();
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'member'>('metric');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '2025-03-01', end: '2025-05-31' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  // Helper function to filter data by date range and other filters
  const applyFilters = (rawData: SalesData[]) => {
    let filtered = rawData;

    // Apply location filter first
    filtered = filtered.filter(item => {
      const locationMatch = activeLocation === 'kwality' 
        ? item.calculatedLocation === 'Kwality House, Kemps Corner'
        : activeLocation === 'supreme'
        ? item.calculatedLocation === 'Supreme HQ, Bandra'
        : item.calculatedLocation === 'Kenkere House';
      
      return locationMatch;
    });

    // Apply date range filter with improved date parsing
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      filtered = filtered.filter(item => {
        if (!item.paymentDate) return false;
        
        // Enhanced date parsing to handle multiple formats
        let itemDate: Date | null = null;
        
        // Try DD/MM/YYYY format first
        const ddmmyyyy = item.paymentDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
          const [, day, month, year] = ddmmyyyy;
          itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Try other formats
          const formats = [
            new Date(item.paymentDate),
            new Date(item.paymentDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')),
            new Date(item.paymentDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'))
          ];
          
          for (const date of formats) {
            if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
              itemDate = date;
              break;
            }
          }
        }
        
        if (!itemDate || isNaN(itemDate.getTime())) return false;
        
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        
        return true;
      });
    }

    // Apply other filters
    if (filters.category?.length) {
      filtered = filtered.filter(item => 
        filters.category!.some(cat => item.cleanedCategory?.toLowerCase().includes(cat.toLowerCase()))
      );
    }

    if (filters.paymentMethod?.length) {
      filtered = filtered.filter(item => 
        filters.paymentMethod!.some(method => item.paymentMethod?.toLowerCase().includes(method.toLowerCase()))
      );
    }

    if (filters.soldBy?.length) {
      filtered = filtered.filter(item => 
        filters.soldBy!.some(seller => item.soldBy?.toLowerCase().includes(seller.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return applyFilters(data);
  }, [data, activeLocation, filters]);

  const metrics = useMemo((): MetricCardData[] => {
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.grossRevenue || 0), 0);
    const totalDiscounts = filteredData.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const discountedTransactions = filteredData.filter(item => (item.discountAmount || 0) > 0).length;
    const totalTransactions = filteredData.length;
    const avgDiscountPercent = discountedTransactions > 0 ? 
      filteredData.filter(item => (item.discountAmount || 0) > 0)
        .reduce((sum, item) => sum + (item.grossDiscountPercent || 0), 0) / discountedTransactions : 0;
    const discountPenetration = totalTransactions > 0 ? (discountedTransactions / totalTransactions) * 100 : 0;
    const netRevenue = totalRevenue - totalDiscounts;
    const avgDiscountPerTransaction = discountedTransactions > 0 ? totalDiscounts / discountedTransactions : 0;

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: 12.5,
        description: 'Gross revenue across all transactions for the selected period',
        calculation: 'Sum of all Gross Revenue values',
        icon: 'revenue'
      },
      {
        title: 'Total Discounts',
        value: formatCurrency(totalDiscounts),
        change: -8.2,
        description: 'Total discount amount given to customers',
        calculation: 'Sum of all Discount Amount values',
        icon: 'trending-down'
      },
      {
        title: 'Discount Rate',
        value: totalRevenue > 0 ? `${((totalDiscounts / totalRevenue) * 100).toFixed(1)}%` : '0%',
        change: -3.1,
        description: 'Percentage of revenue given as discounts',
        calculation: 'Total Discounts / Total Revenue * 100',
        icon: 'percent'
      },
      {
        title: 'Avg Discount %',
        value: `${avgDiscountPercent.toFixed(1)}%`,
        change: -2.1,
        description: 'Average discount percentage for discounted transactions',
        calculation: 'Average of Gross Discount % for transactions with discounts',
        icon: 'percent'
      },
      {
        title: 'Discounted Transactions',
        value: formatNumber(discountedTransactions),
        change: 5.7,
        description: 'Number of transactions with discounts applied',
        calculation: 'Count of transactions where Discount Amount > 0',
        icon: 'transactions'
      },
      {
        title: 'Discount Penetration',
        value: `${discountPenetration.toFixed(1)}%`,
        change: 4.3,
        description: 'Percentage of transactions that received discounts',
        calculation: 'Discounted Transactions / Total Transactions * 100',
        icon: 'percent'
      },
      {
        title: 'Net Revenue',
        value: formatCurrency(netRevenue),
        change: 8.9,
        description: 'Revenue after deducting all discounts',
        calculation: 'Total Revenue - Total Discounts',
        icon: 'net'
      },
      {
        title: 'Avg Discount/Transaction',
        value: formatCurrency(avgDiscountPerTransaction),
        change: -1.8,
        description: 'Average discount amount per discounted transaction',
        calculation: 'Total Discounts / Discounted Transactions',
        icon: 'auv'
      }
    ];
  }, [filteredData]);

  const resetFilters = () => {
    setFilters({
      dateRange: { start: '2025-03-01', end: '2025-05-31' },
      location: [],
      category: [],
      product: [],
      soldBy: [],
      paymentMethod: []
    });
  };

  const handleMetricClick = (metric: MetricCardData) => {
    setDrillDownData(metric);
    setDrillDownType('metric');
  };

  const handleTableRowClick = (row: any) => {
    setDrillDownData(row);
    setDrillDownType('product');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 flex items-center justify-center">
        <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <div>
              <p className="text-lg font-semibold text-slate-800">Loading Discount Analytics</p>
              <p className="text-sm text-slate-600">Analyzing discount patterns and revenue impact...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl max-w-md">
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-slate-800">Connection Error</p>
              <p className="text-sm text-slate-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", isDarkMode && "dark")}>
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-800 bg-clip-text text-transparent animate-pulse mb-4">
          Discount Analytics Dashboard
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive discount performance analysis and promotional campaign effectiveness
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto mt-4 rounded-full animate-fade-in"></div>
      </div>

      <ThemeSelector
        currentTheme={currentTheme}
        isDarkMode={isDarkMode}
        onThemeChange={setCurrentTheme}
        onModeChange={setIsDarkMode}
      />

      <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 via-white to-slate-100 p-2 rounded-2xl shadow-lg">
          {locations.map((location) => (
            <TabsTrigger
              key={location.id}
              value={location.id}
              className={cn(
                "relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-sm transition-all duration-500",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-600",
                "data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105",
                "hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:scale-102",
                "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              )}
            >
              <span className="relative z-10 block text-center">
                <div className="font-bold">{location.name.split(',')[0]}</div>
                <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>
              </span>
              {activeLocation === location.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-400/20 animate-pulse" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
            <AutoCloseFilterSection
              filters={filters}
              onFiltersChange={setFilters}
              onReset={resetFilters}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <MetricCard
                  key={metric.title}
                  data={metric}
                  delay={index * 100}
                  onClick={() => handleMetricClick(metric)}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InteractiveChart
                title="Revenue vs Discount Trends"
                data={filteredData}
                type="discount-revenue"
              />
              <InteractiveChart
                title="Discount Performance by Category"
                data={filteredData}
                type="discount-category"
              />
            </div>

            <div className="space-y-8">
              <DataTable
                title="Month-on-Month Discount Analysis"
                data={filteredData}
                type="discount-monthly"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Product Discount Performance"
                data={filteredData}
                type="discount-product"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Category Discount Breakdown"
                data={filteredData}
                type="discount-category"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Sales Rep Discount Analysis"
                data={filteredData}
                type="discount-rep"
                filters={filters}
                onRowClick={handleTableRowClick}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <DrillDownModal
        isOpen={!!drillDownData}
        onClose={() => setDrillDownData(null)}
        data={drillDownData}
        type={drillDownType}
      />
    </div>
  );
};
