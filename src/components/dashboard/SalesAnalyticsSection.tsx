
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesData, FilterOptions } from '@/types/dashboard';
import { FilterSection } from './FilterSection';
import { InteractiveChart } from './InteractiveChart';
import { TopBottomSellers } from './TopBottomSellers';
import { EnhancedYearOnYearTable } from './EnhancedYearOnYearTable';
import { DiscountMonthOnMonthTable } from './DiscountMonthOnMonthTable';
import { DiscountTopBottomLists } from './DiscountTopBottomLists';
import { TrendingUp, BarChart3, Users, Package } from 'lucide-react';

interface SalesAnalyticsSectionProps {
  data: SalesData[];
}

export const SalesAnalyticsSection: React.FC<SalesAnalyticsSectionProps> = ({ data }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleGroupToggle = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  const handleRowClick = (rowData: any) => {
    console.log('Row clicked:', rowData);
  };

  const handleItemClick = (item: any) => {
    console.log('Item clicked:', item);
  };

  return (
    <div className="space-y-6">
      <FilterSection
        data={data}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-md rounded-xl p-1">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="month-on-month" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4" />
            Month-on-Month
          </TabsTrigger>
          <TabsTrigger 
            value="year-on-year" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4" />
            Year-on-Year
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Users className="w-4 h-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractiveChart data={data} filters={filters} />
            <TopBottomSellers data={data} filters={filters} />
          </div>
        </TabsContent>

        <TabsContent value="month-on-month" className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Month-on-Month Sales Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DiscountMonthOnMonthTable 
                data={data} 
                filters={filters} 
                onRowClick={handleRowClick} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="year-on-year" className="space-y-6">
          <EnhancedYearOnYearTable
            data={data}
            filters={filters}
            onRowClick={handleRowClick}
            collapsedGroups={collapsedGroups}
            onGroupToggle={handleGroupToggle}
            selectedMetric="revenue"
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                Product Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DiscountTopBottomLists 
                data={data} 
                onItemClick={handleItemClick} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-purple-50/30 to-violet-50/20 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-700 to-violet-700 bg-clip-text text-transparent">
                Category Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InteractiveChart data={data} filters={filters} />
                <TopBottomSellers data={data} filters={filters} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
