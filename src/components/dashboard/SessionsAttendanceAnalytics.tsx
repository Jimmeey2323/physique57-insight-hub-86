
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SessionData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';

interface SessionsAttendanceAnalyticsProps {
  data: SessionData[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export const SessionsAttendanceAnalytics: React.FC<SessionsAttendanceAnalyticsProps> = ({ data }) => {
  const attendanceData = useMemo(() => {
    const dailyStats = data.reduce((acc, session) => {
      const date = session.date || new Date().toISOString().split('T')[0];
      const sessionCount = session.sessionCount || session.checkedInCount || 1;
      
      if (!acc[date]) {
        acc[date] = {
          date,
          totalSessions: 0,
          totalAttendance: 0,
          averageFillRate: 0,
          sessionCount: 0
        };
      }
      
      acc[date].totalSessions += sessionCount;
      acc[date].totalAttendance += session.checkedInCount || 0;
      acc[date].sessionCount += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(dailyStats).map((day: any) => ({
      ...day,
      averageFillRate: day.sessionCount > 0 ? 
        data.filter(s => s.date === day.date)
          .reduce((sum, s) => sum + (s.fillPercentage || 0), 0) / day.sessionCount : 0
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const classTypeData = useMemo(() => {
    const typeStats = data.reduce((acc, session) => {
      const type = session.cleanedClass || 'Unknown';
      if (!acc[type]) {
        acc[type] = {
          name: type,
          sessions: 0,
          attendance: 0,
          capacity: 0
        };
      }
      
      acc[type].sessions += 1;
      acc[type].attendance += session.checkedInCount || 0;
      acc[type].capacity += session.capacity || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(typeStats).map((type: any) => ({
      ...type,
      fillRate: type.capacity > 0 ? (type.attendance / type.capacity) * 100 : 0
    })).sort((a, b) => b.attendance - a.attendance);
  }, [data]);

  const timeSlotData = useMemo(() => {
    const timeStats = data.reduce((acc, session) => {
      const time = session.time || '00:00';
      const hour = parseInt(time.split(':')[0]);
      const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      
      if (!acc[timeSlot]) {
        acc[timeSlot] = {
          name: timeSlot,
          sessions: 0,
          attendance: 0,
          capacity: 0
        };
      }
      
      acc[timeSlot].sessions += 1;
      acc[timeSlot].attendance += session.checkedInCount || 0;
      acc[timeSlot].capacity += session.capacity || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(timeStats).map((slot: any) => ({
      ...slot,
      fillRate: slot.capacity > 0 ? (slot.attendance / slot.capacity) * 100 : 0
    }));
  }, [data]);

  const trainerData = useMemo(() => {
    const trainerStats = data.reduce((acc, session) => {
      const trainer = session.trainer || 'Unknown';
      if (!acc[trainer]) {
        acc[trainer] = {
          name: trainer,
          sessions: 0,
          attendance: 0,
          capacity: 0
        };
      }
      
      acc[trainer].sessions += 1;
      acc[trainer].attendance += session.checkedInCount || 0;
      acc[trainer].capacity += session.capacity || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(trainerStats).map((trainer: any) => ({
      ...trainer,
      fillRate: trainer.capacity > 0 ? (trainer.attendance / trainer.capacity) * 100 : 0
    })).sort((a, b) => b.attendance - a.attendance).slice(0, 10);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Attendance Trend */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">Daily Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="totalAttendance" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fill Rate by Class Type */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">Fill Rate by Class Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classTypeData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#666"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="fillRate" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Slot Distribution */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">Attendance by Time Slot</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timeSlotData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="attendance"
                >
                  {timeSlotData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Trainers by Attendance */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">Top Trainers by Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trainerData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#666" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#666" 
                  tick={{ fontSize: 10 }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="attendance" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Attendance Analytics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {formatNumber(data.reduce((sum, session) => sum + (session.checkedInCount || 0), 0))}
              </div>
              <div className="text-sm text-blue-600">Total Attendance</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {data.length > 0 ? 
                  Math.round(data.reduce((sum, session) => sum + (session.fillPercentage || 0), 0) / data.length) : 0}%
              </div>
              <div className="text-sm text-green-600">Average Fill Rate</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{classTypeData.length}</div>
              <div className="text-sm text-purple-600">Class Types</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{trainerData.length}</div>
              <div className="text-sm text-orange-600">Active Trainers</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
