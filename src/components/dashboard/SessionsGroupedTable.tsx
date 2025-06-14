
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ChevronDown, 
  ChevronRight, 
  Filter,
  ArrowUp,
  ArrowDown,
  Users,
  Target,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  ListChecks,
  BarChart3,
  Settings
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SessionsGroupedTableProps {
  data: SessionData[];
}

type ViewType = 'uniqueId' | 'trainer' | 'classType' | 'dayOfWeek' | 'timeSlot' | 'location' | 'date' | 'capacity' | 'class-day-time-location-trainer' | 'class-day-time-location' | 'class-day-time' | 'class-time' | 'class-day' | 'class-location' | 'day-time' | 'month' | 'none';
type SortField = 'name' | 'occurrences' | 'totalAttendees' | 'avgFillRate' | 'totalRevenue' | 'avgRevenue';
type SortDirection = 'asc' | 'desc';

export const SessionsGroupedTable: React.FC<SessionsGroupedTableProps> = ({ data }) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ViewType>('class-day-time-location');
  const [sortField, setSortField] = useState<SortField>('occurrences');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const groupedData = useMemo(() => {
    const groups: Record<string, SessionData[]> = {};
    
    data.forEach(session => {
      let groupKey: string;
      
      switch (currentView) {
        case 'class-day-time-location-trainer':
          groupKey = `${session.cleanedClass}|${session.dayOfWeek}|${session.time}|${session.location}|${session.trainerName}`;
          break;
        case 'class-day-time-location':
          groupKey = `${session.cleanedClass}|${session.dayOfWeek}|${session.time}|${session.location}`;
          break;
        case 'class-day-time':
          groupKey = `${session.cleanedClass}|${session.dayOfWeek}|${session.time}`;
          break;
        case 'class-time':
          groupKey = `${session.cleanedClass}|${session.time}`;
          break;
        case 'class-day':
          groupKey = `${session.cleanedClass}|${session.dayOfWeek}`;
          break;
        case 'class-location':
          groupKey = `${session.cleanedClass}|${session.location}`;
          break;
        case 'day-time':
          groupKey = `${session.dayOfWeek}|${session.time}`;
          break;
        case 'uniqueId':
          groupKey = session.uniqueId || 'Unknown';
          break;
        case 'trainer':
          groupKey = session.trainerName || 'Unknown';
          break;
        case 'classType':
          groupKey = session.cleanedClass || 'Unknown';
          break;
        case 'dayOfWeek':
          groupKey = session.dayOfWeek || 'Unknown';
          break;
        case 'timeSlot':
          groupKey = session.time || 'Unknown';
          break;
        case 'location':
          groupKey = session.location || 'Unknown';
          break;
        case 'date':
          groupKey = session.date || 'Unknown';
          break;
        case 'capacity':
          groupKey = `${session.capacity} seats`;
          break;
        case 'month': {
          const date = session.date;
          const month = date ? new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' }) : "Unknown";
          groupKey = month;
          break;
        }
        case 'none':
        default:
          groupKey = `row-${data.indexOf(session)}`;
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(session);
    });

    return groups;
  }, [data, currentView]);

  const processedGroups = useMemo(() => {
    return Object.entries(groupedData).map(([groupName, sessions]) => {
      const totalAttendees = sessions.reduce((sum, s) => sum + s.checkedInCount, 0);
      const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
      const totalRevenue = sessions.reduce((sum, s) => sum + s.totalPaid, 0);
      const avgFillRate = totalCapacity > 0 ? (totalAttendees / totalCapacity) * 100 : 0;
      const avgRevenue = sessions.length > 0 ? totalRevenue / sessions.length : 0;

      // Extract display information from the first session
      const firstSession = sessions[0];
      
      return {
        name: groupName,
        displayName: getDisplayName(groupName, firstSession, currentView),
        sessions,
        occurrences: sessions.length,
        totalAttendees,
        avgFillRate,
        totalRevenue,
        avgRevenue,
        // Add key fields for display
        cleanedClass: firstSession.cleanedClass,
        dayOfWeek: firstSession.dayOfWeek,
        time: firstSession.time,
        location: firstSession.location,
        trainerName: firstSession.trainerName
      };
    }).sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [groupedData, sortField, sortDirection, currentView]);

  const getDisplayName = (groupKey: string, session: SessionData, viewType: ViewType): string => {
    const parts = groupKey.split('|');
    
    switch (viewType) {
      case 'class-day-time-location-trainer':
        return `${parts[0]} - ${parts[1]} ${parts[2]} at ${parts[3]} (${parts[4]})`;
      case 'class-day-time-location':
        return `${parts[0]} - ${parts[1]} ${parts[2]} at ${parts[3]}`;
      case 'class-day-time':
        return `${parts[0]} - ${parts[1]} ${parts[2]}`;
      case 'class-time':
        return `${parts[0]} at ${parts[1]}`;
      case 'class-day':
        return `${parts[0]} on ${parts[1]}`;
      case 'class-location':
        return `${parts[0]} at ${parts[1]}`;
      case 'day-time':
        return `${parts[0]} at ${parts[1]}`;
      default:
        return groupKey;
    }
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const viewOptions = [
    { value: 'class-day-time-location-trainer', label: 'Class + Day + Time + Location + Trainer', icon: Users },
    { value: 'class-day-time-location', label: 'Class + Day + Time + Location', icon: Target },
    { value: 'class-day-time', label: 'Class + Day + Time', icon: Calendar },
    { value: 'class-time', label: 'Class + Time', icon: Clock },
    { value: 'class-day', label: 'Class + Day', icon: Calendar },
    { value: 'class-location', label: 'Class + Location', icon: MapPin },
    { value: 'day-time', label: 'Day + Time', icon: Clock },
    { value: 'uniqueId', label: 'Unique Sessions', icon: ListChecks },
    { value: 'trainer', label: 'By Trainer', icon: Users },
    { value: 'classType', label: 'By Class Type', icon: Target },
    { value: 'dayOfWeek', label: 'By Day of Week', icon: Calendar },
    { value: 'timeSlot', label: 'By Time Slot', icon: Clock },
    { value: 'location', label: 'By Location', icon: MapPin },
    { value: 'date', label: 'By Date', icon: Calendar },
    { value: 'capacity', label: 'By Capacity', icon: Users },
    { value: 'month', label: 'By Month', icon: Calendar },
    { value: 'none', label: 'No Grouping', icon: BarChart3 }
  ];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Session Analysis Table
          </CardTitle>
          <Select value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select grouping option" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {viewOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 z-10">
              <TableRow>
                <TableHead className="w-80 sticky left-0 bg-gray-50 z-20 border-r">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="h-6 p-0 font-semibold"
                  >
                    Group Details
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                
                {/* Show key fields based on grouping */}
                {(currentView.includes('class') || currentView === 'classType') && (
                  <TableHead className="text-center min-w-32">
                    <span className="font-semibold">Class Type</span>
                  </TableHead>
                )}
                
                {(currentView.includes('day') || currentView === 'dayOfWeek') && (
                  <TableHead className="text-center min-w-24">
                    <span className="font-semibold">Day</span>
                  </TableHead>
                )}
                
                {(currentView.includes('time') || currentView === 'timeSlot') && (
                  <TableHead className="text-center min-w-24">
                    <span className="font-semibold">Time</span>
                  </TableHead>
                )}
                
                {(currentView.includes('location') || currentView === 'location') && (
                  <TableHead className="text-center min-w-32">
                    <span className="font-semibold">Location</span>
                  </TableHead>
                )}
                
                {(currentView.includes('trainer') || currentView === 'trainer') && (
                  <TableHead className="text-center min-w-32">
                    <span className="font-semibold">Trainer</span>
                  </TableHead>
                )}
                
                <TableHead className="text-center min-w-24">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('occurrences')}
                    className="h-6 p-0 font-semibold"
                  >
                    Occurrences
                    {sortField === 'occurrences' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-24">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('totalAttendees')}
                    className="h-6 p-0 font-semibold"
                  >
                    Total Attendees
                    {sortField === 'totalAttendees' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-24">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('avgFillRate')}
                    className="h-6 p-0 font-semibold"
                  >
                    Avg Fill %
                    {sortField === 'avgFillRate' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-32">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('totalRevenue')}
                    className="h-6 p-0 font-semibold"
                  >
                    Total Revenue
                    {sortField === 'totalRevenue' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-32">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('avgRevenue')}
                    className="h-6 p-0 font-semibold"
                  >
                    Avg Revenue
                    {sortField === 'avgRevenue' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedGroups.map((group) => (
                <React.Fragment key={group.name}>
                  <TableRow 
                    className="cursor-pointer hover:bg-gray-50 border-b-2 border-gray-200"
                    onClick={() => toggleGroup(group.name)}
                  >
                    <TableCell className="sticky left-0 bg-white z-10 border-r h-6 py-1">
                      <div className="flex items-center gap-2">
                        {expandedGroups.has(group.name) ? 
                          <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        }
                        <span className="font-medium text-sm truncate">{group.displayName}</span>
                      </div>
                    </TableCell>
                    
                    {/* Dynamic columns based on grouping */}
                    {(currentView.includes('class') || currentView === 'classType') && (
                      <TableCell className="text-center h-6 py-1 text-sm">
                        {group.cleanedClass}
                      </TableCell>
                    )}
                    
                    {(currentView.includes('day') || currentView === 'dayOfWeek') && (
                      <TableCell className="text-center h-6 py-1 text-sm">
                        {group.dayOfWeek}
                      </TableCell>
                    )}
                    
                    {(currentView.includes('time') || currentView === 'timeSlot') && (
                      <TableCell className="text-center h-6 py-1 text-sm">
                        {group.time}
                      </TableCell>
                    )}
                    
                    {(currentView.includes('location') || currentView === 'location') && (
                      <TableCell className="text-center h-6 py-1 text-sm">
                        {group.location}
                      </TableCell>
                    )}
                    
                    {(currentView.includes('trainer') || currentView === 'trainer') && (
                      <TableCell className="text-center h-6 py-1 text-sm">
                        {group.trainerName}
                      </TableCell>
                    )}
                    
                    <TableCell className="text-center h-6 py-1">
                      <Badge variant="secondary" className="text-xs">
                        {group.occurrences}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center h-6 py-1 text-sm">
                      {formatNumber(group.totalAttendees)}
                    </TableCell>
                    <TableCell className="text-center h-6 py-1 text-sm">
                      {group.avgFillRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center h-6 py-1 text-sm">
                      {formatCurrency(group.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-center h-6 py-1 text-sm">
                      {formatCurrency(group.avgRevenue)}
                    </TableCell>
                  </TableRow>
                  
                  {expandedGroups.has(group.name) && group.sessions.map((session, index) => (
                    <TableRow key={`${group.name}-${index}`} className="bg-blue-50">
                      <TableCell className="sticky left-0 bg-blue-50 z-10 border-r h-6 py-1 pl-8">
                        <span className="text-xs text-gray-600 truncate">
                          {session.sessionName} - {session.date}
                        </span>
                      </TableCell>
                      
                      {/* Show same columns for child rows */}
                      {(currentView.includes('class') || currentView === 'classType') && (
                        <TableCell className="text-center h-6 py-1 text-xs text-gray-600">
                          {session.cleanedClass}
                        </TableCell>
                      )}
                      
                      {(currentView.includes('day') || currentView === 'dayOfWeek') && (
                        <TableCell className="text-center h-6 py-1 text-xs text-gray-600">
                          {session.dayOfWeek}
                        </TableCell>
                      )}
                      
                      {(currentView.includes('time') || currentView === 'timeSlot') && (
                        <TableCell className="text-center h-6 py-1 text-xs text-gray-600">
                          {session.time}
                        </TableCell>
                      )}
                      
                      {(currentView.includes('location') || currentView === 'location') && (
                        <TableCell className="text-center h-6 py-1 text-xs text-gray-600">
                          {session.location}
                        </TableCell>
                      )}
                      
                      {(currentView.includes('trainer') || currentView === 'trainer') && (
                        <TableCell className="text-center h-6 py-1 text-xs text-gray-600">
                          {session.trainerName}
                        </TableCell>
                      )}
                      
                      <TableCell className="text-center h-6 py-1 text-xs text-gray-600">
                        1
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs">
                        {session.checkedInCount}
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs">
                        {session.fillPercentage?.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs">
                        {formatCurrency(session.totalPaid)}
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs">
                        {formatCurrency(session.totalPaid)}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
