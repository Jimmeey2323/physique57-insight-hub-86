
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SessionsQuickFiltersProps {
  filters: {
    locations: string[];
    trainers: string[];
    classes: string[];
    days: string[];
  };
  options: {
    locations: string[];
    trainers: string[];
    classes: string[];
    days: string[];
  };
  onFilterChange: (type: string, values: string[]) => void;
  onClearAll: () => void;
}

export const SessionsQuickFilters: React.FC<SessionsQuickFiltersProps> = ({
  filters,
  options,
  onFilterChange,
  onClearAll
}) => {
  const MultiSelectDropdown = ({ 
    label, 
    type, 
    values, 
    options: selectOptions 
  }: { 
    label: string; 
    type: string; 
    values: string[]; 
    options: string[] 
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 px-3 text-sm">
          {label} {values.length > 0 && <Badge variant="secondary" className="ml-2">{values.length}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-white shadow-lg border" align="start">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {selectOptions.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    const newValues = values.includes(option)
                      ? values.filter(v => v !== option)
                      : [...values, option];
                    onFilterChange(type, newValues);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 border border-gray-300 rounded ${
                      values.includes(option) ? 'bg-blue-600 border-blue-600' : ''
                    }`}>
                      {values.includes(option) && (
                        <div className="w-2 h-2 bg-white rounded-sm m-0.5" />
                      )}
                    </div>
                    <span className="text-sm">{option}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
        <MultiSelectDropdown 
          label="Locations" 
          type="locations" 
          values={filters.locations} 
          options={options.locations} 
        />
        <MultiSelectDropdown 
          label="Trainers" 
          type="trainers" 
          values={filters.trainers} 
          options={options.trainers} 
        />
        <MultiSelectDropdown 
          label="Classes" 
          type="classes" 
          values={filters.classes} 
          options={options.classes} 
        />
        <MultiSelectDropdown 
          label="Days" 
          type="days" 
          values={filters.days} 
          options={options.days} 
        />
      </div>
      
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-8 px-2 text-xs text-gray-500 hover:text-gray-700"
        >
          <X className="w-3 h-3 mr-1" />
          Clear All
        </Button>
      )}
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1 ml-2">
          {Object.entries(filters).map(([type, values]) =>
            values.map(value => (
              <Badge 
                key={`${type}-${value}`}
                variant="secondary" 
                className="text-xs cursor-pointer hover:bg-red-100"
                onClick={() => onFilterChange(type, filters[type as keyof typeof filters].filter(v => v !== value))}
              >
                {value}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))
          )}
        </div>
      )}
    </div>
  );
};
