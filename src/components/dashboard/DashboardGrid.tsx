
import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Calendar, 
  Tag,
  ChevronRight,
  Sparkles
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
    icon: <BarChart3 size={32} />,
    color: "text-blue-600",
    gradient: "from-blue-50 to-blue-100",
    hoverColor: "hover:border-blue-300",
    bgGradient: "from-blue-500 to-blue-600"
  },
  {
    id: "sales-analytics",
    label: "Sales Analytics",
    description: "Revenue Intelligence & Sales Performance",
    icon: <TrendingUp size={32} />,
    color: "text-emerald-600",
    gradient: "from-emerald-50 to-emerald-100",
    hoverColor: "hover:border-emerald-300",
    bgGradient: "from-emerald-500 to-emerald-600"
  },
  {
    id: "funnel-leads",
    label: "Funnel & Lead Performance",
    description: "Lead Pipeline Efficiency and Conversion Metrics",
    icon: <BarChart3 size={32} />,
    color: "text-purple-600",
    gradient: "from-purple-50 to-purple-100",
    hoverColor: "hover:border-purple-300",
    bgGradient: "from-purple-500 to-purple-600"
  },
  {
    id: "client-retention",
    label: "Client Conversion & Retention",
    description: "Client Acquisition and Retention Analysis",
    icon: <Users size={32} />,
    color: "text-orange-600",
    gradient: "from-orange-50 to-orange-100",
    hoverColor: "hover:border-orange-300",
    bgGradient: "from-orange-500 to-orange-600"
  },
  {
    id: "trainer-performance",
    label: "Trainer Performance",
    description: "Instructor Productivity and Engagement Metrics",
    icon: <UserCheck size={32} />,
    color: "text-cyan-600",
    gradient: "from-cyan-50 to-cyan-100",
    hoverColor: "hover:border-cyan-300",
    bgGradient: "from-cyan-500 to-cyan-600"
  },
  {
    id: "class-attendance",
    label: "Class Attendance",
    description: "Utilization and Attendance Trends",
    icon: <Calendar size={32} />,
    color: "text-indigo-600",
    gradient: "from-indigo-50 to-indigo-100",
    hoverColor: "hover:border-indigo-300",
    bgGradient: "from-indigo-500 to-indigo-600"
  },
  {
    id: "discounts-promotions",
    label: "Discounts & Promotions",
    description: "Promotional Impact and Discount Analysis",
    icon: <Tag size={32} />,
    color: "text-pink-600",
    gradient: "from-pink-50 to-pink-100",
    hoverColor: "hover:border-pink-300",
    bgGradient: "from-pink-500 to-pink-600"
  },
  {
    id: "sessions",
    label: "Sessions Analytics",
    description: "Session Management and Performance Analytics",
    icon: <BarChart3 size={32} />,
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
    <div className="w-full max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
          <Sparkles className="w-4 h-4" />
          Analytics Dashboard
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent">
          Choose Your Analytics
        </h2>
        
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Select a category below to dive deep into your studio's performance metrics and gain actionable insights
        </p>
      </div>
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {buttons.map((button) => (
          <button
            key={button.id}
            className={cn(
              "group relative overflow-hidden",
              "bg-white/90 backdrop-blur-sm border-2 border-gray-100 rounded-3xl",
              "p-8 text-left transition-all duration-500 ease-out",
              "hover:shadow-2xl hover:shadow-gray-200/50",
              "hover:-translate-y-3 hover:scale-[1.02]",
              "focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-300",
              "active:scale-[0.97] active:transition-transform active:duration-100",
              button.hoverColor,
              clickedButton === button.id && "scale-[0.97]",
              hoveredButton === button.id && "border-gray-200"
            )}
            onMouseEnter={() => setHoveredButton(button.id)}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => handleButtonClick(button.id)}
          >
            {/* Gradient Background Overlay */}
            <div 
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-500",
                `bg-gradient-to-br ${button.gradient}`,
                hoveredButton === button.id && "opacity-80"
              )}
            />
            
            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Icon Container */}
              <div className={cn(
                "inline-flex items-center justify-center",
                "w-20 h-20 rounded-2xl mb-2",
                "bg-white shadow-lg border border-gray-100",
                "transition-all duration-500",
                button.color,
                hoveredButton === button.id && "shadow-2xl scale-110 -rotate-6",
                hoveredButton === button.id && `bg-gradient-to-br ${button.bgGradient} text-white border-transparent`
              )}>
                {button.icon}
              </div>
              
              {/* Text Content */}
              <div className="space-y-3">
                <h3 className={cn(
                  "text-xl font-bold text-gray-900 leading-tight",
                  "transition-colors duration-300",
                  hoveredButton === button.id && button.color
                )}>
                  {button.label}
                </h3>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {button.description}
                </p>
              </div>
            </div>
            
            {/* Floating Arrow */}
            <div className={cn(
              "absolute top-6 right-6",
              "transition-all duration-500",
              "opacity-0 translate-x-4 scale-75",
              hoveredButton === button.id && "opacity-100 translate-x-0 scale-100"
            )}>
              <div className={cn(
                "flex items-center justify-center",
                "w-10 h-10 rounded-full",
                "bg-white shadow-lg border border-gray-200",
                "transition-all duration-300",
                button.color,
                hoveredButton === button.id && `bg-gradient-to-br ${button.bgGradient} text-white border-transparent shadow-xl`
              )}>
                <ChevronRight size={18} />
              </div>
            </div>
            
            {/* Bottom Accent Line */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-1",
              "bg-gradient-to-r transition-all duration-500",
              button.bgGradient,
              "opacity-0 scale-x-0",
              hoveredButton === button.id && "opacity-100 scale-x-100"
            )} />

            {/* Hover Glow Effect */}
            <div className={cn(
              "absolute inset-0 rounded-3xl transition-all duration-500 pointer-events-none",
              "opacity-0",
              hoveredButton === button.id && "opacity-100 shadow-2xl",
              hoveredButton === button.id && `shadow-${button.color.split('-')[1]}-200/30`
            )} />
          </button>
        ))}
      </div>
    </div>
  );
}
