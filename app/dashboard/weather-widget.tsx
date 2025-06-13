// components/dashboard/weather-widget.tsx
"use client";

import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, CloudSnow } from "lucide-react";
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  const getWeatherIcon = (icon: string) => {
    if (icon.includes('01')) return Sun;
    if (icon.includes('02') || icon.includes('03') || icon.includes('04')) return Cloud;
    if (icon.includes('09') || icon.includes('10') || icon.includes('11')) return CloudRain;
    if (icon.includes('13')) return CloudSnow;
    return Cloud;
  };

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center">
            <Cloud className="h-10 w-10 text-gray-400" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Weather</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <WeatherIcon className="h-10 w-10 text-blue-500" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {weather.city}, {weather.country}
            </h3>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-2xl font-bold text-gray-900">
                {weather.temperature}°C
              </span>
              <span className="text-sm text-gray-500 capitalize">
                {weather.description}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Humidity: {weather.humidity}%</span>
              <span>Wind: {weather.windSpeed} m/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}