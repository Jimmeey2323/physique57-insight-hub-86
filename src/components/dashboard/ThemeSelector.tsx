
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  currentTheme: string;
  isDarkMode: boolean;
  onThemeChange: (theme: string) => void;
  onModeChange: (isDark: boolean) => void;
}

const themes = {
  light: [
    { id: 'classic', name: 'Classic Blue', primary: 'from-blue-500 to-blue-700', accent: 'from-blue-100 to-blue-200' },
    { id: 'royal', name: 'Royal Purple', primary: 'from-purple-500 to-purple-700', accent: 'from-purple-100 to-purple-200' },
    { id: 'emerald', name: 'Emerald Green', primary: 'from-emerald-500 to-emerald-700', accent: 'from-emerald-100 to-emerald-200' },
    { id: 'sunset', name: 'Sunset Orange', primary: 'from-orange-500 to-red-600', accent: 'from-orange-100 to-red-100' },
    { id: 'rose', name: 'Rose Gold', primary: 'from-rose-500 to-pink-600', accent: 'from-rose-100 to-pink-100' }
  ],
  dark: [
    { id: 'midnight', name: 'Midnight Blue', primary: 'from-blue-600 to-indigo-800', accent: 'from-slate-800 to-blue-900' },
    { id: 'cosmic', name: 'Cosmic Purple', primary: 'from-purple-600 to-violet-800', accent: 'from-slate-800 to-purple-900' },
    { id: 'forest', name: 'Forest Green', primary: 'from-emerald-600 to-green-800', accent: 'from-slate-800 to-emerald-900' },
    { id: 'amber', name: 'Amber Night', primary: 'from-amber-600 to-orange-800', accent: 'from-slate-800 to-amber-900' },
    { id: 'crimson', name: 'Crimson Elite', primary: 'from-red-600 to-rose-800', accent: 'from-slate-800 to-red-900' }
  ]
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  isDarkMode,
  onThemeChange,
  onModeChange
}) => {
  const currentThemes = isDarkMode ? themes.dark : themes.light;

  return (
    <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">Theme Customization</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={!isDarkMode ? "default" : "outline"}
              size="sm"
              onClick={() => onModeChange(false)}
              className="gap-1"
            >
              <Sun className="w-4 h-4" />
              Light
            </Button>
            <Button
              variant={isDarkMode ? "default" : "outline"}
              size="sm"
              onClick={() => onModeChange(true)}
              className="gap-1"
            >
              <Moon className="w-4 h-4" />
              Dark
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {currentThemes.map((theme) => (
            <Button
              key={theme.id}
              variant="outline"
              className={cn(
                "h-20 flex flex-col items-center justify-center gap-2 relative overflow-hidden",
                currentTheme === theme.id && "ring-2 ring-blue-500"
              )}
              onClick={() => onThemeChange(theme.id)}
            >
              <div className={cn("w-8 h-8 rounded-full bg-gradient-to-r", theme.primary)} />
              <span className="text-xs font-medium">{theme.name}</span>
              <div className={cn("absolute inset-0 bg-gradient-to-r opacity-10", theme.accent)} />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
