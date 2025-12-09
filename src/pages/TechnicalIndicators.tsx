import { useState, useEffect, useRef, useContext } from "react";
import CodeExample from "@/components/CodeExample";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createChart, IChartApi, ISeriesApi, LineStyle, Time } from "lightweight-charts";
import { lineChartData } from "@/data/mockData";
import { ThemeContext } from "@/contexts/themeContext";

// 计算移动平均线
const calculateMovingAverage = (data: any[], period: number) => {
  return data.map((item, index) => {
    if (index < period - 1) {
      return { time: item.time, value: null };
    }
    
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[index - i].value;
    }
    
    return { 
      time: item.time, 
      value: sum / period 
    };
  });
};

// 计算RSI指标
const calculateRSI = (data: any[], period: number) => {
  const result = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // 计算每个周期的涨跌
  for (let i = 1; i < data.length; i++) {
    const change = data[i].value - data[i - 1].value;
    gains.push(Math.max(change, 0));
    losses.push(Math.max(-change, 0));
  }
  
  // 计算RSI
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push({ time: data[i].time, value: null });
    } else {
      // 计算平均收益和平均亏损
      const startIndex = i - period;
      const avgGain = gains.slice(startIndex, i).reduce((sum, val) => sum + val, 0) / period;
      const avgLoss = losses.slice(startIndex, i).reduce((sum, val) => sum + val, 0) / period;
      
      // 计算RSI
      const rs = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
      result.push({ time: data[i].time, value: rs });
    }
  }
  
  return result;
};

// 计算MACD指标
const calculateMACD = (data: any[], fastPeriod: number, slowPeriod: number, signalPeriod: number) => {
  const result = [];
  
  // 计算快线和慢线
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // 计算MACD线
  const macdLine = [];
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i].value !== null && slowEMA[i].value !== null) {
      macdLine.push({
        time: data[i].time,
        value: fastEMA[i].value - slowEMA[i].value
      });
    } else {
      macdLine.push({
        time: data[i].time,
        value: null
      });
    }
  }
  
  // 计算信号线
  const signalLine = calculateEMA(macdLine.filter(item => item.value !== null), signalPeriod);
  
  // 计算柱状图
  const histogram = [];
  for (let i = 0; i < data.length; i++) {
    if (macdLine[i].value !== null && i < signalLine.length && signalLine[i].value !== null) {
      histogram.push({
        time: data[i].time,
        value: macdLine[i].value - signalLine[i].value
      });
    } else {
      histogram.push({
        time: data[i].time,
        value: null
      });
    }
  }
  
  return {
    macdLine,
    signalLine,
    histogram
  };
};

// 计算指数移动平均线 (EMA)
const calculateEMA = (data: any[], period: number) => {
  const result = [];
  const multiplier = 2 / (period + 1);
  
  // 计算初始简单移动平均线
  let sum = 0;
  for (let i = 0; i < period; i++) {
    if (data[i].value !== null) {
      sum += data[i].value;
    }
  }
  const initialSMA = sum / period;
  
  // 计算EMA
  result.push({ time: data[period - 1].time, value: initialSMA });
  
  for (let i = period; i < data.length; i++) {
    if (data[i].value !== null) {
      const ema = (data[i].value - result[result.length - 1].value) * multiplier + result[result.length - 1].value;
      result.push({ time: data[i].time, value: ema });
    }
  }
  
  // 填充前面的null值
  const fullResult = [];
  for (let i = 0; i < period - 1; i++) {
    fullResult.push({ time: data[i].time, value: null });
  }
  
  return [...fullResult, ...result];
};

