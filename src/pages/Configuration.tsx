import { useState, useEffect, useRef } from "react";
import CodeExample from "@/components/CodeExample";
import { lineChartData } from "@/data/mockData";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createChart, IChartApi, LineStyle, CrosshairMode } from "lightweight-charts";

const ConfigurationPage = () => {
  // 使用useTheme hook获取主题状态
  const { isDark } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
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
  
  // 配置选项状态 - 基础配置
  const [lineWidth, setLineWidth] = useState(2);
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [showGrid, setShowGrid] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  
  // 配置选项状态 - 坐标轴
  const [timeScaleVisible, setTimeScaleVisible] = useState(true);
  const [rightPriceScaleVisible, setRightPriceScaleVisible] = useState(true);
  const [leftPriceScaleVisible, setLeftPriceScaleVisible] = useState(false);
  
  // 配置选项状态 - 高级配置
  const [showBorders, setShowBorders] = useState(true);
  const [crosshairMarkerVisible, setCrosshairMarkerVisible] = useState(false);
  const [showPriceAxisCrosshair, setShowPriceAxisCrosshair] = useState(false);
  
  // 将lineStyle字符串转换为lightweight-charts的LineStyle枚举值
  const getLineStyleEnum = (style: string): LineStyle => {
    switch (style) {
      case 'dashed':
        return LineStyle.Dashed;
      case 'dotted':
        return LineStyle.Dotted;
      default:
        return LineStyle.Solid;
    }
  };
  
  // 配置代码示例（基于TradingView官网配置）
  const configCodeExample = `import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts';

// 创建带配置选项的图表实例
const chart = createChart(container, {
  // 基本设置
  width: 800,
  height: 400,
  
  // 布局配置
  layout: {
    backgroundColor: '${isDark ? '#1e1e1e' : '#ffffff'}', // 图表背景色
    textColor: '${isDark ? '#d1d4dc' : '#191919'}', // 文本颜色
    fontSize: 12, // 字体大小
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', // 字体
  },
  
  // 网格配置
  grid: {
    vertLines: {
      color: '${isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)'}', // 垂直线颜色
      visible: ${showGrid}, // 是否显示垂直线
      style: ${lineStyle === 'solid' ? 'LineStyle.Solid' : lineStyle === 'dashed' ? 'LineStyle.Dashed' : 'LineStyle.Dotted'}, // 线条样式
    },
    horzLines: {
      color: '${isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)'}', // 水平线颜色
      visible: ${showGrid}, // 是否显示水平线
      style: ${lineStyle === 'solid' ? 'LineStyle.Solid' : lineStyle === 'dashed' ? 'LineStyle.Dashed' : 'LineStyle.Dotted'}, // 线条样式
    },
  },
  
  // 十字光标配置
  crosshair: {
    mode: ${showCrosshair ? 'CrosshairMode.Normal' : 'CrosshairMode.Hidden'}, // 十字光标模式
    vertLine: {
      visible: ${showCrosshair}, // 是否显示垂直十字线
      width: 1, // 线条宽度
      style: LineStyle.Solid, // 线条样式
      color: 'rgba(224, 227, 235, 0.6)', // 线条颜色
      labelVisible: ${showPriceAxisCrosshair}, // 是否显示标签
    },
    horzLine: {
      visible: ${showCrosshair}, // 是否显示水平十字线
      width: 1, // 线条宽度
      style: LineStyle.Solid, // 线条样式
      color: 'rgba(224, 227, 235, 0.6)', // 线条颜色
      labelVisible: ${showPriceAxisCrosshair}, // 是否显示标签
    },
  },
  
  // 时间轴配置
  timeScale: {
    visible: ${timeScaleVisible}, // 是否显示时间轴
    borderColor: '${showBorders ? (isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)') : 'transparent'}', // 边框颜色
    timeVisible: true, // 是否显示时间标签
    secondsVisible: false, // 是否显示秒数
    barSpacing: 6, // 柱之间的间距
    minBarSpacing: 0.5, // 最小柱间距
  },
  
  // 右侧价格轴配置
  rightPriceScale: {
    visible: ${rightPriceScaleVisible}, // 是否显示右侧价格轴
    borderColor: '${showBorders ? (isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)') : 'transparent'}', // 边框颜色
    position: 'right', // 位置
    autoScale: true, // 是否自动缩放
    alignLabels: true, // 是否对齐标签
  },
  
  // 左侧价格轴配置
  leftPriceScale: {
    visible: ${leftPriceScaleVisible}, // 是否显示左侧价格轴
    borderColor: '${showBorders ? (isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)') : 'transparent'}', // 边框颜色
  },
});

// 添加带配置的系列
const series = chart.addLineSeries({
  color: '#2962FF', // 线条颜色
  lineWidth: ${lineWidth}, // 线条宽度
  lineStyle: ${lineStyle === 'solid' ? 'LineStyle.Solid' : lineStyle === 'dashed' ? 'LineStyle.Dashed' : 'LineStyle.Dotted'}, // 线条样式
  lastValueVisible: ${showLegend}, // 是否显示最后一个值的标签
  crosshairMarkerVisible: ${crosshairMarkerVisible}, // 是否显示十字光标标记
  crosshairMarkerRadius: 4, // 十字光标标记半径
  priceFormat: {
    type: 'price', // 价格格式类型
    precision: 2, // 小数精度
    minMove: 0.01, // 最小变动单位
  },
});

// 设置数据
series.setData(chartData);

// 调整视图以适应内容
chart.timeScale().fitContent();`;

  // 配置选项详细说明
  const configDetails = {
    lineWidth: "线条宽度决定了图表中线条的粗细程度。较宽的线条在大屏幕上更醒目，适合强调重要数据；较细的线条适合展示更多细节或多条线同时显示的场景。",
    lineStyle: "线条样式可以改变图表中线条的外观，提供不同的视觉效果。实线适合大多数场景，虚线和点线常用于辅助线或参考线。",
    showGrid: "网格线可以帮助用户更容易地读取图表上的数据点值和时间。在复杂图表或需要精确读取数值的场景下很有用，但在简洁设计中可能需要隐藏。",
    showCrosshair: "十字光标是当鼠标悬停在图表上时显示的交叉线，可以精确指示当前鼠标位置对应的时间和价格值。这对于技术分析和数据点精确读取非常重要。",
    showLegend: "图例显示系列的最后一个值，帮助用户快速了解数据的最新状态。对于实时更新的图表尤其有用。",
    timeScaleVisible: "时间轴显示在图表底部，标明各个数据点对应的时间。几乎所有时间序列图表都需要显示时间轴，除非有其他方式明确指示时间信息。",
    rightPriceScaleVisible: "右侧价格轴是大多数图表的标准配置，显示数据值的刻度。可以根据需要调整其可见性和样式。",
    leftPriceScaleVisible: "左侧价格轴在比较多个具有不同值域的数据集时特别有用，可以为每个系列提供独立的价格刻度。",
    showBorders: "图表边框可以帮助区分图表区域和页面其他内容，提供清晰的视觉边界。在嵌入式或极简设计中可能需要隐藏边框。",
    crosshairMarkerVisible: "十字光标标记在数据点位置显示一个小圆点，帮助用户精确定位数据点。这对于精确分析单个数据点非常有用。",
    showPriceAxisCrosshair: "在坐标轴上显示十字光标对应的数值，帮助用户快速读取当前光标位置对应的精确数值。"
  };
  
  // 配置组说明 - 扩展为包含所有TradingView Lightweight Charts配置项
  const configGroupExplanations = {
    layout: "布局配置控制图表的整体外观，包括背景色和文本颜色。这些设置对于确保图表与您的应用程序设计风格一致非常重要。",
    grid: "网格配置控制图表中水平和垂直线的显示方式。合理的网格设置可以提高图表的可读性，但过多的网格线可能会分散用户注意力。",
    crosshair: "十字光标配置控制当用户与图表交互时的视觉反馈。良好的光标设置可以提高用户体验和数据读取精度。",
    scales: "坐标轴配置控制时间轴和价格轴的显示方式。根据图表用途和用户需求，可以选择显示或隐藏不同的坐标轴。",
    series: "系列配置控制数据的可视化方式，包括线条颜色、宽度、样式等。通过精心配置系列，可以突出重要数据并提高图表的可读性。",
    markers: "标记配置允许在图表上添加各种标记，如点标记、线标记等。这些标记可以用来强调重要数据点或事件。",
    priceFormat: "价格格式配置控制数值的显示格式，包括小数位数、货币符号等。正确的价格格式对于财务数据可视化非常重要。",
    localization: "本地化配置允许设置图表的语言和区域设置，包括日期格式、数字格式等。这对于国际化应用程序非常有用。"
  };
  
  // 所有配置项的详细参考信息
  const allConfigOptions = {
    layout: [
      { name: "backgroundColor", type: "string", default: "#ffffff", desc: "图表的背景颜色" },
      { name: "textColor", type: "string", default: "#191919", desc: "所有文本元素的颜色" },
      { name: "fontSize", type: "number", default: 12, desc: "文本字体大小" },
      { name: "fontFamily", type: "string", default: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", desc: "文本字体系列" }
    ],
    grid: [
      { name: "vertLines.visible", type: "boolean", default: true, desc: "是否显示垂直网格线" },
      { name: "vertLines.color", type: "string", default: "rgba(180, 184, 194, 0.2)", desc: "垂直网格线的颜色" },
      { name: "vertLines.style", type: "LineStyle", default: "LineStyle.Solid", desc: "垂直网格线的样式" },
      { name: "horzLines.visible", type: "boolean", default: true, desc: "是否显示水平网格线" },
      { name: "horzLines.color", type: "string", default: "rgba(180, 184, 194, 0.2)", desc: "水平网格线的颜色" },
      { name: "horzLines.style", type: "LineStyle", default: "LineStyle.Solid", desc: "水平网格线的样式" }
    ],
    crosshair: [
      { name: "mode", type: "CrosshairMode", default: "CrosshairMode.Normal", desc: "十字光标的模式" },
      { name: "vertLine.visible", type: "boolean", default: true, desc: "是否显示垂直十字线" },
      { name: "vertLine.color", type: "string", default: "rgba(224, 227, 235, 0.6)", desc: "垂直十字线的颜色" },
      { name: "vertLine.style", type: "LineStyle", default: "LineStyle.Solid", desc: "垂直十字线的样式" },
      { name: "vertLine.width", type: "number", default: 1, desc: "垂直十字线的宽度" },
      { name: "vertLine.labelVisible", type: "boolean", default: false, desc: "是否显示垂直十字线标签" },
      { name: "horzLine.visible", type: "boolean", default: true, desc: "是否显示水平十字线" },
      { name: "horzLine.color", type: "string", default: "rgba(224, 227, 235, 0.6)", desc: "水平十字线的颜色" },
      { name: "horzLine.style", type: "LineStyle", default: "LineStyle.Solid", desc: "水平十字线的样式" },
      { name: "horzLine.width", type: "number", default: 1, desc: "水平十字线的宽度" },
      { name: "horzLine.labelVisible", type: "boolean", default: false, desc: "是否显示水平十字线标签" }
    ],
    timeScale: [
      { name: "visible", type: "boolean", default: true, desc: "是否显示时间轴" },
      { name: "borderColor", type: "string", default: "rgba(180, 184, 194, 0.8)", desc: "时间轴边框颜色" },
      { name: "timeVisible", type: "boolean", default: true, desc: "是否显示时间标签" },
      { name: "secondsVisible", type: "boolean", default: false, desc: "是否显示秒数" },
      { name: "fixLeftEdge", type: "boolean", default: false, desc: "是否固定左边缘" },
      { name: "rightOffset", type: "number", default: 0, desc: "右边缘偏移量" },
      { name: "barSpacing", type: "number", default: 6, desc: "柱之间的间距" },
      { name: "minBarSpacing", type: "number", default: 0.5, desc: "最小柱间距" },
      { name: "tickMarkFormatter", type: "function", default: "undefined", desc: "自定义刻度格式化函数" }
    ],
    priceScale: [
      { name: "visible", type: "boolean", default: true, desc: "是否显示价格轴" },
      { name: "borderColor", type: "string", default: "rgba(180, 184, 194, 0.8)", desc: "价格轴边框颜色" },
      { name: "position", type: "string", default: "right", desc: "价格轴位置" },
      { name: "autoScale", type: "boolean", default: true, desc: "是否自动缩放" },
      { name: "invertScale", type: "boolean", default: false, desc: "是否反转刻度" },
      { name: "alignLabels", type: "boolean", default: true, desc: "是否对齐标签" },
      { name: "minimumHeight", type: "number", default: 20, desc: "最小高度" },
      { name: "scaleMargins", type: "object", default: "{ top: 0.1, bottom: 0.1 }", desc: "刻度边距" }
    ],
    lineSeries: [
      { name: "color", type: "string", default: "#2962FF", desc: "线条颜色" },
      { name: "lineWidth", type: "number", default: 2, desc: "线条宽度" },
      { name: "lineStyle", type: "LineStyle", default: "LineStyle.Solid", desc: "线条样式" },
      { name: "crosshairMarkerVisible", type: "boolean", default: true, desc: "是否显示十字光标标记" },
      { name: "crosshairMarkerRadius", type: "number", default: 4, desc: "十字光标标记半径" },
      { name: "lastValueVisible", type: "boolean", default: false, desc: "是否显示最后值标签" },
      { name: "priceFormat", type: "object", default: "{ type: 'price' }", desc: "价格格式" },
      { name: "scaleMargins", type: "object", default: "{ top: 0.1, bottom: 0.1 }", desc: "刻度边距" },
      { name: "visible", type: "boolean", default: true, desc: "系列是否可见" }
    ],
    areaSeries: [
      { name: "topColor", type: "string", default: "rgba(41, 98, 255, 0.2)", desc: "面积上部填充色" },
      { name: "bottomColor", type: "string", default: "rgba(41, 98, 255, 0)", desc: "面积下部填充色" },
      { name: "lineColor", type: "string", default: "#2962FF", desc: "线条颜色" },
      { name: "lineWidth", type: "number", default: 2, desc: "线条宽度" },
      { name: "crosshairMarkerVisible", type: "boolean", default: true, desc: "是否显示十字光标标记" },
      { name: "lastValueVisible", type: "boolean", default: false, desc: "是否显示最后值标签" }
    ],
    barSeries: [
      { name: "color", type: "string", default: "#2962FF", desc: "柱子颜色" },
      { name: "upColor", type: "string", default: "#26a69a", desc: "上涨时柱子颜色" },
      { name: "downColor", type: "string", default: "#ef5350", desc: "下跌时柱子颜色" },
      { name: "borderVisible", type: "boolean", default: false, desc: "是否显示边框" },
      { name: "borderColor", type: "string", default: "#2962FF", desc: "边框颜色" },
      { name: "crosshairMarkerVisible", type: "boolean", default: true, desc: "是否显示十字光标标记" },
      { name: "lastValueVisible", type: "boolean", default: false, desc: "是否显示最后值标签" }
    ],
    candlestickSeries: [
      { name: "upColor", type: "string", default: "#26a69a", desc: "上涨时蜡烛颜色" },
      { name: "downColor", type: "string", default: "#ef5350", desc: "下跌时蜡烛颜色" },
      { name: "borderColor", type: "string", default: "#888", desc: "蜡烛边框颜色" },
      { name: "wickColor", type: "string", default: "#888", desc: "蜡烛芯颜色" },
      { name: "borderVisible", type: "boolean", default: true, desc: "是否显示边框" },
      { name: "wickVisible", type: "boolean", default: true, desc: "是否显示蜡烛芯" },
      { name: "crosshairMarkerVisible", type: "boolean", default: true, desc: "是否显示十字光标标记" },
      { name: "lastValueVisible", type: "boolean", default: false, desc: "是否显示最后值标签" }
    ],
    histogramSeries: [
      { name: "color", type: "string", default: "#2962FF", desc: "直方图颜色" },
      { name: "base", type: "number", default: 0, desc: "基线值" },
      { name: "topColor", type: "string", default: "rgba(41, 98, 255, 0.2)", desc: "高于基线的颜色" },
      { name: "bottomColor", type: "string", default: "rgba(41, 98, 255, 0.2)", desc: "低于基线的颜色" },
      { name: "crosshairMarkerVisible", type: "boolean", default: true, desc: "是否显示十字光标标记" },
      { name: "lastValueVisible", type: "boolean", default: false, desc: "是否显示最后值标签" }
    ]
  };
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // 清理之前的图表
    if (chartRef.current) {
      chartRef.current.remove();
    }
    
    // 创建新图表 - 基于TradingView官网默认配置
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        textColor: isDark ? '#d1d4dc' : '#191919',
        fontSize: 12,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      grid: {
        vertLines: {
          color: isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
          visible: showGrid,
          style: getLineStyleEnum(lineStyle),
        },
        horzLines: {
          color: isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
          visible: showGrid,
          style: getLineStyleEnum(lineStyle),
        },
      },
      crosshair: {
        mode: showCrosshair ? CrosshairMode.Normal : CrosshairMode.Hidden,
        vertLine: {
          visible: showCrosshair,
          width: 1,
          style: LineStyle.Solid,
          color: 'rgba(224, 227, 235, 0.6)',
          labelVisible: showPriceAxisCrosshair,
        },
        horzLine: {
          visible: showCrosshair,
          width: 1,
          style: LineStyle.Solid,
          color: 'rgba(224, 227, 235, 0.6)',
          labelVisible: showPriceAxisCrosshair,
        },
      },
      timeScale: {
        visible: timeScaleVisible,
        borderColor: showBorders ? (isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)') : 'transparent',
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 6,
        minBarSpacing: 0.5,
      },
      rightPriceScale: {
        visible: rightPriceScaleVisible,
        borderColor: showBorders ? (isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)') : 'transparent',
        position: 'right',
        autoScale: true,
        alignLabels: true,
      },
      leftPriceScale: {
          visible: leftPriceScaleVisible,
          borderColor: showBorders ? (isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)') : 'transparent',
          alignLabels: true,
          autoScale: true,
          drawTicks: true,
       },
    });
    
    // 添加主系列（右侧价格轴）
    const series = chartRef.current.addLineSeries({
      color: '#2962FF',
      lineWidth: lineWidth,
      lineStyle: getLineStyleEnum(lineStyle),
      lastValueVisible: showLegend,
      title: "示例数据",
      legendVisible: showLegend,
      crosshairMarkerVisible: crosshairMarkerVisible,
      crosshairMarkerRadius: 4,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });
    
    // 如果显示左侧价格轴，添加一个关联到左侧价格轴的系列
    if (leftPriceScaleVisible) {
      chartRef.current.addLineSeries({
        color: 'rgba(41, 98, 255, 0)', // 透明色，不显示线条
        lineWidth: 0, // 线条宽度为0，确保不显示
        scaleMargins: { top: 0, bottom: 0 }, // 不占用额外空间
        priceScaleId: 'left', // 关联到左侧价格轴
      }).setData(lineChartData); // 设置相同的数据，确保价格轴显示正确
    }
    
    // 设置数据
    series.setData(lineChartData);
    
    // 调整视图以适应内容
    chartRef.current.timeScale().fitContent();
    
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
  }, [isDark, lineWidth, lineStyle, showGrid, showCrosshair, showLegend, timeScaleVisible, rightPriceScaleVisible, leftPriceScaleVisible, showBorders, crosshairMarkerVisible, showPriceAxisCrosshair]);

  return (
    <div>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-4">图表配置</h1>
        <p className={cn("text-lg", isDark ? "text-gray-300" : "text-gray-600")}>
          TradingView Lightweight Charts 提供了丰富的配置选项，让您可以根据设计和功能需求自定义图表外观和行为。本页面展示了所有配置选项及其效果。
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 配置控件 */}
        <motion.div 
          className={cn(
            "lg:col-span-1 rounded-16 p-6",
            isDark 
              ? "bg-gray-800 border border-gray-700" 
              : "bg-white border border-gray-100 shadow-sm"
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-bold mb-6">配置控件</h2>
          
          <div className="space-y-6">
            {/* 线条宽度控制 */}
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-medium">线条宽度: {lineWidth}</label>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={lineWidth} 
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className={cn(
                  "w-full h-2 rounded-lg appearance-none cursor-pointer",
                  isDark ? "bg-gray-700" : "bg-gray-200"
                )}
              />
              <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.lineWidth}
              </p>
            </motion.div>
            
            {/* 线条样式控制 */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="font-medium">线条样式</label>
              <div className="flex space-x-2">
                {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                  <label 
                    key={style} 
                    className={cn(
                      "flex items-center space-x-1 px-3 py-1 rounded-full text-sm cursor-pointer",
                      lineStyle === style
                        ? isDark 
                          ? "bg-blue-900/40 text-blue-400" 
                          : "bg-blue-100 text-blue-700"
                        : isDark 
                          ? "bg-gray-750 text-gray-300" 
                          : "bg-gray-100 text-gray-600"
                    )}
                  >
                    <input 
                      type="radio" 
                      name="lineStyle" 
                      value={style} 
                      checked={lineStyle === style}
                      onChange={(e) => setLineStyle(e.target.value as any)}
                      className="sr-only"
                    />
                    <span className="text-xs">
                      {style === 'solid' && '实线'}
                      {style === 'dashed' && '虚线'}
                      {style === 'dotted' && '点线'}
                    </span>
                  </label>
                ))}
              </div>
              <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.lineStyle}
              </p>
            </motion.div>
            
            {/* 网格控制 */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showGrid} 
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className={cn(
                    "w-4 h-4 rounded text-blue-600 focus:ring-blue-500",
                    isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                  )}
                />
                <span>显示网格</span>
              </label>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.showGrid}
              </p>
            </motion.div>
            
            {/* 十字光标控制 */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showCrosshair} 
                  onChange={(e) => setShowCrosshair(e.target.checked)}
                  className={cn(
                    "w-4 h-4 rounded text-blue-600 focus:ring-blue-500",
                    isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                  )}
                />
                <span>显示十字光标</span>
              </label>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.showCrosshair}
              </p>
            </motion.div>
            
            {/* 图例控制 */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showLegend} 
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className={cn(
                    "w-4 h-4 rounded text-blue-600 focus:ring-blue-500",
                    isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                  )}
                />
                <span>显示图例</span>
              </label>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.showLegend}
              </p>
            </motion.div>
            
            {/* 时间轴控制 */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={timeScaleVisible} 
                  onChange={(e) => setTimeScaleVisible(e.target.checked)}
                  className={cn(
                    "w-4 h-4 rounded text-blue-600 focus:ring-blue-500",
                    isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                  )}
                />
                <span>显示时间轴</span>
              </label>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.timeScaleVisible}
              </p>
            </motion.div>
            
            {/* 右侧价格轴控制 */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rightPriceScaleVisible} 
                  onChange={(e) => setRightPriceScaleVisible(e.target.checked)}
                  className={cn(
                    "w-4 h-4 rounded text-blue-600 focus:ring-blue-500",
                    isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                  )}
                />
                <span>显示右侧价格轴</span>
              </label>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.rightPriceScaleVisible}
              </p>
            </motion.div>
            
            {/* 左侧价格轴控制 */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={leftPriceScaleVisible} 
                  onChange={(e) => setLeftPriceScaleVisible(e.target.checked)}
                  className={cn(
                    "w-4 h-4 rounded text-blue-600 focus:ring-blue-500",
                    isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                  )}
                />
                <span>显示左侧价格轴</span>
              </label>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.leftPriceScaleVisible}
              </p>
            </motion.div>

            {/* 显示边框控制 */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showBorders} 
                  onChange={(e) => setShowBorders(e.target.checked)}
                  className={cn(
                    "w-4 h-4 rounded text-blue-600 focus:ring-blue-500",
                    isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                  )}
                />
                <span>显示边框</span>
              </label>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.showBorders}
              </p>
            </motion.div>

            {/* 十字光标标记控制 */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={crosshairMarkerVisible} 
                  onChange={(e) => setCrosshairMarkerVisible(e.target.checked)}
                  className={cn(
                    "w-4 h-4 rounded text-blue-600 focus:ring-blue-500",
                    isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                  )}
                />
                <span>显示十字光标标记</span>
              </label>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.crosshairMarkerVisible}
              </p>
            </motion.div>

            {/* 价格轴十字光标标签控制 */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showPriceAxisCrosshair} 
                  onChange={(e) => setShowPriceAxisCrosshair(e.target.checked)}
                  className={cn(
                    "w-4 h-4 rounded text-blue-600 focus:ring-blue-500",
                    isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                  )}
                />
                <span>显示价格轴十字光标标签</span>
              </label>
              <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                {configDetails.showPriceAxisCrosshair}
              </p>
            </motion.div>
          </div>
        </motion.div>
        
        {/* 图表显示和代码示例 */}
        <motion.div 
          className="lg:col-span-2 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 图表显示 */}
          <motion.div 
            variants={itemVariants}
            className={cn(
              "rounded-16 overflow-hidden shadow-lg border",
              isDark 
                ? "border-gray-700 shadow-gray-900/30" 
                : "border-gray-100 shadow-gray-100/50"
            )}
            style={{ height: '400px' }}
          >
            <div ref={chartContainerRef} className="w-full h-full chart-container"></div>
          </motion.div>
          
          {/* 代码示例 */}
          <motion.div variants={itemVariants}>
            <CodeExample 
              code={configCodeExample} 
              language="typescript" 
              isDark={isDark}
            />
          </motion.div>
        </motion.div>
      </div>
      
      {/* 配置选项参考 */}
      <motion.div 
        className={cn(
          "mt-12 rounded-16 p-6",
          isDark 
            ? "bg-gray-800 border border-gray-700" 
            : "bg-white border border-gray-100 shadow-sm"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-6">完整配置选项参考</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 布局配置 */}
          <div className={cn("col-span-1 p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">布局配置</h3>
            <p className={cn("text-sm mb-4", isDark ? "text-gray-300" : "text-gray-600")}>
              {configGroupExplanations.layout}
            </p>
            <div className="space-y-3">
              {allConfigOptions.layout.map((option, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <code className="font-mono text-xs">{option.name}</code>
                    <span className={cn("text-xs px-2 py-0.5 rounded", isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>
                      {option.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{option.desc}</p>
                  <p className={cn("text-xs mt-1 italic", isDark ? "text-gray-500" : "text-gray-600")}>默认值: {option.default}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 网格配置 */}
          <div className={cn("col-span-1 p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">网格配置</h3>
            <p className={cn("text-sm mb-4", isDark ? "text-gray-300" : "text-gray-600")}>
              {configGroupExplanations.grid}
            </p>
            <div className="space-y-3">
              {allConfigOptions.grid.map((option, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <code className="font-mono text-xs">{option.name}</code>
                    <span className={cn("text-xs px-2 py-0.5 rounded", isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>
                      {option.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{option.desc}</p>
                  <p className={cn("text-xs mt-1 italic", isDark ? "text-gray-500" : "text-gray-600")}>默认值: {option.default}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 十字光标配置 */}
          <div className={cn("col-span-1 p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">十字光标配置</h3>
            <p className={cn("text-sm mb-4", isDark ? "text-gray-300" : "text-gray-600")}>
              {configGroupExplanations.crosshair}
            </p>
            <div className="space-y-3">
              {allConfigOptions.crosshair.slice(0, 6).map((option, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <code className="font-mono text-xs">{option.name}</code>
                    <span className={cn("text-xs px-2 py-0.5 rounded", isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>
                      {option.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{option.desc}</p>
                  <p className={cn("text-xs mt-1 italic", isDark ? "text-gray-500" : "text-gray-600")}>默认值: {option.default}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 时间轴配置 */}
          <div className={cn("col-span-1 p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">时间轴配置</h3>
            <p className={cn("text-sm mb-4", isDark ? "text-gray-300" : "text-gray-600")}>
              {configGroupExplanations.scales}
            </p>
            <div className="space-y-3">
              {allConfigOptions.timeScale.map((option, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <code className="font-mono text-xs">{option.name}</code>
                    <span className={cn("text-xs px-2 py-0.5 rounded", isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>
                      {option.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{option.desc}</p>
                  <p className={cn("text-xs mt-1 italic", isDark ? "text-gray-500" : "text-gray-600")}>默认值: {option.default}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 价格轴配置 */}
          <div className={cn("col-span-1 p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">价格轴配置</h3>
            <p className={cn("text-sm mb-4", isDark ? "text-gray-300" : "text-gray-600")}>
              配置左侧和右侧价格轴的显示方式和行为。
            </p>
            <div className="space-y-3">
              {allConfigOptions.priceScale.map((option, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <code className="font-mono text-xs">{option.name}</code>
                    <span className={cn("text-xs px-2 py-0.5 rounded", isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>
                      {option.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{option.desc}</p>
                  <p className={cn("text-xs mt-1 italic", isDark ? "text-gray-500" : "text-gray-600")}>默认值: {option.default}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 系列配置 - 折线图 */}
          <div className={cn("col-span-1 p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">折线图系列配置</h3>
            <p className={cn("text-sm mb-4", isDark ? "text-gray-300" : "text-gray-600")}>
              {configGroupExplanations.series}
            </p>
            <div className="space-y-3">
              {allConfigOptions.lineSeries.map((option, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <code className="font-mono text-xs">{option.name}</code>
                    <span className={cn("text-xs px-2 py-0.5 rounded", isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>
                      {option.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{option.desc}</p>
                  <p className={cn("text-xs mt-1 italic", isDark ? "text-gray-500" : "text-gray-600")}>默认值: {option.default}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 系列配置 - 其他图表类型 */}
          <div className={cn("col-span-1 p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">面积图系列配置</h3>
            <div className="space-y-3">
              {allConfigOptions.areaSeries.map((option, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <code className="font-mono text-xs">{option.name}</code>
                    <span className={cn("text-xs px-2 py-0.5 rounded", isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>
                      {option.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{option.desc}</p>
                  <p className={cn("text-xs mt-1 italic", isDark ? "text-gray-500" : "text-gray-600")}>默认值: {option.default}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={cn("col-span-1 p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">柱状图系列配置</h3>
            <div className="space-y-3">
              {allConfigOptions.barSeries.map((option, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <code className="font-mono text-xs">{option.name}</code>
                    <span className={cn("text-xs px-2 py-0.5 rounded", isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>
                      {option.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{option.desc}</p>
                  <p className={cn("text-xs mt-1 italic", isDark ? "text-gray-500" : "text-gray-600")}>默认值: {option.default}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={cn("col-span-1 p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">蜡烛图和直方图配置</h3>
            <div className="space-y-3">
              {allConfigOptions.candlestickSeries.slice(0, 4).map((option, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <code className="font-mono text-xs">{option.name}</code>
                    <span className={cn("text-xs px-2 py-0.5 rounded", isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>
                      {option.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{option.desc}</p>
                  <p className={cn("text-xs mt-1 italic", isDark ? "text-gray-500" : "text-gray-600")}>默认值: {option.default}</p>
                </div>
              ))}
            </div>
            
            <h3 className="font-bold mt-4 mb-3 text-blue-600 dark:text-blue-400">直方图配置</h3>
            <div className="space-y-3">
              {allConfigOptions.histogramSeries.slice(0, 4).map((option, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <code className="font-mono text-xs">{option.name}</code>
                    <span className={cn("text-xs px-2 py-0.5 rounded", isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")}>
                      {option.type}
                    </span>
                  </div>
                  <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{option.desc}</p>
                  <p className={cn("text-xs mt-1 italic", isDark ? "text-gray-500" : "text-gray-600")}>默认值: {option.default}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* 价格格式配置 */}
      <motion.div 
        className={cn(
          "mt-8 rounded-16 p-6",
          isDark 
            ? "bg-gray-800 border border-gray-700" 
            : "bg-white border border-gray-100 shadow-sm"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-4">价格格式配置</h2>
        <p className={cn("mb-6", isDark ? "text-gray-300" : "text-gray-600")}>
          {configGroupExplanations.priceFormat}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3">价格格式类型</h3>
            <ul className={cn("list-disc pl-5 space-y-2 text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">price</code>: 标准价格格式，显示为小数</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">volume</code>: 交易量格式，可能显示为整数</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">percent</code>: 百分比格式，以%符号结尾</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">custom</code>: 自定义格式，需要提供格式化函数</li>
            </ul>
          </div>
          
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3">价格格式配置示例</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">基本价格格式</h4>
               <code className="block p-3 rounded bg-gray-900 dark:bg-gray-800 text-gray-300 dark:text-gray-300 text-xs overflow-x-auto">
                  {`const priceFormat = {
  type: 'price',
  precision: 2,
  minMove: 0.01
};`}
               </code>
             </div>
             
             <div>
               <h4 className="font-medium text-sm mb-2">百分比格式</h4>
               <code className="block p-3 rounded bg-gray-900 dark:bg-gray-800 text-gray-300 dark:text-gray-300 text-xs overflow-x-auto">
                  {`const percentFormat = {
  type: 'percent',
  precision: 1,
  minMove: 0.1
};`}
               </code>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfigurationPage;