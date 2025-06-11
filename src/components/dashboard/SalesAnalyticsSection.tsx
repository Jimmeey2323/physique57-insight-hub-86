
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterSection } from './FilterSection';
import { MetricCard } from './MetricCard';
import { TopBottomSellers } from './TopBottomSellers';
import { DataTable } from './DataTable';
import { InteractiveChart } from './InteractiveChart';
import { ThemeSelector } from './ThemeSelector';
import { DrillDownModal } from './DrillDownModal';
import { SalesData, FilterOptions, MetricCardData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface SalesAnalyticsSectionProps {
  data: SalesData[];
}

const locations = [
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const SalesAnalyticsSection: React.FC<SalesAnalyticsSectionProps> = ({ data }) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'member'>('metric');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const locationMatch = activeLocation === 'kwality' 
        ? item.calculatedLocation === 'Kwality House, Kemps Corner'
        : activeLocation === 'supreme'
        ? item.calculatedLocation === 'Supreme HQ, Bandra'
        : item.calculatedLocation === 'Kenkere House';
      
      return locationMatch;
    });
  }, [data, activeLocation, filters]);

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

    return [
      {
        title: 'Gross Revenue',
        value: formatCurrency(totalRevenue),
        change: 12.5,
        description: 'Total revenue including VAT for the selected period with strong growth momentum',
        calculation: 'Sum of all Payment Values across all transactions',
        icon: 'revenue'
      },
      {
        title: 'Net Revenue',
        value: formatCurrency(netRevenue),
        change: 8.2,
        description: 'Revenue after deducting VAT, showing actual business income',
        calculation: 'Gross Revenue - Total VAT',
        icon: 'net'
      },
      {
        title: 'Total Transactions',
        value: formatNumber(totalTransactions),
        change: 15.3,
        description: 'Number of successful payment transactions indicating customer activity',
        calculation: 'Count of all payment records with succeeded status',
        icon: 'transactions'
      },
      {
        title: 'Average Ticket Value',
        value: formatCurrency(atv),
        change: -2.1,
        description: 'Average revenue per transaction, key indicator of pricing strategy effectiveness',
        calculation: 'Total Revenue / Total Transactions',
        icon: 'atv'
      },
      {
        title: 'Average Unit Value',
        value: formatCurrency(auv),
        change: 5.7,
        description: 'Average revenue per unit sold, reflecting product pricing efficiency',
        calculation: 'Total Revenue / Total Units Sold',
        icon: 'auv'
      },
      {
        title: 'Unique Members',
        value: formatNumber(uniqueMembers),
        change: 18.9,
        description: 'Number of unique customers indicating market reach and acquisition',
        calculation: 'Count of distinct Member IDs',
        icon: 'members'
      },
      {
        title: 'Average Spend Value',
        value: formatCurrency(asv),
        change: 7.4,
        description: 'Average spend per unique member, measuring customer lifetime value',
        calculation: 'Total Revenue / Unique Members',
        icon: 'asv'
      },
      {
        title: 'Units per Transaction',
        value: upt.toFixed(2),
        change: 3.2,
        description: 'Average number of units per transaction, indicating cross-selling success',
        calculation: 'Total Units / Total Transactions',
        icon: 'upt'
      }
    ];
  }, [filteredData]);

  const resetFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
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

  return (
    <div className={cn("space-y-6", isDarkMode && "dark")}>
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse mb-4">
          Sales Analytics Dashboard
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive sales performance insights with advanced analytics capabilities
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full animate-fade-in"></div>
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
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600",
                "data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105",
                "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-102",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              <span className="relative z-10 block text-center">
                <div className="font-bold">{location.name.split(',')[0]}</div>
                <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>
              </span>
              {activeLocation === location.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
            <FilterSection
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

            <div className="space-y-8">
              <TopBottomSellers 
                data={filteredData} 
                type="product" 
                onRowClick={(row) => {
                  setDrillDownData(row);
                  setDrillDownType('product');
                }}
              />
              <TopBottomSellers 
                data={filteredData} 
                type="category"
                onRowClick={(row) => {
                  setDrillDownData(row);
                  setDrillDownType('category');
                }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InteractiveChart
                title="Revenue Performance Trends"
                data={filteredData}
                type="revenue"
              />
              <InteractiveChart
                title="Category Performance Analysis"
                data={filteredData}
                type="performance"
              />
            </div>

            <div className="space-y-8">
              <DataTable
                title="Product Performance Analysis"
                data={filteredData}
                type="product"
                onRowClick={handleTableRowClick}
              />
              <DataTable
                title="Category Performance Breakdown"
                data={filteredData}
                type="category"
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
