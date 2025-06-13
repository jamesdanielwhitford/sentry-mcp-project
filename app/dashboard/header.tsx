// app/dashboard/header.tsx
"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, User, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-card shadow-sm border-b border-border">
      <Button
        variant="ghost"
        size="icon"
        className="px-4 border-r border-border lg:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        {isMenuOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </Button>
      
      <div className="flex-1 px-6 flex justify-between items-center">
        <div className="flex-1 flex">
          <div className="w-full flex lg:ml-0">
            <div className="flex items-center">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground">
                  {session?.user?.name || "User"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Link href="/dashboard/profile">
            <Button variant="ghost" size="sm" className="h-9">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="h-9"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}