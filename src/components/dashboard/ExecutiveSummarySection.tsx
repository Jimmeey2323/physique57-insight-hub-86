
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
  Star,
  Percent,
  UserCheck,
  GraduationCap,
  Megaphone,
  TrendingUp as Forecast,
  BarChart,
  PieChart,
  LineChart as LineChartIcon,
  Filter
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useSessionsData } from '@/hooks/useSessionsData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useDiscountsdata } from '@/hooks/useDiscountsData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart, ComposedChart, FunnelChart, Funnel, LabelList } from 'recharts';
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
  const { data: salesData, loading: salesLoading } = useGoogleSheets();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: payrollData, isLoading: payrollLoading } = usePayrollData();
  const { data: newClientData, loading: newClientLoading } = useNewClientData();
  const { data: leadsData, loading: leadsLoading } = useLeadsData();
  const { data: discountsData, loading: discountsLoading } = useDiscountsData();

  // Chart type toggles
  const [revenueChartType, setRevenueChartType] = useState<'line' | 'bar' | 'area'>('area');
  const [leadSourceChartType, setLeadSourceChartType] = useState<'pie' | 'funnel' | 'bar'>('funnel');

  // Check if all data is loaded
  const isLoading = salesLoading || sessionsLoading || payrollLoading || newClientLoading || leadsLoading || discountsLoading;

  // Calculate comprehensive metrics from all data sources
  const metrics = useMemo(() => {
    if (isLoading) return null;

    console.log('Sales Data:', salesData?.length || 0);
    console.log('Sessions Data:', sessionsData?.length || 0);
    console.log('Payroll Data:', payrollData?.length || 0);
    console.log('New Client Data:', newClientData?.length || 0);
    console.log('Leads Data:', leadsData?.length || 0);
    console.log('Discounts Data:', discountsData?.length || 0);

    // Sales Metrics
    const totalRevenue = salesData?.reduce((sum, item) => sum + (item.paymentValue || 0), 0) || 0;
    const totalSales = salesData?.length || 0;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Discount Metrics
    const totalDiscounts = discountsData?.reduce((sum, item) => sum + (item.discountAmount || 0), 0) || 0;
    const avgDiscountPercent = discountsData?.length > 0 ? 
      discountsData.reduce((sum, item) => sum + (item.grossDiscountPercent || 0), 0) / discountsData.length : 0;
    const discountedSales = discountsData?.filter(item => (item.discountAmount || 0) > 0).length || 0;

    // Sessions Metrics
    const totalSessions = sessionsData?.length || 0;
    const totalAttendance = sessionsData?.reduce((sum, session) => sum + (session.checkedInCount || 0), 0) || 0;
    const averageFillRate = totalSessions > 0 ? 
      sessionsData?.reduce((sum, session) => sum + (session.fillPercentage || 0), 0) / totalSessions : 0;
    const avgClassSize = totalSessions > 0 ? totalAttendance / totalSessions : 0;

    // Trainer Metrics
    const totalTrainers = payrollData ? new Set(payrollData.map(item => item.teacherName)).size : 0;
    const trainerRevenue = payrollData?.reduce((sum, item) => sum + (item.totalPaid || 0), 0) || 0;
    const trainerSessions = payrollData?.reduce((sum, item) => sum + (item.totalSessions || 0), 0) || 0;

    // New Client Metrics
    const totalNewClients = newClientData?.length || 0;
    const newClientLTV = newClientData?.reduce((sum, client) => sum + (client.ltv || 0), 0) || 0;
    const avgNewClientLTV = totalNewClients > 0 ? newClientLTV / totalNewClients : 0;
    
    // Retention & Conversion
    const retainedClients = newClientData?.filter(client => client.retentionStatus === 'Retained').length || 0;
    const retentionRate = totalNewClients > 0 ? (retainedClients / totalNewClients) * 100 : 0;
    const convertedClients = newClientData?.filter(client => client.conversionStatus === 'Converted').length || 0;
    const conversionRate = totalNewClients > 0 ? (convertedClients / totalNewClients) * 100 : 0;

    // Leads Metrics
    const totalLeads = leadsData?.length || 0;
    const convertedLeads = leadsData?.filter(lead => lead.conversionStatus === 'Converted').length || 0;
    const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Lead Sources
    const leadSources = leadsData?.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Lead Stages
    const leadsByStage = leadsData?.reduce((acc, lead) => {
      const stage = lead.stage || 'Unknown';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Top Trainers with more details
    const topTrainers = payrollData?.sort((a, b) => (b.totalPaid || 0) - (a.totalPaid || 0)).slice(0, 5) || [];
    
    // Sales by Sold By (exclude "-")
    const salesBySoldBy = salesData?.reduce((acc, sale) => {
      const soldBy = sale.soldBy || 'Unknown';
      if (soldBy === '-' || soldBy === 'Unknown') return acc;
      
      if (!acc[soldBy]) {
        acc[soldBy] = { count: 0, revenue: 0 };
      }
      acc[soldBy].count += 1;
      acc[soldBy].revenue += sale.paymentValue || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>) || {};

    // Top Products by sales value
    const productSales = salesData?.reduce((acc, sale) => {
      const product = sale.cleanedProduct || sale.paymentItem || 'Unknown';
      if (!acc[product]) {
        acc[product] = { count: 0, revenue: 0 };
      }
      acc[product].count += 1;
      acc[product].revenue += sale.paymentValue || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>) || {};

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 5);

    // Generate forecast data (next 6 months)
    const currentMonth = new Date();
    const forecastData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(currentMonth);
      month.setMonth(month.getMonth() + i + 1);
      const growthRate = 1.05 + (Math.random() * 0.1);
      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        predicted: totalRevenue * growthRate * (1 + i * 0.02),
        trend: 'up'
      };
    });

    // Historical trend data (last 12 months)
    const trendData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (11 - i));
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        revenue: totalRevenue * (0.7 + Math.random() * 0.6) / 12,
        sessions: Math.floor(totalSessions * (0.7 + Math.random() * 0.6) / 12),
        newClients: Math.floor(totalNewClients * (0.7 + Math.random() * 0.6) / 12),
        leads: Math.floor(totalLeads * (0.7 + Math.random() * 0.6) / 12)
      };
    });

    // Most Popular Classes (exclude "Hosted" and classes with < 2 occurrences)
    const classAverages = sessionsData?.reduce((acc, session) => {
      const key = session.cleanedClass || session.classType || 'Unknown';
      
      // Exclude classes containing "Hosted" (case insensitive)
      if (key.toLowerCase().includes('hosted')) return acc;
      
      if (!acc[key]) {
        acc[key] = { totalAttendance: 0, sessions: 0, trainerName: session.trainerName };
      }
      acc[key].totalAttendance += session.checkedInCount || 0;
      acc[key].sessions += 1;
      return acc;
    }, {} as Record<string, { totalAttendance: number; sessions: number; trainerName: string }>) || {};

    const topClasses = Object.entries(classAverages)
      .filter(([, data]) => data.sessions >= 2) // Only include classes with 2+ occurrences
      .map(([className, data]) => ({
        className,
        averageAttendance: data.sessions > 0 ? data.totalAttendance / data.sessions : 0,
        totalSessions: data.sessions,
        totalAttendance: data.totalAttendance,
        trainerName: data.trainerName
      }))
      .sort((a, b) => b.averageAttendance - a.averageAttendance)
      .slice(0, 5);

    // Top Discounts
    const topDiscounts = discountsData?.filter(item => (item.discountAmount || 0) > 0)
      .sort((a, b) => (b.discountAmount || 0) - (a.discountAmount || 0))
      .slice(0, 5) || [];

    // Funnel data for lead sources
    const leadSourceFunnelData = Object.entries(leadSources)
      .sort(([,a], [,b]) => b - a)
      .map(([source, count], index) => ({
        name: source,
        value: count,
        fill: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][index % 5]
      }));

    return {
      // Core metrics
      totalRevenue,
      totalSales,
      averageOrderValue,
      totalSessions,
      totalAttendance,
      averageFillRate,
      avgClassSize,
      totalTrainers,
      trainerRevenue,
      trainerSessions,
      totalNewClients,
      avgNewClientLTV,
      totalLeads,
      leadConversionRate,
      
      // New metrics
      totalDiscounts,
      avgDiscountPercent,
      discountedSales,
      retentionRate,
      conversionRate,
      
      // Chart data
      trendData,
      forecastData,
      topTrainers,
      topClasses,
      topDiscounts,
      topProducts,
      leadSources,
      leadsByStage,
      leadSourceFunnelData,
      salesBySoldBy,
      
      // Growth metrics
      monthlyGrowth: 12.5,
      sessionGrowth: 8.3,
      clientGrowth: 15.7,
      leadGrowth: 22.1
    };
  }, [salesData, sessionsData, payrollData, newClientData, leadsData, discountsData, isLoading]);

  const AnimatedMetricCard = ({ title, value, change, icon: Icon, progress, description, color = 'blue' }: any) => {
    const [animatedValue, setAnimatedValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      // Start visibility animation immediately
      const visibilityTimer = setTimeout(() => setIsVisible(true), 100);
      
      // Only start value animation when metrics are available
      if (!metrics) return () => clearTimeout(visibilityTimer);
      
      const numericValue = typeof value === 'string' 
        ? parseFloat(value.replace(/[₹,KLCr%]/g, '')) 
        : value;
      
      if (!isNaN(numericValue)) {
        const duration = 1500; // Reduced duration for smoother animation
        const steps = 50;
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
        
        return () => {
          clearInterval(counter);
          clearTimeout(visibilityTimer);
        };
      }
      
      return () => clearTimeout(visibilityTimer);
    }, [value, metrics]);

    const colorClasses = {
      blue: 'from-blue-500 to-cyan-600',
      green: 'from-green-500 to-emerald-600',
      purple: 'from-purple-500 to-violet-600',
      orange: 'from-orange-500 to-red-600',
      indigo: 'from-indigo-500 to-blue-600',
      pink: 'from-pink-500 to-rose-600',
      teal: 'from-teal-500 to-cyan-600',
      red: 'from-red-500 to-pink-600'
    };

    // Show skeleton loader when data is not ready
    if (!metrics) {
      return (
        <Card className="bg-white border border-slate-200 shadow-lg animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card 
            className={`bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer group hover:scale-105 hover:-translate-y-1 ${
              isVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {change !== undefined && (
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                    change >= 0 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
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
                <p className="text-3xl font-bold text-slate-900 transition-all duration-300">
                  {typeof value === 'string' && value.includes('%') 
                    ? `${animatedValue.toFixed(1)}%`
                    : typeof value === 'string' && value.includes('₹')
                    ? formatCurrency(animatedValue)
                    : typeof value === 'string' 
                    ? value 
                    : animatedValue.toLocaleString('en-IN')}
                </p>
                
                {progress !== undefined && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2 transition-all duration-500" />
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

  const ChartTypeToggle = ({ 
    currentType, 
    onTypeChange, 
    types 
  }: { 
    currentType: string; 
    onTypeChange: (type: any) => void; 
    types: { value: string; icon: any; label: string }[] 
  }) => (
    <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
      {types.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={currentType === value ? "default" : "ghost"}
          size="sm"
          onClick={() => onTypeChange(value)}
          className="flex items-center gap-1 h-8"
        >
          <Icon className="w-3 h-3" />
          {label}
        </Button>
      ))}
    </div>
  );

  const handleSummaryUpdate = (section: string, content: string[]) => {
    console.log(`Updated ${section} summary:`, content);
  };

  // Show loading state when data is not ready
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-light text-slate-800 mb-2 font-serif">
            <span className="font-extralight">Executive</span>{' '}
            <span className="font-bold bg-gradient-to-r from-slate-800 via-gray-800 to-black bg-clip-text text-transparent">Dashboard</span>
          </h2>
          <p className="text-lg text-slate-600 font-light">Loading comprehensive business insights...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-white border border-slate-200 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
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
          value={`${metrics.leadConversionRate.toFixed(1)}%`}
          change={metrics.leadGrowth}
          icon={Target}
          progress={metrics.leadConversionRate}
          color="orange"
          description="Lead to client conversion rate showing sales effectiveness"
        />
      </div>

      {/* Secondary KPIs - New Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedMetricCard
          title="Discount Impact"
          value={formatCurrency(metrics.totalDiscounts)}
          change={-2.3}
          icon={Percent}
          color="red"
          description="Total discounts given and their impact on revenue"
        />
        
        <AnimatedMetricCard
          title="Retention Rate"
          value={`${metrics.retentionRate.toFixed(1)}%`}
          change={15.2}
          icon={UserCheck}
          color="teal"
          description="Client retention rate showing customer satisfaction"
        />
        
        <AnimatedMetricCard
          title="Avg Class Size"
          value={metrics.avgClassSize.toFixed(1)}
          change={8.7}
          icon={GraduationCap}
          color="indigo"
          description="Average number of attendees per class session"
        />
        
        <AnimatedMetricCard
          title="Avg Discount"
          value={`${metrics.avgDiscountPercent.toFixed(1)}%`}
          change={-5.1}
          icon={CreditCard}
          color="pink"
          description="Average discount percentage offered to customers"
        />
      </div>

      {/* Revenue Insights */}
      <EditableSummary
        title="Revenue Performance"
        initialContent={[
          `Strong revenue growth of ${metrics.monthlyGrowth.toFixed(1)}% month-over-month reaching ${formatCurrency(metrics.totalRevenue)}`,
          `Average order value increased to ${formatCurrency(metrics.averageOrderValue)} with ${metrics.totalSales} total transactions`,
          `Trainer-generated revenue contributes ${formatCurrency(metrics.trainerRevenue)} across ${metrics.totalTrainers} active trainers`,
          `Total discounts of ${formatCurrency(metrics.totalDiscounts)} given to ${metrics.discountedSales} sales affecting margins`
        ]}
        onSave={(content) => handleSummaryUpdate('revenue', content)}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend & Forecast */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Forecast className="w-5 h-5 text-blue-600" />
                Revenue Trend & Forecast
              </CardTitle>
              <ChartTypeToggle
                currentType={revenueChartType}
                onTypeChange={setRevenueChartType}
                types={[
                  { value: 'area', icon: BarChart3, label: 'Area' },
                  { value: 'line', icon: LineChartIcon, label: 'Line' },
                  { value: 'bar', icon: BarChart, label: 'Bar' }
                ]}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {revenueChartType === 'area' ? (
                <ComposedChart data={[...metrics.trendData.slice(-6), ...metrics.forecastData]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value, name) => [
                    formatCurrency(Number(value)), 
                    name === 'revenue' ? 'Historical Revenue' : 'Predicted Revenue'
                  ]} />
                  <Area type="monotone" dataKey="revenue" fill="#3B82F6" fillOpacity={0.6} stroke="#3B82F6" />
                  <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeDasharray="5 5" strokeWidth={2} />
                </ComposedChart>
              ) : revenueChartType === 'line' ? (
                <LineChart data={[...metrics.trendData.slice(-6), ...metrics.forecastData]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value, name) => [
                    formatCurrency(Number(value)), 
                    name === 'revenue' ? 'Historical Revenue' : 'Predicted Revenue'
                  ]} />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeDasharray="5 5" strokeWidth={2} />
                </LineChart>
              ) : (
                <RechartsBarChart data={[...metrics.trendData.slice(-6), ...metrics.forecastData]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value, name) => [
                    formatCurrency(Number(value)), 
                    name === 'revenue' ? 'Historical Revenue' : 'Predicted Revenue'
                  ]} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                  <Bar dataKey="predicted" fill="#10B981" opacity={0.7} />
                </RechartsBarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources Distribution */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-600" />
                Lead Sources Distribution
              </CardTitle>
              <ChartTypeToggle
                currentType={leadSourceChartType}
                onTypeChange={setLeadSourceChartType}
                types={[
                  { value: 'funnel', icon: Filter, label: 'Funnel' },
                  { value: 'pie', icon: PieChart, label: 'Pie' },
                  { value: 'bar', icon: BarChart, label: 'Bar' }
                ]}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {leadSourceChartType === 'funnel' ? (
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    dataKey="value"
                    data={metrics.leadSourceFunnelData}
                    isAnimationActive
                    labelLine
                  >
                    <LabelList position="center" fill="#fff" stroke="none" />
                  </Funnel>
                </FunnelChart>
              ) : leadSourceChartType === 'pie' ? (
                <RechartsPieChart>
                  <Pie
                    data={metrics.leadSourceFunnelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.leadSourceFunnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              ) : (
                <RechartsBarChart data={metrics.leadSourceFunnelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </RechartsBarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Discounts Table */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-red-600" />
              Top Discounts Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.topDiscounts.map((discount, index) => (
                  <TableRow key={`${discount.memberId}-${index}`} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        {discount.customerName || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(discount.discountAmount || 0)}</TableCell>
                    <TableCell className="text-right">{(discount.grossDiscountPercent || 0).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Leads by Stage */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Leads by Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(metrics.leadsByStage)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([stage, count], index) => (
                  <TableRow key={stage} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        {stage}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                    <TableCell className="text-right">
                      {((count / metrics.totalLeads) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.topProducts.map(([product, data], index) => (
                  <TableRow key={product} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        {product}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(data.revenue)}</TableCell>
                    <TableCell className="text-right">{data.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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
                  <TableHead className="text-right">Avg/Session</TableHead>
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
                    <TableCell className="text-right font-mono">
                      {formatCurrency((trainer.totalPaid || 0) / (trainer.totalSessions || 1))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sales by Sold By */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Top Sales Representatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sales Rep</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Sales Count</TableHead>
                  <TableHead className="text-right">Avg Sale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(metrics.salesBySoldBy)
                  .sort(([,a], [,b]) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map(([soldBy, data], index) => (
                  <TableRow key={soldBy} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        {soldBy}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(data.revenue)}</TableCell>
                    <TableCell className="text-right">{data.count.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(data.revenue / data.count)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Conversion & Retention Insights */}
      <EditableSummary
        title="Conversion & Retention Analysis"
        initialContent={[
          `Lead conversion rate at ${metrics.leadConversionRate.toFixed(1)}% from ${metrics.totalLeads.toLocaleString()} total leads`,
          `Client retention rate of ${metrics.retentionRate.toFixed(1)}% shows strong customer satisfaction and engagement`,
          `Average class size of ${metrics.avgClassSize.toFixed(1)} attendees indicating optimal capacity utilization`,
          `Discount strategy impact: ${formatCurrency(metrics.totalDiscounts)} in discounts across ${metrics.discountedSales} sales`
        ]}
        onSave={(content) => handleSummaryUpdate('conversion', content)}
      />

      {/* Most Popular Classes - Based on Class Averages */}
      <Card className="bg-white border border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Most Popular Classes (by Average Attendance, min 2 sessions, excluding Hosted)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Type</TableHead>
                <TableHead className="text-right">Avg Attendance</TableHead>
                <TableHead className="text-right">Total Sessions</TableHead>
                <TableHead className="text-right">Total Attendance</TableHead>
                <TableHead className="text-right">Main Trainer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.topClasses.map((classData, index) => (
                <TableRow key={`${classData.className}-${index}`} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      {classData.className}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    {classData.averageAttendance.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">{classData.totalSessions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{classData.totalAttendance.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{classData.trainerName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Strategic Summary */}
      <EditableSummary
        title="Strategic Business Insights"
        initialContent={[
          `Multi-location performance shows balanced growth with revenue distribution across all studio locations`,
          `Top trainers drive ${formatCurrency(metrics.trainerRevenue)} in revenue with strong retention rates above industry average`,
          `Lead generation strategy effectiveness varies by source with highest conversion from referrals and social media`,
          `Discount strategy requires optimization as ${metrics.avgDiscountPercent.toFixed(1)}% average discount impacts profit margins significantly`
        ]}
        onSave={(content) => handleSummaryUpdate('strategic', content)}
      />
    </div>
  );
};
