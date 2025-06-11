
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterSection } from './FilterSection';
import { MetricCard } from './MetricCard';
import { TopBottomSellers } from './TopBottomSellers';
import { SalesData, FilterOptions, MetricCardData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface SalesAnalyticsSectionProps {
  data: SalesData[];
}

const locations = [
  { id: 'kwality', name: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House' }
];

export const SalesAnalyticsSection: React.FC<SalesAnalyticsSectionProps> = ({ data }) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
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
        description: 'Total revenue including VAT for the selected period',
        calculation: 'Sum of all Payment Values',
        icon: 'revenue'
      },
      {
        title: 'Net Revenue',
        value: formatCurrency(netRevenue),
        change: 8.2,
        description: 'Revenue after deducting VAT',
        calculation: 'Gross Revenue - Total VAT',
        icon: 'net'
      },
      {
        title: 'Total Transactions',
        value: formatNumber(totalTransactions),
        change: 15.3,
        description: 'Number of successful payment transactions',
        calculation: 'Count of all payment records',
        icon: 'transactions'
      },
      {
        title: 'Average Ticket Value',
        value: formatCurrency(atv),
        change: -2.1,
        description: 'Average revenue per transaction',
        calculation: 'Total Revenue / Total Transactions',
        icon: 'atv'
      },
      {
        title: 'Average Unit Value',
        value: formatCurrency(auv),
        change: 5.7,
        description: 'Average revenue per unit sold',
        calculation: 'Total Revenue / Total Units Sold',
        icon: 'auv'
      },
      {
        title: 'Unique Members',
        value: formatNumber(uniqueMembers),
        change: 18.9,
        description: 'Number of unique customers who made purchases',
        calculation: 'Count of distinct Member IDs',
        icon: 'members'
      },
      {
        title: 'Average Spend Value',
        value: formatCurrency(asv),
        change: 7.4,
        description: 'Average spend per unique member',
        calculation: 'Total Revenue / Unique Members',
        icon: 'asv'
      },
      {
        title: 'Units per Transaction',
        value: upt.toFixed(2),
        change: 3.2,
        description: 'Average number of units per transaction',
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-fade-in">
          Sales Analytics Dashboard
        </h2>
        <p className="text-slate-600 mt-2 text-lg">Comprehensive sales performance insights across all locations</p>
      </div>

      <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 to-slate-200 p-1 rounded-xl">
          {locations.map((location) => (
            <TabsTrigger
              key={location.id}
              value={location.id}
              className={cn(
                "relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300",
                "data-[state=active]:bg-white data-[state=active]:shadow-lg",
                "data-[state=active]:text-blue-600 hover:text-blue-500"
              )}
            >
              <span className="relative z-10">{location.name}</span>
              {activeLocation === location.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="space-y-6 mt-6">
            <FilterSection
              filters={filters}
              onFiltersChange={setFilters}
              onReset={resetFilters}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric, index) => (
                <MetricCard
                  key={metric.title}
                  data={metric}
                  delay={index * 100}
                />
              ))}
            </div>

            <div className="space-y-6">
              <TopBottomSellers data={filteredData} type="product" />
              <TopBottomSellers data={filteredData} type="category" />
            </div>

            <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Advanced Data Tables</CardTitle>
                <p className="text-slate-600">Detailed performance metrics and analytics</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg">Advanced data tables with real-time analytics</p>
                  <p className="text-sm mt-2">Coming up next with full pagination, sorting, and filtering capabilities</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
