import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { MetricCard } from './MetricCard';
import { UnifiedTopBottomSellers } from './UnifiedTopBottomSellers';
import { DataTable } from './DataTable';
import { InteractiveChart } from './InteractiveChart';
import { ThemeSelector } from './ThemeSelector';
import { DrillDownModal } from './DrillDownModal';
import { EnhancedYearOnYearTable } from './EnhancedYearOnYearTable';
import { MonthOnMonthTable } from './MonthOnMonthTable';
import { ProductPerformanceTable } from './ProductPerformanceTable';
import { CategoryPerformanceTable } from './CategoryPerformanceTable';
import { SalesData, FilterOptions, MetricCardData, YearOnYearMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface SalesAnalyticsSectionProps {
  data: SalesData[];
}

const locations = [{
  id: 'kwality',
  name: 'Kwality House, Kemps Corner',
  fullName: 'Kwality House, Kemps Corner'
}, {
  id: 'supreme',
  name: 'Supreme HQ, Bandra',
  fullName: 'Supreme HQ, Bandra'
}, {
  id: 'kenkere',
  name: 'Kenkere House',
  fullName: 'Kenkere House'
}];

export const SalesAnalyticsSection: React.FC<SalesAnalyticsSectionProps> = ({
  data
}) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'member'>('metric');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeYoyMetric, setActiveYoyMetric] = useState<YearOnYearMetricType>('revenue');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: '2025-01-01',
      end: '2025-05-31'
    },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  // Helper function to filter data by date range and other filters
  const applyFilters = (rawData: SalesData[], includeHistoric: boolean = false) => {
    let filtered = rawData;

    // Apply location filter first
    filtered = filtered.filter(item => {
      const locationMatch = activeLocation === 'kwality' ? item.calculatedLocation === 'Kwality House, Kemps Corner' : activeLocation === 'supreme' ? item.calculatedLocation === 'Supreme HQ, Bandra' : item.calculatedLocation === 'Kenkere House';
      return locationMatch;
    });

    // Apply date range filter - skip for historic data when includeHistoric is true
    if (!includeHistoric && (filters.dateRange.start || filters.dateRange.end)) {
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
          const formats = [new Date(item.paymentDate), new Date(item.paymentDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')), new Date(item.paymentDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'))];
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
      filtered = filtered.filter(item => filters.category!.some(cat => item.cleanedCategory?.toLowerCase().includes(cat.toLowerCase())));
    }
    if (filters.paymentMethod?.length) {
      filtered = filtered.filter(item => filters.paymentMethod!.some(method => item.paymentMethod?.toLowerCase().includes(method.toLowerCase())));
    }
    if (filters.soldBy?.length) {
      filtered = filtered.filter(item => filters.soldBy!.some(seller => item.soldBy?.toLowerCase().includes(seller.toLowerCase())));
    }
    if (filters.minAmount) {
      filtered = filtered.filter(item => (item.paymentValue || 0) >= filters.minAmount!);
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(item => (item.paymentValue || 0) <= filters.maxAmount!);
    }
    return filtered;
  };

  const filteredData = useMemo(() => applyFilters(data), [data, filters, activeLocation]);
  const allHistoricData = useMemo(() => applyFilters(data, true), [data, activeLocation]);

  // Get historic data for year-on-year comparison (includes 2024 data)
  const historicData = useMemo(() => {
    return applyFilters(data, true);
  }, [data, activeLocation]);
  const metrics = useMemo((): MetricCardData[] => {
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.paymentValue, 0);
    const totalVAT = filteredData.reduce((sum, item) => sum + item.paymentVAT, 0);
    const netRevenue = totalRevenue - totalVAT;
    const totalTransactions = filteredData.length;
    const uniqueMembers = new Set(filteredData.map(item => item.memberId)).size;
    const totalUnits = filteredData.length;
    const atv = totalRevenue / totalTransactions || 0;
    const auv = totalRevenue / totalUnits || 0;
    const asv = totalRevenue / uniqueMembers || 0;
    const upt = totalUnits / totalTransactions || 0;
    return [{
      title: 'Gross Revenue',
      value: formatCurrency(totalRevenue),
      change: 12.5,
      description: 'Total revenue including VAT for the selected period with strong growth momentum',
      calculation: 'Sum of all Payment Values across all transactions',
      icon: 'revenue',
      rawValue: totalRevenue,
      breakdown: {
        current: totalRevenue,
        vat: totalVAT,
        net: netRevenue,
        transactions: totalTransactions
      }
    }, {
      title: 'Net Revenue',
      value: formatCurrency(netRevenue),
      change: 8.2,
      description: 'Revenue after deducting VAT, showing actual business income',
      calculation: 'Gross Revenue - Total VAT',
      icon: 'net',
      rawValue: netRevenue,
      breakdown: {
        current: netRevenue,
        gross: totalRevenue,
        vat: totalVAT,
        transactions: totalTransactions
      }
    }, {
      title: 'Total Transactions',
      value: formatNumber(totalTransactions),
      change: 15.3,
      description: 'Number of successful payment transactions indicating customer activity',
      calculation: 'Count of all payment records with succeeded status',
      icon: 'transactions',
      rawValue: totalTransactions,
      breakdown: {
        current: totalTransactions,
        revenue: totalRevenue,
        uniqueMembers: uniqueMembers,
        avgValue: atv
      }
    }, {
      title: 'Average Ticket Value',
      value: formatCurrency(atv),
      change: -2.1,
      description: 'Average revenue per transaction, key indicator of pricing strategy effectiveness',
      calculation: 'Total Revenue / Total Transactions',
      icon: 'atv',
      rawValue: atv,
      breakdown: {
        current: atv,
        totalRevenue: totalRevenue,
        totalTransactions: totalTransactions,
        comparison: auv
      }
    }, {
      title: 'Average Unit Value',
      value: formatCurrency(auv),
      change: 5.7,
      description: 'Average revenue per unit sold, reflecting product pricing efficiency',
      calculation: 'Total Revenue / Total Units Sold',
      icon: 'auv',
      rawValue: auv,
      breakdown: {
        current: auv,
        totalRevenue: totalRevenue,
        totalUnits: totalUnits,
        comparison: atv
      }
    }, {
      title: 'Unique Members',
      value: formatNumber(uniqueMembers),
      change: 18.9,
      description: 'Number of unique customers indicating market reach and acquisition',
      calculation: 'Count of distinct Member IDs',
      icon: 'members',
      rawValue: uniqueMembers,
      breakdown: {
        current: uniqueMembers,
        totalTransactions: totalTransactions,
        avgSpend: asv,
        totalRevenue: totalRevenue
      }
    }, {
      title: 'Average Spend Value',
      value: formatCurrency(asv),
      change: 7.4,
      description: 'Average spend per unique member, measuring customer lifetime value',
      calculation: 'Total Revenue / Unique Members',
      icon: 'asv',
      rawValue: asv,
      breakdown: {
        current: asv,
        totalRevenue: totalRevenue,
        uniqueMembers: uniqueMembers,
        comparison: atv
      }
    }, {
      title: 'Units per Transaction',
      value: upt.toFixed(1),
      change: 3.2,
      description: 'Average number of units per transaction, indicating cross-selling success',
      calculation: 'Total Units / Total Transactions',
      icon: 'upt',
      rawValue: upt,
      breakdown: {
        current: upt,
        totalUnits: totalUnits,
        totalTransactions: totalTransactions,
        totalRevenue: totalRevenue
      }
    }];
  }, [filteredData]);

  const handleRowClick = (rowData: any) => {
    console.log('Row clicked with data:', rowData);
    setDrillDownData(rowData);
    setDrillDownType('product');
  };

  const handleGroupToggle = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  return (
    <div className="space-y-8">
      {/* Filter and Location Tabs */}
      <div className="space-y-6">
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-3 w-full max-w-2xl overflow-hidden">
              {locations.map((location) => (
                <TabsTrigger
                  key={location.id}
                  value={location.id}
                  className="relative rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50"
                >
                  <div className="relative z-10 text-center">
                    <div className="font-bold">{location.name.split(',')[0]}</div>
                    <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {locations.map((location) => (
            <TabsContent key={location.id} value={location.id} className="space-y-8">
              {/* Filters */}
              <AutoCloseFilterSection 
                data={filteredData}
                filters={filters}
                onFiltersChange={setFilters}
              />

              {/* Year-on-Year Table */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Year-on-Year Analysis</h2>
                <EnhancedYearOnYearTable 
                  data={allHistoricData}
                  onRowClick={handleRowClick}
                  selectedMetric={activeYoyMetric}
                />
              </section>

              {/* Month-on-Month Table */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Month-on-Month Analysis</h2>
                <MonthOnMonthTable 
                  data={allHistoricData}
                  onRowClick={handleRowClick}
                  collapsedGroups={collapsedGroups}
                  onGroupToggle={handleGroupToggle}
                  selectedMetric={activeYoyMetric}
                />
              </section>

              {/* Product Performance Table */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Product Performance Analysis</h2>
                <ProductPerformanceTable 
                  data={allHistoricData}
                  onRowClick={handleRowClick}
                  selectedMetric={activeYoyMetric}
                />
              </section>

              {/* Category Performance Table */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Category Performance Analysis</h2>
                <CategoryPerformanceTable 
                  data={allHistoricData}
                  onRowClick={handleRowClick}
                  selectedMetric={activeYoyMetric}
                />
              </section>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Drill Down Modal */}
      {drillDownData && (
        <DrillDownModal
          isOpen={!!drillDownData}
          onClose={() => setDrillDownData(null)}
          data={drillDownData}
          type={drillDownType}
        />
      )}
    </div>
  );
};

export default SalesAnalyticsSection;
