
import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThemeToggle: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setThemeState] = React.useState<string>('light');

  React.useEffect(() => {
    setMounted(true);
    // Try to get initial theme from localStorage
    try {
      const savedTheme = localStorage.getItem('ascender-theme') || 'light';
      setThemeState(savedTheme);
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    try {
      // Try to use next-themes hook if available
      const { useTheme } = require('next-themes');
      const { setTheme } = useTheme();
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Theme toggle error:', error);
      // Fallback: manual theme switching
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setThemeState(newTheme);
      try {
        localStorage.setItem('ascender-theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      } catch (storageError) {
        console.error('Error saving theme:', storageError);
      }
    }
  }, [theme]);

  // Don't render anything until mounted
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0"
        disabled
        suppressHydrationWarning
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0"
      suppressHydrationWarning
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
