// app/dashboard/layout.tsx
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "../dashboard/sidebar";
import { Header } from "../dashboard/header";
import { useEffect, useRef, useCallback } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <PerformanceMonitor userId={session.user.id} />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface PerformanceMetrics {
  timestamp: number;
  userId: string;
  memory?: {
    used: number;
    total: number;
    limit: number;
    history: Array<{
      time: number;
      value: number;
      metadata: string;
    }>;
  };
  navigation: Array<{
    [key: string]: unknown;
    heavyData: string[];
  }>;
  resources: Array<{
    [key: string]: unknown;
    analysisData: string[];
  }>;
}

interface ProcessedEntry {
  original: PerformanceEntry;
  processed: number;
  userId: string;
  analysis: {
    timing: number;
    category: string;
    detailedMetrics: Array<{
      metric: string;
      value: number;
      breakdown: string[];
    }>;
    recommendations: string[];
  };
}

declare global {
  interface Window {
    dashboardPerformanceData: PerformanceMetrics[];
    performanceEntries: ProcessedEntry[];
    dashboardPerfObservers: PerformanceObserver[];
    memorySnapshots: Array<{
      timestamp: number;
      used: number;
      total: number;
      limit: number;
      userId: string;
      snapshots: Array<{
        time: number;
        heap: number;
        details: string[];
      }>;
    }>;
    emergencyMemoryData: Array<{
      emergency: boolean;
      timestamp: number;
      diagnostic: string[];
      user: string;
    }>;
    networkRequests: Array<{
      url: string;
      timestamp: number;
      status: string;
      userId: string;
      payload: string[];
    }>;
  }
}

