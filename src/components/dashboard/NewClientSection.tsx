
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Filter, Users, TrendingUp, Target, Heart, MapPin, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { NewClientDataTable } from './NewClientDataTable';
import { FilterSection } from './FilterSection';
import { useNewClientData } from '@/hooks/useNewClientData';
import { NewClientData, NewClientFilterOptions, MetricCardData, TableData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface NewClientSectionProps {
  data?: NewClientData[];
}

const locations = [
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const NewClientSection: React.FC<NewClientSectionProps> = ({ data: externalData }) => {
  const [activeLocation, setActiveLocation] = useState('all');
  const [activeView, setActiveView] = useState('executive');
  const [showFilters, setShowFilters] = useState(false);
  const { data: hookData, isLoading, error } = useNewClientData();
  const data = externalData || hookData || [];
  
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
    let filtered = data.filter(item => {
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

    // Apply location filter
    if (activeLocation !== 'all') {
      const selectedLocation = locations.find(loc => loc.id === activeLocation);
      if (selectedLocation) {
        filtered = filtered.filter(item => item.firstVisitLocation === selectedLocation.fullName);
      }
    }

    return filtered;
  }, [data, filters, activeLocation]);

  // Member Metrics
  const memberMetrics = useMemo((): MetricCardData[] => {
    const uniqueMembers = new Set(filteredData.map(item => item.memberId)).size;
    const newClients = filteredData.filter(item => item.isNew === 'Yes').length;
    const returningClients = filteredData.filter(item => item.isNew === 'No').length;
    const notNewMembers = filteredData.filter(item => item.isNew === 'No');
    const convertedPostTrial = notNewMembers.filter(item => item.membershipsBoughtPostTrial === 'Yes').length;
    const conversionRatePostTrial = notNewMembers.length > 0 ? (convertedPostTrial / notNewMembers.length) * 100 : 0;
    
    const convertedMembers = filteredData.filter(item => item.membershipsBoughtPostTrial === 'Yes');
    const avgVisitsPostTrial = convertedMembers.length > 0 
      ? convertedMembers.reduce((sum, item) => sum + item.visitsPostTrial, 0) / convertedMembers.length 
      : 0;
    
    const totalLTV = filteredData.reduce((sum, item) => sum + item.ltv, 0);
    const avgLTV = filteredData.length > 0 ? totalLTV / filteredData.length : 0;

    return [
      {
        title: 'Total Clients',
        value: uniqueMembers.toLocaleString(),
        change: 0,
        description: 'Count of unique Member IDs',
        calculation: 'Count of unique Member IDs',
        icon: 'members'
      },
      {
        title: 'New vs Returning',
        value: `${newClients}/${returningClients}`,
        change: 0,
        description: 'New clients vs returning clients',
        calculation: 'Based on Is New field',
        icon: 'members'
      },
      {
        title: 'Conversion Rate Post Trial',
        value: `${conversionRatePostTrial.toFixed(1)}%`,
        change: 0,
        description: 'Percentage of "Not New" members who bought memberships',
        calculation: 'Converted Not New / Total Not New × 100',
        icon: 'revenue'
      },
      {
        title: 'Avg. Visits Post Trial',
        value: avgVisitsPostTrial.toFixed(1),
        change: 0,
        description: 'Average visits for converted members',
        calculation: 'Avg of Visits Post Trial for converted members',
        icon: 'transactions'
      }
    ];
  }, [filteredData]);

  // Sales Metrics
  const salesMetrics = useMemo((): MetricCardData[] => {
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.ltv, 0);
    const avgRevenuePerMember = filteredData.length > 0 ? totalRevenue / filteredData.length : 0;
    const convertedRevenue = filteredData
      .filter(item => item.membershipsBoughtPostTrial === 'Yes')
      .reduce((sum, item) => sum + item.ltv, 0);
    const avgPurchaseFrequency = filteredData.length > 0
      ? filteredData.reduce((sum, item) => sum + item.purchaseCountPostTrial, 0) / filteredData.length
      : 0;

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: 0,
        description: 'Sum of all LTV values',
        calculation: 'Sum of LTV',
        icon: 'revenue'
      },
      {
        title: 'Avg. Revenue per Member',
        value: formatCurrency(avgRevenuePerMember),
        change: 0,
        description: 'Average revenue generated per member',
        calculation: 'Total Revenue / Total Clients',
        icon: 'revenue'
      },
      {
        title: 'Revenue from Converted',
        value: formatCurrency(convertedRevenue),
        change: 0,
        description: 'Revenue from members who bought post-trial',
        calculation: 'Sum of LTV where Memberships Bought Post Trial = Yes',
        icon: 'revenue'
      },
      {
        title: 'Avg. Purchase Frequency',
        value: avgPurchaseFrequency.toFixed(1),
        change: 0,
        description: 'Average purchase count post trial',
        calculation: 'Avg of Purchase Count Post Trial',
        icon: 'transactions'
      }
    ];
  }, [filteredData]);

  // Usage and Location Metrics
  const usageMetrics = useMemo((): MetricCardData[] => {
    const totalFirstVisits = filteredData.length;
    const totalPostTrialVisits = filteredData.reduce((sum, item) => sum + item.visitsPostTrial, 0);
    const visitConversionRatio = totalFirstVisits > 0 ? (totalPostTrialVisits / totalFirstVisits) * 100 : 0;
    const avgClassCount = filteredData.length > 0
      ? filteredData.reduce((sum, item) => sum + item.classNo, 0) / filteredData.length
      : 0;

    const retainedMembers = filteredData.filter(item => 
      item.retentionStatus === 'Active' || item.retentionStatus === 'Retained'
    ).length;
    const retentionRate = filteredData.length > 0 ? (retainedMembers / filteredData.length) * 100 : 0;
    const churnRate = 100 - retentionRate;

    return [
      {
        title: 'Visit Conversion Ratio',
        value: `${visitConversionRatio.toFixed(1)}%`,
        change: 0,
        description: 'Post-trial visits vs total first visits',
        calculation: 'Post-trial visits / Total first visits',
        icon: 'transactions'
      },
      {
        title: 'Avg. Class Count',
        value: avgClassCount.toFixed(1),
        change: 0,
        description: 'Average classes per member',
        calculation: 'Avg of Class No',
        icon: 'transactions'
      },
      {
        title: 'Retention Rate',
        value: `${retentionRate.toFixed(1)}%`,
        change: 0,
        description: 'Members marked as Active/Retained',
        calculation: 'Active + Retained / Total Members × 100',
        icon: 'revenue'
      },
      {
        title: 'Churn Rate',
        value: `${churnRate.toFixed(1)}%`,
        change: 0,
        description: 'Members not retained',
        calculation: '100% - Retention Rate',
        icon: 'members'
      }
    ];
  }, [filteredData]);

  // Table Data
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

    return Object.entries(trainerStats)
      .map(([trainer, stats]: [string, any]) => ({
        'Trainer': trainer,
        'Total Clients': stats.totalClients,
        'Avg. Visits': stats.totalClients > 0 ? (stats.totalVisits / stats.totalClients).toFixed(1) : '0',
        'Avg. LTV': formatCurrency(stats.totalClients > 0 ? stats.totalLTV / stats.totalClients : 0),
        'Conversion Rate': stats.totalClients > 0 ? `${((stats.conversions / stats.totalClients) * 100).toFixed(1)}%` : '0%'
      }))
      .sort((a, b) => parseFloat(b['Conversion Rate']) - parseFloat(a['Conversion Rate']));
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

  const paymentMethodBreakdown = useMemo((): TableData[] => {
    const methodStats = filteredData.reduce((acc, item) => {
      const method = item.paymentMethod;
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = filteredData.length;
    return Object.entries(methodStats).map(([method, count]) => ({
      'Payment Method': method,
      'Count': count,
      'Percentage': total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%'
    }));
  }, [filteredData]);

  const topHomeLocations = useMemo((): TableData[] => {
    const locationStats = filteredData.reduce((acc, item) => {
      const location = item.homeLocation;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([location, count]) => ({
        'Home Location': location,
        'Member Count': count
      }));
  }, [filteredData]);

  const trainerPopularity = useMemo((): TableData[] => {
    const trainerStats = filteredData.reduce((acc, item) => {
      const trainer = item.trainerName;
      if (trainer && trainer !== '') {
        acc[trainer] = (acc[trainer] || 0) + item.classNo;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(trainerStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([trainer, classes]) => ({
        'Trainer': trainer,
        'Total Classes': classes
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
          <p className="text-sm text-slate-500 mt-1">Data points: {data.length} | Filtered: {filteredData.length}</p>
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

      {/* Location Tabs */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeLocation === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveLocation('all')}
            className="text-sm"
          >
            All Locations
          </Button>
          {locations.map((location) => (
            <Button
              key={location.id}
              variant={activeLocation === location.id ? 'default' : 'outline'}
              onClick={() => setActiveLocation(location.id)}
              className="text-sm"
            >
              {location.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Filters */}
      {showFilters && (
        <FilterSection
          data={filteredData}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          type="newClient"
        />
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="executive" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Executive
          </TabsTrigger>
          <TabsTrigger value="conversion" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Conversion
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Detailed
          </TabsTrigger>
        </TabsList>

        {/* Executive Overview */}
        <TabsContent value="executive" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {memberMetrics.slice(0, 2).map((metric, index) => (
              <MetricCard key={metric.title} data={metric} delay={index * 100} />
            ))}
            {salesMetrics.slice(0, 2).map((metric, index) => (
              <MetricCard key={metric.title} data={metric} delay={(index + 2) * 100} />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NewClientDataTable
              title="Top 5 Locations by Performance"
              data={locationAnalysisData.slice(0, 5)}
              className="w-full"
            />
            <NewClientDataTable
              title="Top 5 Trainers by Performance"
              data={trainerPerformanceData.slice(0, 5)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractiveChart
              title="Member Acquisition Trends"
              data={filteredData}
              type="conversion"
            />
            <InteractiveChart
              title="Revenue Analytics"
              data={filteredData}
              type="retention"
            />
          </div>
        </TabsContent>

        {/* Conversion Dashboard */}
        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {memberMetrics.map((metric, index) => (
              <MetricCard key={metric.title} data={metric} delay={index * 100} />
            ))}
          </div>

          <div className="space-y-6">
            <NewClientDataTable
              title="Conversion Funnel Analysis"
              data={conversionFunnelData}
              className="w-full"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NewClientDataTable
                title="Conversion by Location"
                data={locationAnalysisData}
                className="w-full"
              />
              <NewClientDataTable
                title="Conversion by Trainer"
                data={trainerPerformanceData}
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>

        {/* Revenue Dashboard */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {salesMetrics.map((metric, index) => (
              <MetricCard key={metric.title} data={metric} delay={index * 100} />
            ))}
          </div>

          <div className="space-y-6">
            <NewClientDataTable
              title="Revenue Distribution by Payment Method"
              data={revenueDistributionData}
              className="w-full"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NewClientDataTable
                title="Payment Method Breakdown"
                data={paymentMethodBreakdown}
                className="w-full"
              />
              <NewClientDataTable
                title="High LTV Members (Top 10)"
                data={memberDetailData
                  .sort((a, b) => parseFloat(b['LTV'].replace(/[₹,KLCr]/g, '')) - parseFloat(a['LTV'].replace(/[₹,KLCr]/g, '')))
                  .slice(0, 10)}
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>

        {/* Location Dashboard */}
        <TabsContent value="location" className="space-y-6">
          <div className="space-y-6">
            <NewClientDataTable
              title="Location Performance Analysis"
              data={locationAnalysisData}
              className="w-full"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NewClientDataTable
                title="Top Home Locations"
                data={topHomeLocations}
                className="w-full"
              />
              <NewClientDataTable
                title="First Visit Locations"
                data={locationAnalysisData.map(item => ({
                  'Location': item['Location'],
                  'First Visits': item['First Visits']
                }))}
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>

        {/* Usage Metrics */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {usageMetrics.map((metric, index) => (
              <MetricCard key={metric.title} data={metric} delay={index * 100} />
            ))}
          </div>

          <div className="space-y-6">
            <NewClientDataTable
              title="Trainer Popularity (by Total Classes)"
              data={trainerPopularity}
              className="w-full"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NewClientDataTable
                title="Retention Status Breakdown"
                data={filteredData.reduce((acc, item) => {
                  const status = item.retentionStatus;
                  const existing = acc.find(a => a['Retention Status'] === status);
                  if (existing) {
                    existing['Count'] = (existing['Count'] as number) + 1;
                  } else {
                    acc.push({ 'Retention Status': status, 'Count': 1 });
                  }
                  return acc;
                }, [] as TableData[])}
                className="w-full"
              />
              <NewClientDataTable
                title="Class Attendance Analysis"
                data={[
                  { 'Metric': 'Avg. Class Count per Member', 'Value': (filteredData.reduce((sum, item) => sum + item.classNo, 0) / filteredData.length).toFixed(1) },
                  { 'Metric': 'Total Classes Conducted', 'Value': filteredData.reduce((sum, item) => sum + item.classNo, 0) },
                  { 'Metric': 'Members with 0 Classes', 'Value': filteredData.filter(item => item.classNo === 0).length },
                  { 'Metric': 'Members with 5+ Classes', 'Value': filteredData.filter(item => item.classNo >= 5).length }
                ]}
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>

        {/* Detailed View */}
        <TabsContent value="detailed" className="space-y-6">
          <NewClientDataTable
            title="Complete Member Details"
            data={memberDetailData}
            className="w-full"
            maxRows={100}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
