import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "@/lib/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seattle Auto Haus - Premium Vehicle Dealership",
  description: "Discover our premium selection of luxury and performance vehicles with instant search and real-time results.",
  keywords: ["Seattle", "Auto", "Dealership", "Luxury", "Vehicles", "Cars", "BMW", "Mercedes", "Audi"],
  authors: [{ name: "Seattle Auto Haus" }],
  openGraph: {
    title: "Seattle Auto Haus",
    description: "Premium vehicle dealership serving the greater Seattle area",
    url: "https://seattleautohaus.com",
    siteName: "Seattle Auto Haus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seattle Auto Haus",
    description: "Premium vehicle dealership serving the greater Seattle area",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
