import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, BarChart3, Calendar, Target, Award, DollarSign, Activity } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { TrainerFilterSection } from './TrainerFilterSection';
import { TopBottomSellers } from './TopBottomSellers';
import { MonthOnMonthTrainerTable } from './MonthOnMonthTrainerTable';
import { YearOnYearTrainerTable } from './YearOnYearTrainerTable';
import { usePayrollData, PayrollData } from '@/hooks/usePayrollData';
import { TrainerMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const LOCATION_MAPPING = [
 { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const TrainerPerformanceSection = () => {
  const { data: rawData, isLoading, error } = usePayrollData();
  const [activeLocation, setActiveLocation] = useState<string>('all');
  const [activeMetric, setActiveMetric] = useState<TrainerMetricType>('totalSessions');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    trainer: '',
    month: ''
  });

  // Add debugging
  console.log('TrainerPerformanceSection - Raw data:', rawData);
  console.log('TrainerPerformanceSection - Raw data length:', rawData?.length);
  console.log('TrainerPerformanceSection - Is loading:', isLoading);
  console.log('TrainerPerformanceSection - Error:', error);

  const filteredData = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      console.log('No raw data available');
      return [];
    }
    
    let filtered = rawData;
    console.log('Starting with data:', filtered.length);
    
    // Apply location filter
    if (activeLocation !== 'all') {
      const activeLocationName = LOCATION_MAPPING.find(loc => loc.id === activeLocation)?.fullName;
      if (activeLocationName) {
        filtered = filtered.filter(item => item.location === activeLocationName);
        console.log('After location filter:', filtered.length);
      }
    }
    
    // Apply additional filters
    if (filters.location) {
      filtered = filtered.filter(item => item.location === filters.location);
      console.log('After additional location filter:', filtered.length);
    }
    if (filters.trainer) {
      filtered = filtered.filter(item => item.teacherName === filters.trainer);
      console.log('After trainer filter:', filtered.length);
    }
    if (filters.month) {
      filtered = filtered.filter(item => item.monthYear === filters.month);
      console.log('After month filter:', filtered.length);
    }
    
    console.log('Final filtered data:', filtered);
    return filtered;
  }, [rawData, activeLocation, filters]);

  const processedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      console.log('No filtered data to process');
      return null;
    }

    console.log('Processing data with items:', filteredData.length);

    const totalSessions = filteredData.reduce((sum, item) => sum + (item.totalSessions || 0), 0);
    const totalCustomers = filteredData.reduce((sum, item) => sum + (item.totalCustomers || 0), 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.totalPaid || 0), 0);
    const totalEmptySessions = filteredData.reduce((sum, item) => sum + (item.totalEmptySessions || 0), 0);
    const totalNonEmptySessions = filteredData.reduce((sum, item) => sum + (item.totalNonEmptySessions || 0), 0);
    const avgClassSize = totalNonEmptySessions > 0 ? totalCustomers / totalNonEmptySessions : 0;
    
    const avgRetention = filteredData.length > 0 ? 
      filteredData.reduce((sum, item) => {
        const retentionValue = typeof item.retention === 'string' 
          ? parseFloat(item.retention.replace('%', '') || '0') 
          : (item.retention || 0);
        return sum + retentionValue;
      }, 0) / filteredData.length : 0;
      
    const avgConversion = filteredData.length > 0 ? 
      filteredData.reduce((sum, item) => {
        const conversionValue = typeof item.conversion === 'string' 
          ? parseFloat(item.conversion.replace('%', '') || '0') 
          : (item.conversion || 0);
        return sum + conversionValue;
      }, 0) / filteredData.length : 0;

    const totalNewMembers = filteredData.reduce((sum, item) => sum + (item.new || 0), 0);
    const totalRetained = filteredData.reduce((sum, item) => sum + (item.retained || 0), 0);
    const totalConverted = filteredData.reduce((sum, item) => sum + (item.converted || 0), 0);

    // Top performer by revenue
    const topPerformer = filteredData.reduce((max, item) => 
      (item.totalPaid || 0) > (max.totalPaid || 0) ? item : max, filteredData[0]
    );

    // Most popular trainer by customers
    const mostPopular = filteredData.reduce((max, item) => 
      (item.totalCustomers || 0) > (max.totalCustomers || 0) ? item : max, filteredData[0]
    );

    const result = {
      totalSessions,
      totalCustomers,
      totalRevenue,
      totalEmptySessions,
      totalNonEmptySessions,
      avgClassSize,
      avgRetention,
      avgConversion,
      totalNewMembers,
      totalRetained,
      totalConverted,
      topPerformer,
      mostPopular,
      trainerCount: new Set(filteredData.map(item => item.teacherName)).size
    };

    console.log('Processed data result:', result);
    return result;
  }, [filteredData]);

  const getMetricCards = () => {
    if (!processedData) {
      console.log('No processed data for metric cards');
      return [];
    }

    return [
      {
        title: 'Total Sessions',
        value: formatNumber(processedData.totalSessions),
        change: 12.5,
        icon: 'sessions' as const,
        description: 'Total classes conducted across all trainers',
        calculation: 'Sum of all cycle and barre sessions'
      },
      {
        title: 'Total Students',
        value: formatNumber(processedData.totalCustomers),
        change: 8.3,
        icon: 'members' as const,
        description: 'Total unique students trained',
        calculation: 'Sum of all cycle and barre customers'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(processedData.totalRevenue),
        change: 15.7,
        icon: 'revenue' as const,
        description: 'Total revenue generated by trainers',
        calculation: 'Sum of all cycle and barre payments'
      },
      {
        title: 'Empty Sessions',
        value: formatNumber(processedData.totalEmptySessions),
        change: -5.2,
        icon: 'sessions' as const,
        description: 'Total classes with no attendees',
        calculation: 'Sum of all empty sessions'
      },
      {
        title: 'Avg Class Size',
        value: processedData.avgClassSize.toFixed(1),
        change: -2.1,
        icon: 'members' as const,
        description: 'Average number of students per non-empty class',
        calculation: 'Total customers / Total non-empty sessions'
      },
      {
        title: 'New Members',
        value: formatNumber(processedData.totalNewMembers),
        change: 18.3,
        icon: 'members' as const,
        description: 'Total new members acquired',
        calculation: 'Sum of new members across trainers'
      },
      {
        title: 'Avg Retention',
        value: `${processedData.avgRetention.toFixed(1)}%`,
        change: 5.2,
        icon: 'members' as const,
        description: 'Average retention rate across trainers',
        calculation: 'Average of individual trainer retention rates'
      },
      {
        title: 'Avg Conversion',
        value: `${processedData.avgConversion.toFixed(1)}%`,
        change: 3.8,
        icon: 'transactions' as const,
        description: 'Average conversion rate across trainers',
        calculation: 'Average of individual trainer conversion rates'
      }
    ];
  };

  const getMonthOnMonthData = () => {
    if (!filteredData.length) return { data: {}, months: [], trainers: [] };

    const data: Record<string, Record<string, number>> = {};
    const months = Array.from(new Set(filteredData.map(item => item.monthYear)))
      .sort((a, b) => {
        // Sort months in descending order (most recent first)
        const parseMonth = (monthStr: string) => {
          const [month, year] = monthStr.split('-');
          const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
          return new Date(parseInt(year), monthIndex);
        };
        
        return parseMonth(b).getTime() - parseMonth(a).getTime();
      });
    const trainers = Array.from(new Set(filteredData.map(item => item.teacherName))).sort();

    trainers.forEach(trainer => {
      data[trainer] = {};
      months.forEach(month => {
        const trainerData = filteredData.find(item => 
          item.teacherName === trainer && item.monthYear === month
        );
        
        switch (activeMetric) {
          case 'totalSessions':
            data[trainer][month] = trainerData?.totalSessions || 0;
            break;
          case 'totalCustomers':
            data[trainer][month] = trainerData?.totalCustomers || 0;
            break;
          case 'totalPaid':
            data[trainer][month] = trainerData?.totalPaid || 0;
            break;
          case 'classAverage':
          case 'classAverageExclEmpty':
            data[trainer][month] = trainerData?.classAverageExclEmpty || 0;
            break;
          case 'classAverageInclEmpty':
            data[trainer][month] = trainerData?.classAverageInclEmpty || 0;
            break;
          case 'retention':
            const retentionValue = typeof trainerData?.retention === 'string' 
              ? parseFloat(trainerData.retention.replace('%', '') || '0') 
              : (trainerData?.retention || 0);
            data[trainer][month] = retentionValue;
            break;
          case 'conversion':
            const conversionValue = typeof trainerData?.conversion === 'string' 
              ? parseFloat(trainerData.conversion.replace('%', '') || '0') 
              : (trainerData?.conversion || 0);
            data[trainer][month] = conversionValue;
            break;
          case 'emptySessions':
            data[trainer][month] = trainerData?.totalEmptySessions || 0;
            break;
          case 'newMembers':
            data[trainer][month] = trainerData?.new || 0;
            break;
          case 'cycleSessions':
            data[trainer][month] = trainerData?.cycleSessions || 0;
            break;
          case 'barreSessions':
            data[trainer][month] = trainerData?.barreSessions || 0;
            break;
          case 'retainedMembers':
            data[trainer][month] = trainerData?.retained || 0;
            break;
          case 'convertedMembers':
            data[trainer][month] = trainerData?.converted || 0;
            break;
          default:
            data[trainer][month] = trainerData?.totalSessions || 0;
        }
      });
    });

    return { data, months, trainers };
  };

  const getTopBottomTrainers = () => {
    if (!filteredData.length) return [];

    return filteredData.map(trainer => ({
      name: trainer.teacherName,
      totalValue: trainer.totalPaid || 0,
      unitsSold: trainer.totalSessions || 0,
      transactions: trainer.totalSessions || 0,
      uniqueMembers: trainer.totalCustomers || 0,
      atv: (trainer.totalPaid || 0) / Math.max(trainer.totalSessions || 1, 1),
      auv: (trainer.totalPaid || 0) / Math.max(trainer.totalSessions || 1, 1),
      asv: (trainer.totalPaid || 0) / Math.max(trainer.totalCustomers || 1, 1),
      upt: trainer.totalSessions || 0
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading trainer performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error loading trainer performance data: {error}</p>
        </div>
      </div>
    );
  }

  if (!rawData || rawData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-600">No trainer performance data available</p>
        </div>
      </div>
    );
  }

  const metricCards = getMetricCards();
  const { data: monthOnMonthData, months, trainers } = getMonthOnMonthData();
  const topBottomData = getTopBottomTrainers();

  console.log('Rendering with metric cards:', metricCards.length);
  console.log('Month on month data:', monthOnMonthData);
  console.log('Top bottom data:', topBottomData.length);

  return (
    <div className="space-y-8">
      {/* Location Tabs */}
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Trainer Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeLocation} onValueChange={setActiveLocation}>
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 p-2 rounded-2xl shadow-lg border border-slate-200/30">
              <TabsTrigger 
                value="all"
                className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
              >
                <div className="text-center">
                  <div className="font-bold">All Locations</div>
                  <div className="text-xs opacity-80">Combined</div>
                </div>
              </TabsTrigger>
              {LOCATION_MAPPING.map((location) => (
                <TabsTrigger 
                  key={location.id} 
                  value={location.id}
                  className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
                >
                  <div className="text-center">
                    <div className="font-bold">{location.name}</div>
                    <div className="text-xs opacity-80">Studio</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <TrainerFilterSection
        data={filteredData}
        onFiltersChange={setFilters}
        isCollapsed={isFilterCollapsed}
        onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
      />

      {/* Debug Info */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800">
            Debug: Raw data: {rawData?.length || 0} records, 
            Filtered data: {filteredData?.length || 0} records, 
            Processed data: {processedData ? 'Available' : 'None'}, 
            Metric cards: {metricCards.length}
          </p>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      {metricCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((card, index) => (
            <MetricCard
              key={card.title}
              data={card}
              delay={index * 200}
            />
          ))}
        </div>
      )}

      {/* Top/Bottom Performers */}
      {topBottomData.length > 0 && (
        <TopBottomSellers
          data={topBottomData}
          type="trainers"
          title="Trainer Performance"
        />
      )}

      {/* Month-on-Month Analysis */}
      {months.length > 0 && trainers.length > 0 && (
        <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Month-on-Month Performance Analysis
              </CardTitle>
              <Tabs value={activeMetric} onValueChange={(value) => setActiveMetric(value as TrainerMetricType)}>
                <TabsList className="bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl shadow-lg grid grid-cols-4 gap-1">
                  {[
                    { key: 'totalSessions' as const, label: 'Sessions', icon: Calendar, color: 'from-blue-500 to-cyan-600' },
                    { key: 'totalCustomers' as const, label: 'Students', icon: Users, color: 'from-green-500 to-emerald-600' },
                    { key: 'totalPaid' as const, label: 'Revenue', icon: DollarSign, color: 'from-purple-500 to-violet-600' },
                    { key: 'retention' as const, label: 'Retention', icon: Award, color: 'from-pink-500 to-rose-600' }
                  ].map((metric) => {
                    const IconComponent = metric.icon;
                    return (
                      <TabsTrigger 
                        key={metric.key} 
                        value={metric.key} 
                        className={cn(
                          "rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300",
                          "data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:shadow-lg",
                          "hover:bg-white/60",
                          `data-[state=active]:${metric.color}`
                        )}
                      >
                        <IconComponent className="w-3 h-3 mr-1" />
                        {metric.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
            <div className="mt-4">
              <Tabs value={activeMetric} onValueChange={(value) => setActiveMetric(value as TrainerMetricType)}>
                <TabsList className="bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl shadow-lg flex flex-wrap gap-1">
                  {[
                    { key: 'conversion' as const, label: 'Conversion', icon: Target },
                    { key: 'emptySessions' as const, label: 'Empty Classes', icon: Calendar },
                    { key: 'newMembers' as const, label: 'New Members', icon: Users },
                    { key: 'classAverageExclEmpty' as const, label: 'Class Avg', icon: BarChart3 },
                    { key: 'cycleSessions' as const, label: 'Cycle Sessions', icon: Activity },
                    { key: 'barreSessions' as const, label: 'Barre Sessions', icon: Activity },
                    { key: 'retainedMembers' as const, label: 'Retained', icon: Award },
                    { key: 'convertedMembers' as const, label: 'Converted', icon: Target }
                  ].map((metric) => {
                    const IconComponent = metric.icon;
                    return (
                      <TabsTrigger 
                        key={metric.key} 
                        value={metric.key} 
                        className="rounded-lg px-2 py-1 text-xs font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/60"
                      >
                        <IconComponent className="w-3 h-3 mr-1" />
                        {metric.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <MonthOnMonthTrainerTable
              data={monthOnMonthData}
              months={months}
              trainers={trainers}
              defaultMetric={activeMetric}
            />
          </CardContent>
        </Card>
      )}

      {/* Year-on-Year Comparison */}
      {months.length > 0 && trainers.length > 0 && (
        <YearOnYearTrainerTable
          data={monthOnMonthData}
          months={months}
          trainers={trainers}
          defaultMetric={activeMetric}
        />
      )}
    </div>
  );
};
