import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Settings, Download, RefreshCw, Filter, Eye, Edit3, Save, X } from 'lucide-react';
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
  const [quickFilter, setQuickFilter] = useState<'all' | 'high' | 'low'>('all');
  const [isEditingInsights, setIsEditingInsights] = useState(false);
  const [insights, setInsights] = useState({
    performance: "Cross-dimensional analysis shows strong Q4 performance across regions",
    trends: "Month-over-month growth consistent with 15% average increase",
    optimization: "Source-to-stage funnel optimization needed for better conversion",
    forecast: "Current trajectory suggests 25% YoY growth by end of fiscal year"
  });

  const pivotData = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    const columnTotals: Record<string, number> = {};
    const rowTotals: Record<string, number> = {};
    let grandTotal = 0;

    data.forEach(item => {
      let rowKey: string;
      let colKey: string;

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

      if (!result[rowKey]) result[rowKey] = {};
      if (!result[rowKey][colKey]) result[rowKey][colKey] = 0;

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
      
      if (!columnTotals[colKey]) columnTotals[colKey] = 0;
      if (!rowTotals[rowKey]) rowTotals[rowKey] = 0;
      columnTotals[colKey] += value;
      rowTotals[rowKey] += value;
      grandTotal += value;
    });

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

  // Filter rows based on quick filter
  const filteredRows = rows.filter(row => {
    const total = pivotData.rowTotals[row] || 0;
    if (quickFilter === 'high') return total > (pivotData.grandTotal / rows.length);
    if (quickFilter === 'low') return total <= (pivotData.grandTotal / rows.length);
    return true;
  });

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

  const quickFilters = [
    { value: 'all', label: 'All Data', count: rows.length },
    { value: 'high', label: 'Above Average', count: filteredRows.length },
    { value: 'low', label: 'Below Average', count: rows.length - filteredRows.length }
  ];

  const handleSaveInsights = () => {
    setIsEditingInsights(false);
    console.log('Insights saved:', insights);
  };

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

        {/* Quick Filter Buttons */}
        <div className="flex gap-2">
          {quickFilters.map(filter => (
            <Button
              key={filter.value}
              variant={quickFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter(filter.value as any)}
              className={`gap-2 text-xs ${
                quickFilter === filter.value 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <Filter className="w-3 h-3" />
              {filter.label}
              <Badge variant="outline" className="ml-1 text-xs">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 z-20">
              <TableRow className="bg-gradient-to-r from-slate-800 via-slate-900 to-black text-white hover:bg-gradient-to-r hover:from-slate-800 hover:to-black">
                <TableHead className="sticky left-0 bg-gradient-to-r from-slate-800 to-slate-900 z-30 min-w-[200px] w-[200px] font-bold text-white text-sm p-4">
                  {rowDimension.charAt(0).toUpperCase() + rowDimension.slice(1)}
                </TableHead>
                {columns.map(col => (
                  <TableHead key={col} className="text-center font-bold text-white min-w-[80px] text-sm p-3">
                    {col}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold text-white min-w-[80px] text-sm p-3">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {filteredRows.map(row => (
                <TableRow key={row} className="hover:bg-blue-50/50 border-b border-gray-200">
                  <TableCell className="font-medium text-gray-800 sticky left-0 bg-white z-10 border-r border-gray-200 min-w-[200px] w-[200px] text-sm p-4">
                    {row}
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={col} className="text-center align-middle font-mono text-sm p-3 text-gray-800">
                      {formatValue(pivotData.result[row]?.[col] || 0)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center align-middle font-bold text-blue-700 text-sm p-3">
                    {formatValue(pivotData.rowTotals[row] || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="sticky bottom-0 z-20">
              <TableRow className="bg-gradient-to-r from-slate-800 via-slate-900 to-black text-white hover:bg-gradient-to-r hover:from-slate-800 hover:to-black">
                <TableCell className="sticky left-0 bg-gradient-to-r from-slate-800 to-slate-900 z-30 text-sm p-4 font-bold text-white">
                  TOTAL
                </TableCell>
                {columns.map(col => (
                  <TableCell key={col} className="text-center align-middle font-bold text-white text-sm p-3">
                    {formatValue(pivotData.columnTotals[col] || 0)}
                  </TableCell>
                ))}
                <TableCell className="text-center align-middle font-bold text-white text-sm p-3">
                  {formatValue(pivotData.grandTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Editable Summary and Insights Section */}
        <div className="bg-muted/30 rounded-lg p-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Pivot Analysis Insights
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => isEditingInsights ? handleSaveInsights() : setIsEditingInsights(true)}
              className="gap-2"
            >
              {isEditingInsights ? (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(insights).map(([key, value], index) => {
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500'];
              return (
                <div key={key} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full ${colors[index]} mt-2 flex-shrink-0`}></div>
                  <div className="flex-1">
                    {isEditingInsights ? (
                      <textarea
                        value={value}
                        onChange={(e) => setInsights(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full text-xs border rounded p-2 resize-none"
                        rows={2}
                      />
                    ) : (
                      <>
                        <p className="text-sm font-medium capitalize">{key}</p>
                        <p className="text-xs text-muted-foreground">{value}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {isEditingInsights && (
            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingInsights(false)}
                className="gap-2 mr-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
