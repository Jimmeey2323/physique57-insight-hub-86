
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Filter, RefreshCw, Calendar, User, CreditCard, Package } from 'lucide-react';
import { FilterOptions } from '@/types/dashboard';

interface FilterSectionProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedSoldBy, setSelectedSoldBy] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Set default date range on component mount
  useEffect(() => {
    if (!filters.dateRange.start && !filters.dateRange.end) {
      onFiltersChange({
        ...filters,
        dateRange: {
          start: '2025-03-01',
          end: '2025-05-31'
        }
      });
    }
  }, []);

  const handleQuickFilter = (type: string) => {
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    switch (type) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'high-value':
        setMinAmount('10000');
        break;
      case 'memberships':
        setSelectedCategory('membership');
        break;
    }

    if (startDate) {
      onFiltersChange({
        ...filters,
        dateRange: { start: startDate, end: endDate }
      });
    }
  };

  const applyFilters = () => {
    const newFilters = {
      ...filters,
      category: selectedCategory !== 'all' ? [selectedCategory] : [],
      paymentMethod: selectedPaymentMethod !== 'all' ? [selectedPaymentMethod] : [],
      soldBy: selectedSoldBy !== 'all' ? [selectedSoldBy] : [],
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
    };
    onFiltersChange(newFilters);
  };

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedPaymentMethod('all');
    setSelectedSoldBy('all');
    setMinAmount('');
    setMaxAmount('');
    onFiltersChange({
      dateRange: { start: '2025-03-01', end: '2025-05-31' },
      location: [],
      category: [],
      product: [],
      soldBy: [],
      paymentMethod: []
    });
    onReset();
  };

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
                    Active Period: {filters.dateRange.start || '2025-03-01'} to {filters.dateRange.end || '2025-05-31'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
              {/* Date Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="flex items-center gap-2 font-semibold text-slate-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={filters.dateRange.start || '2025-03-01'}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="flex items-center gap-2 font-semibold text-slate-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={filters.dateRange.end || '2025-05-31'}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-semibold text-slate-700">
                    <Package className="w-4 h-4 text-purple-600" />
                    Product Category
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white border-slate-200 focus:border-purple-500">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                      <SelectItem value="class-packages">Class Packages</SelectItem>
                      <SelectItem value="merchandise">Merchandise</SelectItem>
                      <SelectItem value="personal-training">Personal Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-semibold text-slate-700">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    Payment Method
                  </Label>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger className="bg-white border-slate-200 focus:border-green-500">
                      <SelectValue placeholder="All Methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="pos">POS Machine</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                      <SelectItem value="multiple">Multiple Methods</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-semibold text-slate-700">
                    <User className="w-4 h-4 text-orange-600" />
                    Sales Representative
                  </Label>
                  <Select value={selectedSoldBy} onValueChange={setSelectedSoldBy}>
                    <SelectTrigger className="bg-white border-slate-200 focus:border-orange-500">
                      <SelectValue placeholder="All Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      <SelectItem value="akshay-rane">Akshay Rane</SelectItem>
                      <SelectItem value="priya-sharma">Priya Sharma</SelectItem>
                      <SelectItem value="rahul-mehta">Rahul Mehta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-amount" className="font-semibold text-slate-700">
                    Min Amount (₹)
                  </Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-amount" className="font-semibold text-slate-700">
                    Max Amount (₹)
                  </Label>
                  <Input
                    id="max-amount"
                    type="number"
                    placeholder="999999"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">
                    Payment Status
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="succeeded">Succeeded</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 w-full mb-2">Quick Filters:</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickFilter('today')}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  Today's Sales
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickFilter('week')}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  This Week
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickFilter('month')}
                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                >
                  This Month
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickFilter('high-value')}
                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  High Value (₹10K+)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickFilter('memberships')}
                  className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                >
                  Memberships Only
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
                    onClick={resetAllFilters} 
                    className="gap-2 hover:bg-slate-100 border-slate-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset All Filters
                  </Button>
                  <Button 
                    onClick={applyFilters}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2 shadow-lg"
                  >
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
