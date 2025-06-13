// components/dashboard/header.tsx
"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, User } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        {isMenuOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex lg:ml-0">
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Welcome back, {session?.user?.name || "User"}
              </h2>
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center lg:ml-6">
          <div className="ml-3 relative">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/profile"
                className="flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <User className="h-5 w-5 mr-1" />
                Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}