
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

  const filteredData = useMemo(() => {
    if (!rawData) return [];
    
    let filtered = rawData;
    
    // Apply location filter
    if (activeLocation !== 'all') {
      const activeLocationName = LOCATION_MAPPING.find(loc => loc.id === activeLocation)?.fullName;
      if (activeLocationName) {
        filtered = filtered.filter(item => item.location === activeLocationName);
      }
    }
    
    // Apply additional filters
    if (filters.location) {
      filtered = filtered.filter(item => item.location === filters.location);
    }
    if (filters.trainer) {
      filtered = filtered.filter(item => item.teacherName === filters.trainer);
    }
    if (filters.month) {
      filtered = filtered.filter(item => item.monthYear === filters.month);
    }
    
    return filtered;
  }, [rawData, activeLocation, filters]);

  const processedData = useMemo(() => {
    if (!filteredData.length) return null;

    const totalSessions = filteredData.reduce((sum, item) => sum + item.totalSessions, 0);
    const totalCustomers = filteredData.reduce((sum, item) => sum + item.totalCustomers, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.totalPaid, 0);
    const totalEmptySessions = filteredData.reduce((sum, item) => sum + item.totalEmptySessions, 0);
    const totalNonEmptySessions = filteredData.reduce((sum, item) => sum + item.totalNonEmptySessions, 0);
    const avgClassSize = totalNonEmptySessions > 0 ? totalCustomers / totalNonEmptySessions : 0;
    
    const avgRetention = filteredData.length > 0 ? 
      filteredData.reduce((sum, item) => sum + parseFloat(item.retention.replace('%', '') || '0'), 0) / filteredData.length : 0;
    const avgConversion = filteredData.length > 0 ? 
      filteredData.reduce((sum, item) => sum + parseFloat(item.conversion.replace('%', '') || '0'), 0) / filteredData.length : 0;

    const totalNewMembers = filteredData.reduce((sum, item) => sum + item.new, 0);
    const totalRetained = filteredData.reduce((sum, item) => sum + item.retained, 0);
    const totalConverted = filteredData.reduce((sum, item) => sum + item.converted, 0);

    // Top performer by revenue
    const topPerformer = filteredData.reduce((max, item) => 
      item.totalPaid > max.totalPaid ? item : max, filteredData[0]
    );

    // Most popular trainer by customers
    const mostPopular = filteredData.reduce((max, item) => 
      item.totalCustomers > max.totalCustomers ? item : max, filteredData[0]
    );

    return {
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
  }, [filteredData]);

  const getMetricCards = () => {
    if (!processedData) return [];

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
    const months = Array.from(new Set(filteredData.map(item => item.monthYear))).sort().reverse();
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
            data[trainer][month] = trainerData?.classAverageExclEmpty || 0;
            break;
          case 'retention':
            data[trainer][month] = parseFloat(trainerData?.retention.replace('%', '') || '0');
            break;
          case 'conversion':
            data[trainer][month] = parseFloat(trainerData?.conversion.replace('%', '') || '0');
            break;
          case 'emptySessions':
            data[trainer][month] = trainerData?.totalEmptySessions || 0;
            break;
          case 'newMembers':
            data[trainer][month] = trainerData?.new || 0;
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
      totalValue: trainer.totalPaid,
      unitsSold: trainer.totalSessions,
      transactions: trainer.totalSessions,
      uniqueMembers: trainer.totalCustomers,
      atv: trainer.totalPaid / Math.max(trainer.totalSessions, 1),
      auv: trainer.totalPaid / Math.max(trainer.totalSessions, 1),
      asv: trainer.totalPaid / Math.max(trainer.totalCustomers, 1),
      upt: trainer.totalSessions
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
          <p className="text-red-600">Error loading trainer performance data</p>
        </div>
      </div>
    );
  }

  const metricCards = getMetricCards();
  const { data: monthOnMonthData, months, trainers } = getMonthOnMonthData();
  const topBottomData = getTopBottomTrainers();

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
            <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 p-2 rounded-2xl shadow-lg border border-slate-200/30">
              {LOCATION_MAPPING.map((location) => (
                <TabsTrigger 
                  key={location.id} 
                  value={location.id}
                  className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
                >
                  <div className="text-center">
                    <div className="font-bold">{location.name}</div>
                    <div className="text-xs opacity-80">{location.subName}</div>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <MetricCard
            key={card.title}
            data={card}
            delay={index * 200}
          />
        ))}
      </div>

      {/* Top/Bottom Performers */}
      <TopBottomSellers
        data={topBottomData}
        type="trainers"
        title="Trainer Performance"
      />

      {/* Month-on-Month Analysis */}
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

      {/* Year-on-Year Comparison */}
      <YearOnYearTrainerTable
        data={monthOnMonthData}
        months={months}
        trainers={trainers}
        defaultMetric={activeMetric}
      />
    </div>
  );
};
