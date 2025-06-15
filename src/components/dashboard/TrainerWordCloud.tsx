
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface TrainerWordCloudProps {
  data: Array<{
    name: string;
    conversion: number;
    totalValue: number;
    sessions: number;
  }>;
}

export const TrainerWordCloud = ({ data }: TrainerWordCloudProps) => {
  const processedTrainers = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const maxConversion = Math.max(...data.map(d => d.conversion));
    const minConversion = Math.min(...data.map(d => d.conversion));
    
    return data.map(trainer => {
      const normalizedSize = ((trainer.conversion - minConversion) / (maxConversion - minConversion)) * 60 + 20;
      const intensity = (trainer.conversion / maxConversion) * 100;
      
      return {
        ...trainer,
        fontSize: normalizedSize,
        opacity: Math.max(0.3, intensity / 100),
        color: intensity > 75 ? '#10b981' : intensity > 50 ? '#3b82f6' : intensity > 25 ? '#f59e0b' : '#ef4444'
      };
    }).sort((a, b) => b.conversion - a.conversion);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6 text-center text-slate-600">
          No trainer data available for word cloud
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Trainer Conversion Ranking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 flex flex-wrap items-center justify-center gap-2 p-4 overflow-hidden">
          {processedTrainers.map((trainer, index) => (
            <div
              key={trainer.name}
              className="transition-all duration-300 hover:scale-110 cursor-pointer text-center"
              style={{
                fontSize: `${trainer.fontSize}px`,
                color: trainer.color,
                opacity: trainer.opacity,
                fontWeight: index < 3 ? 'bold' : 'normal',
                textShadow: index < 3 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
              title={`${trainer.name}: ${trainer.conversion}% conversion rate`}
            >
              {trainer.name}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-slate-600">High (75%+)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-slate-600">Good (50-75%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-slate-600">Fair (25-50%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-slate-600">Low (&lt;25%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
