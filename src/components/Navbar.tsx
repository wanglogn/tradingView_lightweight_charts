import { useTheme } from "@/hooks/useTheme";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface NavbarProps {
  activeSection: string;
  onNavClick: (section: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavClick }) => {
  // 使用useTheme hook获取主题状态和方法
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  
  const navItems = [
    { id: "home", label: "首页", route: "/" },
    { id: "chart-types", label: "图表类型", route: "/chart-types" },
    { id: "configuration", label: "配置选项", route: "/configuration" },
    { id: "events", label: "事件与交互", route: "/events" },
    { id: "advanced-features", label: "高级功能", route: "/advanced-features" },
    { id: "data-handling", label: "数据处理", route: "/data-handling" },
    { id: "price-formatters", label: "价格格式化", route: "/price-formatters" },
    { id: "technical-indicators", label: "技术指标", route: "/technical-indicators" }
  ];

  const toggleVariants = {
    light: { rotate: 0 },
    dark: { rotate: 180 }
  };

  // 移动端菜单状态
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 确保路由变化时关闭移动端菜单
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={cn(
      "sticky top-0 z-50 backdrop-blur-md bg-opacity-80 border-b transition-colors duration-300",
      isDark 
        ? "bg-gray-900/80 border-gray-800" 
        : "bg-white/80 border-gray-200"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" 
              onClick={() => onNavClick("home")}
              className="flex items-center space-x-2">
              <i className="fa fa-chart-line text-blue-600 dark:text-blue-400"></i>
              <span className="font-bold text-xl">TradingView 图表手册</span>
            </Link>
          </div>
          
          {/* 桌面菜单 */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.route}
                onClick={() => onNavClick(item.id)}
                className={cn(
                  "py-2 px-1 text-sm font-medium transition-colors duration-200 relative",
                  activeSection === item.id
                    ? "text-blue-600 dark:text-blue-400"
                    : isDark 
                      ? "text-gray-300 hover:text-white" 
                      : "text-gray-600 hover:text-black"
                )}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
          
            {/* 主题切换按钮 - 在所有屏幕尺寸显示 */}
            <motion.button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2",
                isDark 
                  ? "bg-gray-800 focus:bg-gray-700 focus:ring-blue-500/50" 
                  : "bg-gray-100 focus:bg-gray-200 focus:ring-blue-500"
              )}
              whileTap={{ scale: 0.95 }}
              animate={isDark ? "dark" : "light"}
              variants={toggleVariants}
              transition={{ duration: 0.3 }}
            >
              <i className="fa fa-moon-o dark:hidden"></i>
              <i className="fa fa-sun-o hidden dark:block"></i>
            </motion.button>
            
            {/* 汉堡菜单按钮 - 仅在移动端显示 */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 md:hidden ml-4",
                isDark 
                  ? "bg-gray-800 focus:bg-gray-700 focus:ring-blue-500/50" 
                  : "bg-gray-100 focus:bg-gray-200 focus:ring-blue-500"
              )}
            >
              <i className="fa fa-bars"></i>
            </button>
        </div>
        
        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.route}
                  onClick={() => {
                    onNavClick(item.id);
                    setMobileMenuOpen(false); // 关闭菜单
                  }}
                  className={cn(
                    "py-2 px-4 text-base font-medium rounded-md transition-colors duration-200",
                    activeSection === item.id
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : isDark 
                        ? "text-gray-300 hover:bg-gray-800" 
                        : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;