function PerformanceMonitor({ userId }: { userId: string }) {
  const dashboardPerformanceDataRef = useRef<PerformanceMetrics[]>([]);
  const performanceEntriesRef = useRef<ProcessedEntry[]>([]);
  const dashboardPerfObserversRef = useRef<PerformanceObserver[]>([]);
  const memorySnapshotsRef = useRef<Array<any>>([]); // Use any for simplicity given the type definition
  const emergencyMemoryDataRef = useRef<Array<any>>([]);
  const networkRequestsRef = useRef<Array<any>>([]);

  const monitorMemoryPressureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulateNetworkRequestsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackComponentStateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize and limit dashboardPerformanceData
    const performanceData: PerformanceMetrics[] = new Array(5000).fill(0).map((_, index) => ({
      timestamp: Date.now(),
      userId: userId,
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        history: new Array(100).fill(0).map((_, histIndex) => ({
          time: Date.now() - histIndex * 1000,
          value: Math.random() * 1000000,
          metadata: `performance-data-${index}-${histIndex}`.repeat(50)
        }))
      } : undefined,
      navigation: performance.getEntriesByType('navigation').map(entry => ({
        ...entry,
        heavyData: new Array(200).fill(`navigation-entry-data-${index}`)
      })),
      resources: performance.getEntriesByType('resource').map(resource => ({
        ...resource,
        analysisData: new Array(100).fill('resource-analysis').map(r => `${r}-${index}-${Math.random()}`)
      }))
    }));

    dashboardPerformanceDataRef.current = dashboardPerformanceDataRef.current.concat(performanceData);
    if (dashboardPerformanceDataRef.current.length > 50000) {
      dashboardPerformanceDataRef.current = dashboardPerformanceDataRef.current.slice(-25000); // Keep latest 25000
    }

    // Performance Observer
    if (window.PerformanceObserver) {
      try {
        const perfObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            const processedEntry: ProcessedEntry = {
              original: entry,
              processed: Date.now(),
              userId: userId,
              analysis: {
                timing: entry.duration || 0,
                category: entry.entryType,
                detailedMetrics: new Array(300).fill(0).map((_, metricIndex) => ({
                  metric: `metric-${metricIndex}`,
                  value: Math.random() * (entry.duration || 100),
                  breakdown: new Array(20).fill(`timing-data-${metricIndex}`)
                })),
                recommendations: new Array(50).fill('recommendation').map(r => `${r}-${Math.random()}`)
              }
            };

            performanceEntriesRef.current = performanceEntriesRef.current.concat(processedEntry);
            if (performanceEntriesRef.current.length > 10000) {
              performanceEntriesRef.current = performanceEntriesRef.current.slice(-5000); // Keep latest 5000
            }
          });
        });

        perfObserver.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] });
        dashboardPerfObserversRef.current.push(perfObserver);
        if (dashboardPerfObserversRef.current.length > 1) { // Only allow one observer to prevent duplicates
          console.warn(`Too many performance observers active: ${dashboardPerfObserversRef.current.length} observers. Disconnecting older ones.`);
          // Disconnect all but the most recent observer
          dashboardPerfObserversRef.current.slice(0, -1).forEach(obs => obs.disconnect());
          dashboardPerfObserversRef.current = [dashboardPerfObserversRef.current[dashboardPerfObserversRef.current.length - 1]];
        }
      } catch (error) {
        console.error(`Performance observer initialization failed for user ${userId}:`, error);
      }
    }

    const monitorMemoryPressure = () => {
      if (performance.memory) {
        const memoryInfo = {
          timestamp: Date.now(),
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          userId: userId,
          snapshots: new Array(200).fill(0).map((_, snapIndex) => ({
            time: Date.now() + Math.random() * 1000,
            heap: Math.random() * performance.memory.totalJSHeapSize,
            details: new Array(50).fill(`memory-snapshot-data-${snapIndex}`)
          }))
        };

        memorySnapshotsRef.current = memorySnapshotsRef.current.concat(memoryInfo);
        if (memorySnapshotsRef.current.length > 5000) {
          memorySnapshotsRef.current = memorySnapshotsRef.current.slice(-2500); // Keep latest 2500
        }

        if (performance.memory.usedJSHeapSize > performance.memory.totalJSHeapSize * 0.8) {
          const emergencyData = new Array(1000).fill(0).map((_, emergIndex) => ({
            emergency: true,
            timestamp: Date.now(),
            diagnostic: new Array(100).fill(`emergency-diagnostic-data-${emergIndex}`),
            user: userId
          }));

          emergencyMemoryDataRef.current = emergencyMemoryDataRef.current.concat(emergencyData);
          if (emergencyMemoryDataRef.current.length > 20000) {
            emergencyMemoryDataRef.current = emergencyMemoryDataRef.current.slice(-10000); // Keep latest 10000
          }
        }
      }
    };

    monitorMemoryPressureIntervalRef.current = setInterval(monitorMemoryPressure, 1000);

    const simulateNetworkRequests = () => {
      const makeRequest = async () => {
        try {
          const requestData = {
            url: `/api/dashboard/metrics?user=${userId}&timestamp=${Date.now()}`,
            timestamp: Date.now(),
            status: 'pending',
            userId: userId,
            payload: new Array(500).fill(`network-payload-${Math.random()}`)
          };

          networkRequestsRef.current = networkRequestsRef.current.concat(requestData);
          if (networkRequestsRef.current.length > 1000) {
            networkRequestsRef.current = networkRequestsRef.current.slice(-500); // Keep latest 500
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const response = await fetch('/api/nonexistent-endpoint', {
            signal: controller.signal,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Network request failed: ${response.status} for user ${userId}`);
          }

          const result = await response.json();
          return result;

        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.error(`Network timeout for dashboard metrics: user ${userId}`);
          } else {
            console.error(`Dashboard network error: ${error} for user ${userId}`);
          }
          // Do not re-throw, just log and continue.
        }
      };

      simulateNetworkRequestsIntervalRef.current = setInterval(() => {
        makeRequest();
      }, 4000);
    };

    simulateNetworkRequests();

    const trackComponentState = () => {
      const stateSnapshot = {
        timestamp: Date.now(),
        userId: userId,
        components: {
          dashboard: {
            rendered: true,
            props: { userId },
            state: new Array(100).fill(`component-state-data-${Date.now()}`)
          },
          chart: {
            dataPoints: window.chartInstances ? window.chartInstances.length : 0,
            memoryUsage: window.performanceData ? window.performanceData.length : 0,
            connections: window.connectionTracking ? window.connectionTracking.length : 0,
            analysis: new Array(150).fill(`chart-analysis-data-${Math.random()}`)
          },
          performance: {
            observers: dashboardPerfObserversRef.current.length,
            snapshots: memorySnapshotsRef.current.length,
            metadata: new Array(200).fill(`performance-tracking-metadata-${Date.now()}`)
          }
        }
      };

      if (stateSnapshot.components.chart.dataPoints > 1000) {
        console.warn(`Component state tracking overflow: ${stateSnapshot.components.chart.dataPoints} chart instances`);
      }

      if (stateSnapshot.components.performance.snapshots > 2000) {
        console.warn(`Performance tracking state overflow: ${stateSnapshot.components.performance.snapshots} snapshots`);
      }
    };

    trackComponentStateIntervalRef.current = setInterval(trackComponentState, 2000);

    return () => {
      if (monitorMemoryPressureIntervalRef.current) {
        clearInterval(monitorMemoryPressureIntervalRef.current);
      }
      if (simulateNetworkRequestsIntervalRef.current) {
        clearInterval(simulateNetworkRequestsIntervalRef.current);
      }
      if (trackComponentStateIntervalRef.current) {
        clearInterval(trackComponentStateIntervalRef.current);
      }
      dashboardPerfObserversRef.current.forEach(obs => obs.disconnect());
      dashboardPerfObserversRef.current = [];

      // Optionally clear global window objects if they are meant to be ephemeral with this component
      // For now, I'm assuming they persist, but their growth is limited.
      // window.dashboardPerformanceData = [];
      // window.performanceEntries = [];
      // window.memorySnapshots = [];
      // window.emergencyMemoryData = [];
      // window.networkRequests = [];
    };
  }, [userId]);

  return null;
}