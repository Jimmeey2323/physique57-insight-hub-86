
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [openFormats, setOpenFormats] = useState<Set<string>>(new Set());

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

  const toggleFormat = (formatName: string) => {
    const newOpenFormats = new Set(openFormats);
    if (newOpenFormats.has(formatName)) {
      newOpenFormats.delete(formatName);
    } else {
      newOpenFormats.add(formatName);
    }
    setOpenFormats(newOpenFormats);
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
              <DropdownMenuContent className="bg-white shadow-lg border-0 max-h-96 overflow-auto z-50">
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
          <div className="max-h-[800px] overflow-auto space-y-4 p-4">
            {filteredFormats.map((format: any) => (
              <Card key={format.className} className="border shadow-sm">
                <Collapsible open={openFormats.has(format.className)}>
                  <CollapsibleTrigger
                    onClick={() => toggleFormat(format.className)}
                    className="w-full"
                  >
                    <CardHeader className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {openFormats.has(format.className) ? 
                            <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          }
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <Star className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-lg font-semibold text-gray-800">{format.className}</h3>
                              <p className="text-sm text-gray-600">{format.classesArray.length} schedules • {format.totalSessions} sessions</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-purple-600">{format.classAverage.toFixed(1)}</div>
                            <div className="text-gray-500">Avg Attendance</div>
                          </div>
                          <div className="text-center">
                            <Badge 
                              variant={format.avgFillRate > 80 ? 'default' : format.avgFillRate > 60 ? 'secondary' : 'outline'}
                              className={format.avgFillRate > 80 ? 'bg-green-100 text-green-700' : format.avgFillRate > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                            >
                              {format.avgFillRate.toFixed(1)}%
                            </Badge>
                            <div className="text-gray-500 mt-1">Fill Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-600">{formatCurrency(format.totalRevenue)}</div>
                            <div className="text-gray-500">Revenue</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-gray-50 to-purple-50">
                            <TableHead className="font-semibold">Day</TableHead>
                            <TableHead className="font-semibold">Time</TableHead>
                            <TableHead className="font-semibold">Location</TableHead>
                            <TableHead className="font-semibold">Trainer</TableHead>
                            <TableHead className="text-center font-semibold">
                              <Tooltip>
                                <TooltipTrigger>Sessions</TooltipTrigger>
                                <TooltipContent>Number of sessions conducted</TooltipContent>
                              </Tooltip>
                            </TableHead>
                            <TableHead className="text-center font-semibold">
                              <Tooltip>
                                <TooltipTrigger>Class Average</TooltipTrigger>
                                <TooltipContent>Average attendees per session</TooltipContent>
                              </Tooltip>
                            </TableHead>
                            <TableHead className="text-center font-semibold">
                              <Tooltip>
                                <TooltipTrigger>Fill Rate %</TooltipTrigger>
                                <TooltipContent>Average capacity utilization</TooltipContent>
                              </Tooltip>
                            </TableHead>
                            <TableHead className="text-center font-semibold">
                              <Tooltip>
                                <TooltipTrigger>Revenue</TooltipTrigger>
                                <TooltipContent>Total revenue generated</TooltipContent>
                              </Tooltip>
                            </TableHead>
                            <TableHead className="text-center font-semibold">
                              <Tooltip>
                                <TooltipTrigger>Late Cancellations</TooltipTrigger>
                                <TooltipContent>Average late cancellations per session</TooltipContent>
                              </Tooltip>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {format.classesArray.map((classGroup: any, index: number) => (
                            <TableRow key={`${format.className}-${index}`} className="hover:bg-gray-50/80">
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  {classGroup.dayOfWeek}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span>{classGroup.time}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="truncate max-w-32">{classGroup.location}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {classGroup.trainerName}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                <Badge variant="default" className="bg-gray-100 text-gray-700">
                                  {classGroup.sessions}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-bold text-green-600">
                                {classGroup.classAverage.toFixed(1)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge 
                                  variant={classGroup.fillRate > 80 ? 'default' : classGroup.fillRate > 60 ? 'secondary' : 'outline'}
                                  className={classGroup.fillRate > 80 ? 'bg-green-100 text-green-700' : classGroup.fillRate > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                                >
                                  {classGroup.fillRate.toFixed(1)}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {formatCurrency(classGroup.revenue)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">
                                  {classGroup.avgLateCancellations.toFixed(1)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
