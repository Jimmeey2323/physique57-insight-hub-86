
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye, Download, Filter, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface DataTableProps {
  title: string;
  data: SalesData[];
  type: 'product' | 'category' | 'yearly' | 'monthly' | 'yoy-analysis';
  onRowClick?: (row: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ title, data, type, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('grossRevenue');
  const [sortField, setSortField] = useState<string>('grossRevenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const itemsPerPage = 10;

  // Helper function to safely parse dates
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    // Try different date formats
    const formats = [
      // ISO format
      new Date(dateString),
      // DD/MM/YYYY format
      new Date(dateString.split('/').reverse().join('-')),
      // MM/DD/YYYY format
      new Date(dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'))
    ];

    for (const date of formats) {
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  };

  const filterDataByPeriod = (rawData: SalesData[], period: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return rawData.filter(item => {
      const itemDate = parseDate(item.paymentDate);
      if (!itemDate) return false;
      
      switch (period) {
        case 'this-month':
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        case 'last-month':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastMonthYear;
        case 'this-quarter':
          const quarterStart = Math.floor(currentMonth / 3) * 3;
          return itemDate.getMonth() >= quarterStart && itemDate.getMonth() < quarterStart + 3 && itemDate.getFullYear() === currentYear;
        case 'this-year':
          return itemDate.getFullYear() === currentYear;
        default:
          return true;
      }
    });
  };

  const processedData = useMemo(() => {
    let filteredData = filterDataByPeriod(data, 'all');

    if (type === 'monthly') {
      // Get all unique products
      const products = [...new Set(filteredData.map(item => item.cleanedProduct))].filter(Boolean);
      
      // Get all unique month-years and sort them
      const monthYears = [...new Set(filteredData.map(item => {
        const date = parseDate(item.paymentDate);
        if (!date) return null;
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }).filter(Boolean))].sort();

      return products.map(product => {
        const row: any = { name: product };
        
        monthYears.forEach(monthYear => {
          const [year, month] = monthYear!.split('-');
          const monthData = filteredData.filter(item => {
            const date = parseDate(item.paymentDate);
            if (!date) return false;
            return item.cleanedProduct === product && 
                   date.getFullYear() === parseInt(year) && 
                   date.getMonth() === parseInt(month) - 1;
          });

          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', { 
            month: 'short', 
            year: '2-digit' 
          });

          const grossRevenue = monthData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
          const vat = monthData.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
          const transactions = monthData.length;
          const uniqueMembers = new Set(monthData.map(item => item.memberId)).size;

          row[`${monthName}_grossRevenue`] = grossRevenue;
          row[`${monthName}_vat`] = vat;
          row[`${monthName}_netRevenue`] = grossRevenue - vat;
          row[`${monthName}_transactions`] = transactions;
          row[`${monthName}_uniqueMembers`] = uniqueMembers;
          row[`${monthName}_atv`] = transactions > 0 ? grossRevenue / transactions : 0;
          row[`${monthName}_auv`] = transactions > 0 ? grossRevenue / transactions : 0;
          row[`${monthName}_asv`] = uniqueMembers > 0 ? grossRevenue / uniqueMembers : 0;
          row[`${monthName}_upt`] = transactions > 0 ? transactions / transactions : 0;
        });

        return row;
      });
    }

    if (type === 'yoy-analysis') {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;

      const analyzeYoY = (groupKey: keyof SalesData) => {
        const groups = [...new Set(filteredData.map(item => item[groupKey]))].filter(Boolean);
        
        return groups.map(group => {
          const currentYearData = filteredData.filter(item => {
            const date = parseDate(item.paymentDate);
            return date && date.getFullYear() === currentYear && item[groupKey] === group;
          });

          const lastYearData = filteredData.filter(item => {
            const date = parseDate(item.paymentDate);
            return date && date.getFullYear() === lastYear && item[groupKey] === group;
          });

          const currentRevenue = currentYearData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
          const lastRevenue = lastYearData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
          const growth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

          const currentTransactions = currentYearData.length;
          const lastTransactions = lastYearData.length;
          const transactionGrowth = lastTransactions > 0 ? ((currentTransactions - lastTransactions) / lastTransactions) * 100 : 0;

          return {
            name: group as string,
            currentYearRevenue: currentRevenue,
            lastYearRevenue: lastRevenue,
            revenueGrowth: growth,
            currentYearTransactions: currentTransactions,
            lastYearTransactions: lastTransactions,
            transactionGrowth: transactionGrowth,
            type: groupKey
          };
        });
      };

      const productAnalysis = analyzeYoY('cleanedProduct');
      const categoryAnalysis = analyzeYoY('cleanedCategory');
      const soldByAnalysis = analyzeYoY('soldBy');
      const paymentMethodAnalysis = analyzeYoY('paymentMethod');

      return [...productAnalysis, ...categoryAnalysis, ...soldByAnalysis, ...paymentMethodAnalysis]
        .sort((a, b) => Math.abs(b.revenueGrowth) - Math.abs(a.revenueGrowth));
    }

    if (type === 'product') {
      const grouped = filteredData.reduce((acc, item) => {
        const key = item.cleanedProduct;
        if (!acc[key]) {
          acc[key] = {
            name: key,
            grossRevenue: 0,
            vat: 0,
            netRevenue: 0,
            unitsSold: 0,
            transactions: 0,
            uniqueMembers: new Set(),
            atv: 0,
            auv: 0,
            asv: 0,
            upt: 0
          };
        }
        acc[key].grossRevenue += item.paymentValue || 0;
        acc[key].vat += item.paymentVAT || 0;
        acc[key].netRevenue += (item.paymentValue || 0) - (item.paymentVAT || 0);
        acc[key].unitsSold += 1;
        acc[key].transactions += 1;
        acc[key].uniqueMembers.add(item.memberId);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => ({
        ...item,
        uniqueMembers: item.uniqueMembers.size,
        atv: item.transactions > 0 ? item.grossRevenue / item.transactions : 0,
        auv: item.unitsSold > 0 ? item.grossRevenue / item.unitsSold : 0,
        asv: item.uniqueMembers.size > 0 ? item.grossRevenue / item.uniqueMembers.size : 0,
        upt: item.transactions > 0 ? item.unitsSold / item.transactions : 0
      }));
    }
    
    if (type === 'category') {
      const grouped = filteredData.reduce((acc, item) => {
        const key = item.cleanedCategory;
        if (!acc[key]) {
          acc[key] = {
            name: key,
            grossRevenue: 0,
            vat: 0,
            netRevenue: 0,
            unitsSold: 0,
            transactions: 0,
            uniqueMembers: new Set(),
            atv: 0,
            auv: 0,
            asv: 0,
            upt: 0
          };
        }
        acc[key].grossRevenue += item.paymentValue || 0;
        acc[key].vat += item.paymentVAT || 0;
        acc[key].netRevenue += (item.paymentValue || 0) - (item.paymentVAT || 0);
        acc[key].unitsSold += 1;
        acc[key].transactions += 1;
        acc[key].uniqueMembers.add(item.memberId);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => ({
        ...item,
        uniqueMembers: item.uniqueMembers.size,
        atv: item.transactions > 0 ? item.grossRevenue / item.transactions : 0,
        auv: item.unitsSold > 0 ? item.grossRevenue / item.unitsSold : 0,
        asv: item.uniqueMembers.size > 0 ? item.grossRevenue / item.uniqueMembers.size : 0,
        upt: item.transactions > 0 ? item.unitsSold / item.transactions : 0
      }));
    }

    return [];
  }, [data, type]);

  // Get unique month-years for monthly table headers
  const monthYears = useMemo(() => {
    if (type !== 'monthly') return [];
    
    const months = [...new Set(data.map(item => {
      const date = parseDate(item.paymentDate);
      if (!date) return null;
      return new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('en-IN', { 
        month: 'short', 
        year: '2-digit' 
      });
    }).filter(Boolean))].sort();

    return months as string[];
  }, [data, type]);

  // Apply search and filters
  const filteredAndSearchedData = useMemo(() => {
    let result = processedData;

    if (searchTerm) {
      result = result.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortField && type !== 'monthly') {
      result.sort((a, b) => {
        const aVal = a[sortField] || 0;
        const bVal = b[sortField] || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [processedData, searchTerm, filterCategory, sortField, sortDirection, type]);

  const totalPages = Math.ceil(filteredAndSearchedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSearchedData.slice(startIndex, endIndex);

  // Calculate correct totals
  const totals = useMemo(() => {
    if (type === 'monthly') {
      const monthTotals: any = {};
      monthYears.forEach(month => {
        monthTotals[`${month}_grossRevenue`] = 0;
        monthTotals[`${month}_netRevenue`] = 0;
        monthTotals[`${month}_vat`] = 0;
        monthTotals[`${month}_transactions`] = 0;
        monthTotals[`${month}_uniqueMembers`] = 0;
      });

      filteredAndSearchedData.forEach(item => {
        monthYears.forEach(month => {
          monthTotals[`${month}_grossRevenue`] += item[`${month}_grossRevenue`] || 0;
          monthTotals[`${month}_netRevenue`] += item[`${month}_netRevenue`] || 0;
          monthTotals[`${month}_vat`] += item[`${month}_vat`] || 0;
          monthTotals[`${month}_transactions`] += item[`${month}_transactions`] || 0;
          monthTotals[`${month}_uniqueMembers`] += item[`${month}_uniqueMembers`] || 0;
        });
      });

      return monthTotals;
    }

    return filteredAndSearchedData.reduce((acc, item) => ({
      grossRevenue: acc.grossRevenue + (item.grossRevenue || 0),
      netRevenue: acc.netRevenue + (item.netRevenue || 0),
      vat: acc.vat + (item.vat || 0),
      unitsSold: acc.unitsSold + (item.unitsSold || 0),
      transactions: acc.transactions + (item.transactions || 0),
      uniqueMembers: acc.uniqueMembers + (item.uniqueMembers || 0)
    }), {
      grossRevenue: 0,
      netRevenue: 0,
      vat: 0,
      unitsSold: 0,
      transactions: 0,
      uniqueMembers: 0
    });
  }, [filteredAndSearchedData, type, monthYears]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getTableTitle = () => {
    switch (type) {
      case 'monthly':
        return 'Month-on-Month Product Performance Matrix';
      case 'yoy-analysis':
        return 'Year-on-Year Growth Analysis';
      case 'yearly':
        return 'Year-on-Year Performance';
      default:
        return title;
    }
  };

  const renderMonthlyTable = () => (
    <div className="rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-white via-slate-50/30 to-white shadow-2xl overflow-hidden backdrop-blur-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="p-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/50">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-1">
            <TabsTrigger value="grossRevenue" className="text-xs font-semibold">Gross Revenue</TabsTrigger>
            <TabsTrigger value="netRevenue" className="text-xs font-semibold">Net Revenue</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs font-semibold">Transactions</TabsTrigger>
            <TabsTrigger value="uniqueMembers" className="text-xs font-semibold">Members</TabsTrigger>
            <TabsTrigger value="atv" className="text-xs font-semibold">ATV</TabsTrigger>
          </TabsList>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-100/80 via-white to-slate-100/80 border-b-2 border-slate-200/50 hover:bg-gradient-to-r hover:from-slate-200/50 hover:to-slate-100/50">
                <TableHead className="font-bold text-slate-800 text-sm sticky left-0 bg-slate-100/90 backdrop-blur-sm border-r-2 border-slate-200/50 min-w-[200px]">
                  Product
                </TableHead>
                {monthYears.map(month => (
                  <TableHead key={month} className="text-center font-bold text-slate-700 text-sm min-w-[120px] border-r border-slate-200/30">
                    {month}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 cursor-pointer transition-all duration-300 border-b border-slate-200/30"
                  onClick={() => onRowClick?.(row)}
                >
                  <TableCell className="font-semibold text-slate-800 sticky left-0 bg-white/90 backdrop-blur-sm border-r-2 border-slate-200/50 text-sm">
                    {row.name}
                  </TableCell>
                  {monthYears.map(month => (
                    <TableCell key={month} className="text-center font-medium text-sm border-r border-slate-200/20">
                      {activeTab === 'grossRevenue' && formatCurrency(row[`${month}_grossRevenue`] || 0)}
                      {activeTab === 'netRevenue' && formatCurrency(row[`${month}_netRevenue`] || 0)}
                      {activeTab === 'transactions' && formatNumber(row[`${month}_transactions`] || 0)}
                      {activeTab === 'uniqueMembers' && formatNumber(row[`${month}_uniqueMembers`] || 0)}
                      {activeTab === 'atv' && formatCurrency(row[`${month}_atv`] || 0)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-blue-50/80 font-bold border-t-3 border-slate-300">
                <TableCell className="font-bold text-slate-800 sticky left-0 bg-blue-100/90 backdrop-blur-sm border-r-2 border-slate-300">
                  TOTALS
                </TableCell>
                {monthYears.map(month => (
                  <TableCell key={month} className="text-center font-bold text-blue-700 border-r border-slate-200/30">
                    {activeTab === 'grossRevenue' && formatCurrency(totals[`${month}_grossRevenue`] || 0)}
                    {activeTab === 'netRevenue' && formatCurrency(totals[`${month}_netRevenue`] || 0)}
                    {activeTab === 'transactions' && formatNumber(totals[`${month}_transactions`] || 0)}
                    {activeTab === 'uniqueMembers' && formatNumber(totals[`${month}_uniqueMembers`] || 0)}
                    {activeTab === 'atv' && '-'}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Tabs>
    </div>
  );

  const renderYoYTable = () => (
    <div className="rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-white via-slate-50/30 to-white shadow-2xl overflow-hidden backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-slate-100/80 via-white to-slate-100/80 border-b-2 border-slate-200/50">
            <TableHead className="font-bold text-slate-800">Category</TableHead>
            <TableHead className="font-bold text-slate-800">Name</TableHead>
            <TableHead className="text-center font-bold text-slate-700">Current Year Revenue</TableHead>
            <TableHead className="text-center font-bold text-slate-700">Last Year Revenue</TableHead>
            <TableHead className="text-center font-bold text-slate-700">Revenue Growth</TableHead>
            <TableHead className="text-center font-bold text-slate-700">Current Transactions</TableHead>
            <TableHead className="text-center font-bold text-slate-700">Last Transactions</TableHead>
            <TableHead className="text-center font-bold text-slate-700">Transaction Growth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((row, index) => (
            <TableRow 
              key={index} 
              className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 cursor-pointer transition-all duration-300 border-b border-slate-200/30"
              onClick={() => onRowClick?.(row)}
            >
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {row.type?.replace('cleaned', '') || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-slate-800">{row.name}</TableCell>
              <TableCell className="text-center font-medium">{formatCurrency(row.currentYearRevenue)}</TableCell>
              <TableCell className="text-center">{formatCurrency(row.lastYearRevenue)}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {row.revenueGrowth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={cn(
                    "font-bold",
                    row.revenueGrowth > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatPercentage(row.revenueGrowth)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">{formatNumber(row.currentYearTransactions)}</TableCell>
              <TableCell className="text-center">{formatNumber(row.lastYearTransactions)}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {row.transactionGrowth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={cn(
                    "font-bold",
                    row.transactionGrowth > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatPercentage(row.transactionGrowth)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderStandardTable = () => (
    <div className="rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-white via-slate-50/30 to-white shadow-2xl overflow-hidden backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-slate-100/80 via-white to-slate-100/80 border-b-2 border-slate-200/50 hover:bg-gradient-to-r hover:from-slate-200/50 hover:to-slate-100/50">
            <TableHead className="font-bold text-slate-800">Name</TableHead>
            <TableHead className="text-center font-bold text-slate-700 cursor-pointer" onClick={() => handleSort('grossRevenue')}>
              <div className="flex items-center justify-center gap-1">
                Gross Revenue <ArrowUpDown className="w-3 h-3" />
              </div>
            </TableHead>
            <TableHead className="text-center font-bold text-slate-700">VAT</TableHead>
            <TableHead className="text-center font-bold text-slate-700">Net Revenue</TableHead>
            <TableHead className="text-center font-bold text-slate-700">Units</TableHead>
            <TableHead className="text-center font-bold text-slate-700">Transactions</TableHead>
            <TableHead className="text-center font-bold text-slate-700">Members</TableHead>
            <TableHead className="text-center font-bold text-slate-700">ATV</TableHead>
            <TableHead className="text-center font-bold text-slate-700">AUV</TableHead>
            <TableHead className="text-center font-bold text-slate-700">ASV</TableHead>
            <TableHead className="text-center font-bold text-slate-700">UPT</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((row, index) => (
            <TableRow 
              key={index} 
              className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 cursor-pointer transition-all duration-300 border-b border-slate-200/30"
              onClick={() => onRowClick?.(row)}
            >
              <TableCell className="font-semibold text-slate-800">{row.name}</TableCell>
              <TableCell className="text-center font-medium">{formatCurrency(row.grossRevenue || 0)}</TableCell>
              <TableCell className="text-center">{formatCurrency(row.vat || 0)}</TableCell>
              <TableCell className="text-center font-medium">{formatCurrency(row.netRevenue || 0)}</TableCell>
              <TableCell className="text-center">{formatNumber(row.unitsSold || 0)}</TableCell>
              <TableCell className="text-center">{formatNumber(row.transactions || 0)}</TableCell>
              <TableCell className="text-center">{formatNumber(row.uniqueMembers || 0)}</TableCell>
              <TableCell className="text-center">{formatCurrency(row.atv || 0)}</TableCell>
              <TableCell className="text-center">{formatCurrency(row.auv || 0)}</TableCell>
              <TableCell className="text-center">{formatCurrency(row.asv || 0)}</TableCell>
              <TableCell className="text-center">{(row.upt || 0).toFixed(2)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onRowClick?.(row)}>
                  <Eye className="w-3 h-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-blue-50/80 font-bold border-t-3 border-slate-300">
            <TableCell className="font-bold text-slate-800">TOTALS</TableCell>
            <TableCell className="text-center font-bold text-blue-700">{formatCurrency(totals.grossRevenue)}</TableCell>
            <TableCell className="text-center font-bold text-slate-700">{formatCurrency(totals.vat)}</TableCell>
            <TableCell className="text-center font-bold text-green-700">{formatCurrency(totals.netRevenue)}</TableCell>
            <TableCell className="text-center font-bold text-slate-700">{formatNumber(totals.unitsSold)}</TableCell>
            <TableCell className="text-center font-bold text-slate-700">{formatNumber(totals.transactions)}</TableCell>
            <TableCell className="text-center font-bold text-slate-700">{formatNumber(totals.uniqueMembers)}</TableCell>
            <TableCell className="text-center text-slate-500">-</TableCell>
            <TableCell className="text-center text-slate-500">-</TableCell>
            <TableCell className="text-center text-slate-500">-</TableCell>
            <TableCell className="text-center text-slate-500">-</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/20 to-white border-0 shadow-2xl backdrop-blur-sm">
      <CardHeader className="pb-6 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80 rounded-t-xl">
        <div className="flex items-center justify-between mb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            {getTableTitle()}
          </CardTitle>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-slate-300 shadow-sm"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-slate-300 shadow-sm">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="membership">Membership</SelectItem>
              <SelectItem value="class-packages">Class Packages</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        {type === 'monthly' ? renderMonthlyTable() : 
         type === 'yoy-analysis' ? renderYoYTable() : 
         renderStandardTable()}
        
        {/* Enhanced Pagination */}
        <div className="flex items-center justify-between mt-8 p-4 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80 rounded-xl border border-slate-200/50 shadow-sm">
          <div className="text-sm font-medium text-slate-700 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSearchedData.length)} of {filteredAndSearchedData.length} entries
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "w-10 h-10 shadow-sm hover:shadow-md transition-all duration-300",
                      currentPage === page && "bg-gradient-to-r from-blue-600 to-purple-600 border-0"
                    )}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Summary Section */}
        <div className="mt-8 p-8 bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-blue-50/80 rounded-2xl border-2 border-slate-200/50 shadow-lg backdrop-blur-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
            <Filter className="w-6 h-6 text-blue-600" />
            Advanced Business Intelligence Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h5 className="font-semibold text-slate-800 text-base mb-3">Performance Insights</h5>
              <ul className="text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Market Leader:</strong> {currentData[0]?.name || 'N/A'} dominates with {formatCurrency(Math.max(...currentData.map(d => d.grossRevenue || d.currentYearRevenue || 0), 0))} in performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Average Performance Metric:</strong> {formatCurrency((totals.grossRevenue || 0) / Math.max(currentData.length, 1))} per item analyzed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Market Concentration:</strong> Top 3 performers generate {formatPercentage(currentData.slice(0, 3).reduce((sum, item) => sum + (item.grossRevenue || item.currentYearRevenue || 0), 0) / Math.max(totals.grossRevenue || 1, 1) * 100)} of total value</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold text-slate-800 text-base mb-3">Strategic Metrics</h5>
              <ul className="text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Customer Engagement:</strong> {formatNumber(totals.uniqueMembers || 0)} unique customers across all segments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Operational Efficiency:</strong> {((totals.unitsSold || 0) / Math.max(totals.transactions || 1, 1)).toFixed(2)} units per transaction optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Analysis Scope:</strong> {currentData.length} active items showing {type === 'yoy-analysis' ? 'year-over-year growth patterns' : type === 'monthly' ? 'month-on-month trends' : 'comprehensive performance metrics'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
