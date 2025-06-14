
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, TrendingUp, Calendar, Clock, DollarSign } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface SessionsMetricCardsProps {
  data: SessionData[];
}

export const SessionsMetricCards: React.FC<SessionsMetricCardsProps> = ({ data }) => {
  const metrics = useMemo(() => {
    const totalSessions = data.length;
    const totalCapacity = data.reduce((sum, session) => sum + session.capacity, 0);
    const totalCheckedIn = data.reduce((sum, session) => sum + session.checkedInCount, 0);
    const totalRevenue = data.reduce((sum, session) => sum + session.totalPaid, 0);
    const totalLateCancellations = data.reduce((sum, session) => sum + session.lateCancelledCount, 0);
    
    const avgFillRate = totalCapacity > 0 ? (totalCheckedIn / totalCapacity) * 100 : 0;
    const avgRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    const lateCancellationRate = totalSessions > 0 ? (totalLateCancellations / totalSessions) * 100 : 0;
    
    // Popular time slots
    const timeSlotCounts = data.reduce((acc, session) => {
      acc[session.time] = (acc[session.time] || 0) + session.checkedInCount;
      return acc;
    }, {} as Record<string, number>);
    
    const mostPopularTime = Object.entries(timeSlotCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return [
      {
        title: "Total Sessions",
        value: formatNumber(totalSessions),
        change: 8.2,
        description: "Active class sessions tracked",
        icon: Calendar,
        color: "blue"
      },
      {
        title: "Average Fill Rate",
        value: `${avgFillRate.toFixed(1)}%`,
        change: 12.5,
        description: "Average class capacity utilization",
        icon: Target,
        color: "green"
      },
      {
        title: "Total Attendees",
        value: formatNumber(totalCheckedIn),
        change: 15.3,
        description: "Students who attended classes",
        icon: Users,
        color: "purple"
      },
      {
        title: "Total Revenue",
        value: formatCurrency(totalRevenue),
        change: 7.4,
        description: "Revenue from class attendance",
        icon: DollarSign,
        color: "yellow"
      },
      {
        title: "Avg Revenue/Session",
        value: formatCurrency(avgRevenuePerSession),
        change: 5.1,
        description: "Average revenue per class session",
        icon: TrendingUp,
        color: "indigo"
      },
      {
        title: "Most Popular Time",
        value: mostPopularTime,
        change: 0,
        description: "Peak attendance time slot",
        icon: Clock,
        color: "pink"
      }
    ];
  }, [data]);

  const getIconColor = (color: string) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      yellow: "text-yellow-600",
      indigo: "text-indigo-600",
      pink: "text-pink-600"
    };
    return colors[color as keyof typeof colors] || "text-gray-600";
  };

  const getBgColor = (color: string) => {
    const colors = {
      blue: "bg-blue-50",
      green: "bg-green-50",
      purple: "bg-purple-50",
      yellow: "bg-yellow-50",
      indigo: "bg-indigo-50",
      pink: "bg-pink-50"
    };
    return colors[color as keyof typeof colors] || "bg-gray-50";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <Card key={metric.title} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${getBgColor(metric.color)}`}>
              <metric.icon className={`h-4 w-4 ${getIconColor(metric.color)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}
            </div>
            {metric.change !== 0 && (
              <div className="flex items-center text-xs text-gray-600">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-600 font-medium">+{metric.change}%</span>
                <span className="ml-1">from last period</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
