// app/dashboard/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Bell, Palette, MapPin, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserSettings {
  id: string;
  theme: string;
  notifications: boolean;
  weatherLocation: string;
  dashboardLayout: string;
  userId: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [weatherLocation, setWeatherLocation] = useState("New York");
  const [dashboardLayout, setDashboardLayout] = useState("grid");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/user/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setTheme(data.theme);
        setNotifications(data.notifications);
        setWeatherLocation(data.weatherLocation);
        setDashboardLayout(data.dashboardLayout);
      } else {
        throw new Error("Failed to fetch settings");
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          notifications,
          weatherLocation,
          dashboardLayout,
        }),
      });
      
      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Update failed:", error);
      setError(error instanceof Error ? error.message : "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = settings && (
    theme !== settings.theme ||
    notifications !== settings.notifications ||
    weatherLocation !== settings.weatherLocation ||
    dashboardLayout !== settings.dashboardLayout
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customize your dashboard experience and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Preferences</h2>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Palette className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    theme === "light"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">Light</div>
                  <div className="text-sm text-gray-500">Default light theme</div>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    theme === "dark"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">Dark</div>
                  <div className="text-sm text-gray-500">Dark theme</div>
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Receive email notifications about your account activity
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Weather Location */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900">Weather</h3>
            </div>
            
            <Input
              label="Weather Location"
              value={weatherLocation}
              onChange={(e) => setWeatherLocation(e.target.value)}
              placeholder="Enter city name"
              helperText="This will be used for the weather widget on your dashboard"
            />
          </div>

          {/* Dashboard Layout */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Grid className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-medium text-gray-900">Dashboard Layout</h3>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Layout Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDashboardLayout("grid")}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    dashboardLayout === "grid"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">Grid</div>
                  <div className="text-sm text-gray-500">Card-based grid layout</div>
                </button>
                <button
                  onClick={() => setDashboardLayout("list")}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    dashboardLayout === "list"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">List</div>
                  <div className="text-sm text-gray-500">Compact list layout</div>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-600">Settings updated successfully!</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}