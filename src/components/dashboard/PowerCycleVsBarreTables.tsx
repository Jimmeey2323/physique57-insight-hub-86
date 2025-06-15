
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PayrollData, SessionData, FilterOptions } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface PowerCycleVsBarreTablesProps {
  payrollData: PayrollData[];
  sessionsData: SessionData[];
  filters: FilterOptions;
  onRowClick: (row: any) => void;
}

export const PowerCycleVsBarreTables: React.FC<PowerCycleVsBarreTablesProps> = ({
  payrollData,
  sessionsData,
  filters,
  onRowClick
}) => {
  // Month-on-Month Comparison
  const monthlyComparison = payrollData.reduce((acc, trainer) => {
    const month = trainer.monthYear || 'Unknown';
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      existing.cycleRevenue += trainer.cyclePaid;
      existing.barreRevenue += trainer.barrePaid;
      existing.cycleSessions += trainer.cycleSessions;
      existing.barreSessions += trainer.barreSessions;
      existing.cycleEmpty += trainer.emptyCycleSessions;
      existing.barreEmpty += trainer.emptyBarreSessions;
    } else {
      acc.push({
        month,
        cycleRevenue: trainer.cyclePaid,
        barreRevenue: trainer.barrePaid,
        cycleSessions: trainer.cycleSessions,
        barreSessions: trainer.barreSessions,
        cycleEmpty: trainer.emptyCycleSessions,
        barreEmpty: trainer.emptyBarreSessions
      });
    }
    
    return acc;
  }, [] as any[]);

  // Trainer Performance Matrix
  const trainerMatrix = payrollData.map(trainer => ({
    ...trainer,
    totalRevenue: trainer.cyclePaid + trainer.barrePaid,
    totalSessions: trainer.cycleSessions + trainer.barreSessions,
    cycleEfficiency: trainer.cycleSessions > 0 ? trainer.cyclePaid / trainer.cycleSessions : 0,
    barreEfficiency: trainer.barreSessions > 0 ? trainer.barrePaid / trainer.barreSessions : 0
  })).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Location Performance
  const locationPerformance = payrollData.reduce((acc, trainer) => {
    const location = trainer.location;
    const existing = acc.find(item => item.location === location);
    
    if (existing) {
      existing.cycleRevenue += trainer.cyclePaid;
      existing.barreRevenue += trainer.barrePaid;
      existing.trainers += 1;
    } else {
      acc.push({
        location,
        cycleRevenue: trainer.cyclePaid,
        barreRevenue: trainer.barrePaid,
        trainers: 1
      });
    }
    
    return acc;
  }, [] as any[]);

  // Class Efficiency Analysis
  const classEfficiency = [
    {
      classType: 'PowerCycle',
      totalSessions: payrollData.reduce((sum, t) => sum + t.cycleSessions, 0),
      emptySessions: payrollData.reduce((sum, t) => sum + t.emptyCycleSessions, 0),
      revenue: payrollData.reduce((sum, t) => sum + t.cyclePaid, 0),
      avgClass: payrollData.length > 0 ? payrollData.reduce((sum, t) => sum + t.classAverageExclEmpty, 0) / payrollData.length : 0
    },
    {
      classType: 'Barre',
      totalSessions: payrollData.reduce((sum, t) => sum + t.barreSessions, 0),
      emptySessions: payrollData.reduce((sum, t) => sum + t.emptyBarreSessions, 0),
      revenue: payrollData.reduce((sum, t) => sum + t.barrePaid, 0),
      avgClass: payrollData.length > 0 ? payrollData.reduce((sum, t) => sum + t.classAverageExclEmpty, 0) / payrollData.length : 0
    }
  ].map(item => ({
    ...item,
    fillRate: item.totalSessions > 0 ? ((item.totalSessions - item.emptySessions) / item.totalSessions) * 100 : 0,
    revenuePerSession: item.totalSessions > 0 ? item.revenue / item.totalSessions : 0
  }));

  return (
    <div className="space-y-8">
      {/* Month-on-Month Comparison */}
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Month-on-Month Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Cycle Revenue</TableHead>
                <TableHead>Barre Revenue</TableHead>
                <TableHead>Cycle Sessions</TableHead>
                <TableHead>Barre Sessions</TableHead>
                <TableHead>Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyComparison.slice(0, 6).map((month, index) => (
                <TableRow key={index} className="cursor-pointer hover:bg-slate-50" onClick={() => onRowClick(month)}>
                  <TableCell className="font-medium">{month.month}</TableCell>
                  <TableCell>{formatCurrency(month.cycleRevenue)}</TableCell>
                  <TableCell>{formatCurrency(month.barreRevenue)}</TableCell>
                  <TableCell>{formatNumber(month.cycleSessions)}</TableCell>
                  <TableCell>{formatNumber(month.barreSessions)}</TableCell>
                  <TableCell>
                    <Badge variant={month.cycleRevenue > month.barreRevenue ? "default" : "secondary"}>
                      {month.cycleRevenue > month.barreRevenue ? 'Cycle' : 'Barre'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trainer Performance Matrix */}
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Trainer Performance Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainer</TableHead>
                <TableHead>Cycle Revenue</TableHead>
                <TableHead>Barre Revenue</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Cycle Efficiency</TableHead>
                <TableHead>Barre Efficiency</TableHead>
                <TableHead>Specialty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainerMatrix.slice(0, 10).map((trainer, index) => (
                <TableRow key={index} className="cursor-pointer hover:bg-slate-50" onClick={() => onRowClick(trainer)}>
                  <TableCell className="font-medium">{trainer.teacherName}</TableCell>
                  <TableCell>{formatCurrency(trainer.cyclePaid)}</TableCell>
                  <TableCell>{formatCurrency(trainer.barrePaid)}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(trainer.totalRevenue)}</TableCell>
                  <TableCell>{formatCurrency(trainer.cycleEfficiency)}</TableCell>
                  <TableCell>{formatCurrency(trainer.barreEfficiency)}</TableCell>
                  <TableCell>
                    <Badge variant={trainer.cyclePaid > trainer.barrePaid ? "default" : "secondary"}>
                      {trainer.cyclePaid > trainer.barrePaid ? 'PowerCycle' : 'Barre'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Location Performance */}
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Location Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>PowerCycle Revenue</TableHead>
                <TableHead>Barre Revenue</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Trainers</TableHead>
                <TableHead>Dominant Class</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationPerformance.map((location, index) => (
                <TableRow key={index} className="cursor-pointer hover:bg-slate-50" onClick={() => onRowClick(location)}>
                  <TableCell className="font-medium">{location.location}</TableCell>
                  <TableCell>{formatCurrency(location.cycleRevenue)}</TableCell>
                  <TableCell>{formatCurrency(location.barreRevenue)}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(location.cycleRevenue + location.barreRevenue)}</TableCell>
                  <TableCell>{location.trainers}</TableCell>
                  <TableCell>
                    <Badge variant={location.cycleRevenue > location.barreRevenue ? "default" : "secondary"}>
                      {location.cycleRevenue > location.barreRevenue ? 'PowerCycle' : 'Barre'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Class Efficiency Analysis */}
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Class Efficiency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Type</TableHead>
                <TableHead>Total Sessions</TableHead>
                <TableHead>Empty Sessions</TableHead>
                <TableHead>Fill Rate</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Revenue/Session</TableHead>
                <TableHead>Avg Class Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classEfficiency.map((efficiency, index) => (
                <TableRow key={index} className="cursor-pointer hover:bg-slate-50" onClick={() => onRowClick(efficiency)}>
                  <TableCell className="font-medium">{efficiency.classType}</TableCell>
                  <TableCell>{formatNumber(efficiency.totalSessions)}</TableCell>
                  <TableCell>{formatNumber(efficiency.emptySessions)}</TableCell>
                  <TableCell>{formatPercentage(efficiency.fillRate / 100)}</TableCell>
                  <TableCell>{formatCurrency(efficiency.revenue)}</TableCell>
                  <TableCell>{formatCurrency(efficiency.revenuePerSession)}</TableCell>
                  <TableCell>{efficiency.avgClass.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
