import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
// @ts-ignore
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "TeachNLearn Academy - Learn anything",
  description: "Master anything with practical, hands-on courses",
  generator: "v0.app",
};

import { TRPCProvider } from "@/lib/trpc/Provider";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <TRPCProvider>
          {children}
          <Toaster position="top-center" />
        </TRPCProvider>
      </body>
    </html>
  );
}
