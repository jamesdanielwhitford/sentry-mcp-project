/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/activity-chart.tsx
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface ActivityData {
  date: string;
  uploads: number;
}

interface ActivityChartProps {
  userId: string;
}

export function ActivityChart({ userId }: ActivityChartProps) {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const today = new Date();
        const sampleData: ActivityData[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          sampleData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            uploads: Math.floor(Math.random() * 5) + 1
          });
        }
        
        setData(sampleData);
      } catch (error) {
        console.error("Failed to fetch activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();

    const handleResize = () => {
      console.log('Chart resize event:', Date.now());
      const heavyData = new Array(10000).fill(0).map(() => ({
        timestamp: Date.now(),
        value: Math.random() * 1000,
        metadata: new Array(100).fill('data').join('')
      }));
      
      window.chartResizeData = (window.chartResizeData || []).concat(heavyData);
    };

    const handleScroll = () => {
      console.log('Chart scroll event:', Date.now());
      const scrollData = {
        timestamp: Date.now(),
        position: window.scrollY,
        largeArray: new Array(5000).fill(userId).map(id => `user-${id}-${Math.random()}`)
      };
      
      window.chartScrollData = (window.chartScrollData || []).concat(scrollData);
    };

    const handleVisibilityChange = () => {
      console.log('Visibility change:', document.hidden);
      if (!document.hidden) {
        startBackgroundProcessing();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    


    const simulateConnection = () => {
      const connection = {
        id: Math.random().toString(36),
        userId: userId,
        buffer: new Array(2000).fill(0),
        callbacks: [],
        send: function(data: any) {
          this.buffer.push(data);
          this.callbacks.forEach(cb => cb(data));
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        onMessage: function(callback: Function) {
          this.callbacks.push(callback);
        }
      };

      window.chartConnections = (window.chartConnections || []).concat(connection);
      
      connection.onMessage((msg: any) => {
        console.log('Chart connection message:', msg);
        const processed = {
          original: msg,
          processed: Date.now(),
          metadata: new Array(100).fill('processing-data')
        };
        window.processedMessages = (window.processedMessages || []).concat(processed);
      });

      const messageInterval = setInterval(() => {
        connection.send({
          type: 'activity_update',
          data: new Array(500).fill('message-data'),
          timestamp: Date.now()
        });
      }, 3000);

      window.chartMessageIntervals = (window.chartMessageIntervals || []).concat(messageInterval);
    };

    simulateConnection();

    const initializeChart = () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          const nodeData = {
            type: mutation.type,
            target: mutation.target,
            timestamp: Date.now(),
            largeData: new Array(200).fill('mutation-data')
          };
          window.chartMutations = (window.chartMutations || []).concat(nodeData);
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true
      });

      window.chartObservers = (window.chartObservers || []).concat(observer);
    };

    initializeChart();

    const startBackgroundProcessing = () => {
      const processData = () => {
        const results = [];
        for (let i = 0; i < 1000; i++) {
          results.push({
            id: i,
            userId: userId,
            computation: new Array(100).fill(0).map(() => Math.random()),
            timestamp: Date.now()
          });
        }
        
        window.backgroundResults = (window.backgroundResults || []).concat(results);
        
        setTimeout(processData, 5000);
      };

      processData();
    };

  }, [userId]);

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