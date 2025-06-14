
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Target, TrendingUp, Calendar, Filter, BarChart3 } from 'lucide-react';
import { useSessionsData } from '@/hooks/useSessionsData';
import { SessionsFilterSection } from './SessionsFilterSection';
import { SessionsGroupedTable } from './SessionsGroupedTable';
import { SessionsMetricCards } from './SessionsMetricCards';
import { SessionsTopBottomLists } from './SessionsTopBottomLists';
import { SessionsComparisonTool } from './SessionsComparisonTool';
import { SessionsAttendanceAnalytics } from './SessionsAttendanceAnalytics';
import { SessionsTrendsInsights } from './SessionsTrendsInsights';
import { SessionsAnomalyDetection } from './SessionsAnomalyDetection';
import { SessionsForecasting } from './SessionsForecasting';
import { ClassFormatAnalysis } from './ClassFormatAnalysis';

const locations = [
  { id: 'all', name: 'All Locations', fullName: 'All Locations' },
  { id: 'Kwality House, Kemps Corner', name: 'Kwality House', fullName: 'Kwality House, Kemps Corner' },
  { id: 'Supreme HQ, Bandra', name: 'Supreme HQ', fullName: 'Supreme HQ, Bandra' },
  { id: 'Kenkere House', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const ClassAttendanceSection: React.FC = () => {
  const { data, loading, error, refetch } = useSessionsData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [filters, setFilters] = useState({
    trainers: [] as string[],
    classTypes: [] as string[],
    dayOfWeek: [] as string[],
    timeSlots: [] as string[],
    dateRange: { start: null as Date | null, end: null as Date | null }
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = data;

    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => item.location === activeLocation);
    }

    if (filters.trainers.length > 0) {
      filtered = filtered.filter(item => filters.trainers.includes(item.trainerName));
    }

    if (filters.classTypes.length > 0) {
      filtered = filtered.filter(item => filters.classTypes.includes(item.cleanedClass));
    }

    if (filters.dayOfWeek.length > 0) {
      filtered = filtered.filter(item => filters.dayOfWeek.includes(item.dayOfWeek));
    }

    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        
        if (filters.dateRange.start && itemDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && itemDate > filters.dateRange.end) return false;
        return true;
      });
    }

    return filtered;
  }, [data, activeLocation, filters]);

  const uniqueOptions = useMemo(() => {
    if (!data) return { trainers: [], classTypes: [], daysOfWeek: [], timeSlots: [] };
    
    return {
      trainers: [...new Set(data.map(item => item.trainerName))].filter(Boolean),
      classTypes: [...new Set(data.map(item => item.cleanedClass))].filter(Boolean),
      daysOfWeek: [...new Set(data.map(item => item.dayOfWeek))].filter(Boolean),
      timeSlots: [...new Set(data.map(item => item.time))].filter(Boolean)
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading Class Data</p>
              <p className="text-sm text-gray-600">Fetching session attendance metrics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-2xl border-0 max-w-md">
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Connection Error</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-600">No class attendance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/50">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">Analytics Dashboard</span>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Class Attendance Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive insights into class performance, attendance patterns, and instructor analytics
          </p>
        </div>

        {/* Location Tabs */}
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/50 grid grid-cols-4 w-full max-w-2xl">
              {locations.map((location) => (
                <TabsTrigger
                  key={location.id}
                  value={location.id}
                  className="relative rounded-xl px-6 py-3 font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50"
                >
                  <span className="relative z-10 block text-center">
                    <div className="font-semibold">{location.name.split(',')[0]}</div>
                    {location.name.includes(',') && (
                      <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>
                    )}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {locations.map((location) => (
            <TabsContent key={location.id} value={location.id} className="space-y-8">
              {/* Filters */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <SessionsFilterSection 
                  filters={filters}
                  setFilters={setFilters}
                  options={uniqueOptions}
                />
              </div>

              {/* Metrics Cards */}
              <SessionsMetricCards data={filteredData} />

              {/* Top/Bottom Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                  <SessionsTopBottomLists
                    data={filteredData}
                    title="Top Performing Classes"
                    type="classes"
                    variant="top"
                  />
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                  <SessionsTopBottomLists
                    data={filteredData}
                    title="Top Performing Trainers"
                    type="trainers"
                    variant="top"
                  />
                </div>
              </div>

              {/* Sessions Analysis Table */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <SessionsGroupedTable data={filteredData} />
              </div>

              {/* Class Format Analysis */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <ClassFormatAnalysis data={filteredData} />
              </div>

              {/* Analytics Sections */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <SessionsAttendanceAnalytics data={filteredData} />
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <SessionsForecasting data={filteredData} />
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <SessionsComparisonTool data={filteredData} />
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <SessionsAnomalyDetection data={filteredData} />
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <SessionsTrendsInsights data={filteredData} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
