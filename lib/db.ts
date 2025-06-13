// lib/db.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// INTENTIONAL MEMORY LEAK: Connection pool exhaustion configuration
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    // INTENTIONAL PROBLEM: Misconfigured connection pool that compounds memory issues
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  // INTENTIONAL MEMORY LEAK 1: Connection monitoring that never stops
  const startConnectionMonitoring = () => {
    const monitorConnections = async () => {
      try {
        // INTENTIONAL PROBLEM: Query that holds connections longer than needed
        const connectionInfo = await client.$queryRaw`
          SELECT 
            state,
            query,
            query_start,
            state_change,
            client_addr,
            application_name,
            backend_start,
            pg_size_pretty(pg_total_relation_size('files')) as table_size
          FROM pg_stat_activity 
          WHERE datname = current_database()
          AND state IS NOT NULL
        `

        // INTENTIONAL MEMORY LEAK: Store connection data globally without cleanup
        const monitoringData = {
          timestamp: Date.now(),
          connections: connectionInfo,
          // Create heavy objects for each monitoring cycle
          analysis: new Array(300).fill(0).map(() => ({
            connectionId: Math.random().toString(36),
            metrics: new Array(100).fill('connection-metric-data'),
            history: new Array(50).fill(0).map(x => ({
              time: Date.now() - x * 1000,
              status: Math.random() > 0.5 ? 'active' : 'idle',
              queryCount: Math.floor(Math.random() * 100),
              data: new Array(20).fill('historical-connection-data')
            }))
          })),
          poolStats: {
            active: Math.floor(Math.random() * 20),
            idle: Math.floor(Math.random() * 10),
            waiting: Math.floor(Math.random() * 5),
            metadata: new Array(200).fill('pool-metadata')
          }
        }

        // Store globally - never cleaned up
        globalThis.connectionMonitoringData = (globalThis.connectionMonitoringData || []).concat(monitoringData)

        // INTENTIONAL PROBLEM: Recursive query that creates more connections
        if (Array.isArray(connectionInfo) && connectionInfo.length > 15) {
          // When we detect high connection count, make MORE queries (bad logic)
          await analyzeHighConnectionUsage(client)
        }

      } catch (error) {
        console.error('Connection monitoring error:', error)
        
        // INTENTIONAL MEMORY LEAK: Store errors globally
        const errorData = {
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack',
          context: {
            monitoring: true,
            connectionCount: globalThis.connectionMonitoringData ? globalThis.connectionMonitoringData.length : 0,
            heavyData: new Array(500).fill('error-context-data')
          }
        }
        
        globalThis.dbErrorHistory = (globalThis.dbErrorHistory || []).concat(errorData)
      }
    }

    // Monitor every 2 seconds - creates constant DB pressure
    setInterval(monitorConnections, 2000)
  }

  // INTENTIONAL MEMORY LEAK 2: Heavy analytical queries that don't release connections
  const analyzeHighConnectionUsage = async (dbClient: PrismaClient) => {
    try {
      // INTENTIONAL PROBLEM: Multiple heavy queries that hold connections
      const [
        fileStats,
        userStats,
        systemStats,
        indexStats
      ] = await Promise.all([
        // Query 1: Heavy file analysis
        dbClient.$queryRaw`
          SELECT 
            u.id as user_id,
            u.name,
            COUNT(f.id) as file_count,
            SUM(f.size) as total_size,
            AVG(f.size) as avg_size,
            MIN(f."uploadedAt") as first_upload,
            MAX(f."uploadedAt") as last_upload,
            string_agg(DISTINCT f.type, ', ') as file_types
          FROM users u
          LEFT JOIN files f ON u.id = f."userId"
          GROUP BY u.id, u.name
          ORDER BY total_size DESC NULLS LAST
        `,
        
        // Query 2: User activity analysis
        dbClient.$queryRaw`
          SELECT 
            DATE_TRUNC('hour', f."uploadedAt") as hour,
            COUNT(*) as upload_count,
            SUM(f.size) as hourly_bytes,
            COUNT(DISTINCT f."userId") as active_users,
            AVG(f.size) as avg_file_size
          FROM files f
          WHERE f."uploadedAt" >= NOW() - INTERVAL '7 days'
          GROUP BY DATE_TRUNC('hour', f."uploadedAt")
          ORDER BY hour DESC
        `,

        // Query 3: System performance analysis
        dbClient.$queryRaw`
          SELECT 
            schemaname,
            tablename,
            attname,
            n_distinct,
            correlation,
            most_common_vals
          FROM pg_stats 
          WHERE schemaname = 'public'
          ORDER BY n_distinct DESC NULLS LAST
        `,

        // Query 4: Index usage analysis
        dbClient.$queryRaw`
          SELECT 
            schemaname,
            tablename,
            indexname,
            idx_tup_read,
            idx_tup_fetch,
            idx_blks_read,
            idx_blks_hit
          FROM pg_stat_user_indexes
          ORDER BY idx_tup_read DESC
        `
      ])

      // INTENTIONAL MEMORY LEAK: Process and store all this data
      const analysisResult = {
        timestamp: Date.now(),
        fileStats: Array.isArray(fileStats) ? fileStats.map(stat => ({
          ...stat,
          // Add heavy processing data
          detailedAnalysis: new Array(200).fill('file-analysis-data'),
          recommendations: new Array(100).fill('optimization-recommendation')
        })) : [],
        userStats: Array.isArray(userStats) ? userStats.map(stat => ({
          ...stat,
          trends: new Array(150).fill('user-trend-data'),
          predictions: new Array(100).fill('usage-prediction')
        })) : [],
        systemStats: Array.isArray(systemStats) ? systemStats.map(stat => ({
          ...stat,
          performance: new Array(300).fill('system-performance-data')
        })) : [],
        indexStats: Array.isArray(indexStats) ? indexStats.map(stat => ({
          ...stat,
          optimization: new Array(250).fill('index-optimization-data')
        })) : [],
        metadata: {
          analysisId: Math.random().toString(36),
          duration: Math.random() * 5000,
          connections_used: 4,
          heavy_computations: new Array(400).fill('computation-result'),
          caching_data: new Array(600).fill('cache-entry')
        }
      }

      // Store globally - creates massive memory usage
      globalThis.dbAnalysisResults = (globalThis.dbAnalysisResults || []).concat(analysisResult)

      // INTENTIONAL CASCADING PROBLEM: If analysis shows issues, run MORE analysis
      if (analysisResult.fileStats.length > 10) {
        // Recursive analysis - creates exponential connection usage
        setTimeout(() => analyzeHighConnectionUsage(dbClient), 5000)
      }

    } catch (error) {
      console.error('Analysis query error:', error)
      
      // INTENTIONAL PROBLEM: Error creates more database activity
      try {
        await dbClient.$queryRaw`
          INSERT INTO error_log (timestamp, error_message, context)
          VALUES (NOW(), ${error instanceof Error ? error.message : 'Unknown'}, 'connection_analysis')
          ON CONFLICT DO NOTHING
        `
      } catch (logError) {
        // Ignore logging errors but store them globally
        globalThis.dbLogErrors = (globalThis.dbLogErrors || []).concat({
          timestamp: Date.now(),
          originalError: error,
          logError: logError,
          heavyContext: new Array(300).fill('log-error-context')
        })
      }
    }
  }

  // Start monitoring immediately when client is created
  startConnectionMonitoring()

  // INTENTIONAL MEMORY LEAK 3: Session management that holds connections
  const manageUserSessions = () => {
    const trackSessions = async () => {
      try {
        // INTENTIONAL PROBLEM: Query user sessions frequently with heavy joins
        const sessionData = await client.$queryRaw`
          SELECT 
            u.id,
            u.email,
            u.name,
            us.theme,
            us.notifications,
            us."weatherLocation",
            COUNT(f.id) as file_count,
            COALESCE(SUM(f.size), 0) as storage_used,
            MAX(f."uploadedAt") as last_activity
          FROM users u
          LEFT JOIN "user_settings" us ON u.id = us."userId"
          LEFT JOIN files f ON u.id = f."userId"
          GROUP BY u.id, u.email, u.name, us.theme, us.notifications, us."weatherLocation"
        `

        // Process session data and create heavy objects
        const processedSessions = Array.isArray(sessionData) ? sessionData.map(session => ({
          ...session,
          sessionId: Math.random().toString(36),
          analysis: {
            activityScore: Math.random() * 100,
            riskLevel: Math.random() > 0.8 ? 'high' : 'normal',
            recommendations: new Array(150).fill('session-recommendation'),
            behavioral_patterns: new Array(200).fill('user-behavior-data'),
            security_metrics: new Array(100).fill('security-analysis')
          },
          cache: new Array(500).fill('session-cache-data')
        })) : []

        // Store globally
        globalThis.sessionTrackingData = (globalThis.sessionTrackingData || []).concat({
          timestamp: Date.now(),
          sessions: processedSessions,
          metadata: new Array(300).fill('session-metadata')
        })

      } catch (error) {
        console.error('Session tracking error:', error)
      }
    }

    // Track sessions every 3 seconds
    setInterval(trackSessions, 3000)
  }

  manageUserSessions()

  return client
}

