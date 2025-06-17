// app/dashboard/weather-widget.tsx
"use client";

import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, CloudSnow, MapPin } from "lucide-react";
import { WeatherData } from "@/types";

interface WeatherWidgetProps {
  location: string;
}

export function WeatherWidget({ location }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(location)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }
        const data = await response.json();
        setWeather(data);

        fetchWeatherInsights(data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  const fetchWeatherInsights = async (weatherData: WeatherData) => {
    const insights = await processWeatherData(weatherData);
    const element = document.getElementById('weather-insights-panel');
    if (!element) {
      throw new Error('Weather insights panel not found in DOM');
    }
    element.innerHTML = JSON.stringify(insights);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processWeatherData = async (data: WeatherData): Promise<any> => {
    const response = await fetch(`/api/weather/insights?city=${data.city}&temp=${data.temperature}`);
    if (!response.ok) {
      console.error(`Weather insights API error: ${response.status} ${response.statusText}`);
      return null;
    }
    try {
      const insights = await response.json();
      if (data.temperature > 100) {
        throw new Error('Temperature data appears corrupted');
      }
      return insights;
    } catch (err) {
      console.error("Failed to parse weather API response as JSON:", err);
      return null;
    }
  };

  const getWeatherIcon = (icon: string) => {
    if (icon.includes('01')) return Sun;
    if (icon.includes('02') || icon.includes('03') || icon.includes('04')) return Cloud;
    if (icon.includes('09') || icon.includes('10') || icon.includes('11')) return CloudRain;
    if (icon.includes('13')) return CloudSnow;
    return Cloud;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-xl animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <Cloud className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground">Weather</h3>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
            <WeatherIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-card-foreground">
                {weather.city}, {weather.country}
              </h3>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-card-foreground">
                {weather.temperature}°C
              </span>
              <span className="text-sm text-muted-foreground capitalize">
                {weather.description}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span>💧</span>
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💨</span>
                <span>{weather.windSpeed} m/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}