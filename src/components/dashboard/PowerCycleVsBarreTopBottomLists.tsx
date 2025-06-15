
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Zap } from 'lucide-react';
import { PayrollData, SessionData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface PowerCycleVsBarreTopBottomListsProps {
  data: PayrollData[];
  sessionsData: SessionData[];
  onRowClick: (row: any) => void;
}

export const PowerCycleVsBarreTopBottomLists: React.FC<PowerCycleVsBarreTopBottomListsProps> = ({
  data,
  sessionsData,
  onRowClick
}) => {
  const topCycleTrainers = data
    .filter(trainer => trainer.cyclePaid > 0)
    .sort((a, b) => b.cyclePaid - a.cyclePaid)
    .slice(0, 5);

  const topBarreTrainers = data
    .filter(trainer => trainer.barrePaid > 0)
    .sort((a, b) => b.barrePaid - a.barrePaid)
    .slice(0, 5);

  const cycleSessionsByFillRate = sessionsData
    .filter(session => session.cleanedClass?.toLowerCase().includes('cycle'))
    .sort((a, b) => b.fillPercentage - a.fillPercentage)
    .slice(0, 5);

  const barreSessionsByFillRate = sessionsData
    .filter(session => session.cleanedClass?.toLowerCase().includes('barre'))
    .sort((a, b) => b.fillPercentage - a.fillPercentage)
    .slice(0, 5);

  const ListCard: React.FC<{
    title: string;
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    icon: React.ReactNode;
    gradient: string;
  }> = ({ title, items, renderItem, icon, gradient }) => (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className={`flex items-center gap-3 text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="cursor-pointer" onClick={() => onRowClick(item)}>
            {renderItem(item, index)}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      <ListCard
        title="Top PowerCycle Trainers"
        items={topCycleTrainers}
        icon={<Zap className="w-5 h-5" />}
        gradient="from-purple-600 to-purple-800"
        renderItem={(trainer, index) => (
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                #{index + 1}
              </Badge>
              <div>
                <p className="font-medium text-slate-900">{trainer.teacherName}</p>
                <p className="text-sm text-slate-600">{trainer.cycleSessions} sessions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-purple-700">{formatCurrency(trainer.cyclePaid)}</p>
              <p className="text-xs text-slate-500">avg {trainer.classAverageExclEmpty?.toFixed(1)}</p>
            </div>
          </div>
        )}
      />

      <ListCard
        title="Top Barre Trainers"
        items={topBarreTrainers}
        icon={<Users className="w-5 h-5" />}
        gradient="from-pink-600 to-pink-800"
        renderItem={(trainer, index) => (
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-pink-50 transition-colors">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-200">
                #{index + 1}
              </Badge>
              <div>
                <p className="font-medium text-slate-900">{trainer.teacherName}</p>
                <p className="text-sm text-slate-600">{trainer.barreSessions} sessions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-pink-700">{formatCurrency(trainer.barrePaid)}</p>
              <p className="text-xs text-slate-500">avg {trainer.classAverageExclEmpty?.toFixed(1)}</p>
            </div>
          </div>
        )}
      />

      <ListCard
        title="Best PowerCycle Classes"
        items={cycleSessionsByFillRate}
        icon={<TrendingUp className="w-5 h-5" />}
        gradient="from-purple-600 to-purple-800"
        renderItem={(session, index) => (
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                #{index + 1}
              </Badge>
              <div>
                <p className="font-medium text-slate-900">{session.cleanedClass}</p>
                <p className="text-sm text-slate-600">{session.date} {session.time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-purple-700">{session.fillPercentage?.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">{session.checkedInCount}/{session.capacity}</p>
            </div>
          </div>
        )}
      />

      <ListCard
        title="Best Barre Classes"
        items={barreSessionsByFillRate}
        icon={<TrendingUp className="w-5 h-5" />}
        gradient="from-pink-600 to-pink-800"
        renderItem={(session, index) => (
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-pink-50 transition-colors">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-200">
                #{index + 1}
              </Badge>
              <div>
                <p className="font-medium text-slate-900">{session.cleanedClass}</p>
                <p className="text-sm text-slate-600">{session.date} {session.time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-pink-700">{session.fillPercentage?.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">{session.checkedInCount}/{session.capacity}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
};
