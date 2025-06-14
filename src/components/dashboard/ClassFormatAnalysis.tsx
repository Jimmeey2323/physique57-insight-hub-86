
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronDown, 
  ChevronRight, 
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  Award
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

  // Filter out unwanted sessions
  const filteredData = useMemo(() => {
    return data.filter(session => {
      const className = session.cleanedClass || '';
      const excludeKeywords = ['Hosted', 'P57', 'X'];
      
      const hasExcludedKeyword = excludeKeywords.some(keyword => 
        className.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return !hasExcludedKeyword;
    });
  }, [data]);

  const formatAnalysis = useMemo(() => {
    // Group by exact class names from cleanedClass column
    const classGroups = filteredData.reduce((acc, session) => {
      const className = session.cleanedClass || 'Unknown';
      
      if (!acc[className]) {
        acc[className] = {
          className,
          classes: new Map(),
          totalSessions: 0,
          totalAttendees: 0,
          totalRevenue: 0,
          totalCapacity: 0,
          totalLateCancellations: 0,
          totalComplimentary: 0,
          totalNonPaid: 0
        };
      }
      
      const classKey = `${className}|${session.dayOfWeek}|${session.time}|${session.location}`;
      
      if (!acc[className].classes.has(classKey)) {
        acc[className].classes.set(classKey, {
          className,
          dayOfWeek: session.dayOfWeek,
          time: session.time,
          location: session.location,
          trainerName: session.trainerName,
          sessions: 0,
          attendees: 0,
          revenue: 0,
          capacity: 0,
          classAverage: 0,
          lateCancellations: 0,
          complimentary: 0,
          nonPaid: 0
        });
      }
      
      const classGroup = acc[className].classes.get(classKey)!;
      classGroup.sessions++;
      classGroup.attendees += session.checkedInCount;
      classGroup.revenue += session.totalPaid;
      classGroup.capacity += session.capacity;
      classGroup.lateCancellations += session.lateCancelledCount;
      classGroup.complimentary += session.complimentaryCount;
      classGroup.nonPaid += session.nonPaidCount;
      
      acc[className].totalSessions++;
      acc[className].totalAttendees += session.checkedInCount;
      acc[className].totalRevenue += session.totalPaid;
      acc[className].totalCapacity += session.capacity;
      acc[className].totalLateCancellations += session.lateCancelledCount;
      acc[className].totalComplimentary += session.complimentaryCount;
      acc[className].totalNonPaid += session.nonPaidCount;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and sort
    Object.values(classGroups).forEach((format: any) => {
      format.avgFillRate = format.totalCapacity > 0 ? (format.totalAttendees / format.totalCapacity) * 100 : 0;
      format.avgRevenue = format.totalSessions > 0 ? format.totalRevenue / format.totalSessions : 0;
      format.classAverage = format.totalSessions > 0 ? format.totalAttendees / format.totalSessions : 0;
      
      // Calculate class averages for individual classes
      format.classes.forEach((classGroup: any) => {
        classGroup.classAverage = classGroup.sessions > 0 ? classGroup.attendees / classGroup.sessions : 0;
        classGroup.fillRate = classGroup.capacity > 0 ? (classGroup.attendees / classGroup.capacity) * 100 : 0;
        classGroup.avgLateCancellations = classGroup.sessions > 0 ? classGroup.lateCancellations / classGroup.sessions : 0;
      });
      
      // Sort classes within format by class average and filter out sessions < 2
      format.classesArray = Array.from(format.classes.values())
        .filter((classGroup: any) => classGroup.sessions >= 2)
        .sort((a: any, b: any) => b.classAverage - a.classAverage);
    });

    // Filter out formats with no valid classes (after filtering sessions < 2)
    return Object.values(classGroups)
      .filter((format: any) => format.classesArray.length > 0)
      .sort((a: any, b: any) => b.classAverage - a.classAverage);
  }, [filteredData]);

  const filteredFormats = useMemo(() => {
    if (selectedFormat === 'all') return formatAnalysis;
    return formatAnalysis.filter((format: any) => format.className === selectedFormat);
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

  const availableFormats = ['all', ...formatAnalysis.map((f: any) => f.className)];

  return (
    <TooltipProvider>
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-white/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              Class Format Analysis
              <Badge variant="secondary" className="ml-2">
                {formatAnalysis.length} class types • {filteredData.length} sessions
              </Badge>
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-white/80 hover:bg-white">
                  {selectedFormat === 'all' ? 'All Class Types' : selectedFormat}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white shadow-lg border-0 max-h-96 overflow-auto">
                {availableFormats.map(format => (
                  <DropdownMenuItem
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className="hover:bg-purple-50"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {format === 'all' ? 'All Class Types' : format}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-[800px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-gradient-to-r from-gray-50 to-purple-50 z-10">
                <TableRow>
                  <TableHead className="w-80 sticky left-0 bg-gradient-to-r from-gray-50 to-purple-50 z-20 border-r font-semibold">
                    Class Type / Schedule Details
                  </TableHead>
                  <TableHead className="text-center min-w-32 font-semibold">Class Name</TableHead>
                  <TableHead className="text-center min-w-24 font-semibold">Day</TableHead>
                  <TableHead className="text-center min-w-24 font-semibold">Time</TableHead>
                  <TableHead className="text-center min-w-32 font-semibold">Location</TableHead>
                  <TableHead className="text-center min-w-28 font-semibold">Trainer</TableHead>
                  <TableHead className="text-center min-w-20 font-semibold">
                    <Tooltip>
                      <TooltipTrigger>Sessions</TooltipTrigger>
                      <TooltipContent>Number of sessions conducted</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-28 font-semibold">
                    <Tooltip>
                      <TooltipTrigger>Class Average</TooltipTrigger>
                      <TooltipContent>Average attendees per session</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-24 font-semibold">
                    <Tooltip>
                      <TooltipTrigger>Fill Rate %</TooltipTrigger>
                      <TooltipContent>Average capacity utilization</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-32 font-semibold">
                    <Tooltip>
                      <TooltipTrigger>Total Revenue</TooltipTrigger>
                      <TooltipContent>Total revenue generated</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-24 font-semibold">
                    <Tooltip>
                      <TooltipTrigger>Late Cancellations</TooltipTrigger>
                      <TooltipContent>Average late cancellations per session</TooltipContent>
                    </Tooltip>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormats.map((format: any) => (
                  <React.Fragment key={format.className}>
                    <TableRow 
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-b-2 border-gray-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50 transition-all duration-200"
                      onClick={() => toggleGroup(format.className)}
                    >
                      <TableCell className="sticky left-0 bg-gradient-to-r from-purple-50/50 to-pink-50/50 z-10 border-r h-12 py-2">
                        <div className="flex items-center gap-3">
                          {expandedGroups.has(format.className) ? 
                            <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          }
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <Star className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-sm">{format.className}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center h-12 py-2 text-sm font-medium">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {format.classesArray.length} schedules
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center h-12 py-2 text-sm">-</TableCell>
                      <TableCell className="text-center h-12 py-2 text-sm">-</TableCell>
                      <TableCell className="text-center h-12 py-2 text-sm">-</TableCell>
                      <TableCell className="text-center h-12 py-2 text-sm">-</TableCell>
                      <TableCell className="text-center h-12 py-2">
                        <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          {format.totalSessions}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center h-12 py-2 text-sm font-bold text-purple-600">
                        {format.classAverage.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center h-12 py-2 text-sm font-medium">
                        <Badge 
                          variant={format.avgFillRate > 80 ? 'default' : format.avgFillRate > 60 ? 'secondary' : 'outline'}
                          className={format.avgFillRate > 80 ? 'bg-green-100 text-green-700' : format.avgFillRate > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                        >
                          {format.avgFillRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center h-12 py-2 text-sm font-medium">
                        {formatCurrency(format.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-center h-12 py-2 text-sm font-medium">
                        {format.totalLateCancellations}
                      </TableCell>
                    </TableRow>
                    
                    {expandedGroups.has(format.className) && format.classesArray.map((classGroup: any, index: number) => (
                      <TableRow key={`${format.className}-${index}`} className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 hover:from-gray-100/80 hover:to-purple-100/80">
                        <TableCell className="sticky left-0 bg-gradient-to-r from-gray-50/80 to-purple-50/80 z-10 border-r h-10 py-1 pl-12">
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-gray-700 truncate font-medium">
                              {classGroup.className} Schedule
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center h-10 py-1 text-xs font-medium">
                          <Badge variant="outline" className="text-xs bg-white">
                            {classGroup.className}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center h-10 py-1 text-xs">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {classGroup.dayOfWeek}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center h-10 py-1 text-xs">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs">{classGroup.time}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center h-10 py-1 text-xs">
                          <div className="flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <span className="truncate text-xs max-w-28">{classGroup.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center h-10 py-1 text-xs">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            {classGroup.trainerName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center h-10 py-1 text-xs font-medium">
                          {classGroup.sessions}
                        </TableCell>
                        <TableCell className="text-center h-10 py-1 text-xs font-bold text-green-600">
                          {classGroup.classAverage.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center h-10 py-1 text-xs">
                          <Badge 
                            variant={classGroup.fillRate > 80 ? 'default' : classGroup.fillRate > 60 ? 'secondary' : 'outline'}
                            className={`text-xs ${classGroup.fillRate > 80 ? 'bg-green-100 text-green-700' : classGroup.fillRate > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {classGroup.fillRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center h-10 py-1 text-xs">
                          {formatCurrency(classGroup.revenue)}
                        </TableCell>
                        <TableCell className="text-center h-10 py-1 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {classGroup.avgLateCancellations.toFixed(1)}
                          </Badge>
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
    </TooltipProvider>
  );
};
