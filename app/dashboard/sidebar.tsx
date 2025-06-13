// components/dashboard/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Upload, 
  Settings, 
  BarChart3,
  Files 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Files", href: "/dashboard/files", icon: Files },
  { name: "Upload", href: "/dashboard/upload", icon: Upload },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-indigo-100 text-indigo-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive
                          ? "text-indigo-500"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 flex-shrink-0 h-5 w-5"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}