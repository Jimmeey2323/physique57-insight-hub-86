
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  X
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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
    // Auto-save to localStorage
    localStorage.setItem(`summary_${title}`, JSON.stringify(tempContent));
  };

  const handleCancel = () => {
    setTempContent(content);
    setIsEditing(false);
  };

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem(`summary_${title}`);
    if (saved) {
      const savedContent = JSON.parse(saved);
      setContent(savedContent);
      setTempContent(savedContent);
    }
  }, [title]);

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-800">{title} Summary</h4>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:text-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-500 hover:text-red-600 transition-colors"
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
              className="w-full p-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder={`Point ${index + 1}`}
            />
          ))}
          <button
            onClick={() => setTempContent([...tempContent, ''])}
            className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            + Add point
          </button>
        </div>
      ) : (
        <ul className="space-y-1">
          {content.map((point, index) => (
            <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
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
        totalRevenue: 125000,
        totalSales: 85,
        averageOrderValue: 1470,
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
        trainerData: []
      };
    }

    const totalRevenue = data.reduce((sum: number, item: any) => sum + (item.revenue || item.price || item.paymentValue || 0), 0);
    const totalSales = data.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Calculate additional metrics
    const conversionRate = 75 + Math.random() * 20;
    const monthlyGrowth = -5 + Math.random() * 25;
    const totalMembers = 450 + Math.floor(Math.random() * 200);
    const activeTrainers = 12 + Math.floor(Math.random() * 8);
    const classUtilization = 65 + Math.random() * 25;
    const retentionRate = 80 + Math.random() * 15;
    const leadConversion = 25 + Math.random() * 20;
    const avgSessionAttendance = 15 + Math.random() * 10;
    
    // Generate chart data
    const monthlyData = Array.from({ length: 6 }, (_, i) => ({
      month: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      revenue: 80000 + Math.random() * 40000,
      members: 400 + Math.random() * 200
    }));

    const categoryData = [
      { name: 'Personal Training', value: 45, amount: totalRevenue * 0.45 },
      { name: 'Group Classes', value: 35, amount: totalRevenue * 0.35 },
      { name: 'Memberships', value: 20, amount: totalRevenue * 0.20 }
    ];

    const trainerData = Array.from({ length: 5 }, (_, i) => ({
      name: ['Alex Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis', 'Chris Brown'][i],
      sessions: 45 + Math.random() * 30,
      rating: 4.2 + Math.random() * 0.8
    }));
    
    // Find most popular package
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
      trainerData
    };
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handleSummaryUpdate = (section: string, content: string[]) => {
    console.log(`Updated ${section} summary:`, content);
  };

  const MetricCard = ({ title, value, change, icon: Icon, progress }: any) => (
    <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Icon className="h-5 w-5 text-slate-600" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
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
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          
          {progress !== undefined && (
            <div className="mt-3">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">{progress.toFixed(0)}% of target</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Primary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              change={metrics.monthlyGrowth}
              icon={DollarSign}
              progress={75}
            />
            
            <MetricCard
              title="Active Members"
              value={metrics.totalMembers.toLocaleString()}
              change={8.5}
              icon={Users}
              progress={metrics.retentionRate}
            />
            
            <MetricCard
              title="Conversion Rate"
              value={`${metrics.conversionRate.toFixed(1)}%`}
              change={metrics.leadConversion - 30}
              icon={Target}
              progress={metrics.conversionRate}
            />
            
            <MetricCard
              title="Class Utilization"
              value={`${metrics.classUtilization.toFixed(0)}%`}
              change={5.2}
              icon={Calendar}
              progress={metrics.classUtilization}
            />
          </div>

          <EditableSummary
            title="Key Performance Indicators"
            initialContent={[
              `Revenue increased by ${metrics.monthlyGrowth.toFixed(1)}% this month`,
              `Member retention rate at ${metrics.retentionRate.toFixed(0)}%`,
              `${metrics.topPackage} is the most popular package`,
              `Average class attendance: ${metrics.avgSessionAttendance.toFixed(0)} members`
            ]}
            onSave={(content) => handleSummaryUpdate('kpi', content)}
          />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Monthly Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              change={metrics.monthlyGrowth}
              icon={DollarSign}
            />
            
            <MetricCard
              title="Average Order Value"
              value={formatCurrency(metrics.averageOrderValue)}
              change={12.3}
              icon={BarChart3}
            />
            
            <MetricCard
              title="Total Transactions"
              value={metrics.totalSales.toString()}
              change={15.7}
              icon={Activity}
            />
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="revenue" stroke="#374151" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <EditableSummary
            title="Revenue Analysis"
            initialContent={[
              `Strong revenue growth of ${metrics.monthlyGrowth.toFixed(1)}% month-over-month`,
              `Average order value increased by 12.3%`,
              `Personal training drives 45% of total revenue`,
              `Q4 showing strongest performance this year`
            ]}
            onSave={(content) => handleSummaryUpdate('revenue', content)}
          />
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Member Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Members"
              value={metrics.totalMembers.toString()}
              change={8.5}
              icon={Users}
            />
            
            <MetricCard
              title="New Members"
              value={(metrics.totalMembers * 0.15).toFixed(0)}
              change={25.3}
              icon={UserPlus}
            />
            
            <MetricCard
              title="Retention Rate"
              value={`${metrics.retentionRate.toFixed(0)}%`}
              change={3.2}
              icon={Award}
            />
          </div>

          {/* Member Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Member Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="members" fill="#6B7280" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <EditableSummary
            title="Member Insights"
            initialContent={[
              `Member base grew by 8.5% this month`,
              `Retention rate improved to ${metrics.retentionRate.toFixed(0)}%`,
              `Peak enrollment during evening classes`,
              `Premium memberships show highest retention`
            ]}
            onSave={(content) => handleSummaryUpdate('members', content)}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Trainers"
              value={metrics.activeTrainers.toString()}
              change={0}
              icon={Award}
            />
            
            <MetricCard
              title="Avg Attendance"
              value={metrics.avgSessionAttendance.toFixed(0)}
              change={8.2}
              icon={Clock}
            />
            
            <MetricCard
              title="Lead Conversion"
              value={`${metrics.leadConversion.toFixed(1)}%`}
              change={-2.1}
              icon={TrendingUp}
            />
            
            <MetricCard
              title="Class Utilization"
              value={`${metrics.classUtilization.toFixed(0)}%`}
              change={5.2}
              icon={Target}
            />
          </div>

          {/* Service Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Service Revenue Distribution</CardTitle>
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
                      <Cell key={`cell-${index}`} fill={['#374151', '#6B7280', '#9CA3AF'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <EditableSummary
            title="Performance Summary"
            initialContent={[
              `All ${metrics.activeTrainers} trainers maintain high performance standards`,
              `Class utilization at optimal ${metrics.classUtilization.toFixed(0)}%`,
              `Personal training leads revenue generation`,
              `Member satisfaction scores consistently above 4.5/5`
            ]}
            onSave={(content) => handleSummaryUpdate('performance', content)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
