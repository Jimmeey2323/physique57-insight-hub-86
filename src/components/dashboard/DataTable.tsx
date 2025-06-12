import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye, Download, Filter, Search, TrendingUp, TrendingDown, ChevronDown, Edit3, Save } from 'lucide-react';
import { SalesData, FilterOptions } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface DataTableProps {
  title: string;
  data: SalesData[];
  type: 'product' | 'category' | 'yearly' | 'monthly' | 'yoy-analysis';
  filters?: FilterOptions;
  onRowClick?: (row: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ title, data, type, filters, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('grossRevenue');
  const [sortField, setSortField] = useState<string>('grossRevenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [editingSummary, setEditingSummary] = useState(false);
  const [customSummary, setCustomSummary] = useState('');
  const itemsPerPage = 20;

  // Helper function to safely parse dates
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    // Handle various date formats
    const cleanDateString = dateString.trim();
    
    // Try DD/MM/YYYY format first (most common in the data)
    const ddmmyyyy = cleanDateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }
    
    // Try other formats
    const formats = [
      new Date(cleanDateString),
      new Date(cleanDateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')),
      new Date(cleanDateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'))
    ];

    for (const date of formats) {
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  };

  // Filter data by date range and other filters
  const filterDataByDateAndFilters = (rawData: SalesData[]) => {
    let filtered = rawData;

    // Apply date range filter
    if (filters?.dateRange?.start || filters?.dateRange?.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      filtered = filtered.filter(item => {
        const itemDate = parseDate(item.paymentDate);
        if (!itemDate) return false;
        
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        
        return true;
      });
    }

    // Apply other filters
    if (filters?.category?.length) {
      filtered = filtered.filter(item => 
        filters.category.some(cat => item.cleanedCategory?.toLowerCase().includes(cat.toLowerCase()))
      );
    }

    if (filters?.paymentMethod?.length) {
      filtered = filtered.filter(item => 
        filters.paymentMethod.some(method => item.paymentMethod?.toLowerCase().includes(method.toLowerCase()))
      );
    }

    if (filters?.soldBy?.length) {
      filtered = filtered.filter(item => 
        filters.soldBy.some(seller => item.soldBy?.toLowerCase().includes(seller.toLowerCase()))
      );
    }

    if (filters?.minAmount) {
      filtered = filtered.filter(item => (item.paymentValue || 0) >= filters.minAmount!);
    }

    if (filters?.maxAmount) {
      filtered = filtered.filter(item => (item.paymentValue || 0) <= filters.maxAmount!);
    }

    return filtered;
  };

  const processedData = useMemo(() => {
    let filteredData = filterDataByDateAndFilters(data);

    if (type === 'monthly') {
      // Get all unique products
      const products = Array.from(new Set(filteredData.map(item => item.cleanedProduct).filter(Boolean)));
      
      // Get all unique month-years and sort them
      const monthYearsSet = new Set(filteredData.map(item => {
        const date = parseDate(item.paymentDate);
        if (!date) return null;
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }).filter(Boolean));
      const monthYears = Array.from(monthYearsSet).sort();

      return products.map(product => {
        const row: any = { 
          name: product,
          category: filteredData.find(item => item.cleanedProduct === product)?.cleanedCategory || 'Unknown'
        };
        
        monthYears.forEach(monthYear => {
          const [year, month] = monthYear.split('-');
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
          const unitsSold = monthData.length;

          row[`${monthName}_grossRevenue`] = grossRevenue;
          row[`${monthName}_vat`] = vat;
          row[`${monthName}_netRevenue`] = grossRevenue - vat;
          row[`${monthName}_transactions`] = transactions;
          row[`${monthName}_uniqueMembers`] = uniqueMembers;
          row[`${monthName}_units`] = unitsSold;
          row[`${monthName}_atv`] = transactions > 0 ? Math.round(grossRevenue / transactions) : 0;
          row[`${monthName}_auv`] = unitsSold > 0 ? Math.round(grossRevenue / unitsSold) : 0;
          row[`${monthName}_asv`] = uniqueMembers > 0 ? Math.round(grossRevenue / uniqueMembers) : 0;
          row[`${monthName}_upt`] = transactions > 0 ? (unitsSold / transactions) : 0;
        });

        return row;
      });
    }

    if (type === 'yoy-analysis') {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;

      const analyzeYoY = (groupKey: keyof SalesData, displayName: string) => {
        const groups = Array.from(new Set(filteredData.map(item => item[groupKey]).filter(Boolean)));
        
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

          const currentMembers = new Set(currentYearData.map(item => item.memberId)).size;
          const lastMembers = new Set(lastYearData.map(item => item.memberId)).size;
          const memberGrowth = lastMembers > 0 ? ((currentMembers - lastMembers) / lastMembers) * 100 : 0;

          return {
            name: group as string,
            category: displayName,
            currentYearRevenue: currentRevenue,
            lastYearRevenue: lastRevenue,
            revenueGrowth: growth,
            currentYearTransactions: currentTransactions,
            lastYearTransactions: lastTransactions,
            transactionGrowth: transactionGrowth,
            currentYearMembers: currentMembers,
            lastYearMembers: lastMembers,
            memberGrowth: memberGrowth,
            type: groupKey
          };
        });
      };

      const productAnalysis = analyzeYoY('cleanedProduct', 'Product');
      const categoryAnalysis = analyzeYoY('cleanedCategory', 'Category');
      const soldByAnalysis = analyzeYoY('soldBy', 'Sales Rep');
      const paymentMethodAnalysis = analyzeYoY('paymentMethod', 'Payment Method');

      return [...productAnalysis, ...categoryAnalysis, ...soldByAnalysis, ...paymentMethodAnalysis]
        .sort((a, b) => Math.abs(b.revenueGrowth) - Math.abs(a.revenueGrowth));
    }

    // For product and category tables
    const groupingField = type === 'product' ? 'cleanedProduct' : 'cleanedCategory';
    
    const grouped = filteredData.reduce((acc, item) => {
      const key = item[groupingField] || 'Unknown';
      const category = item.cleanedCategory || 'Unknown';
      
      if (!acc[key]) {
        acc[key] = {
          name: key,
          category: category,
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
      atv: item.transactions > 0 ? Math.round(item.grossRevenue / item.transactions) : 0,
      auv: item.unitsSold > 0 ? Math.round(item.grossRevenue / item.unitsSold) : 0,
      asv: item.uniqueMembers.size > 0 ? Math.round(item.grossRevenue / item.uniqueMembers.size) : 0,
      upt: item.transactions > 0 ? (item.unitsSold / item.transactions) : 0
    }));
  }, [data, type, filters]);

  // Group data by category for collapsible display
  const groupedData = useMemo(() => {
    if (type === 'yoy-analysis') return processedData;
    
    const groups = processedData.reduce((acc, item) => {
      const category = item.category || 'Unknown';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    return groups;
  }, [processedData, type]);

  // Get unique month-years for monthly table headers
  const monthYears = useMemo(() => {
    if (type !== 'monthly') return [];
    
    const filteredData = filterDataByDateAndFilters(data);
    const months = Array.from(new Set(filteredData.map(item => {
      const date = parseDate(item.paymentDate);
      if (!date) return null;
      return new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('en-IN', { 
        month: 'short', 
        year: '2-digit' 
      });
    }).filter(Boolean))).sort();

    return months;
  }, [data, type, filters]);

  // Group months into quarters
  const quarterGroups = useMemo(() => {
    if (type !== 'monthly') return {};
    
    const quarters: Record<string, string[]> = {};
    monthYears.forEach(month => {
      const [monthName, year] = month.split(' ');
      const quarterMap: Record<string, string> = {
        'Jan': 'Q1', 'Feb': 'Q1', 'Mar': 'Q1',
        'Apr': 'Q2', 'May': 'Q2', 'Jun': 'Q2',
        'Jul': 'Q3', 'Aug': 'Q3', 'Sep': 'Q3',
        'Oct': 'Q4', 'Nov': 'Q4', 'Dec': 'Q4'
      };
      const quarter = `${quarterMap[monthName]} ${year}`;
      if (!quarters[quarter]) quarters[quarter] = [];
      quarters[quarter].push(month);
    });
    
    return quarters;
  }, [monthYears, type]);

  // Apply search and filters
  const filteredAndSearchedData = useMemo(() => {
    let result: any[] = type === 'yoy-analysis' ? processedData : Object.values(groupedData).flat();

    if (searchTerm) {
      result = result.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      result = result.filter(item => 
        item.category?.toLowerCase().includes(filterCategory.toLowerCase())
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
  }, [processedData, groupedData, searchTerm, filterCategory, sortField, sortDirection, type]);

  const totalPages = Math.ceil((filteredAndSearchedData as any[]).length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = type === 'yoy-analysis' ? (filteredAndSearchedData as any[]).slice(startIndex, endIndex) : filteredAndSearchedData;

  // Calculate totals
  const totals = useMemo(() => {
    const dataArray = filteredAndSearchedData as any[];
    
    if (type === 'monthly') {
      const monthTotals: any = {};
      monthYears.forEach(month => {
        monthTotals[`${month}_grossRevenue`] = 0;
        monthTotals[`${month}_netRevenue`] = 0;
        monthTotals[`${month}_vat`] = 0;
        monthTotals[`${month}_transactions`] = 0;
        monthTotals[`${month}_uniqueMembers`] = 0;
        monthTotals[`${month}_units`] = 0;
      });

      (processedData as any[]).forEach(item => {
        monthYears.forEach(month => {
          monthTotals[`${month}_grossRevenue`] += item[`${month}_grossRevenue`] || 0;
          monthTotals[`${month}_netRevenue`] += item[`${month}_netRevenue`] || 0;
          monthTotals[`${month}_vat`] += item[`${month}_vat`] || 0;
          monthTotals[`${month}_transactions`] += item[`${month}_transactions`] || 0;
          monthTotals[`${month}_uniqueMembers`] += item[`${month}_uniqueMembers`] || 0;
          monthTotals[`${month}_units`] += item[`${month}_units`] || 0;
        });
      });

      return monthTotals;
    }

    if (type === 'yoy-analysis') {
      return dataArray.reduce((acc, item) => ({
        currentYearRevenue: acc.currentYearRevenue + (item.currentYearRevenue || 0),
        lastYearRevenue: acc.lastYearRevenue + (item.lastYearRevenue || 0),
        currentYearTransactions: acc.currentYearTransactions + (item.currentYearTransactions || 0),
        lastYearTransactions: acc.lastYearTransactions + (item.lastYearTransactions || 0),
        currentYearMembers: acc.currentYearMembers + (item.currentYearMembers || 0),
        lastYearMembers: acc.lastYearMembers + (item.lastYearMembers || 0)
      }), {
        currentYearRevenue: 0,
        lastYearRevenue: 0,
        currentYearTransactions: 0,
        lastYearTransactions: 0,
        currentYearMembers: 0,
        lastYearMembers: 0
      });
    }

    return dataArray.reduce((acc, item) => ({
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
  }, [filteredAndSearchedData, type, processedData, monthYears]);

  const toggleGroup = (category: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedGroups(newCollapsed);
  };

  const saveCustomSummary = () => {
    localStorage.setItem(`table-summary-${type}`, customSummary);
    setEditingSummary(false);
  };

  const loadCustomSummary = () => {
    const saved = localStorage.getItem(`table-summary-${type}`);
    if (saved) {
      setCustomSummary(saved);
    }
  };

  React.useEffect(() => {
    loadCustomSummary();
  }, [type]);

  const getMetricValue = (item: any, metric: string, month?: string) => {
    const key = month ? `${month}_${metric}` : metric;
    const value = item[key] || 0;
    
    if (metric === 'grossRevenue' || metric === 'netRevenue' || metric === 'vat' || metric === 'atv' || metric === 'auv' || metric === 'asv') {
      return formatCurrency(value);
    } else if (metric === 'upt') {
      return typeof value === 'number' ? value.toFixed(1) : '0.0';
    } else {
      return formatNumber(value);
    }
  };

  const renderStandardTable = () => {
    const metricTabs = ['grossRevenue', 'netRevenue', 'vat', 'atv', 'auv', 'asv', 'units', 'upt'];
    
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-6">
          {metricTabs.map(tab => (
            <TabsTrigger key={tab} value={tab} className="text-xs">
              {tab === 'grossRevenue' ? 'Gross Rev' :
               tab === 'netRevenue' ? 'Net Rev' :
               tab === 'vat' ? 'VAT' :
               tab === 'atv' ? 'ATV' :
               tab === 'auv' ? 'AUV' :
               tab === 'asv' ? 'ASV' :
               tab === 'units' ? 'Units' :
               tab === 'upt' ? 'UPT' : tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {metricTabs.map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <TableHead className="font-semibold text-slate-700 w-64">Name</TableHead>
                    <TableHead className="font-semibold text-slate-700 w-32">Category</TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors w-32"
                      onClick={() => {
                        setSortField(tab);
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {tab === 'grossRevenue' ? 'Gross Revenue' :
                         tab === 'netRevenue' ? 'Net Revenue' :
                         tab === 'vat' ? 'VAT' :
                         tab === 'atv' ? 'ATV' :
                         tab === 'auv' ? 'AUV' :
                         tab === 'asv' ? 'ASV' :
                         tab === 'units' ? 'Units Sold' :
                         tab === 'upt' ? 'UPT' : tab}
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedData).map(([category, items]) => (
                    <React.Fragment key={category}>
                      <TableRow 
                        className="bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => toggleGroup(category)}
                      >
                        <TableCell colSpan={4} className="font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <ChevronDown 
                              className={cn(
                                "w-4 h-4 transition-transform", 
                                collapsedGroups.has(category) && "rotate-180"
                              )} 
                            />
                            {category} ({(items as any[]).length} items)
                          </div>
                        </TableCell>
                      </TableRow>
                      <Collapsible open={!collapsedGroups.has(category)}>
                        <CollapsibleContent>
                          {(items as any[]).map((item, index) => (
                            <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                              <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                              <TableCell className="text-slate-600">{item.category}</TableCell>
                              <TableCell className="font-semibold text-slate-900">
                                {getMetricValue(item, tab)}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => onRowClick?.(item)}
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-blue-50 font-semibold">
                            <TableCell colSpan={2} className="text-blue-800">
                              {category} Subtotal
                            </TableCell>
                            <TableCell className="text-blue-800">
                              {tab === 'grossRevenue' || tab === 'netRevenue' || tab === 'vat' || tab === 'atv' || tab === 'auv' || tab === 'asv' 
                                ? formatCurrency((items as any[]).reduce((sum, item) => sum + (item[tab] || 0), 0))
                                : tab === 'upt'
                                ? ((items as any[]).reduce((sum, item) => sum + (item[tab] || 0), 0) / (items as any[]).length).toFixed(1)
                                : formatNumber((items as any[]).reduce((sum, item) => sum + (item[tab] || 0), 0))
                              }
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </Collapsible>
                    </React.Fragment>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                    <TableCell className="font-bold">
                      {tab === 'grossRevenue' || tab === 'netRevenue' || tab === 'vat' || tab === 'atv' || tab === 'auv' || tab === 'asv'
                        ? formatCurrency(totals[tab] || 0)
                        : tab === 'upt'
                        ? ((totals[tab] || 0) / Math.max(1, Object.keys(groupedData).length)).toFixed(1)
                        : formatNumber(totals[tab] || 0)
                      }
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  const renderMonthlyTable = () => {
    const metricTabs = ['grossRevenue', 'netRevenue', 'vat', 'atv', 'auv', 'asv', 'units', 'upt'];
    
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-6">
          {metricTabs.map(tab => (
            <TabsTrigger key={tab} value={tab} className="text-xs">
              {tab === 'grossRevenue' ? 'Gross Rev' :
               tab === 'netRevenue' ? 'Net Rev' :
               tab === 'vat' ? 'VAT' :
               tab === 'atv' ? 'ATV' :
               tab === 'auv' ? 'AUV' :
               tab === 'asv' ? 'ASV' :
               tab === 'units' ? 'Units' :
               tab === 'upt' ? 'UPT' : tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {metricTabs.map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="rounded-lg border border-slate-200 overflow-x-auto shadow-sm">
              <Table className="min-w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <TableHead className="font-semibold text-slate-700 w-48 min-w-48">Product</TableHead>
                    <TableHead className="font-semibold text-slate-700 w-32 min-w-32">Category</TableHead>
                    {monthYears.map(month => (
                      <TableHead key={month} className="font-semibold text-slate-700 text-center w-24 min-w-24">
                        {month}
                      </TableHead>
                    ))}
                    <TableHead className="font-semibold text-slate-700 text-center w-24 min-w-24 bg-green-50 border-l-2 border-green-200">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedData).map(([category, items]) => (
                    <React.Fragment key={category}>
                      <TableRow 
                        className="bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => toggleGroup(category)}
                      >
                        <TableCell colSpan={monthYears.length + 3} className="font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <ChevronDown 
                              className={cn(
                                "w-4 h-4 transition-transform", 
                                collapsedGroups.has(category) && "rotate-180"
                              )} 
                            />
                            {category} ({(items as any[]).length} products)
                          </div>
                        </TableCell>
                      </TableRow>
                      <Collapsible open={!collapsedGroups.has(category)}>
                        <CollapsibleContent>
                          {(items as any[]).map((item, index) => {
                            const rowTotal = monthYears.reduce((sum, month) => sum + (item[`${month}_${tab}`] || 0), 0);
                            return (
                              <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-medium text-slate-900 truncate">{item.name}</TableCell>
                                <TableCell className="text-slate-600 truncate">{item.category}</TableCell>
                                {monthYears.map(month => (
                                  <TableCell key={month} className="text-center text-sm">
                                    {getMetricValue(item, tab, month)}
                                  </TableCell>
                                ))}
                                <TableCell className="font-semibold text-center bg-green-50 border-l-2 border-green-200">
                                  {tab === 'grossRevenue' || tab === 'netRevenue' || tab === 'vat' || tab === 'atv' || tab === 'auv' || tab === 'asv'
                                    ? formatCurrency(rowTotal)
                                    : tab === 'upt'
                                    ? (rowTotal / monthYears.length).toFixed(1)
                                    : formatNumber(rowTotal)
                                  }
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-blue-50 font-semibold">
                            <TableCell colSpan={2} className="text-blue-800">
                              {category} Subtotal
                            </TableCell>
                            {monthYears.map(month => {
                              const subtotal = (items as any[]).reduce((sum, item) => sum + (item[`${month}_${tab}`] || 0), 0);
                              return (
                                <TableCell key={month} className="text-center text-blue-800 text-sm">
                                  {tab === 'grossRevenue' || tab === 'netRevenue' || tab === 'vat' || tab === 'atv' || tab === 'auv' || tab === 'asv'
                                    ? formatCurrency(subtotal)
                                    : tab === 'upt'
                                    ? (subtotal / (items as any[]).length).toFixed(1)
                                    : formatNumber(subtotal)
                                  }
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-blue-800 text-center bg-green-50 border-l-2 border-green-200 font-semibold">
                              {tab === 'grossRevenue' || tab === 'netRevenue' || tab === 'vat' || tab === 'atv' || tab === 'auv' || tab === 'asv'
                                ? formatCurrency((items as any[]).reduce((sum, item) => {
                                    const itemTotal = monthYears.reduce((s, month) => s + (item[`${month}_${tab}`] || 0), 0);
                                    return sum + itemTotal;
                                  }, 0))
                                : tab === 'upt'
                                ? ((items as any[]).reduce((sum, item) => {
                                    const itemTotal = monthYears.reduce((s, month) => s + (item[`${month}_${tab}`] || 0), 0);
                                    return sum + itemTotal;
                                  }, 0) / ((items as any[]).length * monthYears.length)).toFixed(1)
                                : formatNumber((items as any[]).reduce((sum, item) => {
                                    const itemTotal = monthYears.reduce((s, month) => s + (item[`${month}_${tab}`] || 0), 0);
                                    return sum + itemTotal;
                                  }, 0))
                              }
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </Collapsible>
                    </React.Fragment>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                    {monthYears.map(month => (
                      <TableCell key={month} className="font-bold text-center text-sm">
                        {tab === 'grossRevenue' || tab === 'netRevenue' || tab === 'vat' || tab === 'atv' || tab === 'auv' || tab === 'asv'
                          ? formatCurrency(totals[`${month}_${tab}`] || 0)
                          : tab === 'upt'
                          ? ((totals[`${month}_${tab}`] || 0) / Math.max(1, (processedData as any[]).length)).toFixed(1)
                          : formatNumber(totals[`${month}_${tab}`] || 0)
                        }
                      </TableCell>
                    ))}
                    <TableCell className="font-bold text-center bg-green-50 border-l-2 border-green-200">
                      {tab === 'grossRevenue' || tab === 'netRevenue' || tab === 'vat' || tab === 'atv' || tab === 'auv' || tab === 'asv'
                        ? formatCurrency(monthYears.reduce((sum, month) => sum + (totals[`${month}_${tab}`] || 0), 0))
                        : tab === 'upt'
                        ? (monthYears.reduce((sum, month) => sum + (totals[`${month}_${tab}`] || 0), 0) / Math.max(1, (processedData as any[]).length * monthYears.length)).toFixed(1)
                        : formatNumber(monthYears.reduce((sum, month) => sum + (totals[`${month}_${tab}`] || 0), 0))
                      }
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  const renderYoYTable = () => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">
            Year-on-Year Growth Analysis ({lastYear} vs {currentYear})
          </h3>
          <p className="text-sm text-slate-600">
            Comparison Period: {lastYear} vs {currentYear}
          </p>
        </div>
        
        <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm max-h-96 overflow-y-auto">
          <Table className="table-fixed">
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                <TableHead className="font-semibold text-slate-700 w-48">Name</TableHead>
                <TableHead className="font-semibold text-slate-700 w-24">Type</TableHead>
                <TableHead className="font-semibold text-slate-700 w-32">{currentYear} Revenue</TableHead>
                <TableHead className="font-semibold text-slate-700 w-32">{lastYear} Revenue</TableHead>
                <TableHead className="font-semibold text-slate-700 w-32">Revenue Growth</TableHead>
                <TableHead className="font-semibold text-slate-700 w-32">{currentYear} Transactions</TableHead>
                <TableHead className="font-semibold text-slate-700 w-32">{lastYear} Transactions</TableHead>
                <TableHead className="font-semibold text-slate-700 w-32">Transaction Growth</TableHead>
                <TableHead className="font-semibold text-slate-700 w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(currentData as any[]).map((item, index) => (
                <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900 truncate">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">{formatCurrency(item.currentYearRevenue)}</TableCell>
                  <TableCell className="text-slate-600">{formatCurrency(item.lastYearRevenue)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.revenueGrowth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={cn(
                        "font-semibold",
                        item.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatPercentage(item.revenueGrowth)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">{formatNumber(item.currentYearTransactions)}</TableCell>
                  <TableCell className="text-slate-600">{formatNumber(item.lastYearTransactions)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.transactionGrowth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={cn(
                        "font-semibold",
                        item.transactionGrowth >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatPercentage(item.transactionGrowth)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onRowClick?.(item)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <TableCell colSpan={2} className="font-bold">Total</TableCell>
                <TableCell className="font-bold">{formatCurrency(totals.currentYearRevenue || 0)}</TableCell>
                <TableCell className="font-bold">{formatCurrency(totals.lastYearRevenue || 0)}</TableCell>
                <TableCell className="font-bold">
                  {totals.lastYearRevenue > 0 
                    ? formatPercentage(((totals.currentYearRevenue - totals.lastYearRevenue) / totals.lastYearRevenue) * 100)
                    : '0%'
                  }
                </TableCell>
                <TableCell className="font-bold">{formatNumber(totals.currentYearTransactions || 0)}</TableCell>
                <TableCell className="font-bold">{formatNumber(totals.lastYearTransactions || 0)}</TableCell>
                <TableCell className="font-bold">
                  {totals.lastYearTransactions > 0 
                    ? formatPercentage(((totals.currentYearTransactions - totals.lastYearTransactions) / totals.lastYearTransactions) * 100)
                    : '0%'
                  }
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditingSummary(!editingSummary)}>
              <Edit3 className="w-4 h-4 mr-1" />
              {editingSummary ? 'Cancel' : 'Edit Summary'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {editingSummary ? (
          <div className="mt-4 space-y-2">
            <Textarea 
              value={customSummary}
              onChange={(e) => setCustomSummary(e.target.value)}
              placeholder="Enter custom summary for this table..."
              className="min-h-20"
            />
            <Button onClick={saveCustomSummary} size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save Summary
            </Button>
          </div>
        ) : customSummary ? (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">{customSummary}</p>
          </div>
        ) : null}

        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Array.from(new Set(processedData.map((item: any) => item.category))).map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {type === 'monthly' ? renderMonthlyTable() : 
         type === 'yoy-analysis' ? renderYoYTable() : 
         renderStandardTable()}

        {type === 'yoy-analysis' && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
