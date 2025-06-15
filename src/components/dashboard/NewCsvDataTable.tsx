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
    return data.filter(row => Object.values(row).some(value => value?.toLowerCase().includes(searchTerm.toLowerCase())));
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
      if (numValue > 0) return 'text-green-600 font-medium';
      if (numValue < 0) return 'text-red-600 font-medium';
    }

    // Status-based styling
    if (value?.toLowerCase().includes('converted')) return 'text-green-600';
    if (value?.toLowerCase().includes('retained')) return 'text-blue-600';
    if (value?.toLowerCase().includes('lost')) return 'text-red-600';
    return '';
  };
  if (loading) {
    return <Card className="bg-white shadow-lg border-0">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading CSV data...</span>
          </div>
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card className="bg-white shadow-lg border-0">
        <CardContent className="text-center py-12">
          <div className="text-red-600 font-medium">{error}</div>
        </CardContent>
      </Card>;
  }
  return <Card className="bg-white shadow-xl border-0 overflow-hidden">
      

      <CardContent className="p-0">
        <div className="overflow-auto max-h-[600px]">
          
        </div>

        {/* Pagination */}
        {totalPages > 1 && <div className="flex items-center justify-between p-4 bg-slate-50 border-t">
            <div className="text-sm text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                Previous
              </Button>
              <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded">
                {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
          </div>}
      </CardContent>
    </Card>;
};