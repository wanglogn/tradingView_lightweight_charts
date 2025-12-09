import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import ChartDisplay from "@/components/ChartDisplay";
import { lineChartData, candlestickChartData } from "@/data/mockData";
import { useEffect } from "react";

const Home = () => {
  // 使用useTheme hook获取主题状态
  const { isDark } = useTheme();
  
  // 监听全局主题变化事件
  useEffect(() => {
    const handleThemeChange = () => {
      // 强制重新渲染以应用新主题
      // 这里不需要实际操作，因为isDark已经是依赖项
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  
  // 特性列表 - 基于TradingView Lightweight Charts官网功能
  const features = [
    {
      title: "高性能渲染",
      description: "专为速度优化，能在毫秒内渲染数十万个数据点，即使在移动设备上也能流畅运行。",
      icon: "fa-tachometer-alt"
    },
    {
      title: "多图表类型支持",
      description: "内置折线图、面积图、柱状图、蜡烛图和直方图等多种图表类型，满足不同的可视化需求。",
      icon: "fa-chart-bar"
    },
    {
      title: "丰富的样式定制",
      description: "完全可定制的外观，包括颜色、字体、网格、坐标轴等，轻松融入您的应用设计。",
      icon: "fa-paint-brush"
    },
    {
      title: "交互式体验",
      description: "内置缩放、平移、十字光标、工具提示等交互功能，提供专业级用户体验。",
      icon: "fa-hand-pointer"
    },
    {
      title: "响应式设计",
      description: "自动适应任何屏幕尺寸和容器大小，在桌面和移动设备上都能完美展示。",
      icon: "fa-desktop"
    },
    {
      title: "轻量级体积",
      description: "最小化的包体积，核心库仅约42KB gzip压缩，对应用性能影响极小。"
    },
    {
      title: "灵活的API",
      description: "简洁而强大的API设计，便于集成和扩展，快速实现各种定制功能。",
      icon: "fa-code"
    },
    {
      title: "完整的事件系统",
      description: "提供丰富的事件监听机制，响应用户交互，实现复杂的交互逻辑。",
      icon: "fa-plug"
    },
    {
      title: "技术指标支持",
      description: "支持移动平均线、MACD、RSI等常用技术指标，满足专业金融分析需求。",
      icon: "fa-chart-line"
    }
  ];
  
  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900")}>
      {/* 英雄区域 */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              TradingView <br />
              <span className="text-blue-600 dark:text-blue-400">Lightweight Charts</span>
            </motion.h1>
            <motion.p 
              className={cn("text-xl mb-8", isDark ? "text-gray-300" : "text-gray-600")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              高性能、轻量级的金融图表库，为您的Web应用提供专业级的图表功能
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link to="/chart-types" className={cn(
                "px-6 py-3 rounded-full font-medium text-white transition-all duration-200",
                isDark 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              )}>
                开始探索
              </Link>
              <Link to="/configuration" className={cn(
                "px-6 py-3 rounded-full font-medium transition-all duration-200",
                isDark 
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700" 
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              )}>
                查看配置选项
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            className={cn(
              "rounded-16 overflow-hidden shadow-lg border",
              isDark 
                ? "border-gray-700 shadow-gray-900/30" 
                : "border-gray-100 shadow-gray-100/50"
            )}
            style={{ height: '400px' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <ChartDisplay 
              type="candlestick" 
              data={candlestickChartData} 
              width={600} 
              height={400} 
              isDark={isDark}
            />
          </motion.div>
        </div>
      </motion.div>
      
      {/* 特性区域 */}
      <motion.div 
        className="mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">主要特性</h2>
        
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6")}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={cn(
                "p-6 rounded-16 border transition-all duration-300",
                isDark 
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-750" 
                  : "bg-white border-gray-100 shadow-sm hover:shadow-md"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                isDark 
                  ? "bg-blue-900/30 text-blue-400" 
                  : "bg-blue-100 text-blue-600"
              )}>
                <i className={`fa ${feature.icon || "fa-star"} text-xl`}></i>
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* 快速开始区域 */}
      <motion.div 
        className={cn(
          "rounded-16 p-8 mb-12",
          isDark 
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700" 
            : "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <h2 className="text-2xl font-bold mb-4">快速开始</h2>
        <p className={cn("mb-6", isDark ? "text-gray-300" : "text-gray-700")}>
          只需几行代码，即可在您的项目中集成TradingView Lightweight Charts。
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold mb-3">安装</h3>
            <div className={cn("p-4 rounded-lg mb-4", isDark ? "bg-gray-900" : "bg-white")}>
              <code className="text-sm">npm install lightweight-charts</code>
            </div>
            
            <h3 className="font-bold mb-3">基本用法</h3>
            <div className={cn("p-4 rounded-lg", isDark ? "bg-gray-900" : "bg-white")}>
              <pre className="text-xs overflow-x-auto">
                <code>{`import { createChart } from 'lightweight-charts';

// 获取容器
const container = document.getElementById('chart');

// 创建图表
const chart = createChart(container, {
  width: 600,
  height: 400,
});

// 添加系列
const lineSeries = chart.addLineSeries();

// 设置数据
lineSeries.setData([
  { time: '2023-01-01', value: 50 },
  { time: '2023-01-02', value: 55 },
  { time: '2023-01-03', value: 52 },
  // 更多数据...
]);`}</code>
              </pre>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-3">学习路径</h3>
            <div className="space-y-4">
              <Link 
                to="/chart-types" 
                className={cn(
                  "flex items-center p-4 rounded-lg transition-all duration-200",
                  isDark 
                    ? "bg-gray-900 hover:bg-gray-800" 
                    : "bg-white hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0",
                  isDark 
                    ? "bg-blue-900/30 text-blue-400" 
                    : "bg-blue-100 text-blue-600"
                )}>
                  <i className="fa fa-chart-line"></i>
                </div>
                <div>
                  <h4 className="font-medium">探索图表类型</h4>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    了解所有支持的图表类型及其适用场景
                  </p>
                </div>
              </Link>
              
              <Link to="/configuration" className={cn(
                "flex items-center p-4 rounded-lg transition-all duration-200",
                isDark 
                  ? "bg-gray-900 hover:bg-gray-800" 
                  : "bg-white hover:bg-gray-50"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0",
                  isDark 
                    ? "bg-blue-900/30 text-blue-400" 
                    : "bg-blue-100 text-blue-600"
                )}>
                  <i className="fa fa-cog"></i>
                </div>
                <div>
                  <h4 className="font-medium">配置图表外观</h4>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    学习如何自定义图表的各个方面
                  </p>
                </div>
              </Link>
              
              <Link to="/events" className={cn(
                "flex items-center p-4 rounded-lg transition-all duration-200",
                isDark 
                  ? "bg-gray-900 hover:bg-gray-800" 
                  : "bg-white hover:bg-gray-50"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0",
                  isDark 
                    ? "bg-blue-900/30 text-blue-400" 
                    : "bg-blue-100 text-blue-600"
                )}>
                  <i className="fa fa-plug"></i>
                </div>
                <div>
                  <h4 className="font-medium">处理事件与交互</h4>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    实现交互式功能，响应用户操作
                  </p>
                </div>
              </Link>
              
              <Link to="/advanced-features" className={cn(
                "flex items-center p-4 rounded-lg transition-all duration-200",
                isDark 
                  ? "bg-gray-900 hover:bg-gray-800" 
                  : "bg-white hover:bg-gray-50"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0",
                  isDark 
                    ? "bg-blue-900/30 text-blue-400" 
                    : "bg-blue-100 text-blue-600"
                )}>
                  <i className="fa fa-star"></i>
                </div>
                <div>
                  <h4 className="font-medium">探索高级功能</h4>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    学习标记、价格线、导出等高级功能
                  </p>
                </div>
              </Link>
              
              <Link to="/data-handling" className={cn(
                "flex items-center p-4 rounded-lg transition-all duration-200",
                isDark 
                  ? "bg-gray-900 hover:bg-gray-800" 
                  : "bg-white hover:bg-gray-50"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0",
                  isDark 
                    ? "bg-blue-900/30 text-blue-400" 
                    : "bg-blue-100 text-blue-600"
                )}>
                  <i className="fa fa-database"></i>
                </div>
                <div>
                  <h4 className="font-medium">数据处理</h4>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    学习数据加载、更新和转换的最佳实践
                  </p>
                </div>
              </Link>
              
              <Link to="/price-formatters" className={cn(
                "flex items-center p-4 rounded-lg transition-all duration-200",
                isDark 
                  ? "bg-gray-900 hover:bg-gray-800" 
                  : "bg-white hover:bg-gray-50"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0",
                  isDark 
                    ? "bg-blue-900/30 text-blue-400" 
                    : "bg-blue-100 text-blue-600"
                )}>
                  <i className="fa fa-dollar-sign"></i>
                </div>
                <div>
                  <h4 className="font-medium">价格格式化</h4>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    学习货币、百分比等不同格式的显示方法
                  </p>
                </div>
              </Link>
              
              <Link to="/technical-indicators" className={cn(
                "flex items-center p-4 rounded-lg transition-all duration-200",
                isDark 
                  ? "bg-gray-900 hover:bg-gray-800" 
                  : "bg-white hover:bg-gray-50"
              )}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0",
                  isDark 
                    ? "bg-blue-900/30 text-blue-400" 
                    : "bg-blue-100 text-blue-600"
                )}>
                  <i className="fa fa-chart-bar"></i>
                </div>
                <div>
                  <h4 className="font-medium">技术指标</h4>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    实现移动平均线、RSI、MACD等分析工具
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* 应用场景 */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center">应用场景</h2>
        
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6")}>
          <div className={cn(
            "p-6 rounded-16 border h-full",
            isDark 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-100 shadow-sm"
          )}>
            <h3 className="font-bold mb-3">金融市场分析</h3>
            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
              创建专业的股票、加密货币和期货图表，提供实时市场数据可视化和技术分析工具。
            </p>
          </div>
          
          <div className={cn(
            "p-6 rounded-16 border h-full",
            isDark 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-100 shadow-sm"
          )}>
            <h3 className="font-bold mb-3">数据监控仪表盘</h3>
            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
              构建实时数据监控仪表盘，跟踪关键业务指标、系统性能和用户行为数据。
            </p>
          </div>
          
          <div className={cn(
            "p-6 rounded-16 border h-full",
            isDark 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-100 shadow-sm"
          )}>
            <h3 className="font-bold mb-3">科学与研究可视化</h3>
            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
              可视化科学实验数据、研究结果和统计信息，帮助研究人员快速发现趋势和模式。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;