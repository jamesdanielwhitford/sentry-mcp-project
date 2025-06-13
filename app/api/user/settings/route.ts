// app/api/user/settings/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const settings = await db.userSettings.findUnique({
      where: { userId: session.user.id }
    })

    if (!settings) {
      // Create default settings if they don't exist
      const newSettings = await db.userSettings.create({
        data: {
          userId: session.user.id,
          theme: "light",
          notifications: true,
          weatherLocation: "New York",
          dashboardLayout: "grid"
        }
      })
      return NextResponse.json(newSettings)
    }

    return NextResponse.json(settings)

  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { theme, notifications, weatherLocation, dashboardLayout } = await request.json()

    const updatedSettings = await db.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...(theme && { theme }),
        ...(typeof notifications === 'boolean' && { notifications }),
        ...(weatherLocation && { weatherLocation }),
        ...(dashboardLayout && { dashboardLayout })
      },
      create: {
        userId: session.user.id,
        theme: theme || "light",
        notifications: notifications ?? true,
        weatherLocation: weatherLocation || "New York",
        dashboardLayout: dashboardLayout || "grid"
      }
    })

    return NextResponse.json(updatedSettings)

  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}