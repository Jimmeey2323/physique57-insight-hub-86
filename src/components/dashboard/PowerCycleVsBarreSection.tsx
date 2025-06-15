
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Target, TrendingUp, CreditCard } from 'lucide-react';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { PowerCycleVsBarreCharts } from './PowerCycleVsBarreCharts';
import { PowerCycleVsBarreTables } from './PowerCycleVsBarreTables';
import { PowerCycleVsBarreTopBottomLists } from './PowerCycleVsBarreTopBottomLists';
import { FilterSection } from './FilterSection';
import { MetricCard } from './MetricCard';
import { formatNumber } from '@/utils/formatters';
import type { SessionData, SalesData, FilterOptions } from '@/types/dashboard';

const locations = [
  { id: 'all', name: 'All Locations', fullName: 'All Locations' },
  { id: 'location1', name: 'Studio A', fullName: 'Main Studio Location A' },
  { id: 'location2', name: 'Studio B', fullName: 'Premium Studio Location B' },
  { id: 'location3', name: 'Studio C', fullName: 'Boutique Studio Location C' }
];

export const PowerCycleVsBarreSection: React.FC = () => {
  const { data: payrollData, isLoading: payrollLoading, error: payrollError } = usePayrollData();
  const { data: sessionsData, loading: sessionsLoading, error: sessionsError } = useSessionsData();
  const { data: salesData, loading: salesLoading, error: salesError } = useGoogleSheets();
  
  const [activeLocation, setActiveLocation] = useState('all');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  // Transform sessions data to match dashboard types
  const transformedSessionsData: SessionData[] = useMemo(() => {
    if (!sessionsData) return [];
    
    return sessionsData.map(session => ({
      sessionId: session.sessionId,
      date: session.date,
      time: session.time,
      classType: session.classType,
      cleanedClass: session.cleanedClass,
      instructor: session.trainerName, // Map trainerName to instructor
      location: session.location,
      capacity: session.capacity,
      booked: session.bookedCount, // Map bookedCount to booked
      checkedIn: session.checkedInCount, // Map checkedInCount to checkedIn
      checkedInCount: session.checkedInCount,
      sessionCount: 1, // Default session count
      fillPercentage: session.fillPercentage || 0,
      waitlist: 0, // Default waitlist
      noShows: session.bookedCount - session.checkedInCount // Calculate no-shows
    }));
  }, [sessionsData]);

  // Filter data by class type
  const powerCycleData = useMemo(() => {
    return transformedSessionsData.filter(session => 
      session.cleanedClass?.toLowerCase().includes('power') ||
      session.cleanedClass?.toLowerCase().includes('cycle')
    );
  }, [transformedSessionsData]);

  const barreData = useMemo(() => {
    return transformedSessionsData.filter(session => 
      session.cleanedClass?.toLowerCase().includes('barre')
    );
  }, [transformedSessionsData]);

  // Calculate metrics for both class types
  const powerCycleMetrics = useMemo(() => {
    const totalSessions = powerCycleData.length;
    const totalAttendance = powerCycleData.reduce((sum, session) => sum + session.checkedIn, 0);
    const totalCapacity = powerCycleData.reduce((sum, session) => sum + session.capacity, 0);
    const avgFillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
    
    return {
      totalSessions,
      totalAttendance,
      avgFillRate,
      avgSessionSize: totalSessions > 0 ? totalAttendance / totalSessions : 0
    };
  }, [powerCycleData]);

  const barreMetrics = useMemo(() => {
    const totalSessions = barreData.length;
    const totalAttendance = barreData.reduce((sum, session) => sum + session.checkedIn, 0);
    const totalCapacity = barreData.reduce((sum, session) => sum + session.capacity, 0);
    const avgFillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
    
    return {
      totalSessions,
      totalAttendance,
      avgFillRate,
      avgSessionSize: totalSessions > 0 ? totalAttendance / totalSessions : 0
    };
  }, [barreData]);

  const loading = payrollLoading || sessionsLoading || salesLoading;
  const error = payrollError || sessionsError || salesError;

  // Handler function that properly accepts FilterOptions only
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading Analysis Data</p>
              <p className="text-sm text-gray-600">Comparing PowerCycle vs Barre performance...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
        <Card className="p-8 bg-white shadow-lg max-w-md">
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Connection Error</p>
              <p className="text-sm text-gray-600 mt-2">{error?.toString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                <Target className="w-5 h-5" />
                <span className="font-medium">Class Format Comparison</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                PowerCycle vs Barre
              </h1>
              
              <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
                Comprehensive performance analysis between PowerCycle and Barre class formats
              </p>
              
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{formatNumber(powerCycleMetrics.totalSessions)}</div>
                  <div className="text-sm text-purple-200">PowerCycle Sessions</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{formatNumber(barreMetrics.totalSessions)}</div>
                  <div className="text-sm text-purple-200">Barre Sessions</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {Math.round(powerCycleMetrics.avgFillRate)}% vs {Math.round(barreMetrics.avgFillRate)}%
                  </div>
                  <div className="text-sm text-purple-200">Avg Fill Rates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Location Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
          <CardContent className="p-2">
            <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl h-auto gap-2">
                {locations.map((location) => (
                  <TabsTrigger
                    key={location.id}
                    value={location.id}
                    className="rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300"
                  >
                    <div className="text-center">
                      <div className="font-bold">{location.name}</div>
                      <div className="text-xs opacity-75">{location.fullName}</div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              {locations.map((location) => (
                <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
                  {/* Filters Section */}
                  <FilterSection
                    data={salesData || []}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    type="sales"
                  />

                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                      data={{
                        title: "PowerCycle Sessions",
                        value: formatNumber(powerCycleMetrics.totalSessions),
                        change: 0,
                        description: "Total PowerCycle sessions",
                        calculation: "Total count of PowerCycle sessions",
                        icon: "sessions"
                      }}
                    />
                    <MetricCard
                      data={{
                        title: "Barre Sessions",
                        value: formatNumber(barreMetrics.totalSessions),
                        change: 0,
                        description: "Total Barre sessions",
                        calculation: "Total count of Barre sessions",
                        icon: "sessions"
                      }}
                    />
                    <MetricCard
                      data={{
                        title: "PowerCycle Fill Rate",
                        value: `${Math.round(powerCycleMetrics.avgFillRate)}%`,
                        change: 0,
                        description: "Average PowerCycle fill rate",
                        calculation: "Average attendance vs capacity",
                        icon: "percentage"
                      }}
                    />
                    <MetricCard
                      data={{
                        title: "Barre Fill Rate",
                        value: `${Math.round(barreMetrics.avgFillRate)}%`,
                        change: 0,
                        description: "Average Barre fill rate",
                        calculation: "Average attendance vs capacity",
                        icon: "percentage"
                      }}
                    />
                  </div>

                  {/* Second Row of Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                      data={{
                        title: "PowerCycle Attendance",
                        value: formatNumber(powerCycleMetrics.totalAttendance),
                        change: 0,
                        description: "Total PowerCycle attendance",
                        calculation: "Sum of all PowerCycle check-ins",
                        icon: "users"
                      }}
                    />
                    <MetricCard
                      data={{
                        title: "Barre Attendance",
                        value: formatNumber(barreMetrics.totalAttendance),
                        change: 0,
                        description: "Total Barre attendance",
                        calculation: "Sum of all Barre check-ins",
                        icon: "users"
                      }}
                    />
                    <MetricCard
                      data={{
                        title: "PowerCycle Avg Size",
                        value: Math.round(powerCycleMetrics.avgSessionSize).toString(),
                        change: 0,
                        description: "Average PowerCycle session size",
                        calculation: "Average attendees per session",
                        icon: "average"
                      }}
                    />
                    <MetricCard
                      data={{
                        title: "Barre Avg Size",
                        value: Math.round(barreMetrics.avgSessionSize).toString(),
                        change: 0,
                        description: "Average Barre session size",
                        calculation: "Average attendees per session",
                        icon: "average"
                      }}
                    />
                  </div>

                  {/* Charts Section */}
                  <PowerCycleVsBarreCharts 
                    powerCycleData={powerCycleData} 
                    barreData={barreData}
                  />

                  {/* Tables Section */}
                  <PowerCycleVsBarreTables 
                    powerCycleData={powerCycleData} 
                    barreData={barreData}
                    salesData={salesData || []}
                    payrollData={payrollData || []}
                  />

                  {/* Top/Bottom Lists */}
                  <PowerCycleVsBarreTopBottomLists 
                    powerCycleData={powerCycleData} 
                    barreData={barreData}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
