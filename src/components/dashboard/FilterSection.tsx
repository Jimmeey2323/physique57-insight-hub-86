
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Filter, RefreshCw, Calendar as CalendarIcon, User, CreditCard, Package, MapPin, X } from 'lucide-react';
import { FilterOptions } from '@/types/dashboard';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterSectionProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

const LOCATION_OPTIONS = [
  'Kwality House, Kemps Corner',
  'Supreme HQ, Bandra',
  'Kenkere House'
];

const CATEGORY_OPTIONS = [
  'membership',
  'class-packages',
  'personal-training',
  'merchandise'
];

const PAYMENT_METHOD_OPTIONS = [
  'pos',
  'online',
  'multiple',
  'cash',
  'card'
];

const SOLD_BY_OPTIONS = [
  'akshay-rane',
  'priya-sharma',
  'rahul-mehta'
];

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.dateRange.start ? new Date(filters.dateRange.start) : new Date('2025-03-01')
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.dateRange.end ? new Date(filters.dateRange.end) : new Date('2025-05-31')
  );

  const [selectedLocations, setSelectedLocations] = useState<string[]>(filters.location || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.category || []);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(filters.paymentMethod || []);
  const [selectedSoldBy, setSelectedSoldBy] = useState<string[]>(filters.soldBy || []);

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        start: date ? format(date, 'yyyy-MM-dd') : ''
      }
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        end: date ? format(date, 'yyyy-MM-dd') : ''
      }
    });
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const newLocations = checked 
      ? [...selectedLocations, location]
      : selectedLocations.filter(l => l !== location);
    
    setSelectedLocations(newLocations);
    onFiltersChange({
      ...filters,
      location: newLocations
    });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    
    setSelectedCategories(newCategories);
    onFiltersChange({
      ...filters,
      category: newCategories
    });
  };

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const newMethods = checked 
      ? [...selectedPaymentMethods, method]
      : selectedPaymentMethods.filter(m => m !== method);
    
    setSelectedPaymentMethods(newMethods);
    onFiltersChange({
      ...filters,
      paymentMethod: newMethods
    });
  };

  const handleSoldByChange = (soldBy: string, checked: boolean) => {
    const newSoldBy = checked 
      ? [...selectedSoldBy, soldBy]
      : selectedSoldBy.filter(s => s !== soldBy);
    
    setSelectedSoldBy(newSoldBy);
    onFiltersChange({
      ...filters,
      soldBy: newSoldBy
    });
  };

  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case 'location':
        handleLocationChange(value, false);
        break;
      case 'category':
        handleCategoryChange(value, false);
        break;
      case 'paymentMethod':
        handlePaymentMethodChange(value, false);
        break;
      case 'soldBy':
        handleSoldByChange(value, false);
        break;
    }
  };

  const applyQuickFilter = (type: string) => {
    const today = new Date();
    let start: Date, end: Date;

    switch (type) {
      case 'today':
        start = end = today;
        break;
      case 'week':
        start = new Date(today.setDate(today.getDate() - 7));
        end = new Date();
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'high-value':
        // This would filter for transactions above ₹10,000
        break;
      case 'memberships':
        setSelectedCategories(['membership']);
        onFiltersChange({
          ...filters,
          category: ['membership']
        });
        return;
      case 'new-customers':
        // This would filter for first-time customers
        break;
      default:
        return;
    }

    if (type !== 'high-value' && type !== 'new-customers') {
      setStartDate(start);
      setEndDate(end);
      onFiltersChange({
        ...filters,
        dateRange: {
          start: format(start, 'yyyy-MM-dd'),
          end: format(end, 'yyyy-MM-dd')
        }
      });
    }
  };

  const MultiSelectDropdown = ({ 
    label, 
    icon, 
    options, 
    selectedValues, 
    onSelectionChange, 
    placeholder,
    colorClass 
  }: {
    label: string;
    icon: React.ReactNode;
    options: string[];
    selectedValues: string[];
    onSelectionChange: (value: string, checked: boolean) => void;
    placeholder: string;
    colorClass: string;
  }) => (
    <div className="space-y-2">
      <Label className={`flex items-center gap-2 font-semibold text-slate-700`}>
        {icon}
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-left font-normal bg-white border-slate-200",
              colorClass
            )}
          >
            <span className="truncate">
              {selectedValues.length > 0 
                ? `${selectedValues.length} selected`
                : placeholder
              }
            </span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 space-y-2">
            <div className="text-sm font-medium text-slate-900 mb-3">{label}</div>
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => onSelectionChange(option, checked as boolean)}
                />
                <Label
                  htmlFor={option}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {option.replace(/-/g, ' ')}
                </Label>
              </div>
            ))}
            {selectedValues.length > 0 && (
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedValues.forEach(value => onSelectionChange(value, false));
                  }}
                  className="w-full"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Selected filters display */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map((value) => (
            <Badge key={value} variant="secondary" className="text-xs">
              {value.replace(/-/g, ' ')}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                onClick={() => onSelectionChange(value, false)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="mb-6 bg-gradient-to-r from-white via-slate-50/50 to-white border-0 shadow-xl">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-300 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                    Advanced Filters & Analytics Controls
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Default Period: 01/03/2025 - 31/05/2025
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Active filters indicator */}
                {(selectedLocations.length + selectedCategories.length + selectedPaymentMethods.length + selectedSoldBy.length) > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {selectedLocations.length + selectedCategories.length + selectedPaymentMethods.length + selectedSoldBy.length} active
                  </Badge>
                )}
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {isOpen ? 'Hide Filters' : 'Show Filters'}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-600 transition-transform" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600 transition-transform" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 bg-gradient-to-br from-slate-50/30 to-white">
            <div className="space-y-6">
              {/* Date Range Filters with Calendar Popover */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-semibold text-slate-700">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white border-slate-200",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateChange}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-semibold text-slate-700">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white border-slate-200",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateChange}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-amount" className="font-semibold text-slate-700">
                    Min Amount (₹)
                  </Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="0"
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Multi-Select Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MultiSelectDropdown
                  label="Location"
                  icon={<MapPin className="w-4 h-4 text-red-600" />}
                  options={LOCATION_OPTIONS}
                  selectedValues={selectedLocations}
                  onSelectionChange={handleLocationChange}
                  placeholder="All Locations"
                  colorClass="focus:border-red-500"
                />
                
                <MultiSelectDropdown
                  label="Product Category"
                  icon={<Package className="w-4 h-4 text-purple-600" />}
                  options={CATEGORY_OPTIONS}
                  selectedValues={selectedCategories}
                  onSelectionChange={handleCategoryChange}
                  placeholder="All Categories"
                  colorClass="focus:border-purple-500"
                />
                
                <MultiSelectDropdown
                  label="Payment Method"
                  icon={<CreditCard className="w-4 h-4 text-green-600" />}
                  options={PAYMENT_METHOD_OPTIONS}
                  selectedValues={selectedPaymentMethods}
                  onSelectionChange={handlePaymentMethodChange}
                  placeholder="All Methods"
                  colorClass="focus:border-green-500"
                />
                
                <MultiSelectDropdown
                  label="Sales Representative"
                  icon={<User className="w-4 h-4 text-orange-600" />}
                  options={SOLD_BY_OPTIONS}
                  selectedValues={selectedSoldBy}
                  onSelectionChange={handleSoldByChange}
                  placeholder="All Staff"
                  colorClass="focus:border-orange-500"
                />
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 w-full mb-2">Quick Filters:</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => applyQuickFilter('today')}
                >
                  Today's Sales
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  onClick={() => applyQuickFilter('week')}
                >
                  This Week
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  onClick={() => applyQuickFilter('month')}
                >
                  This Month
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                  onClick={() => applyQuickFilter('high-value')}
                >
                  High Value (₹10K+)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  onClick={() => applyQuickFilter('memberships')}
                >
                  Memberships Only
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                  onClick={() => applyQuickFilter('new-customers')}
                >
                  New Customers
                </Button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  Active filters will apply to all tables, charts, and metrics
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedLocations([]);
                      setSelectedCategories([]);
                      setSelectedPaymentMethods([]);
                      setSelectedSoldBy([]);
                      onReset();
                    }} 
                    className="gap-2 hover:bg-slate-100 border-slate-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset All Filters
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2 shadow-lg">
                    <Filter className="w-4 h-4" />
                    Apply Advanced Filters
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
