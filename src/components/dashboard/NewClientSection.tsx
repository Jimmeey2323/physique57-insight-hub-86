
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, DollarSign, UserCheck, Calendar, Eye, Filter, X } from 'lucide-react';
import { useNewClientData, NewClientData } from '@/hooks/useNewClientData';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { MonthOnMonthTrainerTable } from './MonthOnMonthTrainerTable';

export const NewClientSection = () => {
  const { data: rawData, isLoading, error } = useNewClientData();
  const [activeLocation, setActiveLocation] = useState<string>('all');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [activeMetric, setActiveMetric] = useState<'new' | 'converted' | 'retained' | 'ltv'>('new');

  // Parse date helper function
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    try {
      // Handle DD/MM/YYYY HH:mm:ss format
      const parts = dateString.split(' ');
      const datePart = parts[0];
      const [day, month, year] = datePart.split('/');
      
      if (!day || !month || !year) return null;
      
      // Convert strings to numbers and validate
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null;
      if (monthNum < 1 || monthNum > 12) return null;
      if (dayNum < 1 || dayNum > 31) return null;
      
      // Create date (month is 0-indexed in Date constructor)
      const parsedDate = new Date(yearNum, monthNum - 1, dayNum);
      
      // Validate the date
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

    return filtered;
  }, [rawData, activeLocation]);

  // Calculate metrics with stable memoization
  const metrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        uniqueMembers: 0,
        conversionRate: 0,
        avgLTV: 0,
        retentionRate: 0
      };
    }

    const uniqueMembers = new Set(filteredData.map(item => item.memberId)).size;
    const convertedMembers = filteredData.filter(item => item.conversionStatus === 'Converted').length;
    const retainedMembers = filteredData.filter(item => item.retentionStatus === 'Retained').length;
    const totalLTV = filteredData.reduce((sum, item) => sum + (item.ltv || 0), 0);

    return {
      uniqueMembers,
      conversionRate: uniqueMembers > 0 ? (convertedMembers / uniqueMembers) * 100 : 0,
      avgLTV: uniqueMembers > 0 ? totalLTV / uniqueMembers : 0,
      retentionRate: uniqueMembers > 0 ? (retainedMembers / uniqueMembers) * 100 : 0
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
        trainerDataForTable: {}
      };
    }

    const monthlyData: Record<string, { new: number; converted: number; retained: number; ltv: number }> = {};
    const trainerData: Record<string, Record<string, { new: number; converted: number; retained: number; ltv: number }>> = {};

    filteredData.forEach(item => {
      const date = parseDate(item.firstVisitDate);
      
      if (!date) {
        return; // Skip invalid dates silently
      }

      const monthKey = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear().toString().slice(-2)}`;
      const trainer = item.trainerName || 'Unknown';

      // Initialize monthly data
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { new: 0, converted: 0, retained: 0, ltv: 0 };
      }

      // Initialize trainer data
      if (!trainerData[trainer]) {
        trainerData[trainer] = {};
      }
      if (!trainerData[trainer][monthKey]) {
        trainerData[trainer][monthKey] = { new: 0, converted: 0, retained: 0, ltv: 0 };
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
    });

    // Helper function to get month number
    const getMonthNumber = (monthStr: string): number => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(monthStr);
    };

    // Sort months chronologically
    const months = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('-');
      const [monthB, yearB] = b.split('-');
      const dateA = new Date(2000 + parseInt(yearA), getMonthNumber(monthA));
      const dateB = new Date(2000 + parseInt(yearB), getMonthNumber(monthB));
      return dateA.getTime() - dateB.getTime();
    });

    const trainers = Object.keys(trainerData).filter(t => t !== 'Unknown');
    
    // Calculate trainer totals
    const trainerTotals: Record<string, { new: number; converted: number; retained: number; ltv: number }> = {};
    trainers.forEach(trainer => {
      trainerTotals[trainer] = months.reduce((acc, month) => {
        const data = trainerData[trainer][month] || { new: 0, converted: 0, retained: 0, ltv: 0 };
        return {
          new: acc.new + data.new,
          converted: acc.converted + data.converted,
          retained: acc.retained + data.retained,
          ltv: acc.ltv + data.ltv
        };
      }, { new: 0, converted: 0, retained: 0, ltv: 0 });
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
        const data = trainerData[trainer][month] || { new: 0, converted: 0, retained: 0, ltv: 0 };
        trainerDataForTable[trainer][month] = data[activeMetric];
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
      trainerDataForTable
    };
  }, [filteredData, activeMetric]);

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
      {/* Location Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Location Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Locations' },
              { key: 'kwality', label: 'Kwality House' },
              { key: 'supreme', label: 'Supreme HQ' },
              { key: 'other', label: 'Other Locations' }
            ].map(location => (
              <Button
                key={location.key}
                variant={activeLocation === location.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveLocation(location.key)}
                className="transition-all duration-200"
              >
                {location.label}
                {activeLocation === location.key && (
                  <X className="w-3 h-3 ml-2" onClick={(e) => {
                    e.stopPropagation();
                    setActiveLocation('all');
                  }} />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
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

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
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

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
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

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
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
      </div>

      {/* Metric Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Metric for Table View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'new' as const, label: 'New Members' },
              { key: 'converted' as const, label: 'Converted Members' },
              { key: 'retained' as const, label: 'Retained Members' },
              { key: 'ltv' as const, label: 'LTV' }
            ].map(metric => (
              <Button
                key={metric.key}
                variant={activeMetric === metric.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveMetric(metric.key)}
                className="transition-all duration-200"
              >
                {metric.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trainer Performance Table */}
      <MonthOnMonthTrainerTable
        data={monthlyAnalysis.trainerDataForTable}
        months={monthlyAnalysis.months}
        trainers={monthlyAnalysis.trainers}
        onRowClick={(trainer) => setSelectedTrainer(trainer)}
        defaultMetric={activeMetric}
      />

      {/* Top/Bottom Trainers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Trainers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top 5 Trainers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {monthlyAnalysis.topTrainers.map((trainer, index) => (
              <div key={trainer} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{trainer}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {formatNumber(monthlyAnalysis.trainerTotals[trainer]?.new || 0)} new
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(monthlyAnalysis.trainerTotals[trainer]?.ltv || 0)} LTV
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTrainer(trainer)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bottom Trainers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
              Bottom 5 Trainers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {monthlyAnalysis.bottomTrainers.map((trainer, index) => (
              <div key={trainer} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{trainer}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {formatNumber(monthlyAnalysis.trainerTotals[trainer]?.new || 0)} new
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(monthlyAnalysis.trainerTotals[trainer]?.ltv || 0)} LTV
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTrainer(trainer)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
