
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, Target, TrendingUp, CreditCard, MapPin, Building2 } from 'lucide-react';
import { useSessionsData, SessionData } from '@/hooks/useSessionsData';
import { SessionsAttendanceAnalytics } from './SessionsAttendanceAnalytics';
import { SessionsMetricCards } from './SessionsMetricCards';
import { SessionsGroupedTable } from './SessionsGroupedTable';
import { ClassFormatAnalysis } from './ClassFormatAnalysis';
import { SessionsTopBottomLists } from './SessionsTopBottomLists';
import { formatNumber } from '@/utils/formatters';

const locations = [
  { 
    id: 'all', 
    name: 'All Locations', 
    fullName: 'All Locations',
    icon: <Building2 className="w-4 h-4" />,
    gradient: 'from-blue-500 to-indigo-600'
  },
  { 
    id: 'location1', 
    name: 'Studio A', 
    fullName: 'Main Studio Location A',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-600'
  },
  { 
    id: 'location2', 
    name: 'Studio B', 
    fullName: 'Premium Studio Location B',
    icon: <MapPin className="w-4 h-4" />,
    gradient: 'from-purple-500 to-violet-600'
  },
  { 
    id: 'location3', 
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
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-lg">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Loading Sessions Data</p>
              <p className="text-sm text-gray-600">Analyzing class attendance patterns...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-30">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
            <g fill="none" fillRule="evenodd">
              <g fill="#ffffff" fillOpacity="0.05">
                <circle cx="60" cy="60" r="30"/>
              </g>
            </g>
          </svg>
        </div>
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                <Target className="w-5 h-5" />
                <span className="font-medium">Class Attendance Analytics</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                Sessions Dashboard
              </h1>
              
              <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
                Optimize class schedules and boost attendance with data-driven insights
              </p>
              
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{formatNumber(filteredData.length)}</div>
                  <div className="text-sm text-purple-200">Total Sessions</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {filteredData.reduce((sum, session) => sum + (session.checkedInCount || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-200">Total Attendance</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {filteredData.length > 0 ? 
                      Math.round(filteredData.reduce((sum, session) => sum + (session.fillPercentage || 0), 0) / filteredData.length) : 0}%
                  </div>
                  <div className="text-sm text-purple-200">Avg Fill Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Location Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
          <CardContent className="p-2">
            <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl h-auto gap-2">
                {locations.map((location) => (
                  <TabsTrigger
                    key={location.id}
                    value={location.id}
                    className={`
                      relative group overflow-hidden rounded-xl px-6 py-4 font-semibold text-sm 
                      transition-all duration-300 ease-out hover:scale-105
                      data-[state=active]:bg-gradient-to-r data-[state=active]:${location.gradient}
                      data-[state=active]:text-white data-[state=active]:shadow-lg
                      data-[state=active]:border-0 hover:bg-white/80
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative z-10">
                        {location.icon}
                      </div>
                      <div className="relative z-10 text-left">
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
                  <SessionsAttendanceAnalytics data={filteredData} />
                  <ClassFormatAnalysis data={filteredData} />
                  <SessionsGroupedTable data={filteredData} />
                  <SessionsTopBottomLists 
                    data={filteredData} 
                    title="Top Performing Classes"
                    type="classes"
                    variant="top"
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