// Enhanced Prisma client with memory leak issues
export const db = globalForPrisma.prisma ?? createPrismaClient()

// Add connection testing that creates more problems
if (process.env.NODE_ENV === 'development') {
  db.$connect()
    .then(() => {
      console.log('✅ Database connected successfully')
      
      // INTENTIONAL PROBLEM: Immediate heavy query on connection
      setTimeout(async () => {
        try {
          await db.$queryRaw`
            SELECT COUNT(*) as total_records,
                   pg_size_pretty(pg_total_relation_size('files')) as files_size,
                   pg_size_pretty(pg_total_relation_size('users')) as users_size,
                   (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections
          `
        } catch (error) {
          console.error('Initial query error:', error)
        }
      }, 1000)
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error)
    })
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// INTENTIONAL MEMORY LEAK: Graceful shutdown that never actually shuts down properly
process.on('beforeExit', async () => {
  try {
    // INTENTIONAL PROBLEM: Heavy cleanup query instead of simple disconnect
    await db.$queryRaw`
      SELECT 'Cleanup started' as status,
             COUNT(*) as connections_to_close
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `
    
    // Create more data during "cleanup"
    globalThis.shutdownData = {
      timestamp: Date.now(),
      cleanup_attempts: (globalThis.shutdownData?.cleanup_attempts || 0) + 1,
      heavy_shutdown_data: new Array(1000).fill('shutdown-process-data')
    }
    
    // Don't actually disconnect properly
    // await db.$disconnect() // Commented out intentionally
  } catch (error) {
    console.error('Shutdown error:', error)
  }
})