import React, { useState, useEffect } from "react";
import { Search, Compass, Cpu, Sparkles, Loader2 } from "lucide-react";
import { Lead } from "../types";

interface CampaignSettingsProps {
  onCampaignComplete: (newLeads: Lead[]) => void;
}

const CATEGORY_SUGGESTIONS = [
  "Restaurants", "Cafes", "Plumbing", "Electricians", "HVAC Services", "Gyms", "Beauty Salons", "Dentists"
];

const USA_CITIES = [
  "Miami, FL", "Austin, TX", "Seattle, WA", "Denver, CO", "Chicago, IL", "Boston, MA", "Phoenix, AZ"
];

export default function CampaignSettings({ onCampaignComplete }: CampaignSettingsProps) {
  const [category, setCategory] = useState("Cafes");
  const [location, setLocation] = useState("Miami, FL");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const steps = [
    "Initializing Enterprise business search grounding...",
    `Accessing Google Maps database for real '${category}' in '${location}'...`,
    "Evaluating target online presence: auditing mobile compliance, SSL security status, and review metrics...",
    "Running AI business research analysis: compiling history, services, and market competitor indexes...",
    "Computing Lead Priority Score based on quality deficit indicators...",
    "Compiling verified outreach templates and detailed business dossiers...",
    "Campaign completed! Synchronizing lead cards within secure SaaS CRM ledger..."
  ];

  useEffect(() => {
    if (!loading) return;
    
    // Simulate steps progress visually
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          const next = prev + 1;
          setLogs((l) => [...l, `${steps[prev]}`]);
          return next;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [loading, category, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !location.trim()) return;

    setLoading(true);
    setCurrentStep(0);
    setLogs([]);
    
    try {
      const response = await fetch("/api/campaign/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location }),
      });

      if (!response.ok) {
        throw new Error("Failed to start research campaign");
      }

      const data = await response.json();
      
      // Ensure the visual simulation finishes
      setTimeout(() => {
        onCampaignComplete(data);
        setLoading(false);
      }, 500);

    } catch (error: any) {
      console.error(error);
      setLogs((l) => [...l, `Campaign execution failed: ${error.message}. Retrying...`]);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
          <Cpu size={18} />
        </div>
        <div>
          <h2 className="text-md font-bold text-slate-800 font-sans tracking-tight">Launch Grounded Lead Campaign</h2>
          <p className="text-[10px] text-slate-400 font-mono">REAL-TIME RESEARCH GROUNDING PIPELINE</p>
        </div>
      </div>

      {!loading ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Business Category</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-800 font-sans"
                  placeholder="e.g., HVAC Services, Cafes, Plumbers..."
                  required
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {CATEGORY_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                      category === item
                        ? "bg-slate-900 border-slate-950 text-white font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">US Location</label>
              <div className="relative">
                <Compass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-800 font-sans"
                  placeholder="City, State (e.g. Dallas, TX)"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {USA_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setLocation(city)}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                      location === city
                        ? "bg-slate-900 border-slate-950 text-white font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
          >
            <Sparkles size={14} />
            Initialize Campaign Grounding Search
          </button>
        </form>
      ) : (
        <div className="space-y-4 py-1">
          {/* Active progress bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-sans text-xs text-indigo-700 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <Loader2 className="animate-spin text-indigo-600 shrink-0" size={16} />
              <span className="text-slate-700 text-[11px] font-medium leading-tight">{steps[currentStep]}</span>
            </div>
            <span className="text-slate-500 font-mono font-bold text-[10px]">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>

          <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Active Logs Terminal */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-[10px] text-slate-500 h-44 overflow-y-auto space-y-1.5 shadow-inner">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-1.5 text-slate-600">
                <span className="text-emerald-600 font-bold shrink-0">✔</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-indigo-600 animate-pulse font-semibold">
              <span>▶</span>
              <span className="text-slate-100">{steps[currentStep]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
