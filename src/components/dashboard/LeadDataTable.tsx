
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface LeadDataTableProps {
  title: string;
  data: LeadsData[];
  onRowClick?: (lead: LeadsData) => void;
}

export const LeadDataTable: React.FC<LeadDataTableProps> = ({ title, data, onRowClick }) => {
  const [sortField, setSortField] = useState<keyof LeadsData>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: keyof LeadsData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Calculate totals
  const totals = {
    totalLeads: data.length,
    totalTrialsCompleted: data.filter(item => item.stage === 'Trial Completed').length,
    totalConversions: data.filter(item => item.conversionStatus === 'Converted').length,
    totalLTV: data.reduce((sum, item) => sum + item.ltv, 0),
    totalVisits: data.reduce((sum, item) => sum + item.visits, 0),
    totalPurchases: data.reduce((sum, item) => sum + item.purchasesMade, 0),
  };

  const SortIcon = ({ field }: { field: keyof LeadsData }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string, type: 'trial' | 'conversion' | 'retention') => {
    const colors = {
      trial: {
        'Completed': 'bg-green-100 text-green-800',
        'Scheduled': 'bg-blue-100 text-blue-800',
        'Not Tried': 'bg-gray-100 text-gray-800',
      },
      conversion: {
        'Converted': 'bg-green-100 text-green-800',
        'Not Converted': 'bg-red-100 text-red-800',
      },
      retention: {
        'Retained': 'bg-green-100 text-green-800',
        'Churned': 'bg-red-100 text-red-800',
        'At Risk': 'bg-yellow-100 text-yellow-800',
      }
    };

    const colorClass = colors[type][status as keyof typeof colors[typeof type]] || 'bg-gray-100 text-gray-800';
    
    return (
      <Badge className={`${colorClass} border-0`}>
        {status}
      </Badge>
    );
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800">{title}</CardTitle>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {formatNumber(data.length)} Total Leads
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">
                <TableHead 
                  className="cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-2">
                    Lead ID <SortIcon field="id" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSort('fullName')}
                >
                  <div className="flex items-center gap-2">
                    Full Name <SortIcon field="fullName" />
                  </div>
                </TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center gap-2">
                    Source <SortIcon field="source" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSort('stage')}
                >
                  <div className="flex items-center gap-2">
                    Stage <SortIcon field="stage" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSort('associate')}
                >
                  <div className="flex items-center gap-2">
                    Associate <SortIcon field="associate" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Created Date <SortIcon field="createdAt" />
                  </div>
                </TableHead>
                <TableHead>Trial Status</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-blue-100 transition-colors text-right"
                  onClick={() => handleSort('ltv')}
                >
                  <div className="flex items-center justify-end gap-2">
                    LTV <SortIcon field="ltv" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-blue-100 transition-colors text-right"
                  onClick={() => handleSort('visits')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Visits <SortIcon field="visits" />
                  </div>
                </TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((lead, index) => (
                <TableRow 
                  key={lead.id} 
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                  onClick={() => onRowClick?.(lead)}
                >
                  <TableCell className="font-mono text-sm">{lead.id}</TableCell>
                  <TableCell className="font-medium">{lead.fullName || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{lead.phone || 'N/A'}</div>
                      <div className="text-xs text-gray-600">{lead.email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {lead.source || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {lead.stage || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.associate || 'N/A'}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.trialStatus || 'Not Tried', 'trial')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.conversionStatus || 'Not Converted', 'conversion')}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(lead.ltv)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(lead.visits)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Totals Row */}
              <TableRow className="bg-gradient-to-r from-slate-100 to-slate-200 font-bold border-t-2 border-slate-300">
                <TableCell className="font-bold">TOTALS</TableCell>
                <TableCell className="font-bold">{formatNumber(totals.totalLeads)} Leads</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Badge className="bg-blue-600 text-white">
                    {formatNumber(totals.totalTrialsCompleted)} Trials
                  </Badge>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-white">
                    {formatNumber(totals.totalConversions)} Converted
                  </Badge>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-right font-bold text-green-700">
                  {formatCurrency(totals.totalLTV)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatNumber(totals.totalVisits)}
                </TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} leads
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
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
