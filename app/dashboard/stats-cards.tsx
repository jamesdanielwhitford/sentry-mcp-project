// app/dashboard/stats-cards.tsx
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
      color: "bg-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      textColor: "text-blue-700 dark:text-blue-300"
    },
    {
      name: "Storage Used",
      value: formatFileSize(totalSize),
      icon: HardDrive,
      color: "bg-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      textColor: "text-green-700 dark:text-green-300"
    },
    {
      name: "Member Since",
      value: formatDate(joinedDate).split(',')[0],
      icon: Calendar,
      color: "bg-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      textColor: "text-purple-700 dark:text-purple-300"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                </dd>
              </dl>
            </div>
          </div>
          <div className={`absolute inset-0 ${stat.bgColor} rounded-xl opacity-20`} />
        </div>
      ))}
    </div>
  );
}