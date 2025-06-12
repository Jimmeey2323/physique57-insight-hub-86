import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ArrowUpDown, Eye, Download, Filter, Search, TrendingUp, TrendingDown, ChevronDown, Edit, Save, X } from 'lucide-react';
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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [quickFilter, setQuickFilter] = useState('all');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const itemsPerPage = 10;

  // Initialize all groups as collapsed by default
  useState(() => {
    const allCategories = [...new Set(data.map(item => item.cleanedCategory || 'Uncategorized'))];
    setCollapsedGroups(new Set(allCategories));
  });

  // Helper function to safely parse dates
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    const formats = [
      new Date(dateString),
      new Date(dateString.split('/').reverse().join('-')),
      new Date(dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'))
    ];

    for (const date of formats) {
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  };

  const processedData = useMemo(() => {
    let filteredData = data;

    if (type === 'monthly') {
      const products = [...new Set(filteredData.map(item => item.cleanedProduct))].filter(Boolean);
      const monthYears = [...new Set(filteredData.map(item => {
        const date = parseDate(item.paymentDate);
        if (!date) return null;
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }).filter(Boolean))].sort();

      return products.map(product => {
        const productData = filteredData.filter(item => item.cleanedProduct === product);
        const category = productData[0]?.cleanedCategory || 'Uncategorized';
        const row: any = { 
          name: product, 
          category: category,
          detailData: productData 
        };
        
        monthYears.forEach(monthYear => {
          const [year, month] = monthYear!.split('-');
          const monthData = productData.filter(item => {
            const date = parseDate(item.paymentDate);
            if (!date) return false;
            return date.getFullYear() === parseInt(year) && 
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
          const units = monthData.length;

          row[`${monthName}_grossRevenue`] = grossRevenue;
          row[`${monthName}_vat`] = vat;
          row[`${monthName}_netRevenue`] = grossRevenue - vat;
          row[`${monthName}_transactions`] = transactions;
          row[`${monthName}_uniqueMembers`] = uniqueMembers;
          row[`${monthName}_units`] = units;
          row[`${monthName}_atv`] = transactions > 0 ? grossRevenue / transactions : 0;
          row[`${monthName}_auv`] = units > 0 ? grossRevenue / units : 0;
          row[`${monthName}_asv`] = uniqueMembers > 0 ? grossRevenue / uniqueMembers : 0;
          row[`${monthName}_upt`] = transactions > 0 ? units / transactions : 0;
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

          const currentVat = currentYearData.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
          const lastVat = lastYearData.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
          const currentMembers = new Set(currentYearData.map(item => item.memberId)).size;
          const lastMembers = new Set(lastYearData.map(item => item.memberId)).size;

          const category = groupKey === 'cleanedProduct' ? 
            (currentYearData[0] || lastYearData[0])?.cleanedCategory || 'Uncategorized' :
            groupKey === 'cleanedCategory' ? group as string : 'Other';

          return {
            name: group as string,
            category: category,
            currentYearRevenue: currentRevenue,
            lastYearRevenue: lastRevenue,
            revenueGrowth: growth,
            currentYearTransactions: currentTransactions,
            lastYearTransactions: lastTransactions,
            transactionGrowth: transactionGrowth,
            currentYearVat: currentVat,
            lastYearVat: lastVat,
            currentYearMembers: currentMembers,
            lastYearMembers: lastMembers,
            currentYearUnits: currentYearData.length,
            lastYearUnits: lastYearData.length,
            type: groupKey,
            detailData: [...currentYearData, ...lastYearData]
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
            category: item.cleanedCategory || 'Uncategorized',
            grossRevenue: 0,
            vat: 0,
            netRevenue: 0,
            unitsSold: 0,
            transactions: 0,
            uniqueMembers: new Set(),
            detailData: []
          };
        }
        acc[key].grossRevenue += item.paymentValue || 0;
        acc[key].vat += item.paymentVAT || 0;
        acc[key].netRevenue += (item.paymentValue || 0) - (item.paymentVAT || 0);
        acc[key].unitsSold += 1;
        acc[key].transactions += 1;
        acc[key].uniqueMembers.add(item.memberId);
        acc[key].detailData.push(item);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => ({
        ...item,
        uniqueMembers: item.uniqueMembers.size,
        atv: item.transactions > 0 ? item.grossRevenue / item.transactions : 0,
        auv: item.unitsSold > 0 ? item.grossRevenue / item.unitsSold : 0,
        asv: item.uniqueMembers > 0 ? item.grossRevenue / item.uniqueMembers : 0,
        upt: item.transactions > 0 ? item.unitsSold / item.transactions : 0
      }));
    }
    
    if (type === 'category') {
      const grouped = filteredData.reduce((acc, item) => {
        const key = item.cleanedCategory;
        if (!acc[key]) {
          acc[key] = {
            name: key,
            category: key || 'Uncategorized',
            grossRevenue: 0,
            vat: 0,
            netRevenue: 0,
            unitsSold: 0,
            transactions: 0,
            uniqueMembers: new Set(),
            detailData: []
          };
        }
        acc[key].grossRevenue += item.paymentValue || 0;
        acc[key].vat += item.paymentVAT || 0;
        acc[key].netRevenue += (item.paymentValue || 0) - (item.paymentVAT || 0);
        acc[key].unitsSold += 1;
        acc[key].transactions += 1;
        acc[key].uniqueMembers.add(item.memberId);
        acc[key].detailData.push(item);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => ({
        ...item,
        uniqueMembers: item.uniqueMembers.size,
        atv: item.transactions > 0 ? item.grossRevenue / item.transactions : 0,
        auv: item.unitsSold > 0 ? item.grossRevenue / item.unitsSold : 0,
        asv: item.uniqueMembers > 0 ? item.grossRevenue / item.uniqueMembers : 0,
        upt: item.transactions > 0 ? item.unitsSold / item.transactions : 0
      }));
    }

    return [];
  }, [data, type]);

  // Group data by category for collapsible rows
  const groupedData = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    processedData.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    return groups;
  }, [processedData]);

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
    const groups = { ...groupedData };

    if (searchTerm) {
      Object.keys(groups).forEach(category => {
        groups[category] = groups[category].filter(item => 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (groups[category].length === 0) {
          delete groups[category];
        }
      });
    }

    if (filterCategory !== 'all') {
      Object.keys(groups).forEach(category => {
        if (category.toLowerCase() !== filterCategory.toLowerCase()) {
          delete groups[category];
        }
      });
    }

    // Apply quick filters
    if (quickFilter !== 'all') {
      Object.keys(groups).forEach(category => {
        groups[category] = groups[category].filter(item => {
          switch (quickFilter) {
            case 'high-performers':
              return (item.grossRevenue || item.currentYearRevenue || 0) > 10000;
            case 'growth':
              return (item.revenueGrowth || 0) > 0;
            case 'decline':
              return (item.revenueGrowth || 0) < 0;
            default:
              return true;
          }
        });
        if (groups[category].length === 0) {
          delete groups[category];
        }
      });
    }

    return groups;
  }, [groupedData, searchTerm, filterCategory, quickFilter]);

  const toggleGroup = (category: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedGroups(newCollapsed);
  };

  const calculateGroupTotals = (groupItems: any[]) => {
    if (type === 'monthly') {
      const totals: any = {};
      monthYears.forEach(month => {
        totals[`${month}_grossRevenue`] = groupItems.reduce((sum, item) => sum + (item[`${month}_grossRevenue`] || 0), 0);
        totals[`${month}_netRevenue`] = groupItems.reduce((sum, item) => sum + (item[`${month}_netRevenue`] || 0), 0);
        totals[`${month}_vat`] = groupItems.reduce((sum, item) => sum + (item[`${month}_vat`] || 0), 0);
        totals[`${month}_transactions`] = groupItems.reduce((sum, item) => sum + (item[`${month}_transactions`] || 0), 0);
        totals[`${month}_uniqueMembers`] = groupItems.reduce((sum, item) => sum + (item[`${month}_uniqueMembers`] || 0), 0);
        totals[`${month}_units`] = groupItems.reduce((sum, item) => sum + (item[`${month}_units`] || 0), 0);
      });
      return totals;
    }

    if (type === 'yoy-analysis') {
      return {
        currentYearRevenue: groupItems.reduce((sum, item) => sum + (item.currentYearRevenue || 0), 0),
        lastYearRevenue: groupItems.reduce((sum, item) => sum + (item.lastYearRevenue || 0), 0),
        currentYearTransactions: groupItems.reduce((sum, item) => sum + (item.currentYearTransactions || 0), 0),
        lastYearTransactions: groupItems.reduce((sum, item) => sum + (item.lastYearTransactions || 0), 0),
        currentYearVat: groupItems.reduce((sum, item) => sum + (item.currentYearVat || 0), 0),
        lastYearVat: groupItems.reduce((sum, item) => sum + (item.lastYearVat || 0), 0),
        currentYearMembers: groupItems.reduce((sum, item) => sum + (item.currentYearMembers || 0), 0),
        lastYearMembers: groupItems.reduce((sum, item) => sum + (item.lastYearMembers || 0), 0),
        currentYearUnits: groupItems.reduce((sum, item) => sum + (item.currentYearUnits || 0), 0),
        lastYearUnits: groupItems.reduce((sum, item) => sum + (item.lastYearUnits || 0), 0)
      };
    }

    const totalGrossRevenue = groupItems.reduce((sum, item) => sum + (item.grossRevenue || 0), 0);
    const totalTransactions = groupItems.reduce((sum, item) => sum + (item.transactions || 0), 0);
    const totalUnits = groupItems.reduce((sum, item) => sum + (item.unitsSold || 0), 0);
    const totalMembers = groupItems.reduce((sum, item) => sum + (item.uniqueMembers || 0), 0);

    return {
      grossRevenue: totalGrossRevenue,
      netRevenue: groupItems.reduce((sum, item) => sum + (item.netRevenue || 0), 0),
      vat: groupItems.reduce((sum, item) => sum + (item.vat || 0), 0),
      unitsSold: totalUnits,
      transactions: totalTransactions,
      uniqueMembers: totalMembers,
      atv: totalTransactions > 0 ? totalGrossRevenue / totalTransactions : 0,
      auv: totalUnits > 0 ? totalGrossRevenue / totalUnits : 0,
      asv: totalMembers > 0 ? totalGrossRevenue / totalMembers : 0,
      upt: totalTransactions > 0 ? totalUnits / totalTransactions : 0
    };
  };

  const handleRowClick = (row: any) => {
    if (onRowClick && row.detailData) {
      onRowClick({
        ...row,
        detailData: row.detailData,
        type: type
      });
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const saveSummaryEdit = () => {
    localStorage.setItem(`table-summary-${type}`, editedSummary);
    setIsEditingSummary(false);
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
          <TabsList className="grid w-full grid-cols-8 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-1">
            <TabsTrigger value="grossRevenue" className="text-xs font-semibold">Gross Revenue</TabsTrigger>
            <TabsTrigger value="netRevenue" className="text-xs font-semibold">Net Revenue</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs font-semibold">Transactions</TabsTrigger>
            <TabsTrigger value="uniqueMembers" className="text-xs font-semibold">Members</TabsTrigger>
            <TabsTrigger value="atv" className="text-xs font-semibold">ATV</TabsTrigger>
            <TabsTrigger value="asv" className="text-xs font-semibold">ASV</TabsTrigger>
            <TabsTrigger value="auv" className="text-xs font-semibold">AUV</TabsTrigger>
            <TabsTrigger value="upt" className="text-xs font-semibold">UPT</TabsTrigger>
          </TabsList>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <TableRow className="bg-gradient-to-r from-slate-100/80 via-white to-slate-100/80 border-b-2 border-slate-200/50">
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
              {Object.entries(filteredAndSearchedData).map(([category, items]) => (
                <React.Fragment key={category}>
                  {/* Category Header Row */}
                  <TableRow className="bg-gradient-to-r from-blue-100/80 to-purple-100/80 border-y-2 border-blue-200/50">
                    <TableCell 
                      className="font-bold text-blue-800 sticky left-0 bg-blue-100/90 backdrop-blur-sm border-r-2 border-blue-200/50 cursor-pointer"
                      onClick={() => toggleGroup(category)}
                    >
                      <div className="flex items-center gap-2">
                        {collapsedGroups.has(category) ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {category} ({items.length} items)
                      </div>
                    </TableCell>
                    {monthYears.map(month => {
                      const totals = calculateGroupTotals(items);
                      return (
                        <TableCell key={month} className="text-center font-bold text-blue-700 border-r border-slate-200/30 min-w-[120px]">
                          {activeTab === 'grossRevenue' && formatCurrency(totals[`${month}_grossRevenue`] || 0)}
                          {activeTab === 'netRevenue' && formatCurrency(totals[`${month}_netRevenue`] || 0)}
                          {activeTab === 'transactions' && formatNumber(totals[`${month}_transactions`] || 0)}
                          {activeTab === 'uniqueMembers' && formatNumber(totals[`${month}_uniqueMembers`] || 0)}
                          {(activeTab === 'atv' || activeTab === 'asv' || activeTab === 'auv' || activeTab === 'upt') && '-'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  
                  {/* Product Rows */}
                  <Collapsible open={!collapsedGroups.has(category)}>
                    <CollapsibleContent>
                      {items.map((row, index) => (
                        <TableRow 
                          key={index} 
                          className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 cursor-pointer transition-all duration-300 border-b border-slate-200/30"
                          onClick={() => handleRowClick(row)}
                        >
                          <TableCell className="font-semibold text-slate-800 sticky left-0 bg-white/90 backdrop-blur-sm border-r-2 border-slate-200/50 text-sm min-w-[200px]">
                              {/* Remove the div with pl-8 and just use a normal cell */}
                          </TableCell>
                          {monthYears.map(month => (
                            <TableCell key={month} className="text-center font-medium text-sm border-r border-slate-200/20 min-w-[120px]">
                              {activeTab === 'grossRevenue' && formatCurrency(row[`${month}_grossRevenue`] || 0)}
                              {activeTab === 'netRevenue' && formatCurrency(row[`${month}_netRevenue`] || 0)}
                              {activeTab === 'transactions' && formatNumber(row[`${month}_transactions`] || 0)}
                              {activeTab === 'uniqueMembers' && formatNumber(row[`${month}_uniqueMembers`] || 0)}
                              {activeTab === 'atv' && formatCurrency(row[`${month}_atv`] || 0)}
                              {activeTab === 'asv' && formatCurrency(row[`${month}_asv`] || 0)}
                              {activeTab === 'auv' && formatCurrency(row[`${month}_auv`] || 0)}
                              {activeTab === 'upt' && (row[`${month}_upt`] || 0).toFixed(2)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </React.Fragment>
              ))}
            </TableBody>
            <TableFooter className="sticky bottom-0 bg-white/95 backdrop-blur-sm z-10">
              <TableRow className="bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-blue-50/80 font-bold border-t-3 border-slate-300">
                <TableCell className="font-bold text-slate-800 sticky left-0 bg-blue-50/90 backdrop-blur-sm border-r-2 border-slate-200/50 min-w-[200px]">OVERALL TOTALS</TableCell>
                {monthYears.map(month => {
                  const allItems = Object.values(filteredAndSearchedData).flat();
                  const totals = calculateGroupTotals(allItems);
                  return (
                    <TableCell key={month} className="text-center font-bold text-blue-700 border-r border-slate-200/30 min-w-[120px]">
                      {activeTab === 'grossRevenue' && formatCurrency(totals[`${month}_grossRevenue`] || 0)}
                      {activeTab === 'netRevenue' && formatCurrency(totals[`${month}_netRevenue`] || 0)}
                      {activeTab === 'transactions' && formatNumber(totals[`${month}_transactions`] || 0)}
                      {activeTab === 'uniqueMembers' && formatNumber(totals[`${month}_uniqueMembers`] || 0)}
                      {(activeTab === 'atv' || activeTab === 'asv' || activeTab === 'auv' || activeTab === 'upt') && '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Tabs>
    </div>
  );

  const renderYoYTable = () => (
    <div className="rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-white via-slate-50/30 to-white shadow-2xl overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            <TableRow className="bg-gradient-to-r from-slate-100/80 via-white to-slate-100/80 border-b-2 border-slate-200/50">
              <TableHead className="font-bold text-slate-800 min-w-[200px]">Name</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[140px]">Current Year Revenue</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[140px]">Last Year Revenue</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[120px]">Revenue Growth</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[130px]">Current Transactions</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[130px]">Last Transactions</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[140px]">Transaction Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(filteredAndSearchedData).map(([category, items]) => (
              <React.Fragment key={category}>
                {/* Category Header Row */}
                <TableRow className="bg-gradient-to-r from-blue-100/80 to-purple-100/80 border-y-2 border-blue-200/50">
                  <TableCell 
                    className="font-bold text-blue-800 cursor-pointer min-w-[200px]"
                    onClick={() => toggleGroup(category)}
                  >
                    <div className="flex items-center gap-2">
                      {collapsedGroups.has(category) ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {category} ({items.length} items)
                    </div>
                  </TableCell>
                  {/* Group totals */}
                  {(() => {
                    const totals = calculateGroupTotals(items);
                    const revenueGrowth = totals.lastYearRevenue > 0 ? 
                      ((totals.currentYearRevenue - totals.lastYearRevenue) / totals.lastYearRevenue) * 100 : 0;
                    const transactionGrowth = totals.lastYearTransactions > 0 ? 
                      ((totals.currentYearTransactions - totals.lastYearTransactions) / totals.lastYearTransactions) * 100 : 0;
                    
                    return (
                      <>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[140px]">{formatCurrency(totals.currentYearRevenue)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[140px]">{formatCurrency(totals.lastYearRevenue)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[120px]">{formatPercentage(revenueGrowth)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[130px]">{formatNumber(totals.currentYearTransactions)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[130px]">{formatNumber(totals.lastYearTransactions)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[140px]">{formatPercentage(transactionGrowth)}</TableCell>
                      </>
                    );
                  })()}
                </TableRow>
                
                {/* Individual Rows */}
                <Collapsible open={!collapsedGroups.has(category)}>
                  <CollapsibleContent>
                    {items.map((row, index) => (
                      <TableRow 
                        key={index} 
                        className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 cursor-pointer transition-all duration-300 border-b border-slate-200/30"
                        onClick={() => handleRowClick(row)}
                      >
                        <TableCell className="font-semibold text-slate-800 min-w-[200px]">
                            {/* Remove the div with pl-8 and just use a normal cell */}
                        </TableCell>
                        <TableCell className="text-center font-medium min-w-[140px]">{formatCurrency(row.currentYearRevenue)}</TableCell>
                        <TableCell className="text-center min-w-[140px]">{formatCurrency(row.lastYearRevenue)}</TableCell>
                        <TableCell className="text-center min-w-[120px]">
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
                        <TableCell className="text-center min-w-[130px]">{formatNumber(row.currentYearTransactions)}</TableCell>
                        <TableCell className="text-center min-w-[130px]">{formatNumber(row.lastYearTransactions)}</TableCell>
                        <TableCell className="text-center min-w-[140px]">
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
                  </CollapsibleContent>
                </Collapsible>
              </React.Fragment>
            ))}
          </TableBody>
          <TableFooter className="sticky bottom-0 bg-white/95 backdrop-blur-sm z-10">
            <TableRow className="bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-blue-50/80 font-bold border-t-3 border-slate-300">
              <TableCell className="font-bold text-slate-800 min-w-[200px]">OVERALL TOTALS</TableCell>
              {(() => {
                const allItems = Object.values(filteredAndSearchedData).flat();
                const totals = calculateGroupTotals(allItems);
                const revenueGrowth = totals.lastYearRevenue > 0 ? 
                  ((totals.currentYearRevenue - totals.lastYearRevenue) / totals.lastYearRevenue) * 100 : 0;
                const transactionGrowth = totals.lastYearTransactions > 0 ? 
                  ((totals.currentYearTransactions - totals.lastYearTransactions) / totals.lastYearTransactions) * 100 : 0;
                
                return (
                  <>
                    <TableCell className="text-center font-bold text-blue-700 min-w-[140px]">{formatCurrency(totals.currentYearRevenue)}</TableCell>
                    <TableCell className="text-center font-bold text-blue-700 min-w-[140px]">{formatCurrency(totals.lastYearRevenue)}</TableCell>
                    <TableCell className="text-center font-bold text-blue-700 min-w-[120px]">{formatPercentage(revenueGrowth)}</TableCell>
                    <TableCell className="text-center font-bold text-blue-700 min-w-[130px]">{formatNumber(totals.currentYearTransactions)}</TableCell>
                    <TableCell className="text-center font-bold text-blue-700 min-w-[130px]">{formatNumber(totals.lastYearTransactions)}</TableCell>
                    <TableCell className="text-center font-bold text-blue-700 min-w-[140px]">{formatPercentage(transactionGrowth)}</TableCell>
                  </>
                );
              })()}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );

  const renderStandardTable = () => (
    <div className="rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-white via-slate-50/30 to-white shadow-2xl overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            <TableRow className="bg-gradient-to-r from-slate-100/80 via-white to-slate-100/80 border-b-2 border-slate-200/50">
              <TableHead className="font-bold text-slate-800 min-w-[200px]">Name</TableHead>
              <TableHead className="text-center font-bold text-slate-700 cursor-pointer min-w-[120px]" onClick={() => handleSort('grossRevenue')}>
                <div className="flex items-center justify-center gap-1">
                  Gross Revenue <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[100px]">VAT</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[120px]">Net Revenue</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[80px]">Units</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[100px]">Transactions</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[100px]">Members</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[80px]">ATV</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[80px]">AUV</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[80px]">ASV</TableHead>
              <TableHead className="text-center font-bold text-slate-700 min-w-[80px]">UPT</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(filteredAndSearchedData).map(([category, items]) => (
              <React.Fragment key={category}>
                {/* Category Header Row */}
                <TableRow className="bg-gradient-to-r from-blue-100/80 to-purple-100/80 border-y-2 border-blue-200/50">
                  <TableCell 
                    className="font-bold text-blue-800 cursor-pointer min-w-[200px]"
                    onClick={() => toggleGroup(category)}
                  >
                    <div className="flex items-center gap-2">
                      {collapsedGroups.has(category) ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {category} ({items.length} items)
                    </div>
                  </TableCell>
                  {/* Group totals */}
                  {(() => {
                    const totals = calculateGroupTotals(items);
                    return (
                      <>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[120px]">{formatCurrency(totals.grossRevenue)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[100px]">{formatCurrency(totals.vat)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[120px]">{formatCurrency(totals.netRevenue)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[80px]">{formatNumber(totals.unitsSold)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[100px]">{formatNumber(totals.transactions)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[100px]">{formatNumber(totals.uniqueMembers)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[80px]">{formatCurrency(totals.atv)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[80px]">{formatCurrency(totals.auv)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[80px]">{formatCurrency(totals.asv)}</TableCell>
                        <TableCell className="text-center font-bold text-blue-700 min-w-[80px]">{totals.upt.toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                      </>
                    );
                  })()}
                </TableRow>
                
                {/* Individual Rows */}
                <Collapsible open={!collapsedGroups.has(category)}>
                  <CollapsibleContent>
                    {items.map((row, index) => (
                      <TableRow 
                        key={index} 
                        className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 cursor-pointer transition-all duration-300 border-b border-slate-200/30"
                        onClick={() => handleRowClick(row)}
                      >
                        <TableCell className="font-semibold text-slate-800 min-w-[200px]">
                            {/* Remove the div with pl-8 and just use a normal cell */}
                        </TableCell>
                        <TableCell className="text-center font-medium min-w-[120px]">{formatCurrency(row.grossRevenue || 0)}</TableCell>
                        <TableCell className="text-center min-w-[100px]">{formatCurrency(row.vat || 0)}</TableCell>
                        <TableCell className="text-center font-medium min-w-[120px]">{formatCurrency(row.netRevenue || 0)}</TableCell>
                        <TableCell className="text-center min-w-[80px]">{formatNumber(row.unitsSold || 0)}</TableCell>
                        <TableCell className="text-center min-w-[100px]">{formatNumber(row.transactions || 0)}</TableCell>
                        <TableCell className="text-center min-w-[100px]">{formatNumber(row.uniqueMembers || 0)}</TableCell>
                        <TableCell className="text-center min-w-[80px]">{formatCurrency(row.atv || 0)}</TableCell>
                        <TableCell className="text-center min-w-[80px]">{formatCurrency(row.auv || 0)}</TableCell>
                        <TableCell className="text-center min-w-[80px]">{formatCurrency(row.asv || 0)}</TableCell>
                        <TableCell className="text-center min-w-[80px]">{(row.upt || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleRowClick(row)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </React.Fragment>
            ))}
          </TableBody>
          <TableFooter className="sticky bottom-0 bg-white/95 backdrop-blur-sm z-10">
            <TableRow className="bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-blue-50/80 font-bold border-t-3 border-slate-300">
              <TableCell className="font-bold text-slate-800 min-w-[200px]">TOTALS</TableCell>
              {(() => {
                const allItems = Object.values(filteredAndSearchedData).flat();
                const totals = calculateGroupTotals(allItems);
                return (
                  <>
                    <TableCell className="text-center font-bold text-blue-700 min-w-[120px]">{formatCurrency(totals.grossRevenue)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-700 min-w-[100px]">{formatCurrency(totals.vat)}</TableCell>
                    <TableCell className="text-center font-bold text-green-700 min-w-[120px]">{formatCurrency(totals.netRevenue)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-700 min-w-[80px]">{formatNumber(totals.unitsSold)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-700 min-w-[100px]">{formatNumber(totals.transactions)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-700 min-w-[100px]">{formatNumber(totals.uniqueMembers)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-700 min-w-[80px]">{formatCurrency(totals.atv)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-700 min-w-[80px]">{formatCurrency(totals.auv)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-700 min-w-[80px]">{formatCurrency(totals.asv)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-700 min-w-[80px]">{totals.upt.toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </>
                );
              })()}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuickFilter('all')} className={cn("transition-all", quickFilter === 'all' && "bg-blue-100")}>
                All
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickFilter('high-performers')} className={cn("transition-all", quickFilter === 'high-performers' && "bg-blue-100")}>
                High Performers
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickFilter('growth')} className={cn("transition-all", quickFilter === 'growth' && "bg-green-100")}>
                Growth
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickFilter('decline')} className={cn("transition-all", quickFilter === 'decline' && "bg-red-100")}>
                Decline
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4 items-center flex-wrap">
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
              <SelectItem value="personal-training">Personal Training</SelectItem>
              <SelectItem value="merchandise">Merchandise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        {type === 'monthly' ? renderMonthlyTable() : 
         type === 'yoy-analysis' ? renderYoYTable() : 
         renderStandardTable()}
        
        {/* Enhanced Summary Section with Edit Capability */}
        <div className="mt-8 p-8 bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-blue-50/80 rounded-2xl border-2 border-slate-200/50 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <Filter className="w-6 h-6 text-blue-600" />
              Advanced Business Intelligence Summary
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditingSummary) {
                  saveSummaryEdit();
                } else {
                  setIsEditingSummary(true);
                  const existingSummary = localStorage.getItem(`table-summary-${type}`) || 'Custom analysis notes...';
                  setEditedSummary(existingSummary);
                }
              }}
              className="gap-2"
            >
              {isEditingSummary ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditingSummary ? 'Save' : 'Edit Summary'}
            </Button>
          </div>

          {isEditingSummary ? (
            <div className="space-y-4">
              <textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="w-full h-32 p-4 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add your custom analysis and insights here..."
              />
              <div className="flex gap-2">
                <Button onClick={saveSummaryEdit} size="sm" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditingSummary(false)} size="sm" className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <h5 className="font-semibold text-slate-800 text-base mb-3">Performance Insights</h5>
                <ul className="text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Categories Analyzed:</strong> {Object.keys(filteredAndSearchedData).length} active categories with detailed breakdowns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Data Grouping:</strong> Organized by {type === 'monthly' ? 'monthly trends' : type === 'yoy-analysis' ? 'year-over-year performance' : 'product categories'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Interactive Features:</strong> Collapsible groups, drill-down capabilities, and real-time filtering</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h5 className="font-semibold text-slate-800 text-base mb-3">Analysis Notes</h5>
                <div className="text-slate-700 p-4 bg-white/50 rounded-lg border border-slate-200">
                  {localStorage.getItem(`table-summary-${type}`) || 'Click "Edit Summary" to add custom analysis notes and insights for this table.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
