
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionData } from '@/hooks/useSessionsData';
import { BarChart, Compare } from 'lucide-react';

interface SessionsComparisonToolProps {
  data: SessionData[];
}

export const SessionsComparisonTool: React.FC<SessionsComparisonToolProps> = ({ data }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compare className="w-5 h-5 text-purple-600" />
          Class Comparison Tool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Compare Classes & Trainers</h3>
          <p className="text-gray-500 mb-4">Select multiple classes or trainers to compare their performance metrics</p>
          <Button>Select Items to Compare</Button>
        </div>
      </CardContent>
    </Card>
  );
};
