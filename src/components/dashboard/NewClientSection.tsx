import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Filter, Users, TrendingUp, Target, Heart } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { DataTable } from './DataTable';
import { FilterSection } from './FilterSection';
import { TopBottomSellers } from './TopBottomSellers';
import { useNewClientData } from '@/hooks/useNewClientData';
import { NewClientData, NewClientFilterOptions, MetricCardData, TableData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface NewClientSectionProps {
  data?: NewClientData[];
}

export const NewClientSection: React.FC<NewClientSectionProps> = ({ data: externalData }) => {
  const { data: hookData, isLoading, error } = useNewClientData();
  const data = externalData || hookData || [];
  
  const [activeView, setActiveView] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<NewClientFilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    homeLocation: [],
    trainer: [],
    paymentMethod: [],
    retentionStatus: [],
    conversionStatus: [],
    isNew: [],
    minLTV: undefined,
    maxLTV: undefined,
  });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Apply filters here
      if (filters.location.length > 0 && !filters.location.includes(item.firstVisitLocation)) return false;
      if (filters.homeLocation.length > 0 && !filters.homeLocation.includes(item.homeLocation)) return false;
      if (filters.trainer.length > 0 && !filters.trainer.includes(item.trainerName)) return false;
      if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(item.paymentMethod)) return false;
      if (filters.retentionStatus.length > 0 && !filters.retentionStatus.includes(item.retentionStatus)) return false;
      if (filters.conversionStatus.length > 0 && !filters.conversionStatus.includes(item.conversionStatus)) return false;
      if (filters.isNew.length > 0 && !filters.isNew.includes(item.isNew)) return false;
      if (filters.minLTV !== undefined && item.ltv < filters.minLTV) return false;
      if (filters.maxLTV !== undefined && item.ltv > filters.maxLTV) return false;
      
      return true;
    });
  }, [data, filters]);

  const metrics = useMemo((): MetricCardData[] => {
    const uniqueMembers = new Set(filteredData.map(item => item.memberId)).size;
    const newClients = filteredData.filter(item => item.isNew === 'Yes').length;
    const returningClients = filteredData.filter(item => item.isNew === 'No').length;
    const convertedMembers = filteredData.filter(item => item.membershipsBoughtPostTrial === 'Yes');
    const conversionRate = filteredData.length > 0 ? (convertedMembers.length / filteredData.length) * 100 : 0;
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.ltv, 0);
    const avgLTV = filteredData.length > 0 ? totalRevenue / filteredData.length : 0;
    const retainedMembers = filteredData.filter(item => 
      item.retentionStatus === 'Active' || item.retentionStatus === 'Retained'
    ).length;
    const retentionRate = filteredData.length > 0 ? (retainedMembers / filteredData.length) * 100 : 0;

    return [
      {
        title: 'Total Clients',
        value: uniqueMembers.toLocaleString(),
        change: 0,
        description: 'Total unique members tracked in the system',
        calculation: 'Count of unique Member IDs',
        icon: 'members'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: 0,
        description: 'Percentage of trial members who purchased memberships',
        calculation: '(Converted Members / Total Members) × 100',
        icon: 'revenue'
      },
      {
        title: 'Avg. Lifetime Value',
        value: formatCurrency(avgLTV),
        change: 0,
        description: 'Average revenue generated per member',
        calculation: 'Total LTV / Total Members',
        icon: 'transactions'
      },
      {
        title: 'Retention Rate',
        value: `${retentionRate.toFixed(1)}%`,
        change: 0,
        description: 'Percentage of members marked as active or retained',
        calculation: '(Active + Retained Members / Total Members) × 100',
        icon: 'revenue'
      }
    ];
  }, [filteredData]);

  const monthlyData = useMemo(() => {
    const monthlyStats = filteredData.reduce((acc, item) => {
      const date = new Date(item.firstVisitDate);
      const monthKey = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          newMembers: 0,
          retained: 0,
          converted: 0,
          total: 0
        };
      }
      
      acc[monthKey].total += 1;
      if (item.isNew === 'Yes') acc[monthKey].newMembers += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') {
        acc[monthKey].retained += 1;
      }
      if (item.membershipsBoughtPostTrial === 'Yes') acc[monthKey].converted += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyStats).map((month: any) => ({
      ...month,
      retentionRate: month.total > 0 ? ((month.retained / month.total) * 100).toFixed(1) : '0',
      conversionRate: month.total > 0 ? ((month.converted / month.total) * 100).toFixed(1) : '0'
    }));
  }, [filteredData]);

  const memberDetailData = useMemo((): TableData[] => {
    return filteredData.map(item => ({
      'Member ID': item.memberId,
      'Name': `${item.firstName} ${item.lastName}`,
      'Email': item.email,
      'Phone': item.phoneNumber,
      'Home Location': item.homeLocation,
      'Trainer': item.trainerName,
      'LTV': formatCurrency(item.ltv),
      'Retention Status': item.retentionStatus,
      'Conversion Status': item.conversionStatus
    }));
  }, [filteredData]);

  const conversionFunnelData = useMemo((): TableData[] => {
    const totalSignups = filteredData.length;
    const attendedTrial = filteredData.filter(item => item.visitsPostTrial > 0).length;
    const boughtMembership = filteredData.filter(item => item.membershipsBoughtPostTrial === 'Yes').length;
    const retained = filteredData.filter(item => 
      item.retentionStatus === 'Active' || item.retentionStatus === 'Retained'
    ).length;

    return [
      {
        'Stage': 'Trial Signups',
        'Count': totalSignups,
        '% of Previous Stage': '—'
      },
      {
        'Stage': 'Attended Trial',
        'Count': attendedTrial,
        '% of Previous Stage': totalSignups > 0 ? `${((attendedTrial / totalSignups) * 100).toFixed(1)}%` : '0%'
      },
      {
        'Stage': 'Bought Membership',
        'Count': boughtMembership,
        '% of Previous Stage': attendedTrial > 0 ? `${((boughtMembership / attendedTrial) * 100).toFixed(1)}%` : '0%'
      },
      {
        'Stage': 'Retained',
        'Count': retained,
        '% of Previous Stage': boughtMembership > 0 ? `${((retained / boughtMembership) * 100).toFixed(1)}%` : '0%'
      }
    ];
  }, [filteredData]);

  const locationAnalysisData = useMemo((): TableData[] => {
    const locationStats = filteredData.reduce((acc, item) => {
      const location = item.firstVisitLocation;
      if (!acc[location]) {
        acc[location] = {
          firstVisits: 0,
          conversions: 0,
          retainedMembers: 0,
          totalRevenue: 0
        };
      }
      
      acc[location].firstVisits += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[location].conversions += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') {
        acc[location].retainedMembers += 1;
      }
      acc[location].totalRevenue += item.ltv;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(locationStats).map(([location, stats]: [string, any]) => ({
      'Location': location,
      'First Visits': stats.firstVisits,
      'Conversions': stats.conversions,
      'Retention Rate': stats.firstVisits > 0 ? `${((stats.retainedMembers / stats.firstVisits) * 100).toFixed(1)}%` : '0%',
      'Revenue Generated': formatCurrency(stats.totalRevenue)
    }));
  }, [filteredData]);

  const trainerPerformanceData = useMemo((): TableData[] => {
    const trainerStats = filteredData.reduce((acc, item) => {
      const trainer = item.trainerName;
      if (!trainer || trainer === '') return acc;
      
      if (!acc[trainer]) {
        acc[trainer] = {
          totalClients: 0,
          totalVisits: 0,
          totalLTV: 0,
          conversions: 0
        };
      }
      
      acc[trainer].totalClients += 1;
      acc[trainer].totalVisits += item.visitsPostTrial;
      acc[trainer].totalLTV += item.ltv;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[trainer].conversions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(trainerStats).map(([trainer, stats]: [string, any]) => ({
      'Trainer': trainer,
      'Total Clients': stats.totalClients,
      'Avg. Visits': stats.totalClients > 0 ? (stats.totalVisits / stats.totalClients).toFixed(1) : '0',
      'Avg. LTV': formatCurrency(stats.totalClients > 0 ? stats.totalLTV / stats.totalClients : 0),
      'Conversion Rate': stats.totalClients > 0 ? `${((stats.conversions / stats.totalClients) * 100).toFixed(1)}%` : '0%'
    }));
  }, [filteredData]);

  const revenueDistributionData = useMemo((): TableData[] => {
    const paymentStats = filteredData.reduce((acc, item) => {
      const method = item.paymentMethod;
      if (!acc[method]) {
        acc[method] = {
          totalRevenue: 0,
          memberCount: 0,
          totalLTV: 0
        };
      }
      
      acc[method].totalRevenue += item.ltv;
      acc[method].memberCount += 1;
      acc[method].totalLTV += item.ltv;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(paymentStats).map(([method, stats]: [string, any]) => ({
      'Payment Method': method,
      'Total Revenue': formatCurrency(stats.totalRevenue),
      'Avg LTV': formatCurrency(stats.memberCount > 0 ? stats.totalLTV / stats.memberCount : 0),
      'Member Count': stats.memberCount
    }));
  }, [filteredData]);

  const handleFiltersChange = (newFilters: NewClientFilterOptions) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading new client data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <CardContent className="text-center text-red-600">
          <p>Error loading data: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            Client Conversion & Retention Analytics
          </h2>
          <p className="text-slate-600 mt-2">Track member acquisition, conversion, and retention metrics</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <FilterSection
          data={filteredData}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          type="newClient"
        />
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} data={metric} delay={index * 100} />
        ))}
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="trainers">Trainers</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractiveChart
              title="Monthly Client Trends"
              data={filteredData}
              type="conversion"
            />
            <InteractiveChart
              title="Retention Analytics"
              data={filteredData}
              type="retention"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Top Performing Trainers</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  title=""
                  data={trainerPerformanceData.slice(0, 5) as any}
                  type="category"
                />
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Bottom Performing Trainers</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  title=""
                  data={trainerPerformanceData.slice(-5).reverse() as any}
                  type="category"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataTable
              title="Conversion Funnel Analysis"
              data={conversionFunnelData as any}
              type="category"
            />
            <DataTable
              title="Monthly Performance Metrics"
              data={monthlyData as any}
              type="monthly"
            />
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <DataTable
            title="Revenue Distribution by Payment Method"
            data={revenueDistributionData as any}
            type="category"
          />
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <DataTable
            title="Location Performance Analysis"
            data={locationAnalysisData as any}
            type="category"
          />
        </TabsContent>

        <TabsContent value="trainers" className="space-y-6">
          <DataTable
            title="Trainer Performance Metrics"
            data={trainerPerformanceData as any}
            type="category"
          />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <DataTable
            title="Member Details"
            data={memberDetailData as any}
            type="category"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
