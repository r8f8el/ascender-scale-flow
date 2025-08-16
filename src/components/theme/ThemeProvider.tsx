
import * as React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Simple theme provider that doesn't depend on next-themes initially
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Return children without theme context initially to avoid errors
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  // Dynamically import and use next-themes only after mounting
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ThemeProvider: NextThemesProvider } = require('next-themes');
    
    return (
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        themes={['light', 'dark']}
        storageKey="ascender-theme"
        disableTransitionOnChange={false}
        forcedTheme={undefined}
        suppressHydrationWarning
      >
        {children}
      </NextThemesProvider>
    );
  } catch (error) {
    console.error('Theme provider error:', error);
    return <div suppressHydrationWarning>{children}</div>;
  }
};
