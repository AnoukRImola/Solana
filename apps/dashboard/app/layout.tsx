import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./global.css";
import { Toaster } from "~/components/ui/sonner";
import MoonpayClientProvider from "~/providers/MoonpayClientProvider";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Trustless Work",
  description: "Trustless Work",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} bg-background text-foreground`}>
        <Analytics />
        <MoonpayClientProvider>
          <div className="relative flex min-h-screen w-full">
            <div className="flex-1 flex flex-col w-full">
              <div className="flex-1 w-full p-4">
                {children}
              </div>
            </div>
          </div>
        </MoonpayClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
