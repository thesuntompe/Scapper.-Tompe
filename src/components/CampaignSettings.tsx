import React, { useState } from "react";
import { 
  Compass, Cpu, Sparkles, Loader2, ArrowRight, ArrowLeft, 
  Search, Check, ShieldAlert, Star, Sliders, DollarSign, Activity
} from "lucide-react";
import { Lead } from "../types";

interface CampaignSettingsProps {
  onCampaignComplete: (newLeads: Lead[]) => void;
}

const CATEGORY_SUGGESTIONS = [
  "Restaurants", "Cafes", "Plumbing", "Electricians", "HVAC Services", "Gyms", "Beauty Salons", "Dentists"
];

const GLOBAL_SUGGESTIONS = [
  { label: "Sydney, Australia", city: "Sydney", state: "NSW", country: "Australia" },
  { label: "Hyderabad, India", city: "Hyderabad", state: "Telangana", country: "India" },
  { label: "London, UK", city: "London", state: "Greater London", country: "United Kingdom" },
  { label: "Dubai, UAE", city: "Dubai", state: "Dubai", country: "UAE" },
  { label: "Toronto, Canada", city: "Toronto", state: "Ontario", country: "Canada" },
  { label: "New York, USA", city: "New York", state: "NY", country: "USA" }
];

