
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

type MetricType = 'new' | 'converted' | 'retained' | 'ltv' | 'conversionRate' | 'retentionRate' | 'conversionSpan';

interface YearOnYearData {
  trainer: string;
  currentYear: number;
  previousYear: number;
  growth: number;
  growthPercent: number;
}

interface YearOnYearTrainerTableProps {
  data: Record<string, Record<string, number>>;
  months: string[];
  trainers: string[];
  onRowClick?: (row: string) => void;
  defaultMetric?: MetricType;
}

const METRICS: { type: MetricType; label: string; icon: any }[] = [
  { type: 'new', label: 'New Members', icon: BarChart3 },
  { type: 'converted', label: 'Converted', icon: TrendingUp },
  { type: 'retained', label: 'Retained', icon: Calendar },
  { type: 'ltv', label: 'LTV', icon: TrendingUp },
  { type: 'conversionRate', label: 'Conversion %', icon: BarChart3 },
  { type: 'retentionRate', label: 'Retention %', icon: Calendar },
  { type: 'conversionSpan', label: 'Conversion Span', icon: TrendingUp },
];

export const YearOnYearTrainerTable: React.FC<YearOnYearTrainerTableProps> = ({
  data,
  months,
  trainers,
  defaultMetric = 'new',
  onRowClick,
}) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>(defaultMetric);

  // Process year-on-year data
  const processYearOnYearData = (): YearOnYearData[] => {
    const currentYear = '25'; // 2025
    const previousYear = '24'; // 2024
    
    return trainers.map(trainer => {
      const currentYearTotal = months
        .filter(month => month.includes(currentYear))
        .reduce((sum, month) => sum + (data[trainer]?.[month] || 0), 0);
      
      const previousYearTotal = months
        .filter(month => month.includes(previousYear))
        .reduce((sum, month) => sum + (data[trainer]?.[month] || 0), 0);
      
      const growth = currentYearTotal - previousYearTotal;
      const growthPercent = previousYearTotal > 0 ? (growth / previousYearTotal) * 100 : 0;
      
      return {
        trainer,
        currentYear: currentYearTotal,
        previousYear: previousYearTotal,
        growth,
        growthPercent
      };
    }).sort((a, b) => b.growth - a.growth);
  };

  const yearOnYearData = processYearOnYearData();

  const formatValue = (value: number, metric: MetricType) => {
    if (metric === 'ltv') return formatCurrency(value);
    if (metric === 'conversionRate' || metric === 'retentionRate') return formatPercentage(value);
    if (metric === 'conversionSpan') return `${Math.round(value)} days`;
    return formatNumber(value);
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Year-on-Year Comparison by Trainer
          </CardTitle>
          <Tabs value={activeMetric} onValueChange={(val: MetricType) => setActiveMetric(val)}>
            <TabsList className="bg-gradient-to-r from-slate-100 to-slate-200 p-1 rounded-xl shadow-md">
              {METRICS.map((m) => {
                const IconComponent = m.icon;
                return (
                  <TabsTrigger 
                    key={m.type} 
                    value={m.type} 
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-300",
                      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600",
                      "data-[state=active]:text-white data-[state=active]:shadow-lg",
                      "hover:bg-white/60"
                    )}
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {m.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800">
                <TableHead className="text-white font-bold text-sm">Trainer</TableHead>
                <TableHead className="text-white font-bold text-sm text-right">2024</TableHead>
                <TableHead className="text-white font-bold text-sm text-right">2025</TableHead>
                <TableHead className="text-white font-bold text-sm text-right">Growth</TableHead>
                <TableHead className="text-white font-bold text-sm text-right">Growth %</TableHead>
                <TableHead className="text-white font-bold text-sm text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearOnYearData.map((item, index) => (
                <TableRow
                  key={item.trainer}
                  className={cn(
                    "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer",
                    index % 2 === 0 ? "bg-slate-50/50" : "bg-white"
                  )}
                  onClick={() => onRowClick?.(item.trainer)}
                >
                  <TableCell className="font-semibold text-slate-900 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                        index < 3 ? "bg-gradient-to-r from-yellow-400 to-orange-500" : "bg-gradient-to-r from-slate-400 to-slate-600"
                      )}>
                        {index + 1}
                      </div>
                      {item.trainer}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono py-4">
                    {formatValue(item.previousYear, activeMetric)}
                  </TableCell>
                  <TableCell className="text-right font-mono py-4 font-semibold">
                    {formatValue(item.currentYear, activeMetric)}
                  </TableCell>
                  <TableCell className="text-right font-mono py-4">
                    <span className={cn(
                      "font-bold",
                      item.growth > 0 ? "text-green-600" : item.growth < 0 ? "text-red-600" : "text-slate-600"
                    )}>
                      {item.growth > 0 ? '+' : ''}{formatValue(item.growth, activeMetric)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <Badge variant={item.growthPercent > 0 ? "default" : "destructive"} className="font-bold">
                      {item.growthPercent > 0 ? '+' : ''}{item.growthPercent.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    {item.growthPercent > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    ) : item.growthPercent < 0 ? (
                      <TrendingDown className="w-5 h-5 text-red-600 mx-auto" />
                    ) : (
                      <div className="w-5 h-5 bg-slate-300 rounded-full mx-auto" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Year-on-Year Performance Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Total Growth</p>
              <p className="font-bold text-green-600">
                +{formatValue(yearOnYearData.reduce((sum, item) => sum + item.growth, 0), activeMetric)}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Avg Growth %</p>
              <p className="font-bold text-blue-600">
                {(yearOnYearData.reduce((sum, item) => sum + item.growthPercent, 0) / yearOnYearData.length).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-slate-600">Top Performer</p>
              <p className="font-bold text-purple-600">
                {yearOnYearData[0]?.trainer || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Trainers Growing</p>
              <p className="font-bold text-orange-600">
                {yearOnYearData.filter(item => item.growthPercent > 0).length}/{yearOnYearData.length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
