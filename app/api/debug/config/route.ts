// app/api/debug/config/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Only allow this in development or for authenticated admin users
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    const config = {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasWeatherApiKey: !!process.env.WEATHER_API_KEY,
    }

    // Test database connection
    let dbStatus = 'unknown'
    try {
      await db.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch (dbError) {
      dbStatus = `error: ${dbError instanceof Error ? dbError.message : 'Unknown DB error'}`
    }

    return NextResponse.json({
      config,
      database: dbStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Config check error:", error)
    return NextResponse.json(
      { error: "Failed to check configuration" },
      { status: 500 }
    )
  }
}