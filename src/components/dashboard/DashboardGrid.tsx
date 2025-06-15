import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Funnel, 
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
    gradient: "from-blue-50 to-blue-100"
  },
  {
    id: "sales-analytics",
    label: "Sales Analytics",
    description: "Revenue and Sales Intelligence",
    icon: <TrendingUp size={28} />,
    color: "text-emerald-600",
    gradient: "from-emerald-50 to-emerald-100"
  },
  {
    id: "funnel-leads",
    label: "Funnel & Lead Performance",
    description: "Lead Pipeline Efficiency and Conversion Metrics",
    icon: <BarChart3 size={28} />,
    color: "text-purple-600",
    gradient: "from-purple-50 to-purple-100"
  },
  {
    id: "client-retention",
    label: "New Client Conversion & Retention",
    description: "Client Acquisition and Retention Analysis",
    icon: <Users size={28} />,
    color: "text-orange-600",
    gradient: "from-orange-50 to-orange-100"
  },
  {
    id: "trainer-performance",
    label: "Trainer Performance & Analytics",
    description: "Instructor Productivity and Engagement Metrics",
    icon: <UserCheck size={28} />,
    color: "text-cyan-600",
    gradient: "from-cyan-50 to-cyan-100"
  },
  {
    id: "class-attendance",
    label: "Class Attendance",
    description: "Utilization and Attendance Trends",
    icon: <Calendar size={28} />,
    color: "text-indigo-600",
    gradient: "from-indigo-50 to-indigo-100"
  },
  {
    id: "discounts-promotions",
    label: "Discounts & Promotions",
    description: "Promotional Impact and Discount Analysis",
    icon: <Tag size={28} />,
    color: "text-pink-600",
    gradient: "from-pink-50 to-pink-100"
  },
  {
    id: "sessions",
    label: "Sessions",
    description: "Session Management and Analytics",
    icon: <BarChart3 size={28} />,
    color: "text-violet-600",
    gradient: "from-violet-50 to-violet-100"
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
    <div className="w-full max-w-7xl mx-auto p-6 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Select a category to view detailed insights and metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {buttons.map((button) => (
          <button
            key={button.id}
            className={cn(
              "group relative overflow-hidden",
              "bg-white border border-border rounded-xl",
              "p-6 text-left transition-all duration-300 ease-out",
              "hover:shadow-lg hover:shadow-black/5",
              "hover:-translate-y-1 hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "active:scale-[0.98] active:transition-transform active:duration-75",
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
                hoveredButton === button.id && "opacity-100"
              )}
            />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon container */}
              <div className={cn(
                "inline-flex items-center justify-center",
                "w-16 h-16 rounded-lg mb-4",
                "bg-gradient-to-br from-white to-gray-50",
                "border border-border shadow-sm",
                "transition-all duration-300",
                button.color,
                hoveredButton === button.id && "shadow-md scale-110"
              )}>
                {button.icon}
              </div>
              
              {/* Text content */}
              <div className="space-y-2">
                <h3 className={cn(
                  "text-lg font-semibold text-foreground",
                  "transition-colors duration-300",
                  hoveredButton === button.id && button.color
                )}>
                  {button.label}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {button.description}
                </p>
              </div>
              
              {/* Arrow indicator */}
              <div className={cn(
                "absolute top-6 right-6",
                "transition-all duration-300",
                "opacity-0 translate-x-2",
                hoveredButton === button.id && "opacity-100 translate-x-0"
              )}>
                <div className={cn(
                  "flex items-center justify-center",
                  "w-8 h-8 rounded-full",
                  "bg-white shadow-sm border border-border",
                  button.color
                )}>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
            
            {/* Subtle border highlight on hover */}
            <div className={cn(
              "absolute inset-0 rounded-xl",
              "border-2 border-transparent transition-colors duration-300",
              hoveredButton === button.id && "border-current opacity-20"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
}
