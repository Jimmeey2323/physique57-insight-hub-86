
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PayrollData, SessionData, SalesData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface PowerCycleVsBarreChartsProps {
  payrollData: PayrollData[];
  sessionsData: SessionData[];
  salesData: SalesData[];
}

export const PowerCycleVsBarreCharts: React.FC<PowerCycleVsBarreChartsProps> = ({
  payrollData,
  sessionsData,
  salesData
}) => {
  // Revenue Comparison Data
  const revenueComparisonData = payrollData.reduce((acc, trainer) => {
    const month = trainer.monthYear || 'Unknown';
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      existing.PowerCycle += trainer.cyclePaid;
      existing.Barre += trainer.barrePaid;
    } else {
      acc.push({
        month,
        PowerCycle: trainer.cyclePaid,
        Barre: trainer.barrePaid
      });
    }
    
    return acc;
  }, [] as any[]).slice(0, 6);

  // Session Volume Data
  const sessionVolumeData = payrollData.reduce((acc, trainer) => {
    const month = trainer.monthYear || 'Unknown';
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      existing.PowerCycleSessions += trainer.cycleSessions;
      existing.BarreSessions += trainer.barreSessions;
    } else {
      acc.push({
        month,
        PowerCycleSessions: trainer.cycleSessions,
        BarreSessions: trainer.barreSessions
      });
    }
    
    return acc;
  }, [] as any[]).slice(0, 6);

  // Class Performance Data
  const classPerformanceData = [
    {
      name: 'PowerCycle',
      fillRate: sessionsData
        .filter(s => s.cleanedClass?.toLowerCase().includes('cycle'))
        .reduce((sum, s, _, arr) => sum + (s.fillPercentage || 0), 0) / 
        Math.max(sessionsData.filter(s => s.cleanedClass?.toLowerCase().includes('cycle')).length, 1),
      avgAttendance: sessionsData
        .filter(s => s.cleanedClass?.toLowerCase().includes('cycle'))
        .reduce((sum, s, _, arr) => sum + (s.checkedInCount || 0), 0) / 
        Math.max(sessionsData.filter(s => s.cleanedClass?.toLowerCase().includes('cycle')).length, 1)
    },
    {
      name: 'Barre',
      fillRate: sessionsData
        .filter(s => s.cleanedClass?.toLowerCase().includes('barre'))
        .reduce((sum, s, _, arr) => sum + (s.fillPercentage || 0), 0) / 
        Math.max(sessionsData.filter(s => s.cleanedClass?.toLowerCase().includes('barre')).length, 1),
      avgAttendance: sessionsData
        .filter(s => s.cleanedClass?.toLowerCase().includes('barre'))
        .reduce((sum, s, _, arr) => sum + (s.checkedInCount || 0), 0) / 
        Math.max(sessionsData.filter(s => s.cleanedClass?.toLowerCase().includes('barre')).length, 1)
    }
  ];

  // Trainer Distribution Data
  const trainerDistributionData = [
    {
      name: 'PowerCycle Revenue',
      value: payrollData.reduce((sum, trainer) => sum + trainer.cyclePaid, 0),
      color: '#8B5CF6'
    },
    {
      name: 'Barre Revenue',
      value: payrollData.reduce((sum, trainer) => sum + trainer.barrePaid, 0),
      color: '#EC4899'
    }
  ];

  const COLORS = ['#8B5CF6', '#EC4899'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Revenue Comparison Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="PowerCycle" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Barre" 
                stroke="#EC4899" 
                strokeWidth={3}
                dot={{ fill: '#EC4899', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Session Volume Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sessionVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Bar dataKey="PowerCycleSessions" fill="#8B5CF6" name="PowerCycle Sessions" />
              <Bar dataKey="BarreSessions" fill="#EC4899" name="Barre Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Class Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classPerformanceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Bar dataKey="fillRate" fill="#8B5CF6" name="Fill Rate %" />
              <Bar dataKey="avgAttendance" fill="#EC4899" name="Avg Attendance" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Revenue Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trainerDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {trainerDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
