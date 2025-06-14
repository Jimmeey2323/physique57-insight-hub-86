
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Settings } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SessionsTopBottomListsProps {
  data: SessionData[];
  title: string;
  type: 'classes' | 'trainers';
  variant: 'top' | 'bottom';
}

type MetricType = 'attendance' | 'fillRate' | 'revenue' | 'lateCancellations';

export const SessionsTopBottomLists: React.FC<SessionsTopBottomListsProps> = ({
  data,
  title,
  type,
  variant
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('attendance');
  const [showCount, setShowCount] = useState(5);
  const [includeTrainer, setIncludeTrainer] = useState(false);

  const processedData = useMemo(() => {
    const grouped: Record<string, {
      name: string;
      displayName: string;
      totalAttendance: number;
      avgFillRate: number;
      totalRevenue: number;
      lateCancellations: number;
      sessions: number;
      avgAttendance: number;
      trainerName?: string;
    }> = {};

    data.forEach(session => {
      let key: string;
      let displayName: string;
      
      if (type === 'classes') {
        if (includeTrainer) {
          key = `${session.cleanedClass}-${session.trainerName}`;
          displayName = `${session.cleanedClass} (${session.trainerName})`;
        } else {
          key = session.cleanedClass;
          displayName = session.cleanedClass;
        }
      } else {
        key = session.trainerName;
        displayName = session.trainerName;
      }
      
      if (!key) return;

      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          displayName: displayName,
          totalAttendance: 0,
          avgFillRate: 0,
          totalRevenue: 0,
          lateCancellations: 0,
          sessions: 0,
          avgAttendance: 0,
          trainerName: session.trainerName
        };
      }

      grouped[key].totalAttendance += session.checkedInCount;
      grouped[key].totalRevenue += session.totalPaid;
      grouped[key].lateCancellations += session.lateCancelledCount;
      grouped[key].sessions += 1;
    });

    // Calculate averages
    Object.values(grouped).forEach(item => {
      const relevantSessions = data.filter(s => {
        if (type === 'classes') {
          if (includeTrainer) {
            return s.cleanedClass === item.name.split('-')[0] && s.trainerName === item.name.split('-')[1];
          } else {
            return s.cleanedClass === item.name;
          }
        } else {
          return s.trainerName === item.name;
        }
      });
      
      const totalCapacity = relevantSessions.reduce((sum, s) => sum + s.capacity, 0);
      item.avgFillRate = totalCapacity > 0 ? (item.totalAttendance / totalCapacity) * 100 : 0;
      item.avgAttendance = item.sessions > 0 ? item.totalAttendance / item.sessions : 0;
    });

    const sortedData = Object.values(grouped).sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (selectedMetric) {
        case 'attendance':
          aValue = a.avgAttendance;
          bValue = b.avgAttendance;
          break;
        case 'fillRate':
          aValue = a.avgFillRate;
          bValue = b.avgFillRate;
          break;
        case 'revenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'lateCancellations':
          aValue = a.lateCancellations;
          bValue = b.lateCancellations;
          return variant === 'top' ? bValue - aValue : aValue - bValue; // Reverse for late cancellations
        default:
          aValue = a.avgAttendance;
          bValue = b.avgAttendance;
      }
      
      return variant === 'top' ? bValue - aValue : aValue - bValue;
    });

    return sortedData.slice(0, showCount);
  }, [data, type, selectedMetric, variant, showCount, includeTrainer]);

  const metricOptions = [
    { value: 'attendance', label: 'Class Average', icon: Users },
    { value: 'fillRate', label: 'Fill Rate %', icon: Target },
    { value: 'revenue', label: 'Revenue', icon: DollarSign },
    { value: 'lateCancellations', label: 'Late Cancellations', icon: TrendingDown }
  ];

  const getMetricValue = (item: typeof processedData[0]) => {
    switch (selectedMetric) {
      case 'attendance':
        return formatNumber(Number(item.avgAttendance.toFixed(1)));
      case 'fillRate':
        return `${item.avgFillRate.toFixed(1)}%`;
      case 'revenue':
        return formatCurrency(item.totalRevenue);
      case 'lateCancellations':
        return formatNumber(item.lateCancellations);
      default:
        return formatNumber(Number(item.avgAttendance.toFixed(1)));
    }
  };

  const getMetricSubtext = (item: typeof processedData[0]) => {
    switch (selectedMetric) {
      case 'attendance':
        return `${item.sessions} sessions, ${formatNumber(item.totalAttendance)} total`;
      case 'fillRate':
        return `${formatNumber(item.totalAttendance)} attendees`;
      case 'revenue':
        return `Avg: ${formatCurrency(item.totalRevenue / item.sessions)}`;
      case 'lateCancellations':
        return `${((item.lateCancellations / item.sessions) * 100).toFixed(1)}% rate`;
      default:
        return `${item.sessions} sessions`;
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            {variant === 'top' ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {metricOptions.find(opt => opt.value === selectedMetric)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {metricOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSelectedMetric(option.value as MetricType)}
                  >
                    <option.icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Trainer Toggle for Classes */}
        {type === 'classes' && (
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="include-trainer"
              checked={includeTrainer}
              onCheckedChange={setIncludeTrainer}
            />
            <Label htmlFor="include-trainer" className="text-sm text-gray-600">
              Include trainer in ranking
            </Label>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-80 overflow-auto">
          {processedData.map((item, index) => (
            <div 
              key={item.name}
              className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 h-16"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  variant === 'top' 
                    ? index < 3 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                    : index < 3 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate text-sm">{item.displayName}</p>
                  <p className="text-xs text-gray-500">{getMetricSubtext(item)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 text-sm">{getMetricValue(item)}</p>
                <Badge 
                  variant={variant === 'top' ? 'default' : 'destructive'} 
                  className="text-xs"
                >
                  {variant === 'top' ? 'High' : 'Low'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCount(showCount === 5 ? 10 : 5)}
          >
            Show {showCount === 5 ? 'More' : 'Less'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
