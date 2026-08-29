import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import ThreeCanvasBackground from "../components/ThreeCanvasBackground";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "SIRUS - Automated Multi-Tenant Trading Platform",
  description: "Enterprise Algorithmic Trading Platform supporting Equities & Crypto with Vectorized Backtesting",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-full dark">
      <body className={`${inter.className} bg-[#0f1515] text-[#f4f4f5] min-h-screen antialiased selection:bg-[#fff800]/20 selection:text-white relative`}>
        {/* Paddle Ambient Background Layers */}
        <div className="grain-blur background-base pointer-events-none" />
        <div className="grain-background background-base pointer-events-none" />
        <div className="grid-bg background-base pointer-events-none" />
        <div className="large-blur background-base pointer-events-none" />
        <div className="small-blur background-base pointer-events-none" />

        <ThreeCanvasBackground />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
