// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatsCards } from "../dashboard/stats-cards";
import { RecentFiles } from "../dashboard/recent-files";
import { WeatherWidget } from "../dashboard/weather-widget";
import { ActivityChart } from "../dashboard/activity-chart";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  // Fetch user data and stats
  const [user, filesCount, recentFiles] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    }),
    db.file.count({
      where: { userId: session.user.id }
    }),
    db.file.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        originalName: true,
        size: true,
        type: true,
        uploadedAt: true
      }
    })
  ]);

  const totalSize = await db.file.aggregate({
    where: { userId: session.user.id },
    _sum: { size: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your account.
        </p>
      </div>

      <StatsCards
        filesCount={filesCount}
        totalSize={totalSize._sum.size || 0}
        joinedDate={user?.createdAt || new Date()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <WeatherWidget location={user?.settings?.weatherLocation || "New York"} />
        </div>
        <div className="lg:col-span-1">
          <ActivityChart userId={session.user.id} />
        </div>
      </div>

      <RecentFiles files={recentFiles} />
    </div>
  );
}