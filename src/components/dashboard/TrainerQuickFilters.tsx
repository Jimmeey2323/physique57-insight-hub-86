
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Users, DollarSign, TrendingUp, Calendar, Star } from 'lucide-react';

interface TrainerQuickFiltersProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  trainerCount: number;
  totalRevenue: number;
  avgPerformance: number;
}

export const TrainerQuickFilters = ({ 
  activeFilters, 
  onFilterChange, 
  trainerCount,
  totalRevenue,
  avgPerformance 
}: TrainerQuickFiltersProps) => {
  const filterOptions = [
    { id: 'top-performers', label: 'Top Performers', icon: Star, color: 'bg-green-100 text-green-800 hover:bg-green-200' },
    { id: 'high-revenue', label: 'High Revenue', icon: DollarSign, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
    { id: 'high-conversion', label: 'High Conversion', icon: TrendingUp, color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
    { id: 'recent-joiners', label: 'Recent Joiners', icon: Calendar, color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
    { id: 'needs-attention', label: 'Needs Attention', icon: Users, color: 'bg-red-100 text-red-800 hover:bg-red-200' }
  ];

  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId];
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-xl p-6 border border-slate-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">Quick Filters</h3>
        </div>
        {activeFilters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-slate-600 hover:text-slate-800"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {filterOptions.map((filter) => {
          const IconComponent = filter.icon;
          const isActive = activeFilters.includes(filter.id);
          
          return (
            <Button
              key={filter.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(filter.id)}
              className={`${isActive ? 'bg-slate-800 text-white' : filter.color} transition-all duration-200 flex items-center gap-2`}
            >
              <IconComponent className="w-4 h-4" />
              {filter.label}
            </Button>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">{trainerCount}</div>
          <div className="text-sm text-slate-600">Active Trainers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">₹{(totalRevenue / 1000).toFixed(0)}K</div>
          <div className="text-sm text-slate-600">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">{avgPerformance.toFixed(1)}%</div>
          <div className="text-sm text-slate-600">Avg Performance</div>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-600">Active filters:</span>
            {activeFilters.map(filterId => {
              const filter = filterOptions.find(f => f.id === filterId);
              return (
                <Badge key={filterId} variant="secondary" className="text-xs">
                  {filter?.label}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
