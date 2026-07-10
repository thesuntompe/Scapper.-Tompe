import React, { useState } from "react";
import { 
  Compass, Sparkles, Loader2, Search, Check, MapPin, AlertTriangle
} from "lucide-react";
import { Lead } from "../types";

interface CampaignSettingsProps {
  onCampaignComplete: (newLeads: Lead[]) => void;
}

const CATEGORY_SUGGESTIONS = [
  "Restaurants", "Cafes", "Plumbing", "Electricians", "HVAC Services", "Gyms", "Beauty Salons", "Dentists"
];

const SUPPORTED_COUNTRIES = [
  "USA", "India", "Australia", "Canada", "UK", "Germany", "Singapore", "UAE"
];

export default function CampaignSettings({ onCampaignComplete }: CampaignSettingsProps) {
  // States
  const [category, setCategory] = useState("Cafes");
  const [country, setCountry] = useState("USA");
  const [customCountry, setCustomCountry] = useState("");
  const [city, setCity] = useState("New York");
  const [customCity, setCustomCity] = useState("");
  
  // Selected Filters
  const [filters, setFilters] = useState({
    noWebsite: true,
    outdatedWebsite: true,
    noMobileOptimization: true,
    noSSL: false,
    poorSEO: true,
    noBookingSystem: false,
    poorReviews: false
  });

  const [pricingTarget] = useState(2500); // Standard price target

  // Loader
  const [loading, setLoading] = useState(false);
  const [currentProgressStep, setCurrentProgressStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const activeCountry = country === "Custom" ? customCountry : country;
  const activeCity = city === "Custom" ? customCity : city;
  const fullLocation = [activeCity, activeCountry].filter(Boolean).join(", ");

  const progressSteps = [
    "Connecting to Google Search and Maps index...",
    `Searching for active businesses in '${category}' within '${fullLocation}'...`,
    "Extracting real-time business contact numbers and physical addresses...",
    "Verifying public business emails and social profiles...",
    "Finalizing verified local business contact profiles..."
  ];

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category.trim();
    const finalCountry = activeCountry.trim();
    const finalCity = activeCity.trim();

    if (!finalCategory || !finalCountry || !finalCity) return;

    setLoading(true);
    setCurrentProgressStep(0);
    setLogs([]);
    
    // Simulate campaign step-by-step progress logging
    const interval = setInterval(() => {
      setCurrentProgressStep((prev) => {
        if (prev < progressSteps.length - 1) {
          const next = prev + 1;
          setLogs((l) => [...l, progressSteps[prev]]);
          return next;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 2000);

    try {
      const response = await fetch("/api/campaign/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          category: finalCategory, 
          location: fullLocation, 
          pricingTarget,
          filters
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start research campaign");
      }

      const data = await response.json();
      
      setTimeout(() => {
        clearInterval(interval);
        onCampaignComplete(data);
        setLoading(false);
      }, 500);

    } catch (error: any) {
      console.error(error);
      clearInterval(interval);
      setLogs((l) => [...l, `Execution failed: ${error.message}.`]);
      setLoading(false);
    }
  };


  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-xl animate-fadeIn text-[#F8FAFC]">
      {/* Header Panel */}
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-[#1F2937]">
        <div className="p-2 bg-[#7C3AED]/15 border border-[#7C3AED]/20 text-[#A855F7] rounded-lg">
          <Compass size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white font-sans tracking-tight">Local Business Intelligence Discovery</h2>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5">FIND REAL-WORLD CONTACT DETAILS</p>
        </div>
      </div>

      {!loading ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Lead Intelligence & Client Info */}
            <div className="space-y-5">
              
              {/* SECTION: Lead Intelligence */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-900 pb-1.5">
                  Lead Intelligence
                </h3>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold">Target Industry</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#0B1020] border border-[#1F2937] text-white rounded-lg text-xs focus:outline-none focus:border-[#7C3AED] font-sans"
                      placeholder="e.g., Dental, HVAC, Electricians, Cafes..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">Recommended Industries</span>
                  <div className="flex flex-wrap gap-1">
                    {CATEGORY_SUGGESTIONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          category === item
                            ? "bg-[#7C3AED] border-[#7C3AED] text-white font-bold"
                            : "bg-[#0B1020] border-[#1F2937] text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION: Client Information (Location) */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-900 pb-1.5">
                  Client Information
                </h3>
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold">Select Country</label>
                  <div className="grid grid-cols-4 gap-1">
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCountry(c)}
                        className={`py-1 px-1.5 border rounded-md text-center font-sans text-[10px] transition-all cursor-pointer ${
                          country === c
                            ? "bg-[#7C3AED]/20 border-[#7C3AED] text-white font-bold"
                            : "bg-[#0B1020] border-[#1F2937] text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCountry("Custom")}
                      className={`py-1 px-1.5 border rounded-md text-center font-sans text-[10px] transition-all cursor-pointer ${
                        country === "Custom"
                          ? "bg-[#7C3AED]/20 border-[#7C3AED] text-white font-bold"
                          : "bg-[#0B1020] border-[#1F2937] text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {country === "Custom" && (
                    <div className="animate-fadeIn pt-1">
                      <input
                        type="text"
                        value={customCountry}
                        onChange={(e) => setCustomCountry(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#0B1020] border border-[#1F2937] text-white rounded-lg text-xs focus:outline-none focus:border-[#7C3AED] font-sans"
                        placeholder="e.g. France, Japan"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold">Target City</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "New York", countryVal: "USA" },
                      { label: "Sydney", countryVal: "Australia" },
                      { label: "Hyderabad", countryVal: "India" },
                      { label: "London", countryVal: "UK" }
                    ].map((ct) => (
                      <button
                        key={ct.label}
                        type="button"
                        onClick={() => {
                          setCity(ct.label);
                          setCountry(ct.countryVal);
                        }}
                        className={`p-2 border rounded-lg text-left font-sans text-xs transition-all cursor-pointer flex items-center gap-2 ${
                          city === ct.label
                            ? "bg-[#7C3AED]/20 border-[#7C3AED] text-white font-bold"
                            : "bg-[#0B1020] border-[#1F2937] text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        <MapPin size={11} className="text-slate-500" />
                        <div>
                          <p className="font-bold text-[11px] leading-tight">{ct.label}</p>
                          <p className="text-[8px] text-slate-500 font-mono">{ct.countryVal}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCity("Custom")}
                      className={`p-2 border rounded-lg text-left font-sans text-xs transition-all cursor-pointer flex items-center gap-2 ${
                        city === "Custom"
                          ? "bg-[#7C3AED]/20 border-[#7C3AED] text-white font-bold"
                          : "bg-[#0B1020] border-[#1F2937] text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <MapPin size={11} className="text-[#A855F7]" />
                      <span className="text-[11px]">Custom City</span>
                    </button>
                  </div>

                  {city === "Custom" && (
                    <div className="animate-fadeIn pt-1">
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#0B1020] border border-[#1F2937] text-white rounded-lg text-xs focus:outline-none focus:border-[#7C3AED] font-sans"
                        placeholder="e.g. Paris, Dubai, Munich"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Website Configuration & Target Summary */}
            <div className="space-y-5">
              
              {/* SECTION: Website Configuration */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-900 pb-1.5">
                  Website Configuration
                </h3>
                
                <span className="block text-[10px] font-mono uppercase text-slate-500 font-bold">Vulnerability Filters</span>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: "noWebsite" as const, label: "No Website Deficit" },
                    { key: "outdatedWebsite" as const, label: "Outdated Website layout" },
                    { key: "noMobileOptimization" as const, label: "No Mobile Optimization" },
                    { key: "noSSL" as const, label: "No SSL (Unsecured HTTPS)" },
                    { key: "poorSEO" as const, label: "Poor SEO Metadata Presence" },
                    { key: "noBookingSystem" as const, label: "No Live Booking System" },
                    { key: "poorReviews" as const, label: "Poor Reviews / Low Rating Target" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleFilter(item.key)}
                      className={`flex items-center gap-2.5 p-1.5 rounded-lg text-left border transition-all cursor-pointer ${
                        filters[item.key]
                          ? "bg-[#7C3AED]/10 border-[#7C3AED] text-white"
                          : "bg-[#0B1020] border-[#1F2937] text-slate-400 hover:border-[#1F2937]/80"
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                        filters[item.key] ? "bg-[#7C3AED] border-[#7C3AED] text-white" : "border-[#1F2937]"
                      }`}>
                        {filters[item.key] && <Check size={10} />}
                      </div>
                      <span className="text-[11px] font-medium font-sans">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Targets Summary Widget */}
              <div className="bg-[#0B1020] border border-[#1F2937] rounded-xl p-4 space-y-2.5">
                <span className="block text-[10px] font-mono uppercase text-slate-400 font-bold">Target Parameters</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-sans text-slate-300">
                  <div className="bg-[#111827]/60 p-2 rounded border border-slate-900">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase">Target Location</span>
                    <span className="font-bold text-slate-200 truncate block mt-0.5">{fullLocation || "Not Selected"}</span>
                  </div>
                  <div className="bg-[#111827]/60 p-2 rounded border border-slate-900">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase">Baseline Budget</span>
                    <span className="font-bold text-indigo-400 block mt-0.5">${pricingTarget.toLocaleString()} USD</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Action Trigger Row */}
          <div className="pt-4 border-t border-[#1F2937] flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white rounded-lg text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-[#7C3AED]/30 hover:scale-[1.01] active:scale-[0.98]"
            >
              <Sparkles size={13} />
              Launch Discovery Scan
            </button>
          </div>
        </form>
      ) : (
        /* Campaign progress view with logs */
        <div className="space-y-4 py-2">
          <div className="bg-[#0B1020] border border-[#1F2937] rounded-lg p-3 text-xs text-slate-300 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-[#A855F7] shrink-0" size={14} />
              <span className="text-slate-200 text-[10px] font-medium leading-none">{progressSteps[currentProgressStep]}</span>
            </div>
            <span className="text-slate-400 font-mono font-bold text-[10px]">{Math.round((currentProgressStep / progressSteps.length) * 100)}%</span>
          </div>

          <div className="w-full bg-[#1F2937] h-1 rounded-full overflow-hidden">
            <div
              className="bg-[#7C3AED] h-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentProgressStep + 1) / progressSteps.length) * 100}%` }}
            />
          </div>

          <div className="bg-[#030712] border border-[#1F2937] rounded-lg p-3 font-mono text-[9px] text-slate-500 h-36 overflow-y-auto space-y-1 shadow-inner">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-1 text-slate-400 animate-fadeIn">
                <span className="text-emerald-500 font-bold shrink-0">✔</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-[#A855F7] animate-pulse font-semibold">
              <span>▶</span>
              <span className="text-slate-300">{progressSteps[currentProgressStep]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
