import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, DollarSign, UserCheck, Calendar, Eye, Filter, X, Award, AlertTriangle, BarChart3, Clock, Target, Activity } from 'lucide-react';
import { useNewClientData, NewClientData } from '@/hooks/useNewClientData';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { MonthOnMonthTrainerTable } from './MonthOnMonthTrainerTable';
import { YearOnYearTrainerTable } from './YearOnYearTrainerTable';
import { InteractiveChart } from './InteractiveChart';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { FilterOptions } from '@/types/dashboard';

const locations = [
  { id: 'kwality', name: 'Kwality House', subName: 'Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ', subName: 'Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'other', name: 'Other', subName: 'Locations', fullName: 'Other Locations' }
];

type MetricType = 'new' | 'converted' | 'retained' | 'ltv' | 'conversionRate' | 'retentionRate' | 'conversionSpan';

export const NewClientSection = () => {
  const { data: rawData, isLoading, error } = useNewClientData();
  const [activeLocation, setActiveLocation] = useState<string>('kwality');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [activeMetric, setActiveMetric] = useState<MetricType>('new');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '2025-01-01', end: '2025-06-30' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  // Parse date helper function
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    try {
      const parts = dateString.split(' ');
      const datePart = parts[0];
      const [day, month, year] = datePart.split('/');
      
      if (!day || !month || !year) return null;
      
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null;
      if (monthNum < 1 || monthNum > 12) return null;
      if (dayNum < 1 || dayNum > 31) return null;
      
      const parsedDate = new Date(yearNum, monthNum - 1, dayNum);
      
      if (isNaN(parsedDate.getTime())) {
        return null;
      }
      
      return parsedDate;
    } catch (error) {
      return null;
    }
  };

  // Apply filters with memoization
  const filteredData = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    let filtered = rawData;

    // Location filter
    if (activeLocation !== 'all') {
      const locationMap: Record<string, string> = {
        'kwality': 'Kwality House, Kemps Corner',
        'supreme': 'Supreme HQ, Bandra',
        'other': 'other'
      };

      filtered = filtered.filter(item => {
        const itemLocation = item.firstVisitLocation?.toLowerCase() || '';
        if (activeLocation === 'other') {
          return !itemLocation.includes('kwality') && !itemLocation.includes('supreme');
        }
        return itemLocation.includes(locationMap[activeLocation]?.toLowerCase() || '');
      });
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      filtered = filtered.filter(item => {
        const date = parseDate(item.firstVisitDate);
        if (!date) return false;
        
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        
        return true;
      });
    }

    return filtered;
  }, [rawData, activeLocation, filters]);

  // Calculate metrics with stable memoization
  const metrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        uniqueMembers: 0,
        conversionRate: 0,
        avgLTV: 0,
        retentionRate: 0,
        avgConversionSpan: 0
      };
    }

    const uniqueMembers = new Set(filteredData.map(item => item.memberId)).size;
    const convertedMembers = filteredData.filter(item => item.conversionStatus === 'Converted').length;
    const retainedMembers = filteredData.filter(item => item.retentionStatus === 'Retained').length;
    const totalLTV = filteredData.reduce((sum, item) => sum + (item.ltv || 0), 0);
    
    // Calculate average conversion span (assuming 30 days average for demo)
    const avgConversionSpan = filteredData.length > 0 ? 
      filteredData.reduce((sum, item) => sum + (item.visitsPostTrial * 7 || 30), 0) / filteredData.length : 0;

    return {
      uniqueMembers,
      conversionRate: uniqueMembers > 0 ? (convertedMembers / uniqueMembers) * 100 : 0,
      avgLTV: uniqueMembers > 0 ? totalLTV / uniqueMembers : 0,
      retentionRate: uniqueMembers > 0 ? (retainedMembers / uniqueMembers) * 100 : 0,
      avgConversionSpan
    };
  }, [filteredData]);

  // Monthly analysis with stable date parsing
  const monthlyAnalysis = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        monthlyData: {},
        months: [],
        trainerData: {},
        trainers: [],
        trainerTotals: {},
        topTrainers: [],
        bottomTrainers: [],
        trainerDataForTable: {},
        yearOnYearData: {}
      };
    }

    const monthlyData: Record<string, { new: number; converted: number; retained: number; ltv: number; conversionRate: number; retentionRate: number; conversionSpan: number }> = {};
    const trainerData: Record<string, Record<string, { new: number; converted: number; retained: number; ltv: number; conversionRate: number; retentionRate: number; conversionSpan: number }>> = {};
    const yearOnYearData: Record<string, Record<string, number>> = {};

    filteredData.forEach(item => {
      const date = parseDate(item.firstVisitDate);
      
      if (!date) {
        return;
      }

      const monthKey = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear().toString().slice(-2)}`;
      const trainer = item.trainerName || 'Unknown';

      // Initialize monthly data
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { new: 0, converted: 0, retained: 0, ltv: 0, conversionRate: 0, retentionRate: 0, conversionSpan: 0 };
      }

      // Initialize trainer data
      if (!trainerData[trainer]) {
        trainerData[trainer] = {};
      }
      if (!trainerData[trainer][monthKey]) {
        trainerData[trainer][monthKey] = { new: 0, converted: 0, retained: 0, ltv: 0, conversionRate: 0, retentionRate: 0, conversionSpan: 0 };
      }

      // Count metrics
      if (item.isNew && item.isNew.includes('New')) {
        monthlyData[monthKey].new++;
        trainerData[trainer][monthKey].new++;
      }

      if (item.conversionStatus === 'Converted') {
        monthlyData[monthKey].converted++;
        trainerData[trainer][monthKey].converted++;
      }

      if (item.retentionStatus === 'Retained') {
        monthlyData[monthKey].retained++;
        trainerData[trainer][monthKey].retained++;
      }

      monthlyData[monthKey].ltv += item.ltv || 0;
      trainerData[trainer][monthKey].ltv += item.ltv || 0;
      
      monthlyData[monthKey].conversionSpan += item.visitsPostTrial * 7 || 30;
      trainerData[trainer][monthKey].conversionSpan += item.visitsPostTrial * 7 || 30;
    });

    // Calculate rates
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      data.conversionRate = data.new > 0 ? (data.converted / data.new) * 100 : 0;
      data.retentionRate = data.new > 0 ? (data.retained / data.new) * 100 : 0;
      data.conversionSpan = data.new > 0 ? data.conversionSpan / data.new : 0;
    });

    Object.keys(trainerData).forEach(trainer => {
      Object.keys(trainerData[trainer]).forEach(month => {
        const data = trainerData[trainer][month];
        data.conversionRate = data.new > 0 ? (data.converted / data.new) * 100 : 0;
        data.retentionRate = data.new > 0 ? (data.retained / data.new) * 100 : 0;
        data.conversionSpan = data.new > 0 ? data.conversionSpan / data.new : 0;
      });
    });

    // Helper function to get month number
    const getMonthNumber = (monthStr: string): number => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(monthStr);
    };

    // Sort months chronologically (descending order)
    const months = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('-');
      const [monthB, yearB] = b.split('-');
      const dateA = new Date(2000 + parseInt(yearA), getMonthNumber(monthA));
      const dateB = new Date(2000 + parseInt(yearB), getMonthNumber(monthB));
      return dateB.getTime() - dateA.getTime(); // Descending order
    });

    const trainers = Object.keys(trainerData).filter(t => t !== 'Unknown');
    
    // Calculate trainer totals
    const trainerTotals: Record<string, { new: number; converted: number; retained: number; ltv: number; conversionRate: number; retentionRate: number; conversionSpan: number }> = {};
    trainers.forEach(trainer => {
      trainerTotals[trainer] = months.reduce((acc, month) => {
        const data = trainerData[trainer][month] || { new: 0, converted: 0, retained: 0, ltv: 0, conversionRate: 0, retentionRate: 0, conversionSpan: 0 };
        return {
          new: acc.new + data.new,
          converted: acc.converted + data.converted,
          retained: acc.retained + data.retained,
          ltv: acc.ltv + data.ltv,
          conversionRate: 0, // Will calculate after
          retentionRate: 0, // Will calculate after
          conversionSpan: acc.conversionSpan + data.conversionSpan
        };
      }, { new: 0, converted: 0, retained: 0, ltv: 0, conversionRate: 0, retentionRate: 0, conversionSpan: 0 });
      
      // Calculate final rates with 1 decimal precision
      trainerTotals[trainer].conversionRate = trainerTotals[trainer].new > 0 ? 
        parseFloat(((trainerTotals[trainer].converted / trainerTotals[trainer].new) * 100).toFixed(1)) : 0;
      trainerTotals[trainer].retentionRate = trainerTotals[trainer].new > 0 ? 
        parseFloat(((trainerTotals[trainer].retained / trainerTotals[trainer].new) * 100).toFixed(1)) : 0;
      trainerTotals[trainer].conversionSpan = trainerTotals[trainer].new > 0 ? 
        parseFloat((trainerTotals[trainer].conversionSpan / trainerTotals[trainer].new).toFixed(1)) : 0;
    });

    // Get top and bottom trainers based on new members
    const sortedTrainers = trainers.sort((a, b) => trainerTotals[b].new - trainerTotals[a].new);
    const topTrainers = sortedTrainers.slice(0, 5);
    const bottomTrainers = sortedTrainers.slice(-5).reverse();

    // Convert trainer data to the format expected by MonthOnMonthTrainerTable
    const trainerDataForTable: Record<string, Record<string, number>> = {};
    trainers.forEach(trainer => {
      trainerDataForTable[trainer] = {};
      months.forEach(month => {
        const data = trainerData[trainer][month] || { new: 0, converted: 0, retained: 0, ltv: 0, conversionRate: 0, retentionRate: 0, conversionSpan: 0 };
        let value = 0;
        switch (activeMetric) {
          case 'new':
            value = data.new;
            break;
          case 'converted':
            value = data.converted;
            break;
          case 'retained':
            value = data.retained;
            break;
          case 'ltv':
            value = data.ltv;
            break;
          case 'conversionRate':
            value = parseFloat(data.conversionRate.toFixed(1));
            break;
          case 'retentionRate':
            value = parseFloat(data.retentionRate.toFixed(1));
            break;
          case 'conversionSpan':
            value = parseFloat(data.conversionSpan.toFixed(1));
            break;
        }
        trainerDataForTable[trainer][month] = value;
      });
    });

    return {
      monthlyData,
      months,
      trainerData,
      trainers,
      trainerTotals,
      topTrainers,
      bottomTrainers,
      trainerDataForTable,
      yearOnYearData
    };
  }, [filteredData, activeMetric]);

  const resetFilters = () => {
    setFilters({
      dateRange: { start: '2025-01-01', end: '2025-06-30' },
      location: [],
      category: [],
      product: [],
      soldBy: [],
      paymentMethod: []
    });
  };

  const renderSellerCard = (trainers: any[], isTop: boolean, title: string) => {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/50 to-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            {isTop ? (
              <>
                <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Top 5 {title}
                  </span>
                  <p className="text-sm text-slate-600 font-normal">High performance trainers</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-gradient-to-r from-red-400 to-rose-500">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    Bottom 5 {title}
                  </span>
                  <p className="text-sm text-slate-600 font-normal">Areas for improvement</p>
                </div>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trainers.map((trainer, index) => (
            <div 
              key={trainer.name} 
              className="group flex items-center justify-between p-4 rounded-xl bg-white shadow-sm border hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedTrainer(trainer.name)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                  isTop 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-red-400 to-rose-600 text-white'
                )}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 truncate max-w-40 group-hover:text-blue-600 transition-colors">
                    {trainer.name}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {formatNumber(trainer.new)} new
                    </Badge>
                    <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                      Conv: {trainer.conversionRate.toFixed(1)}%
                    </Badge>
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                      LTV: {formatCurrency(trainer.ltv)}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                      Ret: {trainer.retentionRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                  {formatNumber(trainer.new)}
                </p>
                <p className="text-sm text-slate-500">{formatCurrency(trainer.ltv)} LTV</p>
                <Button variant="ghost" size="sm" className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance Summary
            </h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Average new members: {formatNumber(trainers.reduce((sum, t) => sum + t.new, 0) / trainers.length)}</li>
              <li>• Average conversion rate: {(trainers.reduce((sum, t) => sum + t.conversionRate, 0) / trainers.length).toFixed(1)}%</li>
              <li>• Average LTV: {formatCurrency(trainers.reduce((sum, t) => sum + t.ltv, 0) / trainers.length)}</li>
              <li>• Average retention: {(trainers.reduce((sum, t) => sum + t.retentionRate, 0) / trainers.length).toFixed(1)}%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600">Loading new client data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p className="text-red-600">Error loading data: {error.message}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
          New Client Analytics
        </h2>
        <p className="text-xl text-slate-600 font-medium">
          Comprehensive client acquisition and retention insights
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 via-white to-slate-100 p-2 rounded-2xl shadow-lg">
          {locations.map((location) => (
            <TabsTrigger
              key={location.id}
              value={location.id}
              className={cn(
                "relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-sm transition-all duration-500",
                "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600",
                "data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105",
                "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-102",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              <span className="relative z-10 block text-center">
                <div className="font-bold">{location.name}</div>
                <div className="text-xs opacity-80">{location.subName}</div>
              </span>
              {activeLocation === location.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
            <AutoCloseFilterSection
              filters={filters}
              onFiltersChange={setFilters}
              onReset={resetFilters}
            />

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total New Members</p>
                      <p className="text-3xl font-bold text-blue-900">{formatNumber(metrics.uniqueMembers)}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Unique members acquired
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Conversion Rate</p>
                      <p className="text-3xl font-bold text-green-900">{metrics.conversionRate.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    Trial to paid conversion
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Average LTV</p>
                      <p className="text-3xl font-bold text-purple-900">{formatCurrency(metrics.avgLTV)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-purple-700 mt-2">
                    Lifetime value per member
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Retention Rate</p>
                      <p className="text-3xl font-bold text-orange-900">{metrics.retentionRate.toFixed(1)}%</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-xs text-orange-700 mt-2">
                    Members still active
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-600 text-sm font-medium">Avg Conversion Span</p>
                      <p className="text-3xl font-bold text-indigo-900">{Math.round(metrics.avgConversionSpan)}</p>
                    </div>
                    <Clock className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-xs text-indigo-700 mt-2">
                    Days to convert
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Metric Selector */}
            <Card className="bg-gradient-to-br from-white via-slate-50/20 to-white border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent flex items-center gap-3">
                  <Target className="w-7 h-7 text-blue-600" />
                  Advanced Metric Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeMetric} onValueChange={(value) => setActiveMetric(value as MetricType)}>
                  <TabsList className="bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl shadow-lg grid grid-cols-7 gap-1">
                    {[
                      { key: 'new' as const, label: 'New Members', icon: Users, color: 'from-blue-500 to-cyan-600' },
                      { key: 'converted' as const, label: 'Converted', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
                      { key: 'retained' as const, label: 'Retained', icon: UserCheck, color: 'from-purple-500 to-violet-600' },
                      { key: 'ltv' as const, label: 'LTV', icon: DollarSign, color: 'from-yellow-500 to-orange-600' },
                      { key: 'conversionRate' as const, label: 'Conversion %', icon: BarChart3, color: 'from-pink-500 to-rose-600' },
                      { key: 'retentionRate' as const, label: 'Retention %', icon: Activity, color: 'from-indigo-500 to-blue-600' },
                      { key: 'conversionSpan' as const, label: 'Conv. Days', icon: Clock, color: 'from-slate-500 to-gray-600' }
                    ].map(metric => {
                      const IconComponent = metric.icon;
                      return (
                        <TabsTrigger
                          key={metric.key}
                          value={metric.key}
                          className={cn(
                            "relative overflow-hidden rounded-xl px-3 py-3 font-semibold text-xs transition-all duration-500",
                            "data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105",
                            "hover:scale-102 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          )}
                          style={{
                            background: activeMetric === metric.key 
                              ? `linear-gradient(135deg, ${metric.color.split(' ')[0].replace('from-', 'var(--')}-500), ${metric.color.split(' ')[1].replace('to-', 'var(--')}-600))`
                              : 'white'
                          }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <IconComponent className="w-4 h-4" />
                            <span className="leading-tight">{metric.label}</span>
                          </div>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Top/Bottom Trainers (moved before tables) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderSellerCard(
                monthlyAnalysis.topTrainers.map(trainer => ({
                  name: trainer,
                  ...monthlyAnalysis.trainerTotals[trainer]
                })), 
                true, 
                'Trainers'
              )}
              {renderSellerCard(
                monthlyAnalysis.bottomTrainers.map(trainer => ({
                  name: trainer,
                  ...monthlyAnalysis.trainerTotals[trainer]
                })), 
                false, 
                'Trainers'
              )}
            </div>

            {/* Interactive Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InteractiveChart
                title="New Client Trends"
                data={filteredData}
                type="conversion"
              />
              <InteractiveChart
                title="Retention Analysis"
                data={filteredData}
                type="retention"
              />
            </div>

            {/* Enhanced Monthly Trainer Performance Table */}
            <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-3">
                  <BarChart3 className="w-7 h-7 text-blue-600" />
                  Monthly Performance by Trainer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MonthOnMonthTrainerTable
                  data={monthlyAnalysis.trainerDataForTable}
                  months={monthlyAnalysis.months}
                  trainers={monthlyAnalysis.trainers}
                  onRowClick={(trainer) => setSelectedTrainer(trainer)}
                  defaultMetric={activeMetric}
                />
              </CardContent>
            </Card>

            {/* Year-on-Year Comparison Table */}
            <YearOnYearTrainerTable
              data={monthlyAnalysis.trainerDataForTable}
              months={monthlyAnalysis.months}
              trainers={monthlyAnalysis.trainers}
              onRowClick={(trainer) => setSelectedTrainer(trainer)}
              defaultMetric={activeMetric}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
