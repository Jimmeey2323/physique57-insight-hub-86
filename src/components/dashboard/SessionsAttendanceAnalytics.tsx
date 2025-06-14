
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SessionData } from '@/hooks/useSessionsData';
import { Calendar, Clock, Users } from 'lucide-react';

interface SessionsAttendanceAnalyticsProps {
  data: SessionData[];
}

export const SessionsAttendanceAnalytics: React.FC<SessionsAttendanceAnalyticsProps> = ({ data }) => {
  const dayOfWeekData = React.useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayStats = days.map(day => {
      const dayData = data.filter(session => session.dayOfWeek === day);
      return {
        day,
        attendance: dayData.reduce((sum, s) => sum + s.checkedInCount, 0),
        sessions: dayData.length
      };
    });
    return dayStats;
  }, [data]);

  const timeSlotData = React.useMemo(() => {
    const timeSlots: Record<string, number> = {};
    data.forEach(session => {
      const hour = session.time ? parseInt(session.time.split(':')[0]) : 0;
      const period = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      timeSlots[period] = (timeSlots[period] || 0) + session.checkedInCount;
    });
    
    return Object.entries(timeSlots).map(([period, attendance]) => ({
      period,
      attendance
    }));
  }, [data]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Attendance by Day of Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayOfWeekData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Attendance by Time Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={timeSlotData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ period, attendance }) => `${period}: ${attendance}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="attendance"
              >
                {timeSlotData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
