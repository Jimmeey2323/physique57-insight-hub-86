
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Settings, Download, RefreshCw } from 'lucide-react';
import { LeadsData, LeadsMetricType } from '@/types/leads';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface LeadPivotTableProps {
  data: LeadsData[];
}

export const LeadPivotTable: React.FC<LeadPivotTableProps> = ({ data }) => {
  const [rowDimension, setRowDimension] = useState<'source' | 'stage' | 'associate' | 'center'>('source');
  const [columnDimension, setColumnDimension] = useState<'month' | 'stage' | 'source' | 'status'>('month');
  const [metric, setMetric] = useState<LeadsMetricType>('totalLeads');
  const [viewType, setViewType] = useState<'values' | 'percentages'>('values');

  const pivotData = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    const columnTotals: Record<string, number> = {};
    const rowTotals: Record<string, number> = {};
    let grandTotal = 0;

    data.forEach(item => {
      let rowKey: string;
      let colKey: string;

      // Determine row key
      switch (rowDimension) {
        case 'source':
          rowKey = item.source || 'Unknown';
          break;
        case 'stage':
          rowKey = item.stage || 'Unknown';
          break;
        case 'associate':
          rowKey = item.associate || 'Unknown';
          break;
        case 'center':
          rowKey = item.center || 'Unknown';
          break;
        default:
          rowKey = 'Unknown';
      }

      // Determine column key
      switch (columnDimension) {
        case 'month':
          if (item.createdAt) {
            const date = new Date(item.createdAt);
            colKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          } else {
            colKey = 'No Date';
          }
          break;
        case 'stage':
          colKey = item.stage || 'Unknown';
          break;
        case 'source':
          colKey = item.source || 'Unknown';
          break;
        case 'status':
          colKey = item.status || 'Unknown';
          break;
        default:
          colKey = 'Unknown';
      }

      // Initialize nested objects
      if (!result[rowKey]) result[rowKey] = {};
      if (!result[rowKey][colKey]) result[rowKey][colKey] = 0;

      // Calculate metric value
      let value = 0;
      switch (metric) {
        case 'totalLeads':
          value = 1;
          break;
        case 'leadToTrialConversion':
          value = item.stage === 'Trial Completed' ? 100 : 0;
          break;
        case 'trialToMembershipConversion':
          value = item.conversionStatus === 'Converted' && item.stage === 'Trial Completed' ? 100 : 0;
          break;
        case 'ltv':
          value = item.ltv || 0;
          break;
      }

      result[rowKey][colKey] += value;
      
      // Track totals
      if (!columnTotals[colKey]) columnTotals[colKey] = 0;
      if (!rowTotals[rowKey]) rowTotals[rowKey] = 0;
      columnTotals[colKey] += value;
      rowTotals[rowKey] += value;
      grandTotal += value;
    });

    // Convert to percentages if needed
    if (viewType === 'percentages' && grandTotal > 0) {
      Object.keys(result).forEach(rowKey => {
        Object.keys(result[rowKey]).forEach(colKey => {
          result[rowKey][colKey] = (result[rowKey][colKey] / grandTotal) * 100;
        });
      });
      
      Object.keys(columnTotals).forEach(colKey => {
        columnTotals[colKey] = (columnTotals[colKey] / grandTotal) * 100;
      });
      
      Object.keys(rowTotals).forEach(rowKey => {
        rowTotals[rowKey] = (rowTotals[rowKey] / grandTotal) * 100;
      });
      
      grandTotal = 100;
    }

    return { result, columnTotals, rowTotals, grandTotal };
  }, [data, rowDimension, columnDimension, metric, viewType]);

  const formatValue = (value: number) => {
    if (viewType === 'percentages') return `${value.toFixed(1)}%`;
    if (metric === 'ltv') return formatCurrency(value);
    if (metric.includes('Conversion') && viewType === 'values') return `${value.toFixed(1)}%`;
    return formatNumber(value);
  };

  const columns = Object.keys(pivotData.columnTotals).sort();
  const rows = Object.keys(pivotData.result).sort();

  const dimensionOptions = [
    { value: 'source', label: 'Source' },
    { value: 'stage', label: 'Stage' },
    { value: 'associate', label: 'Associate' },
    { value: 'center', label: 'Center' },
    { value: 'month', label: 'Month' },
    { value: 'status', label: 'Status' }
  ];

  const metricOptions = [
    { value: 'totalLeads', label: 'Total Leads' },
    { value: 'leadToTrialConversion', label: 'Lead to Trial %' },
    { value: 'trialToMembershipConversion', label: 'Trial to Member %' },
    { value: 'ltv', label: 'Average LTV' }
  ];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Lead Performance Pivot Table
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Rows</label>
            <Select value={rowDimension} onValueChange={(value) => setRowDimension(value as any)}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dimensionOptions.filter(opt => opt.value !== columnDimension).map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Columns</label>
            <Select value={columnDimension} onValueChange={(value) => setColumnDimension(value as any)}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dimensionOptions.filter(opt => opt.value !== rowDimension).map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Metric</label>
            <Select value={metric} onValueChange={(value) => setMetric(value as LeadsMetricType)}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">View</label>
            <Tabs value={viewType} onValueChange={(value) => setViewType(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="values" className="text-xs">Values</TabsTrigger>
                <TabsTrigger value="percentages" className="text-xs">%</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 h-[25px]">
                <TableHead className="sticky left-0 bg-gradient-to-r from-blue-50 to-purple-50 z-20 min-w-[200px] w-[200px] font-bold text-gray-700 text-xs p-2">
                  {rowDimension.charAt(0).toUpperCase() + rowDimension.slice(1)}
                </TableHead>
                {columns.map(col => (
                  <TableHead key={col} className="text-center font-bold text-gray-700 min-w-[80px] text-xs p-2">
                    {col}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold text-gray-700 min-w-[80px] bg-slate-200 text-xs p-2">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row} className="hover:bg-blue-50/50 h-[25px]">
                  <TableCell className="font-medium text-gray-800 sticky left-0 bg-white z-10 border-r min-w-[200px] w-[200px] text-xs p-2 truncate">
                    {row}
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={col} className="text-center font-mono text-xs p-2">
                      {formatValue(pivotData.result[row]?.[col] || 0)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-blue-700 bg-slate-50 text-xs p-2">
                    {formatValue(pivotData.rowTotals[row] || 0)}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Totals Row */}
              <TableRow className="bg-gradient-to-r from-slate-100 to-slate-200 font-bold border-t-2 h-[25px]">
                <TableCell className="sticky left-0 bg-gradient-to-r from-slate-100 to-slate-200 z-10 text-xs p-2">
                  TOTAL
                </TableCell>
                {columns.map(col => (
                  <TableCell key={col} className="text-center font-bold text-blue-700 text-xs p-2">
                    {formatValue(pivotData.columnTotals[col] || 0)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-blue-800 bg-slate-200 text-xs p-2">
                  {formatValue(pivotData.grandTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
