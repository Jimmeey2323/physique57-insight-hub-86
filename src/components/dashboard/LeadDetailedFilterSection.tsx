
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Filter, X, Calendar as CalendarIcon, ChevronDown, Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useLeads } from '@/contexts/LeadContext';

export const LeadDetailedFilterSection: React.FC = () => {
  const { filters, setFilters, options } = useLeads();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeFiltersCount = 
    filters.source.length + 
    filters.stage.length + 
    filters.status.length + 
    filters.associate.length + 
    filters.center.length +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0);

  const clearAllFilters = () => {
    setFilters({
      source: [],
      stage: [],
      status: [],
      associate: [],
      center: [],
      dateRange: { start: null, end: null }
    });
    setSearchTerm('');
  };

  const removeFilter = (type: keyof typeof filters, value: string) => {
    if (type === 'dateRange') {
      setFilters({
        ...filters,
        dateRange: { start: null, end: null }
      });
      return;
    }

    setFilters({
      ...filters,
      [type]: filters[type as keyof Omit<typeof filters, 'dateRange'>].filter((item: string) => item !== value)
    });
  };

  const toggleFilter = (type: keyof typeof filters, value: string) => {
    if (type === 'dateRange') return;

    const currentValues = filters[type as keyof Omit<typeof filters, 'dateRange'>];
    const isSelected = currentValues.includes(value);

    setFilters({
      ...filters,
      [type]: isSelected 
        ? currentValues.filter((item: string) => item !== value)
        : [...currentValues, value]
    });
  };

  const filterOptions = [
    { key: 'source', label: 'Lead Sources', options: options.sourceOptions, color: 'bg-blue-100 text-blue-800' },
    { key: 'stage', label: 'Lead Stages', options: options.stageOptions, color: 'bg-green-100 text-green-800' },
    { key: 'status', label: 'Lead Status', options: options.statusOptions, color: 'bg-purple-100 text-purple-800' },
    { key: 'associate', label: 'Associates', options: options.associateOptions, color: 'bg-orange-100 text-orange-800' },
    { key: 'center', label: 'Centers', options: options.centerOptions, color: 'bg-pink-100 text-pink-800' }
  ];

  const filteredOptions = (options: string[]) => 
    options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-gray-800">Advanced Filters</CardTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {activeFiltersCount} active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFilters();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 p-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search filters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Date Range</Label>
              <div className="flex gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.start ? format(filters.dateRange.start, 'PPP') : 'Start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.start || undefined}
                      onSelect={(date) => setFilters({
                        ...filters,
                        dateRange: { ...filters.dateRange, start: date || null }
                      })}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.end ? format(filters.dateRange.end, 'PPP') : 'End date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.end || undefined}
                      onSelect={(date) => setFilters({
                        ...filters,
                        dateRange: { ...filters.dateRange, end: date || null }
                      })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Multi-Select Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterOptions.map((filterGroup) => (
                <div key={filterGroup.key} className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">{filterGroup.label}</Label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {filteredOptions(filterGroup.options).map((option) => (
                      <div key={option} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={filters[filterGroup.key as keyof typeof filters].includes(option)}
                            onChange={() => toggleFilter(filterGroup.key as keyof typeof filters, option)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700 truncate">{option}</span>
                        </label>
                      </div>
                    ))}
                    {filteredOptions(filterGroup.options).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">No options found</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Label className="text-sm font-medium text-gray-700">Active Filters</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.dateRange.start && (
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                      Date: {format(filters.dateRange.start, 'MMM dd')} - {filters.dateRange.end ? format(filters.dateRange.end, 'MMM dd') : 'ongoing'}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => removeFilter('dateRange', '')} 
                      />
                    </Badge>
                  )}
                  
                  {filterOptions.map((filterGroup) => 
                    filters[filterGroup.key as keyof typeof filters].map((value: string) => (
                      <Badge key={`${filterGroup.key}-${value}`} variant="secondary" className={filterGroup.color}>
                        {filterGroup.label.slice(0, -1)}: {value}
                        <X 
                          className="w-3 h-3 ml-1 cursor-pointer" 
                          onClick={() => removeFilter(filterGroup.key as keyof typeof filters, value)} 
                        />
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
