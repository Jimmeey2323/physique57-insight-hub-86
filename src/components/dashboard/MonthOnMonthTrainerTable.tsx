
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { TrainerMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface MonthOnMonthTrainerTableProps {
  data: Record<string, Record<string, number>>;
  months: string[];
  trainers: string[];
  defaultMetric: TrainerMetricType;
}

export const MonthOnMonthTrainerTable = ({ 
  data, 
  months, 
  trainers, 
  defaultMetric 
}: MonthOnMonthTrainerTableProps) => {
  const formatValue = (value: number, metric: TrainerMetricType) => {
    switch (metric) {
      case 'totalPaid':
        return formatCurrency(value);
      case 'retention':
      case 'conversion':
        return `${value.toFixed(1)}%`;
      case 'classAverage':
        return value.toFixed(1);
      default:
        return formatNumber(value);
    }
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getMetricTitle = (metric: TrainerMetricType) => {
    switch (metric) {
      case 'totalSessions':
        return 'Total Sessions';
      case 'totalCustomers':
        return 'Total Students';
      case 'totalPaid':
        return 'Total Revenue';
      case 'classAverage':
        return 'Class Average';
      case 'retention':
        return 'Retention Rate';
      case 'conversion':
        return 'Conversion Rate';
      default:
        return 'Metric';
    }
  };

  if (!trainers.length || !months.length) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6">
          <p className="text-center text-slate-600">No data available for month-on-month comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Month-on-Month {getMetricTitle(defaultMetric)} Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-slate-700">Trainer</TableHead>
                {months.map((month) => (
                  <TableHead key={month} className="text-center font-bold text-slate-700">
                    {month}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold text-slate-700">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer) => {
                const trainerData = data[trainer] || {};
                const values = months.map(month => trainerData[month] || 0);
                const lastValue = values[values.length - 1];
                const secondLastValue = values[values.length - 2] || 0;
                const change = getChangePercentage(lastValue, secondLastValue);
                
                return (
                  <TableRow key={trainer}>
                    <TableCell className="font-medium text-slate-800">
                      {trainer}
                    </TableCell>
                    {months.map((month) => (
                      <TableCell key={month} className="text-center">
                        {formatValue(trainerData[month] || 0, defaultMetric)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <Badge
                        variant={change >= 0 ? "default" : "destructive"}
                        className={`flex items-center gap-1 ${
                          change >= 0 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(change).toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
