
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

const themes: Theme[] = [
  // Light Themes
  {
    id: 'light-modern',
    name: 'Modern Light',
    mode: 'light',
    primary: 'from-blue-500 to-purple-600',
    secondary: 'from-gray-50 to-gray-100',
    accent: 'from-indigo-500 to-blue-600',
    background: 'bg-gradient-to-br from-gray-50 via-white to-blue-50',
    surface: 'bg-white/80 backdrop-blur-sm border-gray-200',
    text: 'text-gray-900',
    border: 'border-gray-200'
  },
  {
    id: 'light-warm',
    name: 'Warm Light',
    mode: 'light',
    primary: 'from-orange-500 to-red-600',
    secondary: 'from-orange-50 to-red-50',
    accent: 'from-amber-500 to-orange-600',
    background: 'bg-gradient-to-br from-orange-50 via-white to-amber-50',
    surface: 'bg-white/90 backdrop-blur-sm border-orange-200',
    text: 'text-gray-900',
    border: 'border-orange-200'
  },
  {
    id: 'light-nature',
    name: 'Nature Light',
    mode: 'light',
    primary: 'from-green-500 to-teal-600',
    secondary: 'from-green-50 to-teal-50',
    accent: 'from-emerald-500 to-green-600',
    background: 'bg-gradient-to-br from-green-50 via-white to-teal-50',
    surface: 'bg-white/90 backdrop-blur-sm border-green-200',
    text: 'text-gray-900',
    border: 'border-green-200'
  },
  {
    id: 'light-luxury',
    name: 'Luxury Light',
    mode: 'light',
    primary: 'from-purple-500 to-pink-600',
    secondary: 'from-purple-50 to-pink-50',
    accent: 'from-violet-500 to-purple-600',
    background: 'bg-gradient-to-br from-purple-50 via-white to-pink-50',
    surface: 'bg-white/90 backdrop-blur-sm border-purple-200',
    text: 'text-gray-900',
    border: 'border-purple-200'
  },
  {
    id: 'light-corporate',
    name: 'Corporate Light',
    mode: 'light',
    primary: 'from-slate-500 to-gray-600',
    secondary: 'from-slate-50 to-gray-50',
    accent: 'from-blue-500 to-slate-600',
    background: 'bg-gradient-to-br from-slate-50 via-white to-gray-50',
    surface: 'bg-white/95 backdrop-blur-sm border-slate-200',
    text: 'text-gray-900',
    border: 'border-slate-200'
  },
  // Dark Themes
  {
    id: 'dark-modern',
    name: 'Modern Dark',
    mode: 'dark',
    primary: 'from-blue-400 to-purple-500',
    secondary: 'from-slate-800 to-slate-900',
    accent: 'from-indigo-400 to-blue-500',
    background: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
    surface: 'bg-slate-900/50 backdrop-blur-sm border-slate-800',
    text: 'text-white',
    border: 'border-slate-800'
  },
  {
    id: 'dark-warm',
    name: 'Warm Dark',
    mode: 'dark',
    primary: 'from-orange-400 to-red-500',
    secondary: 'from-red-900/20 to-orange-900/20',
    accent: 'from-amber-400 to-orange-500',
    background: 'bg-gradient-to-br from-red-950 via-slate-900 to-orange-950',
    surface: 'bg-red-900/20 backdrop-blur-sm border-red-800/30',
    text: 'text-white',
    border: 'border-red-800/30'
  },
  {
    id: 'dark-nature',
    name: 'Nature Dark',
    mode: 'dark',
    primary: 'from-green-400 to-teal-500',
    secondary: 'from-green-900/20 to-teal-900/20',
    accent: 'from-emerald-400 to-green-500',
    background: 'bg-gradient-to-br from-green-950 via-slate-900 to-teal-950',
    surface: 'bg-green-900/20 backdrop-blur-sm border-green-800/30',
    text: 'text-white',
    border: 'border-green-800/30'
  },
  {
    id: 'dark-luxury',
    name: 'Luxury Dark',
    mode: 'dark',
    primary: 'from-purple-400 to-pink-500',
    secondary: 'from-purple-900/20 to-pink-900/20',
    accent: 'from-violet-400 to-purple-500',
    background: 'bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950',
    surface: 'bg-purple-900/20 backdrop-blur-sm border-purple-800/30',
    text: 'text-white',
    border: 'border-purple-800/30'
  },
  {
    id: 'dark-corporate',
    name: 'Corporate Dark',
    mode: 'dark',
    primary: 'from-slate-400 to-gray-500',
    secondary: 'from-slate-900 to-gray-900',
    accent: 'from-blue-400 to-slate-500',
    background: 'bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950',
    surface: 'bg-slate-900/80 backdrop-blur-sm border-slate-700',
    text: 'text-white',
    border: 'border-slate-700'
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('selectedTheme', themeId);
      
      // Apply theme to document
      document.documentElement.className = theme.mode;
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, setTheme }}>
      <div className={currentTheme.background}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
