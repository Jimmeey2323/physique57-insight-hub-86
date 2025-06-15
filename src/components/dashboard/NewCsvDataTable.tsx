
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNewCsvData, NewClientData } from '@/hooks/useNewCsvData';
import { Loader2, TrendingUp, Users, Target } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

export const NewCsvDataTable: React.FC = () => {
  const { data, loading, error } = useNewCsvData();
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');

  if (loading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading client data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="text-center p-12">
          <p className="text-red-600">Error loading data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const renderMetricTable = (metric: keyof NewClientData, title: string, formatValue?: (value: any) => string) => {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100">
              <TableHead className="font-bold text-blue-800 sticky left-0 bg-blue-50 z-10">Location</TableHead>
              {data[0]?.months.map((month, index) => (
                <TableHead key={month} className="font-bold text-blue-800 text-center min-w-[100px]">
                  {month.replace('2025-', '').replace('2024-', '')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((locationData, index) => (
              <TableRow key={locationData.location} className="hover:bg-blue-50/50 h-8 max-h-8">
                <TableCell className="font-medium sticky left-0 bg-white z-10 border-r py-2">
                  {locationData.location.replace('Kwality House, Kemps Corner', 'Kwality House').replace('Supreme HQ, Bandra', 'Supreme HQ')}
                </TableCell>
                {(locationData[metric] as any[]).map((value, monthIndex) => (
                  <TableCell key={monthIndex} className="text-center py-2">
                    {formatValue ? formatValue(value) : value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderOverviewTable = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data.map((locationData) => (
          <Card key={locationData.location} className="bg-gradient-to-br from-white to-blue-50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-blue-800">
                {locationData.location.replace('Kwality House, Kemps Corner', 'Kwality House').replace('Supreme HQ, Bandra', 'Supreme HQ')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(locationData.newMembers.reduce((a, b) => a + b, 0))}</div>
                  <div className="text-xs text-blue-500">Total New Members</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{formatNumber(locationData.retained.reduce((a, b) => a + b, 0))}</div>
                  <div className="text-xs text-green-500">Total Retained</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">{formatNumber(locationData.converted.reduce((a, b) => a + b, 0))}</div>
                  <div className="text-xs text-purple-500">Total Converted</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">{formatNumber(locationData.ltv.reduce((a, b) => a + b, 0))}</div>
                  <div className="text-xs text-orange-500">Total LTV</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Users className="w-6 h-6" />
          Client Conversion & Retention Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-gradient-to-r from-blue-50 to-blue-100 mb-6">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="newMembers" className="text-sm">New Members</TabsTrigger>
            <TabsTrigger value="retained" className="text-sm">Retained</TabsTrigger>
            <TabsTrigger value="converted" className="text-sm">Converted</TabsTrigger>
            <TabsTrigger value="retention" className="text-sm">Retention %</TabsTrigger>
            <TabsTrigger value="conversion" className="text-sm">Conversion %</TabsTrigger>
            <TabsTrigger value="ltv" className="text-sm">LTV</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderOverviewTable()}
          </TabsContent>

          <TabsContent value="newMembers" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">New Members by Month</h3>
            </div>
            {renderMetricTable('newMembers', 'New Members', (value) => formatNumber(value))}
          </TabsContent>

          <TabsContent value="retained" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Retained Members by Month</h3>
            </div>
            {renderMetricTable('retained', 'Retained Members', (value) => formatNumber(value))}
          </TabsContent>

          <TabsContent value="converted" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-800">Converted Members by Month</h3>
            </div>
            {renderMetricTable('converted', 'Converted Members', (value) => formatNumber(value))}
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-green-100 text-green-800">Retention Rate</Badge>
              <h3 className="text-lg font-semibold text-green-800">Monthly Retention Percentage</h3>
            </div>
            {renderMetricTable('retention', 'Retention %')}
          </TabsContent>

          <TabsContent value="conversion" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-blue-100 text-blue-800">Conversion Rate</Badge>
              <h3 className="text-lg font-semibold text-blue-800">Monthly Conversion Percentage</h3>
            </div>
            {renderMetricTable('conversion', 'Conversion %')}
          </TabsContent>

          <TabsContent value="ltv" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-orange-100 text-orange-800">Lifetime Value</Badge>
              <h3 className="text-lg font-semibold text-orange-800">Customer Lifetime Value by Month</h3>
            </div>
            {renderMetricTable('ltv', 'LTV', (value) => `₹${formatNumber(value)}`)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
