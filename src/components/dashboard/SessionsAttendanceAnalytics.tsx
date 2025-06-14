
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { SessionData } from '@/hooks/useSessionsData';
import { Calendar, Clock, Users, TrendingUp, MapPin, Target } from 'lucide-react';

interface SessionsAttendanceAnalyticsProps {
  data: SessionData[];
}

export const SessionsAttendanceAnalytics: React.FC<SessionsAttendanceAnalyticsProps> = ({ data }) => {
  // Filter out unwanted sessions
  const filteredData = React.useMemo(() => {
    return data.filter(session => {
      const className = session.cleanedClass || '';
      const excludeKeywords = ['Hosted', 'P57', 'X'];
      
      const hasExcludedKeyword = excludeKeywords.some(keyword => 
        className.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return !hasExcludedKeyword;
    });
  }, [data]);

  const dayOfWeekData = React.useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayStats = days.map(day => {
      const dayData = filteredData.filter(session => session.dayOfWeek === day);
      const totalAttendance = dayData.reduce((sum, s) => sum + s.checkedInCount, 0);
      const totalCapacity = dayData.reduce((sum, s) => sum + s.capacity, 0);
      const fillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
      
      return {
        day: day.substring(0, 3),
        attendance: totalAttendance,
        sessions: dayData.length,
        avgAttendance: dayData.length > 0 ? totalAttendance / dayData.length : 0,
        fillRate: fillRate
      };
    });
    return dayStats;
  }, [filteredData]);

  const timeSlotData = React.useMemo(() => {
    const timeSlots: Record<string, { attendance: number, sessions: number, revenue: number }> = {};
    filteredData.forEach(session => {
      const time = session.time || 'Unknown';
      if (!timeSlots[time]) {
        timeSlots[time] = { attendance: 0, sessions: 0, revenue: 0 };
      }
      timeSlots[time].attendance += session.checkedInCount;
      timeSlots[time].sessions += 1;
      timeSlots[time].revenue += session.totalPaid;
    });
    
    return Object.entries(timeSlots)
      .map(([time, stats]) => ({
        time,
        attendance: stats.attendance,
        sessions: stats.sessions,
        avgAttendance: stats.sessions > 0 ? stats.attendance / stats.sessions : 0,
        revenue: stats.revenue
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredData]);

  const locationData = React.useMemo(() => {
    const locations: Record<string, { attendance: number, sessions: number, revenue: number }> = {};
    filteredData.forEach(session => {
      const location = session.location || 'Unknown';
      if (!locations[location]) {
        locations[location] = { attendance: 0, sessions: 0, revenue: 0 };
      }
      locations[location].attendance += session.checkedInCount;
      locations[location].sessions += 1;
      locations[location].revenue += session.totalPaid;
    });
    
    return Object.entries(locations).map(([location, stats]) => ({
      location: location.split(',')[0], // Short name
      fullLocation: location,
      attendance: stats.attendance,
      sessions: stats.sessions,
      avgAttendance: stats.sessions > 0 ? stats.attendance / stats.sessions : 0,
      revenue: stats.revenue
    }));
  }, [filteredData]);

  const fillRateData = React.useMemo(() => {
    const ranges = [
      { range: '0-20%', min: 0, max: 20 },
      { range: '21-40%', min: 21, max: 40 },
      { range: '41-60%', min: 41, max: 60 },
      { range: '61-80%', min: 61, max: 80 },
      { range: '81-100%', min: 81, max: 100 }
    ];
    
    return ranges.map(({ range, min, max }) => {
      const sessionsInRange = filteredData.filter(session => {
        const fillRate = session.fillPercentage || 0;
        return fillRate >= min && fillRate <= max;
      });
      
      return {
        range,
        sessions: sessionsInRange.length,
        attendance: sessionsInRange.reduce((sum, s) => sum + s.checkedInCount, 0)
      };
    });
  }, [filteredData]);

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

  const customTooltip = (active: any, payload: any, label: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border-0 backdrop-blur-sm">
          <p className="font-semibold text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 lg:col-span-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            Attendance by Day of Week
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={dayOfWeekData}>
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip content={customTooltip} />
              <Area 
                type="monotone" 
                dataKey="attendance" 
                stroke="#3B82F6" 
                strokeWidth={3}
                fill="url(#attendanceGradient)" 
              />
              <Bar dataKey="sessions" fill="#8B5CF6" opacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            Attendance by Location
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={locationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ location, attendance }) => `${location}: ${attendance}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="attendance"
              >
                {locationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 xl:col-span-2">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            Attendance by Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={timeSlotData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip content={customTooltip} />
              <Bar dataKey="attendance" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgAttendance" fill="#10B981" opacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            Fill Rate Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={fillRateData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                type="category" 
                dataKey="range" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <Tooltip content={customTooltip} />
              <Bar dataKey="sessions" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
