
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { MetricCardData } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  data: MetricCardData;
  delay?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data, delay = 0 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const numericValue = typeof data.value === 'string' 
        ? parseFloat(data.value.replace(/[₹,KLCr]/g, '')) 
        : data.value;
      
      if (!isNaN(numericValue)) {
        const duration = 2000;
        const steps = 60;
        const increment = numericValue / steps;
        let current = 0;
        
        const counter = setInterval(() => {
          current += increment;
          if (current >= numericValue) {
            setAnimatedValue(numericValue);
            clearInterval(counter);
          } else {
            setAnimatedValue(current);
          }
        }, duration / steps);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [data.value, delay]);

  const isPositiveChange = data.change && data.change > 0;
  const isNegativeChange = data.change && data.change < 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={cn(
              "relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer",
              "bg-gradient-to-br from-white via-slate-50 to-slate-100",
              "border-0 shadow-lg backdrop-blur-sm",
              isHovered && "shadow-2xl transform translate-y-[-2px]"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">{data.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {typeof data.value === 'string' ? data.value : animatedValue.toLocaleString('en-IN')}
                    </span>
                    {data.change && (
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        isPositiveChange && "bg-green-100 text-green-700",
                        isNegativeChange && "bg-red-100 text-red-700"
                      )}>
                        {isPositiveChange && <TrendingUp className="w-3 h-3" />}
                        {isNegativeChange && <TrendingDown className="w-3 h-3" />}
                        {Math.abs(data.change).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: isHovered ? '100%' : '70%' }}
                />
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs p-4">
          <div className="space-y-2">
            <p className="font-medium">{data.description}</p>
            <p className="text-xs text-slate-600">
              <strong>Calculation:</strong> {data.calculation}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
