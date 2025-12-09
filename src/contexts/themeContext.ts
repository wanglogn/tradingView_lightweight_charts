import { createContext } from "react";

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

// 提供默认值，确保组件在没有Provider的情况下也能工作
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
  setTheme: () => {}
});

export const ThemeProvider = ThemeContext.Provider;