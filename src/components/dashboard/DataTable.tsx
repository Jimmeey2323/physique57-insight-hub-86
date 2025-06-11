
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye, Download, Filter, Search } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface DataTableProps {
  title: string;
  data: SalesData[];
  type: 'product' | 'category' | 'yearly' | 'comparison' | 'monthly';
  onRowClick?: (row: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ title, data, type, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('this-month');
  const [sortField, setSortField] = useState<string>('grossRevenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const itemsPerPage = 10;

  const filterDataByPeriod = (rawData: SalesData[], period: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return rawData.filter(item => {
      const itemDate = new Date(item.paymentDate);
      
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
    let filteredData = filterDataByPeriod(data, activeTab);

    if (type === 'monthly') {
      // Monthly comparison data
      const monthlyData = filteredData.reduce((acc, item) => {
        const date = new Date(item.paymentDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            name: monthName,
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
        
        acc[monthKey].grossRevenue += item.paymentValue;
        acc[monthKey].vat += item.paymentVAT;
        acc[monthKey].netRevenue += (item.paymentValue - item.paymentVAT);
        acc[monthKey].unitsSold += 1;
        acc[monthKey].transactions += 1;
        acc[monthKey].uniqueMembers.add(item.memberId);
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(monthlyData).map((item: any) => ({
        ...item,
        uniqueMembers: item.uniqueMembers.size,
        atv: item.grossRevenue / item.transactions,
        auv: item.grossRevenue / item.unitsSold,
        asv: item.grossRevenue / item.uniqueMembers.size,
        upt: item.unitsSold / item.transactions
      }));
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
        acc[key].grossRevenue += item.paymentValue;
        acc[key].vat += item.paymentVAT;
        acc[key].netRevenue += (item.paymentValue - item.paymentVAT);
        acc[key].unitsSold += 1;
        acc[key].transactions += 1;
        acc[key].uniqueMembers.add(item.memberId);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => ({
        ...item,
        uniqueMembers: item.uniqueMembers.size,
        atv: item.grossRevenue / item.transactions,
        auv: item.grossRevenue / item.unitsSold,
        asv: item.grossRevenue / item.uniqueMembers.size,
        upt: item.unitsSold / item.transactions
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
        acc[key].grossRevenue += item.paymentValue;
        acc[key].vat += item.paymentVAT;
        acc[key].netRevenue += (item.paymentValue - item.paymentVAT);
        acc[key].unitsSold += 1;
        acc[key].transactions += 1;
        acc[key].uniqueMembers.add(item.memberId);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => ({
        ...item,
        uniqueMembers: item.uniqueMembers.size,
        atv: item.grossRevenue / item.transactions,
        auv: item.grossRevenue / item.unitsSold,
        asv: item.grossRevenue / item.uniqueMembers.size,
        upt: item.unitsSold / item.transactions
      }));
    }

    if (type === 'comparison') {
      const membershipData = filteredData.filter(item => item.cleanedCategory === 'Membership');
      const classPackageData = filteredData.filter(item => item.cleanedCategory === 'Class Packages');
      
      const calculateCategoryMetrics = (categoryData: SalesData[], categoryName: string) => {
        const grossRevenue = categoryData.reduce((sum, item) => sum + item.paymentValue, 0);
        const vat = categoryData.reduce((sum, item) => sum + item.paymentVAT, 0);
        const transactions = categoryData.length;
        const uniqueMembers = new Set(categoryData.map(item => item.memberId)).size;
        
        return {
          name: categoryName,
          grossRevenue,
          vat,
          netRevenue: grossRevenue - vat,
          unitsSold: transactions,
          transactions,
          uniqueMembers,
          atv: grossRevenue / transactions || 0,
          auv: grossRevenue / transactions || 0,
          asv: grossRevenue / uniqueMembers || 0,
          upt: transactions / transactions || 1
        };
      };

      return [
        calculateCategoryMetrics(membershipData, 'Memberships'),
        calculateCategoryMetrics(classPackageData, 'Class Packages')
      ];
    }

    return [];
  }, [data, type, activeTab]);

  // Apply search and category filters
  const filteredAndSearchedData = useMemo(() => {
    let result = processedData;

    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      // Additional filtering logic can be added here
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField] || 0;
        const bVal = b[sortField] || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [processedData, searchTerm, filterCategory, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSearchedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSearchedData.slice(startIndex, endIndex);

  const totals = useMemo(() => {
    return filteredAndSearchedData.reduce((acc, item) => ({
      grossRevenue: acc.grossRevenue + item.grossRevenue,
      netRevenue: acc.netRevenue + item.netRevenue,
      vat: acc.vat + item.vat,
      unitsSold: acc.unitsSold + item.unitsSold,
      transactions: acc.transactions + item.transactions,
      uniqueMembers: acc.uniqueMembers + item.uniqueMembers
    }), {
      grossRevenue: 0,
      netRevenue: 0,
      vat: 0,
      unitsSold: 0,
      transactions: 0,
      uniqueMembers: 0
    });
  }, [filteredAndSearchedData]);

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
        return 'Month-on-Month Performance';
      case 'comparison':
        return 'Category Comparison: Memberships vs Class Packages';
      case 'yearly':
        return 'Year-on-Year Performance';
      default:
        return title;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/20 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            {getTableTitle()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
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
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
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
      
      <CardContent>
        {type !== 'comparison' && type !== 'monthly' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="this-month">This Month</TabsTrigger>
              <TabsTrigger value="last-month">Last Month</TabsTrigger>
              <TabsTrigger value="this-quarter">This Quarter</TabsTrigger>
              <TabsTrigger value="this-year">This Year</TabsTrigger>
              <TabsTrigger value="custom">Custom Range</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="rounded-xl border bg-gradient-to-br from-white to-slate-50/50 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b">
                <TableHead className="font-bold text-slate-700">Name</TableHead>
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
                  className="h-[25px] hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200"
                  onClick={() => onRowClick?.(row)}
                >
                  <TableCell className="font-semibold text-slate-800">{row.name}</TableCell>
                  <TableCell className="text-center font-medium">{formatCurrency(row.grossRevenue)}</TableCell>
                  <TableCell className="text-center">{formatCurrency(row.vat)}</TableCell>
                  <TableCell className="text-center font-medium">{formatCurrency(row.netRevenue)}</TableCell>
                  <TableCell className="text-center">{formatNumber(row.unitsSold)}</TableCell>
                  <TableCell className="text-center">{formatNumber(row.transactions)}</TableCell>
                  <TableCell className="text-center">{formatNumber(row.uniqueMembers)}</TableCell>
                  <TableCell className="text-center">{formatCurrency(row.atv)}</TableCell>
                  <TableCell className="text-center">{formatCurrency(row.auv)}</TableCell>
                  <TableCell className="text-center">{formatCurrency(row.asv)}</TableCell>
                  <TableCell className="text-center">{row.upt.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onRowClick?.(row)}>
                      <Eye className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 font-bold border-t-2">
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
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSearchedData.length)} of {filteredAndSearchedData.length} entries
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3"
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
                    className="w-8 h-8 p-0"
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
              className="px-3"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Summary Section */}
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-xl border">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Advanced Analytics Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ul className="text-slate-700 space-y-2">
              <li>• <strong>Revenue Leader:</strong> {currentData[0]?.name} with {formatCurrency(Math.max(...currentData.map(d => d.grossRevenue)))}</li>
              <li>• <strong>Average Revenue per Item:</strong> {formatCurrency(totals.grossRevenue / Math.max(currentData.length, 1))}</li>
              <li>• <strong>Revenue Concentration:</strong> Top 3 items generate {formatPercentage(currentData.slice(0, 3).reduce((sum, item) => sum + item.grossRevenue, 0) / totals.grossRevenue)} of total</li>
            </ul>
            <ul className="text-slate-700 space-y-2">
              <li>• <strong>Customer Reach:</strong> {formatNumber(totals.uniqueMembers)} unique customers served</li>
              <li>• <strong>Transaction Efficiency:</strong> {(totals.unitsSold / totals.transactions).toFixed(2)} units per transaction average</li>
              <li>• <strong>Period Performance:</strong> {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} showing {currentData.length} active items</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
