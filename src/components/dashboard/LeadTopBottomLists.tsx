
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Award, AlertTriangle, Users, Filter } from 'lucide-react';
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
  onCriteriaChange?: (criteria: string) => void;
}

type CriteriaType = 'leads' | 'conversion' | 'ltv';

export const LeadTopBottomLists: React.FC<LeadTopBottomListsProps> = ({
  title,
  items,
  variant,
  type = 'source',
  onCriteriaChange
}) => {
  const [activeCriteria, setActiveCriteria] = useState<CriteriaType>('leads');

  const handleCriteriaChange = (criteria: CriteriaType) => {
    setActiveCriteria(criteria);
    onCriteriaChange?.(criteria);
  };

  const getIcon = () => {
    if (variant === 'top') {
      return type === 'source' ? <TrendingUp className="w-5 h-5" /> : <Award className="w-5 h-5" />;
    }
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getCardStyle = () => {
    if (variant === 'top') {
      return 'bg-white shadow-sm border border-gray-200';
    }
    return 'bg-white shadow-sm border border-gray-200';
  };

  const getHeaderStyle = () => {
    return 'border-b border-gray-100';
  };

  const getItemStyle = (index: number) => {
    if (variant === 'top') {
      return index === 0 
        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150' 
        : 'bg-gray-50 border-gray-200 hover:bg-blue-50/50';
    }
    return index === 0 
      ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-150' 
      : 'bg-gray-50 border-gray-200 hover:bg-orange-50/50';
  };

  const getRankStyle = (index: number) => {
    if (variant === 'top') {
      return index === 0 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-blue-500 text-white';
    }
    return index === 0 
      ? 'bg-orange-600 text-white shadow-md' 
      : 'bg-orange-500 text-white';
  };

  const getPerformanceIndicator = (item: LeadTopBottomItem) => {
    const conversionRate = parseFloat(item.extra);
    if (conversionRate >= 30) {
      return <Badge className="bg-green-100 text-green-800 border-green-300 font-medium">Excellent</Badge>;
    } else if (conversionRate >= 15) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-medium">Good</Badge>;
    } else if (conversionRate >= 5) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 font-medium">Average</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 border-red-300 font-medium">Needs Improvement</Badge>;
  };

  const criteriaOptions = [
    { value: 'leads', label: 'Lead Volume', icon: Users },
    { value: 'conversion', label: 'Conversion Rate', icon: Target },
    { value: 'ltv', label: 'Average LTV', icon: TrendingUp }
  ];

  return (
    <Card className={`shadow-sm border ${getCardStyle()}`}>
      <CardHeader className={`${getHeaderStyle()} space-y-4`}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className={`p-2 rounded-lg ${variant === 'top' ? 'bg-blue-600' : 'bg-orange-600'} text-white`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm opacity-80 font-normal text-gray-600">
                {variant === 'top' ? 'Best performing' : 'Needs attention'} {type}s
              </p>
            </div>
          </CardTitle>
          
          <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
            {items.length} {type}s
          </Badge>
        </div>

        {/* Criteria Selector Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {criteriaOptions.map((criteria) => {
            const IconComponent = criteria.icon;
            return (
              <Button
                key={criteria.value}
                variant={activeCriteria === criteria.value ? "default" : "ghost"}
                size="sm"
                onClick={() => handleCriteriaChange(criteria.value as CriteriaType)}
                className={`flex-1 gap-2 transition-all ${
                  activeCriteria === criteria.value 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{criteria.label}</span>
              </Button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.name}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${getItemStyle(index)}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(index)}`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-base">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {formatNumber(item.value)} leads
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${variant === 'top' ? 'text-blue-700' : 'text-orange-700'}`}>
                    {item.extra}
                  </span>
                  <Target className="w-4 h-4 text-gray-500" />
                </div>
                {getPerformanceIndicator(item)}
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-medium">No {type} data available</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
