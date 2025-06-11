
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target, Repeat, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface KPICardsProps {
  data: any[];
  loading: boolean;
}

const KPICards = ({ data, loading }: KPICardsProps) => {
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  };

  const calculateMetrics = () => {
    if (!data || data.length === 0) return {};

    const totalRevenue = data.reduce((sum, item) => sum + (item['Payment Value'] || 0), 0);
    const totalTransactions = data.length;
    const uniqueMembers = new Set(data.map(item => item['Member ID'])).size;
    const avgTransactionValue = totalRevenue / totalTransactions;
    const revenuePerMember = totalRevenue / uniqueMembers;

    return {
      totalRevenue,
      totalTransactions,
      uniqueMembers,
      avgTransactionValue,
      revenuePerMember,
      avgUnitValue: avgTransactionValue, // Simplified for demo
      conversionRate: 85.2, // Demo value
      growthRate: 12.5, // Demo value
    };
  };

  const metrics = calculateMetrics();

  const kpiData = [
    {
      title: 'Total Revenue',
      value: metrics.totalRevenue || 0,
      format: 'currency',
      icon: DollarSign,
      trend: 12.5,
      color: 'from-green-500 to-green-600',
      description: 'Total revenue for selected period'
    },
    {
      title: 'Avg Transaction Value',
      value: metrics.avgTransactionValue || 0,
      format: 'currency',
      icon: ShoppingCart,
      trend: 8.3,
      color: 'from-blue-500 to-blue-600',
      description: 'Average value per transaction'
    },
    {
      title: 'Unique Members',
      value: metrics.uniqueMembers || 0,
      format: 'number',
      icon: Users,
      trend: 15.2,
      color: 'from-purple-500 to-purple-600',
      description: 'Number of unique members'
    },
    {
      title: 'Total Transactions',
      value: metrics.totalTransactions || 0,
      format: 'number',
      icon: CreditCard,
      trend: 6.8,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Total number of transactions'
    },
    {
      title: 'Revenue per Member',
      value: metrics.revenuePerMember || 0,
      format: 'currency',
      icon: Target,
      trend: -2.1,
      color: 'from-orange-500 to-orange-600',
      description: 'Average revenue per member'
    },
    {
      title: 'Conversion Rate',
      value: metrics.conversionRate || 0,
      format: 'percentage',
      icon: TrendingUp,
      trend: 4.2,
      color: 'from-teal-500 to-teal-600',
      description: 'Lead to sale conversion rate'
    },
    {
      title: 'Growth Rate',
      value: metrics.growthRate || 0,
      format: 'percentage',
      icon: Repeat,
      trend: 18.7,
      color: 'from-pink-500 to-pink-600',
      description: 'Month-over-month growth'
    },
    {
      title: 'Average Unit Value',
      value: metrics.avgUnitValue || 0,
      format: 'currency',
      icon: DollarSign,
      trend: 5.9,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Average value per unit sold'
    },
  ];

  useEffect(() => {
    if (!loading) {
      kpiData.forEach((kpi, index) => {
        setTimeout(() => {
          const startValue = animatedValues[kpi.title] || 0;
          const endValue = kpi.value;
          const duration = 1000;
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (endValue - startValue) * easeOutCubic;

            setAnimatedValues(prev => ({
              ...prev,
              [kpi.title]: currentValue
            }));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          animate();
        }, index * 100);
      });
    }
  }, [data, loading]);

  const formatValue = (value: number, format: string) => {
    const animatedValue = animatedValues[kpiData.find(k => k.value === value)?.title || ''] || 0;
    
    switch (format) {
      case 'currency':
        return formatCurrency(animatedValue);
      case 'percentage':
        return `${animatedValue.toFixed(1)}%`;
      default:
        return Math.round(animatedValue).toLocaleString();
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="bg-slate-900/50 border-slate-800 p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded mb-3"></div>
            <div className="h-8 bg-slate-700 rounded mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon;
        const isPositive = kpi.trend > 0;
        
        return (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm p-6 hover:bg-slate-800/50 transition-all duration-300 relative overflow-hidden">
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${kpi.color} bg-opacity-20`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{Math.abs(kpi.trend)}%</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-400">{kpi.title}</p>
                  <p className="text-2xl font-bold text-white">
                    {formatValue(kpi.value, kpi.format)}
                  </p>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-slate-800 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <p className="text-xs text-slate-300">{kpi.description}</p>
                  <div className="text-xs text-slate-400 mt-1">
                    Calculation: {kpi.format === 'currency' ? 'Sum of payment values' : 'Count of unique records'}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPICards;
