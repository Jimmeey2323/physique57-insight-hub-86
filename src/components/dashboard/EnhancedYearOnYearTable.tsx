
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface EnhancedYearOnYearTableProps {
  data: Record<string, Record<string, number>>;
  months: string[];
  trainers: string[];
  activeMetric: string;
  onTrainerClick: (trainer: string, data: any) => void;
}

export const EnhancedYearOnYearTable: React.FC<EnhancedYearOnYearTableProps> = ({
  data,
  months,
  trainers,
  activeMetric,
  onTrainerClick
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
        months: {}
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
      });

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
    return formatNumber(value);
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

  // Get unique months for column headers
  const uniqueMonths = [...new Set(months.map(m => m.split('-')[0]))].sort((a, b) => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
  });

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Year-on-Year Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearOnYearData.map((trainerData) => (
                <TableRow 
                  key={trainerData.trainer} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onTrainerClick(trainerData.trainer, trainerData)}
                >
                  <TableCell className="sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={getTrainerAvatar(trainerData.trainer)} />
                        <AvatarFallback>{trainerData.trainer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{trainerData.trainer}</span>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
