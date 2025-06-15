
import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Calendar, 
  Tag,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

// Utility function for className merging
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface DashboardButton {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  hoverColor: string;
  bgGradient: string;
}

interface DashboardGridProps {
  buttons?: DashboardButton[];
  onButtonClick?: (buttonId: string) => void;
}

const defaultButtons: DashboardButton[] = [
  {
    id: "executive-summary",
    label: "Executive Summary",
    description: "Strategic Performance Overview & Key Metrics",
    icon: <BarChart3 size={28} />,
    color: "text-blue-600",
    gradient: "from-blue-50 to-blue-100",
    hoverColor: "hover:border-blue-300",
    bgGradient: "from-blue-500 to-blue-600"
  },
  {
    id: "sales-analytics",
    label: "Sales Analytics",
    description: "Revenue Intelligence & Sales Performance",
    icon: <TrendingUp size={28} />,
    color: "text-emerald-600",
    gradient: "from-emerald-50 to-emerald-100",
    hoverColor: "hover:border-emerald-300",
    bgGradient: "from-emerald-500 to-emerald-600"
  },
  {
    id: "funnel-leads",
    label: "Funnel & Lead Performance",
    description: "Lead Pipeline Efficiency and Conversion Metrics",
    icon: <BarChart3 size={28} />,
    color: "text-purple-600",
    gradient: "from-purple-50 to-purple-100",
    hoverColor: "hover:border-purple-300",
    bgGradient: "from-purple-500 to-purple-600"
  },
  {
    id: "client-retention",
    label: "Client Conversion & Retention",
    description: "Client Acquisition and Retention Analysis",
    icon: <Users size={28} />,
    color: "text-orange-600",
    gradient: "from-orange-50 to-orange-100",
    hoverColor: "hover:border-orange-300",
    bgGradient: "from-orange-500 to-orange-600"
  },
  {
    id: "trainer-performance",
    label: "Trainer Performance",
    description: "Instructor Productivity and Engagement Metrics",
    icon: <UserCheck size={28} />,
    color: "text-cyan-600",
    gradient: "from-cyan-50 to-cyan-100",
    hoverColor: "hover:border-cyan-300",
    bgGradient: "from-cyan-500 to-cyan-600"
  },
  {
    id: "class-attendance",
    label: "Class Attendance",
    description: "Utilization and Attendance Trends",
    icon: <Calendar size={28} />,
    color: "text-indigo-600",
    gradient: "from-indigo-50 to-indigo-100",
    hoverColor: "hover:border-indigo-300",
    bgGradient: "from-indigo-500 to-indigo-600"
  },
  {
    id: "discounts-promotions",
    label: "Discounts & Promotions",
    description: "Promotional Impact and Discount Analysis",
    icon: <Tag size={28} />,
    color: "text-pink-600",
    gradient: "from-pink-50 to-pink-100",
    hoverColor: "hover:border-pink-300",
    bgGradient: "from-pink-500 to-pink-600"
  },
  {
    id: "sessions",
    label: "Sessions Analytics",
    description: "Session Management and Performance Analytics",
    icon: <BarChart3 size={28} />,
    color: "text-violet-600",
    gradient: "from-violet-50 to-violet-100",
    hoverColor: "hover:border-violet-300",
    bgGradient: "from-violet-500 to-violet-600"
  }
];

export function DashboardGrid({ 
  buttons = defaultButtons, 
  onButtonClick = () => {} 
}: DashboardGridProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  const handleButtonClick = (buttonId: string) => {
    setClickedButton(buttonId);
    onButtonClick(buttonId);
    
    // Reset click animation after a short delay
    setTimeout(() => {
      setClickedButton(null);
    }, 150);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-16">
      {/* Premium Header Section */}
      <div className="text-center space-y-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl border border-white/20">
          <Sparkles className="w-4 h-4" />
          <span className="tracking-wide">Analytics Dashboard</span>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
            Choose Your Analytics
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Select a category below to dive deep into your studio's performance metrics and gain actionable insights
          </p>
        </div>
      </div>
      
      {/* Sophisticated Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {buttons.map((button) => (
          <button
            key={button.id}
            className={cn(
              "group relative overflow-hidden",
              "bg-white border-2 border-gray-100 rounded-3xl",
              "p-10 text-left transition-all duration-700 ease-out",
              "hover:shadow-2xl hover:shadow-gray-200/60",
              "hover:-translate-y-4 hover:scale-[1.02]",
              "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300",
              "active:scale-[0.98] active:transition-transform active:duration-150",
              clickedButton === button.id && "scale-[0.98]",
              hoveredButton === button.id && "border-gray-200 shadow-xl"
            )}
            onMouseEnter={() => setHoveredButton(button.id)}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => handleButtonClick(button.id)}
          >
            {/* Premium Gradient Background Overlay */}
            <div 
              className={cn(
                "absolute inset-0 opacity-0 transition-all duration-700",
                `bg-gradient-to-br ${button.gradient}`,
                hoveredButton === button.id && "opacity-40"
              )}
            />
            
            {/* Subtle Pattern Overlay */}
            <div className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-700",
              hoveredButton === button.id && "opacity-5"
            )}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,0,0,0.1),transparent_50%)]"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 space-y-8">
              {/* Enhanced Icon Container */}
              <div className="flex items-start justify-between">
                <div className={cn(
                  "inline-flex items-center justify-center",
                  "w-20 h-20 rounded-2xl mb-2",
                  "bg-gray-50 border-2 border-gray-100",
                  "transition-all duration-700",
                  button.color,
                  hoveredButton === button.id && "shadow-2xl scale-110 border-white",
                  hoveredButton === button.id && `bg-gradient-to-br ${button.bgGradient} text-white`
                )}>
                  {button.icon}
                </div>
                
                {/* Floating Arrow - Always Visible but Transforms */}
                <div className={cn(
                  "transition-all duration-700",
                  "opacity-40 translate-x-0 scale-90",
                  hoveredButton === button.id && "opacity-100 translate-x-1 scale-100"
                )}>
                  <div className={cn(
                    "flex items-center justify-center",
                    "w-10 h-10 rounded-xl",
                    "bg-gray-50 border border-gray-200",
                    "transition-all duration-500",
                    "text-gray-400",
                    hoveredButton === button.id && `bg-gradient-to-br ${button.bgGradient} text-white border-transparent shadow-lg`
                  )}>
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
              
              {/* Enhanced Text Content */}
              <div className="space-y-4">
                <h3 className={cn(
                  "text-xl font-bold text-gray-900 leading-tight tracking-tight",
                  "transition-colors duration-500",
                  hoveredButton === button.id && button.color
                )}>
                  {button.label}
                </h3>
                
                <p className={cn(
                  "text-sm text-gray-500 leading-relaxed font-medium",
                  "transition-colors duration-500",
                  hoveredButton === button.id && "text-gray-600"
                )}>
                  {button.description}
                </p>
              </div>
            </div>
            
            {/* Premium Bottom Accent */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-1.5",
              "bg-gradient-to-r transition-all duration-700",
              button.bgGradient,
              "opacity-0 scale-x-0 rounded-b-3xl",
              hoveredButton === button.id && "opacity-100 scale-x-100"
            )} />

            {/* Enhanced Glow Effect */}
            <div className={cn(
              "absolute -inset-1 rounded-3xl transition-all duration-700 pointer-events-none",
              "opacity-0 blur-xl",
              hoveredButton === button.id && "opacity-20",
              hoveredButton === button.id && `bg-gradient-to-r ${button.bgGradient}`
            )} />
          </button>
        ))}
      </div>
    </div>
  );
}
