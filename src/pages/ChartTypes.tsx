import { useState, useEffect } from "react";
import ChartDisplay from "@/components/ChartDisplay";
import CodeExample from "@/components/CodeExample";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { lineChartData, areaChartData, barChartData, candlestickChartData, histogramChartData, baselineChartData } from "@/data/mockData";

const ChartTypesPage = () => {
  // 使用useTheme hook获取主题状态
  const { isDark } = useTheme();
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'area' | 'bar' | 'candlestick' | 'histogram' | 'multiple-lines' | 'baseline'>('line');
  
  // 监听全局主题变化事件
  useEffect(() => {
    const handleThemeChange = () => {
      // 强制重新渲染以应用新主题
      setSelectedChartType(prev => prev);
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  
  // 图表类型配置 - 基于TradingView官网功能
  const chartTypes = [
    {
      id: 'line',
      label: '线形图',
      description: '最基本的图表类型，使用线条连接数据点，适合显示连续性数据的变化趋势。线形图在金融分析中常用于展示价格变化趋势，是最常用的图表类型之一。',
      useCases: ['显示股票价格趋势', '展示温度变化', '监控网站访问量', '分析销售趋势'],
      data: lineChartData,
      features: [
        '平滑的线条连接各个数据点',
        '可自定义线条颜色、宽度和样式',
        '支持显示最后一个值的标签',
        '适合展示数据的总体趋势'
      ]
    },
    {
      id: 'area',
      label: '面积图',
      description: '在折线图的基础上，在线条下方填充颜色，强调数据的累积效应和总量变化。面积图能够直观地展示数据的变化幅度和总量关系。',
      useCases: ['显示累计销售额', '展示市场份额变化', '可视化资源使用情况', '显示人口增长趋势'],
      data: areaChartData,
      features: [
        '线条下方填充半透明颜色',
        '可自定义上下填充颜色渐变',
        '强调数据的总量和变化趋势',
        '适合比较多个数据集的累计值'
      ]
    },
    {
      id: 'bar',
      label: '美国图',
      description: '美国图也称为条形图或OHLC图，使用垂直条形表示每个数据点的开盘价、最高价、最低价和收盘价。它是金融领域常用的图表类型之一，特别适合展示价格波动。',
      useCases: ['展示股票OHLC数据', '分析短期价格波动', '比较不同时间段的价格区间', '识别价格趋势和反转点'],
      data: barChartData,
      features: [
        '使用垂直条形表示OHLC数据',
        '可根据涨跌使用不同颜色',
        '清晰展示价格波动范围',
        '适合短期价格走势分析'
      ]
    },
    {
      id: 'candlestick',
      label: 'K线图',
      description: 'K线图是金融领域最常用的图表类型，使用蜡烛形态显示开盘价、收盘价、最高价和最低价，同时可以展示交易量。蜡烛图能够提供更丰富的价格波动信息，是专业技术分析的标准工具。',
      useCases: ['股票技术分析', '期货市场监控', '加密货币交易分析', '识别价格形态'],
      data: candlestickChartData,
      features: [
        '显示完整的OHLC价格信息',
        '蜡烛体表示开盘价与收盘价之间的价格区间',
        '蜡烛芯表示最高价与最低价之间的价格区间',
        '上涨用绿色，下跌用红色表示',
        '支持与交易量图表组合使用'
      ]
    },
    {
      id: 'histogram',
      label: '直方图',
      description: '使用矩形条表示数据分布情况，通常用于显示频率分布或辅助数据如交易量。直方图在金融分析中常被用作交易量的可视化表示。',
      useCases: ['显示交易量分布', '分析数据频率', '比较分类数据', '表示统计频率'],
      data: histogramChartData,
      features: [
        '使用水平或垂直条形表示数据',
        '可根据值的正负使用不同颜色',
        '适合显示频率分布和统计数据',
        '常用作交易量等辅助指标的展示'
      ]
    },
    {
      id: 'multiple-lines',
      label: '多条线图表',
      description: '在同一图表上显示多条数据系列，可以方便地比较不同数据集的趋势和关系。多条线图表特别适合比较相关数据的变化趋势。',
      useCases: ['比较不同股票走势', '分析多种指标相关性', '监控多个产品线业绩', '比较不同区域的销售数据'],
      data: null, // 多条线图表使用专用的数据源
      features: [
        '在同一图表上显示多个数据系列',
        '每个系列可使用不同的颜色和样式',
        '支持系列标题和图例',
        '便于比较不同数据集的趋势'
      ]
    },
    {
      id: 'baseline',
      label: '基准图',
      description: '基准图是一种特殊类型的图表，它有一条水平基准线，用于比较数据相对于某一基准值的变化。这种图表特别适合显示相对于基准值的增长或下降情况。',
      useCases: ['展示相对于基准值的业绩', '分析投资回报率', '显示相对于目标的进度', '比较不同时期的表现'],
      data: baselineChartData,
      features: [
        '显示水平基准线',
        '强调数据相对于基准值的变化',
        '可自定义基准线位置和样式',
        '适合比较分析和业绩评估'
      ]
    }
  ];
  
  // 代码示例 - 基于TradingView官网示例
  const codeExamples = {
    line: `import { createChart } from 'lightweight-charts';

    // 创建图表实例
    const chart = createChart(container, {
      width: 800,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#191919',
      },
      grid: {
        vertLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
        horzLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
    });

    // 添加线形图系列
    const lineSeries = chart.addLineSeries({
      color: '#2962FF', // 线条颜色
      lineWidth: 2,    // 线条宽度
      lastValueVisible: true, // 显示最后一个值
      crosshairMarkerVisible: true, // 显示十字光标标记
    });

    // 设置数据
    lineSeries.setData([
      { time: '2023-01-01', value: 50 },
      { time: '2023-01-02', value: 55 },
      { time: '2023-01-03', value: 52 },
      // 更多数据...
    ]);

    // 调整视图以适应内容
    chart.timeScale().fitContent();`,

    area: `import { createChart } from 'lightweight-charts';

    // 创建图表实例
    const chart = createChart(container, {
      width: 800,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#191919',
      },
      grid: {
        vertLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
        horzLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
    });

    // 添加面积图系列
    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(41, 98, 255, 0.2)', // 上部填充色
      bottomColor: 'rgba(41, 98, 255, 0)', // 下部填充色
      lineColor: '#2962FF', // 线条颜色
      lineWidth: 2, // 线条宽度
      lastValueVisible: true, // 显示最后一个值
      crosshairMarkerVisible: true, // 显示十字光标标记
    });

    // 设置数据
    areaSeries.setData([
      { time: '2023-01-01', value: 50 },
      { time: '2023-01-02', value: 55 },
      { time: '2023-01-03', value: 52 },
      // 更多数据...
    ]);

    // 调整视图以适应内容
    chart.timeScale().fitContent();`,

    bar: `import { createChart } from 'lightweight-charts';

    // 创建图表实例
    const chart = createChart(container, {
      width: 800,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#191919',
      },
      grid: {
        vertLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
        horzLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
    });

    // 添加美国图系列
    const barSeries = chart.addBarSeries({
      color: '#2962FF', // 基本颜色
      upColor: '#26a69a', // 上涨时颜色
      downColor: '#ef5350', // 下跌时颜色
      borderVisible: false, // 是否显示边框
      lastValueVisible: true, // 显示最后一个值
      crosshairMarkerVisible: true, // 显示十字光标标记
    });

    // 设置数据 (OHLC格式)
    barSeries.setData([
      { time: '2023-01-01', open: 50, high: 55, low: 48, close: 52 },
      { time: '2023-01-02', open: 52, high: 58, low: 51, close: 56 },
      { time: '2023-01-03', open: 56, high: 59, low: 54, close: 55 },
      // 更多数据...
    ]);

    // 调整视图以适应内容
    chart.timeScale().fitContent();`,

    candlestick: `import { createChart } from 'lightweight-charts';

    // 创建图表实例
    const chart = createChart(container, {
      width: 800,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#191919',
      },
      grid: {
        vertLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
        horzLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
    });

    // 添加K线图系列
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a', // 上涨时蜡烛颜色
      downColor: '#ef5350', // 下跌时蜡烛颜色
      borderColor: '#888', // 边框颜色
      wickColor: '#888', // 蜡烛芯颜色
      borderVisible: true, // 是否显示边框
      wickVisible: true, // 是否显示蜡烛芯
      lastValueVisible: true, // 显示最后一个值
      crosshairMarkerVisible: true, // 显示十字光标标记
    });

    // 设置数据 (OHLC格式)
    candlestickSeries.setData([
      { time: '2023-01-01', open: 50, high: 55, low: 48, close: 52 },
      { time: '2023-01-02', open: 52, high: 58, low: 51, close: 56 },
      { time: '2023-01-03', open: 56, high: 59, low: 54, close: 55 },
      { time: '2023-01-04', open: 55, high: 62, low: 53, close: 60 },
      { time: '2023-01-05', open: 60, high: 61, low: 57, close: 58 },
      // 更多数据...
    ]);

    // 蜡烛图（K线图）的蜡烛体表示开盘价与收盘价之间的价格区间
    // 蜡烛芯表示最高价与最低价之间的价格区间
    // 上涨时蜡烛体为绿色，下跌时为红色

    // 添加交易量系列
    const volumeSeries = chart.addHistogramSeries({
      color: '#2962FF',
      priceFormat: {
        type: 'volume',
      },
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // 设置交易量数据
    volumeSeries.setData([
      { time: '2023-01-01', value: 1200 },
      { time: '2023-01-02', value: 1500 },
      { time: '2023-01-03', value: 1300 },
      // 更多数据...
    ]);

    // 调整视图以适应内容
    chart.timeScale().fitContent();`,

    histogram: `import { createChart } from 'lightweight-charts';

    // 创建图表实例
    const chart = createChart(container, {
      width: 800,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#191919',
      },
      grid: {
        vertLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
        horzLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
    });

    // 添加直方图系列
    const histogramSeries = chart.addHistogramSeries({
      color: '#2962FF', // 柱子颜色
      lineWidth: 1, // 线条宽度
      lastValueVisible: true, // 显示最后一个值
      crosshairMarkerVisible: true, // 显示十字光标标记
    });

    // 设置数据
    histogramSeries.setData([
      { time: '2023-01-01', value: 1200 },
      { time: '2023-01-02', value: 1500 },
      { time: '2023-01-03', value: 1300 },
      // 更多数据...
    ]);

    // 调整视图以适应内容
    chart.timeScale().fitContent();`,

        'multiple-lines': `import { createChart, LineStyle } from 'lightweight-charts';

    // 创建图表实例
    const chart = createChart(container, {
      width: 800,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#191919',
      },
      grid: {
        vertLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
        horzLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
    });

    // 添加第一条线
    const series1 = chart.addLineSeries({
      color: '#2962FF', // 线条颜色
      lineWidth: 2, // 线条宽度
      lineStyle: LineStyle.Solid, // 线条样式
      title: '线1', // 系列标题
      lastValueVisible: true, // 显示最后一个值
      crosshairMarkerVisible: true, // 显示十字光标标记
    });

    // 添加第二条线
    const series2 = chart.addLineSeries({
      color: '#FF6B35', // 线条颜色
      lineWidth: 2, // 线条宽度
      lineStyle: LineStyle.Dashed, // 线条样式
      title: '线2', // 系列标题
      lastValueVisible: true, // 显示最后一个值
      crosshairMarkerVisible: true, // 显示十字光标标记
    });

    // 添加第三条线
    const series3 = chart.addLineSeries({
      color: '#06D6A0', // 线条颜色
      lineWidth: 2, // 线条宽度
      lineStyle: LineStyle.Dotted, // 线条样式
      title: '线3', // 系列标题
      lastValueVisible: true, // 显示最后一个值
      crosshairMarkerVisible: true, // 显示十字光标标记
    });

    // 设置数据
    series1.setData([
      { time: '2023-01-01', value: 50 },
      { time: '2023-01-02', value: 55 },
      { time: '2023-01-03', value: 52 },
      // 更多数据...
    ]);

    series2.setData([
      { time: '2023-01-01', value: 45 },
      { time: '2023-01-02', value: 52 },
      { time: '2023-01-03', value: 48 },
      // 更多数据...
    ]);

    series3.setData([
      { time: '2023-01-01', value: 42 },
      { time: '2023-01-02', value: 48 },
      { time: '2023-01-03', value: 46 },
      // 更多数据...
    ]);

    // 调整视图以适应内容
    chart.timeScale().fitContent();`,

    baseline: `import { createChart } from 'lightweight-charts';

    // 创建图表实例
    const chart = createChart(container, {
      width: 800,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#191919',
      },
      grid: {
        vertLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
        horzLines: {
          color: 'rgba(180, 184, 194, 0.2)',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(180, 184, 194, 0.8)',
      },
    });

    // 添加基准图系列
    const mainSeries = chart.addLineSeries({
      color: '#2962FF', // 线条颜色
      lineWidth: 2,    // 线条宽度
      lastValueVisible: true, // 显示最后一个值
      crosshairMarkerVisible: true, // 显示十字光标标记
    });

    // 设置数据
    mainSeries.setData([
      { time: '2023-01-01', value: 50 },
      { time: '2023-01-02', value: 55 },
      { time: '2023-01-03', value: 52 },
      { time: '2023-01-04', value: 58 },
      { time: '2023-01-05', value: 54 },
      // 更多数据...
    ]);

    // 添加基准线
    // 计算数据的平均值作为基准线
    const data = [
      { time: '2023-01-01', value: 50 },
      { time: '2023-01-02', value: 55 },
      { time: '2023-01-03', value: 52 },
      { time: '2023-01-04', value: 58 },
      { time: '2023-01-05', value: 54 },
      // 更多数据...
    ];

    // 计算基准值（这里使用平均值）
    const baselineValue = data.reduce((sum, item) => sum + item.value, 0) / data.length;

    // 创建基准线数据
    const baselineData = data.map(item => ({
      time: item.time,
      value: baselineValue
    }));

    // 添加基准线系列
    const baselineSeries = chart.addLineSeries({
      color: '#FF6B35', // 基准线颜色
      lineWidth: 1,    // 基准线宽度
      lineStyle: 1,    // 虚线样式
      lastValueVisible: false, // 不显示最后一个值
      crosshairMarkerVisible: false, // 不显示十字光标标记
    });

    // 设置基准线数据
    baselineSeries.setData(baselineData);

    // 调整视图以适应内容
    chart.timeScale().fitContent();`
  };
  
  // 当前选中的图表类型配置
  const currentChartType = chartTypes.find(type => type.id === selectedChartType);
  
  // 淡入动画效果
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };
  
  // 容器动画效果
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
  
  // 项目动画效果
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-4">图表类型</h1>
        <p className={cn("text-lg", isDark ? "text-gray-300" : "text-gray-600")}>
          TradingView Lightweight Charts 支持多种图表类型，每种类型都有其特定的用途和优势。本页面展示了所有支持的图表类型及其用法。
        </p>
      </motion.div>
      
      {/* 图表类型选择 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {chartTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedChartType(type.id as any)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              selectedChartType === type.id
                ? isDark 
                  ? "bg-blue-900/40 text-blue-400 border border-blue-700" 
                  : "bg-blue-100 text-blue-700 border border-blue-200"
                : isDark 
                  ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-750" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            {type.label}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧 - 图表显示 */}
        <motion.div 
          className="lg:col-span-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className={cn(
              "rounded-16 overflow-hidden shadow-lg border",
              isDark 
                ? "border-gray-700 shadow-gray-900/30" 
                : "border-gray-100 shadow-gray-100/50"
            )}
          >
            <ChartDisplay 
              type={selectedChartType} 
              data={currentChartType?.data || lineChartData}
              width={800} 
              height={500} 
            />
          </motion.div>
          
          {/* 图表特性列表 */}
          {currentChartType?.features && (
            <motion.div 
              variants={itemVariants}
              className={cn(
                "mt-6 rounded-16 p-6",
                isDark 
                  ? "bg-gray-800 border border-gray-700" 
                  : "bg-white border border-gray-100 shadow-sm"
              )}
            >
              <h3 className="text-lg font-bold mb-3">图表特性</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChartType.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <i className="fa fa-check-circle text-green-500 mr-2"></i>
                    <span className={cn(isDark ? "text-gray-300" : "text-gray-600")}>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* 右侧 - 图表说明和代码示例 */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div 
            variants={itemVariants}
            className={cn(
              "rounded-16 p-6",
              isDark 
                ? "bg-gray-800 border border-gray-700" 
                : "bg-white border border-gray-100 shadow-sm"
            )}
          >
            <h2 className="text-xl font-bold mb-3">{currentChartType?.label}</h2>
            <p className={cn("mb-4", isDark ? "text-gray-300" : "text-gray-600")}>
              {currentChartType?.description}
            </p>
            
            <h3 className="font-bold mb-2">适用场景</h3>
            <ul className={cn("list-disc pl-5 space-y-1", isDark ? "text-gray-300" : "text-gray-600")}>
              {currentChartType?.useCases.map((useCase, index) => (
                <li key={index}>{useCase}</li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <CodeExample 
              code={codeExamples[selectedChartType]} 
              language="typescript" 
            />
          </motion.div>
        </motion.div>
      </div>
      
      {/* 所有图表类型的综合说明 */}
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
        <h2 className="text-xl font-bold mb-6">图表类型比较与选择指南</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 折线图说明 */}
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-2 text-blue-600 dark:text-blue-400">折线图</h3><p className={cn("text-sm mb-3", isDark ? "text-gray-300" : "text-gray-600")}>
              使用线条连接数据点，最适合显示随时间变化的连续数据趋势。
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>展示数据趋势非常清晰</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>可以在同一图表上显示多条线</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-times-circle text-red-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>不适合精确比较数值大小</span>
              </div>
            </div>
          </div>
          
          {/* 面积图说明 */}
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-2 text-blue-600 dark:text-blue-400">面积图</h3>
            <p className={cn("text-sm mb-3", isDark ? "text-gray-300" : "text-gray-600")}>
              在折线图基础上添加颜色填充，强调数据的累积效应和总量比较。
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>视觉上更具冲击力</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>适合强调总量变化</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-times-circle text-red-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>多数据系列可能互相遮挡</span>
              </div>
            </div>
          </div>
          
          {/* 柱状图说明 */}
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-2 text-blue-600 dark:text-blue-400">柱状图</h3>
            <p className={cn("text-sm mb-3", isDark ? "text-gray-300" : "text-gray-600")}>
              使用垂直柱子表示数据点，适合比较不同类别或时间段的数值。
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>便于精确比较数值大小</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>可以使用颜色编码表示不同状态</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-times-circle text-red-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>大量数据点会显得拥挤</span>
              </div>
            </div>
          </div>
          
          {/* 蜡烛图说明 */}
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-2 text-blue-600 dark:text-blue-400">蜡烛图</h3>
            <p className={cn("text-sm mb-3", isDark ? "text-gray-300" : "text-gray-600")}>
              显示开盘价、收盘价、最高价和最低价，是金融市场技术分析的标准工具。
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>提供完整的价格波动信息</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>可以结合交易量分析</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-times-circle text-red-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>数据密度高，初学者可能难以解读</span>
              </div>
            </div>
          </div>
          
          {/* 直方图说明 */}
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-2 text-blue-600 dark:text-blue-400">直方图</h3>
            <p className={cn("text-sm mb-3", isDark ? "text-gray-300" : "text-gray-600")}>
              使用矩形条表示数据分布，通常用于显示频率分布或辅助数据如交易量。
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>适合显示数据分布情况</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>常作为主图表下方的辅助图表</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-times-circle text-red-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>不适合展示详细的时间序列趋势</span>
              </div>
            </div>
          </div>
          
          {/* 多条线图表说明 */}
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-2 text-blue-600 dark:text-blue-400">多条线图表</h3>
            <p className={cn("text-sm mb-3", isDark ? "text-gray-300" : "text-gray-600")}>
              在同一图表上显示多个数据系列，可以直观地比较不同数据集的趋势。
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>便于比较多个数据集</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-check-circle text-green-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>可以使用不同样式区分数据系列</span>
              </div>
              <div className="flex items-center">
                <i className="fa fa-times-circle text-red-500 mr-2"></i>
                <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>数据系列过多会导致图表混乱</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* 数据格式说明 */}
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
        <h2 className="text-xl font-bold mb-4">数据格式说明</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">简单数据点格式（用于折线图、面积图、直方图）</h4>
            <code className="block p-4 rounded bg-gray-900 dark:bg-gray-800 text-gray-300 dark:text-gray-300 text-xs overflow-x-auto">
{`[
  { time: '2023-01-01', value: 50 },
  { time: '2023-01-02', value: 55 },
  { time: '2023-01-03', value: 52 },
  // 更多数据...
]`}
            </code>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">OHLC数据格式（用于柱状图、蜡烛图）</h4>
            <code className="block p-4 rounded bg-gray-900 dark:bg-gray-800 text-gray-300 dark:text-gray-300 text-xs overflow-x-auto">
{`[
  { 
    time: '2023-01-01', 
    open: 50,   // 开盘价
    high: 55,   // 最高价
    low: 48,    // 最低价
    close: 52   // 收盘价
  },
  // 更多数据...
]`}
            </code>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChartTypesPage;