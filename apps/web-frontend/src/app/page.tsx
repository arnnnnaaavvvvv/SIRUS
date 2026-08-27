"use client";

import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/landing/HeroSection";
import LogoCloud from "../components/landing/LogoCloud";
import BentoFeatures from "../components/landing/BentoFeatures";
import LiveSimulator from "../components/landing/LiveSimulator";
import StatsSection from "../components/landing/StatsSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import PricingSection from "../components/landing/PricingSection";
import FaqSection from "../components/landing/FaqSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-grow">
        <HeroSection />
        <LogoCloud />
        <div id="features">
          <BentoFeatures />
        </div>
        <div id="simulator">
          <LiveSimulator />
        </div>
        <StatsSection />
        <TestimonialsSection />
        <div id="pricing">
          <PricingSection />
        </div>
        <div id="faq">
          <FaqSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
