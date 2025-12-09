import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import { useTheme } from '../hooks/useTheme';

interface CodeExampleProps {
  code: string;
  language?: string;
  isDark?: boolean;
}

const CodeExample: React.FC<CodeExampleProps> = ({ 
  code, 
  language = 'typescript',
  isDark: propIsDark
}) => {
  // 优先使用传入的isDark属性，如果没有则使用useTheme的isDark
  const { isDark: contextIsDark } = useTheme();
  const effectiveIsDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  
  const [highlightedCode, setHighlightedCode] = useState('');
  
  // 当代码或语言变化时重新高亮
  useEffect(() => {
    try {
      // Highlight the code using Prism
      const highlighted = Prism.highlight(code, Prism.languages[language], language);
      setHighlightedCode(highlighted);
    } catch (error) {
      console.error('Error highlighting code:', error);
      setHighlightedCode(code);
    }
  }, [code, language]);
  
  // 当主题变化时，确保更新语法高亮样式
  useEffect(() => {
    // 强制重新应用语法高亮
    try {
      const highlighted = Prism.highlight(code, Prism.languages[language], language);
      setHighlightedCode(highlighted);
    } catch (error) {
      console.error('Error re-highlighting code on theme change:', error);
    }
  }, [effectiveIsDark, code, language]);
  
  return (
    <div 
      className={cn(
        "rounded-12 overflow-hidden border",
        effectiveIsDark 
          ? "border-gray-700" 
          : "border-gray-200"
      )}
    >
      <div 
        className={cn(
          "px-4 py-2 flex items-center justify-between",
          effectiveIsDark 
            ? "bg-gray-800 text-gray-300" 
            : "bg-gray-100 text-gray-600"
        )}
      >
        <span className="text-sm font-mono">{language}</span>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      <pre 
        className={cn(
          "p-4 overflow-x-auto text-sm",
          effectiveIsDark 
            ? "bg-gray-900 text-gray-300" 
            : "bg-gray-50 text-gray-800"
        )}
      >
        <code 
          className={`language-${language} code-block`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

export default CodeExample;