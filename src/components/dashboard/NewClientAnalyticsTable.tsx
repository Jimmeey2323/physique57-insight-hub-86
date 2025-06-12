
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { NewClientData, TableData } from '@/types/dashboard';

interface NewClientAnalyticsTableProps {
  data: NewClientData[];
  title: string;
  type: 'monthly' | 'yearly' | 'trainer-monthly' | 'location-monthly' | 'membership-monthly' | 'top-performers' | 'bottom-performers';
  maxRows?: number;
  className?: string;
}

export const NewClientAnalyticsTable: React.FC<NewClientAnalyticsTableProps> = ({
  data,
  title,
  type,
  maxRows = 50,
  className = ''
}) => {
  const generateAnalyticsData = () => {
    switch (type) {
      case 'monthly':
        return generateMonthlyMetrics();
      case 'yearly':
        return generateYearlyMetrics();
      case 'trainer-monthly':
        return generateTrainerMonthlyMetrics();
      case 'location-monthly':
        return generateLocationMonthlyMetrics();
      case 'membership-monthly':
        return generateMembershipMonthlyMetrics();
      case 'top-performers':
        return generateTopPerformers();
      case 'bottom-performers':
        return generateBottomPerformers();
      default:
        return [];
    }
  };

  const generateMonthlyMetrics = (): TableData[] => {
    const monthlyData = data.reduce((acc, item) => {
      const date = new Date(item.firstVisitDate);
      if (isNaN(date.getTime())) return acc;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          newMembers: 0,
          totalMembers: 0,
          retained: 0,
          converted: 0,
          totalRevenue: 0,
          totalVisits: 0
        };
      }
      
      acc[monthKey].totalMembers += 1;
      if (item.isNew === 'Yes') acc[monthKey].newMembers += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') acc[monthKey].retained += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[monthKey].converted += 1;
      acc[monthKey].totalRevenue += item.ltv;
      acc[monthKey].totalVisits += item.visitsPostTrial;
      
      return acc;
    }, {} as Record<string, any>);

    const sortedMonths = Object.keys(monthlyData).sort();
    const tableData = sortedMonths.map((month, index) => {
      const current = monthlyData[month];
      const previous = index > 0 ? monthlyData[sortedMonths[index - 1]] : null;
      
      const retentionRate = current.totalMembers > 0 ? (current.retained / current.totalMembers) * 100 : 0;
      const conversionRate = current.totalMembers > 0 ? (current.converted / current.totalMembers) * 100 : 0;
      
      const prevRetentionRate = previous && previous.totalMembers > 0 ? (previous.retained / previous.totalMembers) * 100 : 0;
      const prevConversionRate = previous && previous.totalMembers > 0 ? (previous.converted / previous.totalMembers) * 100 : 0;
      
      return {
        'Month': month,
        'New Members': current.newMembers,
        'Total Members': current.totalMembers,
        'Retained': current.retained,
        'Retention Rate': `${retentionRate.toFixed(1)}%`,
        'Converted': current.converted,
        'Conversion Rate': `${conversionRate.toFixed(1)}%`,
        'Total Revenue': formatCurrency(current.totalRevenue),
        'Avg Revenue/Member': formatCurrency(current.totalMembers > 0 ? current.totalRevenue / current.totalMembers : 0),
        'MoM Retention Change': previous ? `${(retentionRate - prevRetentionRate).toFixed(1)}%` : 'N/A',
        'MoM Conversion Change': previous ? `${(conversionRate - prevConversionRate).toFixed(1)}%` : 'N/A'
      };
    });

    // Add totals row
    const totals = {
      'Month': 'TOTAL',
      'New Members': data.filter(item => item.isNew === 'Yes').length,
      'Total Members': data.length,
      'Retained': data.filter(item => item.retentionStatus === 'Active' || item.retentionStatus === 'Retained').length,
      'Retention Rate': `${((data.filter(item => item.retentionStatus === 'Active' || item.retentionStatus === 'Retained').length / data.length) * 100).toFixed(1)}%`,
      'Converted': data.filter(item => item.membershipsBoughtPostTrial === 'Yes').length,
      'Conversion Rate': `${((data.filter(item => item.membershipsBoughtPostTrial === 'Yes').length / data.length) * 100).toFixed(1)}%`,
      'Total Revenue': formatCurrency(data.reduce((sum, item) => sum + item.ltv, 0)),
      'Avg Revenue/Member': formatCurrency(data.reduce((sum, item) => sum + item.ltv, 0) / data.length),
      'MoM Retention Change': '—',
      'MoM Conversion Change': '—'
    };

    return [...tableData, totals];
  };

  const generateYearlyMetrics = (): TableData[] => {
    const yearlyData = data.reduce((acc, item) => {
      const date = new Date(item.firstVisitDate);
      if (isNaN(date.getTime())) return acc;
      
      const year = date.getFullYear().toString();
      
      if (!acc[year]) {
        acc[year] = {
          newMembers: 0,
          totalMembers: 0,
          retained: 0,
          converted: 0,
          totalRevenue: 0
        };
      }
      
      acc[year].totalMembers += 1;
      if (item.isNew === 'Yes') acc[year].newMembers += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') acc[year].retained += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[year].converted += 1;
      acc[year].totalRevenue += item.ltv;
      
      return acc;
    }, {} as Record<string, any>);

    const sortedYears = Object.keys(yearlyData).sort();
    const tableData = sortedYears.map((year, index) => {
      const current = yearlyData[year];
      const previous = index > 0 ? yearlyData[sortedYears[index - 1]] : null;
      
      const retentionRate = current.totalMembers > 0 ? (current.retained / current.totalMembers) * 100 : 0;
      const conversionRate = current.totalMembers > 0 ? (current.converted / current.totalMembers) * 100 : 0;
      
      const prevRetentionRate = previous && previous.totalMembers > 0 ? (previous.retained / previous.totalMembers) * 100 : 0;
      const prevConversionRate = previous && previous.totalMembers > 0 ? (previous.converted / previous.totalMembers) * 100 : 0;
      
      return {
        'Year': year,
        'New Members': current.newMembers,
        'Total Members': current.totalMembers,
        'Retained': current.retained,
        'Retention Rate': `${retentionRate.toFixed(1)}%`,
        'Converted': current.converted,
        'Conversion Rate': `${conversionRate.toFixed(1)}%`,
        'Total Revenue': formatCurrency(current.totalRevenue),
        'YoY Member Growth': previous ? `${(((current.totalMembers - previous.totalMembers) / previous.totalMembers) * 100).toFixed(1)}%` : 'N/A',
        'YoY Revenue Growth': previous ? `${(((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100).toFixed(1)}%` : 'N/A'
      };
    });

    return tableData;
  };

  const generateTrainerMonthlyMetrics = (): TableData[] => {
    const trainerMonthlyData = data.reduce((acc, item) => {
      if (!item.trainerName || item.trainerName === '') return acc;
      
      const date = new Date(item.firstVisitDate);
      if (isNaN(date.getTime())) return acc;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const key = `${item.trainerName}-${monthKey}`;
      
      if (!acc[key]) {
        acc[key] = {
          trainer: item.trainerName,
          month: monthKey,
          newMembers: 0,
          totalMembers: 0,
          retained: 0,
          converted: 0,
          totalRevenue: 0
        };
      }
      
      acc[key].totalMembers += 1;
      if (item.isNew === 'Yes') acc[key].newMembers += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') acc[key].retained += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[key].converted += 1;
      acc[key].totalRevenue += item.ltv;
      
      return acc;
    }, {} as Record<string, any>);

    const tableData = Object.values(trainerMonthlyData).map((item: any) => ({
      'Trainer': item.trainer,
      'Month': item.month,
      'New Members': item.newMembers,
      'Total Members': item.totalMembers,
      'Retained': item.retained,
      'Retention Rate': item.totalMembers > 0 ? `${((item.retained / item.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Converted': item.converted,
      'Conversion Rate': item.totalMembers > 0 ? `${((item.converted / item.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Revenue': formatCurrency(item.totalRevenue)
    }));

    return tableData.sort((a, b) => `${a['Trainer']}-${a['Month']}`.localeCompare(`${b['Trainer']}-${b['Month']}`));
  };

  const generateLocationMonthlyMetrics = (): TableData[] => {
    const locationMonthlyData = data.reduce((acc, item) => {
      const date = new Date(item.firstVisitDate);
      if (isNaN(date.getTime())) return acc;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const key = `${item.firstVisitLocation}-${monthKey}`;
      
      if (!acc[key]) {
        acc[key] = {
          location: item.firstVisitLocation,
          month: monthKey,
          newMembers: 0,
          totalMembers: 0,
          retained: 0,
          converted: 0,
          totalRevenue: 0
        };
      }
      
      acc[key].totalMembers += 1;
      if (item.isNew === 'Yes') acc[key].newMembers += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') acc[key].retained += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[key].converted += 1;
      acc[key].totalRevenue += item.ltv;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(locationMonthlyData).map((item: any) => ({
      'Location': item.location,
      'Month': item.month,
      'New Members': item.newMembers,
      'Total Members': item.totalMembers,
      'Retained': item.retained,
      'Retention Rate': item.totalMembers > 0 ? `${((item.retained / item.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Converted': item.converted,
      'Conversion Rate': item.totalMembers > 0 ? `${((item.converted / item.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Revenue': formatCurrency(item.totalRevenue)
    }));
  };

  const generateMembershipMonthlyMetrics = (): TableData[] => {
    const membershipMonthlyData = data.reduce((acc, item) => {
      const date = new Date(item.firstVisitDate);
      if (isNaN(date.getTime())) return acc;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const key = `${item.membershipUsed}-${monthKey}`;
      
      if (!acc[key]) {
        acc[key] = {
          membership: item.membershipUsed,
          month: monthKey,
          newMembers: 0,
          totalMembers: 0,
          retained: 0,
          converted: 0,
          totalRevenue: 0
        };
      }
      
      acc[key].totalMembers += 1;
      if (item.isNew === 'Yes') acc[key].newMembers += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') acc[key].retained += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[key].converted += 1;
      acc[key].totalRevenue += item.ltv;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(membershipMonthlyData).map((item: any) => ({
      'Membership Used': item.membership,
      'Month': item.month,
      'New Members': item.newMembers,
      'Total Members': item.totalMembers,
      'Retained': item.retained,
      'Retention Rate': item.totalMembers > 0 ? `${((item.retained / item.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Converted': item.converted,
      'Conversion Rate': item.totalMembers > 0 ? `${((item.converted / item.totalMembers) * 100).toFixed(1)}%` : '0%',
      'Revenue': formatCurrency(item.totalRevenue)
    }));
  };

  const generateTopPerformers = (): TableData[] => {
    const trainerStats = data.reduce((acc, item) => {
      if (!item.trainerName || item.trainerName === '') return acc;
      
      if (!acc[item.trainerName]) {
        acc[item.trainerName] = {
          totalMembers: 0,
          retained: 0,
          converted: 0,
          totalRevenue: 0
        };
      }
      
      acc[item.trainerName].totalMembers += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') acc[item.trainerName].retained += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[item.trainerName].converted += 1;
      acc[item.trainerName].totalRevenue += item.ltv;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(trainerStats)
      .map(([trainer, stats]: [string, any]) => ({
        'Trainer': trainer,
        'Total Members': stats.totalMembers,
        'Retention Rate': stats.totalMembers > 0 ? `${((stats.retained / stats.totalMembers) * 100).toFixed(1)}%` : '0%',
        'Conversion Rate': stats.totalMembers > 0 ? `${((stats.converted / stats.totalMembers) * 100).toFixed(1)}%` : '0%',
        'Total Revenue': formatCurrency(stats.totalRevenue),
        'Avg Revenue/Member': formatCurrency(stats.totalMembers > 0 ? stats.totalRevenue / stats.totalMembers : 0)
      }))
      .sort((a, b) => parseFloat(b['Conversion Rate']) - parseFloat(a['Conversion Rate']))
      .slice(0, 10);
  };

  const generateBottomPerformers = (): TableData[] => {
    const trainerStats = data.reduce((acc, item) => {
      if (!item.trainerName || item.trainerName === '') return acc;
      
      if (!acc[item.trainerName]) {
        acc[item.trainerName] = {
          totalMembers: 0,
          retained: 0,
          converted: 0,
          totalRevenue: 0
        };
      }
      
      acc[item.trainerName].totalMembers += 1;
      if (item.retentionStatus === 'Active' || item.retentionStatus === 'Retained') acc[item.trainerName].retained += 1;
      if (item.membershipsBoughtPostTrial === 'Yes') acc[item.trainerName].converted += 1;
      acc[item.trainerName].totalRevenue += item.ltv;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(trainerStats)
      .map(([trainer, stats]: [string, any]) => ({
        'Trainer': trainer,
        'Total Members': stats.totalMembers,
        'Retention Rate': stats.totalMembers > 0 ? `${((stats.retained / stats.totalMembers) * 100).toFixed(1)}%` : '0%',
        'Conversion Rate': stats.totalMembers > 0 ? `${((stats.converted / stats.totalMembers) * 100).toFixed(1)}%` : '0%',
        'Total Revenue': formatCurrency(stats.totalRevenue),
        'Avg Revenue/Member': formatCurrency(stats.totalMembers > 0 ? stats.totalRevenue / stats.totalMembers : 0)
      }))
      .sort((a, b) => parseFloat(a['Conversion Rate']) - parseFloat(b['Conversion Rate']))
      .slice(0, 10);
  };

  const tableData = generateAnalyticsData();
  const displayData = tableData.slice(0, maxRows);

  if (!tableData || tableData.length === 0) {
    return (
      <Card className={`${className} bg-gradient-to-br from-white via-slate-50 to-blue-50 shadow-xl border-0`}>
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <CardTitle className="text-slate-800 font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-8 text-slate-600">
            No data available for analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  const headers = Object.keys(tableData[0]);
  const isTotal = (row: TableData) => {
    return typeof row[headers[0]] === 'string' && row[headers[0]].includes('TOTAL');
  };

  return (
    <Card className={`${className} bg-gradient-to-br from-white via-slate-50 to-blue-50 shadow-xl border-0 hover:shadow-2xl transition-all duration-300`}>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
        <CardTitle className="text-slate-800 font-bold flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-slate-600">({tableData.length} records)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-100 to-blue-100 hover:bg-gradient-to-r hover:from-slate-200 hover:to-blue-200">
                {headers.map((header) => (
                  <TableHead key={header} className="font-bold text-slate-800 text-xs uppercase tracking-wide sticky top-0 bg-gradient-to-r from-slate-100 to-blue-100">
                    {header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className={`
                    transition-all duration-200 
                    ${isTotal(row) 
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 font-bold border-t-2 border-blue-300 hover:from-blue-200 hover:to-purple-200' 
                      : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50'
                    }
                  `}
                >
                  {headers.map((header) => (
                    <TableCell 
                      key={header} 
                      className={`
                        text-sm py-3 px-4
                        ${isTotal(row) ? 'font-bold text-slate-900' : 'text-slate-700'}
                        ${header.includes('Rate') || header.includes('Change') || header.includes('Growth') 
                          ? 'text-center font-medium' 
                          : ''
                        }
                      `}
                    >
                      {typeof row[header] === 'number' 
                        ? row[header].toLocaleString() 
                        : String(row[header] || '—')
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {tableData.length > maxRows && (
          <div className="text-sm text-slate-600 p-4 text-center bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200">
            Showing {maxRows} of {tableData.length} records
          </div>
        )}
      </CardContent>
    </Card>
  );
};
