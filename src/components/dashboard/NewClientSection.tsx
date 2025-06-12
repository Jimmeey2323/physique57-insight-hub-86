
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Filter, Users, TrendingUp, Target, Heart, MapPin, DollarSign, Activity, BarChart3, Calendar, Trophy, TrendingDown } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { NewClientDataTable } from './NewClientDataTable';
import { NewClientAnalyticsTable } from './NewClientAnalyticsTable';
import { FilterSection } from './FilterSection';
import { useNewClientData } from '@/hooks/useNewClientData';
import { NewClientData, NewClientFilterOptions, MetricCardData, TableData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

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

  const resetFilters = () => {
    setFilters({
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
  };

  if (isLoading) {
    return (
      <Card className="p-8 bg-gradient-to-br from-white via-slate-50 to-blue-50 shadow-xl">
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Loading new client analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 bg-gradient-to-br from-white via-red-50 to-red-100 shadow-xl">
        <CardContent className="text-center text-red-600">
          <p className="font-semibold">Error loading analytics data</p>
          <p className="text-sm mt-2">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse mb-4">
          Client Conversion & Retention Analytics
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive member acquisition, conversion, and retention insights with advanced analytics capabilities
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full animate-fade-in"></div>
        <p className="text-sm text-slate-500 mt-4">Data points: {data.length} | Filtered: {filteredData.length}</p>
      </div>

      {/* Enhanced Location Tabs */}
      <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 via-white to-slate-100 p-2 rounded-2xl shadow-lg">
          <TabsTrigger
            value="all"
            className={cn(
              "relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-sm transition-all duration-500",
              "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600",
              "data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105",
              "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-102",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
          >
            <span className="relative z-10 block text-center">
              <div className="font-bold">All Locations</div>
              <div className="text-xs opacity-80">Combined View</div>
            </span>
            {activeLocation === 'all' && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
            )}
          </TabsTrigger>
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

        <TabsContent value={activeLocation} className="space-y-8 mt-8">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Advanced Filters
              </Button>
              {showFilters && (
                <Button variant="outline" onClick={resetFilters} className="gap-2">
                  Reset Filters
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Analytics
              </Button>
            </div>
          </div>

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
            <TabsList className="grid w-full grid-cols-7 bg-gradient-to-r from-slate-100 via-white to-slate-100 p-1 rounded-xl shadow-md">
              <TabsTrigger value="executive" className="flex items-center gap-2 text-xs">
                <BarChart3 className="w-4 h-4" />
                Executive
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-2 text-xs">
                <Calendar className="w-4 h-4" />
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-4 h-4" />
                Yearly
              </TabsTrigger>
              <TabsTrigger value="trainers" className="flex items-center gap-2 text-xs">
                <Users className="w-4 h-4" />
                Trainers
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4" />
                Locations
              </TabsTrigger>
              <TabsTrigger value="top-performers" className="flex items-center gap-2 text-xs">
                <Trophy className="w-4 h-4" />
                Top Lists
              </TabsTrigger>
              <TabsTrigger value="detailed" className="flex items-center gap-2 text-xs">
                <Activity className="w-4 h-4" />
                Detailed
              </TabsTrigger>
            </TabsList>

            {/* Executive Overview */}
            <TabsContent value="executive" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InteractiveChart
                  title="Member Acquisition Trends"
                  data={filteredData}
                  type="conversion"
                />
                <InteractiveChart
                  title="Revenue Analytics Overview"
                  data={filteredData}
                  type="retention"
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NewClientDataTable
                  title="Executive Summary - Top Locations"
                  data={filteredData.reduce((acc, item) => {
                    const location = item.firstVisitLocation;
                    const existing = acc.find(a => a['Location'] === location);
                    if (existing) {
                      existing['Total Members'] = (existing['Total Members'] as number) + 1;
                    } else {
                      acc.push({ 'Location': location, 'Total Members': 1 });
                    }
                    return acc;
                  }, [] as TableData[]).slice(0, 10)}
                  className="w-full"
                />
                <NewClientDataTable
                  title="Executive Summary - Top Trainers"
                  data={filteredData.reduce((acc, item) => {
                    if (!item.trainerName || item.trainerName === '') return acc;
                    const trainer = item.trainerName;
                    const existing = acc.find(a => a['Trainer'] === trainer);
                    if (existing) {
                      existing['Total Members'] = (existing['Total Members'] as number) + 1;
                    } else {
                      acc.push({ 'Trainer': trainer, 'Total Members': 1 });
                    }
                    return acc;
                  }, [] as TableData[]).slice(0, 10)}
                  className="w-full"
                />
              </div>
            </TabsContent>

            {/* Monthly Analysis */}
            <TabsContent value="monthly" className="space-y-6">
              <NewClientAnalyticsTable
                data={filteredData}
                title="Month-on-Month Performance Analysis"
                type="monthly"
                className="w-full"
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NewClientAnalyticsTable
                  data={filteredData}
                  title="Monthly Trainer Performance"
                  type="trainer-monthly"
                  className="w-full"
                  maxRows={20}
                />
                <NewClientAnalyticsTable
                  data={filteredData}
                  title="Monthly Location Performance"
                  type="location-monthly"
                  className="w-full"
                  maxRows={20}
                />
              </div>

              <NewClientAnalyticsTable
                data={filteredData}
                title="Monthly Membership Usage Analysis"
                type="membership-monthly"
                className="w-full"
              />
            </TabsContent>

            {/* Yearly Analysis */}
            <TabsContent value="yearly" className="space-y-6">
              <NewClientAnalyticsTable
                data={filteredData}
                title="Year-on-Year Growth Analysis"
                type="yearly"
                className="w-full"
              />
            </TabsContent>

            {/* Trainer Analysis */}
            <TabsContent value="trainers" className="space-y-6">
              <NewClientAnalyticsTable
                data={filteredData}
                title="Comprehensive Trainer Performance Analysis"
                type="trainer-monthly"
                className="w-full"
              />
            </TabsContent>

            {/* Location Analysis */}
            <TabsContent value="locations" className="space-y-6">
              <NewClientAnalyticsTable
                data={filteredData}
                title="Comprehensive Location Performance Analysis"
                type="location-monthly"
                className="w-full"
              />
            </TabsContent>

            {/* Top/Bottom Performers */}
            <TabsContent value="top-performers" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NewClientAnalyticsTable
                  data={filteredData}
                  title="🏆 Top Performing Trainers"
                  type="top-performers"
                  className="w-full"
                />
                <NewClientAnalyticsTable
                  data={filteredData}
                  title="📉 Bottom Performing Trainers"
                  type="bottom-performers"
                  className="w-full"
                />
              </div>
            </TabsContent>

            {/* Detailed View */}
            <TabsContent value="detailed" className="space-y-6">
              <NewClientDataTable
                title="Complete Member Analytics Database"
                data={filteredData.map(item => ({
                  'Member ID': item.memberId,
                  'Name': `${item.firstName} ${item.lastName}`,
                  'Email': item.email,
                  'Phone': item.phoneNumber,
                  'First Visit Date': item.firstVisitDate,
                  'Location': item.firstVisitLocation,
                  'Home Location': item.homeLocation,
                  'Trainer': item.trainerName,
                  'Is New': item.isNew,
                  'Classes': item.classNo,
                  'Post-Trial Visits': item.visitsPostTrial,
                  'Membership Bought': item.membershipsBoughtPostTrial,
                  'LTV': formatCurrency(item.ltv),
                  'Retention Status': item.retentionStatus,
                  'Conversion Status': item.conversionStatus
                }))}
                className="w-full"
                maxRows={100}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};
