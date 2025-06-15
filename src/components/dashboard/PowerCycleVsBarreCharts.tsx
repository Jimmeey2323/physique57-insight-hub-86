
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { SessionData } from '@/types/dashboard';

interface PowerCycleVsBarreChartsProps {
  powerCycleData: SessionData[];
  barreData: SessionData[];
}

export const PowerCycleVsBarreCharts: React.FC<PowerCycleVsBarreChartsProps> = ({
  powerCycleData,
  barreData
}) => {
  // Aggregate data by month for comparison
  const monthlyData = React.useMemo(() => {
    const months: Record<string, { month: string; powerCycle: number; barre: number; powerCycleFill: number; barreFill: number; }> = {};
    
    [...powerCycleData, ...barreData].forEach(session => {
      const monthKey = session.date.substring(0, 7); // YYYY-MM format
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, powerCycle: 0, barre: 0, powerCycleFill: 0, barreFill: 0 };
      }
      
      if (session.cleanedClass?.toLowerCase().includes('power') || session.cleanedClass?.toLowerCase().includes('cycle')) {
        months[monthKey].powerCycle += session.checkedIn;
        months[monthKey].powerCycleFill += session.fillPercentage || 0;
      } else if (session.cleanedClass?.toLowerCase().includes('barre')) {
        months[monthKey].barre += session.checkedIn;
        months[monthKey].barreFill += session.fillPercentage || 0;
      }
    });
    
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [powerCycleData, barreData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Monthly Attendance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="powerCycle" fill="#8884d8" name="PowerCycle" />
              <Bar dataKey="barre" fill="#82ca9d" name="Barre" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Fill Rate Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="powerCycleFill" stroke="#8884d8" name="PowerCycle Fill %" />
              <Line type="monotone" dataKey="barreFill" stroke="#82ca9d" name="Barre Fill %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
