// components/dashboard/activity-chart.tsx
"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ActivityData {
  date: string;
  uploads: number;
}

interface ActivityChartProps {
  userId: string;
}

export function ActivityChart({ userId }: ActivityChartProps) {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        // Generate sample data for the last 7 days
        const today = new Date();
        const sampleData: ActivityData[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          sampleData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            uploads: Math.floor(Math.random() * 5) + 1
          });
        }
        
        setData(sampleData);
      } catch (error) {
        console.error("Failed to fetch activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Overview</h3>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
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
    </div>
  );
}