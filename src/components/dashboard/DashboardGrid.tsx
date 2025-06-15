
import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Calendar, 
  Tag,
  ChevronRight 
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
}

interface DashboardGridProps {
  buttons?: DashboardButton[];
  onButtonClick?: (buttonId: string) => void;
}

const defaultButtons: DashboardButton[] = [
  {
    id: "executive-summary",
    label: "Executive Summary",
    description: "Strategic Performance Overview",
    icon: <BarChart3 size={28} />,
    color: "text-blue-600",
    gradient: "from-blue-50 to-blue-100",
    hoverColor: "hover:border-blue-300"
  },
  {
    id: "sales-analytics",
    label: "Sales Analytics",
    description: "Revenue and Sales Intelligence",
    icon: <TrendingUp size={28} />,
    color: "text-emerald-600",
    gradient: "from-emerald-50 to-emerald-100",
    hoverColor: "hover:border-emerald-300"
  },
  {
    id: "funnel-leads",
    label: "Funnel & Lead Performance",
    description: "Lead Pipeline Efficiency and Conversion Metrics",
    icon: <BarChart3 size={28} />,
    color: "text-purple-600",
    gradient: "from-purple-50 to-purple-100",
    hoverColor: "hover:border-purple-300"
  },
  {
    id: "client-retention",
    label: "New Client Conversion & Retention",
    description: "Client Acquisition and Retention Analysis",
    icon: <Users size={28} />,
    color: "text-orange-600",
    gradient: "from-orange-50 to-orange-100",
    hoverColor: "hover:border-orange-300"
  },
  {
    id: "trainer-performance",
    label: "Trainer Performance & Analytics",
    description: "Instructor Productivity and Engagement Metrics",
    icon: <UserCheck size={28} />,
    color: "text-cyan-600",
    gradient: "from-cyan-50 to-cyan-100",
    hoverColor: "hover:border-cyan-300"
  },
  {
    id: "class-attendance",
    label: "Class Attendance",
    description: "Utilization and Attendance Trends",
    icon: <Calendar size={28} />,
    color: "text-indigo-600",
    gradient: "from-indigo-50 to-indigo-100",
    hoverColor: "hover:border-indigo-300"
  },
  {
    id: "discounts-promotions",
    label: "Discounts & Promotions",
    description: "Promotional Impact and Discount Analysis",
    icon: <Tag size={28} />,
    color: "text-pink-600",
    gradient: "from-pink-50 to-pink-100",
    hoverColor: "hover:border-pink-300"
  },
  {
    id: "sessions",
    label: "Sessions",
    description: "Session Management and Analytics",
    icon: <BarChart3 size={28} />,
    color: "text-violet-600",
    gradient: "from-violet-50 to-violet-100",
    hoverColor: "hover:border-violet-300"
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
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Analytics Dashboard</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select a category to view detailed insights and metrics for your business performance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {buttons.map((button) => (
          <button
            key={button.id}
            className={cn(
              "group relative overflow-hidden",
              "bg-white border-2 border-gray-200 rounded-2xl",
              "p-8 text-left transition-all duration-300 ease-out",
              "hover:shadow-xl hover:shadow-gray-100",
              "hover:-translate-y-2 hover:scale-[1.02]",
              "focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300",
              "active:scale-[0.98] active:transition-transform active:duration-75",
              button.hoverColor,
              clickedButton === button.id && "scale-[0.98]"
            )}
            onMouseEnter={() => setHoveredButton(button.id)}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => handleButtonClick(button.id)}
          >
            {/* Background gradient overlay */}
            <div 
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-300",
                `bg-gradient-to-br ${button.gradient}`,
                hoveredButton === button.id && "opacity-60"
              )}
            />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon container */}
              <div className={cn(
                "inline-flex items-center justify-center",
                "w-20 h-20 rounded-2xl mb-6",
                "bg-white shadow-lg border border-gray-100",
                "transition-all duration-300",
                button.color,
                hoveredButton === button.id && "shadow-xl scale-110 -rotate-3"
              )}>
                {button.icon}
              </div>
              
              {/* Text content */}
              <div className="space-y-3">
                <h3 className={cn(
                  "text-xl font-bold text-gray-900",
                  "transition-colors duration-300 leading-tight",
                  hoveredButton === button.id && button.color
                )}>
                  {button.label}
                </h3>
                
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {button.description}
                </p>
              </div>
              
              {/* Arrow indicator */}
              <div className={cn(
                "absolute top-8 right-8",
                "transition-all duration-300",
                "opacity-0 translate-x-2 scale-75",
                hoveredButton === button.id && "opacity-100 translate-x-0 scale-100"
              )}>
                <div className={cn(
                  "flex items-center justify-center",
                  "w-10 h-10 rounded-full",
                  "bg-white shadow-lg border border-gray-200",
                  button.color
                )}>
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
            
            {/* Bottom accent line */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-1",
              "bg-gradient-to-r transition-all duration-300",
              button.gradient,
              "opacity-0",
              hoveredButton === button.id && "opacity-100"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
}
