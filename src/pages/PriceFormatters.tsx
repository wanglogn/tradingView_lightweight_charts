import { useState, useEffect, useRef } from "react";
import CodeExample from "@/components/CodeExample";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createChart, IChartApi, ISeriesApi, LineStyle, Time } from "lightweight-charts";
import { lineChartData } from "@/data/mockData";

const PriceFormattersPage = () => {
  // 使用useTheme hook获取主题状态
  const { isDark } = useTheme();
  
  const [selectedFormatter, setSelectedFormatter] = useState<
    "currency" | "percentage" | "volume" | "custom" | "precision"
  >("currency");
  
  // 监听全局主题变化事件
  useEffect(() => {
    const handleThemeChange = () => {
      // 强制重新渲染以应用新主题
      setSelectedFormatter(prev => prev);
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
  // 中文格式化器类型名称映射
  const formatterTypeLabels: Record<string, string> = {
    currency: "货币格式",
    percentage: "百分比格式",
    volume: "交易量格式",
    custom: "自定义格式",
    precision: "精度控制"
  };
  
  // 格式化器详细说明
  const formatterDescriptions = {
    currency: "货币格式化器允许将数值显示为特定货币格式，包括添加货币符号、千位分隔符等。这对于金融数据可视化尤为重要。",
    percentage: "百分比格式化器将数值显示为百分比形式，自动添加百分号并控制小数位数。适用于显示增长率、变化率等数据。",
    volume: "交易量格式化器优化了大数值的显示，使用K、M、B等缩写表示千、百万、十亿等单位，使图表更易读。",
    custom: "自定义格式化器提供了完全的灵活性，可以根据特定需求定制数值的显示格式，通过提供格式化函数实现。",
    precision: "精度控制允许调整数值的小数位数和最小变动单位，确保数值显示的一致性和准确性。"
  };
  
  // 代码示例（中文注释）
  const formatterCodeExamples = {
    currency: `// 货币格式化器配置
const currencyFormat = {
  type: 'price',
  formatter: (price) => {
    // 格式化货币格式，添加货币符号和千位分隔符
    return '¥' + price.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },
  precision: 2,
  minMove: 0.01,
};

// 应用到系列
const series = chart.addLineSeries({
  priceFormat: currencyFormat,
  color: '#2962FF',
});`,
    
    percentage: `// 百分比格式化器配置
const percentageFormat = {
  type: 'percent',
  formatter: (price) => {
    // 格式化百分比格式，添加百分号
    return (price * 100).toFixed(2) + '%';
  },
  precision: 4, // 需要更高精度来准确表示百分比
  minMove: 0.0001,
};

// 应用到系列
const series = chart.addLineSeries({
  priceFormat: percentageFormat,
  color: '#FF6B35',
});`,
    
    volume: `// 交易量格式化器配置
const volumeFormat = {
  type: 'volume',
  formatter: (volume) => {
    // 自定义交易量格式，使用K、M、B等单位缩写
    if (volume >= 1000000000) {
      return (volume / 1000000000).toFixed(1) + 'B';
    } else if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
  },
};

// 应用到系列
const volumeSeries = chart.addHistogramSeries({
  priceFormat: volumeFormat,
  color: '#06D6A0',
  scaleMargins: {
    top: 0.8,
    bottom: 0,
  },
});`,
    
    custom: `// 自定义格式化器配置
const customFormat = {
  type: 'custom',
  formatter: (value) => {
    // 完全自定义的格式化函数
    // 例如：根据值的大小使用不同的颜色或格式
    if (value > 100) {
      return '高: ' + value.toFixed(0);
    } else if (value < 50) {
      return '低: ' + value.toFixed(2);
    }
    return '中: ' + value.toFixed(1);
  },
  precision: 2,
  minMove: 0.01,
};

// 应用到系列
const series = chart.addLineSeries({
  priceFormat: customFormat,
  color: '#8B5CF6',
});`,
    
    precision: `// 精度控制配置
const precisionFormat = {
  type: 'price',
  // 精度：小数点后的位数
  precision: 4,
  // 最小变动单位：价格的最小变化量
  minMove: 0.0001,
};

// 应用到系列
const series = chart.addLineSeries({
  priceFormat: precisionFormat,
  color: '#EC4899',
});

// 对于加密货币等需要更高精度的场景
const cryptoFormat = {
  type: 'price',
  precision: 8,  // 支持8位小数
  minMove: 0.00000001, // 最小变动单位为0.00000001
};`
  };
  
  // 使用场景
  const formatterUseCases = {
    currency: [
      "显示股票、期货等金融资产价格",
      "电子商务产品价格展示",
      "财务报表数据可视化",
      "货币汇率显示"
    ],
    percentage: [
      "显示价格涨跌幅",
      "展示投资回报率",
      "市场份额可视化",
      "变化率指标展示"
    ],
    volume: [
      "股票、加密货币交易量显示",
      "产品销量可视化",
      "网站访问量统计",
      "大数值数据优化显示"
    ],
    custom: [
      "根据数值范围显示不同标签",
      "结合单位和描述文本",
      "创建特殊行业的数值表示",
      "实现条件格式化逻辑"
    ],
    precision: [
      "加密货币等高精度资产价格",
      "需要精确小数的科学数据",
      "微小价格变动的展示",
      "固定小数位数的财务数据"
    ]
  };
  
  // 初始化图表和所选格式化器
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // 清理之前的图表
    if (chartRef.current) {
      chartRef.current.remove();
    }
    
    // 创建新图表
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        textColor: isDark ? '#d1d4dc' : '#191919',
      },
      grid: {
        vertLines: {
          color: isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
        },
        horzLines: {
          color: isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)',
      },
      timeScale: {
        borderColor: isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)',
      },
    });
    
    // 根据选择的格式化器类型配置图表
    if (chartRef.current) {
      let series;
      
      switch (selectedFormatter) {
        case 'currency':
          // 货币格式
          series = chartRef.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            priceFormat: {
              type: 'price',
              formatter: (price) => {
                return '¥' + price.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
              },
              precision: 2,
              minMove: 0.01,
            },
          });
          break;
          
        case 'percentage':
          // 百分比格式
          // 生成适合百分比显示的数据（小范围变化）
          const percentData = lineChartData.map(item => ({
            time: item.time,
            value: (item.value / 100) - 0.5 // 转换为-0.5到0.5范围的值
          }));
          
          series = chartRef.current.addLineSeries({
            color: '#FF6B35',
            lineWidth: 2,
            priceFormat: {
              type: 'percent',
              formatter: (price) => {
                return (price * 100).toFixed(2) + '%';
              },
              precision: 4,
              minMove: 0.0001,
            },
          });
          series.setData(percentData);
          break;
          
        case 'volume':
          // 交易量格式
          // 生成适合交易量显示的数据（较大数值）
          const volumeData = lineChartData.map(item => ({
            time: item.time,
            value: item.value * 1000 // 放大数值以模拟交易量
          }));
          
          series = chartRef.current.addHistogramSeries({
            color: '#06D6A0',
            lineWidth: 1,
            priceFormat: {
              type: 'volume',
              formatter: (volume) => {
                if (volume >= 1000000) {
                  return (volume / 1000000).toFixed(1) + 'M';
                } else if (volume >= 1000) {
                  return (volume / 1000).toFixed(1) + 'K';
                }
                return volume.toString();
              },
            },
            scaleMargins: {
              top: 0.8,
              bottom: 0,
            },
          });
          series.setData(volumeData);
          break;
          
        case 'custom':
          // 自定义格式
          series = chartRef.current.addLineSeries({
            color: '#8B5CF6',
            lineWidth: 2,
            priceFormat: {
              type: 'custom',
              formatter: (value) => {
                if (value > 100) {
                  return '高: ' + value.toFixed(0);
                } else if (value < 50) {
                  return '低: ' + value.toFixed(2);
                }
                return '中: ' + value.toFixed(1);
              },
              precision: 2,
              minMove: 0.01,
            },
          });
          break;
          
        case 'precision':
          // 精度控制
          // 生成适合高精度显示的数据（小数值）
          const precisionData = lineChartData.map(item => ({
            time: item.time,
            value: (item.value / 1000) // 缩小数值以展示高精度
          }));
          
          series = chartRef.current.addLineSeries({
            color: '#EC4899',
            lineWidth: 2,
            priceFormat: {
              type: 'price',
              precision: 6,  // 6位小数精度
              minMove: 0.000001, // 最小变动单位
            },
          });
          series.setData(precisionData);
          break;
      }
      
      // 如果没有特别设置数据（对于currency、custom等），使用默认数据
      if (selectedFormatter === 'currency' || selectedFormatter === 'custom') {
        series.setData(lineChartData);
      }
      
      // 调整视图以适应内容
      chartRef.current.timeScale().fitContent();
    }
    
    // 处理窗口大小调整
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: 400
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [selectedFormatter, isDark]);
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };
  
  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900")}>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-4">价格格式化</h1>
        <p className={cn("text-lg", isDark ? "text-gray-300" : "text-gray-600")}>
          学习如何在TradingView Lightweight Charts中自定义价格的显示格式，包括货币、百分比、交易量等不同类型的数值格式化方法。
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* 格式化器类型选择 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['currency', 'percentage', 'volume', 'custom', 'precision'] as const).map((formatter) => (
              <button
                key={formatter}
                onClick={() => setSelectedFormatter(formatter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedFormatter === formatter
                    ? isDark 
                      ? "bg-blue-900/40 text-blue-400 border border-blue-700" 
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                    : isDark 
                      ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-750" 
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                )}
              >
                {formatterTypeLabels[formatter]}
              </button>
            ))}
          </div>
          
          {/* 图表显示 */}
          <div 
            className={cn(
              "rounded-16 overflow-hidden shadow-lg border",
              isDark 
                ? "border-gray-700 shadow-gray-900/30" 
                : "border-gray-100 shadow-gray-100/50"
            )}
            style={{ height: '400px' }}
          >
            <div ref={chartContainerRef} className="w-full h-full chart-container"></div>
          </div>
        </div>
        
        <div>
          {/* 格式化器说明和代码示例 */}
          <div 
            className={cn(
              "rounded-16 p-6 h-full flex flex-col",
              isDark 
                ? "bg-gray-800 border border-gray-700" 
                : "bg-white border border-gray-100 shadow-sm"
            )}
          >
            <h2 className="text-xl font-bold mb-3">{formatterTypeLabels[selectedFormatter]}</h2>
            <p className={cn("mb-6 flex-grow", isDark ? "text-gray-300" : "text-gray-600")}>
              {formatterDescriptions[selectedFormatter]}
            </p>
            <CodeExample 
              code={formatterCodeExamples[selectedFormatter]} 
              language="typescript" 
              isDark={isDark}
            />
          </div>
        </div>
      </div>
      
      {/* 使用场景 */}
      <motion.div 
        className={cn(
          "mt-8 rounded-16 p-6",
          isDark 
            ? "bg-gray-800 border border-gray-700" 
            : "bg-white border border-gray-100 shadow-sm"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-4">常见使用场景</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formatterUseCases[selectedFormatter].map((useCase, index) => (
            <div key={index} className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
              <div className="flex items-start">
                <i className="fa fa-check-circle text-green-500 mt-1 mr-2"></i>
                <p className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                  {useCase}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* 实现提示 */}
      <motion.div 
        className={cn(
          "mt-8 rounded-16 p-6",
          isDark 
            ? "bg-gray-800 border border-gray-700" 
            : "bg-white border border-gray-100 shadow-sm"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-4">格式化器最佳实践</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5",
              isDark 
                ? "bg-blue-900/30 text-blue-400" 
                : "bg-blue-100 text-blue-600"
            )}>
              <i className="fa fa-lightbulb-o text-sm"></i>
            </div>
            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
              选择适合数据类型的格式化器，保持一致性，避免在同一图表中混用不同类型的格式化器。
            </p>
          </div>
          
          <div className="flex items-start">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5",
              isDark 
                ? "bg-blue-900/30 text-blue-400" 
                : "bg-blue-100 text-blue-600"
            )}>
              <i className="fa fa-lightbulb-o text-sm"></i>
            </div>
            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
              对于大范围数值，使用K、M、B等缩写可以提高可读性，避免数值过长导致显示问题。
            </p>
          </div>
          
          <div className="flex items-start">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5",
              isDark 
                ? "bg-blue-900/30 text-blue-400" 
                : "bg-blue-100 text-blue-600"
            )}>
              <i className="fa fa-lightbulb-o text-sm"></i>
            </div>
            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
              注意精度设置和最小变动单位的关系，确保价格格式化正确反映数据的精度需求。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PriceFormattersPage;