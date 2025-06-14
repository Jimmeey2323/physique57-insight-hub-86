
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FilterIcon, X } from 'lucide-react';
import { LeadsFilterOptions } from '@/types/leads';

interface LeadsFilterSectionProps {
  filters: LeadsFilterOptions;
  onFiltersChange: (filters: LeadsFilterOptions) => void;
  availableOptions: {
    locations: string[];
    sources: string[];
    stages: string[];
    statuses: string[];
    associates: string[];
    channels: string[];
    trialStatuses: string[];
    conversionStatuses: string[];
    retentionStatuses: string[];
  };
  isOpen: boolean;
  onToggle: () => void;
}

export const LeadsFilterSection: React.FC<LeadsFilterSectionProps> = ({
  filters,
  onFiltersChange,
  availableOptions,
  isOpen,
  onToggle
}) => {
  const updateFilters = (key: keyof LeadsFilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateArrayFilter = (key: keyof LeadsFilterOptions, value: string) => {
    const currentArray = filters[key] as string[];
    if (value === "all") {
      updateFilters(key, []);
    } else if (currentArray.includes(value)) {
      updateFilters(key, currentArray.filter(item => item !== value));
    } else {
      updateFilters(key, [...currentArray, value]);
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      location: [],
      source: [],
      stage: [],
      status: [],
      associate: [],
      channel: [],
      trialStatus: [],
      conversionStatus: [],
      retentionStatus: [],
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.location.length > 0) count++;
    if (filters.source.length > 0) count++;
    if (filters.stage.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.associate.length > 0) count++;
    if (filters.channel.length > 0) count++;
    if (filters.trialStatus.length > 0) count++;
    if (filters.conversionStatus.length > 0) count++;
    if (filters.retentionStatus.length > 0) count++;
    if (filters.minLTV) count++;
    if (filters.maxLTV) count++;
    return count;
  };

  if (!isOpen) {
    return (
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <FilterIcon className="w-4 h-4" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FilterIcon className="w-5 h-5" />
            Leads Analytics Filters
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
            <Button variant="outline" size="sm" onClick={onToggle}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => updateFilters('dateRange', { ...filters.dateRange, start: e.target.value })}
                className="text-xs"
              />
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => updateFilters('dateRange', { ...filters.dateRange, end: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location</Label>
            <Select onValueChange={(value) => updateArrayFilter('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder={`${filters.location.length} selected`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {availableOptions.locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Source</Label>
            <Select onValueChange={(value) => updateArrayFilter('source', value)}>
              <SelectTrigger>
                <SelectValue placeholder={`${filters.source.length} selected`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {availableOptions.sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Stage</Label>
            <Select onValueChange={(value) => updateArrayFilter('stage', value)}>
              <SelectTrigger>
                <SelectValue placeholder={`${filters.stage.length} selected`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {availableOptions.stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select onValueChange={(value) => updateArrayFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder={`${filters.status.length} selected`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {availableOptions.statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Associate */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Associate</Label>
            <Select onValueChange={(value) => updateArrayFilter('associate', value)}>
              <SelectTrigger>
                <SelectValue placeholder={`${filters.associate.length} selected`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Associates</SelectItem>
                {availableOptions.associates.map((associate) => (
                  <SelectItem key={associate} value={associate}>
                    {associate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* LTV Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">LTV Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minLTV || ''}
                onChange={(e) => updateFilters('minLTV', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="text-xs"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxLTV || ''}
                onChange={(e) => updateFilters('maxLTV', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Trial Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Trial Status</Label>
            <Select onValueChange={(value) => updateArrayFilter('trialStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder={`${filters.trialStatus.length} selected`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trial Statuses</SelectItem>
                {availableOptions.trialStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
