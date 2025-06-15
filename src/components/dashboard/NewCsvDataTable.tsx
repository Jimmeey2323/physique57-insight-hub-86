import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, FileSpreadsheet, Download, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CsvRow {
  [key: string]: string;
}

export const NewCsvDataTable: React.FC = () => {
  const [data, setData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  useEffect(() => {
    const fetchCsvData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/New.csv');
        if (!response.ok) {
          throw new Error('Failed to fetch CSV file');
        }
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            if (results.errors.length > 0) {
              console.error('CSV parsing errors:', results.errors);
            }
            const parsedData = results.data as CsvRow[];
            const csvHeaders = results.meta.fields || [];
            setData(parsedData);
            setHeaders(csvHeaders);
            setError(null);
          },
          error: error => {
            console.error('CSV parsing error:', error);
            setError('Failed to parse CSV file');
          }
        });
      } catch (err) {
        console.error('Error fetching CSV:', err);
        setError('Failed to load CSV file');
      } finally {
        setLoading(false);
      }
    };
    fetchCsvData();
  }, []);

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row => 
      Object.values(row).some(value => 
        value?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getCellValue = (value: string) => {
    if (!value) return '-';

    // Check if it's a number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Format currency if it looks like a currency value
      if (value.includes('$') || numValue > 1000) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(numValue);
      }
      // Format regular numbers
      return numValue.toLocaleString();
    }

    // Check if it's a date
    const dateValue = new Date(value);
    if (!isNaN(dateValue.getTime()) && value.includes('-')) {
      return dateValue.toLocaleDateString();
    }
    return value;
  };

  const getCellClassName = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (numValue > 0) return 'text-green-600 font-semibold';
      if (numValue < 0) return 'text-red-600 font-semibold';
    }

    // Status-based styling
    if (value?.toLowerCase().includes('converted')) return 'text-green-600 font-medium';
    if (value?.toLowerCase().includes('retained')) return 'text-blue-600 font-medium';
    if (value?.toLowerCase().includes('lost')) return 'text-red-600 font-medium';
    return 'text-slate-700';
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium text-slate-700">Loading CSV data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="text-center py-12">
          <div className="text-red-600 font-medium">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-xl border-0 overflow-hidden">
      {/* Enhanced Header */}
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">
              Client Data Analysis
            </CardTitle>
          </div>
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            {filteredData.length} records
          </Badge>
        </div>
        
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                {headers.map((header, index) => (
                  <TableHead 
                    key={index} 
                    className="font-bold text-slate-700 py-4 px-6 text-sm uppercase tracking-wide sticky top-0 bg-slate-50"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  className="hover:bg-slate-50/50 transition-colors duration-200 border-b border-slate-100"
                >
                  {headers.map((header, cellIndex) => (
                    <TableCell 
                      key={cellIndex} 
                      className={cn(
                        "py-4 px-6 text-sm",
                        getCellClassName(row[header])
                      )}
                    >
                      {getCellValue(row[header])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200">
            <div className="text-sm text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{' '}
              <span className="font-bold text-slate-800">{filteredData.length}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1}
                className="hover:bg-blue-50 border-blue-200"
              >
                Previous
              </Button>
              <span className="text-sm font-bold px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md shadow-sm">
                {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages}
                className="hover:bg-blue-50 border-blue-200"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