const TechnicalIndicatorsPage = () => {
  // 使用useTheme hook获取主题状态
  const { isDark } = useTheme();
  
  // 监听全局主题变化事件
  useEffect(() => {
    const handleThemeChange = () => {
      // 强制重新渲染以应用新主题
      setSelectedIndicator(prev => prev);
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  
  const [selectedIndicator, setSelectedIndicator] = useState<
    "ma" | "rsi" | "macd" | "bb" | "volume"
  >("ma");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
  // 中文指标类型名称映射
  const indicatorTypeLabels: Record<string, string> = {
    ma: "移动平均线 (MA)",
    rsi: "相对强弱指标 (RSI)",
    macd: "平滑异同移动平均线 (MACD)",
    bb: "布林带 (Bollinger Bands)",
    volume: "交易量指标"
  };
  
  // 指标详细说明
  const indicatorDescriptions = {
    ma: "移动平均线是最基本的技术分析指标，用于平滑价格数据，识别趋势方向。常用的有简单移动平均线(SMA)和指数移动平均线(EMA)。",
    rsi: "相对强弱指标通过比较一段时期内的平均收盘涨数和平均收盘跌数来分析市场买沽盘的意向和实力，从而判断未来市场的走势。",
    macd: "平滑异同移动平均线由快线、慢线和柱状图组成，用于识别价格走势的动量、方向和强度变化，是最常用的趋势跟踪指标之一。",
    bb: "布林带由三条线组成：中轨为移动平均线，上下轨为中轨加减一定倍数的标准差，用于衡量价格的波动性和超买超卖状态。",
    volume: "交易量指标显示在特定时间段内的交易总量，与价格走势结合分析可以确认趋势的强度和可持续性。"
  };
  
  // 代码示例（中文注释）
  const indicatorCodeExamples = {
    ma: `// 计算移动平均线
const calculateMovingAverage = (data, period) => {
  return data.map((item, index) => {
    if (index < period - 1) {
      // 数据点不足，返回null
      return { time: item.time, value: null };
    }
    
    // 计算指定周期内的平均值
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[index - i].value;
    }
    
    return { 
      time: item.time, 
      value: sum / period 
    };
  });
};

// 添加到图表
const ma5Data = calculateMovingAverage(originalData, 5);
const ma20Data = calculateMovingAverage(originalData, 20);

const ma5Series = chart.addLineSeries({
  color: '#FF6B35',
  lineWidth: 1,
  lineStyle: LineStyle.Dashed,
});
ma5Series.setData(ma5Data);

const ma20Series = chart.addLineSeries({
  color: '#06D6A0',
  lineWidth: 1,
  lineStyle: LineStyle.Dotted,
});
ma20Series.setData(ma20Data);`,
    
    rsi: `// 计算RSI指标
const calculateRSI = (data, period = 14) => {
  const result = [];
  const gains = [];
  const losses = [];
  
  // 计算每个周期的涨跌
  for (let i = 1; i < data.length; i++) {
    const change = data[i].value - data[i - 1].value;
    gains.push(Math.max(change, 0));
    losses.push(Math.max(-change, 0));
  }
  
  // 计算RSI
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push({ time: data[i].time, value: null });
    } else {
      // 计算平均收益和平均亏损
      const startIndex = i - period;
      const avgGain = gains.slice(startIndex, i).reduce((sum, val) => sum + val, 0) / period;
      const avgLoss = losses.slice(startIndex, i).reduce((sum, val) => sum + val, 0) / period;
      
      // 计算RSI
      const rs = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
      result.push({ time: data[i].time, value: rs });
    }
  }
  
  return result;
};

// 添加到图表
const rsiData = calculateRSI(originalData, 14);

// 创建RSI子图表容器
const rsiContainer = document.createElement('div');
rsiContainer.style.height = '100px';
document.getElementById('chart-container').appendChild(rsiContainer);

// 创建RSI图表
const rsiChart = createChart(rsiContainer, {
  width: chart.size().width,
  height: 100,
  layout: {
    backgroundColor: 'transparent',
    textColor: '#787b86',
  },
  grid: {
    horzLines: {
      color: '#2a2e39',
    },
    vertLines: {
      visible: false,
    },
  },
  timeScale: {
    visible: false,
  },
  rightPriceScale: {
    scaleMargins: {
      top: 0.1,
      bottom: 0.1,
    },
  },
});

const rsiSeries = rsiChart.addLineSeries({
  color: '#FF6B35',
  lineWidth: 2,
});
rsiSeries.setData(rsiData);`,
    
    macd: `// 计算MACD指标
const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  // 计算快线和慢线
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // 计算MACD线
  const macdLine = [];
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i].value !== null && slowEMA[i].value !== null) {
      macdLine.push({
        time: data[i].time,
        value: fastEMA[i].value - slowEMA[i].value
      });
    } else {
      macdLine.push({
        time: data[i].time,
        value: null
      });
    }
  }
  
  // 计算信号线
  const signalLine = calculateEMA(macdLine.filter(item => item.value !== null), signalPeriod);
  
  // 计算柱状图
  const histogram = [];
  for (let i = 0; i < data.length; i++) {
    if (macdLine[i].value !== null && i < signalLine.length && signalLine[i].value !== null) {
      histogram.push({
        time: data[i].time,
        value: macdLine[i].value - signalLine[i].value
      });
    } else {
      histogram.push({
        time: data[i].time,
        value: null
      });
    }
  }
  
  return {
    macdLine,
    signalLine,
    histogram
  };
};

// 计算指数移动平均线
const calculateEMA = (data, period) => {
  // EMA计算实现...
};

// 添加到图表
const macdResult = calculateMACD(originalData);

// 创建MACD子图表
const macdContainer = document.createElement('div');
macdContainer.style.height = '100px';
document.getElementById('chart-container').appendChild(macdContainer);

const macdChart = createChart(macdContainer, {
  // 配置省略...
});

// 添加MACD线
const macdLineSeries = macdChart.addLineSeries({
  color: '#2962FF',
  lineWidth: 1,
});
macdLineSeries.setData(macdResult.macdLine);

// 添加信号线
const signalLineSeries = macdChart.addLineSeries({
  color: '#FF6B35',
  lineWidth: 1,
});
signalLineSeries.setData(macdResult.signalLine);

// 添加直方图
const histogramSeries = macdChart.addHistogramSeries({
  color: '#06D6A0',
});
histogramSeries.setData(macdResult.histogram);`,
    
    bb: `// 计算布林带
const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
  const result = {
    upper: [],
    middle: [],
    lower: []
  };
  
  // 计算中轨（移动平均线）
  const smaData = calculateMovingAverage(data, period);
  
  // 计算标准差并生成上轨和下轨
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.upper.push({ time: data[i].time, value: null });
      result.middle.push({ time: data[i].time, value: null });
      result.lower.push({ time: data[i].time, value: null });
    } else {
      // 计算标准差
      const slice = data.slice(i - period + 1, i + 1);
      const avg = smaData[i].value;
      const squaredDiffs = slice.map(item => Math.pow(item.value - avg, 2));
      const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
      const stdDev = Math.sqrt(avgSquaredDiff);
      
      // 计算上轨和下轨
      result.upper.push({ time: data[i].time, value: avg + (multiplier * stdDev) });
      result.middle.push({ time: data[i].time, value: avg });
      result.lower.push({ time: data[i].time, value: avg - (multiplier * stdDev) });
    }
  }
  
  return result;
};

// 添加到图表
const bbResult = calculateBollingerBands(originalData);

// 添加中轨
const middleBandSeries = chart.addLineSeries({
  color: '#2962FF',
  lineWidth: 1,
});
middleBandSeries.setData(bbResult.middle);

// 添加上轨
const upperBandSeries = chart.addLineSeries({
  color: '#FF6B35',
  lineWidth: 1,
  lineStyle: LineStyle.Dashed,
});
upperBandSeries.setData(bbResult.upper);

// 添加下轨
const lowerBandSeries = chart.addLineSeries({
  color: '#06D6A0',
  lineWidth: 1,
  lineStyle: LineStyle.Dashed,
});
lowerBandSeries.setData(bbResult.lower);`,
    
    volume: `// 添加交易量指标
const volumeData = originalData.map(item => ({
  time: item.time,
  value: Math.floor(Math.random() * 10000) + 1000, // 模拟交易量数据
}));

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

volumeSeries.setData(volumeData);

// 根据价格涨跌设置交易量柱子颜色
const coloredVolumeData = originalData.map((item, index) => ({
  time: item.time,
  value: Math.floor(Math.random() * 10000) + 1000,
  // 如果当前价格高于前一个价格，使用绿色；否则使用红色
  color: index > 0 && item.value > originalData[index - 1].value 
    ? '#26a69a' 
    : index > 0 && item.value < originalData[index - 1].value
    ? '#ef5350'
    : '#2962FF'
}));

volumeSeries.setData(coloredVolumeData);`
  };
  
  // 使用场景
  const indicatorUseCases = {
    ma: [
      "识别趋势方向和强度",
      "确定支撑位和阻力位",
      "寻找买入和卖出信号（如金叉和死叉）",
      "平滑价格波动，过滤短期噪音"
    ],
    rsi: [
      "识别超买超卖状态",
      "发现价格与动量的背离现象",
      "确认价格趋势的强度",
      "寻找潜在的反转点"
    ],
    macd: [
      "识别中长期趋势变化",
      "寻找金叉和死叉交易信号",
      "分析价格动量变化",
      "通过柱状图观察MACD线与信号线的关系"
    ],
    bb: [
      "衡量市场波动性",
      "识别超买超卖状态",
      "预测价格突破和趋势变化",
      "确定价格波动区间和潜在目标"
    ],
    volume: [
      "确认价格趋势的强度和有效性",
      "识别市场参与度和兴趣",
      "发现潜在的趋势反转（量价背离）",
      "分析主力资金流向"
    ]
  };
  
  // 初始化图表和所选指标
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
    
    // 添加主图表系列
    const mainSeries = chartRef.current.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
    });
    mainSeries.setData(lineChartData);
    
    // 根据选择的指标类型添加相应的指标
    if (chartRef.current) {
      switch (selectedIndicator) {
        case 'ma':
          // 添加移动平均线
          const ma5Data = calculateMovingAverage(lineChartData, 5);
          const ma20Data = calculateMovingAverage(lineChartData, 20);
          
          const ma5Series = chartRef.current.addLineSeries({
            color: '#FF6B35',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
          });
          ma5Series.setData(ma5Data);
          
          const ma20Series = chartRef.current.addLineSeries({
            color: '#06D6A0',
            lineWidth: 1,
            lineStyle: LineStyle.Dotted,
          });
          ma20Series.setData(ma20Data);
          break;
          
        case 'rsi':
          // 添加RSI指标
          const rsiData = calculateRSI(lineChartData, 14);
          
           // 创建RSI子图表容器
           const rsiContainer = document.createElement('div');
           rsiContainer.style.height = '150px';
           chartContainerRef.current.appendChild(rsiContainer);
           // 存储子图表引用以便后续清理
           (rsiContainer as any)._internal_chart = null;
          
           // 创建RSI图表
            const rsiChart = createChart(rsiContainer, {
              width: chartContainerRef.current.clientWidth,
              height: 150,
             layout: {
               backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
               textColor: isDark ? '#d1d4dc' : '#191919',
             },
             grid: {
               horzLines: {
                 color: isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
               },
               vertLines: {
                 color: isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
               },
             },
             timeScale: {
               visible: false,
             },
             rightPriceScale: {
               borderColor: isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)',
               scaleMargins: {
                 top: 0.1,
                 bottom: 0.1,
               },
             },
           });
           // 存储子图表引用
           (rsiContainer as any)._internal_chart = rsiChart;
          
          // 添加RSI线
          const rsiSeries = rsiChart.addLineSeries({
            color: '#FF6B35',
            lineWidth: 2,
          });
          rsiSeries.setData(rsiData);
          
          // 添加超买超卖水平线
          rsiChart.addLineSeries({
            color: '#ef5350',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
          }).setData(rsiData.map(item => ({ time: item.time, value: 70 })));
          
          rsiChart.addLineSeries({
            color: '#26a69a',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
          }).setData(rsiData.map(item => ({ time: item.time, value: 30 })));
          
          // 同步两个图表的时间轴
          chartRef.current.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (range && rsiChart) {
              rsiChart.timeScale().setVisibleRange(range);
            }
          });
          
          // 初始同步
          setTimeout(() => {
            if (rsiChart) {
              const range = chartRef.current?.timeScale().getVisibleRange();
              if (range) {
                rsiChart.timeScale().setVisibleRange(range);
              }
            }
          }, 100);
          break;
          
        case 'macd':
          // 添加MACD指标
          const macdResult = calculateMACD(lineChartData, 12, 26, 9);
          
           // 创建MACD子图表容器
           const macdContainer = document.createElement('div');
           macdContainer.style.height = '150px';
           chartContainerRef.current.appendChild(macdContainer);
           // 存储子图表引用以便后续清理
           (macdContainer as any)._internal_chart = null;
          
           // 创建MACD图表
            const macdChart = createChart(macdContainer, {
              width: chartContainerRef.current.clientWidth,
              height: 150,
             layout: {
               backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
               textColor: isDark ? '#d1d4dc' : '#191919',
             },
             grid: {
               horzLines: {
                 color: isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
               },
               vertLines: {
                 color: isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
               },
             },
             timeScale: {
               visible: false,
             },
             rightPriceScale: {
               borderColor: isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)',
               scaleMargins: {
                 top: 0.2,
                 bottom: 0.2,
               },
             },
           });
           // 存储子图表引用
           (macdContainer as any)._internal_chart = macdChart;
          
          // 添加MACD线
          const macdLineSeries = macdChart.addLineSeries({
            color: '#2962FF',
            lineWidth: 1,
          });
          macdLineSeries.setData(macdResult.macdLine);
          
          // 添加信号线
          const signalLineSeries = macdChart.addLineSeries({
            color: '#FF6B35',
            lineWidth: 1,
          });
          signalLineSeries.setData(macdResult.signalLine);
          
          // 添加直方图
          const histogramSeries = macdChart.addHistogramSeries({
            color: '#06D6A0',
            priceFormat: {
              type: 'price',
            },
          });
          
          // 为直方图设置颜色（基于正值和负值）
          const coloredHistogram = macdResult.histogram.map(item => {
            if (item.value === null) return item;
            return {
              ...item,
              color: item.value >= 0 ? '#26a69a' : '#ef5350'
            };
          });
          
          histogramSeries.setData(coloredHistogram);
          
          // 同步两个图表的时间轴
          chartRef.current.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (range && macdChart) {
              macdChart.timeScale().setVisibleRange(range);
            }
          });
          
          // 初始同步
          setTimeout(() => {
            if (macdChart) {
              const range = chartRef.current?.timeScale().getVisibleRange();
              if (range) {
                macdChart.timeScale().setVisibleRange(range);
              }
            }
          }, 100);
          break;
          
        case 'bb':
          // 计算布林带
          const calculateBollingerBands = (data: any[], period: number = 20, multiplier: number = 2) => {
            const result = {
              upper: [] as any[],
              middle: [] as any[],
              lower: [] as any[]
            };
            
            // 计算中轨（移动平均线）
            const smaData = calculateMovingAverage(data, period);
            
            // 计算标准差并生成上轨和下轨
            for (let i = 0; i < data.length; i++) {
              if (i < period - 1) {
                result.upper.push({ time: data[i].time, value: null });
                result.middle.push({ time: data[i].time, value: null });
                result.lower.push({ time: data[i].time, value: null });
              } else {
                // 计算标准差
                const slice = data.slice(i - period + 1, i + 1);
                const avg = smaData[i].value;
                const squaredDiffs = slice.map(item => Math.pow(item.value - avg, 2));
                const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
                const stdDev = Math.sqrt(avgSquaredDiff);
                
                // 计算上轨和下轨
                result.upper.push({ time: data[i].time, value: avg + (multiplier * stdDev) });
                result.middle.push({ time: data[i].time, value: avg });
                result.lower.push({ time: data[i].time, value: avg - (multiplier * stdDev) });
              }
            }
            
            return result;
          };
          
          // 添加布林带
          const bbResult = calculateBollingerBands(lineChartData);
          
          // 添加中轨
          const middleBandSeries = chartRef.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 1,
          });
          middleBandSeries.setData(bbResult.middle);
          
          // 添加上轨
          const upperBandSeries = chartRef.current.addLineSeries({
            color: '#FF6B35',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
          });
          upperBandSeries.setData(bbResult.upper);
          
          // 添加下轨
          const lowerBandSeries = chartRef.current.addLineSeries({
            color: '#06D6A0',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
          });
          lowerBandSeries.setData(bbResult.lower);
          break;
          
        case 'volume':
          // 添加交易量指标
          const volumeData = lineChartData.map(item => ({
            time: item.time,
            value: Math.floor(Math.random() * 10000) + 1000, // 模拟交易量数据
          }));
          
          // 添加交易量系列
          const volumeSeries = chartRef.current.addHistogramSeries({
            color: '#2962FF',
            priceFormat: {
              type: 'volume',
            },
            scaleMargins: {
              top: 0.8,
              bottom: 0,
            },
          });
          
          // 根据价格涨跌设置交易量柱子颜色
          const coloredVolumeData = lineChartData.map((item, index) => ({
            time: item.time,
            value: Math.floor(Math.random() * 10000) + 1000,
            // 如果当前价格高于前一个价格，使用绿色；否则使用红色
            color: index > 0 && item.value > lineChartData[index - 1].value 
              ? '#26a69a' 
              : index > 0 && item.value < lineChartData[index - 1].value
              ? '#ef5350'
              : '#2962FF'
          }));
          
          volumeSeries.setData(coloredVolumeData);
          break;
      }
    }
    
    // 调整视图以适应内容
    chartRef.current.timeScale().fitContent();
    
    // 处理窗口大小调整
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: 400
        });
        
        // 调整子图表大小（如果有）
        try {
          const childCharts = chartContainerRef.current.querySelectorAll('div:not(:first-child)');
          childCharts.forEach((chart) => {
            // 使用更安全的方式访问子图表实例
            const chartInstance = (chart as any)._internal_chart || null;
            if (chartInstance && typeof chartInstance.applyOptions === 'function') {
              chartInstance.applyOptions({
                width: chartContainerRef.current!.clientWidth,
                height: chart.clientHeight
              });
            }
          });
        } catch (error) {
          console.error('调整子图表大小时出错:', error);
        }
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
       
       // 清理所有子图表
       while (chartContainerRef.current && chartContainerRef.current.children.length > 1) {
         chartContainerRef.current.removeChild(chartContainerRef.current.lastChild!);
       }
    };
  }, [selectedIndicator, isDark]);
  
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
        <h1 className="text-3xl font-bold mb-4">技术指标</h1>
        <p className={cn("text-lg", isDark ? "text-gray-300" : "text-gray-600")}>
          学习如何在TradingView Lightweight Charts中实现和使用各种技术分析指标，帮助您进行更深入的市场分析。
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* 指标类型选择 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['ma', 'rsi', 'macd', 'bb', 'volume'] as const).map((indicator) => (
              <button
                key={indicator}
                onClick={() => setSelectedIndicator(indicator)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedIndicator === indicator
                    ? isDark 
                      ? "bg-blue-900/40 text-blue-400 border border-blue-700" 
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                    : isDark 
                      ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-750" 
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                )}
              >
                {indicatorTypeLabels[indicator]}
              </button>
            ))}
          </div>
          
          {/* 图表显示容器 */}
          <div 
            className={cn(
              "rounded-16 overflow-hidden shadow-lg border",
              isDark 
                ? "border-gray-700 shadow-gray-900/30" 
                : "border-gray-100 shadow-gray-100/50"
            )}
          >
            <div 
              ref={chartContainerRef} 
              className="w-full"
              style={{ 
                // 根据是否有子图表调整高度
                height: selectedIndicator === 'rsi' || selectedIndicator === 'macd' ? '550px' : '400px' 
              }}
            ></div>
          </div>
        </div>
        
        <div>
          {/* 指标说明和代码示例 */}
          <div 
            className={cn(
              "rounded-16 p-6 h-full flex flex-col",
              isDark 
                ? "bg-gray-800 border border-gray-700" 
                : "bg-white border border-gray-100 shadow-sm"
            )}
          >
            <h2 className="text-xl font-bold mb-3">{indicatorTypeLabels[selectedIndicator]}</h2>
            <p className={cn("mb-6 flex-grow", isDark ? "text-gray-300" : "text-gray-600")}>
              {indicatorDescriptions[selectedIndicator]}
            </p>
            <CodeExample 
              code={indicatorCodeExamples[selectedIndicator]} 
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
          {indicatorUseCases[selectedIndicator].map((useCase, index) => (
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
        <h2 className="text-xl font-bold mb-4">技术指标实现提示</h2>
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
              大多数技术指标都需要一定数量的历史数据才能开始计算，确保为指标提供足够的数据点。
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
              对于需要在单独图表中显示的指标（如RSI、MACD），可以创建多个图表实例并同步它们的时间轴。
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
              实时更新指标时，注意性能优化，避免不必要的重复计算，特别是对于计算密集型指标。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TechnicalIndicatorsPage;