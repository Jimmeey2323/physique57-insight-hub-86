
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Target, TrendingUp, MapPin, Building2 } from 'lucide-react';
import { useSessionsData, SessionData } from '@/hooks/useSessionsData';
import { SessionsAttendanceAnalytics } from './SessionsAttendanceAnalytics';
import { SessionsMetricCards } from './SessionsMetricCards';
import { SessionsGroupedTable } from './SessionsGroupedTable';
import { ClassFormatAnalysis } from './ClassFormatAnalysis';
import { SessionsTopBottomLists } from './SessionsTopBottomLists';
import { ImprovedSessionsTopBottomLists } from './ImprovedSessionsTopBottomLists';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { formatNumber } from '@/utils/formatters';

const locations = [
  { 
    id: 'all', 
    name: 'All Locations', 
    fullName: 'All Studio Locations',
    icon: <Building2 className="w-4 h-4" />,
    gradient: 'from-blue-500 to-indigo-600'
  },
  { 
    id: 'location1', 
    name: 'Location 1', 
    fullName: 'Studio Location 1',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-600'
  },
  { 
    id: 'location2', 
    name: 'Location 2', 
    fullName: 'Studio Location 2',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-purple-500 to-violet-600'
  },
  { 
    id: 'location3', 
    name: 'Location 3', 
    fullName: 'Studio Location 3',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-orange-500 to-red-600'
  }
];

export const SessionsSection: React.FC = () => {
  const { data, loading, error, refetch } = useSessionsData();
  const [activeLocation, setActiveLocation] = useState('all');

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = data.filter(session => {
      const className = session.cleanedClass || '';
      const excludeKeywords = ['Hosted', 'P57', 'X'];
      
      const hasExcludedKeyword = excludeKeywords.some(keyword => 
        className.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return !hasExcludedKeyword && (session.checkedInCount >= 2);
    });

    if (activeLocation !== 'all') {
      filtered = filtered.filter(session => session.location === activeLocation);
    }

    return filtered;
  }, [data, activeLocation]);

  if (loading) {
    return <RefinedLoader />;
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

  return (
    <div className="space-y-8">
      {/* Header Section - matching other sections */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sessions Dashboard</h1>
            <p className="text-gray-600">Analyze class attendance patterns and optimize schedules</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(filteredData.length)}</div>
              <div className="text-sm text-gray-500">Total Sessions</div>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredData.reduce((sum, session) => sum + (session.checkedInCount || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Attendance</div>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredData.length > 0 ? 
                  Math.round(filteredData.reduce((sum, session) => sum + (session.fillPercentage || 0), 0) / filteredData.length) : 0}%
              </div>
              <div className="text-sm text-gray-500">Avg Fill Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Tabs */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg h-auto gap-1">
              {locations.map((location) => (
                <TabsTrigger
                  key={location.id}
                  value={location.id}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200"
                >
                  {location.icon}
                  <div className="text-left">
                    <div className="font-semibold">{location.name}</div>
                    <div className="text-xs opacity-75">{location.fullName}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            {locations.map((location) => (
              <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
                <SessionsMetricCards data={filteredData} />
                
                {/* Top and Bottom Lists Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ImprovedSessionsTopBottomLists 
                    data={filteredData} 
                    title="Top Performing Classes"
                    type="classes"
                    variant="top"
                    initialCount={10}
                  />
                  <ImprovedSessionsTopBottomLists 
                    data={filteredData} 
                    title="Bottom Performing Classes"
                    type="classes"
                    variant="bottom"
                    initialCount={10}
                  />
                </div>
                
                <SessionsAttendanceAnalytics data={filteredData} />
                <ClassFormatAnalysis data={filteredData} />
                <SessionsGroupedTable data={filteredData} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
