
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, themes, setTheme } = useTheme();

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`${currentTheme.surface} ${currentTheme.border} ${currentTheme.text} hover:opacity-80`}
      >
        <Palette className="w-4 h-4 mr-2" />
        {currentTheme.name}
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 z-50 w-64"
          >
            <Card className={`${currentTheme.surface} ${currentTheme.border} shadow-2xl overflow-hidden`}>
              <div className="p-4">
                <h3 className={`font-semibold mb-3 ${currentTheme.text}`}>Choose Theme</h3>
                <div className="space-y-2">
                  {themes.map((theme) => (
                    <motion.button
                      key={theme.id}
                      onClick={() => {
                        setTheme(theme.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        currentTheme.id === theme.id 
                          ? `bg-gradient-to-r ${theme.primary} text-white` 
                          : `hover:bg-gray-100 dark:hover:bg-slate-800 ${currentTheme.text}`
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.primary}`} />
                        <span className="font-medium">{theme.name}</span>
                      </div>
                      {currentTheme.id === theme.id && (
                        <Check className="w-4 h-4" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
