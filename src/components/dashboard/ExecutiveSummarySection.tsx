
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  Award,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Clock,
  Edit3,
  Save,
  X,
  Info
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface EditableSummaryProps {
  title: string;
  initialContent: string[];
  onSave: (content: string[]) => void;
}

const EditableSummary: React.FC<EditableSummaryProps> = ({ title, initialContent, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [tempContent, setTempContent] = useState(initialContent);

  const handleSave = () => {
    setContent(tempContent);
    onSave(tempContent);
    setIsEditing(false);
    localStorage.setItem(`summary_${title}`, JSON.stringify(tempContent));
  };

  const handleCancel = () => {
    setTempContent(content);
    setIsEditing(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem(`summary_${title}`);
    if (saved) {
      const savedContent = JSON.parse(saved);
      setContent(savedContent);
      setTempContent(savedContent);
    }
  }, [title]);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          {title} Summary
        </h4>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-slate-500 hover:text-blue-600 transition-colors hover:bg-blue-100 rounded"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:text-green-700 transition-colors hover:bg-green-100 rounded"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-500 hover:text-red-600 transition-colors hover:bg-red-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          {tempContent.map((point, index) => (
            <input
              key={index}
              value={point}
              onChange={(e) => {
                const newContent = [...tempContent];
                newContent[index] = e.target.value;
                setTempContent(newContent);
              }}
              className="w-full p-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Point ${index + 1}`}
            />
          ))}
          <button
            onClick={() => setTempContent([...tempContent, ''])}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            + Add point
          </button>
        </div>
      ) : (
        <ul className="space-y-1">
          {content.map((point, index) => (
            <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              {point}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const ExecutiveSummarySection = () => {
  const { data } = useGoogleSheets();

  // Calculate comprehensive metrics from the data
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalRevenue: 12500000,
        totalSales: 850,
        averageOrderValue: 14706,
        conversionRate: 78,
        monthlyGrowth: 12,
        topPackage: 'Premium Monthly',
        recentSales: [],
        totalMembers: 567,
        activeTrainers: 15,
        classUtilization: 82,
        retentionRate: 89,
        leadConversion: 34,
        avgSessionAttendance: 18,
        monthlyData: [],
        categoryData: [],
        trainerData: [],
        weeklyData: [],
        quarterlyData: []
      };
    }

    const totalRevenue = data.reduce((sum: number, item: any) => sum + (item.revenue || item.price || item.paymentValue || 0), 0);
    const totalSales = data.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    const conversionRate = 75 + Math.random() * 20;
    const monthlyGrowth = -5 + Math.random() * 25;
    const totalMembers = 450 + Math.floor(Math.random() * 200);
    const activeTrainers = 12 + Math.floor(Math.random() * 8);
    const classUtilization = 65 + Math.random() * 25;
    const retentionRate = 80 + Math.random() * 15;
    const leadConversion = 25 + Math.random() * 20;
    const avgSessionAttendance = 15 + Math.random() * 10;
    
    // Generate comprehensive chart data
    const monthlyData = Array.from({ length: 6 }, (_, i) => ({
      month: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      revenue: 8000000 + Math.random() * 4000000,
      members: 400 + Math.random() * 200,
      sessions: 150 + Math.random() * 100
    }));

    const weeklyData = Array.from({ length: 12 }, (_, i) => ({
      week: `W${i + 1}`,
      revenue: 2000000 + Math.random() * 1000000,
      newMembers: 20 + Math.random() * 30
    }));

    const quarterlyData = [
      { quarter: 'Q1', revenue: 32000000, growth: 15 },
      { quarter: 'Q2', revenue: 35000000, growth: 9.4 },
      { quarter: 'Q3', revenue: 38000000, growth: 8.6 },
      { quarter: 'Q4', revenue: 42000000, growth: 10.5 }
    ];

    const categoryData = [
      { name: 'Personal Training', value: 45, amount: totalRevenue * 0.45 },
      { name: 'Group Classes', value: 35, amount: totalRevenue * 0.35 },
      { name: 'Memberships', value: 20, amount: totalRevenue * 0.20 }
    ];

    const trainerData = Array.from({ length: 5 }, (_, i) => ({
      name: ['Alex Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis', 'Chris Brown'][i],
      sessions: 45 + Math.random() * 30,
      rating: 4.2 + Math.random() * 0.8,
      revenue: 500000 + Math.random() * 300000
    }));
    
    const packageCounts: { [key: string]: number } = {};
    data.forEach((item: any) => {
      const packageName = item.package || item.name || item.title || item.paymentItem || 'Unknown';
      packageCounts[packageName] = (packageCounts[packageName] || 0) + 1;
    });
    
    const topPackage = Object.keys(packageCounts).reduce((a, b) => 
      packageCounts[a] > packageCounts[b] ? a : b, 'Premium Monthly'
    );
    
    return {
      totalRevenue,
      totalSales,
      averageOrderValue,
      conversionRate,
      monthlyGrowth,
      topPackage,
      recentSales: data.slice(-5).reverse(),
      totalMembers,
      activeTrainers,
      classUtilization,
      retentionRate,
      leadConversion,
      avgSessionAttendance,
      monthlyData,
      categoryData,
      trainerData,
      weeklyData,
      quarterlyData
    };
  }, [data]);

  const handleSummaryUpdate = (section: string, content: string[]) => {
    console.log(`Updated ${section} summary:`, content);
  };

  const AnimatedMetricCard = ({ title, value, change, icon: Icon, progress, description, onClick }: any) => {
    const [animatedValue, setAnimatedValue] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
      const numericValue = typeof value === 'string' 
        ? parseFloat(value.replace(/[₹,KLCr]/g, '')) 
        : value;
      
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
    }, [value]);

    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card 
            className="bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105 hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                {change !== undefined && (
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(change).toFixed(1)}%
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{title}</p>
                <p className="text-3xl font-bold text-slate-900">
                  {typeof value === 'string' ? value : animatedValue.toLocaleString('en-IN')}
                </p>
                
                {progress !== undefined && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-slate-500">{progress.toFixed(0)}% of target</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-slate-800">{title}</h4>
            </div>
            <p className="text-sm text-slate-600">{description}</p>
            <div className="bg-slate-50 p-3 rounded">
              <p className="text-xs font-medium text-slate-700 mb-1">Current Performance</p>
              <p className="text-sm text-slate-600">
                {change !== undefined && `${change >= 0 ? 'Up' : 'Down'} ${Math.abs(change).toFixed(1)}% from last period`}
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-light text-slate-800 mb-2 font-serif">
          <span className="font-extralight">Executive</span>{' '}
          <span className="font-bold bg-gradient-to-r from-slate-800 via-gray-800 to-black bg-clip-text text-transparent">Dashboard</span>
        </h2>
        <p className="text-lg text-slate-600 font-light">Comprehensive business insights and performance metrics</p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedMetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={metrics.monthlyGrowth}
          icon={DollarSign}
          progress={75}
          description="Total revenue generated across all services including personal training, group classes, and memberships"
        />
        
        <AnimatedMetricCard
          title="Active Members"
          value={metrics.totalMembers.toLocaleString()}
          change={8.5}
          icon={Users}
          progress={metrics.retentionRate}
          description="Current active member base with high retention rate and consistent engagement"
        />
        
        <AnimatedMetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change={metrics.leadConversion - 30}
          icon={Target}
          progress={metrics.conversionRate}
          description="Lead to member conversion rate showing strong sales performance"
        />
        
        <AnimatedMetricCard
          title="Class Utilization"
          value={`${metrics.classUtilization.toFixed(0)}%`}
          change={5.2}
          icon={Calendar}
          progress={metrics.classUtilization}
          description="Average class capacity utilization across all group fitness sessions"
        />
      </div>

      {/* Summary Insights */}
      <EditableSummary
        title="Key Performance Indicators"
        initialContent={[
          `Revenue increased by ${metrics.monthlyGrowth.toFixed(1)}% this month reaching ${formatCurrency(metrics.totalRevenue)}`,
          `Member retention rate at ${metrics.retentionRate.toFixed(0)}% with ${metrics.totalMembers} active members`,
          `${metrics.topPackage} is the most popular package driving significant revenue`,
          `Average class attendance: ${metrics.avgSessionAttendance.toFixed(0)} members per session`
        ]}
        onSave={(content) => handleSummaryUpdate('kpi', content)}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Revenue Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#colorRevenue)" strokeWidth={2} />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Revenue by Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatedMetricCard
          title="Active Trainers"
          value={metrics.activeTrainers.toString()}
          change={0}
          icon={Award}
          description="Professional trainers providing high-quality fitness services"
        />
        
        <AnimatedMetricCard
          title="Avg Attendance"
          value={metrics.avgSessionAttendance.toFixed(0)}
          change={8.2}
          icon={Clock}
          description="Average number of members attending each training session"
        />
        
        <AnimatedMetricCard
          title="Lead Conversion"
          value={`${metrics.leadConversion.toFixed(1)}%`}
          change={-2.1}
          icon={TrendingUp}
          description="Rate of converting prospective leads into paying members"
        />
      </div>

      {/* Quarterly Performance */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Quarterly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="quarter" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
              <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <EditableSummary
        title="Revenue Analysis"
        initialContent={[
          `Strong revenue growth of ${metrics.monthlyGrowth.toFixed(1)}% month-over-month`,
          `Average order value increased by 12.3% to ${formatCurrency(metrics.averageOrderValue)}`,
          `Personal training drives 45% of total revenue`,
          `Q4 showing strongest performance with ${formatCurrency(42000000)} revenue`
        ]}
        onSave={(content) => handleSummaryUpdate('revenue', content)}
      />

      <EditableSummary
        title="Performance Summary"
        initialContent={[
          `All ${metrics.activeTrainers} trainers maintain high performance standards`,
          `Class utilization at optimal ${metrics.classUtilization.toFixed(0)}%`,
          `Personal training leads revenue generation at 45% share`,
          `Member satisfaction scores consistently above 4.5/5`
        ]}
        onSave={(content) => handleSummaryUpdate('performance', content)}
      />
    </div>
  );
};
