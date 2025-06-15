
import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Calendar, 
  Tag,
  ChevronRight,
  BarChart2
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
  cardGradient: string;
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
    color: "text-blue-700",
    gradient: "from-blue-50 to-blue-100",
    hoverColor: "hover:border-blue-300",
    bgGradient: "from-blue-600 to-blue-700",
    cardGradient: "from-blue-50/50 to-blue-100/30"
  },
  {
    id: "sales-analytics",
    label: "Sales Analytics",
    description: "Revenue Intelligence & Sales Performance",
    icon: <TrendingUp size={28} />,
    color: "text-emerald-700",
    gradient: "from-emerald-50 to-emerald-100",
    hoverColor: "hover:border-emerald-300",
    bgGradient: "from-emerald-600 to-emerald-700",
    cardGradient: "from-emerald-50/50 to-emerald-100/30"
  },
  {
    id: "funnel-leads",
    label: "Funnel & Lead Performance",
    description: "Lead Pipeline Efficiency and Conversion Metrics",
    icon: <BarChart2 size={28} />,
    color: "text-purple-700",
    gradient: "from-purple-50 to-purple-100",
    hoverColor: "hover:border-purple-300",
    bgGradient: "from-purple-600 to-purple-700",
    cardGradient: "from-purple-50/50 to-purple-100/30"
  },
  {
    id: "client-retention",
    label: "Client Conversion & Retention",
    description: "Client Acquisition and Retention Analysis",
    icon: <Users size={28} />,
    color: "text-orange-700",
    gradient: "from-orange-50 to-orange-100",
    hoverColor: "hover:border-orange-300",
    bgGradient: "from-orange-600 to-orange-700",
    cardGradient: "from-orange-50/50 to-orange-100/30"
  },
  {
    id: "trainer-performance",
    label: "Trainer Performance",
    description: "Instructor Productivity and Engagement Metrics",
    icon: <UserCheck size={28} />,
    color: "text-teal-700",
    gradient: "from-teal-50 to-teal-100",
    hoverColor: "hover:border-teal-300",
    bgGradient: "from-teal-600 to-teal-700",
    cardGradient: "from-teal-50/50 to-teal-100/30"
  },
  {
    id: "class-attendance",
    label: "Class Attendance",
    description: "Utilization and Attendance Trends",
    icon: <Calendar size={28} />,
    color: "text-indigo-700",
    gradient: "from-indigo-50 to-indigo-100",
    hoverColor: "hover:border-indigo-300",
    bgGradient: "from-indigo-600 to-indigo-700",
    cardGradient: "from-indigo-50/50 to-indigo-100/30"
  },
  {
    id: "discounts-promotions",
    label: "Discounts & Promotions",
    description: "Promotional Impact and Discount Analysis",
    icon: <Tag size={28} />,
    color: "text-pink-700",
    gradient: "from-pink-50 to-pink-100",
    hoverColor: "hover:border-pink-300",
    bgGradient: "from-pink-600 to-pink-700",
    cardGradient: "from-pink-50/50 to-pink-100/30"
  },
  {
    id: "sessions",
    label: "Sessions Analytics",
    description: "Session Management and Performance Analytics",
    icon: <BarChart3 size={28} />,
    color: "text-rose-700",
    gradient: "from-rose-50 to-rose-100",
    hoverColor: "hover:border-rose-300",
    bgGradient: "from-rose-600 to-rose-700",
    cardGradient: "from-rose-50/50 to-rose-100/30"
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
      {/* Enhanced Header Section with Gradient */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-light bg-gradient-to-r from-slate-900 via-purple-700 to-blue-700 bg-clip-text text-transparent tracking-wide">
          Business Intelligence <span className="font-semibold">Modules</span>
        </h2>
        
        <p className="text-lg bg-gradient-to-r from-slate-600 to-purple-600 bg-clip-text text-transparent max-w-3xl mx-auto leading-relaxed font-light">
          Access comprehensive analytics and insights to drive strategic business decisions
        </p>
        
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto"></div>
      </div>
      
      {/* Enhanced Dashboard Grid with Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {buttons.map((button) => (
          <button
            key={button.id}
            className={cn(
              "group relative overflow-hidden",
              "bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl",
              "p-8 text-left transition-all duration-300 ease-out",
              "hover:shadow-2xl hover:shadow-purple-200/40",
              "hover:-translate-y-2 hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400",
              "active:scale-[0.98] active:transition-transform active:duration-100",
              button.hoverColor,
              clickedButton === button.id && "scale-[0.98]",
              hoveredButton === button.id && "border-white/60 shadow-xl"
            )}
            onMouseEnter={() => setHoveredButton(button.id)}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => handleButtonClick(button.id)}
          >
            {/* Colorful Background Overlay */}
            <div 
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-300",
                `bg-gradient-to-br ${button.cardGradient}`,
                hoveredButton === button.id && "opacity-100"
              )}
            />
            
            {/* Content */}
            <div className="relative z-10 space-y-5">
              {/* Enhanced Icon Container */}
              <div className={cn(
                "inline-flex items-center justify-center",
                "w-16 h-16 rounded-xl mb-2",
                "bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm border border-white/60",
                "transition-all duration-300",
                button.color,
                hoveredButton === button.id && "shadow-lg scale-110 border-white/80",
                hoveredButton === button.id && `bg-gradient-to-br ${button.bgGradient} text-white border-transparent shadow-xl`
              )}>
                {button.icon}
              </div>
              
              {/* Text Content */}
              <div className="space-y-3">
                <h3 className={cn(
                  "text-lg font-semibold text-slate-900 leading-tight",
                  "transition-all duration-300",
                  hoveredButton === button.id && `bg-gradient-to-r ${button.bgGradient} bg-clip-text text-transparent font-bold`
                )}>
                  {button.label}
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  {button.description}
                </p>
              </div>
            </div>
            
            {/* Enhanced Floating Arrow */}
            <div className={cn(
              "absolute top-6 right-6",
              "transition-all duration-300",
              "opacity-0 translate-x-2 scale-90",
              hoveredButton === button.id && "opacity-100 translate-x-0 scale-100"
            )}>
              <div className={cn(
                "flex items-center justify-center",
                "w-8 h-8 rounded-lg",
                "bg-white/80 backdrop-blur-sm border border-white/60",
                "transition-all duration-300",
                button.color,
                hoveredButton === button.id && `bg-gradient-to-br ${button.bgGradient} text-white border-transparent shadow-lg`
              )}>
                <ChevronRight size={14} />
              </div>
            </div>
            
            {/* Enhanced Bottom Accent Line */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-1",
              "bg-gradient-to-r transition-all duration-300",
              button.bgGradient,
              "opacity-0 scale-x-0",
              hoveredButton === button.id && "opacity-100 scale-x-100"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
}
