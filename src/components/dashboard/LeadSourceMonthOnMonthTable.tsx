
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { LeadMetricTabs } from './LeadMetricTabs';
import { LeadsMetricType } from '@/types/leads';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface LeadSourceMonthOnMonthTableProps {
  data: Record<string, Record<string, number>>;
  months: string[];
  sources: string[];
  activeMetric: LeadsMetricType;
  onMetricChange: (metric: LeadsMetricType) => void;
}

export const LeadSourceMonthOnMonthTable: React.FC<LeadSourceMonthOnMonthTableProps> = ({
  data,
  months,
  sources,
  activeMetric,
  onMetricChange
}) => {
  const [sortField, setSortField] = useState<string>('source');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [quickFilter, setQuickFilter] = useState<'all' | 'top' | 'bottom'>('all');

  // Convert months to readable format and sort in descending order
  const formattedMonths = months
    .map(month => {
      if (!month || !month.includes('-')) return null;
      const [year, monthNum] = month.split('-');
      if (!year || !monthNum) return null;
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[parseInt(monthNum) - 1];
      if (!monthName) return null;
      
      return {
        original: month,
        formatted: `${monthName} ${year}`,
        sortKey: new Date(parseInt(year), parseInt(monthNum) - 1).getTime()
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.sortKey - a!.sortKey); // Descending order (most recent first)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Calculate totals for filtering
  const sourceWithTotals = sources.map(source => {
    const total = formattedMonths.reduce((sum, month) => {
      return sum + (data[source]?.[month!.original] || 0);
    }, 0);
    return { source, total };
  });

  const filteredSources = sourceWithTotals
    .filter(({ source, total }) => {
      if (quickFilter === 'top') return total > 0;
      if (quickFilter === 'bottom') return total === 0;
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'source') {
        return sortDirection === 'asc' ? a.source.localeCompare(b.source) : b.source.localeCompare(a.source);
      }
      
      // Sort by month data
      const aValue = data[a.source]?.[sortField] || 0;
      const bValue = data[b.source]?.[sortField] || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    })
    .map(({ source }) => source);

  const formatValue = (value: number) => {
    if (activeMetric === 'ltv') return formatCurrency(value);
    if (activeMetric.includes('Conversion')) return `${value.toFixed(1)}%`;
    return formatNumber(value);
  };

  const getChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 0.1) return null;
    
    return (
      <div className={`flex items-center gap-1 text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  // Calculate totals for each month
  const monthlyTotals = formattedMonths.map(month => {
    const total = sources.reduce((sum, source) => {
      return sum + (data[source]?.[month!.original] || 0);
    }, 0);
    return { month: month!.formatted, total };
  });

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const quickFilters = [
    { value: 'all', label: 'All Sources', count: sources.length },
    { value: 'top', label: 'Active Sources', count: sourceWithTotals.filter(s => s.total > 0).length },
    { value: 'bottom', label: 'Inactive Sources', count: sourceWithTotals.filter(s => s.total === 0).length }
  ];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800">Lead Source Performance - Month on Month</CardTitle>
          <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
            {filteredSources.length} Sources
          </Badge>
        </div>
        
        <LeadMetricTabs
          value={activeMetric}
          onValueChange={onMetricChange}
          className="w-full"
        />

        {/* Quick Filter Buttons */}
        <div className="flex gap-2">
          {quickFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={quickFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter(filter.value as any)}
              className={`gap-2 ${
                quickFilter === filter.value 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              {filter.label}
              <Badge variant="outline" className="ml-1">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">
                <TableHead 
                  className="cursor-pointer hover:bg-blue-100 transition-colors font-bold text-gray-700 sticky left-0 bg-gradient-to-r from-blue-50 to-purple-50 z-10"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center gap-2">
                    Lead Source <SortIcon field="source" />
                  </div>
                </TableHead>
                {formattedMonths.map((month) => (
                  <TableHead 
                    key={month!.original}
                    className="cursor-pointer hover:bg-blue-100 transition-colors text-center font-bold text-gray-700 min-w-[120px]"
                    onClick={() => handleSort(month!.original)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {month!.formatted} <SortIcon field={month!.original} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSources.map((source, sourceIndex) => (
                <TableRow 
                  key={source} 
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-800 sticky left-0 bg-white z-10 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      {source || 'Unknown Source'}
                    </div>
                  </TableCell>
                  {formattedMonths.map((month, monthIndex) => {
                    const value = data[source]?.[month!.original] || 0;
                    const previousValue = monthIndex < formattedMonths.length - 1 
                      ? data[source]?.[formattedMonths[monthIndex + 1]!.original] || 0 
                      : 0;
                    
                    return (
                      <TableCell 
                        key={month!.original} 
                        className="text-center font-mono"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-gray-800">
                            {formatValue(value)}
                          </div>
                          {getChangeIndicator(value, previousValue)}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              
              {/* Totals Row */}
              <TableRow className="bg-gradient-to-r from-slate-100 to-slate-200 font-bold border-t-2 border-slate-300">
                <TableCell className="font-bold text-gray-800 sticky left-0 bg-gradient-to-r from-slate-100 to-slate-200 z-10">
                  TOTALS
                </TableCell>
                {monthlyTotals.map((monthTotal) => (
                  <TableCell 
                    key={monthTotal.month} 
                    className="text-center font-bold text-blue-700"
                  >
                    {formatValue(monthTotal.total)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {filteredSources.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="font-medium">No source data available</p>
            <p className="text-sm">Try adjusting your filters or date range</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
