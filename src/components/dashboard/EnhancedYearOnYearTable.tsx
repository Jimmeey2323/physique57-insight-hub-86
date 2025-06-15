
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, ChevronRight, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface EnhancedYearOnYearTableProps {
  data: Record<string, Record<string, number>>;
  months: string[];
  trainers: string[];
  activeMetric: string;
  onTrainerClick: (trainer: string, data: any) => void;
  collapsedGroups?: Set<string>;
  onGroupToggle?: (groupKey: string) => void;
}

export const EnhancedYearOnYearTable: React.FC<EnhancedYearOnYearTableProps> = ({
  data,
  months,
  trainers,
  activeMetric,
  onTrainerClick,
  collapsedGroups = new Set(),
  onGroupToggle
}) => {
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Get trainer avatar URL
  const getTrainerAvatar = (trainerName: string) => {
    const hash = trainerName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const avatarId = Math.abs(hash) % 3;
    const avatarUrls = [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1501286353178-1ec881214838?w=150&h=150&fit=crop&crop=face'
    ];
    return avatarUrls[avatarId];
  };

  // Group trainers by department/category
  const groupedTrainers = useMemo(() => {
    const groups: Record<string, string[]> = {
      'Senior Trainers': [],
      'Junior Trainers': [],
      'Freelance Trainers': [],
      'Other Staff': []
    };

    trainers.forEach(trainer => {
      // Simple grouping logic - can be enhanced based on actual trainer data
      const totalRevenue = months.reduce((sum, month) => sum + (data[trainer]?.[month] || 0), 0);
      
      if (totalRevenue > 100000) {
        groups['Senior Trainers'].push(trainer);
      } else if (totalRevenue > 50000) {
        groups['Junior Trainers'].push(trainer);
      } else if (totalRevenue > 10000) {
        groups['Freelance Trainers'].push(trainer);
      } else {
        groups['Other Staff'].push(trainer);
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }, [trainers, data, months]);

  // Process data for year-on-year comparison
  const yearOnYearData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    // Group months by year
    const monthsByYear = months.reduce((acc, month) => {
      const year = parseInt(month.split('-')[1]);
      if (!acc[year]) acc[year] = [];
      acc[year].push(month);
      return acc;
    }, {} as Record<number, string[]>);

    // Get all unique month names (Jan, Feb, etc.)
    const uniqueMonths = [...new Set(months.map(m => m.split('-')[0]))].sort((a, b) => {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    return trainers.map(trainer => {
      const trainerData: any = {
        trainer,
        months: {},
        totalCurrent: 0,
        totalPrevious: 0
      };

      uniqueMonths.forEach(monthName => {
        // Find data for this month in both years
        const currentYearMonth = `${monthName}-${currentYear}`;
        const previousYearMonth = `${monthName}-${previousYear}`;
        
        const currentValue = data[trainer]?.[currentYearMonth] || 0;
        const previousValue = data[trainer]?.[previousYearMonth] || 0;
        
        trainerData.months[monthName] = {
          current: currentValue,
          previous: previousValue,
          change: previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
        };

        trainerData.totalCurrent += currentValue;
        trainerData.totalPrevious += previousValue;
      });

      trainerData.totalChange = trainerData.totalPrevious > 0 
        ? ((trainerData.totalCurrent - trainerData.totalPrevious) / trainerData.totalPrevious) * 100 
        : 0;

      return trainerData;
    });
  }, [data, months, trainers]);

  const formatValue = (value: number) => {
    if (activeMetric.includes('Percentage') || activeMetric.includes('Rate')) {
      return `${value.toFixed(1)}%`;
    }
    if (activeMetric.includes('Ltv')) {
      return formatCurrency(value);
    }
    return formatCurrency(value);
  };

  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 5) return 'text-green-600';
    if (change < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const handleGroupToggle = (groupName: string) => {
    if (onGroupToggle) {
      onGroupToggle(`yoy-${groupName}`);
    }
  };

  // Get unique months for column headers
  const uniqueMonths = [...new Set(months.map(m => m.split('-')[0]))].sort((a, b) => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
  });

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  if (!trainers.length || uniqueMonths.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Year-on-Year Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">No data available for year-on-year comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Year-on-Year Performance Analysis ({currentYear} vs {previousYear})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-[250px]">
                  <Button variant="ghost" onClick={() => handleSort('trainer')}>
                    Trainer
                    {sortBy === 'trainer' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                </TableHead>
                {uniqueMonths.map(month => (
                  <TableHead key={month} className="text-center min-w-[200px]">
                    <div className="space-y-1">
                      <div className="font-bold">{month}</div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-blue-600">{previousYear}</div>
                        <div className="text-green-600">{currentYear}</div>
                      </div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-[120px]">Total Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedTrainers).map(([groupName, groupTrainers]) => {
                const isCollapsed = collapsedGroups.has(`yoy-${groupName}`);
                const groupTotal = groupTrainers.reduce((sum, trainer) => {
                  const trainerData = yearOnYearData.find(t => t.trainer === trainer);
                  return sum + (trainerData?.totalCurrent || 0);
                }, 0);
                
                return (
                  <React.Fragment key={groupName}>
                    {/* Group Header */}
                    <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 font-semibold">
                      <TableCell className="sticky left-0 bg-gradient-to-r from-slate-100 to-slate-50 z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGroupToggle(groupName)}
                          className="flex items-center gap-2 font-bold text-slate-700"
                        >
                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {groupName} ({groupTrainers.length})
                        </Button>
                      </TableCell>
                      {uniqueMonths.map(month => {
                        const monthTotal = groupTrainers.reduce((sum, trainer) => {
                          const trainerData = yearOnYearData.find(t => t.trainer === trainer);
                          return sum + (trainerData?.months[month]?.current || 0);
                        }, 0);
                        const monthPrevious = groupTrainers.reduce((sum, trainer) => {
                          const trainerData = yearOnYearData.find(t => t.trainer === trainer);
                          return sum + (trainerData?.months[month]?.previous || 0);
                        }, 0);
                        
                        return (
                          <TableCell key={month} className="text-center">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-1 bg-blue-100 rounded text-blue-700 font-mono text-xs">
                                {formatValue(monthPrevious)}
                              </div>
                              <div className="p-1 bg-green-100 rounded text-green-700 font-mono text-xs">
                                {formatValue(monthTotal)}
                              </div>
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <Badge className="bg-slate-200 text-slate-700">
                          {formatCurrency(groupTotal)}
                        </Badge>
                      </TableCell>
                    </TableRow>

                    {/* Group Members */}
                    {!isCollapsed && groupTrainers.map((trainer) => {
                      const trainerData = yearOnYearData.find(t => t.trainer === trainer);
                      if (!trainerData) return null;

                      return (
                        <TableRow 
                          key={trainer} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => onTrainerClick(trainer, trainerData)}
                        >
                          <TableCell className="sticky left-0 bg-white z-10 pl-8">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={getTrainerAvatar(trainer)} />
                                <AvatarFallback>{trainer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{trainer}</span>
                            </div>
                          </TableCell>
                          {uniqueMonths.map(month => {
                            const monthData = trainerData.months[month];
                            return (
                              <TableCell key={month} className="text-center">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 bg-blue-50 rounded text-blue-700 font-mono text-sm">
                                    {formatValue(monthData.previous)}
                                  </div>
                                  <div className="p-2 bg-green-50 rounded text-green-700 font-mono text-sm">
                                    {formatValue(monthData.current)}
                                  </div>
                                </div>
                                <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${getTrendColor(monthData.change)}`}>
                                  {getTrendIcon(monthData.change)}
                                  <span>{monthData.change > 0 ? '+' : ''}{monthData.change.toFixed(1)}%</span>
                                </div>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center">
                            <div className={`flex items-center justify-center gap-1 text-sm ${getTrendColor(trainerData.totalChange)}`}>
                              {getTrendIcon(trainerData.totalChange)}
                              <span>{trainerData.totalChange > 0 ? '+' : ''}{trainerData.totalChange.toFixed(1)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
