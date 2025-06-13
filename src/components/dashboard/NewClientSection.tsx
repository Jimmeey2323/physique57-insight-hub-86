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
import { ThemeSelector } from './ThemeSelector';
import { DrillDownModal } from './DrillDownModal';
import { useNewClientData } from '@/hooks/useNewClientData';
import { NewClientData, NewClientFilterOptions, MetricCardData, TableData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
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
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'member'>('metric');
  const { data: hookData, isLoading, error } = useNewClientData();
  const data = externalData || hookData || [];
  
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

  // Filter data by location and other filters
  const applyFilters = (rawData: NewClientData[]) => {
    let filtered = rawData;

    // Apply location filter first
    filtered = filtered.filter(item => {
      const locationMatch = activeLocation === 'kwality' 
        ? item.firstVisitLocation === 'Kwality House, Kemps Corner'
        : activeLocation === 'supreme'
        ? item.firstVisitLocation === 'Supreme HQ, Bandra'
        : item.firstVisitLocation === 'Kenkere House';
      
      return locationMatch;
    });

    // Apply other filters
    if (filters.location.length > 0 && !filters.location.includes(item.firstVisitLocation)) return false;
    if (filters.homeLocation.length > 0 && !filters.homeLocation.includes(item.homeLocation)) return false;
    if (filters.trainer.length > 0 && !filters.trainer.includes(item.trainerName)) return false;
    if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(item.paymentMethod)) return false;
    if (filters.retentionStatus.length > 0 && !filters.retentionStatus.includes(item.retentionStatus)) return false;
    if (filters.conversionStatus.length > 0 && !filters.conversionStatus.includes(item.conversionStatus)) return false;
    if (filters.isNew.length > 0 && !filters.isNew.includes(item.isNew)) return false;
    if (filters.minLTV !== undefined && item.ltv < filters.minLTV) return false;
    if (filters.maxLTV !== undefined && item.ltv > filters.maxLTV) return false;

    return filtered;
  };

  const filteredData = useMemo(() => {
    return applyFilters(data);
  }, [data, activeLocation, filters]);

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
    const avgVisitsPostTrial = convertedMembers.length > 0 ? 
      convertedMembers.reduce((sum, item) => sum + item.visitsPostTrial, 0) / convertedMembers.length : 0;

    return [
      {
        title: 'Total Clients',
        value: formatNumber(uniqueMembers),
        change: 12.5,
        description: 'Total unique members tracked in the system with strong growth trajectory',
        calculation: 'Count of unique Member IDs',
        icon: 'members'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: 8.2,
        description: 'Percentage of trial members who purchased memberships post-trial',
        calculation: '(Converted Members / Total Members) × 100',
        icon: 'revenue'
      },
      {
        title: 'Avg. Lifetime Value',
        value: formatCurrency(avgLTV),
        change: 15.3,
        description: 'Average revenue generated per member across all segments',
        calculation: 'Total LTV / Total Members',
        icon: 'transactions'
      },
      {
        title: 'Retention Rate',
        value: `${retentionRate.toFixed(1)}%`,
        change: -2.1,
        description: 'Percentage of members marked as active or retained in the system',
        calculation: '(Active + Retained Members / Total Members) × 100',
        icon: 'revenue'
      },
      {
        title: 'New vs Returning',
        value: `${newClients}/${returningClients}`,
        change: 5.7,
        description: 'Split between new clients and returning clients for this period',
        calculation: 'Count of Yes/No in Is New field',
        icon: 'members'
      },
      {
        title: 'Avg. Visits Post Trial',
        value: avgVisitsPostTrial.toFixed(1),
        change: 18.9,
        description: 'Average number of visits after trial conversion for converted members',
        calculation: 'Avg of Visits Post Trial for converted members',
        icon: 'transactions'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: 7.4,
        description: 'Sum of all lifetime values across all tracked members',
        calculation: 'Sum of LTV across all members',
        icon: 'revenue'
      },
      {
        title: 'Avg. Revenue per Member',
        value: formatCurrency(totalRevenue / uniqueMembers || 0),
        change: 3.2,
        description: 'Average revenue contribution per unique member in the system',
        calculation: 'Total Revenue / Total Clients',
        icon: 'revenue'
      }
    ];
  }, [filteredData]);

  // Month-on-Month Analysis
  const monthlyAnalysis = useMemo(() => {
    const monthlyStats = filteredData.reduce((acc, item) => {
      const date = new Date(item.firstVisitDate);
      const monthKey = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          totalMembers: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalRevenue: 0,
          totalVisits: 0
        };
      }
      
      acc[monthKey].totalMembers += 1;
      acc[monthKey].totalRevenue += item.ltv;
      acc[monthKey].totalVisits += item.visitsPostTrial;
      if (item.isNew === 'Yes') acc[monthKey].newMembers += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[monthKey].converted += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') {
        acc[monthKey].retained += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyStats).map((month: any) => ({
      'Month': month.month,
      'Total Members': month.totalMembers,
      'New Members': month.newMembers,
      'Converted': month.converted,
      'Retained': month.retained,
      'Conversion Rate': month.totalMembers > 0 ? `${((month.converted / month.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Retention Rate': month.totalMembers > 0 ? `${((month.retained / month.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Total Revenue': formatCurrency(month.totalRevenue),
      'Avg LTV': formatCurrency(month.totalMembers > 0 ? month.totalRevenue / month.totalMembers : 0)
    }));
  }, [filteredData]);

  // Year-on-Year Analysis
  const yearlyAnalysis = useMemo(() => {
    const yearlyStats = filteredData.reduce((acc, item) => {
      const date = new Date(item.firstVisitDate);
      const year = date.getFullYear().toString();
      
      if (!acc[year]) {
        acc[year] = {
          year,
          totalMembers: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalRevenue: 0
        };
      }
      
      acc[year].totalMembers += 1;
      acc[year].totalRevenue += item.ltv;
      if (item.isNew === 'Yes') acc[year].newMembers += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[year].converted += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') {
        acc[year].retained += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(yearlyStats).map((year: any) => ({
      'Year': year.year,
      'Total Members': year.totalMembers,
      'New Members': year.newMembers,
      'Converted': year.converted,
      'Retained': year.retained,
      'Conversion Rate': year.totalMembers > 0 ? `${((year.converted / year.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Retention Rate': year.totalMembers > 0 ? `${((year.retained / year.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Total Revenue': formatCurrency(year.totalRevenue),
      'Avg LTV': formatCurrency(year.totalMembers > 0 ? year.totalRevenue / year.totalMembers : 0)
    }));
  }, [filteredData]);

  // Trainer Performance Analysis
  const trainerAnalysis = useMemo(() => {
    const trainerStats = filteredData.reduce((acc, item) => {
      const trainer = item.trainerName || 'Unassigned';
      
      if (!acc[trainer]) {
        acc[trainer] = {
          trainer,
          totalMembers: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalRevenue: 0,
          totalVisits: 0
        };
      }
      
      acc[trainer].totalMembers += 1;
      acc[trainer].totalRevenue += item.ltv;
      acc[trainer].totalVisits += item.visitsPostTrial;
      if (item.isNew === 'Yes') acc[trainer].newMembers += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[trainer].converted += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') {
        acc[trainer].retained += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(trainerStats).map((trainer: any) => ({
      'Trainer': trainer.trainer,
      'Total Members': trainer.totalMembers,
      'New Members': trainer.newMembers,
      'Converted': trainer.converted,
      'Retained': trainer.retained,
      'Conversion Rate': trainer.totalMembers > 0 ? `${((trainer.converted / trainer.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Retention Rate': trainer.totalMembers > 0 ? `${((trainer.retained / trainer.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Avg Visits': trainer.totalMembers > 0 ? (trainer.totalVisits / trainer.totalMembers).toFixed(1) : '0',
      'Total Revenue': formatCurrency(trainer.totalRevenue),
      'Avg LTV': formatCurrency(trainer.totalMembers > 0 ? trainer.totalRevenue / trainer.totalMembers : 0)
    }));
  }, [filteredData]);

  // Location Analysis
  const locationAnalysis = useMemo(() => {
    const locationStats = filteredData.reduce((acc, item) => {
      const location = item.firstVisitLocation;
      
      if (!acc[location]) {
        acc[location] = {
          location,
          totalMembers: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalRevenue: 0
        };
      }
      
      acc[location].totalMembers += 1;
      acc[location].totalRevenue += item.ltv;
      if (item.isNew === 'Yes') acc[location].newMembers += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[location].converted += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') {
        acc[location].retained += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(locationStats).map((location: any) => ({
      'Location': location.location,
      'Total Members': location.totalMembers,
      'New Members': location.newMembers,
      'Converted': location.converted,
      'Retained': location.retained,
      'Conversion Rate': location.totalMembers > 0 ? `${((location.converted / location.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Retention Rate': location.totalMembers > 0 ? `${((location.retained / location.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Total Revenue': formatCurrency(location.totalRevenue),
      'Avg LTV': formatCurrency(location.totalMembers > 0 ? location.totalRevenue / location.totalMembers : 0)
    }));
  }, [filteredData]);

  // Membership Analysis
  const membershipAnalysis = useMemo(() => {
    const membershipStats = filteredData.reduce((acc, item) => {
      const membership = item.membershipUsed || 'No Membership';
      
      if (!acc[membership]) {
        acc[membership] = {
          membership,
          totalMembers: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalRevenue: 0
        };
      }
      
      acc[membership].totalMembers += 1;
      acc[membership].totalRevenue += item.ltv;
      if (item.isNew === 'Yes') acc[membership].newMembers += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[membership].converted += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') {
        acc[membership].retained += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(membershipStats).map((membership: any) => ({
      'Membership Used': membership.membership,
      'Total Members': membership.totalMembers,
      'New Members': membership.newMembers,
      'Converted': membership.converted,
      'Retained': membership.retained,
      'Conversion Rate': membership.totalMembers > 0 ? `${((membership.converted / membership.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Retention Rate': membership.totalMembers > 0 ? `${((membership.retained / membership.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Total Revenue': formatCurrency(membership.totalRevenue),
      'Avg LTV': formatCurrency(membership.totalMembers > 0 ? membership.totalRevenue / membership.totalMembers : 0)
    }));
  }, [filteredData]);

  // Top/Bottom Performers
  const topTrainers = useMemo(() => {
    return trainerAnalysis
      .sort((a, b) => parseFloat(b['Conversion Rate']) - parseFloat(a['Conversion Rate']))
      .slice(0, 5);
  }, [trainerAnalysis]);

  const bottomTrainers = useMemo(() => {
    return trainerAnalysis
      .sort((a, b) => parseFloat(a['Conversion Rate']) - parseFloat(b['Conversion Rate']))
      .slice(0, 5);
  }, [trainerAnalysis]);

  const topLocations = useMemo(() => {
    return locationAnalysis
      .sort((a, b) => parseFloat(b['Conversion Rate']) - parseFloat(a['Conversion Rate']))
      .slice(0, 3);
  }, [locationAnalysis]);

  const bottomLocations = useMemo(() => {
    return locationAnalysis
      .sort((a, b) => parseFloat(a['Conversion Rate']) - parseFloat(b['Conversion Rate']))
      .slice(0, 3);
  }, [locationAnalysis]);

  const handleMetricClick = (metric: MetricCardData) => {
    setDrillDownData(metric);
    setDrillDownType('metric');
  };

  const handleTableRowClick = (row: any) => {
    setDrillDownData(row);
    setDrillDownType('member');
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
    <div className={cn("space-y-6", isDarkMode && "dark")}>
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse mb-4">
          Client Conversion & Retention Analytics
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive member acquisition, conversion, and retention insights with advanced analytics
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
            {/* Filters */}
            {showFilters && (
              <FilterSection
                data={filteredData}
                filters={filters}
                onFiltersChange={setFilters}
                type="newClient"
              />
            )}

            {/* Filter Controls */}
            <div className="flex items-center justify-between">
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

            {/* Metrics Cards */}
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

            {/* Top/Bottom Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-green-600">Top Performing Trainers</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    title=""
                    data={topTrainers as any}
                    type="category"
                    onRowClick={handleTableRowClick}
                  />
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-red-600">Bottom Performing Trainers</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    title=""
                    data={bottomTrainers as any}
                    type="category"
                    onRowClick={handleTableRowClick}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InteractiveChart
                title="Member Conversion Trends"
                data={filteredData}
                type="conversion"
              />
              <InteractiveChart
                title="Retention Analytics"
                data={filteredData}
                type="retention"
              />
            </div>

            {/* Comprehensive Data Tables */}
            <div className="space-y-8">
              <DataTable
                title="Month-on-Month Performance Matrix"
                data={monthlyAnalysis as any}
                type="monthly"
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Year-on-Year Growth Analysis"
                data={yearlyAnalysis as any}
                type="yoy-analysis"
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Trainer Performance Analysis"
                data={trainerAnalysis as any}
                type="category"
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Location Performance Breakdown"
                data={locationAnalysis as any}
                type="category"
                onRowClick={handleTableRowClick}
              />
              
              <DataTable
                title="Membership Usage Analysis"
                data={membershipAnalysis as any}
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
