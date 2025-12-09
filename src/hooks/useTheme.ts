import { useContext } from 'react';
import { ThemeContext } from '../contexts/themeContext';

// 这是一个便利Hook，直接使用ThemeContext
export function useTheme() {
  const context = useContext(ThemeContext);
  
  // 确保context存在
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}