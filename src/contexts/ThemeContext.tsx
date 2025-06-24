import React, { createContext, useContext, useState, useEffect } from 'react';
import { MantineColorScheme } from '@mantine/core';

interface ThemeContextType {
  colorScheme: MantineColorScheme;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colorScheme, setColorScheme] = useState<MantineColorScheme>('light');

  // ローカルストレージからテーマを読み込み
  useEffect(() => {
    const savedTheme = localStorage.getItem('kakeibo-theme') as MantineColorScheme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setColorScheme(savedTheme);
    } else {
      // システムのテーマ設定を確認
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setColorScheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  // テーマが変更されたときにローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('kakeibo-theme', colorScheme);
  }, [colorScheme]);

  const toggleColorScheme = () => {
    setColorScheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}