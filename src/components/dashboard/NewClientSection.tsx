
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Filter, Users, TrendingUp, Target, Heart, Calendar, User, Award, DollarSign } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { FilterSection } from './FilterSection';
import { ThemeSelector } from './ThemeSelector';
import { DrillDownModal } from './DrillDownModal';
import { useNewClientData } from '@/hooks/useNewClientData';
import { NewClientData, NewClientFilterOptions, MetricCardData } from '@/types/dashboard';
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

interface NewClientSectionProps {
  data?: NewClientData[];
}

const locations = [
  { id: 'kwality', name: 'Kwality House', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

const quickFilters = [
  { id: 'all', label: 'All Time', icon: Calendar },
  { id: 'jan2025', label: 'Jan 2025', icon: Calendar },
  { id: 'new', label: 'New Members', icon: User },
  { id: 'converted', label: 'Converted', icon: Target },
  { id: 'retained', label: 'Retained', icon: Heart },
  { id: 'premium', label: 'Premium LTV', icon: Award },
];

export const NewClientSection: React.FC<NewClientSectionProps> = ({ data: externalData }) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'member'>('metric');
  const [activeQuickFilter, setActiveQuickFilter] = useState('jan2025');
  const [monthMetricTab, setMonthMetricTab] = useState('conversion');
  const { data: hookData, isLoading, error } = useNewClientData();
  const data = externalData || hookData || [];
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<NewClientFilterOptions>({
    dateRange: { start: '2025-01-01', end: '2025-01-31' }, // Default to Jan 2025
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

  // Parse date helper
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    // Handle DD/MM/YYYY HH:mm:ss format
    const parts = dateStr.split(' ')[0].split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(dateStr);
  };

  // Filter data by location and other filters
  const applyFilters = (rawData: NewClientData[]) => {
    // First filter by selected location tab
    let locationFiltered = rawData.filter(item => {
      const locationMatch = activeLocation === 'kwality' 
        ? item.firstVisitLocation === 'Kwality House, Kemps Corner'
        : activeLocation === 'supreme'
        ? item.firstVisitLocation === 'Supreme HQ, Bandra'
        : item.firstVisitLocation === 'Kenkere House';
      
      return locationMatch;
    });

    // Apply date filter (default Jan 2025)
    if (activeQuickFilter === 'jan2025' || (filters.dateRange.start && filters.dateRange.end)) {
      locationFiltered = locationFiltered.filter(item => {
        const itemDate = parseDate(item.firstVisitDate);
        const startDate = new Date(filters.dateRange.start || '2025-01-01');
        const endDate = new Date(filters.dateRange.end || '2025-01-31');
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // Apply quick filters
    if (activeQuickFilter === 'new') {
      locationFiltered = locationFiltered.filter(item => 
        item.isNew && item.isNew.toLowerCase().includes('new')
      );
    } else if (activeQuickFilter === 'converted') {
      locationFiltered = locationFiltered.filter(item => 
        item.conversionStatus === 'Converted'
      );
    } else if (activeQuickFilter === 'retained') {
      locationFiltered = locationFiltered.filter(item => 
        item.retentionStatus === 'Retained' || item.retentionStatus === 'Active'
      );
    } else if (activeQuickFilter === 'premium') {
      locationFiltered = locationFiltered.filter(item => item.ltv > 15000);
    }

    return locationFiltered;
  };

  const filteredData = useMemo(() => {
    return applyFilters(data);
  }, [data, activeLocation, filters, activeQuickFilter]);

  // Corrected metrics calculation
  const metrics = useMemo((): MetricCardData[] => {
    const uniqueMembers = new Set(filteredData.map(item => item.memberId)).size;
    
    // Corrected calculations
    const newMembers = filteredData.filter(item => 
      item.isNew && item.isNew.toLowerCase().includes('new')
    ).length;
    
    const convertedMembers = filteredData.filter(item => 
      item.conversionStatus === 'Converted'
    ).length;
    
    const retainedMembers = filteredData.filter(item => 
      item.retentionStatus === 'Retained' || item.retentionStatus === 'Active'
    ).length;

    const conversionRate = filteredData.length > 0 ? (convertedMembers / filteredData.length) * 100 : 0;
    const retentionRate = filteredData.length > 0 ? (retainedMembers / filteredData.length) * 100 : 0;
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.ltv, 0);
    const avgLTV = filteredData.length > 0 ? totalRevenue / filteredData.length : 0;

    return [
      {
        title: 'Total Members',
        value: formatNumber(uniqueMembers),
        change: 12.5,
        description: 'Total unique members in current period',
        calculation: 'Count of unique Member IDs',
        icon: 'members'
      },
      {
        title: 'New Members',
        value: formatNumber(newMembers),
        change: 18.3,
        description: 'Members with "New" in Is New column',
        calculation: 'Count where Is New contains "New"',
        icon: 'members'
      },
      {
        title: 'Converted Members',
        value: formatNumber(convertedMembers),
        change: 25.7,
        description: 'Members with Converted status',
        calculation: 'Count where Conversion Status = "Converted"',
        icon: 'revenue'
      },
      {
        title: 'Retained Members',
        value: formatNumber(retainedMembers),
        change: 8.9,
        description: 'Members with Retained or Active status',
        calculation: 'Count where Retention Status = "Retained" or "Active"',
        icon: 'transactions'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: 15.2,
        description: 'Percentage of members who converted',
        calculation: '(Converted Members / Total Members) × 100',
        icon: 'revenue'
      },
      {
        title: 'Retention Rate',
        value: `${retentionRate.toFixed(1)}%`,
        change: -2.1,
        description: 'Percentage of members retained',
        calculation: '(Retained Members / Total Members) × 100',
        icon: 'revenue'
      },
      {
        title: 'Avg. LTV',
        value: formatCurrency(avgLTV),
        change: 22.1,
        description: 'Average lifetime value per member',
        calculation: 'Total LTV / Total Members',
        icon: 'revenue'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: 31.4,
        description: 'Sum of all lifetime values',
        calculation: 'Sum of LTV across all members',
        icon: 'revenue'
      }
    ];
  }, [filteredData]);

  // Month-wise trainer analysis for pivot table
  const monthlyTrainerAnalysis = useMemo(() => {
    const trainerMonthData: Record<string, Record<string, any>> = {};
    
    filteredData.forEach(item => {
      const trainer = item.trainerName || 'Unassigned';
      const date = parseDate(item.firstVisitDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!trainerMonthData[trainer]) {
        trainerMonthData[trainer] = {};
      }
      
      if (!trainerMonthData[trainer][monthKey]) {
        trainerMonthData[trainer][monthKey] = {
          totalMembers: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalRevenue: 0
        };
      }
      
      trainerMonthData[trainer][monthKey].totalMembers += 1;
      trainerMonthData[trainer][monthKey].totalRevenue += item.ltv;
      
      if (item.isNew && item.isNew.toLowerCase().includes('new')) {
        trainerMonthData[trainer][monthKey].newMembers += 1;
      }
      if (item.conversionStatus === 'Converted') {
        trainerMonthData[trainer][monthKey].converted += 1;
      }
      if (item.retentionStatus === 'Retained' || item.retentionStatus === 'Active') {
        trainerMonthData[trainer][monthKey].retained += 1;
      }
    });

    // Get all months and sort in descending order
    const allMonths = new Set<string>();
    Object.values(trainerMonthData).forEach(trainerData => {
      Object.keys(trainerData).forEach(month => allMonths.add(month));
    });
    
    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    });

    return { trainerMonthData, sortedMonths };
  }, [filteredData]);

  // Top/Bottom trainers (styled like Sales tab)
  const trainerPerformance = useMemo(() => {
    const trainerStats = filteredData.reduce((acc, item) => {
      const trainer = item.trainerName || 'Unassigned';
      
      if (!acc[trainer]) {
        acc[trainer] = {
          name: trainer,
          totalMembers: 0,
          converted: 0,
          retained: 0,
          totalRevenue: 0,
          newMembers: 0
        };
      }
      
      acc[trainer].totalMembers += 1;
      acc[trainer].totalRevenue += item.ltv;
      
      if (item.isNew && item.isNew.toLowerCase().includes('new')) {
        acc[trainer].newMembers += 1;
      }
      if (item.conversionStatus === 'Converted') {
        acc[trainer].converted += 1;
      }
      if (item.retentionStatus === 'Retained' || item.retentionStatus === 'Active') {
        acc[trainer].retained += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(trainerStats).map((trainer: any) => ({
      ...trainer,
      conversionRate: trainer.totalMembers > 0 ? (trainer.converted / trainer.totalMembers) * 100 : 0,
      retentionRate: trainer.totalMembers > 0 ? (trainer.retained / trainer.totalMembers) * 100 : 0,
      avgLTV: trainer.totalMembers > 0 ? trainer.totalRevenue / trainer.totalMembers : 0
    }));
  }, [filteredData]);

  // Render month-wise pivot table
  const renderMonthlyPivotTable = () => {
    const { trainerMonthData, sortedMonths } = monthlyTrainerAnalysis;
    const trainers = Object.keys(trainerMonthData);

    if (trainers.length === 0) {
      return <div className="text-center py-8 text-gray-500">No data available</div>;
    }

    // Calculate totals for each month
    const monthTotals = sortedMonths.reduce((acc, month) => {
      acc[month] = {
        totalMembers: 0,
        newMembers: 0,
        converted: 0,
        retained: 0,
        totalRevenue: 0
      };
      
      trainers.forEach(trainer => {
        const monthData = trainerMonthData[trainer][month];
        if (monthData) {
          acc[month].totalMembers += monthData.totalMembers;
          acc[month].newMembers += monthData.newMembers;
          acc[month].converted += monthData.converted;
          acc[month].retained += monthData.retained;
          acc[month].totalRevenue += monthData.totalRevenue;
        }
      });
      
      return acc;
    }, {} as Record<string, any>);

    const getMetricValue = (trainerData: any, month: string) => {
      const monthData = trainerData[month];
      if (!monthData) return 0;
      
      switch (monthMetricTab) {
        case 'conversion':
          return monthData.totalMembers > 0 ? ((monthData.converted / monthData.totalMembers) * 100).toFixed(1) + '%' : '0%';
        case 'retention':
          return monthData.totalMembers > 0 ? ((monthData.retained / monthData.totalMembers) * 100).toFixed(1) + '%' : '0%';
        case 'revenue':
          return formatCurrency(monthData.totalRevenue);
        case 'members':
        default:
          return monthData.totalMembers.toString();
      }
    };

    return (
      <div className="space-y-4">
        <Tabs value={monthMetricTab} onValueChange={setMonthMetricTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">Total Members</TabsTrigger>
            <TabsTrigger value="conversion">Conversion Rate</TabsTrigger>
            <TabsTrigger value="retention">Retention Rate</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance by Trainer</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="h-[25px]">
                    <TableHead className="font-bold text-left bg-gray-50 border-r-2 border-gray-200 min-w-[120px]">
                      Trainer
                    </TableHead>
                    {sortedMonths.map((month) => (
                      <TableHead key={month} className="text-center font-bold bg-gray-50 min-w-[100px] h-[25px]">
                        {month}
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-bold bg-blue-50 border-l-2 border-blue-200">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainers.map((trainer, index) => {
                    const trainerTotal = Object.values(trainerMonthData[trainer]).reduce((sum: number, monthData: any) => {
                      switch (monthMetricTab) {
                        case 'revenue':
                          return sum + monthData.totalRevenue;
                        case 'members':
                        default:
                          return sum + monthData.totalMembers;
                      }
                    }, 0);

                    return (
                      <TableRow 
                        key={trainer} 
                        className={cn(
                          "h-[25px] hover:bg-gray-50 cursor-pointer",
                          index % 2 === 0 ? "bg-white" : "bg-gray-25"
                        )}
                        onClick={() => handleTableRowClick({ trainer, data: trainerMonthData[trainer] })}
                      >
                        <TableCell className="font-medium border-r-2 border-gray-100 bg-gray-50 h-[25px] py-1">
                          {trainer}
                        </TableCell>
                        {sortedMonths.map((month) => (
                          <TableCell key={month} className="text-center h-[25px] py-1">
                            {getMetricValue(trainerMonthData[trainer], month)}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold bg-blue-50 border-l-2 border-blue-100 h-[25px] py-1">
                          {monthMetricTab === 'revenue' ? formatCurrency(trainerTotal) : trainerTotal}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Totals Row */}
                  <TableRow className="bg-gradient-to-r from-blue-100 to-blue-50 font-bold border-t-2 border-blue-200 h-[25px]">
                    <TableCell className="font-bold bg-blue-200 border-r-2 border-blue-300 h-[25px] py-1">
                      TOTALS
                    </TableCell>
                    {sortedMonths.map((month) => {
                      const monthTotal = monthTotals[month];
                      let value = '0';
                      
                      if (monthTotal) {
                        switch (monthMetricTab) {
                          case 'conversion':
                            value = monthTotal.totalMembers > 0 ? ((monthTotal.converted / monthTotal.totalMembers) * 100).toFixed(1) + '%' : '0%';
                            break;
                          case 'retention':
                            value = monthTotal.totalMembers > 0 ? ((monthTotal.retained / monthTotal.totalMembers) * 100).toFixed(1) + '%' : '0%';
                            break;
                          case 'revenue':
                            value = formatCurrency(monthTotal.totalRevenue);
                            break;
                          case 'members':
                          default:
                            value = monthTotal.totalMembers.toString();
                        }
                      }
                      
                      return (
                        <TableCell key={month} className="text-center font-bold h-[25px] py-1">
                          {value}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-bold bg-blue-200 border-l-2 border-blue-300 h-[25px] py-1">
                      {monthMetricTab === 'revenue' 
                        ? formatCurrency(Object.values(monthTotals).reduce((sum: number, month: any) => sum + month.totalRevenue, 0))
                        : Object.values(monthTotals).reduce((sum: number, month: any) => sum + month.totalMembers, 0)
                      }
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render top/bottom lists (styled like Sales tab)
  const renderTopBottomLists = () => {
    const topTrainers = trainerPerformance
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);
    
    const bottomTrainers = trainerPerformance
      .sort((a, b) => a.conversionRate - b.conversionRate)
      .slice(0, 5);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="bg-gradient-to-br from-green-50 via-white to-green-50 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-100 to-green-50 border-b border-green-200">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="w-5 h-5" />
              Top Performing Trainers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-green-100">
                    <TableHead className="h-[25px] py-1">Rank</TableHead>
                    <TableHead className="h-[25px] py-1">Trainer</TableHead>
                    <TableHead className="h-[25px] py-1">Conv. Rate</TableHead>
                    <TableHead className="h-[25px] py-1">Members</TableHead>
                    <TableHead className="h-[25px] py-1">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topTrainers.map((trainer, index) => (
                    <TableRow 
                      key={trainer.name} 
                      className="h-[25px] hover:bg-green-50 cursor-pointer"
                      onClick={() => handleTableRowClick(trainer)}
                    >
                      <TableCell className="h-[25px] py-1">
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-[25px] py-1 font-medium">{trainer.name}</TableCell>
                      <TableCell className="h-[25px] py-1 font-bold text-green-600">
                        {trainer.conversionRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="h-[25px] py-1">{trainer.totalMembers}</TableCell>
                      <TableCell className="h-[25px] py-1">{formatCurrency(trainer.totalRevenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card className="bg-gradient-to-br from-red-50 via-white to-red-50 border-red-200">
          <CardHeader className="bg-gradient-to-r from-red-100 to-red-50 border-b border-red-200">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Target className="w-5 h-5" />
              Improvement Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-red-100">
                    <TableHead className="h-[25px] py-1">Rank</TableHead>
                    <TableHead className="h-[25px] py-1">Trainer</TableHead>
                    <TableHead className="h-[25px] py-1">Conv. Rate</TableHead>
                    <TableHead className="h-[25px] py-1">Members</TableHead>
                    <TableHead className="h-[25px] py-1">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bottomTrainers.map((trainer, index) => (
                    <TableRow 
                      key={trainer.name} 
                      className="h-[25px] hover:bg-red-50 cursor-pointer"
                      onClick={() => handleTableRowClick(trainer)}
                    >
                      <TableCell className="h-[25px] py-1">
                        <Badge className="bg-red-100 text-red-800 border-red-300">
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-[25px] py-1 font-medium">{trainer.name}</TableCell>
                      <TableCell className="h-[25px] py-1 font-bold text-red-600">
                        {trainer.conversionRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="h-[25px] py-1">{trainer.totalMembers}</TableCell>
                      <TableCell className="h-[25px] py-1">{formatCurrency(trainer.totalRevenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
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

  const handleQuickFilter = (filterId: string) => {
    setActiveQuickFilter(filterId);
    
    // Set specific date ranges for quick filters
    if (filterId === 'jan2025') {
      setFilters(prev => ({
        ...prev,
        dateRange: { start: '2025-01-01', end: '2025-01-31' }
      }));
    } else if (filterId === 'all') {
      setFilters(prev => ({
        ...prev,
        dateRange: { start: '', end: '' }
      }));
    }
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
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse mb-4">
          Client Conversion & Retention Analytics
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive member acquisition, conversion, and retention insights
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
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
                "data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105"
              )}
            >
              <span className="relative z-10 block text-center">
                <div className="font-bold">{location.name}</div>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {quickFilters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <Button
                    key={filter.id}
                    variant={activeQuickFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickFilter(filter.id)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                  </Button>
                );
              })}
            </div>

            {/* Filter Controls */}
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
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredData.length} records for {location.name}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <FilterSection
                data={filteredData}
                filters={filters}
                onFiltersChange={setFilters}
                type="newClient"
              />
            )}

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

            {/* Monthly Pivot Table */}
            <div className="space-y-6">
              {renderMonthlyPivotTable()}
            </div>

            {/* Top/Bottom Performers */}
            {renderTopBottomLists()}

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
