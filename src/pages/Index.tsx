
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesAnalyticsSection } from '@/components/dashboard/SalesAnalyticsSection';
import { NewClientSection } from '@/components/dashboard/NewClientSection';
import { SessionsSection } from '@/components/dashboard/SessionsSection';
import { TrainerPerformanceSection } from '@/components/dashboard/TrainerPerformanceSection';
import { DiscountsSection } from '@/components/dashboard/DiscountsSection';
import { LeadsSection } from '@/components/dashboard/LeadsSection';
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { useSalesData } from '@/hooks/useSalesData';
import { useDiscountsData } from '@/hooks/useDiscountsData';

const Index = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const { data: salesData, loading: salesLoading } = useSalesData();
  const { data: discountsData, loading: discountsLoading } = useDiscountsData();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation activeSection={activeTab} onSectionChange={setActiveTab} />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
            <TabsTrigger value="new-clients">New Clients</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            {salesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading sales data...</div>
              </div>
            ) : (
              <SalesAnalyticsSection data={salesData} />
            )}
          </TabsContent>

          <TabsContent value="new-clients">
            <NewClientSection />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionsSection />
          </TabsContent>

          <TabsContent value="trainers">
            <TrainerPerformanceSection />
          </TabsContent>

          <TabsContent value="discounts">
            {discountsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading discounts data...</div>
              </div>
            ) : (
              <DiscountsSection data={discountsData} />
            )}
          </TabsContent>

          <TabsContent value="leads">
            <LeadsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
