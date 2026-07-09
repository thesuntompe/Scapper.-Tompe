import React, { useState } from "react";
import { 
  Settings, Sliders, Key, Globe, Shield, Sparkles, Check, Info
} from "lucide-react";
import Logo from "./Logo";

export default function SettingsView() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("singularity_maps_api_key") || "");
  const [googleClient, setGoogleClient] = useState(() => localStorage.getItem("singularity_google_client_id") || "");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("singularity_maps_api_key", apiKey);
    localStorage.setItem("singularity_google_client_id", googleClient);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1200);
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-md font-bold text-slate-800 font-sans tracking-tight">System Settings</h2>
          <p className="text-[10px] text-slate-400 font-mono">AGENCY BRANDING & GROUNDING ACCESS TOKENS</p>
        </div>
      </div>

      {/* Visual Rebranding card (Showcasing the Singularity AI logo!) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Logo size="lg" showText={true} />
          <p className="text-xs text-slate-500 font-sans max-w-md pt-2">
            Singularity AI is a unified local business growth tool designed to audit digital deficits, pitch owners customized proposals, build Tailwind sitemaps instantly, and collect agency revenue.
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-2 text-[10px] font-mono text-slate-400">
          <span className="font-bold text-slate-700 block text-xs border-b border-slate-100 pb-1">Brand Palette Specifications</span>
          <p><span className="text-slate-500">Primary Color:</span> <span className="font-bold text-indigo-600">#4F46E5</span></p>
          <p><span className="text-slate-500">Secondary Color:</span> <span className="font-bold text-indigo-500">#6366F1</span></p>
          <p><span className="text-slate-500">Background:</span> <span className="font-bold text-slate-900">#F8FAFC</span></p>
          <p><span className="text-slate-500">Tagline:</span> <span className="italic font-bold text-slate-700">Find. Build. Scale.</span></p>
        </div>
      </div>

      {/* Core Setup Form */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Key size={14} className="text-indigo-600" />
          Integration Credentials
        </h3>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">Google Maps Places API Key</label>
              <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noreferrer" className="text-[9px] text-indigo-600 font-bold hover:underline">Get Key</a>
            </div>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..." 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 font-mono text-[10px]"
            />
            <p className="text-[9px] text-slate-400 leading-normal font-sans">Used to scrape real-time business rating, location and contact intelligence across international cities.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">Google Auth Client ID (Outreach Email)</label>
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-[9px] text-indigo-600 font-bold hover:underline">Get Client ID</a>
            </div>
            <input 
              type="text" 
              value={googleClient} 
              onChange={(e) => setGoogleClient(e.target.value)}
              placeholder="e.g., 12345-abcde.apps.googleusercontent.com" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 font-mono text-[10px]"
            />
            <p className="text-[9px] text-slate-400 leading-normal font-sans">Used to securely authorize Gmail integration so your agency can dispatch outreach sequences from your active mailbox.</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Shield size={11} className="text-emerald-500" />
              Credentials stored securely in local browser environment.
            </div>
            <button
              type="submit"
              disabled={isSaved}
              className="py-2 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-emerald-600 disabled:hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
            >
              {isSaved ? <Check size={11} /> : null}
              {isSaved ? "Saved credentials" : "Save Integration Keys"}
            </button>
          </div>
        </form>
      </div>

      {/* Guide Card */}
      <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 flex gap-4 text-xs text-indigo-800 font-sans leading-relaxed">
        <Info size={20} className="text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Proactive Grounding Safeguards</p>
          <p className="text-slate-600 text-[11px]">
            To ensure zero "fake AI" simulation slop, Singularity AI coordinates with official live endpoints. If custom API credentials are left blank, the platform automatically utilizes a local resilient procedurally generated backup data set.
          </p>
        </div>
      </div>

    </div>
  );
}
