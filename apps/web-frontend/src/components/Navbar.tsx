"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  TrendingUp,
  LayoutDashboard,
  Sliders,
  Globe,
  History,
  Link2,
  Menu,
  X,
  ArrowRight,
  LogIn,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = pathname === "/";

  const appNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Strategies", href: "/strategies", icon: Sliders },
    { label: "Markets", href: "/markets", icon: Globe },
    { label: "Trade Ledger", href: "/trades", icon: History },
    { label: "Linked Demat", href: "/settings/api-keys", icon: Link2 },
  ];

  const landingNavItems = [
    { label: "Features", href: "#features" },
    { label: "Simulator", href: "#simulator" },
    { label: "Markets", href: "/markets" },
    { label: "Strategies", href: "/strategies" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Main Navigation Bar */}
      <nav className="border-b border-border/50 bg-[#0f1515]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#182222] border border-border flex items-center justify-center group-hover:border-border-light transition-all shadow-sm">
              <TrendingUp className="w-4 h-4 text-[#fff800]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
              SIRUS
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#182222] text-[#fff800] border border-border ml-1">
                Quant
              </span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {isLanding
              ? landingNavItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-3.5 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[#182222]/60 transition-all"
                  >
                    {item.label}
                  </Link>
                ))
              : appNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                        active
                          ? "bg-[#182222] text-foreground border border-border shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-[#182222]/40"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
          </div>

          {/* Right CTA / Auth Status */}
          <div className="hidden md:flex items-center space-x-3">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium cursor-pointer relative bg-[#fcfcfc33] text-white secondary-button-animation h-10 px-5 py-2 border border-white/10 hover:bg-white/20"
                >
                  <span>Launch Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-[#182222] border border-border"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-[#0f1515]/95 backdrop-blur-2xl px-4 py-4 space-y-3">
            <div className="space-y-1">
              {(isLanding ? landingNavItems : appNavItems).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[#182222]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {!user ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded-md bg-[#182222] border border-border text-sm font-medium text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded-md bg-[#fcfcfc33] border border-white/10 text-sm font-medium text-white"
                  >
                    Launch Terminal
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-md bg-[#182222] border border-border text-sm font-medium text-white"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
