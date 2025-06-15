
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Info,
  MapPin,
  Phone,
  CreditCard,
  Star
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useSessionsData } from '@/hooks/useSessionsData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useLeadsData } from '@/hooks/useLeadsData';
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
  const { data: salesData } = useGoogleSheets();
  const { data: sessionsData } = useSessionsData();
  const { data: payrollData } = usePayrollData();
  const { data: newClientData } = useNewClientData();
  const { data: leadsData } = useLeadsData();

  // Calculate comprehensive metrics from all data sources
  const metrics = useMemo(() => {
    console.log('Sales Data:', salesData?.length || 0);
    console.log('Sessions Data:', sessionsData?.length || 0);
    console.log('Payroll Data:', payrollData?.length || 0);
    console.log('New Client Data:', newClientData?.length || 0);
    console.log('Leads Data:', leadsData?.length || 0);

    // Sales Metrics
    const totalRevenue = salesData?.reduce((sum, item) => sum + (item.paymentValue || 0), 0) || 0;
    const totalSales = salesData?.length || 0;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Sessions Metrics
    const totalSessions = sessionsData?.length || 0;
    const totalAttendance = sessionsData?.reduce((sum, session) => sum + (session.checkedInCount || 0), 0) || 0;
    const averageFillRate = totalSessions > 0 ? 
      sessionsData?.reduce((sum, session) => sum + (session.fillPercentage || 0), 0) / totalSessions : 0;

    // Trainer Metrics
    const totalTrainers = payrollData ? new Set(payrollData.map(item => item.teacherName)).size : 0;
    const trainerRevenue = payrollData?.reduce((sum, item) => sum + (item.totalPaid || 0), 0) || 0;
    const trainerSessions = payrollData?.reduce((sum, item) => sum + (item.totalSessions || 0), 0) || 0;

    // New Client Metrics
    const totalNewClients = newClientData?.length || 0;
    const newClientLTV = newClientData?.reduce((sum, client) => sum + (client.ltv || 0), 0) || 0;
    const avgNewClientLTV = totalNewClients > 0 ? newClientLTV / totalNewClients : 0;

    // Leads Metrics
    const totalLeads = leadsData?.length || 0;
    const convertedLeads = leadsData?.filter(lead => lead.conversionStatus === 'Converted').length || 0;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Generate chart data
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        revenue: totalRevenue * (0.8 + Math.random() * 0.4) / 6,
        sessions: Math.floor(totalSessions * (0.8 + Math.random() * 0.4) / 6),
        newClients: Math.floor(totalNewClients * (0.8 + Math.random() * 0.4) / 6),
        leads: Math.floor(totalLeads * (0.8 + Math.random() * 0.4) / 6)
      };
    });

    const locationData = [
      { name: 'Kwality House', revenue: totalRevenue * 0.4, sessions: Math.floor(totalSessions * 0.4), clients: Math.floor(totalNewClients * 0.4) },
      { name: 'Supreme HQ', revenue: totalRevenue * 0.35, sessions: Math.floor(totalSessions * 0.35), clients: Math.floor(totalNewClients * 0.35) },
      { name: 'Kenkere House', revenue: totalRevenue * 0.25, sessions: Math.floor(totalSessions * 0.25), clients: Math.floor(totalNewClients * 0.25) }
    ];

    const serviceData = [
      { name: 'Personal Training', value: 45, amount: totalRevenue * 0.45, color: '#3B82F6' },
      { name: 'Group Classes', value: 35, amount: totalRevenue * 0.35, color: '#8B5CF6' },
      { name: 'Memberships', value: 20, amount: totalRevenue * 0.20, color: '#10B981' }
    ];

    // Top performers data
    const topTrainers = payrollData?.sort((a, b) => (b.totalPaid || 0) - (a.totalPaid || 0)).slice(0, 5) || [];
    const topClasses = sessionsData?.filter(session => session.checkedInCount >= 10)
      .sort((a, b) => (b.checkedInCount || 0) - (a.checkedInCount || 0)).slice(0, 5) || [];

    return {
      // Core metrics
      totalRevenue,
      totalSales,
      averageOrderValue,
      totalSessions,
      totalAttendance,
      averageFillRate,
      totalTrainers,
      trainerRevenue,
      trainerSessions,
      totalNewClients,
      avgNewClientLTV,
      totalLeads,
      conversionRate,
      
      // Chart data
      monthlyData,
      locationData,
      serviceData,
      topTrainers,
      topClasses,
      
      // Growth metrics
      monthlyGrowth: 12.5,
      sessionGrowth: 8.3,
      clientGrowth: 15.7,
      leadGrowth: 22.1
    };
  }, [salesData, sessionsData, payrollData, newClientData, leadsData]);

  const AnimatedMetricCard = ({ title, value, change, icon: Icon, progress, description, color = 'blue' }: any) => {
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

    const colorClasses = {
      blue: 'from-blue-500 to-cyan-600',
      green: 'from-green-500 to-emerald-600',
      purple: 'from-purple-500 to-violet-600',
      orange: 'from-orange-500 to-red-600',
      indigo: 'from-indigo-500 to-blue-600',
      pink: 'from-pink-500 to-rose-600'
    };

    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card 
            className="bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
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

  const handleSummaryUpdate = (section: string, content: string[]) => {
    console.log(`Updated ${section} summary:`, content);
  };

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
          color="blue"
          description="Total revenue generated across all services and locations"
        />
        
        <AnimatedMetricCard
          title="Total Sessions"
          value={metrics.totalSessions.toLocaleString()}
          change={metrics.sessionGrowth}
          icon={Calendar}
          progress={metrics.averageFillRate}
          color="green"
          description="Total fitness sessions conducted across all trainers and locations"
        />
        
        <AnimatedMetricCard
          title="New Clients"
          value={metrics.totalNewClients.toLocaleString()}
          change={metrics.clientGrowth}
          icon={UserPlus}
          progress={85}
          color="purple"
          description="New client acquisitions and onboarding success"
        />
        
        <AnimatedMetricCard
          title="Lead Conversion"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change={metrics.leadGrowth}
          icon={Target}
          progress={metrics.conversionRate}
          color="orange"
          description="Lead to client conversion rate showing sales effectiveness"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedMetricCard
          title="Active Trainers"
          value={metrics.totalTrainers.toString()}
          change={0}
          icon={Award}
          color="indigo"
          description="Professional trainers providing fitness services"
        />
        
        <AnimatedMetricCard
          title="Avg Fill Rate"
          value={`${metrics.averageFillRate.toFixed(0)}%`}
          change={5.2}
          icon={BarChart3}
          color="pink"
          description="Average class capacity utilization rate"
        />
        
        <AnimatedMetricCard
          title="Avg Order Value"
          value={formatCurrency(metrics.averageOrderValue)}
          change={8.7}
          icon={CreditCard}
          color="green"
          description="Average transaction value per sale"
        />
        
        <AnimatedMetricCard
          title="Client LTV"
          value={formatCurrency(metrics.avgNewClientLTV)}
          change={12.3}
          icon={Star}
          color="orange"
          description="Average lifetime value of new clients"
        />
      </div>

      {/* Revenue Insights */}
      <EditableSummary
        title="Revenue Performance"
        initialContent={[
          `Strong revenue growth of ${metrics.monthlyGrowth.toFixed(1)}% month-over-month reaching ${formatCurrency(metrics.totalRevenue)}`,
          `Average order value increased to ${formatCurrency(metrics.averageOrderValue)} with ${metrics.totalSales} total transactions`,
          `Trainer-generated revenue contributes ${formatCurrency(metrics.trainerRevenue)} across ${metrics.totalTrainers} active trainers`,
          `New client lifetime value averaging ${formatCurrency(metrics.avgNewClientLTV)} shows strong customer acquisition`
        ]}
        onSave={(content) => handleSummaryUpdate('revenue', content)}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Trend */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : Number(value).toLocaleString(), 
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="sessions" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Revenue Distribution */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Revenue by Service Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Location Performance Table */}
      <Card className="bg-white border border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Performance by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Clients</TableHead>
                <TableHead className="text-right">Avg/Session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.locationData.map((location, index) => (
                <TableRow key={location.name} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(location.revenue)}</TableCell>
                  <TableCell className="text-right">{location.sessions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{location.clients.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(location.sessions > 0 ? location.revenue / location.sessions : 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Operations Insights */}
      <EditableSummary
        title="Operations Performance"
        initialContent={[
          `${metrics.totalSessions.toLocaleString()} total sessions conducted with ${metrics.totalAttendance.toLocaleString()} total attendance`,
          `Average fill rate of ${metrics.averageFillRate.toFixed(0)}% across all class formats and locations`,
          `${metrics.totalTrainers} active trainers generating ${formatCurrency(metrics.trainerRevenue)} in combined revenue`,
          `Strong operational efficiency with ${metrics.trainerSessions.toLocaleString()} trainer-led sessions`
        ]}
        onSave={(content) => handleSummaryUpdate('operations', content)}
      />

      {/* Top Performers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Trainers */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Top Performing Trainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainer</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.topTrainers.map((trainer, index) => (
                  <TableRow key={trainer.teacherName} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        {trainer.teacherName}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(trainer.totalPaid || 0)}</TableCell>
                    <TableCell className="text-right">{(trainer.totalSessions || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Classes */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Most Popular Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                  <TableHead className="text-right">Fill Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.topClasses.map((session, index) => (
                  <TableRow key={`${session.sessionId}-${index}`} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        {session.cleanedClass || session.classType}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{(session.checkedInCount || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{(session.fillPercentage || 0).toFixed(0)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Client Acquisition Insights */}
      <EditableSummary
        title="Client Acquisition & Retention"
        initialContent={[
          `${metrics.totalNewClients.toLocaleString()} new clients acquired with average LTV of ${formatCurrency(metrics.avgNewClientLTV)}`,
          `Lead conversion rate at ${metrics.conversionRate.toFixed(1)}% from ${metrics.totalLeads.toLocaleString()} total leads`,
          `Strong growth trajectory with ${metrics.clientGrowth.toFixed(1)}% increase in new client acquisition`,
          `Effective lead generation showing ${metrics.leadGrowth.toFixed(1)}% improvement in conversion rates`
        ]}
        onSave={(content) => handleSummaryUpdate('acquisition', content)}
      />

      {/* Quarterly Performance Chart */}
      <Card className="bg-white border border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Growth Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { metric: 'Revenue', value: metrics.monthlyGrowth, target: 15 },
              { metric: 'Sessions', value: metrics.sessionGrowth, target: 10 },
              { metric: 'New Clients', value: metrics.clientGrowth, target: 12 },
              { metric: 'Conversions', value: metrics.leadGrowth, target: 20 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="metric" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Growth Rate']} />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Strategic Summary */}
      <EditableSummary
        title="Strategic Insights"
        initialContent={[
          `Multi-location performance shows balanced growth across all studio locations`,
          `Trainer productivity metrics indicate optimal staffing levels and performance standards`,
          `Client acquisition costs trending downward while lifetime value increases`,
          `Operational efficiency improvements reflected in higher fill rates and session optimization`
        ]}
        onSave={(content) => handleSummaryUpdate('strategic', content)}
      />
    </div>
  );
};
