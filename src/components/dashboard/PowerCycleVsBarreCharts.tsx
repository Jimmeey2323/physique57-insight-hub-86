
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
    const months: Record<string, { 
      month: string; 
      powerCycle: number; 
      barre: number; 
      powerCycleFill: number; 
      barreFill: number;
      powerCycleCapacity: number;
      barreCapacity: number;
      powerCycleCount: number;
      barreCount: number;
    }> = {};
    
    // Process PowerCycle data
    powerCycleData.forEach(session => {
      const monthKey = session.date.substring(0, 7); // YYYY-MM format
      if (!months[monthKey]) {
        months[monthKey] = { 
          month: monthKey, 
          powerCycle: 0, 
          barre: 0, 
          powerCycleFill: 0, 
          barreFill: 0,
          powerCycleCapacity: 0,
          barreCapacity: 0,
          powerCycleCount: 0,
          barreCount: 0
        };
      }
      
      months[monthKey].powerCycle += session.checkedIn;
      months[monthKey].powerCycleCapacity += session.capacity;
      months[monthKey].powerCycleCount += 1;
    });

    // Process Barre data
    barreData.forEach(session => {
      const monthKey = session.date.substring(0, 7); // YYYY-MM format
      if (!months[monthKey]) {
        months[monthKey] = { 
          month: monthKey, 
          powerCycle: 0, 
          barre: 0, 
          powerCycleFill: 0, 
          barreFill: 0,
          powerCycleCapacity: 0,
          barreCapacity: 0,
          powerCycleCount: 0,
          barreCount: 0
        };
      }
      
      months[monthKey].barre += session.checkedIn;
      months[monthKey].barreCapacity += session.capacity;
      months[monthKey].barreCount += 1;
    });

    // Calculate fill percentages
    Object.values(months).forEach(month => {
      month.powerCycleFill = month.powerCycleCapacity > 0 
        ? (month.powerCycle / month.powerCycleCapacity) * 100 
        : 0;
      month.barreFill = month.barreCapacity > 0 
        ? (month.barre / month.barreCapacity) * 100 
        : 0;
    });
    
    const sortedData = Object.values(months).sort((a, b) => b.month.localeCompare(a.month));
    
    console.log('Chart Data:', sortedData);
    
    return sortedData;
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
              <Tooltip 
                formatter={(value, name) => [
                  `${value} attendees`,
                  name === 'powerCycle' ? 'PowerCycle' : 'Barre'
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
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
              <Tooltip 
                formatter={(value, name) => [
                  `${Math.round(Number(value))}%`,
                  name === 'powerCycleFill' ? 'PowerCycle Fill Rate' : 'Barre Fill Rate'
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="powerCycleFill" 
                stroke="#8884d8" 
                name="PowerCycle Fill %" 
                strokeWidth={3}
                dot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="barreFill" 
                stroke="#82ca9d" 
                name="Barre Fill %" 
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
