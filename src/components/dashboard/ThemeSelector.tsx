
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
    { id: 'classic', name: 'Classic', primary: '#3B82F6', secondary: '#8B5CF6', gradient: 'from-blue-500 to-purple-600' },
    { id: 'royal', name: 'Royal', primary: '#8B5CF6', secondary: '#A855F7', gradient: 'from-purple-500 to-violet-600' },
    { id: 'emerald', name: 'Emerald', primary: '#10B981', secondary: '#059669', gradient: 'from-emerald-500 to-green-600' },
    { id: 'sunset', name: 'Sunset', primary: '#F59E0B', secondary: '#EF4444', gradient: 'from-orange-500 to-red-600' },
    { id: 'rose', name: 'Rose', primary: '#EC4899', secondary: '#F43F5E', gradient: 'from-pink-500 to-rose-600' }
  ],
  dark: [
    { id: 'midnight', name: 'Midnight', primary: '#3B82F6', secondary: '#6366F1', gradient: 'from-blue-600 to-indigo-700' },
    { id: 'cosmic', name: 'Cosmic', primary: '#8B5CF6', secondary: '#7C3AED', gradient: 'from-purple-600 to-violet-700' },
    { id: 'forest', name: 'Forest', primary: '#10B981', secondary: '#059669', gradient: 'from-emerald-600 to-green-700' },
    { id: 'amber', name: 'Amber', primary: '#F59E0B', secondary: '#D97706', gradient: 'from-amber-600 to-orange-700' },
    { id: 'crimson', name: 'Crimson', primary: '#EF4444', secondary: '#DC2626', gradient: 'from-red-600 to-rose-700' }
  ]
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  isDarkMode,
  onThemeChange,
  onModeChange
}) => {
  const currentThemes = isDarkMode ? themes.dark : themes.light;

  React.useEffect(() => {
    const selectedTheme = currentThemes.find(t => t.id === currentTheme);
    if (selectedTheme) {
      document.documentElement.style.setProperty('--theme-primary', selectedTheme.primary);
      document.documentElement.style.setProperty('--theme-secondary', selectedTheme.secondary);
    }
  }, [currentTheme, isDarkMode, currentThemes]);

  return (
    <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">Themes</h3>
            
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant={!isDarkMode ? "default" : "outline"}
                size="sm"
                onClick={() => onModeChange(false)}
                className="p-2"
              >
                <Sun className="w-4 h-4" />
              </Button>
              <Button
                variant={isDarkMode ? "default" : "outline"}
                size="sm"
                onClick={() => onModeChange(true)}
                className="p-2"
              >
                <Moon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            {currentThemes.map((theme) => (
              <Button
                key={theme.id}
                variant="outline"
                size="sm"
                className={cn(
                  "w-8 h-8 p-0 rounded-full border-2 relative overflow-hidden",
                  currentTheme === theme.id && "ring-2 ring-offset-2 ring-blue-500"
                )}
                onClick={() => onThemeChange(theme.id)}
                title={theme.name}
              >
                <div 
                  className="w-full h-full rounded-full"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` 
                  }}
                />
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