export default function CampaignSettings({ onCampaignComplete }: CampaignSettingsProps) {
  // Wizard steps: 
  // 0: Target Category
  // 1: Target Location (Country, State, City)
  // 2: Deficit Filters
  // 3: Budget & Price Target
  // 4: Review & Start Campaign
  const [wizardStep, setWizardStep] = useState(0);

  // States
  const [category, setCategory] = useState("Cafes");
  const [country, setCountry] = useState("Australia");
  const [state, setState] = useState("NSW");
  const [city, setCity] = useState("Sydney");
  const [zipCode, setZipCode] = useState("");
  
  const [minRating, setMinRating] = useState<number>(4.0);
  const [targetDeficit, setTargetDeficit] = useState<"all" | "no_website" | "broken_website" | "outdated">("all");
  const [pricingTarget, setPricingTarget] = useState<number>(2499);

  // Campaign progress loader
  const [loading, setLoading] = useState(false);
  const [currentProgressStep, setCurrentProgressStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const fullLocation = [city, state, country, zipCode].map(s => s?.trim()).filter(Boolean).join(", ");

  const progressSteps = [
    "Establishing secure quantum connection to Singularity AI grounding nodes...",
    `Scraping Google Maps directory indexes for real '${category}' in '${fullLocation}'...`,
    "Auditing search engine presence indices, mobile-first layouts, and SSL layers...",
    "Computing Lead Priority deficit matrices and extracting owners...",
    "Drafting context-aware personalized agency outreach templates...",
    "Generating verified leads portfolio and loading to active CRM ledger..."
  ];

  const handleNext = () => {
    if (wizardStep < 4) {
      setWizardStep(wizardStep + 1);
    }
  };

  const handlePrev = () => {
    if (wizardStep > 0) {
      setWizardStep(wizardStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !city.trim() || !country.trim()) return;

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
    }, 2500);

    try {
      const response = await fetch("/api/campaign/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location: fullLocation, minRating, targetDeficit, pricingTarget }),
      });

      if (!response.ok) {
        throw new Error("Failed to start research campaign");
      }

      const data = await response.json();
      
      setTimeout(() => {
        clearInterval(interval);
        onCampaignComplete(data);
        setLoading(false);
        setWizardStep(0); // Reset wizard for next campaign
      }, 500);

    } catch (error: any) {
      console.error(error);
      clearInterval(interval);
      setLogs((l) => [...l, `Execution failed: ${error.message}. Please verify Google Maps APIs.`]);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
      {/* Header Panel */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
          <Compass size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 font-sans tracking-tight">Lead Discovery Wizard</h2>
          <p className="text-[10px] text-slate-400 font-mono">REAL-TIME BUSINESS GROUNDING PIPELINE</p>
        </div>
      </div>

      {!loading ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step Progress Bar Indicators */}
          <div className="flex items-center justify-between gap-1.5 text-xs text-slate-400 font-mono font-bold pb-2 border-b border-slate-100/50">
            {["Category", "Location", "Filters", "Agency Settings", "Review"].map((label, index) => (
              <div key={label} className="flex items-center gap-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  wizardStep === index 
                    ? "bg-indigo-600 text-white font-bold" 
                    : wizardStep > index 
                      ? "bg-emerald-150 text-emerald-700 border border-emerald-200" 
                      : "bg-slate-50 border border-slate-200 text-slate-400"
                }`}>
                  {wizardStep > index ? <Check size={10} /> : index + 1}
                </span>
                <span className={`hidden md:inline text-[9px] ${wizardStep === index ? "text-slate-800 font-bold" : ""}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* STEP 1: CATEGORY SELECTION */}
          {wizardStep === 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">1. Select Business Category</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-800 font-sans"
                    placeholder="e.g., HVAC Services, Dental, Salons..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Recommended Sectors</span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`text-[10px] font-mono px-3 py-1 rounded-lg border transition-all cursor-pointer ${
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
            </div>
          )}

          {/* STEP 2: GLOBAL LOCATION TARGETING */}
          {wizardStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">2. Global Target Location</span>
              
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-800 font-sans"
                    placeholder="e.g. Australia"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">State / Region</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-800 font-sans"
                    placeholder="e.g. NSW"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-800 font-sans"
                    placeholder="e.g. Sydney"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Postal Code (Optional)</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-800 font-sans"
                    placeholder="e.g. 2000"
                  />
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">International Target Markets</span>
                <div className="flex flex-wrap gap-1.5">
                  {GLOBAL_SUGGESTIONS.map((item) => {
                    const isActive = city.toLowerCase() === item.city.toLowerCase() && country.toLowerCase() === item.country.toLowerCase();
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setCity(item.city);
                          setState(item.state);
                          setCountry(item.country);
                          setZipCode("");
                        }}
                        className={`text-[9px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? "bg-indigo-600 border-indigo-700 text-white font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DEFICIT FILTERS */}
          {wizardStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">3. Deficit Targeting Criteria</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Minimum Google Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-sans"
                  >
                    <option value="3.5">3.5 Stars & above</option>
                    <option value="4.0">4.0 Stars & above</option>
                    <option value="4.5">4.5 Stars & above</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Website Quality Deficit</label>
                  <select
                    value={targetDeficit}
                    onChange={(e) => setTargetDeficit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-sans"
                  >
                    <option value="all">Any Deficit (Absence, Broken, Old, Unresponsive)</option>
                    <option value="no_website">Strictly No Website</option>
                    <option value="broken_website">Broken / Non-functional SSL</option>
                    <option value="outdated">Legacy / Mobile Unfriendly</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex gap-3 text-xs text-slate-500 font-sans">
                <Sliders size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Deficit Intelligence</strong>: Out of identified leads, Singularity AI automatically prioritizes those with verified digital vulnerabilities, optimizing outreach conversion rates.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: BUDGET & PROPOSAL CONTRACT SETTINGS */}
          {wizardStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">4. Agency Offer Parameters</span>
              
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">Agency Base Pricing Goal (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="number"
                    value={pricingTarget}
                    onChange={(e) => setPricingTarget(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-sans"
                    placeholder="2499"
                    required
                  />
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex gap-3 text-xs text-indigo-800 font-sans">
                <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Automatic Proposals</strong>: Singularity AI will anchor all customized contracts and interactive pricing slide sheets to this goal ($ {pricingTarget.toLocaleString()}).
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & EXECUTE CAMPAIGN */}
          {wizardStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">5. Review Campaign Configuration</span>
              
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 font-sans text-xs text-slate-600 space-y-2.5">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-mono text-[10px] uppercase text-slate-400">Target Category:</span>
                  <span className="font-bold text-slate-800">{category}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-mono text-[10px] uppercase text-slate-400">Target Location:</span>
                  <span className="font-bold text-slate-800">{fullLocation}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-mono text-[10px] uppercase text-slate-400">Min Rating:</span>
                  <span className="font-bold text-slate-800">{minRating} Stars</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-mono text-[10px] uppercase text-slate-400">Vulnerability Filter:</span>
                  <span className="font-bold text-slate-800 uppercase">{targetDeficit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] uppercase text-slate-400">Target Contract Price:</span>
                  <span className="font-bold text-indigo-600">${pricingTarget.toLocaleString()} USD</span>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Action Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {wizardStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold font-sans flex items-center gap-1 transition-all cursor-pointer"
              >
                <ArrowLeft size={13} />
                Back
              </button>
            ) : (
              <div />
            )}

            {wizardStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold font-sans flex items-center gap-1 transition-all cursor-pointer"
              >
                Next Step
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="submit"
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95"
              >
                <Sparkles size={14} />
                Run Lead Discovery Grounding
              </button>
            )}
          </div>

        </form>
      ) : (
        /* Progress loader with logs terminal */
        <div className="space-y-4 py-1">
          {/* Active progress bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-sans text-xs text-indigo-700 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <Loader2 className="animate-spin text-indigo-600 shrink-0" size={16} />
              <span className="text-slate-700 text-[11px] font-medium leading-tight">{progressSteps[currentProgressStep]}</span>
            </div>
            <span className="text-slate-500 font-mono font-bold text-[10px]">{Math.round((currentProgressStep / progressSteps.length) * 100)}%</span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentProgressStep + 1) / progressSteps.length) * 100}%` }}
            />
          </div>

          {/* Active Logs Terminal */}
          <div className="bg-slate-900 border border-slate-950 rounded-xl p-4 font-mono text-[10px] text-slate-400 h-44 overflow-y-auto space-y-1.5 shadow-inner">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-1.5 text-slate-400">
                <span className="text-emerald-500 font-bold shrink-0">✔</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-indigo-400 animate-pulse font-semibold">
              <span>▶</span>
              <span className="text-slate-200">{progressSteps[currentProgressStep]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
