
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Target, Package, CreditCard, PieChart, BarChart3 } from 'lucide-react';

interface SalesAnimatedMetricCardsProps {
  data: SalesData[];
}

export const SalesAnimatedMetricCards: React.FC<SalesAnimatedMetricCardsProps> = ({ data }) => {
  const metrics = useMemo(() => {
    const totalRevenue = data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalVAT = data.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
    const netRevenue = totalRevenue - totalVAT;
    const totalTransactions = data.length;
    const uniqueMembers = new Set(data.map(item => item.memberId)).size;
    const totalUnits = data.length;
    const atv = totalRevenue / totalTransactions || 0;
    const auv = totalRevenue / totalUnits || 0;
    const asv = totalRevenue / uniqueMembers || 0;
    const upt = totalUnits / totalTransactions || 0;
    const uniqueProducts = new Set(data.map(item => item.cleanedProduct)).size;

    return [
      {
        title: 'Gross Revenue',
        value: formatCurrency(totalRevenue),
        change: 12.5,
        icon: DollarSign,
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Net Revenue',
        value: formatCurrency(netRevenue),
        change: 8.2,
        icon: Target,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Total Transactions',
        value: formatNumber(totalTransactions),
        change: 15.3,
        icon: ShoppingCart,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Average Ticket Value',
        value: formatCurrency(atv),
        change: -2.1,
        icon: BarChart3,
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        title: 'Average Unit Value',
        value: formatCurrency(auv),
        change: 5.7,
        icon: Package,
        color: 'from-teal-500 to-teal-600',
        bgColor: 'bg-teal-50'
      },
      {
        title: 'Unique Members',
        value: formatNumber(uniqueMembers),
        change: 18.9,
        icon: Users,
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-50'
      },
      {
        title: 'Average Spend Value',
        value: formatCurrency(asv),
        change: 7.4,
        icon: CreditCard,
        color: 'from-pink-500 to-pink-600',
        bgColor: 'bg-pink-50'
      },
      {
        title: 'Units per Transaction',
        value: upt.toFixed(1),
        change: 3.2,
        icon: PieChart,
        color: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-cyan-50'
      },
      {
        title: 'Total VAT',
        value: formatCurrency(totalVAT),
        change: 4.1,
        icon: DollarSign,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50'
      }
    ];
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.change > 0;
        
        return (
          <Card 
            key={metric.title}
            className={`${metric.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
                  <div className="flex items-center">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
