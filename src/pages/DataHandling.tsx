import { useState, useEffect, useRef, useContext } from "react";
import CodeExample from "@/components/CodeExample";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createChart, IChartApi, ISeriesApi, Time } from "lightweight-charts";
import { ThemeContext } from "@/contexts/themeContext";

// 生成随机数据函数
const generateRandomData = (count: number, startDate: Date = new Date()) => {
  const data = [];
  let value = 50;
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    
    // 随机波动
    const change = (Math.random() - 0.48) * 5;
    value = Math.max(10, value + change);
    
    data.push({
      time: Math.floor(date.getTime() / 1000) as Time,
      value,
    });
  }
  
  return data;
};

// 生成OHLC数据函数
const generateOHLCData = (count: number, startDate: Date = new Date()) => {
  const data = [];
  let open = 50;
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    
    // 随机生成OHLC数据
    const volatility = open * 0.05;
    const close = open + (Math.random() - 0.5) * volatility * 2;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    
    data.push({
      time: Math.floor(date.getTime() / 1000) as Time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000) + 1000,
    });
    
    // 下一个开盘价基于当前收盘价
    open = close + (Math.random() - 0.5) * volatility;
  }
  
  return data;
};

const DataHandlingPage = () => {
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
  
  // 扩展功能类型以包含更多数据处理功能
  const [selectedFeature, setSelectedFeature] = useState<
    "basic-data" | "ohlc-data" | "updating-data" | "partial-update" | "data-transformation" | "lazy-loading"
  >("basic-data");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const updateIntervalRef = useRef<number | null>(null);
  
  // 中文功能类型名称映射
  const featureTypeLabels: Record<string, string> = {
    "basic-data": "基本数据格式",
    "ohlc-data": "OHLC数据格式",
    "updating-data": "数据更新",
    "partial-update": "部分数据更新",
    "data-transformation": "数据转换",
    "lazy-loading": "延迟加载数据"
  };
  
  // 功能详细说明
  const featureDescriptions = {
    "basic-data": "TradingView Lightweight Charts支持多种数据格式，最基本的数据格式包含时间和值两个字段，适用于折线图、面积图和直方图等图表类型。",
    "ohlc-data": "OHLC数据格式包含开盘价(Open)、最高价(High)、最低价(Low)和收盘价(Close)四个价格字段，适用于柱状图和蜡烛图等金融图表类型。",
    "updating-data": "实时数据更新功能允许动态添加新的数据点或替换整个数据集，使图表能够实时反映最新的数据变化。",
    "partial-update": "部分数据更新功能允许只更新图表中的部分数据，而不必重新加载整个数据集，提高了性能和用户体验。",
    "data-transformation": "数据转换功能允许在将数据应用到图表前对其进行处理和转换，如计算技术指标、调整时间范围或格式化数据。",
    "lazy-loading": "延迟加载数据功能允许根据用户的视图需求动态加载数据，特别适合处理大量历史数据的情况。"
  };
  
  // 代码示例（中文注释）
  const featureCodeExamples = {
    "basic-data": `// 基本数据格式 - 用于折线图、面积图、直方图
const basicData = [
  { time: '2023-01-01', value: 50 },
  { time: '2023-01-02', value: 55 },
  { time: '2023-01-03', value: 52 },
  // 更多数据点...
];

// 添加到折线图系列
const series = chart.addLineSeries();
series.setData(basicData);

// 时间格式可以是ISO字符串、Unix时间戳或JavaScript Date对象
const timestampData = [
  { time: 1672531200, value: 50 }, // Unix时间戳（秒）
  { time: 1672617600, value: 55 },
  { time: 1672704000, value: 52 },
];

// 添加带日期对象的数据集
const dateObjectData = [
  { time: new Date('2023-01-01').getTime() / 1000, value: 50 },
  { time: new Date('2023-01-02').getTime() / 1000, value: 55 },
  { time: new Date('2023-01-03').getTime() / 1000, value: 52 },
];`,
    
    "ohlc-data": `// OHLC数据格式 - 用于柱状图、蜡烛图
const ohlcData = [
  { 
    time: '2023-01-01', 
    open: 50,   // 开盘价
    high: 55,   // 最高价
    low: 48,    // 最低价
    close: 52   // 收盘价
  },
  { 
    time: '2023-01-02', 
    open: 52, 
    high: 58, 
    low: 51, 
    close: 56 
  },
  { 
    time: '2023-01-03', 
    open: 56, 
    high: 59, 
    low: 54, 
    close: 55 
  },
  // 更多数据点...
];

// 添加到蜡烛图系列
const candlestickSeries = chart.addCandlestickSeries();
candlestickSeries.setData(ohlcData);

// 添加交易量数据
const volumeData = ohlcData.map(item => ({
  time: item.time,
  value: Math.floor(Math.random() * 10000) + 1000,
  // 根据涨跌设置颜色
  color: item.close > item.open ? '#26a69a' : '#ef5350'
}));

const volumeSeries = chart.addHistogramSeries({
  priceFormat: {
    type: 'volume',
  },
  scaleMargins: {
    top: 0.8,
    bottom: 0,
  },
});
volumeSeries.setData(volumeData);`,
    
    "updating-data": `// 数据更新 - 替换整个数据集
const updateFullData = () => {
  // 生成新数据
  const newData = generateRandomData(100);
  // 替换现有数据
  series.setData(newData);
  // 调整视图以适应新数据
  chart.timeScale().fitContent();
};

// 数据更新 - 添加新数据点
const addNewDataPoint = () => {
  // 获取当前数据
  const currentData = series.getData();
  // 生成新数据点（使用当前时间）
  const lastDataPoint = currentData[currentData.length - 1];
  const newTime = Math.floor(Date.now() / 1000);
  const newValue = lastDataPoint.value + (Math.random() - 0.5) * 5;
  
  // 创建包含所有现有数据点和新数据点的新数组
  const newData = [...currentData, { time: newTime, value: newValue }];
  // 更新数据
  series.setData(newData);
  
  // 自动滚动到最新数据
  chart.timeScale().scrollToRealTime();
};

// 实时数据模拟
let updateInterval;
const startRealTimeUpdates = () => {
  // 每2秒添加一个新数据点
  updateInterval = setInterval(addNewDataPoint, 2000);
};

const stopRealTimeUpdates = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
};`,
    
    "partial-update": `// 部分数据更新 - 只更新特定的数据点
const updateSpecificDataPoint = (index, newValue) => {
  // 获取当前数据
  const currentData = series.getData();
  
  // 检查索引是否有效
  if (index >= 0 && index < currentData.length) {
    // 创建新的数据数组，只修改特定索引的数据点
    const newData = [...currentData];
    newData[index] = {
      ...newData[index],
      value: newValue
    };
    
    // 更新数据
    series.setData(newData);
  }
};

// 部分数据更新 - 只添加最新数据点（增量更新）
const appendNewData = () => {
  // 获取当前数据的最后一个时间戳
  const currentData = series.getData();
  const lastDataPoint = currentData[currentData.length - 1];
  
  // 计算下一个时间戳（假设是每天数据）
  const nextTime = lastDataPoint.time + 24 * 60 * 60; // 24小时 = 86400秒
  const nextValue = lastDataPoint.value + (Math.random() - 0.5) * 5;
  
  // 只添加新的数据点
  // 注意：Lightweight Charts不支持真正的部分更新，我们仍然需要设置完整的数据集
  // 但我们可以只添加新数据点而不是重新生成所有数据
  const newData = [...currentData, { time: nextTime, value: nextValue }];
  series.setData(newData);
};`,
    
    "data-transformation": `// 数据转换 - 计算移动平均线
const calculateMovingAverage = (data, period) => {
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      // 数据点不足，无法计算
      result.push({ time: data[i].time, value: null });
    } else {
      // 计算指定周期内的平均值
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].value;
      }
      result.push({ time: data[i].time, value: sum / period });
    }
  }
  
  return result;
};

// 应用移动平均线
const applyMovingAverage = () => {
  // 获取原始数据
  const originalData = series.getData();
  
  // 计算5日均线
  const ma5Data = calculateMovingAverage(originalData, 5);
  
  // 创建一个新的系列来显示移动平均线
  const ma5Series = chart.addLineSeries({
    color: '#FF6B35',
    lineWidth: 1,
    lineStyle: 2, // 虚线
  });
  
  // 设置移动平均线数据
  ma5Series.setData(ma5Data);
};

// 数据转换 - 过滤数据
const filterData = (data, condition) => {
  return data.filter(condition);
};

// 应用数据过滤
const applyDataFilter = () => {
  // 获取原始数据
  const originalData = series.getData();
  
  // 过滤出值大于50的数据点
  const filteredData = filterData(originalData, item => item.value > 50);
  
  // 创建一个新的系列来显示过滤后的数据
  const filteredSeries = chart.addLineSeries({
    color: '#06D6A0',
  });
  
  // 设置过滤后的数据
  filteredSeries.setData(filteredData);
};`,
    
    "lazy-loading": `// 延迟加载数据 - 基本实现
let isLoading = false;
let currentPage = 0;
const itemsPerPage = 100;

// 加载更多数据的函数
const loadMoreData = async () => {
  if (isLoading) return; // 防止重复加载
  
  isLoading = true;
  
  try {
    // 获取当前可见的时间范围
    const visibleRange = chart.timeScale().getVisibleRange();
    if (!visibleRange) return;
    
    // 计算需要加载的时间范围
    const loadStartDate = new Date(visibleRange.from * 1000);
    const loadEndDate = new Date(visibleRange.to * 1000);
    
    // 模拟API请求获取数据
    // 在实际应用中，这里应该是一个API调用
    const newData = await fetchHistoricalData(loadStartDate, loadEndDate);
    
    // 将新数据与现有数据合并
    const currentData = series.getData();
    const mergedData = mergeAndSortData(currentData, newData);
    
    // 更新图表数据
    series.setData(mergedData);
    
    currentPage++;
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    isLoading = false;
  }
};

// 监听时间范围变化，实现自动加载
const subscribeToTimeScaleChanges = () => {
  chart.timeScale().subscribeVisibleTimeRangeChange(() => {
    loadMoreData();
  });
};

// 合并并排序数据的辅助函数
const mergeAndSortData = (existingData, newData) => {
  // 合并数据
  const merged = [...existingData, ...newData];
  
  // 根据时间戳排序
  merged.sort((a, b) => a.time - b.time);
  
  // 去重（基于时间戳）
  const uniqueData = [];
  const seenTimes = new Set();
  
  for (const item of merged) {
    if (!seenTimes.has(item.time)) {
      seenTimes.add(item.time);
      uniqueData.push(item);
    }
  }
  
  return uniqueData;
};`
  };
  
  // 使用场景
  const featureUseCases = {
    "basic-data": [
      "显示股票、加密货币等金融资产的价格走势",
      "展示网站访问量、用户增长等业务指标",
      "可视化科学实验数据、气象数据等",
      "创建简单的时间序列图表"
    ],
    "ohlc-data": [
      "股票、期货等金融产品的技术分析",
      "加密货币交易图表",
      "展示开盘价、收盘价、最高价、最低价等完整价格信息",
      "识别价格模式和趋势"
    ],
    "updating-data": [
      "实时市场数据监控",
      "实时系统性能监控",
      "实时用户活动跟踪",
      "创建动态更新的仪表盘"
    ],
    "partial-update": [
      "优化实时数据更新的性能",
      "只更新发生变化的数据点",
      "增量添加新的数据点",
      "减少数据更新时的重绘开销"
    ],
    "data-transformation": [
      "计算移动平均线、MACD等技术指标",
      "将原始数据转换为更有意义的指标",
      "数据标准化和归一化",
      "创建派生数据系列"
    ],
    "lazy-loading": [
      "处理大量历史数据而不影响性能",
      "创建可以无限滚动的时间序列图表",
      "根据用户需求动态加载数据",
      "优化大型数据集的内存使用"
    ]
  };
  
  // 初始化图表和所选功能
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // 清理之前的图表
    if (chartRef.current) {
      chartRef.current.remove();
    }
    
    // 停止任何正在进行的更新
    if (updateIntervalRef.current !== null) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
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
      let initialData = [];
      
      // 根据不同的功能选择不同的数据格式和图表类型
      switch (selectedFeature) {
        case 'basic-data':
          // 基本数据格式 - 折线图
          seriesRef.current = chartRef.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
          });
          initialData = generateRandomData(100);
          break;
          
        case 'ohlc-data':
          // OHLC数据格式 - 蜡烛图
          seriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderColor: '#888',
            wickColor: '#888',
            borderVisible: true,
            wickVisible: true,
          });
          initialData = generateOHLCData(50);
          
          // 添加交易量系列
          const volumeData = initialData.map((item: any) => ({
            time: item.time,
            value: item.volume,
            color: item.close > item.open ? '#26a69a' : '#ef5350'
          }));
          
          const volumeSeries = chartRef.current.addHistogramSeries({
            priceFormat: {
              type: 'volume',
            },
            scaleMargins: {
              top: 0.8,
              bottom: 0,
            },
          });
          volumeSeries.setData(volumeData);
          break;
          
        case 'updating-data':
          // 数据更新 - 折线图
          seriesRef.current = chartRef.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
          });
          initialData = generateRandomData(100);
          
          // 启动实时更新模拟
          updateIntervalRef.current = window.setInterval(() => {
            if (seriesRef.current) {
          // 安全获取当前数据
          let currentData = [];
          if (seriesRef.current && typeof seriesRef.current.getData === 'function') {
            try {
              currentData = seriesRef.current.getData();
            } catch (error) {
              console.error('获取数据失败:', error);
              addLogEntry('获取数据失败: 方法调用错误');
            }
          }
          if (currentData.length === 0) {
            addLogEntry('获取数据失败: 数据为空');
            return;
          }
          const lastDataPoint = currentData[currentData.length - 1];
          const newTime = Math.floor(Date.now() / 1000);
          
          // 只有当新时间大于最后一个数据点的时间时才添加新数据点
              if (newTime > lastDataPoint.time) {
                const newValue = lastDataPoint.value + (Math.random() - 0.5) * 2;
                const newData = [...currentData, { time: newTime, value: newValue }];
                // 只保留最近100个数据点
                if (newData.length > 100) {
                  seriesRef.current.setData(newData.slice(-100));
                } else {
                  seriesRef.current.setData(newData);
                }
                // 自动滚动到最新数据
                chartRef.current?.timeScale().scrollToRealTime();
              }
            }
          }, 2000);
          break;
          
        case 'partial-update':
          // 部分数据更新 - 折线图
          seriesRef.current = chartRef.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
          });
          initialData = generateRandomData(100);
          break;
          
        case 'data-transformation':
          // 数据转换 - 折线图
          seriesRef.current = chartRef.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
          });
          initialData = generateRandomData(100);
          
          // 计算并添加5日均线
          const ma5Data = initialData.map((item, index, array) => {
            if (index < 4) {
              return { time: item.time, value: null };
            }
            let sum = 0;
            for (let i = 0; i < 5; i++) {
              sum += array[index - i].value;
            }
            return { time: item.time, value: sum / 5 };
          });
          
          const ma5Series = chartRef.current.addLineSeries({
            color: '#FF6B35',
            lineWidth: 1,
            lineStyle: 2, // 虚线
          });
          ma5Series.setData(ma5Data);
          break;
          
        case 'lazy-loading':
          // 延迟加载 - 折线图
          seriesRef.current = chartRef.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
          });
          // 初始只加载最近30天的数据
          const recentDate = new Date();
          const startDate = new Date();
          startDate.setDate(recentDate.getDate() - 30);
          initialData = generateRandomData(30, startDate);
          break;
      }
      
      // 设置初始数据
      if (seriesRef.current) {
        seriesRef.current.setData(initialData);
        // 调整视图以适应内容
        chartRef.current.timeScale().fitContent();
        
        // 添加滚动到实时数据的按钮（对于实时更新功能）
        if (selectedFeature === 'updating-data') {
          chartRef.current.timeScale().scrollToRealTime();
        }
      }
      
      // 添加时间范围变化监听（对于延迟加载功能）
      if (selectedFeature === 'lazy-loading') {
        let isLoading = false;
        chartRef.current.timeScale().subscribeVisibleTimeRangeChange(() => {
          // 使用非异步方式处理，避免事件监听器中使用async导致的问题
          if (isLoading || !seriesRef.current) return;
          
          isLoading = true;
          try {
            // 获取当前可见范围
            const visibleRange = chartRef.current!.timeScale().getVisibleRange();
            if (!visibleRange) return;
            
           // 获取当前数据 - 安全检查
          let currentData = [];
          if (seriesRef.current && typeof seriesRef.current.getData === 'function') {
            try {
              currentData = seriesRef.current.getData();
            } catch (error) {
              console.error('获取数据失败:', error);
              addLogEntry('获取数据失败: 方法调用错误');
            }
          }
            if (currentData.length === 0) return;
            
            // 检查是否需要加载更多历史数据
            const firstDataTime = currentData[0].time;
            if (visibleRange.from < firstDataTime) {
              try {
                // 需要加载更多历史数据
                const loadStartDate = new Date(visibleRange.from * 1000);
                // 生成更多历史数据
                const moreHistoricalData = generateRandomData(30, loadStartDate);
                // 合并数据并排序
                const mergedData = [...moreHistoricalData, ...currentData];
                mergedData.sort((a, b) => a.time - b.time);
                // 更新图表数据
                seriesRef.current.setData(mergedData);
                addLogEntry(`已加载更多历史数据，当前数据点数量: ${mergedData.length}`);
              } catch (error) {
                console.error('加载更多历史数据失败:', error);
                if (error instanceof Error) {
                  addLogEntry(`加载历史数据失败: ${error.message}`);
                } else {
                  addLogEntry('加载历史数据失败: 未知错误');
                }
              }
            }
          } catch (error) {
            console.error('处理时间范围变化时出错:', error);
            if (error instanceof Error) {
              addLogEntry(`处理时间范围变化失败: ${error.message}`);
            } else {
              addLogEntry('处理时间范围变化失败: 未知错误');
            }
          } finally {
            isLoading = false;
          }
        });
      }
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
      if (updateIntervalRef.current !== null) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [selectedFeature, isDark]);
  
   // 添加日志条目
  const addLogEntry = (entry: string) => {
    try {
      // 简单的日志记录函数
      console.log(`[Data Operation] ${entry}`);
      // 实际应用中可以根据需要扩展日志功能
    } catch (error) {
      console.error('记录日志失败:', error);
    }
  };

  // 数据操作函数
  const handleDataOperation = (operation: string) => {
    try {
      if (!seriesRef.current || !chartRef.current) {
        addLogEntry('操作失败: 图表尚未初始化');
        return;
      }
      
      switch (operation) {
        case 'update-full':
          // 全量更新数据
          const newFullData = generateRandomData(100);
          seriesRef.current.setData(newFullData);
          chartRef.current.timeScale().fitContent();
          addLogEntry('数据已全量更新');
          break;
          
        case 'append-data':
          try {
             // 添加新数据点
            let currentData = [];
            if (seriesRef.current && typeof seriesRef.current.getData === 'function') {
              try {
                currentData = seriesRef.current.getData();
              } catch (error) {
                console.error('获取数据失败:', error);
                addLogEntry('操作失败: 获取数据错误');
                return;
              }
            }
            if (currentData.length === 0) {
              addLogEntry('操作失败: 没有数据可追加');
              return;
            }
            
            const lastDataPoint = currentData[currentData.length - 1];
            const nextTime = lastDataPoint.time + 24 * 60 * 60; // 增加一天
            const nextValue = lastDataPoint.value + (Math.random() - 0.5) * 5;
            const newDataWithAppend = [...currentData, { time: nextTime, value: nextValue }];
            seriesRef.current.setData(newDataWithAppend);
            addLogEntry(`已添加新数据点: ${nextValue.toFixed(2)}`);
          } catch (error) {
            console.error('追加数据失败:', error);
            addLogEntry('追加数据失败: 处理数据时出错');
          }
          break;
          
        case 'update-point':
          try {
             // 更新随机数据点
            let dataToUpdate = [];
            if (seriesRef.current && typeof seriesRef.current.getData === 'function') {
              try {
                dataToUpdate = seriesRef.current.getData();
              } catch (error) {
                console.error('获取数据失败:', error);
                addLogEntry('操作失败: 获取数据错误');
                return;
              }
            }
            if (dataToUpdate.length === 0) {
              addLogEntry('操作失败: 没有数据可更新');
              return;
            }
            
            const randomIndex = Math.floor(Math.random() * dataToUpdate.length);
            const updatedData = [...dataToUpdate];
            const oldValue = updatedData[randomIndex].value;
            updatedData[randomIndex] = {
              ...updatedData[randomIndex],
              value: oldValue + (Math.random() - 0.5) * 10
            };
            seriesRef.current.setData(updatedData);
            addLogEntry(`已更新数据点: 从 ${oldValue.toFixed(2)} 到 ${updatedData[randomIndex].value.toFixed(2)}`);
          } catch (error) {
            console.error('更新数据点失败:', error);
            addLogEntry('更新数据点失败: 处理数据时出错');
          }
          break;
          
        default:
          addLogEntry(`未知操作: ${operation}`);
      }
    } catch (error) {
      console.error('数据操作失败:', error);
      if (error instanceof Error) {
        addLogEntry(`操作失败: ${error.message}`);
      } else {
        addLogEntry('操作失败: 未知错误');
      }
    }
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
        <h1 className="text-3xl font-bold mb-4">数据处理</h1>
        <p className={cn("text-lg", isDark ? "text-gray-300" : "text-gray-600")}>
          学习如何在TradingView Lightweight Charts中处理各种数据格式、更新数据和优化数据加载。本页面展示了数据处理的各种技术和最佳实践。
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* 功能类型选择 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['basic-data', 'ohlc-data', 'updating-data', 'partial-update', 'data-transformation', 'lazy-loading'] as const).map((feature) => (
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
          
          {/* 数据操作控制区 - 仅在某些功能下显示 */}
          {(selectedFeature === 'updating-data' || selectedFeature === 'partial-update') && (
            <div 
              className={cn(
                "p-4 rounded-12 mb-4",
                isDark 
                  ? "bg-gray-800 border border-gray-700" 
                  : "bg-white border border-gray-100 shadow-sm"
              )}
            >
              <div className="flex flex-wrap gap-3">
                <h3 className="font-medium w-full mb-2">数据操作:</h3>
                <button 
                  onClick={() => handleDataOperation('update-full')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isDark 
                      ? "bg-gray-750 text-gray-300 hover:bg-gray-700" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  全量更新数据
                </button>
                <button 
                  onClick={() => handleDataOperation('append-data')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isDark 
                      ? "bg-gray-750 text-gray-300 hover:bg-gray-700" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  添加新数据点
                </button>
                <button 
                  onClick={() => handleDataOperation('update-point')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isDark 
                      ? "bg-gray-750 text-gray-300 hover:bg-gray-700" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  更新随机数据点
                </button>
              </div>
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
      
      {/* 数据处理最佳实践 */}
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
        <h2 className="text-xl font-bold mb-4">数据处理最佳实践</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5",
              isDark 
                ? "bg-blue-900/30 text-blue-400" 
                : "bg-blue-100 text-blue-600"
            )}>
              <i className="fa fa-check text-sm"></i>
            </div>
            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
              <strong>优化数据结构：</strong>确保数据格式正确且高效，使用Unix时间戳而非字符串日期可以提高性能。
            </p>
          </div>
          
          <div className="flex items-start">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5",
              isDark 
                ? "bg-blue-900/30 text-blue-400" 
                : "bg-blue-100 text-blue-600"
            )}>
              <i className="fa fa-check text-sm"></i>
            </div>
            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
              <strong>合理控制数据量：</strong>避免一次性加载过多数据点，考虑使用延迟加载或数据聚合技术。
            </p>
          </div>
          
          <div className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 inline-block",
              isDark 
                ? "bg-blue-900/30 text-blue-400" 
                : "bg-blue-100 text-blue-600"
            )}>
              <i className="fa fa-check text-sm"></i>
            </div>
            <p className="inline-block"><strong>数据排序：</strong>确保数据按照时间戳升序排序，这是图表正确显示的关键。</p>
          </div>
          
          <div className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 inline-block",
              isDark 
                ? "bg-blue-900/30 text-blue-400" 
                : "bg-blue-100 text-blue-600"
            )}>
              <i className="fa fa-check text-sm"></i>
            </div>
            <p className="inline-block"><strong>避免重复数据：</strong>确保没有重复的时间戳，这可能导致图表显示异常。</p>
          </div>
          
          <div className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 inline-block",
              isDark 
                ? "bg-blue-900/30 text-blue-400" 
                : "bg-blue-100 text-blue-600"
            )}>
              <i className="fa fa-check text-sm"></i>
            </div>
            <p className="inline-block"><strong>处理实时数据：</strong>对于实时更新，考虑使用增量更新而不是全量替换。</p>
          </div>
          
          <div className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 inline-block",
              isDark 
                ? "bg-blue-900/30 text-blue-400" 
                : "bg-blue-100 text-blue-600"
            )}>
              <i className="fa fa-check text-sm"></i>
            </div>
            <p className="inline-block"><strong>错误处理：</strong>添加适当的错误处理，确保数据加载失败时不会导致应用崩溃。</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DataHandlingPage;