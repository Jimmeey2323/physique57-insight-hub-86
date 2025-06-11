
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye, Download, Filter } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface DataTableProps {
  title: string;
  data: SalesData[];
  type: 'product' | 'category' | 'yearly' | 'comparison';
  onRowClick?: (row: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ title, data, type, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('this-month');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const processedData = useMemo(() => {
    if (type === 'product') {
      const grouped = data.reduce((acc, item) => {
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
      const grouped = data.reduce((acc, item) => {
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

    return [];
  }, [data, type]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = processedData.slice(startIndex, endIndex);

  const totals = useMemo(() => {
    return processedData.reduce((acc, item) => ({
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
  }, [processedData]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="this-month">This Month</TabsTrigger>
            <TabsTrigger value="last-month">Last Month</TabsTrigger>
            <TabsTrigger value="this-quarter">This Quarter</TabsTrigger>
            <TabsTrigger value="this-year">This Year</TabsTrigger>
            <TabsTrigger value="custom">Custom Range</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <div className="rounded-lg border bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => handleSort('grossRevenue')}>
                      <div className="flex items-center justify-center gap-1">
                        Gross Revenue <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">VAT</TableHead>
                    <TableHead className="text-center">Net Revenue</TableHead>
                    <TableHead className="text-center">Units Sold</TableHead>
                    <TableHead className="text-center">Transactions</TableHead>
                    <TableHead className="text-center">Unique Members</TableHead>
                    <TableHead className="text-center">ATV</TableHead>
                    <TableHead className="text-center">AUV</TableHead>
                    <TableHead className="text-center">ASV</TableHead>
                    <TableHead className="text-center">UPT</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((row, index) => (
                    <TableRow 
                      key={index} 
                      className="h-[25px] hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => onRowClick?.(row)}
                    >
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-center">{formatCurrency(row.grossRevenue)}</TableCell>
                      <TableCell className="text-center">{formatCurrency(row.vat)}</TableCell>
                      <TableCell className="text-center">{formatCurrency(row.netRevenue)}</TableCell>
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
                  <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-center">{formatCurrency(totals.grossRevenue)}</TableCell>
                    <TableCell className="text-center">{formatCurrency(totals.vat)}</TableCell>
                    <TableCell className="text-center">{formatCurrency(totals.netRevenue)}</TableCell>
                    <TableCell className="text-center">{formatNumber(totals.unitsSold)}</TableCell>
                    <TableCell className="text-center">{formatNumber(totals.transactions)}</TableCell>
                    <TableCell className="text-center">{formatNumber(totals.uniqueMembers)}</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1} to {Math.min(endIndex, processedData.length)} of {processedData.length} entries
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Key Insights</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Top performer generates {formatCurrency(Math.max(...processedData.map(d => d.grossRevenue)))} in gross revenue</li>
            <li>• Average transaction value across all items is {formatCurrency(totals.grossRevenue / totals.transactions)}</li>
            <li>• Total unique customers served: {formatNumber(totals.uniqueMembers)}</li>
            <li>• Overall conversion efficiency: {((totals.unitsSold / totals.transactions) * 100).toFixed(1)}% units per transaction</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
