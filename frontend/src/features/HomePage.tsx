import HomeNavbar from "../components/layout/HomeNavbar";
import PricingSection from "../components/pricing/PricingSection";
import HeroSection from "../components/HeroSection";
import FeaturesGrid from "../components/FeaturesGrid";
import DemoModal from "../components/demo/DemoModal";
import { useState } from "react";

const HomePage = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-100 min-h-screen text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-200/50 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
      <HomeNavbar />

      <main className="relative max-w-7xl mx-auto px-6 py-20">
        <HeroSection onViewDemo={() => setIsDemoOpen(true)} />

        <div className="py-16">
          <FeaturesGrid />
        </div>

        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

        <section id="solutions" className="py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Integrations",
                description: "Connect your tools and keep everything in sync.",
              },
              {
                title: "Automation",
                description: "Reduce manual updates with workflow automations.",
              },
              {
                title: "Reporting",
                description: "Turn board activity into actionable team metrics.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/95 rounded-2xl border border-slate-200 p-8 shadow-md transition-all duration-300 hover:shadow-xl">
                <div className="text-lg font-semibold mb-3">{item.title}</div>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <PricingSection />
      </main>
    </div>
  );
};

export default HomePage;
