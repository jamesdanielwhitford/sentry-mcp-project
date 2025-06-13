// app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city") || "New York"
    
    const apiKey = process.env.WEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Weather API key not configured" },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon
    })

  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    )
  }
}