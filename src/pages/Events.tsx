import { useState, useEffect, useRef, useContext } from "react";
import CodeExample from "@/components/CodeExample";
import { lineChartData } from "@/data/mockData";
import { ThemeContext } from "@/contexts/themeContext";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";

const EventsPage = () => {
  // 使用useTheme hook获取主题状态
  const { isDark } = useTheme();
  
  // 监听全局主题变化事件
  useEffect(() => {
    const handleThemeChange = () => {
      // 强制重新渲染以应用新主题
      setSelectedEvent(prev => prev);
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  // 扩展事件类型以包含TradingView Lightweight Charts支持的所有事件
  const [selectedEvent, setSelectedEvent] = useState<'click' | 'hover' | 'crosshair' | 'timeScale' | 'mouseDown' | 'mouseUp' | 'visibleRangeChange' | 'viewportChange' | 'doubleClick'>('click');
  const [eventLog, setEventLog] = useState<string[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  // 添加引用存储事件订阅，以便在组件卸载或事件类型变化时正确取消订阅
  const subscriptionRefs = useRef<Array<() => void>>([]);
  
  // 中文事件类型名称映射
  const eventTypeLabels: Record<string, string> = {
    click: "点击事件",
    hover: "悬停事件",
    crosshair: "十字光标事件",
    timeScale: "时间轴事件",
    mouseDown: "鼠标按下事件",
    mouseUp: "鼠标释放事件",
    visibleRangeChange: "可见范围变化事件",
    viewportChange: "视口变化事件",
    doubleClick: "双击事件"
  };
  
  // 事件详细说明 - 扩展为所有TradingView Lightweight Charts支持的事件
  const eventDescriptions = {
    click: "捕获图表上的点击事件，获取被点击点的信息，包括时间和价格数据。这对于实现交互式功能如添加标记、显示详情弹窗等非常有用。",
    hover: "跟踪鼠标在图表上的移动，显示额外信息或根据光标位置触发操作。可以用来实现数据提示、高亮显示等交互效果。",
    crosshair: "响应十字光标的移动，更新外部UI元素或根据所选数据点执行计算。这是实现自定义工具提示和实时数据分析的基础。",
    timeScale: "监听时间轴变化事件，当用户缩放或平移图表时更新相关数据或UI元素。这对于实现动态数据加载、自适应UI等功能非常重要。",
    mouseDown: "捕获鼠标在图表上按下的事件，可以用于实现拖动操作、选择区域等高级交互功能。",
    mouseUp: "捕获鼠标在图表上释放的事件，通常与mouseDown事件配合使用，以实现完整的拖拽交互流程。",
    visibleRangeChange: "监听图表可见数据范围的变化，当用户缩放、平移或调整窗口大小时触发。这对于实现数据懒加载、动态聚合等功能非常有用。",
    viewportChange: "监听整个图表视口的变化，包括图表大小和位置的变化。这对于实现响应式设计、自适应布局等功能非常重要。",
    doubleClick: "捕获图表上的双击事件，可以用于实现快速重置视图、放大到特定区域等快捷操作。"
  };
  
  // 代码示例（中文注释）
  const eventCodeExamples = {
    click: `// 为图表添加点击事件监听器
chart.subscribeClick(param => {
  if (!param.point) {
    // 点击在图表区域外
    return;
  }
  
  // 获取点击位置的时间和价格
  const time = param.time;
  const price = param.seriesPrices.get(series);
  
  if (price !== undefined) {
    console.log('点击时间:', time, '价格:', price);
    // 在这里可以实现点击后的逻辑，如添加标记、显示详情等
  }
});`,
    
    hover: `// 为图表添加悬停事件监听器
chart.subscribeCrosshairMove(param => {
  if (!param.point) {
    // 鼠标移出图表区域
    return;
  }
  
  // 获取光标位置的时间和价格
  const time = param.time;
  const price = param.seriesPrices.get(series);
  
  if (price !== undefined) {
    console.log('悬停时间:', time, '价格:', price);
    // 在这里可以实现悬停时的逻辑，如显示数据提示等
  }
});`,
    
    crosshair: `// 添加十字光标移动事件监听器以更新外部UI
chart.subscribeCrosshairMove(param => {
  const tooltipElement = document.getElementById('tooltip');
  
  if (tooltipElement) {
    if (param.point && param.time && param.seriesPrices.get(series) !== undefined) {
      // 显示并更新工具提示
      tooltipElement.style.display = 'block';
      tooltipElement.style.left = \`\${param.point.x}px\`;
      tooltipElement.style.top = \`\${param.point.y}px\`;
      tooltipElement.innerHTML = \`
        <div>时间: \${new Date(param.time * 1000).toLocaleString()}</div>
        <div>价格: \${param.seriesPrices.get(series)}</div>
      \`;
    } else {
      // 当鼠标离开图表时隐藏工具提示
      tooltipElement.style.display = 'none';
    }
  }
});`,
    
    timeScale: `// 添加时间轴变化事件监听器
chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
  console.log('可见范围已更改:', range);
  
  // 获取实际的时间范围
  const visibleTimeRange = chart.timeScale().getVisibleRange();
  
  if (visibleTimeRange) {
    console.log('开始时间:', visibleTimeRange.from);
    console.log('结束时间:', visibleTimeRange.to);
    
    // 您可以在这里根据可见时间范围获取更多数据或更新其他UI元素
    // 例如实现动态数据加载
  }
});`,

    mouseDown: `// 添加鼠标按下事件监听器
chart.subscribeMouseDown(param => {
  if (!param.point) {
    // 鼠标按下在图表区域外
    return;
  }
  
  const time = param.time;
  const price = param.seriesPrices.get(series);
  
  console.log('鼠标按下位置:', param.point.x, param.point.y);
  if (price !== undefined) {
    console.log('按下时间:', time, '价格:', price);
    // 在这里可以实现拖动开始的逻辑，如选择区域、移动标记等
  }
});`,

    mouseUp: `// 添加鼠标释放事件监听器
chart.subscribeMouseUp(param => {
  if (!param.point) {
    // 鼠标释放在图表区域外
    return;
  }
  
  const time = param.time;
  const price = param.seriesPrices.get(series);
  
  console.log('鼠标释放位置:', param.point.x, param.point.y);
  if (price !== undefined) {
    console.log('释放时间:', time, '价格:', price);
    // 在这里可以实现拖动结束的逻辑，如确认选择区域、完成标记移动等
  }
});`,

    visibleRangeChange: `// 添加可见范围变化事件监听器
chart.timeScale().subscribeVisibleTimeRangeChange(range => {
  console.log('可见时间范围已更改:', range);
  
  if (range) {
    const startTime = new Date(range.from * 1000).toLocaleString();
    const endTime = new Date(range.to * 1000).toLocaleString();
    
    console.log('开始时间:', startTime);
    console.log('结束时间:', endTime);
    
    // 在这里可以实现根据新的时间范围加载数据的逻辑
    // loadMoreData(range.from, range.to);
  }
});`,

    viewportChange: `// 添加视口变化事件监听器
chart.subscribeViewportChange(() => {
  const visibleRange = chart.timeScale().getVisibleRange();
  const size = chart.size();
  
  console.log('视口已更改:');
  console.log('  可见范围:', visibleRange);
  console.log('  图表尺寸:', size);
  
  // 在这里可以实现响应式布局调整或其他视口相关的逻辑
});`,

    doubleClick: `// 添加双击事件监听器
chart.subscribeDoubleClick(param => {
  if (!param.point) {
    // 双击在图表区域外
    return;
  }
  
  console.log('双击位置:', param.point.x, param.point.y);
  
  // 常见的双击行为是重置视图或放大到特定区域
  // 例如: chart.timeScale().fitContent();
  // 或者: 如果双击在某个数据点上，可以放大到该点附近
});`
  };
  
  // 事件参数说明
  const eventParams = {
    click: [
      { name: "param.point", desc: "点击的坐标点，包含x和y属性" },
      { name: "param.time", desc: "点击位置对应的时间戳" },
      { name: "param.seriesPrices", desc: "一个Map对象，包含每个系列在点击位置的价格值" }
    ],
    hover: [
      { name: "param.point", desc: "光标位置的坐标点" },
      { name: "param.time", desc: "光标位置对应的时间戳" },
      { name: "param.seriesPrices", desc: "一个Map对象，包含每个系列在光标位置的价格值" }
    ],
    crosshair: [
      { name: "param.point", desc: "十字光标位置的坐标点" },
      { name: "param.time", desc: "十字光标位置对应的时间戳" },
      { name: "param.seriesPrices", desc: "一个Map对象，包含每个系列在十字光标位置的价格值" }
    ],
    timeScale: [
      { name: "range", desc: "包含from和to属性，表示当前可见的逻辑范围" },
      { name: "visibleTimeRange", desc: "通过chart.timeScale().getVisibleRange()获取，包含实际的时间范围" }
    ],
    mouseDown: [
      { name: "param.point", desc: "鼠标按下位置的坐标点" },
      { name: "param.time", desc: "鼠标按下位置对应的时间戳" },
      { name: "param.seriesPrices", desc: "一个Map对象，包含每个系列在鼠标按下位置的价格值" }
    ],
    mouseUp: [
      { name: "param.point", desc: "鼠标释放位置的坐标点" },
      { name: "param.time", desc: "鼠标释放位置对应的时间戳" },
      { name: "param.seriesPrices", desc: "一个Map对象，包含每个系列在鼠标释放位置的价格值" }
    ],
    visibleRangeChange: [
      { name: "range", desc: "包含from和to属性，表示当前可见的时间范围" },
      { name: "visibleLogicalRange", desc: "通过chart.timeScale().getVisibleLogicalRange()获取，表示逻辑范围" }
    ],
    viewportChange: [
      { name: "chart.size()", desc: "获取当前图表的尺寸，包含width和height属性" },
      { name: "visibleTimeRange", desc: "通过chart.timeScale().getVisibleRange()获取，表示当前可见的时间范围" }
    ],
    doubleClick: [
      { name: "param.point", desc: "双击位置的坐标点" },
      { name: "param.time", desc: "双击位置对应的时间戳" },
      { name: "param.seriesPrices", desc: "一个Map对象，包含每个系列在双击位置的价格值" }
    ]
  };
  
  // 使用场景
  const eventUseCases = {
    click: [
      "实现点击添加标记或注释功能",
      "点击查看数据点的详细信息",
      "实现图表上的交互操作，如选择区间",
      "创建自定义的交互工具"
    ],
    hover: [
      "显示详细的数据提示信息",
      "高亮显示相关的数据点或区域",
      "提供上下文相关的操作建议",
      "实现数据点的快速预览"
    ],
    crosshair: [
      "创建自定义的、样式丰富的工具提示",
      "实时计算和显示技术指标值",
      "实现多数据点的对比分析",
      "显示交叉点的详细统计信息"
    ],
    timeScale: [
      "实现无限滚动和动态数据加载",
      "根据可见范围自动调整数据精度",
      "实现基于时间范围的数据聚合",
      "同步多个图表的时间范围"
    ],
    mouseDown: [
      "实现拖动开始的逻辑，如选择区域",
      "开始移动图表上的标记或注释",
      "实现自定义的缩放交互",
      "创建复杂的拖拽操作"
    ],
    mouseUp: [
      "完成拖动操作，确认选择区域",
      "完成标记或注释的移动",
      "结束自定义的交互操作",
      "触发基于拖拽的数据分析"
    ],
    visibleRangeChange: [
      "实现数据的懒加载和动态加载",
      "根据时间范围调整数据的聚合级别",
      "更新侧边栏或详情面板中的数据",
      "实现基于时间范围的过滤功能"
    ],
    viewportChange: [
      "实现响应式图表布局",
      "调整图表组件的大小和位置",
      "优化移动设备上的用户体验",
      "实现自定义的图表容器交互"
    ],
    doubleClick: [
      "快速重置图表视图",
      "放大到特定的数据点或区域",
      "触发详细数据的显示",
      "实现快捷操作和快捷键替代"
    ]
  };
  
  // 添加日志条目
  const addLogEntry = (entry: string) => {
    setEventLog(prev => [entry, ...prev.slice(0, 9)]); // 只保留最近10条记录
  };

  // 清理所有事件订阅
  const cleanupSubscriptions = () => {
    subscriptionRefs.current.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    subscriptionRefs.current = [];
  };
  
  // 初始化带事件监听器的图表
  useEffect(() => {
    // 清空事件日志
    setEventLog([]);
    
    if (!chartContainerRef.current) return;
    
    // 清理之前的图表和订阅
    cleanupSubscriptions();
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
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
        horzLines: {color: isDark ? 'rgba(42, 46, 57, 0.5)' : 'rgba(180, 184, 194, 0.2)',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)',
      },
      timeScale: {
        borderColor: isDark ? 'rgba(42, 46, 57, 0.8)' : 'rgba(180, 184, 194, 0.8)',
      },
    });
    
    // 添加系列
    seriesRef.current = chartRef.current.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
    });
    
    // 设置数据
    seriesRef.current.setData(lineChartData);
    
    // 根据选择的事件类型添加事件监听器
    if (chartRef.current && seriesRef.current) {
      // 存储取消订阅函数
      let unsubscribeFn: () => void;
      
      // 点击事件
      if (selectedEvent === 'click') {
        // 确保subscribeClick方法存在
        if (typeof chartRef.current.subscribeClick === 'function') {
          unsubscribeFn = chartRef.current.subscribeClick(param => {
            if (param.point && param.seriesPrices.get(seriesRef.current!) !== undefined) {
              const time = param.time;
              const price = param.seriesPrices.get(seriesRef.current!);
              const formattedTime = new Date(time * 1000).toLocaleString();
              addLogEntry(`点击于 ${formattedTime}: ${price}`);
            }
          });
          subscriptionRefs.current.push(unsubscribeFn);
        } else {
          console.warn('当前版本的 Lightweight Charts 不支持 subscribeClick 方法');
        }
      }
      
      // 悬停/十字光标事件
      if (selectedEvent === 'hover' || selectedEvent === 'crosshair') {
        // 确保subscribeCrosshairMove方法存在
        if (typeof chartRef.current.subscribeCrosshairMove === 'function') {
          unsubscribeFn = chartRef.current.subscribeCrosshairMove(param => {
            if (param.point && param.time && param.seriesPrices.get(seriesRef.current!) !== undefined) {
              const time = param.time;
              const price = param.seriesPrices.get(seriesRef.current!);
              const formattedTime = new Date(time * 1000).toLocaleString();
              
              if (selectedEvent === 'crosshair') {
                // 对于十字光标，我们记录事件
                addLogEntry(`十字光标于 ${formattedTime}: ${price}`);
              }
              // 对于hover事件，为了不过载日志，我们不记录每个悬停事件
            }
          });
          subscriptionRefs.current.push(unsubscribeFn);
        } else {
          console.warn('当前版本的 Lightweight Charts 不支持 subscribeCrosshairMove 方法');
        }
      }
      
      // 时间轴事件
      if (selectedEvent === 'timeScale') {
        // 确保timeScale().subscribeVisibleLogicalRangeChange方法存在
        if (chartRef.current.timeScale && typeof chartRef.current.timeScale().subscribeVisibleLogicalRangeChange === 'function') {
          unsubscribeFn = chartRef.current.timeScale().subscribeVisibleLogicalRangeChange(() => {
            try {
              const visibleRange = chartRef.current!.timeScale().getVisibleRange();
              if (visibleRange) {
                const startTime = new Date(visibleRange.from * 1000).toLocaleDateString();
                const endTime = new Date(visibleRange.to * 1000).toLocaleDateString();
                addLogEntry(`时间范围已更改: ${startTime} - ${endTime}`);
              }
            } catch (error) {
              console.error('获取时间范围时出错:', error);
            }
          });
          subscriptionRefs.current.push(unsubscribeFn);
        } else {
          console.warn('当前版本的 Lightweight Charts 不支持 timeScale().subscribeVisibleLogicalRangeChange 方法');
        }
      }

      // 鼠标按下事件
      if (selectedEvent === 'mouseDown') {
        // 检查 subscribeMouseDown 方法是否存在
        if (typeof (chartRef.current as any).subscribeMouseDown === 'function') {
          unsubscribeFn = (chartRef.current as any).subscribeMouseDown(param => {
            if (param.point && param.seriesPrices.get(seriesRef.current!) !== undefined) {
              const time = param.time;
              const price = param.seriesPrices.get(seriesRef.current!);
              const formattedTime = new Date(time * 1000).toLocaleString();
              addLogEntry(`鼠标按下于 ${formattedTime}: ${price} (x: ${param.point.x}, y: ${param.point.y})`);
            }
          });
          subscriptionRefs.current.push(unsubscribeFn);
        } else {
          console.warn('当前版本的 Lightweight Charts 不支持 subscribeMouseDown 方法');
        }
      }

     // 鼠标释放事件
     if (selectedEvent === 'mouseUp') {
       // 检查 subscribeMouseUp 方法是否存在
       if (typeof (chartRef.current as any).subscribeMouseUp === 'function') {
         unsubscribeFn = (chartRef.current as any).subscribeMouseUp(param => {
           if (param.point && param.seriesPrices.get(seriesRef.current!) !== undefined) {
             const time = param.time;
             const price = param.seriesPrices.get(seriesRef.current!);
             const formattedTime = new Date(time * 1000).toLocaleString();
             addLogEntry(`鼠标释关于 ${formattedTime}: ${price} (x: ${param.point.x}, y: ${param.point.y})`);
           }
         });
         subscriptionRefs.current.push(unsubscribeFn);
       } else {
         console.warn('当前版本的 Lightweight Charts 不支持 subscribeMouseUp 方法');
       }
     }

      // 可见范围变化事件
      if (selectedEvent === 'visibleRangeChange') {
        // 确保timeScale().subscribeVisibleTimeRangeChange方法存在
        if (chartRef.current.timeScale && typeof chartRef.current.timeScale().subscribeVisibleTimeRangeChange === 'function') {
          unsubscribeFn = chartRef.current.timeScale().subscribeVisibleTimeRangeChange(range => {
            if (range) {
              const startTime = new Date(range.from * 1000).toLocaleString();
              const endTime = new Date(range.to * 1000).toLocaleString();
              addLogEntry(`可见时间范围已更改: ${startTime} - ${endTime}`);
            }
          });
          subscriptionRefs.current.push(unsubscribeFn);
        } else {
          console.warn('当前版本的 Lightweight Charts 不支持 timeScale().subscribeVisibleTimeRangeChange 方法');
        }
      }

      // 视口变化事件
      if (selectedEvent === 'viewportChange') {
        // 确保subscribeViewportChange方法存在
        if (typeof chartRef.current.subscribeViewportChange === 'function') {
          unsubscribeFn = chartRef.current.subscribeViewportChange(() => {
            try {
              const visibleRange = chartRef.current?.timeScale().getVisibleRange();
              const size = chartRef.current?.size();
              
              if (visibleRange && size) {
                const startTime = new Date(visibleRange.from * 1000).toLocaleDateString();
                const endTime = new Date(visibleRange.to * 1000).toLocaleDateString();
                addLogEntry(`视口已更改: ${startTime} - ${endTime} (尺寸: ${size.width}x${size.height})`);
              }
            } catch (error) {
              console.error('获取视口信息时出错:', error);
            }
          });
          subscriptionRefs.current.push(unsubscribeFn);
        } else {
          console.warn('当前版本的 Lightweight Charts 不支持 subscribeViewportChange 方法');
        }
      }

      // 双击事件
      if (selectedEvent === 'doubleClick') {
        // 确保subscribeDoubleClick方法存在
        if (typeof chartRef.current.subscribeDoubleClick === 'function') {
          unsubscribeFn = chartRef.current.subscribeDoubleClick(param => {
            if (param.point && param.seriesPrices.get(seriesRef.current!) !== undefined) {
              const time = param.time;
              const price = param.seriesPrices.get(seriesRef.current!);
              const formattedTime = new Date(time * 1000).toLocaleString();
              addLogEntry(`双击于 ${formattedTime}: ${price} (x: ${param.point.x}, y: ${param.point.y})`);
            }
          });
          subscriptionRefs.current.push(unsubscribeFn);
        } else {
          console.warn('当前版本的 Lightweight Charts 不支持 subscribeDoubleClick 方法');
        }
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
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanupSubscriptions();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [selectedEvent, isDark]);
  
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
        <h1 className="text-3xl font-bold mb-4">事件与交互</h1>
        <p className={cn("text-lg", isDark ? "text-gray-300" : "text-gray-600")}>
          学习如何处理TradingView Lightweight Charts中的用户交互和事件，创建交互式数据可视化体验。本页面展示了所有可用的事件类型及其用法。
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* 事件类型选择 - 扩展为所有支持的事件 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['click', 'hover', 'crosshair', 'timeScale', 'mouseDown', 'mouseUp', 'visibleRangeChange', 'viewportChange', 'doubleClick'] as const).map((event) => (
              <button
                key={event}
                onClick={() => setSelectedEvent(event)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedEvent === event
                    ? isDark 
                      ? "bg-blue-900/40 text-blue-400 border border-blue-700" 
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                    : isDark 
                      ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-750" 
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                )}
              >
                {eventTypeLabels[event]}
              </button>
            ))}
          </div>
          
          {/* 使用自定义图表实例的图表显示 */}
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
          
          {/* 事件日志 */}
          <div 
            className={cn(
              "mt-4 rounded-16 p-4 max-h-60 overflow-y-auto",
              isDark 
                ? "bg-gray-800 border border-gray-700" 
                : "bg-white border border-gray-100 shadow-sm"
            )}
          >
            <h3 className="font-bold mb-2">事件日志</h3>
            {eventLog.length > 0 ? (
              <ul className={cn("space-y-1 text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                {eventLog.map((log, index) => (
                  <li key={index} className="border-b border-gray-700 pb-2 last:border-b-0 last:pb-0">{log}</li>
                ))}
              </ul>
            ) : (
              <p className={cn("italic", isDark ? "text-gray-400" : "text-gray-500")}>
                {selectedEvent === 'click' && '点击图表查看事件'}
                {selectedEvent === 'hover' && '在图表上悬停查看事件（为避免日志过多，悬停事件不记录）'}
                {selectedEvent === 'crosshair' && '移动十字光标查看事件'}
                {selectedEvent === 'timeScale' && '缩放或平移图表查看事件'}
                {selectedEvent === 'mouseDown' && '在图表上按下鼠标查看事件'}
                {selectedEvent === 'mouseUp' && '在图表上释放鼠标查看事件'}
                {selectedEvent === 'visibleRangeChange' && '缩放、平移或调整窗口大小查看事件'}
                {selectedEvent === 'viewportChange' && '调整图表大小或位置查看事件'}
                {selectedEvent === 'doubleClick' && '双击图表查看事件'}
              </p>
            )}
          </div>
        </div>
        
        <div>
          {/* 事件说明和代码示例 */}
          <div 
            className={cn(
              "rounded-16 p-6 h-full flex flex-col",
              isDark 
                ? "bg-gray-800 border border-gray-700" 
                : "bg-white border border-gray-100 shadow-sm"
            )}
          >
            <h2 className="text-xl font-bold mb-3">{eventTypeLabels[selectedEvent]}</h2>
            <p className={cn("mb-6 flex-grow", isDark ? "text-gray-300" : "text-gray-600")}>
              {eventDescriptions[selectedEvent]}
            </p>
            <CodeExample 
              code={eventCodeExamples[selectedEvent]} 
              language="typescript" 
            />
          </div>
        </div>
      </div>
      
      {/* 事件参数说明 */}
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
        <h2 className="text-xl font-bold mb-4">事件参数说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventParams[selectedEvent].map((param, index) => (
            <div key={index} className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
              <code className="font-mono">{param.name}</code>
              <p className={cn("mt-1 text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                {param.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
      
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
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-4">图表事件常见使用场景</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventUseCases[selectedEvent].map((useCase, index) => (
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

      {/* 事件系统概览 */}
      <motion.div 
        className={cn(
          "mt-12 rounded-16 p-6",
          isDark 
            ? "bg-gray-800 border border-gray-700" 
            : "bg-white border border-gray-100 shadow-sm"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-6">TradingView Lightweight Charts 事件系统概览</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 鼠标事件 */}
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">鼠标事件</h3>
            <ul className={cn("space-y-2 text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
              <li className="flex items-start">
                <i className="fa fa-mouse-pointer text-blue-500 mt-1 mr-2"></i>
                <div>
                  <span className="font-medium">点击事件 (click)</span>
                  <p className="text-xs mt-1">捕获用户点击图表的位置和数据</p>
                </div>
              </li>
              <li className="flex items-start">
                <i className="fa fa-hand-paper-o text-blue-500 mt-1 mr-2"></i>
                <div>
                  <span className="font-medium">鼠标按下事件 (mouseDown)</span>
                  <p className="text-xs mt-1">捕获鼠标在图表上按下的位置</p>
                </div>
              </li>
              <li className="flex items-start">
                <i className="fa fa-hand-pointer-o text-blue-500 mt-1 mr-2"></i>
                <div>
                  <span className="font-medium">鼠标释放事件 (mouseUp)</span>
                  <p className="text-xs mt-1">捕获鼠标在图表上释放的位置</p>
                </div>
              </li>
              <li className="flex items-start">
                <i className="fa fa-hand-pointer-o text-blue-500 mt-1 mr-2"></i>
                <div>
                  <span className="font-medium">双击事件 (doubleClick)</span>
                  <p className="text-xs mt-1">捕获用户双击图表的位置</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* 光标和悬停事件 */}
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">光标和悬停事件</h3>
            <ul className={cn("space-y-2 text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
              <li className="flex items-start">
                <i className="fa fa-crosshairs text-blue-500 mt-1 mr-2"></i>
                <div>
                  <span className="font-medium">十字光标移动事件 (crosshairMove)</span>
                  <p className="text-xs mt-1">跟踪十字光标移动，获取时间和价格数据</p>
                </div>
              </li>
              <li className="flex items-start">
                <i className="fa fa-mouse-pointer text-blue-500 mt-1 mr-2"></i>
                <div>
                  <span className="font-medium">悬停事件 (hover)</span>
                  <p className="text-xs mt-1">跟踪鼠标在图表上的移动</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* 视图和范围事件 */}
          <div className={cn("p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">视图和范围事件</h3>
            <ul className={cn("space-y-2 text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
              <li className="flex items-start">
                <i className="fa fa-arrows-h text-blue-500 mt-1 mr-2"></i>
                <div>
                  <span className="font-medium">时间轴范围变化事件</span>
                  <p className="text-xs mt-1">监听时间轴可见范围的变化</p>
                </div>
              </li>
              <li className="flex items-start">
                <i className="fa fa-refresh text-blue-500 mt-1 mr-2"></i>
                <div>
                  <span className="font-medium">可见时间范围变化事件</span>
                  <p className="text-xs mt-1">监听实际可见时间范围的变化</p>
                </div>
              </li>
              <li className="flex items-start">
                <i className="fa fa-window-maximize text-blue-500 mt-1 mr-2"></i>
                <div>
                  <span className="font-medium">视口变化事件 (viewportChange)</span>
                  <p className="text-xs mt-1">监听整个图表视口的变化</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 事件最佳实践 */}
        <div className={cn("mt-8 p-4 rounded-12", isDark ? "bg-gray-750" : "bg-gray-50")}>
          <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">事件处理最佳实践</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <i className="fa fa-check-circle text-green-500 mt-1 mr-2"></i>
              <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                始终检查事件参数的有效性，特别是在处理空值或未定义值时
              </p>
            </div>
            <div className="flex items-start">
              <i className="fa fa-check-circle text-green-500 mt-1 mr-2"></i>
              <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                在组件卸载时取消订阅事件，避免内存泄漏
              </p>
            </div>
            <div className="flex items-start">
              <i className="fa fa-check-circle text-green-500 mt-1 mr-2"></i>
              <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                对于频繁触发的事件（如悬停），考虑使用防抖或节流优化性能
              </p>
            </div>
            <div className="flex items-start">
              <i className="fa fa-check-circle text-green-500 mt-1 mr-2"></i>
              <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                结合多个事件创建复杂的交互体验，如拖动、选择等操作
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventsPage;