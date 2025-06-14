
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Award, AlertTriangle } from 'lucide-react';
import { formatNumber, formatPercentage, formatCurrency } from '@/utils/formatters';

interface LeadTopBottomItem {
  name: string;
  value: number;
  extra: string;
  conversionRate?: number;
  ltv?: number;
}

interface LeadTopBottomListsProps {
  title: string;
  items: LeadTopBottomItem[];
  variant: 'top' | 'bottom';
  type?: 'source' | 'associate' | 'stage';
}

export const LeadTopBottomLists: React.FC<LeadTopBottomListsProps> = ({
  title,
  items,
  variant,
  type = 'source'
}) => {
  const getIcon = () => {
    if (variant === 'top') {
      return type === 'source' ? <TrendingUp className="w-5 h-5" /> : <Award className="w-5 h-5" />;
    }
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getCardStyle = () => {
    if (variant === 'top') {
      return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
    }
    return 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200';
  };

  const getHeaderStyle = () => {
    if (variant === 'top') {
      return 'text-green-800 border-green-100';
    }
    return 'text-orange-800 border-orange-100';
  };

  const getItemStyle = (index: number) => {
    if (variant === 'top') {
      return index === 0 
        ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300' 
        : 'bg-white/70 border-green-200 hover:bg-green-50/80';
    }
    return index === 0 
      ? 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-300' 
      : 'bg-white/70 border-orange-200 hover:bg-orange-50/80';
  };

  const getRankStyle = (index: number) => {
    if (variant === 'top') {
      return index === 0 
        ? 'bg-green-600 text-white' 
        : 'bg-green-500 text-white';
    }
    return index === 0 
      ? 'bg-orange-600 text-white' 
      : 'bg-orange-500 text-white';
  };

  const getPerformanceIndicator = (item: LeadTopBottomItem) => {
    const conversionRate = parseFloat(item.extra);
    if (conversionRate >= 30) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Excellent</Badge>;
    } else if (conversionRate >= 15) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Good</Badge>;
    } else if (conversionRate >= 5) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Average</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 border-red-300">Needs Improvement</Badge>;
  };

  return (
    <Card className={`shadow-md border-2 ${getCardStyle()}`}>
      <CardHeader className={`border-b ${getHeaderStyle()}`}>
        <CardTitle className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${variant === 'top' ? 'bg-green-600' : 'bg-orange-600'} text-white`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm opacity-80 font-normal">
              {variant === 'top' ? 'Best performing' : 'Needs attention'} {type}s
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.name}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getItemStyle(index)}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(index)}`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {formatNumber(item.value)} leads
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${variant === 'top' ? 'text-green-700' : 'text-orange-700'}`}>
                    {item.extra}
                  </span>
                  <Target className="w-4 h-4 text-gray-500" />
                </div>
                {getPerformanceIndicator(item)}
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <p>No {type} data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
