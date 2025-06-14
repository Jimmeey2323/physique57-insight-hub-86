
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Filter, Target } from 'lucide-react';
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

  // Create comprehensive month range from June 2025 to January 2024
  const generateMonthRange = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const generatedMonths = [];
    
    let currentYear = 2025;
    let currentMonth = 5; // June (0-based)
    
    while (currentYear > 2024 || (currentYear === 2024 && currentMonth >= 0)) {
      const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      generatedMonths.push({
        original: monthKey,
        formatted: `${monthNames[currentMonth]} ${currentYear}`,
        sortKey: new Date(currentYear, currentMonth).getTime()
      });
      
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
    }
    
    return generatedMonths;
  };

  const formattedMonths = generateMonthRange();

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
      return sum + (data[source]?.[month.original] || 0);
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

  // Calculate totals for each month
  const monthlyTotals = formattedMonths.map(month => {
    const total = sources.reduce((sum, source) => {
      return sum + (data[source]?.[month.original] || 0);
    }, 0);
    return { month: month.formatted, total };
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

  const handleRowClick = (source: string) => {
    console.log('Drill-down data for source:', source, data[source]);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Lead Source Performance - Month on Month
          </CardTitle>
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
              className={`gap-2 text-xs ${
                quickFilter === filter.value 
                  ? 'bg-blue-600 text-white' 
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
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20">
              <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 h-[25px]">
                <TableHead 
                  className="cursor-pointer hover:bg-blue-100 transition-colors font-bold text-gray-700 sticky left-0 bg-gradient-to-r from-blue-50 to-purple-50 z-30 min-w-[250px] w-[250px] max-w-[250px] h-[25px] p-2"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center gap-2 text-xs">
                    Lead Source <SortIcon field="source" />
                  </div>
                </TableHead>
                {formattedMonths.map((month) => (
                  <TableHead 
                    key={month.original}
                    className="cursor-pointer hover:bg-blue-100 transition-colors text-center font-bold text-gray-700 min-w-[100px] w-[100px] h-[25px] p-2"
                    onClick={() => handleSort(month.original)}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs whitespace-nowrap">
                      {month.formatted} <SortIcon field={month.original} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSources.map((source, sourceIndex) => (
                <TableRow 
                  key={source} 
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer h-[25px]"
                  onClick={() => handleRowClick(source)}
                >
                  <TableCell className="font-medium text-gray-800 sticky left-0 bg-white z-10 border-r border-gray-200 min-w-[250px] w-[250px] max-w-[250px] h-[25px] p-2">
                    <div className="flex items-center gap-2 text-xs truncate">
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                      <span className="truncate">{source || 'Unknown Source'}</span>
                    </div>
                  </TableCell>
                  {formattedMonths.map((month) => {
                    const value = data[source]?.[month.original] || 0;
                    
                    return (
                      <TableCell 
                        key={month.original} 
                        className="text-center font-mono min-w-[100px] w-[100px] h-[25px] p-1"
                      >
                        <div className="flex items-center justify-center h-full">
                          <span className="font-bold text-gray-800 text-xs truncate">
                            {formatValue(value)}
                          </span>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              
              {/* Totals Row */}
              <TableRow className="bg-gradient-to-r from-slate-100 to-slate-200 font-bold border-t-2 border-slate-300 h-[25px] sticky bottom-0 z-10">
                <TableCell className="font-bold text-gray-800 sticky left-0 bg-gradient-to-r from-slate-100 to-slate-200 z-20 min-w-[250px] w-[250px] max-w-[250px] h-[25px] p-2">
                  <span className="text-xs">TOTALS</span>
                </TableCell>
                {monthlyTotals.map((monthTotal) => (
                  <TableCell 
                    key={monthTotal.month} 
                    className="text-center font-bold text-blue-700 min-w-[100px] w-[100px] h-[25px] p-1"
                  >
                    <span className="text-xs">{formatValue(monthTotal.total)}</span>
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
