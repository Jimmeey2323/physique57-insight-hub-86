
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ChevronDown, 
  ChevronRight, 
  Filter,
  SortAsc,
  SortDesc,
  Users,
  Target,
  DollarSign,
  Calendar
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SessionsGroupedTableProps {
  data: SessionData[];
}

type ViewType = 
  | 'uniqueId' 
  | 'trainer' 
  | 'classType' 
  | 'dayOfWeek' 
  | 'timeSlot' 
  | 'location' 
  | 'date' 
  | 'capacity'
  | 'classTypeDay'
  | 'classTypeTime'
  | 'classTypeDayTime'
  | 'classTypeDayTimeLocation'
  | 'classTypeDayTimeLocationTrainer';

type SortField = 'name' | 'occurrences' | 'totalAttendees' | 'avgFillRate' | 'totalRevenue' | 'avgRevenue' | 'classAverage';
type SortDirection = 'asc' | 'desc';

export const SessionsGroupedTable: React.FC<SessionsGroupedTableProps> = ({ data }) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ViewType>('classTypeDayTimeLocation');
  const [sortField, setSortField] = useState<SortField>('classAverage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const groupedData = useMemo(() => {
    const groups: Record<string, SessionData[]> = {};
    
    data.forEach(session => {
      let groupKey: string;
      
      switch (currentView) {
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
        case 'classTypeDay':
          groupKey = `${session.cleanedClass || 'Unknown'} | ${session.dayOfWeek || 'Unknown'}`;
          break;
        case 'classTypeTime':
          groupKey = `${session.cleanedClass || 'Unknown'} | ${session.time || 'Unknown'}`;
          break;
        case 'classTypeDayTime':
          groupKey = `${session.cleanedClass || 'Unknown'} | ${session.dayOfWeek || 'Unknown'} | ${session.time || 'Unknown'}`;
          break;
        case 'classTypeDayTimeLocation':
          groupKey = `${session.cleanedClass || 'Unknown'} | ${session.dayOfWeek || 'Unknown'} | ${session.time || 'Unknown'} | ${session.location || 'Unknown'}`;
          break;
        case 'classTypeDayTimeLocationTrainer':
          groupKey = `${session.cleanedClass || 'Unknown'} | ${session.dayOfWeek || 'Unknown'} | ${session.time || 'Unknown'} | ${session.location || 'Unknown'} | ${session.trainerName || 'Unknown'}`;
          break;
        default:
          groupKey = session.uniqueId || 'Unknown';
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
      const classAverage = sessions.length > 0 ? totalAttendees / sessions.length : 0;

      return {
        name: groupName,
        sessions,
        occurrences: sessions.length,
        totalAttendees,
        avgFillRate,
        totalRevenue,
        avgRevenue,
        classAverage
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
  }, [groupedData, sortField, sortDirection]);

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
    { value: 'classTypeDayTimeLocation', label: 'Class + Day + Time + Location', icon: Target },
    { value: 'classTypeDayTimeLocationTrainer', label: 'Class + Day + Time + Location + Trainer', icon: Target },
    { value: 'classTypeDayTime', label: 'Class + Day + Time', icon: Target },
    { value: 'classTypeDay', label: 'Class + Day', icon: Target },
    { value: 'classTypeTime', label: 'Class + Time', icon: Target },
    { value: 'uniqueId', label: 'Individual Sessions', icon: Calendar },
    { value: 'trainer', label: 'By Trainer', icon: Users },
    { value: 'classType', label: 'By Class Type', icon: Target },
    { value: 'dayOfWeek', label: 'By Day of Week', icon: Calendar },
    { value: 'timeSlot', label: 'By Time Slot', icon: Calendar },
    { value: 'location', label: 'By Location', icon: Calendar },
    { value: 'date', label: 'By Date', icon: Calendar },
    { value: 'capacity', label: 'By Capacity', icon: Users }
  ];

  const getDisplayColumns = () => {
    const columns = [];
    
    if (currentView.includes('classType') || currentView === 'classType') {
      columns.push({ key: 'cleanedClass', label: 'Class' });
    }
    if (currentView.includes('Day') || currentView === 'dayOfWeek') {
      columns.push({ key: 'dayOfWeek', label: 'Day' });
    }
    if (currentView.includes('Time') || currentView === 'timeSlot') {
      columns.push({ key: 'time', label: 'Time' });
    }
    if (currentView.includes('Location') || currentView === 'location') {
      columns.push({ key: 'location', label: 'Location' });
    }
    if (currentView.includes('Trainer') || currentView === 'trainer') {
      columns.push({ key: 'trainerName', label: 'Trainer' });
    }
    
    return columns;
  };

  const parseGroupedRowData = (groupName: string) => {
    const parts = groupName.split(' | ');
    const columns = getDisplayColumns();
    const result: Record<string, string> = {};
    
    columns.forEach((col, index) => {
      result[col.key] = parts[index] || '';
    });
    
    return result;
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Session Analysis Table
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {viewOptions.find(opt => opt.value === currentView)?.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              {viewOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setCurrentView(option.value as ViewType)}
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                    Group
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                {getDisplayColumns().map(col => (
                  <TableHead key={col.key} className="text-center min-w-24 font-semibold">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-24">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('occurrences')}
                    className="h-6 p-0 font-semibold"
                  >
                    Sessions
                    {sortField === 'occurrences' && (
                      sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-center min-w-24">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('classAverage')}
                    className="h-6 p-0 font-semibold"
                  >
                    Class Average
                    {sortField === 'classAverage' && (
                      sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
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
                      sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
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
                      sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
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
                      sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
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
                      sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedGroups.map((group) => {
                const groupRowData = parseGroupedRowData(group.name);
                const displayColumns = getDisplayColumns();
                
                return (
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
                          <span className="font-medium text-sm truncate">{group.name}</span>
                        </div>
                      </TableCell>
                      {displayColumns.map(col => (
                        <TableCell key={col.key} className="text-center h-6 py-1 text-sm font-medium">
                          {groupRowData[col.key]}
                        </TableCell>
                      ))}
                      <TableCell className="text-center h-6 py-1">
                        <Badge variant="secondary" className="text-xs">
                          {group.occurrences}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-sm font-bold text-blue-600">
                        {group.classAverage.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-sm font-medium">
                        {formatNumber(group.totalAttendees)}
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-sm font-medium">
                        {group.avgFillRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-sm font-medium">
                        {formatCurrency(group.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-sm font-medium">
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
                        {displayColumns.map(col => (
                          <TableCell key={col.key} className="text-center h-6 py-1 text-xs text-gray-600">
                            {session[col.key as keyof SessionData] || '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-center h-6 py-1 text-xs text-gray-600">
                          1
                        </TableCell>
                        <TableCell className="text-center h-6 py-1 text-xs font-semibold text-blue-600">
                          {session.checkedInCount}
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
