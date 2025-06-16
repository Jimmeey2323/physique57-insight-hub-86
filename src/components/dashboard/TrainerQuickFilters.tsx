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
  const filterOptions = [{
    id: 'top-performers',
    label: 'Top Performers',
    icon: Star,
    color: 'bg-green-100 text-green-800 hover:bg-green-200'
  }, {
    id: 'high-revenue',
    label: 'High Revenue',
    icon: DollarSign,
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  }, {
    id: 'high-conversion',
    label: 'High Conversion',
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
  }, {
    id: 'recent-joiners',
    label: 'Recent Joiners',
    icon: Calendar,
    color: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
  }, {
    id: 'needs-attention',
    label: 'Needs Attention',
    icon: Users,
    color: 'bg-red-100 text-red-800 hover:bg-red-200'
  }];
  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId) ? activeFilters.filter(f => f !== filterId) : [...activeFilters, filterId];
    onFilterChange(newFilters);
  };
  const clearAllFilters = () => {
    onFilterChange([]);
  };
  return;
};