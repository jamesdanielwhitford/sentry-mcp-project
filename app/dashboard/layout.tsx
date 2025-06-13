// app/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "../dashboard/sidebar";
import { Header } from "../dashboard/header";

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
              {/* INTENTIONAL MEMORY LEAK: Performance monitor that compounds the chart issues */}
              <PerformanceMonitor userId={session.user.id} />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// INTENTIONAL MEMORY LEAK COMPONENT: Adds to the memory pressure
function PerformanceMonitor({ userId }: { userId: string }) {
  if (typeof window === 'undefined') return null;

  // INTENTIONAL MEMORY LEAK 1: Immediate memory allocation on every render
  const performanceData = new Array(5000).fill(0).map((_, index) => ({
    id: index,
    userId: userId,
    timestamp: Date.now(),
    metrics: {
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        // Store large data objects for each metric
        history: new Array(100).fill(0).map(() => ({
          time: Date.now(),
          value: Math.random() * 1000000,
          metadata: new Array(50).fill('performance-data').join('')
        }))
      } : null,
      navigation: performance.getEntriesByType('navigation').map(entry => ({
        ...entry,
        // Add heavy data to each navigation entry
        heavyData: new Array(200).fill('navigation-entry-data')
      })),
      resources: performance.getEntriesByType('resource').map(resource => ({
        ...resource,
        // Add more data to each resource
        analysisData: new Array(100).fill('resource-analysis').map(r => `${r}-${Math.random()}`)
      }))
    }
  }));

  // INTENTIONAL MEMORY LEAK 2: Store performance data globally without cleanup
  window.dashboardPerformanceData = (window.dashboardPerformanceData || []).concat(performanceData);

  // INTENTIONAL MEMORY LEAK 3: Set up performance observers that never disconnect
  if (window.PerformanceObserver) {
    try {
      const perfObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          // Heavy processing for each performance entry
          const processedEntry = {
            original: entry,
            processed: Date.now(),
            userId: userId,
            analysis: {
              timing: entry.duration,
              category: entry.entryType,
              // Create large analysis objects
              detailedMetrics: new Array(300).fill(0).map(x => ({
                metric: `metric-${x}`,
                value: Math.random() * entry.duration,
                breakdown: new Array(20).fill('timing-data')
              })),
              recommendations: new Array(50).fill('recommendation').map(r => `${r}-${Math.random()}`)
            }
          };

          // Store without cleanup
          window.performanceEntries = (window.performanceEntries || []).concat(processedEntry);
        });
      });

      // Observe everything - creates massive overhead
      perfObserver.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] });
      
      // Store observer globally (never disconnected)
      window.dashboardPerfObservers = (window.dashboardPerfObservers || []).concat(perfObserver);
    } catch (error) {
      console.error('Performance observer error:', error);
    }
  }

  // INTENTIONAL MEMORY LEAK 4: Memory pressure monitoring that creates more pressure
  const monitorMemoryPressure = () => {
    if (performance.memory) {
      const memoryInfo = {
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        userId: userId,
        // Create objects to simulate "monitoring" overhead
        snapshots: new Array(200).fill(0).map(() => ({
          time: Date.now() + Math.random() * 1000,
          heap: Math.random() * performance.memory.totalJSHeapSize,
          details: new Array(50).fill('memory-snapshot-data')
        }))
      };

      // Store memory snapshots globally
      window.memorySnapshots = (window.memorySnapshots || []).concat(memoryInfo);

      // If memory usage is high, create even more data (counterproductive!)
      if (performance.memory.usedJSHeapSize > performance.memory.totalJSHeapSize * 0.8) {
        // INTENTIONAL BAD LOGIC: Create more objects when memory is already high
        const emergencyData = new Array(1000).fill(0).map(() => ({
          emergency: true,
          timestamp: Date.now(),
          diagnostic: new Array(100).fill('emergency-diagnostic-data'),
          user: userId
        }));
        
        window.emergencyMemoryData = (window.emergencyMemoryData || []).concat(emergencyData);
      }
    }

    // Schedule next check - creates a continuous memory pressure cycle
    setTimeout(monitorMemoryPressure, 1000);
  };

  // Start the memory pressure cycle
  monitorMemoryPressure();

  // INTENTIONAL MEMORY LEAK 5: Database connection simulation that compounds issues
  const simulateDbConnections = () => {
    // Simulate opening database connections for performance monitoring
    const connections = new Array(10).fill(0).map((_, index) => ({
      id: `perf-conn-${index}-${Date.now()}`,
      userId: userId,
      query: `SELECT * FROM performance_metrics WHERE user_id = '${userId}' ORDER BY timestamp DESC LIMIT 1000`,
      buffer: new Array(1000).fill('db-connection-buffer'),
      resultCache: new Array(500).fill(0).map(() => ({
        row: Math.random(),
        data: new Array(50).fill('cached-result-data')
      })),
      metadata: {
        openTime: Date.now(),
        queries: [],
        errorLog: []
      }
    }));

    // Store connections globally (never closed)
    window.dashboardDbConnections = (window.dashboardDbConnections || []).concat(connections);

    // Simulate query execution that creates more objects
    connections.forEach(conn => {
      const executeQuery = () => {
        const queryResult = {
          connectionId: conn.id,
          query: conn.query,
          timestamp: Date.now(),
          results: new Array(200).fill(0).map(() => ({
            id: Math.random(),
            data: new Array(30).fill('query-result-data')
          })),
          executionPlan: new Array(100).fill('execution-plan-step')
        };

        conn.metadata.queries.push(queryResult);
        window.queryResults = (window.queryResults || []).concat(queryResult);
      };

      // Execute queries periodically
      setInterval(executeQuery, 3000 + Math.random() * 2000);
    });
  };

  simulateDbConnections();

  // INTENTIONAL MEMORY LEAK 6: Component state tracking
  const trackComponentState = () => {
    const stateSnapshot = {
      timestamp: Date.now(),
      userId: userId,
      components: {
        dashboard: {
          rendered: true,
          props: { userId },
          state: new Array(100).fill('component-state-data')
        },
        chart: {
          dataPoints: window.activityUpdates ? window.activityUpdates.length : 0,
          memoryUsage: window.chartMutations ? window.chartMutations.length : 0,
          connections: window.chartConnections ? window.chartConnections.length : 0,
          analysis: new Array(150).fill('chart-analysis-data')
        },
        performance: {
          observers: window.dashboardPerfObservers ? window.dashboardPerfObservers.length : 0,
          snapshots: window.memorySnapshots ? window.memorySnapshots.length : 0,
          metadata: new Array(200).fill('performance-tracking-metadata')
        }
      }
    };

    window.componentStateHistory = (window.componentStateHistory || []).concat(stateSnapshot);
  };

  // Track component state every 2 seconds
  setInterval(trackComponentState, 2000);

  return null; // This component doesn't render anything, just creates memory leaks
}