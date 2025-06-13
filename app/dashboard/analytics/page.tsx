// app/dashboard/analytics/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";
import { 
  TrendingUp, 
  HardDrive, 
  Files, 
  Upload as UploadIcon
} from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";
import { FileUpload } from "@/types";

interface AnalyticsData {
  totalFiles: number;
  totalSize: number;
  uploadsThisMonth: number;
  storageGrowth: number;
  filesByType: { type: string; count: number; size: number; color: string }[];
  uploadsByDate: { date: string; uploads: number; size: number }[];
  recentActivity: FileUpload[];
}

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  iconColor: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, iconColor }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${iconColor}`}>
              <Icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    changeType === "positive" ? "text-green-600" : 
                    changeType === "negative" ? "text-red-600" : "text-gray-500"
                  }`}>
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const processFilesData = useCallback((files: FileUpload[]): AnalyticsData => {
    const now = new Date();
    const timeRangeDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = new Date(now.getTime() - timeRangeDays * 24 * 60 * 60 * 1000);
    
    // Filter files within time range
    const recentFiles = files.filter(file => new Date(file.uploadedAt) >= startDate);
    
    // Calculate totals
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const uploadsThisMonth = recentFiles.length;
    
    // Calculate storage growth (mock calculation)
    const storageGrowth = recentFiles.reduce((sum, file) => sum + file.size, 0);
    
    // Group files by type
    const typeMap = new Map<string, { count: number; size: number }>();
    files.forEach(file => {
      const type = file.type.split('/')[0];
      const current = typeMap.get(type) || { count: 0, size: 0 };
      typeMap.set(type, {
        count: current.count + 1,
        size: current.size + file.size
      });
    });
    
    const colors: Record<string, string> = {
      image: "#10B981",
      application: "#EF4444", 
      text: "#3B82F6",
      video: "#8B5CF6",
      audio: "#F59E0B"
    };
    
    const filesByType = Array.from(typeMap.entries()).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: data.count,
      size: data.size,
      color: colors[type] || "#6B7280"
    }));
    
    // Generate upload timeline data
    const uploadsByDate = generateTimelineData(recentFiles, timeRangeDays);
    
    return {
      totalFiles,
      totalSize,
      uploadsThisMonth,
      storageGrowth,
      filesByType,
      uploadsByDate,
      recentActivity: files.slice(0, 5)
    };
  }, [timeRange]);

  const generateTimelineData = (files: FileUpload[], days: number) => {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayFiles = files.filter(file => {
        const fileDate = new Date(file.uploadedAt);
        return fileDate >= dayStart && fileDate <= dayEnd;
      });
      
      data.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uploads: dayFiles.length,
        size: dayFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024) // Convert to MB
      });
    }
    
    return data;
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch files data
      const response = await fetch("/api/user/files");
      if (!response.ok) {
        throw new Error("Failed to fetch files data");
      }
      
      const files: FileUpload[] = await response.json();
      
      // Process analytics data
      const processedData = processFilesData(files);
      setAnalyticsData(processedData);
      
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setError(error instanceof Error ? error.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [processFilesData]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">File upload and storage analytics</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            File upload and storage analytics
          </p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as "7d" | "30d" | "90d")}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Files"
          value={analyticsData.totalFiles.toString()}
          icon={Files}
          iconColor="bg-blue-500"
        />
        <StatCard
          title="Storage Used"
          value={formatFileSize(analyticsData.totalSize)}
          icon={HardDrive}
          iconColor="bg-green-500"
        />
        <StatCard
          title={`Uploads (${timeRange})`}
          value={analyticsData.uploadsThisMonth.toString()}
          change={analyticsData.uploadsThisMonth > 0 ? `+${analyticsData.uploadsThisMonth}` : "0"}
          changeType={analyticsData.uploadsThisMonth > 0 ? "positive" : "neutral"}
          icon={UploadIcon}
          iconColor="bg-purple-500"
        />
        <StatCard
          title="Storage Growth"
          value={formatFileSize(analyticsData.storageGrowth)}
          change={analyticsData.storageGrowth > 0 ? `+${formatFileSize(analyticsData.storageGrowth)}` : "0"}
          changeType={analyticsData.storageGrowth > 0 ? "positive" : "neutral"}
          icon={TrendingUp}
          iconColor="bg-indigo-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Timeline */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.uploadsByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === "uploads" ? `${value} files` : `${Number(value).toFixed(1)} MB`,
                    name === "uploads" ? "Files Uploaded" : "Size Uploaded"
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="uploads" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* File Types Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">File Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.filesByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type} (${count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.filesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} files`, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Storage by File Type */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Usage by File Type</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.filesByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis tickFormatter={(value) => formatFileSize(value)} />
              <Tooltip 
                formatter={(value) => [formatFileSize(Number(value)), "Storage Used"]}
              />
              <Bar dataKey="size" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        {analyticsData.recentActivity.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {analyticsData.recentActivity.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-md ${
                    file.type.startsWith('image/') ? 'bg-green-100 text-green-600' :
                    file.type === 'application/pdf' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Files className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {file.type.split('/')[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}