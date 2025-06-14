
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { TrainerMetricType } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface YearOnYearTrainerTableProps {
  data: Record<string, Record<string, number>>;
  months: string[];
  trainers: string[];
  defaultMetric: TrainerMetricType;
}

export const YearOnYearTrainerTable = ({ 
  data, 
  months, 
  trainers, 
  defaultMetric 
}: YearOnYearTrainerTableProps) => {
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

  // Group months by year
  const yearlyData = months.reduce((acc, month) => {
    const year = month.split('-')[0] || month.split(' ')[1] || '2024';
    if (!acc[year]) acc[year] = [];
    acc[year].push(month);
    return acc;
  }, {} as Record<string, string[]>);

  const years = Object.keys(yearlyData).sort();

  if (!trainers.length || years.length < 2) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Year-on-Year {getMetricTitle(defaultMetric)} Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-600">Insufficient data for year-on-year comparison (need at least 2 years)</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Year-on-Year {getMetricTitle(defaultMetric)} Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-slate-700">Trainer</TableHead>
                {years.map((year) => (
                  <TableHead key={year} className="text-center font-bold text-slate-700">
                    {year}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold text-slate-700">YoY Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer) => {
                const trainerData = data[trainer] || {};
                
                // Calculate yearly totals
                const yearlyTotals = years.map(year => {
                  const yearMonths = yearlyData[year];
                  return yearMonths.reduce((sum, month) => sum + (trainerData[month] || 0), 0);
                });
                
                const currentYear = yearlyTotals[yearlyTotals.length - 1];
                const previousYear = yearlyTotals[yearlyTotals.length - 2] || 0;
                const yoyChange = getChangePercentage(currentYear, previousYear);
                
                return (
                  <TableRow key={trainer}>
                    <TableCell className="font-medium text-slate-800">
                      {trainer}
                    </TableCell>
                    {yearlyTotals.map((total, index) => (
                      <TableCell key={years[index]} className="text-center">
                        {formatValue(total, defaultMetric)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <Badge
                        variant={yoyChange >= 0 ? "default" : "destructive"}
                        className={`flex items-center gap-1 ${
                          yoyChange >= 0 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {yoyChange >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(yoyChange).toFixed(1)}%
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
