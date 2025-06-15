
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, Download, RefreshCw } from 'lucide-react';
import { LeadMetricTabs } from './LeadMetricTabs';
import { LeadsMetricType, LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';

interface LeadYearOnYearSourceTableProps {
  data: LeadsData[];
  activeMetric: LeadsMetricType;
  onMetricChange: (metric: LeadsMetricType) => void;
}

export const LeadYearOnYearSourceTable: React.FC<LeadYearOnYearSourceTableProps> = ({
  data,
  activeMetric,
  onMetricChange
}) => {
  const [sortField, setSortField] = useState<string>('source');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Process data for year-on-year comparison by source
  const processedData = useMemo(() => {
    const sourceStats = data.reduce((acc, item) => {
      if (!item.createdAt || !item.source) return acc;
      
      const date = new Date(item.createdAt);
      if (isNaN(date.getTime())) return acc;
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const source = item.source;
      
      // Only include 2024 and 2025 data
      if (year !== 2024 && year !== 2025) return acc;
      
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      if (!acc[source]) {
        acc[source] = {};
      }
      if (!acc[source][key]) {
        acc[source][key] = {
          totalLeads: 0,
          trialsCompleted: 0,
          membershipsSold: 0,
          ltvSum: 0,
          visits: 0,
          revenue: 0
        };
      }
      
      acc[source][key].totalLeads++;
      if (item.stage === 'Trial Completed') {
        acc[source][key].trialsCompleted++;
      }
      if (item.conversionStatus === 'Converted') {
        acc[source][key].membershipsSold++;
      }
      acc[source][key].ltvSum += item.ltv || 0;
      acc[source][key].visits += item.visits || 0;
      acc[source][key].revenue += item.ltv || 0;
      
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Generate month pairs (2024, 2025) in descending order
    const months = [];
    for (let month = 6; month >= 1; month--) {
      const monthKey = String(month).padStart(2, '0');
      months.push({
        month,
        display: new Date(2025, month - 1).toLocaleString('default', { month: 'short' }),
        key2024: `2024-${monthKey}`,
        key2025: `2025-${monthKey}`
      });
    }

    const result = Object.entries(sourceStats).map(([source, monthData]) => {
      const sourceResult = { source, months: {} as any, totals: { total2024: 0, total2025: 0, growth: 0 } };
      
      months.forEach(({ month, display, key2024, key2025 }) => {
        const data2024 = monthData[key2024] || { totalLeads: 0, trialsCompleted: 0, membershipsSold: 0, ltvSum: 0, visits: 0, revenue: 0 };
        const data2025 = monthData[key2025] || { totalLeads: 0, trialsCompleted: 0, membershipsSold: 0, ltvSum: 0, visits: 0, revenue: 0 };
        
        let value2024 = 0;
        let value2025 = 0;
        
        switch (activeMetric) {
          case 'totalLeads':
            value2024 = data2024.totalLeads;
            value2025 = data2025.totalLeads;
            break;
          case 'leadToTrialConversion':
            value2024 = data2024.totalLeads > 0 ? (data2024.trialsCompleted / data2024.totalLeads) * 100 : 0;
            value2025 = data2025.totalLeads > 0 ? (data2025.trialsCompleted / data2025.totalLeads) * 100 : 0;
            break;
          case 'trialToMembershipConversion':
            value2024 = data2024.trialsCompleted > 0 ? (data2024.membershipsSold / data2024.trialsCompleted) * 100 : 0;
            value2025 = data2025.trialsCompleted > 0 ? (data2025.membershipsSold / data2025.trialsCompleted) * 100 : 0;
            break;
          case 'ltv':
            value2024 = data2024.totalLeads > 0 ? data2024.ltvSum / data2024.totalLeads : 0;
            value2025 = data2025.totalLeads > 0 ? data2025.ltvSum / data2025.totalLeads : 0;
            break;
          case 'totalRevenue':
            value2024 = data2024.revenue;
            value2025 = data2025.revenue;
            break;
          case 'visitFrequency':
            value2024 = data2024.totalLeads > 0 ? data2024.visits / data2024.totalLeads : 0;
            value2025 = data2025.totalLeads > 0 ? data2025.visits / data2025.totalLeads : 0;
            break;
          default:
            value2024 = data2024.totalLeads;
            value2025 = data2025.totalLeads;
        }
        
        const growth = value2024 > 0 ? ((value2025 - value2024) / value2024) * 100 : 0;
        
        sourceResult.months[month] = {
          display,
          value2024,
          value2025,
          growth
        };
        
        sourceResult.totals.total2024 += value2024;
        sourceResult.totals.total2025 += value2025;
      });
      
      sourceResult.totals.growth = sourceResult.totals.total2024 > 0 
        ? ((sourceResult.totals.total2025 - sourceResult.totals.total2024) / sourceResult.totals.total2024) * 100 
        : 0;
      
      return sourceResult;
    });

    return result.sort((a, b) => {
      if (sortField === 'source') {
        return sortDirection === 'asc' ? a.source.localeCompare(b.source) : b.source.localeCompare(a.source);
      }
      if (sortField === 'growth') {
        return sortDirection === 'asc' ? a.totals.growth - b.totals.growth : b.totals.growth - a.totals.growth;
      }
      return sortDirection === 'asc' ? a.totals.total2025 - b.totals.total2025 : b.totals.total2025 - a.totals.total2025;
    });
  }, [data, activeMetric, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatValue = (value: number) => {
    if (activeMetric === 'ltv' || activeMetric === 'totalRevenue') return formatCurrency(value);
    if (activeMetric.includes('Conversion')) return `${value.toFixed(1)}%`;
    if (activeMetric === 'visitFrequency') return value.toFixed(1);
    return formatNumber(value);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const handleExport = () => {
    console.log('Exporting year-on-year source data...');
  };

  return (
    <Card className="bg-white shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Year-on-Year Source Performance (2024 vs 2025)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
              {processedData.length} Sources
            </Badge>
          </div>
        </div>
        
        <LeadMetricTabs
          value={activeMetric}
          onValueChange={onMetricChange}
          className="w-full"
        />
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20">
              <TableRow className="bg-gradient-to-r from-purple-700 to-purple-900 text-white hover:bg-gradient-to-r hover:from-purple-700 hover:to-purple-900">
                <TableHead 
                  className="cursor-pointer hover:bg-purple-800 transition-colors font-bold text-white sticky left-0 bg-gradient-to-r from-purple-700 to-purple-900 z-30 min-w-[200px] p-3"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center gap-2 text-sm">
                    Lead Source <SortIcon field="source" />
                  </div>
                </TableHead>
                {[6, 5, 4, 3, 2, 1].map(month => {
                  const monthName = new Date(2025, month - 1).toLocaleString('default', { month: 'short' });
                  return (
                    <React.Fragment key={month}>
                      <TableHead className="text-center font-bold text-white min-w-[100px] p-2">
                        <div className="text-xs">
                          <div>{monthName} 2024</div>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-bold text-white min-w-[100px] p-2">
                        <div className="text-xs">
                          <div>{monthName} 2025</div>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-bold text-yellow-200 min-w-[80px] p-2">
                        <div className="text-xs">Growth</div>
                      </TableHead>
                    </React.Fragment>
                  );
                })}
                <TableHead 
                  className="cursor-pointer hover:bg-purple-800 transition-colors text-center font-bold text-yellow-200 min-w-[100px] p-2"
                  onClick={() => handleSort('growth')}
                >
                  <div className="flex items-center justify-center gap-1 text-xs">
                    Total Growth <SortIcon field="growth" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.map((sourceData, index) => (
                <TableRow 
                  key={sourceData.source}
                  className="hover:bg-blue-50/50 transition-colors border-b border-gray-100"
                >
                  <TableCell className="font-medium text-gray-800 sticky left-0 bg-white z-10 border-r border-gray-200 min-w-[200px] p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                      <span className="truncate text-sm font-semibold">{sourceData.source}</span>
                    </div>
                  </TableCell>
                  {[6, 5, 4, 3, 2, 1].map(month => {
                    const monthData = sourceData.months[month];
                    return (
                      <React.Fragment key={month}>
                        <TableCell className="text-center font-mono text-sm p-2">
                          <span className="text-gray-700">{formatValue(monthData.value2024)}</span>
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm p-2">
                          <span className="text-gray-800 font-semibold">{formatValue(monthData.value2025)}</span>
                        </TableCell>
                        <TableCell className="text-center p-2">
                          <div className={`flex items-center justify-center gap-1 text-xs font-semibold ${
                            monthData.growth > 0 ? 'text-green-600' : monthData.growth < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {monthData.growth > 0 ? <TrendingUp className="w-3 h-3" /> : monthData.growth < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                            {monthData.growth.toFixed(1)}%
                          </div>
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                  <TableCell className="text-center p-2">
                    <div className={`flex items-center justify-center gap-1 text-sm font-bold ${
                      sourceData.totals.growth > 0 ? 'text-green-600' : sourceData.totals.growth < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {sourceData.totals.growth > 0 ? <TrendingUp className="w-4 h-4" /> : sourceData.totals.growth < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                      {sourceData.totals.growth.toFixed(1)}%
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {processedData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="font-medium">No year-on-year data available</p>
            <p className="text-sm">Data comparison requires leads from both 2024 and 2025</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
