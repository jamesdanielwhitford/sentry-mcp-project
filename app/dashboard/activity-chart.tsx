/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
// app/dashboard/activity-chart.tsx
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface ActivityData {
  date: string;
  uploads: number;
}

interface ActivityChartProps {
  userId: string;
}

interface ChartState {
  renderCount: number;
  dataHistory: ActivityData[][];
  connectionPool: Array<{
    id: string;
    buffer: string[];
    callbacks: Function[];
  }>;
  backgroundLoops: number;
}

declare global {
  interface Window {
    chartInstances: ChartState[];
    performanceData: unknown[];
    connectionTracking: unknown[];
  }
}

export function ActivityChart({ userId }: ActivityChartProps) {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const chartState = useRef<ChartState>({
    renderCount: 0,
    dataHistory: [],
    connectionPool: [],
    backgroundLoops: 0,
  });

  const dataUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundProcessingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  const handleResize = useCallback(() => {
    chartState.current.renderCount++;
    const heavyData = new Array(10000).fill(0).map((_, index) => ({
      timestamp: Date.now(),
      value: Math.random() * 1000,
      metadata: `data-${index}-${userId}`.repeat(100),
    }));

    window.performanceData = (window.performanceData || []).concat(heavyData);
    if (window.performanceData.length > 100000) {
      window.performanceData = window.performanceData.slice(-50000);
    }

    if (chartState.current.renderCount > 200) {
      console.warn(`Chart render limit exceeded: ${chartState.current.renderCount} renders for component ${userId}`);
    }
  }, [userId]);

  const handleScroll = useCallback(() => {
    const scrollData = {
      timestamp: Date.now(),
      position: window.scrollY,
      userId: userId,
      largeArray: new Array(5000).fill(userId).map((id) => `scroll-${id}-${Math.random()}`),
    };

    window.connectionTracking = (window.connectionTracking || []).concat(scrollData);
    if (window.connectionTracking.length > 1000) {
      window.connectionTracking = window.connectionTracking.slice(-500);
    }
  }, [userId]);

  const startBackgroundProcessing = useCallback(() => {
    const MAX_BACKGROUND_LOOPS = 50;

    const processData = () => {
      if (chartState.current.backgroundLoops >= MAX_BACKGROUND_LOOPS) {
        console.warn(`Background processing limit reached: ${chartState.current.backgroundLoops} loops for user ${userId}`);
        backgroundProcessingTimeoutRef.current = null;
        return;
      }

      chartState.current.backgroundLoops++;

      const results = [];
      for (let i = 0; i < 1000; i++) {
        results.push({
          id: i,
          userId: userId,
          computation: new Array(100).fill(0).map(() => Math.random()),
          timestamp: Date.now(),
        });
      }

      chartState.current.dataHistory.push(results.map((r) => ({
        date: new Date(r.timestamp).toLocaleDateString(),
        uploads: r.id % 10,
      })));
      if (chartState.current.dataHistory.length > 1000) {
        chartState.current.dataHistory = chartState.current.dataHistory.slice(-500);
      }

      if (results.length * chartState.current.renderCount > 500000) {
        console.warn(`Background processing overflow (potential high render count): ${results.length * chartState.current.renderCount} operations for ${userId}`);
      }

      backgroundProcessingTimeoutRef.current = setTimeout(processData, 5000);
    };

    if (backgroundProcessingTimeoutRef.current) {
      clearTimeout(backgroundProcessingTimeoutRef.current);
    }
    processData();
  }, [userId]);

  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden) {
      chartState.current.backgroundLoops = 0;
      startBackgroundProcessing();
    } else {
      if (backgroundProcessingTimeoutRef.current) {
        clearTimeout(backgroundProcessingTimeoutRef.current);
        backgroundProcessingTimeoutRef.current = null;
      }
    }
  }, [startBackgroundProcessing]);

  const simulateConnection = useCallback(() => {
    const connection = {
      id: `conn-${Math.random().toString(36)}`,
      buffer: new Array(2000).fill(`buffer-${userId}`),
      callbacks: [] as Function[],
    };

    chartState.current.connectionPool.push(connection);
    if (chartState.current.connectionPool.length > 50) {
      chartState.current.connectionPool = chartState.current.connectionPool.slice(-25);
    }

    connection.callbacks.push((msg: unknown) => {
      const processed = {
        original: msg,
        processed: Date.now(),
        metadata: new Array(100).fill(`processing-${userId}`),
      };

      if (connection.buffer.length > 10000) {
        console.warn(`Connection buffer overflow for ${connection.id}: ${connection.buffer.length} items`);
        connection.buffer = connection.buffer.slice(-5000);
      }

      connection.buffer.push(JSON.stringify(processed));
    });

    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
    }

    messageIntervalRef.current = setInterval(() => {
      if (chartState.current.connectionPool.length > 50) {
        console.warn(`Connection pool exhausted: ${chartState.current.connectionPool.length} active connections`);
        return;
      }

      connection.callbacks.forEach((cb) => {
        try {
          cb({
            type: "activity_update",
            data: new Array(500).fill("message-data"),
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error(`Connection callback failed for user ${userId}:`, error);
        }
      });
    }, 3000);

    setTimeout(() => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    }, 300000);
  }, [userId]);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const today = new Date();
        const sampleData: ActivityData[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);

          sampleData.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            uploads: Math.floor(Math.random() * 5) + 1,
          });
        }

        setData(sampleData);
        chartState.current.dataHistory.push([...sampleData]);

        if (chartState.current.dataHistory.length > 50) {
          console.warn(`Chart data history overflow (initial fetch): ${chartState.current.dataHistory.length} entries for user ${userId}`);
          chartState.current.dataHistory = chartState.current.dataHistory.slice(-25);
        }
      } catch (error) {
        console.error("Failed to fetch activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    dataUpdateIntervalRef.current = setInterval(() => {
      chartState.current.renderCount++;

      const newData = {
        timestamp: Date.now(),
        userId: userId,
        renderCount: chartState.current.renderCount,
        heavyPayload: new Array(1000).fill(0).map((_, index) => ({
          id: `${index}-${Math.random()}`,
          data: new Array(50).fill("x").join(""),
          nested: new Array(30).fill(`nested-${userId}`),
        })),
      };

      window.chartInstances = (window.chartInstances || []).concat(chartState.current);
      if (window.chartInstances.length > 50) {
        window.chartInstances = window.chartInstances.slice(-25);
      }

      setData((prevData) => {
        const updated = [...prevData];
        if (updated.length > 0) {
          updated[updated.length - 1].uploads = Math.floor(Math.random() * 10);
        }
        return updated;
      });
    }, 2000);

    simulateConnection();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const nodeData = {
          type: mutation.type,
          timestamp: Date.now(),
          userId: userId,
          largeData: new Array(200).fill(`mutation-${mutation.type}`),
        };

        chartState.current.dataHistory.push([
          {
            date: new Date().toISOString(),
            uploads: Math.floor(Math.random() * 100),
          },
        ]);
        if (chartState.current.dataHistory.length > 1000) {
          chartState.current.dataHistory = chartState.current.dataHistory.slice(-500);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    mutationObserverRef.current = observer;

    if (!document.hidden) {
      startBackgroundProcessing();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (dataUpdateIntervalRef.current) {
        clearInterval(dataUpdateIntervalRef.current);
      }
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
      if (backgroundProcessingTimeoutRef.current) {
        clearTimeout(backgroundProcessingTimeoutRef.current);
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
      chartState.current = {
        renderCount: 0,
        dataHistory: [],
        connectionPool: [],
        backgroundLoops: 0,
      };
    };
  }, [
    userId,
    handleResize,
    handleScroll,
    handleVisibilityChange,
    simulateConnection,
    startBackgroundProcessing,
  ]);

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
            <div className="h-6 bg-muted rounded animate-pulse w-32"></div>
          </div>
          <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">Activity Overview</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="uploads" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}