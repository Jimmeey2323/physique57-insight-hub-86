import React, { useState, useMemo, useEffect } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonthOnMonthTrainerTable } from './MonthOnMonthTrainerTable';
import { TopBottomTrainerList } from './TopBottomTrainerList';

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
  
  console.log('NewClientSection - Raw data:', data);
  console.log('NewClientSection - Data length:', data.length);
  console.log('NewClientSection - First 3 items:', data.slice(0, 3));
  
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
    console.log('ApplyFilters - Raw data length:', rawData.length);
    
    // First filter by selected location tab
    let locationFiltered = rawData.filter(item => {
      const locationMatch = activeLocation === 'kwality' 
        ? item.firstVisitLocation === 'Kwality House, Kemps Corner'
        : activeLocation === 'supreme'
        ? item.firstVisitLocation === 'Supreme HQ, Bandra'
        : item.firstVisitLocation === 'Kenkere House';
      
      return locationMatch;
    });

    console.log('ApplyFilters - Location filtered data length:', locationFiltered.length);
    console.log('ApplyFilters - Active location:', activeLocation);

    // Then apply additional filters
    let filtered = locationFiltered.filter(item => {
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

    console.log('ApplyFilters - Final filtered data length:', filtered.length);
    return filtered;
  };

  const filteredData = useMemo(() => {
    const result = applyFilters(data);
    console.log('Filtered data memoized result:', result.length, 'items');
    return result;
  }, [data, activeLocation, filters]);

  // Handle filter changes with proper type safety
  const handleFiltersChange = (newFilters: NewClientFilterOptions) => {
    setFilters(newFilters);
  };

  // Metrics calculation
  const metrics = useMemo((): MetricCardData[] => {
    console.log('Calculating metrics for', filteredData.length, 'items');
    
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

    console.log('Metrics calculated:', { uniqueMembers, conversionRate, avgLTV, retentionRate });

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
    console.log('Calculating monthly analysis for', filteredData.length, 'items');
    
    const monthlyStats = filteredData.reduce((acc, item) => {
      const date = new Date(item.firstVisitDate);
      if (isNaN(date.getTime())) {
        console.log('Invalid date found:', item.firstVisitDate);
        return acc;
      }
      
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

    const result = Object.values(monthlyStats).map((month: any) => ({
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

    console.log('Monthly analysis result:', result.length, 'months', result);
    return result;
  }, [filteredData]);

  // Trainer Performance Analysis
  const trainerAnalysis = useMemo(() => {
    console.log('Calculating trainer analysis for', filteredData.length, 'items');
    
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

    const result = Object.values(trainerStats).map((trainer: any) => ({
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

    console.log('Trainer analysis result:', result.length, 'trainers', result);
    return result;
  }, [filteredData]);

  // --- Top/bottom logic (e.g., top by converted) ---
  // Only declared ONCE, AFTER allTrainers is defined.
  const trainerTotals = allTrainers.map(trainer => ({
    Trainer: trainer,
    Converted: allMonths.reduce((acc, m) => acc + (groupedData[trainer]?.[m]?.converted ?? 0), 0),
    New: allMonths.reduce((acc, m) => acc + (groupedData[trainer]?.[m]?.new ?? 0), 0),
    Retained: allMonths.reduce((acc, m) => acc + (groupedData[trainer]?.[m]?.retained ?? 0), 0)
  }));
  const topTrainers = [...trainerTotals].sort((a, b) => b.Converted - a.Converted).slice(0, 5);
  const bottomTrainers = [...trainerTotals].sort((a, b) => a.Converted - b.Converted).slice(0, 5);

  // Custom table rendering to avoid DataTable issues
  const renderSimpleTable = (title: string, data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No data available</p>
          </CardContent>
        </Card>
      );
    }

    const columns = Object.keys(data[0]);

    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>{row[column]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const handleMetricClick = (metric: MetricCardData) => {
    setDrillDownData(metric);
    setDrillDownType('metric');
  };

  const handleTableRowClick = (row: any) => {
    setDrillDownData(row);
    setDrillDownType('member');
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

  console.log('Rendering with filtered data length:', filteredData.length);

  // Set default date filter: Jun 2025 to Jan 2025 (descending)
  React.useEffect(() => {
    setFilters(f => ({
      ...f,
      dateRange: { start: '2025-06-01', end: '2025-01-31' }
    }));
  }, []);

  // --- DATA SHAPING FOR NEW METRICS
  // Group data by trainer, month, and calculate correct metrics.
  const getMonthKey = (dateStr: string) => {
    const d = new Date(dateStr);
    // fallback for dd/mm/yyyy or "20/05/2022 ..."
    if (!isNaN(d.getTime())) return d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    const parts = dateStr.split(/[ /:]+/); // try to get DD/MM/YYYY
    if (parts.length >= 3) {
      const month = Number(parts[1]);
      const year = parts[2] ? parts[2].slice(-2) : '??';
      try {
        const dt = new Date(Number(parts[2]), month-1, Number(parts[0]));
        if (!isNaN(dt.getTime())) return dt.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        return `${parts[1]}-${year}`;
      } catch { return 'Unknown'; }
    }
    return 'Unknown';
  };

  function groupMonthsDescending(months: string[]): string[] {
    // Convert to "MMM-YY", sort by newest first using Date objects robustly
    const monthIndex = (str: string) => {
      // e.g. "Jan-25"
      const [m, y] = str.split('-');
      const month = new Date(Date.parse(`${m} 1, 2000`)).getMonth(); // 0-based
      const year = Number('20' + y);
      return new Date(year, month, 1).getTime();
    };
    return [...months].sort((a, b) => monthIndex(b) - monthIndex(a));
  }

  const allMonthsSet = new Set<string>();
  const trainerNamesSet = new Set<string>();

  let groupedData: Record<string, Record<string, any>> = {};

  filteredData.forEach(item => {
    const month = getMonthKey(item.firstVisitDate);
    allMonthsSet.add(month);

    const trainer = item.trainerName || 'Unassigned';
    trainerNamesSet.add(trainer);

    // Metric logic
    const isNew = !!item.isNew && (item.isNew.toLowerCase().includes('new'));
    const isConverted = item.conversionStatus?.toLowerCase() === 'converted';
    const isRetained = item.retentionStatus?.toLowerCase() === 'retained';

    if (!groupedData[trainer]) groupedData[trainer] = {};
    if (!groupedData[trainer][month]) groupedData[trainer][month] = { new: 0, converted: 0, retained: 0, ltv: 0 };

    if (isNew) groupedData[trainer][month].new += 1;
    if (isConverted) groupedData[trainer][month].converted += 1;
    if (isRetained) groupedData[trainer][month].retained += 1;
    groupedData[trainer][month].ltv += Number(item.ltv || 0);
  });

  const allMonths = groupMonthsDescending(Array.from(allMonthsSet));
  const allTrainers = Array.from(trainerNamesSet);

  // Shape data for MonthOnMonthTrainerTable
  function getMetricData(metric: 'new' | 'converted' | 'retained' | 'ltv') {
    const table: Record<string, Record<string, number>> = {};
    allTrainers.forEach(trainer => {
      table[trainer] = {};
      allMonths.forEach(month => {
        table[trainer][month] = groupedData[trainer]?.[month]?.[metric] ?? 0;
      });
    });
    return table;
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
                onFiltersChange={handleFiltersChange}
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
              <div className="text-sm text-gray-600">
                Showing {filteredData.length} records for {location.name}
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trainer</TableHead>
                        <TableHead>Total Members</TableHead>
                        <TableHead>Conversion Rate</TableHead>
                        <TableHead>Retention Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topTrainers.map((trainer, index) => (
                        <TableRow key={index}>
                          <TableCell>{trainer.Trainer}</TableCell>
                          <TableCell>{trainer['Total Members']}</TableCell>
                          <TableCell>{trainer['Conversion Rate']}</TableCell>
                          <TableCell>{trainer['Retention Rate']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-red-600">Bottom Performing Trainers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trainer</TableHead>
                        <TableHead>Total Members</TableHead>
                        <TableHead>Conversion Rate</TableHead>
                        <TableHead>Retention Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bottomTrainers.map((trainer, index) => (
                        <TableRow key={index}>
                          <TableCell>{trainer.Trainer}</TableCell>
                          <TableCell>{trainer['Total Members']}</TableCell>
                          <TableCell>{trainer['Conversion Rate']}</TableCell>
                          <TableCell>{trainer['Retention Rate']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

            {/* Comprehensive Data Tables using simple table rendering */}
            <div className="space-y-8">
              {renderSimpleTable("Month-on-Month Performance Matrix", monthlyAnalysis)}
              {renderSimpleTable("Trainer Performance Analysis", trainerAnalysis)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick filter buttons */}
      <div className="flex flex-row gap-2 mb-4">
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() =>
            setFilters((f) => ({
              ...f,
              dateRange: { start: "2025-06-01", end: "2025-01-31" }
            }))
          }
        >
          Jun 2025 - Jan 2025
        </Button>
        {/* Add more quick presets if wished */}
      </div>

      {/* Month-on-month metric table with tabs */}
      <MonthOnMonthTrainerTable
        data={getMetricData('new')}
        months={allMonths}
        trainers={allTrainers}
        defaultMetric="new"
        onRowClick={(trainer) => setDrillDownData({ type: 'trainer', trainer })}
      />

      {/* Top and bottom trainers lists side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <TopBottomTrainerList
          title="Top 5 Trainers (by Converted Members)"
          trainers={topTrainers.map(t => ({ name: t.Trainer, value: t.Converted }))}
          variant="top"
        />
        <TopBottomTrainerList
          title="Bottom 5 Trainers (by Converted Members)"
          trainers={bottomTrainers.map(t => ({ name: t.Trainer, value: t.Converted }))}
          variant="bottom"
        />
      </div>

      {/* Drilldown modal */}
      <DrillDownModal
        isOpen={!!drillDownData}
        onClose={() => setDrillDownData(null)}
        data={drillDownData}
        type={drillDownType}
      />
    </div>
  );
};

export default NewClientSection;
