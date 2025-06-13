
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Filter, Users, TrendingUp, Target, Heart } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { DataTable } from './DataTable';
import { FilterSection } from './FilterSection';
import { useNewClientData } from '@/hooks/useNewClientData';
import { NewClientData, NewClientFilterOptions, MetricCardData, TableData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    const newPaidClients = filteredData.filter(item => item.isNew === 'New - Paid First Visit').length;
    const convertedMembers = filteredData.filter(item => item.conversionStatus === 'Converted');
    const conversionRate = filteredData.length > 0 ? (convertedMembers.length / filteredData.length) * 100 : 0;
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.ltv, 0);
    const avgLTV = filteredData.length > 0 ? totalRevenue / filteredData.length : 0;
    const retainedMembers = filteredData.filter(item => item.retentionStatus === 'Retained').length;
    const retentionRate = filteredData.length > 0 ? (retainedMembers / filteredData.length) * 100 : 0;

    return [
      {
        title: 'Total New Members',
        value: uniqueMembers.toLocaleString(),
        change: 12.5,
        description: 'Total unique new members acquired this period',
        calculation: 'Count of unique Member IDs',
        icon: 'members'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: -2.3,
        description: 'Percentage of trial members who purchased memberships',
        calculation: '(Converted Members / Total Members) × 100',
        icon: 'revenue'
      },
      {
        title: 'Avg. Lifetime Value',
        value: formatCurrency(avgLTV),
        change: 8.7,
        description: 'Average revenue generated per new member',
        calculation: 'Total LTV / Total Members',
        icon: 'transactions'
      },
      {
        title: 'Retention Rate',
        value: `${retentionRate.toFixed(1)}%`,
        change: 15.2,
        description: 'Percentage of members marked as retained',
        calculation: '(Retained Members / Total Members) × 100',
        icon: 'revenue'
      }
    ];
  }, [filteredData]);

  const monthlyData = useMemo(() => {
    const monthlyStats = filteredData.reduce((acc, item) => {
      if (!item.firstVisitDate) return acc;
      
      try {
        const dateParts = item.firstVisitDate.split(' ')[0].split('/');
        if (dateParts.length !== 3) return acc;
        
        const date = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
        if (isNaN(date.getTime())) return acc;
        
        const monthKey = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            date: monthKey,
            month: monthKey,
            newMembers: 0,
            retained: 0,
            converted: 0,
            total: 0,
            revenue: 0,
            value: 0
          };
        }
        
        acc[monthKey].total += 1;
        acc[monthKey].revenue += item.ltv;
        acc[monthKey].value += item.ltv;
        if (item.isNew.includes('New')) acc[monthKey].newMembers += 1;
        if (item.retentionStatus === 'Retained') acc[monthKey].retained += 1;
        if (item.conversionStatus === 'Converted') acc[monthKey].converted += 1;
        
        return acc;
      } catch (error) {
        console.error('Error parsing date:', item.firstVisitDate, error);
        return acc;
      }
    }, {} as Record<string, any>);

    return Object.values(monthlyStats).map((month: any) => ({
      ...month,
      retentionRate: month.total > 0 ? ((month.retained / month.total) * 100).toFixed(1) : '0',
      conversionRate: month.total > 0 ? ((month.converted / month.total) * 100).toFixed(1) : '0'
    }));
  }, [filteredData]);

  const conversionFunnelData = useMemo(() => {
    const totalSignups = filteredData.length;
    const paidFirstVisit = filteredData.filter(item => item.isNew === 'New - Paid First Visit').length;
    const visitedPostTrial = filteredData.filter(item => item.visitsPostTrial > 0).length;
    const retained = filteredData.filter(item => item.retentionStatus === 'Retained').length;

    return [
      {
        Stage: 'Total Sign-ups',
        Count: totalSignups,
        'Conversion Rate': '100%',
        'Drop-off': '—'
      },
      {
        Stage: 'Paid First Visit',
        Count: paidFirstVisit,
        'Conversion Rate': totalSignups > 0 ? `${((paidFirstVisit / totalSignups) * 100).toFixed(1)}%` : '0%',
        'Drop-off': totalSignups > 0 ? `${(((totalSignups - paidFirstVisit) / totalSignups) * 100).toFixed(1)}%` : '0%'
      },
      {
        Stage: 'Post-Trial Visits',
        Count: visitedPostTrial,
        'Conversion Rate': paidFirstVisit > 0 ? `${((visitedPostTrial / paidFirstVisit) * 100).toFixed(1)}%` : '0%',
        'Drop-off': paidFirstVisit > 0 ? `${(((paidFirstVisit - visitedPostTrial) / paidFirstVisit) * 100).toFixed(1)}%` : '0%'
      },
      {
        Stage: 'Retained Members',
        Count: retained,
        'Conversion Rate': visitedPostTrial > 0 ? `${((retained / visitedPostTrial) * 100).toFixed(1)}%` : '0%',
        'Drop-off': visitedPostTrial > 0 ? `${(((visitedPostTrial - retained) / visitedPostTrial) * 100).toFixed(1)}%` : '0%'
      }
    ];
  }, [filteredData]);

  const locationAnalysisData = useMemo(() => {
    const locationStats = filteredData.reduce((acc, item) => {
      const location = item.firstVisitLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = {
          firstVisits: 0,
          conversions: 0,
          retainedMembers: 0,
          totalRevenue: 0
        };
      }
      
      acc[location].firstVisits += 1;
      if (item.conversionStatus === 'Converted') acc[location].conversions += 1;
      if (item.retentionStatus === 'Retained') acc[location].retainedMembers += 1;
      acc[location].totalRevenue += item.ltv;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(locationStats).map(([location, stats]: [string, any]) => ({
      Location: location,
      'First Visits': stats.firstVisits,
      Conversions: stats.conversions,
      'Conversion Rate': stats.firstVisits > 0 ? `${((stats.conversions / stats.firstVisits) * 100).toFixed(1)}%` : '0%',
      'Retention Rate': stats.firstVisits > 0 ? `${((stats.retainedMembers / stats.firstVisits) * 100).toFixed(1)}%` : '0%',
      'Total Revenue': formatCurrency(stats.totalRevenue),
      'Avg LTV': formatCurrency(stats.firstVisits > 0 ? stats.totalRevenue / stats.firstVisits : 0)
    }));
  }, [filteredData]);

  const trainerPerformanceData = useMemo(() => {
    const trainerStats = filteredData.reduce((acc, item) => {
      const trainer = item.trainerName || 'Unassigned';
      
      if (!acc[trainer]) {
        acc[trainer] = {
          totalClients: 0,
          totalVisits: 0,
          totalLTV: 0,
          conversions: 0,
          retained: 0
        };
      }
      
      acc[trainer].totalClients += 1;
      acc[trainer].totalVisits += item.visitsPostTrial;
      acc[trainer].totalLTV += item.ltv;
      if (item.conversionStatus === 'Converted') acc[trainer].conversions += 1;
      if (item.retentionStatus === 'Retained') acc[trainer].retained += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(trainerStats)
      .map(([trainer, stats]: [string, any]) => ({
        Trainer: trainer,
        'Total Clients': stats.totalClients,
        'Avg. Visits': stats.totalClients > 0 ? (stats.totalVisits / stats.totalClients).toFixed(1) : '0',
        'Total Revenue': formatCurrency(stats.totalLTV),
        'Avg. LTV': formatCurrency(stats.totalClients > 0 ? stats.totalLTV / stats.totalClients : 0),
        'Conversion Rate': stats.totalClients > 0 ? `${((stats.conversions / stats.totalClients) * 100).toFixed(1)}%` : '0%',
        'Retention Rate': stats.totalClients > 0 ? `${((stats.retained / stats.totalClients) * 100).toFixed(1)}%` : '0%'
      }))
      .sort((a, b) => parseFloat(b['Total Revenue'].replace(/[₹,]/g, '')) - parseFloat(a['Total Revenue'].replace(/[₹,]/g, '')));
  }, [filteredData]);

  const paymentMethodData = useMemo(() => {
    const paymentStats = filteredData.reduce((acc, item) => {
      const method = item.paymentMethod || 'Unknown';
      if (!acc[method]) {
        acc[method] = {
          totalMembers: 0,
          totalRevenue: 0,
          retained: 0,
          converted: 0
        };
      }
      
      acc[method].totalMembers += 1;
      acc[method].totalRevenue += item.ltv;
      if (item.retentionStatus === 'Retained') acc[method].retained += 1;
      if (item.conversionStatus === 'Converted') acc[method].converted += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(paymentStats).map(([method, stats]: [string, any]) => ({
      'Payment Method': method,
      'Total Members': stats.totalMembers,
      'Total Revenue': formatCurrency(stats.totalRevenue),
      'Avg Revenue per Member': formatCurrency(stats.totalMembers > 0 ? stats.totalRevenue / stats.totalMembers : 0),
      'Retention Rate': stats.totalMembers > 0 ? `${((stats.retained / stats.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Conversion Rate': stats.totalMembers > 0 ? `${((stats.converted / stats.totalMembers) * 100).toFixed(1)}%` : '0%'
    }));
  }, [filteredData]);

  const memberDetailData = useMemo(() => {
    return filteredData.map(item => ({
      'Member ID': item.memberId,
      'Name': `${item.firstName} ${item.lastName}`,
      'Email': item.email,
      'Phone': item.phoneNumber,
      'First Visit': item.firstVisitDate ? item.firstVisitDate.split(' ')[0] : 'N/A',
      'Location': item.firstVisitLocation,
      'Home Location': item.homeLocation || 'Not specified',
      'Trainer': item.trainerName || 'Not assigned',
      'LTV': formatCurrency(item.ltv),
      'Status': item.isNew,
      'Retention': item.retentionStatus,
      'Conversion': item.conversionStatus
    }));
  }, [filteredData]);

  const CustomTable = ({ data, title }: { data: any[], title: string }) => (
    <div className="w-full overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {data.length > 0 && Object.keys(data[0]).map((key) => (
              <TableHead key={key} className="text-left font-medium text-slate-700 bg-slate-50">
                {key}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className="hover:bg-slate-50">
              {Object.values(row).map((value, cellIndex) => (
                <TableCell key={cellIndex} className="text-slate-600">
                  {String(value)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const handleFiltersChange = (newFilters: NewClientFilterOptions) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Loading Client Analytics</h3>
          <p className="text-slate-600">Fetching new client data and calculating metrics...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-red-200 bg-red-50">
        <CardContent className="text-center">
          <div className="text-red-600 mb-4">
            <Target className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Data Load Error</h3>
          </div>
          <p className="text-red-700 mb-4">Unable to load client data: {error.message}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            New Client Analytics & Performance
          </h2>
          <p className="text-slate-600 mt-2">Track member acquisition, trial conversion, and retention metrics</p>
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
            Export Data
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
        <TabsList className="grid w-full grid-cols-6 h-12">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="conversion" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Conversion
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="trainers" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Trainers
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Monthly Client Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveChart
                  title=""
                  data={monthlyData}
                  type="line"
                />
              </CardContent>
            </Card>
            
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Retention & Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveChart
                  title=""
                  data={monthlyData}
                  type="bar"
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-5 h-5" />
                  Top Performing Trainers
                </CardTitle>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <CustomTable data={trainerPerformanceData.slice(0, 5)} title="" />
              </CardContent>
            </Card>
            
            <Card className="p-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Users className="w-5 h-5" />
                  Location Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <CustomTable data={locationAnalysisData} title="" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-orange-800">Conversion Funnel Analysis</CardTitle>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <CustomTable data={conversionFunnelData} title="" />
              </CardContent>
            </Card>
            
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-purple-800">Monthly Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <CustomTable data={monthlyData} title="" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-800">Revenue Analysis by Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="w-full overflow-x-auto">
              <CustomTable data={paymentMethodData} title="" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-800">Comprehensive Location Performance</CardTitle>
            </CardHeader>
            <CardContent className="w-full overflow-x-auto">
              <CustomTable data={locationAnalysisData} title="" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainers" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-800">Detailed Trainer Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="w-full overflow-x-auto">
              <CustomTable data={trainerPerformanceData} title="" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Complete Member Database</CardTitle>
            </CardHeader>
            <CardContent className="w-full overflow-x-auto">
              <CustomTable data={memberDetailData} title="" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
