
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { SessionData, SalesData, PayrollData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';

interface PowerCycleVsBarreTablesProps {
  powerCycleData: SessionData[];
  barreData: SessionData[];
  salesData: SalesData[];
  payrollData: PayrollData[];
}

export const PowerCycleVsBarreTables: React.FC<PowerCycleVsBarreTablesProps> = ({
  powerCycleData,
  barreData,
  salesData,
  payrollData
}) => {
  // Aggregate instructor performance by class type
  const instructorPerformance = React.useMemo(() => {
    const performance: Record<string, { instructor: string; powerCycleSessions: number; barreSessions: number; powerCycleAttendance: number; barreAttendance: number; }> = {};
    
    [...powerCycleData, ...barreData].forEach(session => {
      if (!performance[session.instructor]) {
        performance[session.instructor] = {
          instructor: session.instructor,
          powerCycleSessions: 0,
          barreSessions: 0,
          powerCycleAttendance: 0,
          barreAttendance: 0
        };
      }
      
      if (session.cleanedClass?.toLowerCase().includes('power') || session.cleanedClass?.toLowerCase().includes('cycle')) {
        performance[session.instructor].powerCycleSessions++;
        performance[session.instructor].powerCycleAttendance += session.checkedIn;
      } else if (session.cleanedClass?.toLowerCase().includes('barre')) {
        performance[session.instructor].barreSessions++;
        performance[session.instructor].barreAttendance += session.checkedIn;
      }
    });
    
    return Object.values(performance).sort((a, b) => 
      (b.powerCycleAttendance + b.barreAttendance) - (a.powerCycleAttendance + a.barreAttendance)
    );
  }, [powerCycleData, barreData]);

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Instructor Performance by Class Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>
                  <TableHead className="text-center">PowerCycle Sessions</TableHead>
                  <TableHead className="text-center">PowerCycle Attendance</TableHead>
                  <TableHead className="text-center">Barre Sessions</TableHead>
                  <TableHead className="text-center">Barre Attendance</TableHead>
                  <TableHead className="text-center">Total Sessions</TableHead>
                  <TableHead className="text-center">Total Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructorPerformance.slice(0, 10).map((instructor, index) => (
                  <TableRow key={instructor.instructor}>
                    <TableCell className="font-medium">{instructor.instructor}</TableCell>
                    <TableCell className="text-center">{formatNumber(instructor.powerCycleSessions)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{formatNumber(instructor.powerCycleAttendance)}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{formatNumber(instructor.barreSessions)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{formatNumber(instructor.barreAttendance)}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {formatNumber(instructor.powerCycleSessions + instructor.barreSessions)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">
                        {formatNumber(instructor.powerCycleAttendance + instructor.barreAttendance)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
