import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import ThreeCanvasBackground from "../components/ThreeCanvasBackground";

export const metadata: Metadata = {
  title: "SIRUS - Automated Multi-Tenant Trading Platform",
  description: "Enterprise Algorithmic Trading Platform supporting Equities & Crypto",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050814] text-gray-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <ThreeCanvasBackground />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

