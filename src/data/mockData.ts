// 增加数据量到原来的10倍
import { Time } from "lightweight-charts";

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
      volume: Math.floor(Math.random() * 10000) + 1000,
    });
  }
  
  return data;
};

// 生成OHLC数据函数 - 专门优化为清晰的蜡烛图形态
const generateOHLCData = (count: number, startDate: Date = new Date()) => {
  const data = [];
  let open = 50;
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    
    // 随机生成OHLC数据 - 重点确保蜡烛图形态非常清晰可见
    const volatility = open * 0.15; // 大幅增加波动性以确保蜡烛图形态清晰
    
    // 随机决定是上涨还是下跌
    const isUp = Math.random() > 0.5;
    
    // 确保蜡烛体有足够高度，清晰区分开盘和收盘价
    let close = isUp 
      ? open + (0.5 + Math.random() * 0.5) * volatility // 上涨时蜡烛体非常明显
      : open - (0.5 + Math.random() * 0.5) * volatility; // 下跌时蜡烛体非常明显
    
    // 确保烛芯长度足够，明显区分最高价和最低价
    let high = Math.max(open, close) + (0.8 + Math.random() * 1.2) * volatility; // 非常长的烛芯
    let low = Math.min(open, close) - (0.8 + Math.random() * 1.2) * volatility;  // 非常长的烛芯
    
    // 确保高低价范围足够大，清晰显示烛芯
    const range = high - low;
    if (range < volatility * 3.0) { // 增加最小范围要求
      const extension = (volatility * 3.0 - range) / 2;
      high += extension;
      low -= extension;
    }
    
    // 保证蜡烛体有足够的高度，确保不是柱状图效果
    const bodyHeight = Math.abs(close - open);
    if (bodyHeight < volatility * 0.6) {
      // 如果蜡烛体太窄，显著增加开盘收盘价之间的差距
      const gap = volatility * 0.6;
      if (isUp) {
        const newClose = open + gap;
        high = Math.max(high, newClose + volatility * 0.8);
        close = newClose;
      } else {
        const newClose = open - gap;
        low = Math.min(low, newClose - volatility * 0.8);
        close = newClose;
      }
    }
    
    data.push({
      time: Math.floor(date.getTime() / 1000) as Time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 20000) + 2000, // 更大的交易量范围
    });
    
    // 下一个开盘价基于当前收盘价，创建一些趋势但保持随机性
    const trendFactor = i % 5 === 0 ? (Math.random() - 0.5) * volatility * 2.0 : 0;
    open = close + trendFactor + (Math.random() - 0.5) * volatility * 0.5;
  }
  
  return data;
};

// 生成多个数据集
const generateMultipleLineData = (count: number, startDate: Date = new Date()) => {
  const baseData = generateRandomData(count, startDate);
  
  return {
    line1: baseData.map(item => ({ time: item.time, value: item.value })),
    line2: baseData.map(item => ({ time: item.time, value: item.value * (0.8 + Math.random() * 0.4) })),
    line3: baseData.map(item => ({ time: item.time, value: item.value * (0.6 + Math.random() * 0.4) })),
  };
};

// 导出数据 - 增加数据量到原来的10倍
export const lineChartData = generateRandomData(1000);
export const areaChartData = generateRandomData(1000);
export const barChartData = generateOHLCData(1000);
export const candlestickChartData = generateOHLCData(1000);
export const histogramChartData = generateRandomData(1000);
export const multipleLinesData = generateMultipleLineData(1000);

// 基准图数据
export const baselineChartData = generateRandomData(1000);

// 交易量数据（用于蜡烛图下方）
export const volumeData = generateRandomData(1000).map(item => ({
  time: item.time,
  value: item.volume
}));