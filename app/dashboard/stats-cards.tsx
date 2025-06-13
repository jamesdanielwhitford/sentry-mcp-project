// components/dashboard/stats-cards.tsx
import { Files, HardDrive, Calendar } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";

interface StatsCardsProps {
  filesCount: number;
  totalSize: number;
  joinedDate: Date;
}

export function StatsCards({ filesCount, totalSize, joinedDate }: StatsCardsProps) {
  const stats = [
    {
      name: "Total Files",
      value: filesCount.toString(),
      icon: Files,
      color: "text-blue-600 bg-blue-100"
    },
    {
      name: "Storage Used",
      value: formatFileSize(totalSize),
      icon: HardDrive,
      color: "text-green-600 bg-green-100"
    },
    {
      name: "Member Since",
      value: formatDate(joinedDate).split(',')[0], // Just the date part
      icon: Calendar,
      color: "text-purple-600 bg-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
        >
          <dt>
            <div className={`absolute p-3 rounded-md ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 text-sm font-medium text-gray-500 truncate">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </dd>
        </div>
      ))}
    </div>
  );
}