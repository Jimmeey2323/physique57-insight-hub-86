import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { SalesData, FilterOptions } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface DataTableProps {
  title: string;
  data: SalesData[] | any[];
  type: string;
  filters: FilterOptions | any;
  onRowClick?: (row: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({ title, data, type, filters, onRowClick }) => {
  const [sortColumn, setSortColumn] = useState<keyof SalesData | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnFilter, setColumnFilter] = useState("");
  const [rowSelection, setRowSelection] = React.useState({})

  const handleSort = (column: keyof SalesData) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const processData = () => {
    if (!Array.isArray(data) || data.length === 0) return [];

    let filteredData = [...data];

    if (filters && filters.dateRange) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      filteredData = filteredData.filter(item => {
        if (!item.paymentDate) return false;

        let itemDate: Date | null = null;
        const ddmmyyyy = item.paymentDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
          const [, day, month, year] = ddmmyyyy;
          itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          const formats = [
            new Date(item.paymentDate),
            new Date(item.paymentDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')),
            new Date(item.paymentDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'))
          ];

          for (const date of formats) {
            if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
              itemDate = date;
              break;
            }
          }
        }

        if (!itemDate || isNaN(itemDate.getTime())) return false;

        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;

        return true;
      });
    }

    if (sortColumn) {
      filteredData.sort((a: any, b: any) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === bValue) return 0;

        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    if (columnFilter) {
      filteredData = filteredData.filter((item: any) => {
        return Object.values(item).some(value =>
          String(value).toLowerCase().includes(columnFilter.toLowerCase())
        );
      });
    }

    switch (type) {
      case 'monthly':
        return processMonthlyData(filteredData);
      case 'product':
        return processProductData(filteredData);
      case 'category':
        return processCategoryData(filteredData);
      case 'yoy-analysis':
        return processYoYAnalysis(filteredData);
      default:
        return filteredData;
    }
  };

  const processMonthlyData = (filteredData: SalesData[]) => {
    const monthlyData: { [key: string]: { month: string; revenue: number; transactions: number } } = {};

    filteredData.forEach(item => {
      const date = new Date(item.paymentDate);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { month: monthYear, revenue: 0, transactions: 0 };
      }

      monthlyData[monthYear].revenue += item.paymentValue;
      monthlyData[monthYear].transactions += 1;
    });

    return Object.values(monthlyData);
  };

  const processProductData = (filteredData: SalesData[]) => {
    const productData: { [key: string]: { product: string; revenue: number; quantity: number } } = {};

    filteredData.forEach(item => {
      const product = item.cleanedProduct || 'Unknown Product';

      if (!productData[product]) {
        productData[product] = { product: product, revenue: 0, quantity: 0 };
      }

      productData[product].revenue += item.paymentValue;
      productData[product].quantity += 1;
    });

    return Object.values(productData);
  };

  const processCategoryData = (filteredData: SalesData[]) => {
    const categoryData: { [key: string]: { category: string; revenue: number; quantity: number } } = {};

    filteredData.forEach(item => {
      const category = item.cleanedCategory || 'Unknown Category';

      if (!categoryData[category]) {
        categoryData[category] = { category: category, revenue: 0, quantity: 0 };
      }

      categoryData[category].revenue += item.paymentValue;
      categoryData[category].quantity += 1;
    });

    return Object.values(categoryData);
  };

  const processYoYAnalysis = (filteredData: SalesData[]) => {
    const yoyData: { [key: string]: { year: string; revenue: number; } } = {};

    filteredData.forEach(item => {
      const date = new Date(item.paymentDate);
      const year = String(date.getFullYear());

      if (!yoyData[year]) {
        yoyData[year] = { year: year, revenue: 0 };
      }

      yoyData[year].revenue += item.paymentValue;
    });

    return Object.values(yoyData);
  };

  const renderTable = () => {
    switch (type) {
      case 'monthly':
        return (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                {['Month', 'Revenue', 'Transactions'].map(header => (
                  <TableHead key={header} className="text-white font-bold">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {processedData.map((row: any) => (
                <TableRow key={row.month} className="hover:bg-blue-50">
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell>{formatCurrency(row.revenue)}</TableCell>
                  <TableCell>{row.transactions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case 'product':
        return (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gradient-to-r from-blue-500 to-purple-600">
                {['Product', 'Revenue', 'Quantity'].map(header => (
                  <TableHead key={header} className="text-white font-bold">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {processedData.map((row: any) => (
                <TableRow key={row.product} className="hover:bg-blue-50">
                  <TableCell className="font-medium">{row.product}</TableCell>
                  <TableCell>{formatCurrency(row.revenue)}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case 'category':
        return (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gradient-to-r from-blue-500 to-purple-600">
                {['Category', 'Revenue', 'Quantity'].map(header => (
                  <TableHead key={header} className="text-white font-bold">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {processedData.map((row: any) => (
                <TableRow key={row.category} className="hover:bg-blue-50">
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell>{formatCurrency(row.revenue)}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case 'yoy-analysis':
        return (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gradient-to-r from-blue-500 to-purple-600">
                {['Year', 'Revenue'].map(header => (
                  <TableHead key={header} className="text-white font-bold">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {processedData.map((row: any) => (
                <TableRow key={row.year} className="hover:bg-blue-50">
                  <TableCell className="font-medium">{row.year}</TableCell>
                  <TableCell>{formatCurrency(row.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      default:
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Type Not Supported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>The data type provided is not supported for table rendering.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        );
    }
  };

  const processNewClientData = () => {
    if (!Array.isArray(data) || data.length === 0) return [];

    switch (type) {
      case 'member-detail':
        return data.slice(0, 50).map((item: any) => ({
          memberId: item.memberId || '',
          name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
          email: item.email || '',
          phone: item.phoneNumber || '',
          homeLocation: item.homeLocation || '',
          trainer: item.trainerName || '',
          ltv: item.ltv || 0,
          retentionStatus: item.retentionStatus || '',
          conversionStatus: item.conversionStatus || '',
          visitsPostTrial: item.visitsPostTrial || 0,
          paymentMethod: item.paymentMethod || ''
        }));

      case 'conversion-funnel':
        const totalTrials = data.length;
        const attended = data.filter((item: any) => item.visitsPostTrial > 0).length;
        const converted = data.filter((item: any) => item.membershipsBoughtPostTrial?.toLowerCase() === 'yes').length;
        const retained = data.filter((item: any) => 
          item.retentionStatus?.toLowerCase().includes('active') || 
          item.retentionStatus?.toLowerCase().includes('retained')
        ).length;

        return [
          { stage: 'Trial Signups', count: totalTrials, percentage: 100 },
          { stage: 'Attended Trial', count: attended, percentage: totalTrials > 0 ? (attended / totalTrials * 100) : 0 },
          { stage: 'Bought Membership', count: converted, percentage: attended > 0 ? (converted / attended * 100) : 0 },
          { stage: 'Retained', count: retained, percentage: converted > 0 ? (retained / converted * 100) : 0 }
        ];

      case 'location-analysis':
        const locationStats = data.reduce((acc: any, item: any) => {
          const location = item.firstVisitLocation || 'Unknown';
          if (!acc[location]) {
            acc[location] = {
              location,
              firstVisits: 0,
              conversions: 0,
              revenue: 0,
              members: new Set()
            };
          }
          acc[location].firstVisits += 1;
          acc[location].members.add(item.memberId);
          if (item.membershipsBoughtPostTrial?.toLowerCase() === 'yes') {
            acc[location].conversions += 1;
          }
          acc[location].revenue += item.ltv || 0;
          return acc;
        }, {});

        return Object.values(locationStats).map((stat: any) => ({
          location: stat.location,
          firstVisits: stat.firstVisits,
          conversions: stat.conversions,
          conversionRate: stat.firstVisits > 0 ? (stat.conversions / stat.firstVisits * 100) : 0,
          revenueGenerated: stat.revenue,
          uniqueMembers: stat.members.size
        }));

      case 'trainer-performance':
        const trainerStats = data.reduce((acc: any, item: any) => {
          const trainer = item.trainerName || 'Unknown';
          if (!acc[trainer]) {
            acc[trainer] = {
              trainer,
              totalClients: new Set(),
              totalVisits: 0,
              totalLTV: 0,
              conversions: 0
            };
          }
          acc[trainer].totalClients.add(item.memberId);
          acc[trainer].totalVisits += item.visitsPostTrial || 0;
          acc[trainer].totalLTV += item.ltv || 0;
          if (item.membershipsBoughtPostTrial?.toLowerCase() === 'yes') {
            acc[trainer].conversions += 1;
          }
          return acc;
        }, {});

        return Object.values(trainerStats).map((stat: any) => ({
          trainer: stat.trainer,
          totalClients: stat.totalClients.size,
          avgVisits: stat.totalClients.size > 0 ? (stat.totalVisits / stat.totalClients.size) : 0,
          avgLTV: stat.totalClients.size > 0 ? (stat.totalLTV / stat.totalClients.size) : 0,
          conversionRate: stat.totalClients.size > 0 ? (stat.conversions / stat.totalClients.size * 100) : 0,
          totalRevenue: stat.totalLTV
        }));

      case 'revenue-distribution':
        const paymentStats = data.reduce((acc: any, item: any) => {
          const method = item.paymentMethod || 'Unknown';
          if (!acc[method]) {
            acc[method] = {
              paymentMethod: method,
              totalRevenue: 0,
              memberCount: new Set(),
              totalLTV: 0
            };
          }
          acc[method].totalRevenue += item.ltv || 0;
          acc[method].memberCount.add(item.memberId);
          acc[method].totalLTV += item.ltv || 0;
          return acc;
        }, {});

        return Object.values(paymentStats).map((stat: any) => ({
          paymentMethod: stat.paymentMethod,
          totalRevenue: stat.totalRevenue,
          memberCount: stat.memberCount.size,
          avgLTV: stat.memberCount.size > 0 ? (stat.totalLTV / stat.memberCount.size) : 0
        }));

      default:
        return [];
    }
  };

  const processedData = useMemo(() => {
    if (['member-detail', 'conversion-funnel', 'location-analysis', 'trainer-performance', 'revenue-distribution'].includes(type)) {
      return processNewClientData();
    }
    return processData();
  }, [data, type, filters]);

  const renderNewClientTables = () => {
    switch (type) {
      case 'member-detail':
        return (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700">
                {['Member ID', 'Name', 'Email', 'Phone', 'Home Location', 'Trainer', 'LTV', 'Retention Status', 'Conversion Status'].map((header, index) => (
                  <TableHead key={header} className={cn("text-white font-bold", index === 0 && "sticky left-0 bg-gradient-to-r from-emerald-500 to-cyan-600 z-20")}>
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {processedData.map((row: any, index: number) => (
                <TableRow 
                  key={row.memberId}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="cursor-pointer hover:bg-emerald-50 transition-colors"
                >
                  <TableCell className="sticky left-0 bg-white z-10 font-medium">{row.memberId}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.homeLocation}</TableCell>
                  <TableCell>{row.trainer}</TableCell>
                  <TableCell>{formatCurrency(row.ltv)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      row.retentionStatus?.toLowerCase().includes('active') ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                      {row.retentionStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      row.conversionStatus?.toLowerCase().includes('new') ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                    )}>
                      {row.conversionStatus}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'conversion-funnel':
        return (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gradient-to-r from-emerald-500 to-cyan-600">
                {['Stage', 'Count', '% of Previous Stage'].map(header => (
                  <TableHead key={header} className="text-white font-bold">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {processedData.map((row: any, index: number) => (
                <TableRow key={row.stage} className="hover:bg-emerald-50">
                  <TableCell className="font-medium">{row.stage}</TableCell>
                  <TableCell>{formatNumber(row.count)}</TableCell>
                  <TableCell>{row.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'location-analysis':
        return (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gradient-to-r from-emerald-500 to-cyan-600">
                {['Location', 'First Visits', 'Conversions', 'Conversion Rate', 'Revenue Generated', 'Unique Members'].map(header => (
                  <TableHead key={header} className="text-white font-bold">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {processedData.map((row: any) => (
                <TableRow key={row.location} className="hover:bg-emerald-50">
                  <TableCell className="font-medium">{row.location}</TableCell>
                  <TableCell>{formatNumber(row.firstVisits)}</TableCell>
                  <TableCell>{formatNumber(row.conversions)}</TableCell>
                  <TableCell>{row.conversionRate.toFixed(1)}%</TableCell>
                  <TableCell>{formatCurrency(row.revenueGenerated)}</TableCell>
                  <TableCell>{formatNumber(row.uniqueMembers)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'trainer-performance':
        return (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gradient-to-r from-emerald-500 to-cyan-600">
                {['Trainer', 'Total Clients', 'Avg. Visits', 'Avg. LTV', 'Conversion Rate', 'Total Revenue'].map(header => (
                  <TableHead key={header} className="text-white font-bold">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {processedData.map((row: any) => (
                <TableRow key={row.trainer} className="hover:bg-emerald-50">
                  <TableCell className="font-medium">{row.trainer}</TableCell>
                  <TableCell>{formatNumber(row.totalClients)}</TableCell>
                  <TableCell>{row.avgVisits.toFixed(1)}</TableCell>
                  <TableCell>{formatCurrency(row.avgLTV)}</TableCell>
                  <TableCell>{row.conversionRate.toFixed(1)}%</TableCell>
                  <TableCell>{formatCurrency(row.totalRevenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'revenue-distribution':
        return (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-gradient-to-r from-emerald-500 to-cyan-600">
                {['Payment Method', 'Total Revenue', 'Member Count', 'Avg LTV'].map(header => (
                  <TableHead key={header} className="text-white font-bold">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {processedData.map((row: any) => (
                <TableRow key={row.paymentMethod} className="hover:bg-emerald-50">
                  <TableCell className="font-medium">{row.paymentMethod}</TableCell>
                  <TableCell>{formatCurrency(row.totalRevenue)}</TableCell>
                  <TableCell>{formatNumber(row.memberCount)}</TableCell>
                  <TableCell>{formatCurrency(row.avgLTV)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      
      default:
        return <div>Table type not implemented</div>;
    }
  };

  return (
    <Card className="overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
        {/* <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter..."
            value={columnFilter}
            onChange={(e) => setColumnFilter(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[600px] relative">
          {['member-detail', 'conversion-funnel', 'location-analysis', 'trainer-performance', 'revenue-distribution'].includes(type) 
            ? renderNewClientTables() 
            : renderTable()
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTable;
