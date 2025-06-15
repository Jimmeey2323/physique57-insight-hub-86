
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
    id: 'Studio A', 
    name: 'Studio A', 
    fullName: 'Main Studio Location A',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-600'
  },
  { 
    id: 'Studio B', 
    name: 'Studio B', 
    fullName: 'Premium Studio Location B',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-purple-500 to-violet-600'
  },
  { 
    id: 'Studio C', 
    name: 'Studio C', 
    fullName: 'Boutique Studio Location C',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header Section - matching sales tab style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                <Target className="w-5 h-5" />
                <span className="font-medium">Session Analytics</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                Sessions Dashboard
              </h1>
              
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Analyze class attendance patterns and optimize schedules for maximum performance
              </p>
              
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{formatNumber(filteredData.length)}</div>
                  <div className="text-sm text-blue-200">Total Sessions</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {filteredData.reduce((sum, session) => sum + (session.checkedInCount || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-200">Total Attendance</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {filteredData.length > 0 ? 
                      Math.round(filteredData.reduce((sum, session) => sum + (session.fillPercentage || 0), 0) / filteredData.length) : 0}%
                  </div>
                  <div className="text-sm text-blue-200">Avg Fill Rate</div>
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
                    <div className="flex items-center gap-2">
                      {location.icon}
                      <div className="text-center">
                        <div className="font-bold">{location.name}</div>
                        <div className="text-xs opacity-75">{location.fullName}</div>
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              {locations.map((location) => (
                <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
                  <SessionsMetricCards data={filteredData} />
                  
                  {/* Top and Bottom Lists Side by Side - Above Charts */}
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
    </div>
  );
};
