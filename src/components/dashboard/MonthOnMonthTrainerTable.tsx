
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type MetricType = 'new' | 'converted' | 'retained' | 'ltv';

interface MonthOnMonthTrainerTableProps {
  data: Record<string, Record<string, number>>;
  months: string[];
  trainers: string[];
  onRowClick?: (row: string) => void;
  defaultMetric?: MetricType;
}

const METRICS: { type: MetricType; label: string }[] = [
  { type: 'new', label: 'New Members' },
  { type: 'converted', label: 'Converted Members' },
  { type: 'retained', label: 'Retained Members' },
  { type: 'ltv', label: 'LTV' },
];

export const MonthOnMonthTrainerTable: React.FC<MonthOnMonthTrainerTableProps> = ({
  data,
  months,
  trainers,
  defaultMetric = 'new',
  onRowClick,
}) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>(defaultMetric);

  // Helper for column grouping into Year/Q
  const years = Array.from(
    new Set(months.map((m) => m.split('-')[1])) // e.g. 'Jan-25' => '25'
  );

  // Compute totals per month and overall
  const totals: Record<string, number> = {};
  months.forEach((month) => {
    totals[month] = trainers.reduce((acc, trainer) => acc + (data?.[trainer]?.[month] ?? 0), 0);
  });
  const rowTotal = (trainer: string) =>
    months.reduce((acc, month) => acc + (data?.[trainer]?.[month] ?? 0), 0);
  const overallTotal = months.reduce((acc, m) => acc + (totals[m] ?? 0), 0);

  return (
    <Card className="overflow-x-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-lg">Month-on-Month by Trainer</CardTitle>
        <Tabs value={activeMetric} onValueChange={(val: MetricType) => setActiveMetric(val)}>
          <TabsList className="bg-slate-50 rounded px-2 h-9 gap-2">
            {METRICS.map((m) => (
              <TabsTrigger key={m.type} value={m.type} className="h-8 px-3 text-xs">
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="max-w-full" style={{ overflowX: 'auto' }}>
          <Table className="min-w-[900px] border rounded-xl shadow" style={{ borderCollapse: 'separate' }}>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead
                  className="sticky left-0 z-10 bg-gray-100 font-bold text-xs w-48"
                  style={{ minWidth: 175 }}
                >
                  Trainer
                </TableHead>
                {months.map((month) => (
                  <TableHead key={month} className="font-bold text-xs text-right">
                    {month}
                  </TableHead>
                ))}
                <TableHead className="font-bold text-right text-xs bg-gray-100 pr-3">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer) => (
                <TableRow
                  key={trainer}
                  className="hover:bg-blue-50 cursor-pointer"
                  style={{ height: 25 }}
                  onClick={() => onRowClick?.(trainer)}
                >
                  <TableCell className="sticky left-0 bg-gray-100 font-medium text-sm"
                    style={{ minWidth: 175, height: 25 }}
                  >
                    {trainer}
                  </TableCell>
                  {months.map((month) => (
                    <TableCell key={month} className="text-right font-mono" style={{ height: 25 }}>
                      {data?.[trainer]?.[month] ?? 0}
                    </TableCell>
                  ))}
                  <TableCell className="font-bold text-right pr-3" style={{ height: 25 }}>
                    {rowTotal(trainer)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-slate-100 border-t-2 border-slate-300" style={{ height: 25 }}>
                <TableCell className="sticky left-0 bg-slate-200 font-bold" style={{ height: 25 }}>
                  Totals
                </TableCell>
                {months.map((month) => (
                  <TableCell key={month} className="font-bold text-right" style={{ height: 25 }}>
                    {totals[month] ?? 0}
                  </TableCell>
                ))}
                <TableCell className="font-bold text-right pr-3" style={{ height: 25 }}>
                  {overallTotal}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
