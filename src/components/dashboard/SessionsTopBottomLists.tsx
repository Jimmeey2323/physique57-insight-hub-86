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

interface GroupedItem {
  name: string;
  displayName: string;
  totalAttendance: number;
  avgFillRate: number;
  totalRevenue: number;
  lateCancellations: number;
  sessions: number;
  avgAttendance: number;
  trainerName?: string;
}

export const SessionsTopBottomLists: React.FC<SessionsTopBottomListsProps> = ({
  data,
  title,
  type,
  variant
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('attendance');
  const [showCount, setShowCount] = useState(5);
  const [includeTrainer, setIncludeTrainer] = useState(false);

  const processedData = useMemo((): GroupedItem[] => {
    console.log('Processing data in SessionsTopBottomLists:', { dataLength: data?.length, type, variant, selectedMetric, includeTrainer });

    if (!Array.isArray(data) || data.length === 0) {
      console.log('No data available');
      return [];
    }

    // Create a results object to store grouped data
    const groupedResults: Record<string, GroupedItem> = {};

    for (let i = 0; i < data.length; i++) {
      const session = data[i];
      if (!session) continue;

      let groupKey = '';
      let displayName = '';

      if (type === 'classes') {
        if (includeTrainer) {
          groupKey = `${session.cleanedClass || ''}-${session.trainerName || ''}`;
          displayName = `${session.cleanedClass || 'Unknown'} (${session.trainerName || 'Unknown'})`;
        } else {
          groupKey = session.cleanedClass || '';
          displayName = session.cleanedClass || 'Unknown';
        }
      } else {
        groupKey = session.trainerName || '';
        displayName = session.trainerName || 'Unknown';
      }

      if (!groupKey) continue;

      if (!groupedResults[groupKey]) {
        groupedResults[groupKey] = {
          name: groupKey,
          displayName: displayName,
          totalAttendance: 0,
          avgFillRate: 0,
          totalRevenue: 0,
          lateCancellations: 0,
          sessions: 0,
          avgAttendance: 0,
          trainerName: session.trainerName,
        };
      }

      const currentGroup: GroupedItem = groupedResults[groupKey];
      currentGroup.totalAttendance += Number(session.checkedInCount || 0);
      currentGroup.totalRevenue += Number(session.totalPaid || 0);
      currentGroup.lateCancellations += Number(session.lateCancelledCount || 0);
      currentGroup.sessions += 1;
    }

    // Calculate averages for each group
    const groupedItems: GroupedItem[] = Object.values(groupedResults);

    for (let j = 0; j < groupedItems.length; j++) {
      const item = groupedItems[j];
      const relevantSessions = data.filter((sessionItem: SessionData) => {
        if (!sessionItem) return false;

        if (type === 'classes') {
          if (includeTrainer) {
            const sessionKey = `${sessionItem.cleanedClass || ''}-${sessionItem.trainerName || ''}`;
            return sessionKey === item.name;
          } else {
            return sessionItem.cleanedClass === item.name;
          }
        } else {
          return sessionItem.trainerName === item.name;
        }
      });

      const totalCapacity = relevantSessions.reduce(
        (sum, sessionItem) => sum + Number(sessionItem.capacity || 0),
        0
      );
      item.avgFillRate = totalCapacity > 0 ? (item.totalAttendance / totalCapacity) * 100 : 0;
      item.avgAttendance = item.sessions > 0 ? item.totalAttendance / item.sessions : 0;
    }

    // Always sort using a new array to avoid mutation
    const sortedData: GroupedItem[] = [...groupedItems].sort((a, b) => {
      let aValue = 0;
      let bValue = 0;

      if (selectedMetric === 'attendance') {
        aValue = a.avgAttendance;
        bValue = b.avgAttendance;
      } else if (selectedMetric === 'fillRate') {
        aValue = a.avgFillRate;
        bValue = b.avgFillRate;
      } else if (selectedMetric === 'revenue') {
        aValue = a.totalRevenue;
        bValue = b.totalRevenue;
      } else if (selectedMetric === 'lateCancellations') {
        aValue = a.lateCancellations;
        bValue = b.lateCancellations;
        return variant === 'top' ? bValue - aValue : aValue - bValue;
      } else {
        aValue = a.avgAttendance;
        bValue = b.avgAttendance;
      }

      return variant === 'top' ? bValue - aValue : aValue - bValue;
    });

    console.log('Processed data result:', sortedData.slice(0, showCount));
    return sortedData.slice(0, showCount);
  }, [data, type, selectedMetric, variant, showCount, includeTrainer]);

  const metricOptions = [
    { value: 'attendance' as MetricType, label: 'Class Average', icon: Users },
    { value: 'fillRate' as MetricType, label: 'Fill Rate %', icon: Target },
    { value: 'revenue' as MetricType, label: 'Revenue', icon: DollarSign },
    { value: 'lateCancellations' as MetricType, label: 'Late Cancellations', icon: TrendingDown }
  ];

  const getMetricValue = (item: GroupedItem) => {
    if (!item) return '';
    
    if (selectedMetric === 'attendance') {
      return formatNumber(Number(item.avgAttendance.toFixed(1)));
    } else if (selectedMetric === 'fillRate') {
      return `${item.avgFillRate.toFixed(1)}%`;
    } else if (selectedMetric === 'revenue') {
      return formatCurrency(item.totalRevenue);
    } else if (selectedMetric === 'lateCancellations') {
      return formatNumber(item.lateCancellations);
    } else {
      return formatNumber(Number(item.avgAttendance.toFixed(1)));
    }
  };

  const getMetricSubtext = (item: GroupedItem) => {
    if (!item) return '';
    
    if (selectedMetric === 'attendance') {
      return `${item.sessions} sessions, ${formatNumber(item.totalAttendance)} total`;
    } else if (selectedMetric === 'fillRate') {
      return `${formatNumber(item.totalAttendance)} attendees`;
    } else if (selectedMetric === 'revenue') {
      const avgRevenue = item.totalRevenue / Math.max(item.sessions, 1);
      return `Avg: ${formatCurrency(avgRevenue)}`;
    } else if (selectedMetric === 'lateCancellations') {
      const cancellationRate = (item.lateCancellations / Math.max(item.sessions, 1)) * 100;
      return `${cancellationRate.toFixed(1)}% rate`;
    } else {
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
                    onClick={() => setSelectedMetric(option.value)}
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
