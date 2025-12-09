import { useState, useEffect, useRef, useContext } from "react";
import CodeExample from "@/components/CodeExample";
import { lineChartData, candlestickChartData } from "@/data/mockData";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createChart, IChartApi, ISeriesApi, LineStyle, CrosshairMode, Time, ColorType } from "lightweight-charts";
import { ThemeContext } from "@/contexts/themeContext";

const AdvancedFeaturesPage = () => {
  // 使用useTheme hook获取主题状态
  const { isDark } = useTheme();
  
  // 监听全局主题变化事件
  useEffect(() => {
    const handleThemeChange = () => {
      // 强制重新渲染以应用新主题
      setSelectedFeature(prev => prev);
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  
  const [selectedFeature, setSelectedFeature] = useState<
    "markers" | "price-line" | "timezone" | "custom-formatters" | "exporting" | "range-selector"
  >("markers");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
  // 中文功能类型名称映射
  const featureTypeLabels: Record<string, string> = {
    markers: "标记功能",
    "price-line": "价格线",
    timezone: "时区处理",
    "custom-formatters": "自定义格式化器",
    exporting: "图表导出",
    "range-selector": "范围选择器"
  };
  
  // 功能详细说明
  const featureDescriptions = {
    markers: "标记功能允许在图表上添加各种自定义标记，用于突出显示重要的数据点或事件。可以添加点标记、价格线标记和时间范围标记等。",
    "price-line": "价格线是一条水平或垂直的线，用于标记特定的价格或时间点。价格线在技术分析中特别有用，可以用来标记支撑位、阻力位等关键价格水平。",
    timezone: "时区处理功能允许正确处理不同时区的日期和时间数据，确保图表显示的时间信息与用户的本地时间或指定时区一致。",
    "custom-formatters": "自定义格式化器允许完全控制图表上显示的文本格式，包括价格、时间和其他标签的格式化，使图表更符合特定的显示需求。",
    exporting: "图表导出功能允许将当前图表导出为图片，方便用户保存、分享或嵌入到其他文档中。",
    "range-selector": "范围选择器是一个UI组件，允许用户快速选择预定义的时间范围，如1天、1周、1个月等，提高用户在大量数据中的导航效率。"
  };
  
  // 代码示例（中文注释）
  const featureCodeExamples = {
    markers: `// 添加标记到图表
// 首先需要获取系列引用
const series = chart.addLineSeries();

// 点标记 - 在特定的数据点上添加标记
series.setData([
  { time: '2023-01-01', value: 50 },
  { time: '2023-01-02', value: 55, marker: { color: 'green', shape: 'arrowUp' } },
  { time: '2023-01-03', value: 52, marker: { color: 'red', shape: 'arrowDown' } },
]);

// 价格线标记 - 在特定价格水平添加线标记
const priceLine = series.createPriceLine({
  price: 53,
  color: 'blue',
  lineWidth: 2,
  lineStyle: LineStyle.Dashed,
  axisLabelVisible: true,
  title: '支撑位',
});

// 要移除价格线标记
// priceLine.remove();`,
    
    "price-line": `// 创建价格线
const series = chart.addLineSeries();

// 基本价格线
const priceLine1 = series.createPriceLine({
  price: 55,
  color: 'red',
  lineWidth: 2,
  lineStyle: LineStyle.Solid,
  axisLabelVisible: true,
  title: '阻力位',
});

// 带填充区域的价格线
const priceLine2 = series.createPriceLine({
  price: 45,
  color: 'green',
  lineWidth: 1,
  lineStyle: LineStyle.Dashed,
  axisLabelVisible: true,
  title: '支撑位',
  crosshairMarkerVisible: true,
});

// 更新价格线
priceLine1.applyOptions({
  price: 56,
  color: 'orange',
});`,
    
    timezone: `// 配置时区
// 注意：lightweight-charts 本身不处理时区转换，需要在提供数据前处理

// 1. 使用 UTC 时间
const convertToUTC = (dateString: string) => {
  const date = new Date(dateString);
  return Math.floor(date.getTime() / 1000);
};

// 2. 自定义时间格式化器来显示特定时区的时间
chart.applyOptions({
  timeScale: {
    tickMarkFormatter: (time, tickMarkType, locale) => {
      const date = new Date(time * 1000);
      // 这里可以使用第三方库如 date-fns-tz 处理时区
      // 简单示例：调整为东八区（北京时间）
      const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
      return beijingTime.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    }
  }
});`,
    
    "custom-formatters": `// 自定义格式化器
// 1. 价格格式化器
const series = chart.addLineSeries({
  priceFormat: {
    type: 'custom',
    formatter: (price) => {
      // 格式化为货币格式
      return '¥' + price.toFixed(2);
    },
    precision: 2,
    minMove: 0.01,
  }
});

// 2. 时间格式化器
chart.applyOptions({
  timeScale: {
    tickMarkFormatter: (time, tickMarkType, locale) => {
      const date = new Date(time * 1000);
      // 自定义日期格式
      return date.toLocaleDateString('zh-CN', {
        year: tickMarkType === 'year' ? 'numeric' : undefined,
        month: 'short',
        day: 'numeric'
      });
    }
  }
});

// 3. 坐标轴标签格式化器
chart.applyOptions({
  rightPriceScale: {
    labelFormatter: (value) => {
      // 自定义价格标签格式
      return value >= 1000 
        ? (value / 1000).toFixed(1) + 'k' 
        : value.toFixed(1);
    }
  }
});`,
    
    exporting: `// 图表导出功能
// 1. 导出为 PNG
const exportToPNG = () => {
  if (chart) {
    const dataUrl = chart.takeScreenshot();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'chart.png';
    link.click();
  }
};

// 2. 导出为 SVG
const exportToSVG = async () => {
  if (chart) {
    try {
      const svgData = await chart.exportToSVG();
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chart.svg';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出SVG失败:', error);
    }
  }
};

// 3. 自定义导出尺寸
const exportWithCustomSize = () => {
  if (chart) {
    const dataUrl = chart.takeScreenshot(1200, 800); // 宽度，高度
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'chart_large.png';
    link.click();
  }
};`,
    
    "range-selector": `// 范围选择器实现
// 1. 创建范围选择按钮
const createRangeSelector = () => {
  const ranges = [
    { label: '1天', days: 1 },
    { label: '1周', days: 7 },
    { label: '1个月', days: 30 },
    { label: '3个月', days: 90 },
    { label: '1年', days: 365 },
    { label: '全部', days: null },
  ];
  
  const container = document.createElement('div');
  container.className = 'range-selector';
  
  ranges.forEach(range => {
    const button = document.createElement('button');
    button.textContent = range.label;
    button.addEventListener('click', () => {
      applyRange(range.days);
    });
    container.appendChild(button);
  });
  
  return container;
};

// 2. 应用选择的范围
const applyRange = (days: number | null) => {
  if (!chart) return;
  
  if (days === null) {
    // 显示全部数据
    chart.timeScale().fitContent();
    return;
  }
  
  // 获取当前数据范围
  const visibleRange = chart.timeScale().getVisibleRange();
  if (!visibleRange) return;
  
  // 计算新的结束时间（当前结束时间）和开始时间
  const endDate = new Date(visibleRange.to * 1000);
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  // 应用新的范围
  chart.timeScale().setVisibleRange({
    from: Math.floor(startDate.getTime() / 1000),
    to: Math.floor(endDate.getTime() / 1000)
  });
};`
  };
  
  // 使用场景
  const featureUseCases = {
    markers: [
      "标记重要的经济事件或公司公告",
      "突出显示技术分析中的关键点位",
      "标记交易执行点",
      "显示价格目标或止损位"
    ],
    "price-line": [
      "标记支撑位和阻力位",
      "显示移动平均线或其他技术指标的值",
      "标记价格目标或止损位",
      "突出显示重要的价格水平"
    ],
    timezone: [
      "确保全球用户看到正确的本地时间",
      "处理跨时区的交易数据",
      "显示不同市场的开盘和收盘时间",
      "支持跨国公司的数据分析需求"
    ],
    "custom-formatters": [
      "显示不同货币或单位的价格",
      "使用特定的日期和时间格式",
      "创建更简洁或更详细的数据显示",
      "满足特定行业或地区的显示需求"
    ],
    exporting: [
      "保存图表分析结果",
      "将图表嵌入到报告或演示文稿中",
      "分享图表分析给同事或客户",
      "创建图表的历史记录或存档"
    ],
    "range-selector": [
      "快速导航到不同的时间范围",
      "比较不同时间周期的价格走势",
      "分析短期和长期市场趋势",
      "提高用户在大量数据中的浏览效率"
    ]
  };
  
  // 初始化图表和所选功能
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
    
    // 根据选择的功能类型配置图表
    if (chartRef.current) {
      // 添加基础系列
      const series = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });
      
      // 设置数据
      series.setData(lineChartData);
      
      // 根据选择的功能进行不同的配置
      switch (selectedFeature) {
        case 'markers':
          // 添加带标记的数据
          series.setData(lineChartData.map((item, index) => {
            // 在一些特定点添加标记
            if (index % 10 === 0) {
              return {
                ...item,
                marker: {
                  color: item.value > lineChartData[index > 0 ? index - 1 : 0].value 
                    ? 'green' 
                    : 'red',
                  shape: item.value > lineChartData[index > 0 ? index - 1 : 0].value 
                    ? 'arrowUp' 
                    : 'arrowDown'
                }
              };
            }
            return item;
          }));
          
          // 添加价格线标记
          const middleValue = (Math.max(...lineChartData.map(d => d.value)) + Math.min(...lineChartData.map(d => d.value))) / 2;
          series.createPriceLine({
            price: middleValue,
            color: 'blue',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: '中间价',
          });
          break;
          
        case 'price-line':
          // 添加多个价格线
          const maxValue = Math.max(...lineChartData.map(d => d.value));
          const minValue = Math.min(...lineChartData.map(d => d.value));
          
          // 阻力位价格线
          series.createPriceLine({
            price: maxValue * 0.95,
            color: 'red',
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            axisLabelVisible: true,
            title: '阻力位',
          });
          
          // 支撑位价格线
          series.createPriceLine({
            price: minValue * 1.05,
            color: 'green',
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            axisLabelVisible: true,
            title: '支撑位',
          });
          
          // 移动平均线价格线
          const avgValue = lineChartData.reduce((sum, item) => sum + item.value, 0) / lineChartData.length;
          series.createPriceLine({
            price: avgValue,
            color: 'purple',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: '平均值',
          });
          break;
          
        case 'timezone':
          // 配置时区相关功能
          chartRef.current.applyOptions({
            timeScale: {
              tickMarkFormatter: (time, tickMarkType, locale) => {
                const date = new Date(time * 1000);
                // 简单模拟北京时间（UTC+8）
                const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
                return beijingTime.toLocaleDateString('zh-CN', {
                  year: tickMarkType === 'year' ? 'numeric' : undefined,
                  month: 'short',
                  day: 'numeric'
                });
              }
            }
          });
          break;
          
        case 'custom-formatters':
          // 配置自定义格式化器
          chartRef.current.applyOptions({
            rightPriceScale: {
              labelFormatter: (value) => {
                // 自定义价格标签格式，添加货币符号
                return '¥' + value.toFixed(2);
              }
            },
            timeScale: {
              tickMarkFormatter: (time, tickMarkType, locale) => {
                const date = new Date(time * 1000);
                // 自定义日期格式
                return date.toLocaleDateString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit'
                });
              }
            }
          });
          break;
          
        case 'exporting':
          // 导出功能通过按钮实现，这里只是展示基础图表
          break;
          
        case 'range-selector':
          // 范围选择器功能通过按钮实现，这里只是展示基础图表
          break;
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
  }, [selectedFeature, isDark]);
  
  // 导出图表的方法
  const handleExport = async (format: 'png' | 'svg') => {
    if (!chartRef.current) return;
    
    if (format === 'png') {
      const dataUrl = chartRef.current.takeScreenshot();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `chart-${Date.now()}.png`;
      link.click();
    } else if (format === 'svg') {
      try {
        const svgData = await chartRef.current.exportToSVG();
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chart-${Date.now()}.svg`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('导出SVG失败:', error);
      }
    }
  };
  
  // 范围选择处理
  const handleRangeSelect = (days: number | null) => {
    if (!chartRef.current) return;
    
    if (days === null) {
      // 显示全部数据
      chartRef.current.timeScale().fitContent();
      return;
    }
    
    // 获取当前数据范围
    const visibleRange = chartRef.current.timeScale().getVisibleRange();
    if (!visibleRange) return;
    
    // 计算新的结束时间（当前结束时间）和开始时间
    const endDate = new Date(visibleRange.to * 1000);
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    // 应用新的范围
    chartRef.current.timeScale().setVisibleRange({
      from: Math.floor(startDate.getTime() / 1000),
      to: Math.floor(endDate.getTime() / 1000)
    });
  };
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };
  
  return (
    <div>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-4">高级功能</h1>
        <p className={cn("text-lg", isDark ? "text-gray-300" : "text-gray-600")}>
          探索TradingView Lightweight Charts提供的高级功能，提升图表的交互性和可视化效果。本页面展示了一些进阶功能的实现方法。
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* 功能类型选择 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['markers', 'price-line', 'timezone', 'custom-formatters', 'exporting', 'range-selector'] as const).map((feature) => (
              <button
                key={feature}
                onClick={() => setSelectedFeature(feature)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedFeature === feature
                    ? isDark 
                      ? "bg-blue-900/40 text-blue-400 border border-blue-700" 
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                    : isDark 
                      ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-750" 
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                )}
              >
                {featureTypeLabels[feature]}
              </button>
            ))}
          </div>
          
          {/* 功能交互控制区 - 仅在某些功能下显示 */}
          {(selectedFeature === 'exporting' || selectedFeature === 'range-selector') && (
            <div 
              className={cn(
                "p-4 rounded-12 mb-4",
                isDark 
                  ? "bg-gray-800 border border-gray-700" 
                  : "bg-white border border-gray-100 shadow-sm"
              )}
            >
              {selectedFeature === 'exporting' && (
                <div className="flex flex-wrap gap-3">
                  <h3 className="font-medium w-full mb-2">导出图表:</h3>
                  <button 
                    onClick={() => handleExport('png')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isDark 
                        ? "bg-gray-750 text-gray-300 hover:bg-gray-700" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <i className="fa fa-download mr-1"></i> 导出为 PNG
                  </button>
                  <button 
                    onClick={() => handleExport('svg')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isDark 
                        ? "bg-gray-750 text-gray-300 hover:bg-gray-700" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <i className="fa fa-download mr-1"></i> 导出为 SVG
                  </button>
                </div>
              )}
              
              {selectedFeature === 'range-selector' && (
                <div className="flex flex-wrap gap-3">
                  <h3 className="font-medium w-full mb-2">选择时间范围:</h3>
                  <button 
                    onClick={() => handleRangeSelect(1)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isDark 
                        ? "bg-gray-750 text-gray-300 hover:bg-gray-700" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    1天
                  </button>
                  <button 
                    onClick={() => handleRangeSelect(7)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isDark 
                        ? "bg-gray-750 text-gray-300 hover:bg-gray-700" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    1周
                  </button>
                  <button 
                    onClick={() => handleRangeSelect(30)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isDark 
                        ? "bg-gray-750 text-gray-300 hover:bg-gray-700" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    1个月
                  </button>
                  <button 
                    onClick={() => handleRangeSelect(null)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isDark 
                        ? "bg-gray-750 text-gray-300 hover:bg-gray-700" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    显示全部
                  </button>
                </div>
              )}
            </div>
          )}
          
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
          {/* 功能说明和代码示例 */}
          <div 
            className={cn(
              "rounded-16 p-6 h-full flex flex-col",
              isDark 
                ? "bg-gray-800 border border-gray-700" 
                : "bg-white border border-gray-100 shadow-sm"
            )}
          >
            <h2 className="text-xl font-bold mb-3">{featureTypeLabels[selectedFeature]}</h2>
            <p className={cn("mb-6 flex-grow", isDark ? "text-gray-300" : "text-gray-600")}>
              {featureDescriptions[selectedFeature]}
            </p>
            <CodeExample 
              code={featureCodeExamples[selectedFeature]} 
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
          {featureUseCases[selectedFeature].map((useCase, index) => (
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
        <h2 className="text-xl font-bold mb-4">实现提示</h2>
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
              所有高级功能都应该在图表初始化后添加，确保在调用相关API前图表实例已经创建完成。
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
              对于价格线和标记等动态元素，记得在组件卸载时调用remove方法移除它们，以防止内存泄漏。
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
              导出功能可能会受到浏览器安全策略的限制，特别是在处理SVG导出时，确保在用户交互事件（如点击按钮）中触发导出。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedFeaturesPage;