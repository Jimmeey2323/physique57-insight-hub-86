
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Target, TrendingUp, Calendar } from 'lucide-react';
import { useSessionsData } from '@/hooks/useSessionsData';
import { SessionsFilterSection } from './SessionsFilterSection';
import { SessionsGroupedTable } from './SessionsGroupedTable';
import { SessionsMetricCards } from './SessionsMetricCards';
import { SessionsTopBottomLists } from './SessionsTopBottomLists';
import { SessionsComparisonTool } from './SessionsComparisonTool';
import { SessionsAttendanceAnalytics } from './SessionsAttendanceAnalytics';
import { SessionsTrendsInsights } from './SessionsTrendsInsights';
import { SessionsAnomalyDetection } from './SessionsAnomalyDetection';

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
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-lg">
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
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
        <Card className="p-8 bg-white shadow-lg max-w-md">
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
    <div className="space-y-6 bg-gray-50/30 min-h-screen p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Class Attendance Analytics
        </h2>
        <p className="text-xl text-gray-600">
          Track class performance, attendance patterns, and instructor insights
        </p>
      </div>

      <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-lg shadow-sm border">
          {locations.map((location) => (
            <TabsTrigger
              key={location.id}
              value={location.id}
              className="relative overflow-hidden rounded-md px-6 py-3 font-medium text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-50"
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

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
            <SessionsFilterSection 
              filters={filters}
              setFilters={setFilters}
              options={uniqueOptions}
            />

            <SessionsMetricCards data={filteredData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SessionsTopBottomLists
                data={filteredData}
                title="Top Performing Classes"
                type="classes"
                variant="top"
              />
              
              <SessionsTopBottomLists
                data={filteredData}
                title="Top Performing Trainers"
                type="trainers"
                variant="top"
              />
            </div>

            <SessionsGroupedTable data={filteredData} />

            <SessionsAttendanceAnalytics data={filteredData} />

            <SessionsComparisonTool data={filteredData} />

            <SessionsAnomalyDetection data={filteredData} />

            <SessionsTrendsInsights data={filteredData} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
