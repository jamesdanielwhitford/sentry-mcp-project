// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";


export const metadata: Metadata = {
  title: "Dashboard App",
  description: "A modern dashboard with file management and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
