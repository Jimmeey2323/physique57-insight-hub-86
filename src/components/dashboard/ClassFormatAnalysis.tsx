
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ChevronDown, 
  ChevronRight, 
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ClassFormatAnalysisProps {
  data: SessionData[];
}

export const ClassFormatAnalysis: React.FC<ClassFormatAnalysisProps> = ({ data }) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const formatAnalysis = useMemo(() => {
    // Extract class formats from class names
    const formatGroups = data.reduce((acc, session) => {
      const className = session.cleanedClass || 'Unknown';
      
      // Determine format based on class name patterns
      let format = 'Other';
      if (className.toLowerCase().includes('yoga')) format = 'Yoga';
      else if (className.toLowerCase().includes('pilates')) format = 'Pilates';
      else if (className.toLowerCase().includes('strength') || className.toLowerCase().includes('weight')) format = 'Strength Training';
      else if (className.toLowerCase().includes('cardio') || className.toLowerCase().includes('hiit')) format = 'Cardio/HIIT';
      else if (className.toLowerCase().includes('dance') || className.toLowerCase().includes('zumba')) format = 'Dance/Movement';
      else if (className.toLowerCase().includes('meditation') || className.toLowerCase().includes('mindfulness')) format = 'Mindfulness';
      
      if (!acc[format]) {
        acc[format] = {
          format,
          classes: new Map(),
          totalSessions: 0,
          totalAttendees: 0,
          totalRevenue: 0,
          totalCapacity: 0
        };
      }
      
      const classKey = `${className}|${session.dayOfWeek}|${session.time}|${session.location}`;
      
      if (!acc[format].classes.has(classKey)) {
        acc[format].classes.set(classKey, {
          className,
          dayOfWeek: session.dayOfWeek,
          time: session.time,
          location: session.location,
          trainerName: session.trainerName,
          sessions: 0,
          attendees: 0,
          revenue: 0,
          capacity: 0,
          classAverage: 0
        });
      }
      
      const classGroup = acc[format].classes.get(classKey)!;
      classGroup.sessions++;
      classGroup.attendees += session.checkedInCount;
      classGroup.revenue += session.totalPaid;
      classGroup.capacity += session.capacity;
      
      acc[format].totalSessions++;
      acc[format].totalAttendees += session.checkedInCount;
      acc[format].totalRevenue += session.totalPaid;
      acc[format].totalCapacity += session.capacity;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and sort
    Object.values(formatGroups).forEach((format: any) => {
      format.avgFillRate = format.totalCapacity > 0 ? (format.totalAttendees / format.totalCapacity) * 100 : 0;
      format.avgRevenue = format.totalSessions > 0 ? format.totalRevenue / format.totalSessions : 0;
      format.classAverage = format.totalSessions > 0 ? format.totalAttendees / format.totalSessions : 0;
      
      // Calculate class averages for individual classes
      format.classes.forEach((classGroup: any) => {
        classGroup.classAverage = classGroup.sessions > 0 ? classGroup.attendees / classGroup.sessions : 0;
        classGroup.fillRate = classGroup.capacity > 0 ? (classGroup.attendees / classGroup.capacity) * 100 : 0;
      });
      
      // Sort classes within format by class average
      format.classesArray = Array.from(format.classes.values()).sort((a: any, b: any) => b.classAverage - a.classAverage);
    });

    return Object.values(formatGroups).sort((a: any, b: any) => b.classAverage - a.classAverage);
  }, [data]);

  const filteredFormats = useMemo(() => {
    if (selectedFormat === 'all') return formatAnalysis;
    return formatAnalysis.filter((format: any) => format.format === selectedFormat);
  }, [formatAnalysis, selectedFormat]);

  const toggleGroup = (formatName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(formatName)) {
      newExpanded.delete(formatName);
    } else {
      newExpanded.add(formatName);
    }
    setExpandedGroups(newExpanded);
  };

  const availableFormats = ['all', ...formatAnalysis.map((f: any) => f.format)];

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Class Format Analysis
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {selectedFormat === 'all' ? 'All Formats' : selectedFormat}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              {availableFormats.map(format => (
                <DropdownMenuItem
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                >
                  {format === 'all' ? 'All Formats' : format}
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
                <TableHead className="w-80 sticky left-0 bg-gray-50 z-20 border-r font-semibold">
                  Format / Class Details
                </TableHead>
                <TableHead className="text-center min-w-24 font-semibold">Class Name</TableHead>
                <TableHead className="text-center min-w-24 font-semibold">Day</TableHead>
                <TableHead className="text-center min-w-24 font-semibold">Time</TableHead>
                <TableHead className="text-center min-w-32 font-semibold">Location</TableHead>
                <TableHead className="text-center min-w-24 font-semibold">Sessions</TableHead>
                <TableHead className="text-center min-w-24 font-semibold">Class Average</TableHead>
                <TableHead className="text-center min-w-24 font-semibold">Fill Rate %</TableHead>
                <TableHead className="text-center min-w-32 font-semibold">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFormats.map((format: any) => (
                <React.Fragment key={format.format}>
                  <TableRow 
                    className="cursor-pointer hover:bg-gray-50 border-b-2 border-gray-200 bg-blue-50"
                    onClick={() => toggleGroup(format.format)}
                  >
                    <TableCell className="sticky left-0 bg-blue-50 z-10 border-r h-6 py-2">
                      <div className="flex items-center gap-2">
                        {expandedGroups.has(format.format) ? 
                          <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        }
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-sm">{format.format}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center h-6 py-2 text-sm font-medium">
                      <Badge variant="secondary">{format.classesArray.length} classes</Badge>
                    </TableCell>
                    <TableCell className="text-center h-6 py-2 text-sm">-</TableCell>
                    <TableCell className="text-center h-6 py-2 text-sm">-</TableCell>
                    <TableCell className="text-center h-6 py-2 text-sm">-</TableCell>
                    <TableCell className="text-center h-6 py-2">
                      <Badge variant="default" className="text-xs">
                        {format.totalSessions}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center h-6 py-2 text-sm font-semibold text-blue-600">
                      {format.classAverage.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-center h-6 py-2 text-sm font-medium">
                      {format.avgFillRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center h-6 py-2 text-sm font-medium">
                      {formatCurrency(format.totalRevenue)}
                    </TableCell>
                  </TableRow>
                  
                  {expandedGroups.has(format.format) && format.classesArray.map((classGroup: any, index: number) => (
                    <TableRow key={`${format.format}-${index}`} className="bg-gray-50 hover:bg-gray-100">
                      <TableCell className="sticky left-0 bg-gray-50 z-10 border-r h-6 py-1 pl-8">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-700 truncate font-medium">
                            {classGroup.className}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs font-medium">
                        {classGroup.className}
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {classGroup.dayOfWeek}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {classGroup.time}
                        </div>
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs">
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{classGroup.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs">
                        {classGroup.sessions}
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs font-semibold text-green-600">
                        {classGroup.classAverage.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs">
                        <Badge 
                          variant={classGroup.fillRate > 80 ? 'default' : classGroup.fillRate > 60 ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {classGroup.fillRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center h-6 py-1 text-xs">
                        {formatCurrency(classGroup.revenue)}
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
