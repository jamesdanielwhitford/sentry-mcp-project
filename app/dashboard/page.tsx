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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      <StatsCards
        filesCount={filesCount}
        totalSize={totalSize._sum.size || 0}
        joinedDate={user?.createdAt || new Date()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <WeatherWidget location={user?.settings?.weatherLocation || "New York"} />
        </div>
        <div className="space-y-6">
          <ActivityChart userId={session.user.id} />
        </div>
      </div>

      <RecentFiles files={recentFiles} />
    </div>
  );
}