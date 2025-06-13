// app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
            Welcome to Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-balance leading-relaxed">
            A modern dashboard application with file management, analytics, and more. 
            Built with the latest technologies for the best user experience.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/login" className="block">
            <Button size="lg" className="w-full">
              Sign In
            </Button>
          </Link>
          
          <Link href="/signup" className="block">
            <Button variant="outline" size="lg" className="w-full">
              Create Account
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>Built with</span>
            <div className="flex items-center space-x-1">
              <span className="font-medium">Next.js</span>
              <span>•</span>
              <span className="font-medium">Prisma</span>
              <span>•</span>
              <span className="font-medium">NextAuth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}