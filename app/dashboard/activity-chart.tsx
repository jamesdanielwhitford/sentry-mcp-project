// app/dashboard/activity-chart.tsx
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
        // Generate sample data for the last 7 days
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

    // INTENTIONAL MEMORY LEAK 1: Event listeners never removed
    const handleResize = () => {
      console.log('Chart resize event:', Date.now());
      // Simulate heavy computation on resize
      const heavyData = new Array(10000).fill(0).map(() => ({
        timestamp: Date.now(),
        value: Math.random() * 1000,
        metadata: new Array(100).fill('data').join('')
      }));
      
      // Store in closure without cleanup - memory leak
      window.chartResizeData = (window.chartResizeData || []).concat(heavyData);
    };

    const handleScroll = () => {
      console.log('Chart scroll event:', Date.now());
      // Create more objects that won't be cleaned up
      const scrollData = {
        timestamp: Date.now(),
        position: window.scrollY,
        largeArray: new Array(5000).fill(userId).map(id => `user-${id}-${Math.random()}`)
      };
      
      // Another memory leak - accumulating data
      window.chartScrollData = (window.chartScrollData || []).concat(scrollData);
    };

    const handleVisibilityChange = () => {
      console.log('Visibility change:', document.hidden);
      // Simulate background processing that continues even when hidden
      if (!document.hidden) {
        startBackgroundProcessing();
      }
    };

    // INTENTIONAL MEMORY LEAK 2: Multiple event listeners with no cleanup
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // INTENTIONAL MEMORY LEAK 3: Interval that keeps running
    const dataUpdateInterval = setInterval(() => {
      // Simulate real-time data updates
      const newData = {
        timestamp: Date.now(),
        userId: userId,
        activity: Math.random() * 100,
        heavyPayload: new Array(1000).fill(0).map(() => ({
          id: Math.random().toString(36),
          data: new Array(50).fill('x').join(''),
          nested: {
            more: new Array(20).fill('nested-data'),
            evenMore: {
              deep: new Array(30).fill('deep-data')
            }
          }
        }))
      };
      
      // Store without cleanup - grows indefinitely
      window.activityUpdates = (window.activityUpdates || []).concat(newData);
      
      // Force component re-render with growing data set
      setData(prevData => {
        const updated = [...prevData];
        if (updated.length > 0) {
          updated[updated.length - 1].uploads = Math.floor(Math.random() * 10);
        }
        return updated;
      });
    }, 2000); // Every 2 seconds

    // INTENTIONAL MEMORY LEAK 4: WebSocket-like connection simulation
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
        onMessage: function(callback: Function) {
          this.callbacks.push(callback);
        }
      };

      // Store connection globally without cleanup
      window.chartConnections = (window.chartConnections || []).concat(connection);
      
      // Simulate message handling
      connection.onMessage((msg: any) => {
        console.log('Chart connection message:', msg);
        // Process message and create more objects
        const processed = {
          original: msg,
          processed: Date.now(),
          metadata: new Array(100).fill('processing-data')
        };
        window.processedMessages = (window.processedMessages || []).concat(processed);
      });

      // Send periodic messages
      const messageInterval = setInterval(() => {
        connection.send({
          type: 'activity_update',
          data: new Array(500).fill('message-data'),
          timestamp: Date.now()
        });
      }, 3000);

      // Store interval reference globally (never cleared)
      window.chartMessageIntervals = (window.chartMessageIntervals || []).concat(messageInterval);
    };

    simulateConnection();

    // INTENTIONAL MEMORY LEAK 5: Chart library instance management
    const initializeChart = () => {
      // Simulate chart library initialization that creates DOM observers
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          // Heavy processing on DOM changes
          const nodeData = {
            type: mutation.type,
            target: mutation.target,
            timestamp: Date.now(),
            largeData: new Array(200).fill('mutation-data')
          };
          window.chartMutations = (window.chartMutations || []).concat(nodeData);
        });
      });

      // Observe entire document - very expensive
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true
      });

      // Store observer globally (never disconnected)
      window.chartObservers = (window.chartObservers || []).concat(observer);
    };

    initializeChart();

    // INTENTIONAL MEMORY LEAK 6: Background processing function
    const startBackgroundProcessing = () => {
      const processData = () => {
        // Simulate heavy background computation
        const results = [];
        for (let i = 0; i < 1000; i++) {
          results.push({
            id: i,
            userId: userId,
            computation: new Array(100).fill(0).map(() => Math.random()),
            timestamp: Date.now()
          });
        }
        
        // Store results globally
        window.backgroundResults = (window.backgroundResults || []).concat(results);
        
        // Schedule next processing
        setTimeout(processData, 5000); // Every 5 seconds
      };

      processData();
    };

    // NO CLEANUP FUNCTION - This is the critical missing piece
    // return () => {
    //   window.removeEventListener('resize', handleResize);
    //   window.removeEventListener('scroll', handleScroll);
    //   document.removeEventListener('visibilitychange', handleVisibilityChange);
    //   clearInterval(dataUpdateInterval);
    //   // ... other cleanup
    // };

  }, [userId]); // Effect will re-run if userId changes, creating more leaks

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