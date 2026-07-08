import React, { useState, useEffect } from "react";
import { ArrowLeft, Cpu, Database, Sparkles, Clock, Activity, ShieldCheck, MailOpen, Terminal } from "lucide-react";
import { Lead } from "./types";
import MetricCards from "./components/MetricCards";
import CampaignSettings from "./components/CampaignSettings";
import LeadsDashboard from "./components/LeadsDashboard";
import LeadDossierTab from "./components/LeadDossierTab";
import EmailOutreachTab from "./components/EmailOutreachTab";
import AIWebsiteWorkspaceTab from "./components/AIWebsiteWorkspaceTab";

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [consoleTab, setConsoleTab] = useState<"dossier" | "outreach" | "website">("dossier");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "high_priority" | "sent" | "sites_built" | "revenue">("all");

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/leads");
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (e) {
      console.error("Error fetching leads:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignComplete = (newLeads: Lead[]) => {
    // Prepend newly discovered leads directly to state to prevent any async race conditions
    setLeads((prevLeads) => {
      const existingIds = new Set(prevLeads.map((l) => l.id));
      const filteredNew = newLeads.filter((nl) => !existingIds.has(nl.id));
      return [...filteredNew, ...prevLeads];
    });
    if (newLeads.length > 0) {
      // Auto-select the first newly discovered lead
      setSelectedLeadId(newLeads[0].id);
      setConsoleTab("dossier");
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setConsoleTab("dossier");
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prevLeads) =>
      prevLeads.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
  };

  const handleResetDB = async () => {
    if (!window.confirm("Are you sure you want to reset the CRM database to defaults? Any custom generated leads will be lost.")) return;
    try {
      const response = await fetch("/api/leads/reset", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
        setSelectedLeadId(null);
      }
    } catch (e) {
      console.error("Error resetting database:", e);
    }
  };

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-600/10 selection:text-indigo-900 pb-12">
      {/* Platform Header Navigation */}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 border border-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <Cpu size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-md font-extrabold tracking-tight text-slate-900 font-sans">Sterling CRM</h1>
                <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 rounded uppercase">
                  Enterprise Agency Edition
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">BDEV, RESEARCH & WEB REDESIGN PIPELINE</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
              <Database size={12} className="text-indigo-600" />
              <span>CRM Cloud Ledger: Synchronized</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Metric Cards Top Bar */}
        <MetricCards 
          leads={leads} 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
        />

        {/* Master Content Router */}
        {!selectedLead ? (
          /* PIPELINE DISCOVERY MODE (Double Column Layout) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Campaign Launcher (5 Columns) */}
            <div className="lg:col-span-5">
              <CampaignSettings onCampaignComplete={handleCampaignComplete} />
            </div>

            {/* Right: CRM Leads Table (7 Columns) */}
            <div className="lg:col-span-7">
              <LeadsDashboard
                leads={leads}
                selectedLeadId={selectedLeadId}
                onSelectLead={handleSelectLead}
                onResetDB={handleResetDB}
                activeFilter={activeFilter}
                onClearFilter={() => setActiveFilter("all")}
              />
            </div>
          </div>
        ) : (
          /* CONSOLE MANAGEMENT MODE (Full Screen Slide/Console) */
          <div className="space-y-6">
            
            {/* Agent Header Control Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedLeadId(null)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition-all cursor-pointer"
                >
                  <ArrowLeft size={16} />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800 font-sans tracking-tight">{selectedLead.businessName}</h2>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedLead.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                    <span>HQ: {selectedLead.location}</span>
                    <span>•</span>
                    <span>Owner: {selectedLead.ownerName || "Public LLC Listed"}</span>
                  </p>
                </div>
              </div>

              {/* Status & Tab Navigation */}
              <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setConsoleTab("dossier")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all ${
                    consoleTab === "dossier" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Dossier & Audit
                </button>
                <button
                  onClick={() => setConsoleTab("outreach")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all ${
                    consoleTab === "outreach" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Email Outreach
                </button>
                <button
                  onClick={() => setConsoleTab("website")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all ${
                    consoleTab === "website" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  AI Web Workspace
                </button>
              </div>
            </div>

            {/* Sub-tab viewport + Activity Logs sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Main Subview (9 Columns) */}
              <div className="xl:col-span-9">
                {consoleTab === "dossier" && (
                  <LeadDossierTab lead={selectedLead} onUpdateLead={handleUpdateLead} />
                )}
                {consoleTab === "outreach" && (
                  <EmailOutreachTab lead={selectedLead} onUpdateLead={handleUpdateLead} />
                )}
                {consoleTab === "website" && (
                  <AIWebsiteWorkspaceTab lead={selectedLead} onUpdateLead={handleUpdateLead} />
                )}
              </div>

              {/* Sidebar: Activity Logs Stream (3 Columns) */}
              <div className="xl:col-span-3 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 min-h-[400px] flex flex-col">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Activity size={16} className="text-indigo-600" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">CRM Audit Trail</h3>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
                    {selectedLead.activities.map((log) => {
                      let LogIcon = Activity;
                      let iconColor = "bg-slate-50 text-slate-500 border-slate-200";

                      if (log.type === "research" || log.type === "score") {
                        LogIcon = ShieldCheck;
                        iconColor = "bg-blue-50 text-blue-600 border-blue-100";
                      } else if (log.type === "outreach" || log.type === "email_received") {
                        LogIcon = MailOpen;
                        iconColor = "bg-amber-50 text-amber-600 border-amber-100";
                      } else if (log.type === "site_build" || log.type === "deploy" || log.type === "payment") {
                        LogIcon = Clock;
                        iconColor = "bg-indigo-50 text-indigo-600 border-indigo-100";
                      }

                      return (
                        <div key={log.id} className="flex gap-3">
                          <div className={`p-1.5 rounded-lg border h-fit mt-0.5 shrink-0 ${iconColor}`}>
                            <LogIcon size={12} />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{log.message}</p>
                            <p className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                              <Clock size={8} />
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
