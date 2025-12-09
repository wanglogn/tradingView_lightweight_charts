import { useEffect, useRef } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi, 
  LineStyle, 
  CrosshairMode,
  Time
} from 'lightweight-charts';
import { useTheme } from '../hooks/useTheme';
import { lineChartData, areaChartData, barChartData, candlestickChartData, histogramChartData, multipleLinesData, baselineChartData } from '../data/mockData';

interface ChartDisplayProps {
  type: 'line' | 'area' | 'bar' | 'candlestick' | 'histogram' | 'multiple-lines' | 'baseline';
  width: number;
  height: number;
  data?: any[];
  isDark?: boolean;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ 
  type, 
  width, 
  height, 
  data,
  isDark: propIsDark
}) => {
  // 优先使用传入的isDark属性，如果没有则使用useTheme的isDark
  const { isDark: contextIsDark } = useTheme();
  const effectiveIsDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const secondarySeriesRef = useRef<ISeriesApi<any> | null>(null);
  const tertiarySeriesRef = useRef<ISeriesApi<any> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // 清理之前的图表实例
    if (chartRef.current) {
      chartRef.current.remove();
    }
    
    // 创建新的图表实例
    chartRef.current = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        backgroundColor: effectiveIsDark ? '#1e1e1e' : '#ffffff',
        textColor: effectiveIsDark ? '#d1d4dc' : '#191919',
      },
      grid: {
        vertLines: {
          color: effectiveIsDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
        },
        horzLines: {
          color: effectiveIsDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
        },
      },
      rightPriceScale: {
        borderColor: effectiveIsDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)',
      },
      timeScale: {
        borderColor: effectiveIsDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)',
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });
    
    // 根据图表类型添加相应的系列
    switch (type) {
      case 'line':
        seriesRef.current = chartRef.current.addLineSeries({
          color: '#2962FF',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          lastValueVisible: true,
        });
        seriesRef.current.setData(data || lineChartData);
        break;
        
      case 'area':
        seriesRef.current = chartRef.current.addAreaSeries({
          topColor: 'rgba(41, 98, 255, 0.2)',
          bottomColor: 'rgba(41, 98, 255, 0)',
          lineColor: '#2962FF',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          lastValueVisible: true,
        });
        seriesRef.current.setData(data || areaChartData);
        break;
        
      case 'bar':
        seriesRef.current = chartRef.current.addBarSeries({
          color: '#2962FF',
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          crosshairMarkerVisible: true,
          lastValueVisible: true,
        });
        seriesRef.current.setData(data || barChartData);
        break;
        
      case 'candlestick':
        // 添加蜡烛图系列 - 按照TradingView官方文档标准实现
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: 'rgba(38, 166, 154, 0.8)',     // 上涨颜色 - 绿色
          downColor: 'rgba(239, 83, 80, 0.8)',   // 下跌颜色 - 红色
          borderColor: 'rgba(38, 166, 154, 1)', // 上涨边框颜色
          borderDownColor: 'rgba(239, 83, 80, 1)', // 下跌边框颜色
          wickColor: 'rgba(38, 166, 154, 0.6)',     // 烛芯颜色 - 灰色
          wickDownColor: 'rgba(239, 83, 80, 0.6)', // 下跌烛芯颜色 - 灰色
          borderVisible: false,   // 显示边框
          wickVisible: true,     // 显示烛芯
          crosshairMarkerVisible: true,
          lastValueVisible: true,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        
        // 使用原始的OHLC数据格式
        let ohlcData = data || candlestickChartData;
        
        // 增强数据以确保蜡烛图形态更加明显 - 大幅增强蜡烛体和烛芯
        ohlcData = ohlcData.map((item: any) => {
          // 确保蜡烛体有足够高度 - 显著增加蜡烛体高度
          const volatility = item.open * 0.25; // 大幅增加波动性
          if (Math.abs(item.close - item.open) < item.open * 0.15) {
            if (Math.random() > 0.5) {
              // 上涨情况
              item.close = item.open + volatility * (0.6 + Math.random() * 0.4);
            } else {
              // 下跌情况
              item.close = item.open - volatility * (0.6 + Math.random() * 0.4);
            }
          }
          
          // 确保烛芯有足够长度 - 显著增加烛芯长度
          const wickExtension = volatility * (0.8 + Math.random() * 1.2);
          item.high = Math.max(item.open, item.close) + wickExtension;
          item.low = Math.min(item.open, item.close) - wickExtension;
          
          // 确保高低价范围足够大
          const range = item.high - item.low;
          if (range < volatility * 3.0) {
            const extension = (volatility * 3.0 - range) / 2;
            item.high += extension;
            item.low -= extension;
          }
          
          return item;
        });
        
        // 设置数据
        seriesRef.current.setData(ohlcData);
       
        // 添加交易量系列 - 按照官方文档示例
        volumeSeriesRef.current = chartRef.current.addHistogramSeries({
          priceScaleId: 'volume',   
          color: '#2962FF',
          priceFormat: {
            type: 'volume',
          },
          scaleMargins: {
            top: 0.8,   // 给蜡烛图留出更多空间
            bottom: 0,
          },
        });
        
        // 根据蜡烛图的涨跌设置交易量柱子颜色
        volumeSeriesRef.current.setData(ohlcData.map((item: any) => ({
          time: item.time,
          value: item.volume,
          color: item.close >= item.open ? 'rgba(38, 166, 154, 0.6)' : 'rgba(239, 83, 80, 0.6)'
        })));
        
        // 按照官方文档的推荐配置 - 增加图表高度，使蜡烛图形态更清晰
        chartRef.current.applyOptions({
          height: height + 150, // 大幅增加高度以更好地显示蜡烛图细节
          layout: {
            backgroundColor: effectiveIsDark ? '#1e1e1e' : '#ffffff',
            textColor: effectiveIsDark ? '#d1d4dc' : '#191919',
          },
          grid: {
            vertLines: {
              color: effectiveIsDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
              visible: true,
            },
            horzLines: {
              color: effectiveIsDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
              visible: true,
            },
          },
          rightPriceScale: {
            borderColor: effectiveIsDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)',
            scaleMargins: {
              top: 0.1, // 增加顶部边距，更好地显示蜡烛图
              bottom: 0.2, // 增加底部边距
            },
          },
          priceScale: {
            borderVisible: false,
          },
          timeScale: {
            borderColor: effectiveIsDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)',
            fixLeftEdge: true,
            barSpacing: 6, // 增加柱间距，使蜡烛图更清晰
            minBarSpacing: 2, // 调整最小柱间距
          },
        });
        chartRef.current.priceScale('volume').applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
        
        // 适应内容
        chartRef.current.timeScale().fitContent();
        break;
        
      case 'histogram':
        seriesRef.current = chartRef.current.addHistogramSeries({
          color: '#2962FF',
          lineWidth: 1,
          crosshairMarkerVisible: true,
          lastValueVisible: true,
        });
        seriesRef.current.setData(data || histogramChartData);
        break;
        
      case 'multiple-lines':
        // 添加多条线
        if (multipleLinesData.line1) {
          seriesRef.current = chartRef.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            crosshairMarkerVisible: true,
            lastValueVisible: true,
            title: '线1',
          });
          seriesRef.current.setData(multipleLinesData.line1);
          
          secondarySeriesRef.current = chartRef.current.addLineSeries({
            color: '#FF6B35',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            crosshairMarkerVisible: true,
            lastValueVisible: true,
            title: '线2',
          });
          secondarySeriesRef.current.setData(multipleLinesData.line2);
          
          tertiarySeriesRef.current = chartRef.current.addLineSeries({
            color: '#06D6A0',
            lineWidth: 2,
            lineStyle: LineStyle.Dotted,
            crosshairMarkerVisible: true,
            lastValueVisible: true,
            title: '线3',
          });
          tertiarySeriesRef.current.setData(multipleLinesData.line3);
        }
        break;

      case 'baseline':
        // 添加基准图系列
        const baselineChartDataValue = data || baselineChartData;
        
        // 计算基准值（使用数据的平均值）
        const baselineValue = baselineChartDataValue.reduce((sum, item: any) => sum + item.value, 0) / baselineChartDataValue.length;
        
        // 添加主系列 - 基于TradingView的基准图实现
        seriesRef.current = chartRef.current.addAreaSeries({
          topColor: 'rgba(41, 98, 255, 0.2)',
          bottomColor: 'rgba(41, 98, 255, 0)',
          lineColor: '#2962FF',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          lastValueVisible: true,
        });
        seriesRef.current.setData(baselineChartDataValue);
        
        // 创建基准线数据
        const baselineLineData = baselineChartDataValue.map((item: any) => ({
          time: item.time,
          value: baselineValue
        }));
        
        // 添加基准线系列
        secondarySeriesRef.current = chartRef.current.addLineSeries({
          color: '#FF6B35',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          lastValueVisible: true,
          crosshairMarkerVisible: true,
          title: '基准线'
        });
        secondarySeriesRef.current.setData(baselineLineData);
        
        // 创建填充区域（高于基准线）
        tertiarySeriesRef.current = chartRef.current.addAreaSeries({
          topColor: 'rgba(255, 107, 53, 0.1)',
          bottomColor: 'rgba(255, 107, 53, 0)',
          lineColor: 'rgba(255, 107, 53, 0)', // 隐藏线条
          lineWidth: 0,
        });
        
        // 准备高于基准线的数据
        const aboveBaselineData = baselineChartDataValue.map((item: any) => ({
          time: item.time,
          value: Math.max(item.value, baselineValue)
        }));
        tertiarySeriesRef.current.setData(aboveBaselineData);
        break;
        
      default:
        break;
    }
    
    // 调整图表以适应所有数据
    chartRef.current.timeScale().fitContent();
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth || width,
          height: height
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
        volumeSeriesRef.current = null;
        secondarySeriesRef.current = null;
        tertiarySeriesRef.current = null;
      }
    };
  }, [type, width, height, effectiveIsDark, data]);
  
  // 创建一个包装器div来确保ChartDisplay组件有正确的尺寸
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default ChartDisplay;