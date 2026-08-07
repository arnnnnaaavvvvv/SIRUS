"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Sliders, Link2, History, LogOut, TrendingUp, ShieldCheck, Globe } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Strategies", href: "/strategies", icon: Sliders },
    { label: "Markets", href: "/markets", icon: Globe },
    { label: "Trade History", href: "/trades", icon: History },
    { label: "Linked Accounts", href: "/settings/api-keys", icon: Link2 },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-blue-400 bg-clip-text text-transparent">
              SIRUS TRADING
            </span>
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">Multi-Tenant Live</span>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-gray-200">{user?.email || "trader@sirus.io"}</span>
            <span className="text-[10px] text-gray-400 font-mono">Tenant ID: 22222222</span>
          </div>

          <button
            onClick={() => logout()}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
