
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { NewClientFilterOptions, NewClientData } from '@/types/dashboard';

interface NewClientFilterSectionProps {
  filters: NewClientFilterOptions;
  onFiltersChange: (filters: NewClientFilterOptions) => void;
  data: NewClientData[];
}

export const NewClientFilterSection: React.FC<NewClientFilterSectionProps> = ({
  filters,
  onFiltersChange,
  data,
}) => {
  const getUniqueValues = (field: keyof NewClientData) => {
    return [...new Set(data.map(item => String(item[field])).filter(Boolean))].sort();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location.length) count += filters.location.length;
    if (filters.trainer.length) count += filters.trainer.length;
    if (filters.retentionStatus.length) count += filters.retentionStatus.length;
    if (filters.conversionStatus.length) count += filters.conversionStatus.length;
    return count;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          New Client Filters
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary">{getActiveFiltersCount()} active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Visit Location</label>
            <Select 
              value={filters.location[0] || ''} 
              onValueChange={(value) => onFiltersChange({ ...filters, location: value ? [value] : [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All locations</SelectItem>
                {getUniqueValues('firstVisitLocation').map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Trainer</label>
            <Select 
              value={filters.trainer[0] || ''} 
              onValueChange={(value) => onFiltersChange({ ...filters, trainer: value ? [value] : [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All trainers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All trainers</SelectItem>
                {getUniqueValues('trainerName').map(trainer => (
                  <SelectItem key={trainer} value={trainer}>{trainer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Retention Status</label>
            <Select 
              value={filters.retentionStatus[0] || ''} 
              onValueChange={(value) => onFiltersChange({ ...filters, retentionStatus: value ? [value] : [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {getUniqueValues('retentionStatus').map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Conversion Status</label>
            <Select 
              value={filters.conversionStatus[0] || ''} 
              onValueChange={(value) => onFiltersChange({ ...filters, conversionStatus: value ? [value] : [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {getUniqueValues('conversionStatus').map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
