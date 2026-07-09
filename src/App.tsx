import React, { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, Compass, Trello, Mail, Globe, FolderGit2, 
  DollarSign, Settings, ChevronDown, User, Plus, Search, 
  Menu, X, Database, ShieldCheck, Activity, Clock, Trash2, Sliders, ListFilter
} from "lucide-react";
import { Lead } from "./types";

// Components
import Logo from "./components/Logo";
import DashboardView from "./components/DashboardView";
import CampaignSettings from "./components/CampaignSettings";
import OpportunitiesView from "./components/OpportunitiesView";
import LeadsDashboard from "./components/LeadsDashboard";
import CommunicationCenterTab from "./components/CommunicationCenterTab";
import AIWebsiteWorkspaceTab from "./components/AIWebsiteWorkspaceTab";
import LeadDossierTab from "./components/LeadDossierTab";
import ProjectsView from "./components/ProjectsView";
import FinanceView from "./components/FinanceView";
import SettingsView from "./components/SettingsView";

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [loading, setLoading] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showFocusDropdown, setShowFocusDropdown] = useState(false);

  // For Opportunities, allow toggling between Kanban board and full Table List
  const [oppMode, setOppMode] = useState<"kanban" | "table">("kanban");

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
    setLeads((prevLeads) => {
      const existingIds = new Set(prevLeads.map((l) => l.id));
      const filteredNew = newLeads.filter((nl) => !existingIds.has(nl.id));
      return [...filteredNew, ...prevLeads];
    });
    if (newLeads.length > 0) {
      setSelectedLeadId(newLeads[0].id);
      setActiveSection("outreach"); // Auto-focus on Outreach or Dashboard for the new lead
    }
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prevLeads) =>
      prevLeads.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
  };

  const handleResetDB = async () => {
    if (!window.confirm("Are you sure you want to reset the Singularity AI database to defaults? Any custom generated leads will be lost.")) return;
    try {
      const response = await fetch("/api/leads/reset", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
        setSelectedLeadId(null);
        setActiveSection("dashboard");
      }
    } catch (e) {
      console.error("Error resetting database:", e);
    }
  };

  const handleFocusLead = (leadId: string, view: "dossier" | "outreach" | "website") => {
    setSelectedLeadId(leadId);
    if (view === "dossier") {
      setActiveSection("dossier_focus");
    } else if (view === "outreach") {
      setActiveSection("outreach");
    } else if (view === "website") {
      setActiveSection("websites");
    }
  };

  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Sidebar navigation sections definition
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "discovery", label: "Discovery", icon: Compass },
    { id: "opportunities", label: "Opportunities", icon: Trello },
    { id: "outreach", label: "Outreach", icon: Mail },
    { id: "websites", label: "Websites", icon: Globe },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "finance", label: "Finance", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] font-sans antialiased flex selection:bg-indigo-600/10 selection:text-indigo-900">
      
      {/* 1. DESKTOP PERMANENT LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-slate-900 text-slate-300 shrink-0 h-screen sticky top-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-900">
          <Logo size="md" showText={true} />
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <span className="px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-2">Main Menu</span>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}

          {/* Active Client Focus Sub-nav links if lead selected */}
          {selectedLead && (
            <div className="pt-6 border-t border-slate-900 mt-6 space-y-1.5 animate-fadeIn">
              <span className="px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-2">Focused Workspace</span>
              
              <div className="px-3 py-2 bg-slate-900/50 rounded-xl border border-slate-900/80 mb-2">
                <p className="text-xs font-bold text-white truncate leading-tight">{selectedLead.businessName}</p>
                <button 
                  onClick={() => setSelectedLeadId(null)}
                  className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 mt-1 uppercase font-bold tracking-wider cursor-pointer"
                >
                  Clear Active Focus ×
                </button>
              </div>

              <button
                onClick={() => setActiveSection("dossier_focus")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold font-sans transition-all cursor-pointer ${
                  activeSection === "dossier_focus" 
                    ? "bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 font-bold" 
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
              >
                <ShieldCheck size={14} />
                Dossier & Audit
              </button>
            </div>
          )}
        </nav>

        {/* Database Status Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ledger: Synced</span>
          </div>
          <button 
            onClick={handleResetDB} 
            className="text-slate-500 hover:text-slate-300 underline font-bold cursor-pointer"
          >
            Reset DB
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-950 border-b border-slate-900 text-white flex items-center justify-between px-4 z-40">
        <Logo size="sm" showText={true} />
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
        >
          {showMobileSidebar ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer menu overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 bg-slate-950/95 z-30 pt-16 flex flex-col text-slate-300 animate-fadeIn">
          <nav className="flex-1 p-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setShowMobileSidebar(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                    isActive ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-900 hover:text-white text-slate-400"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
            
            {selectedLead && (
              <div className="pt-4 border-t border-slate-900 mt-4 space-y-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Workspace Focus: {selectedLead.businessName}</span>
                <button
                  onClick={() => {
                    setActiveSection("dossier_focus");
                    setShowMobileSidebar(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold font-sans cursor-pointer ${
                    activeSection === "dossier_focus" ? "bg-indigo-600/10 text-indigo-400" : "text-slate-400"
                  }`}
                >
                  <ShieldCheck size={16} />
                  Dossier & Audit
                </button>
              </div>
            )}
          </nav>
          
          <div className="p-6 border-t border-slate-900 text-[10px] font-mono text-slate-500 flex justify-between items-center">
            <span>Ledger: Active</span>
            <button onClick={handleResetDB} className="underline">Reset Defaults</button>
          </div>
        </div>
      )}

      {/* 3. MAIN COGNITIVE AREA */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-0 pt-14 lg:pt-0 overflow-x-hidden">
        
        {/* Persistent Top Utility bar (Linear/Stripe style) */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6 shrink-0 sticky top-14 lg:top-0 z-20">
          <div className="flex items-center gap-3 font-sans text-xs text-slate-500">
            <span className="font-bold text-slate-700 capitalize">{activeSection.replace("_focus", " workspace")}</span>
            {selectedLead && (
              <>
                <span>/</span>
                <span className="font-mono bg-slate-50 border border-slate-250 py-0.5 px-2 rounded-md text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Focus: {selectedLead.businessName}
                </span>
              </>
            )}
          </div>

          {/* Active Client Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFocusDropdown(!showFocusDropdown)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-250 hover:border-slate-350 text-slate-700 text-[11px] font-bold font-sans rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <User size={13} className="text-slate-500" />
              {selectedLead ? selectedLead.businessName : "Select Active Client Focus"}
              <ChevronDown size={11} className={`text-slate-500 transition-transform ${showFocusDropdown ? "rotate-180" : ""}`} />
            </button>

            {showFocusDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFocusDropdown(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-xs divide-y divide-slate-100 animate-fadeIn">
                  <div className="p-2 text-[10px] font-mono text-slate-400 uppercase font-bold">Select target client focus</div>
                  
                  <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                    {leads.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 italic font-sans">No leads yet</div>
                    ) : (
                      leads.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => {
                            setSelectedLeadId(l.id);
                            setShowFocusDropdown(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg font-sans font-medium transition-colors cursor-pointer flex items-center justify-between ${
                            selectedLeadId === l.id 
                              ? "bg-indigo-50 text-indigo-700 font-bold" 
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span className="truncate pr-2">{l.businessName}</span>
                          <span className="text-[9px] font-mono text-slate-400 shrink-0">{l.category}</span>
                        </button>
                      ))
                    )}
                  </div>

                  {selectedLeadId && (
                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          setSelectedLeadId(null);
                          setShowFocusDropdown(false);
                        }}
                        className="w-full text-center py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-semibold font-sans cursor-pointer"
                      >
                        Clear Focus
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        {/* 4. WORKSPACE PANEL PORT */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
              <span className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
              <span className="text-xs font-mono">Synchronizing Singularity Ledger...</span>
            </div>
          ) : (
            <>
              {/* SECTION: DASHBOARD */}
              {activeSection === "dashboard" && (
                <DashboardView 
                  leads={leads} 
                  onFocusLead={handleFocusLead} 
                  onNavigateSection={setActiveSection} 
                />
              )}

              {/* SECTION: DISCOVERY */}
              {activeSection === "discovery" && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <CampaignSettings onCampaignComplete={handleCampaignComplete} />
                </div>
              )}

              {/* SECTION: OPPORTUNITIES (Kanban with inline list fallback) */}
              {activeSection === "opportunities" && (
                <div className="space-y-4">
                  {/* Pipeline Control Headers */}
                  <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl shadow-sm max-w-xs gap-1">
                    <button
                      onClick={() => setOppMode("kanban")}
                      className={`flex-1 py-1.5 text-[10px] font-bold font-sans rounded-lg transition-all cursor-pointer ${
                        oppMode === "kanban" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Kanban Board
                    </button>
                    <button
                      onClick={() => setOppMode("table")}
                      className={`flex-1 py-1.5 text-[10px] font-bold font-sans rounded-lg transition-all cursor-pointer ${
                        oppMode === "table" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Leads Directory
                    </button>
                  </div>

                  {oppMode === "kanban" ? (
                    <OpportunitiesView 
                      leads={leads} 
                      onUpdateLead={handleUpdateLead} 
                      onFocusLead={handleFocusLead} 
                    />
                  ) : (
                    <LeadsDashboard 
                      leads={leads}
                      selectedLeadId={selectedLeadId}
                      onSelectLead={(lead) => {
                        setSelectedLeadId(lead.id);
                        setActiveSection("dossier_focus");
                      }}
                      onResetDB={handleResetDB}
                      activeFilter="all"
                      onClearFilter={() => {}}
                    />
                  )}
                </div>
              )}

              {/* SECTION: OUTREACH (Email & Direct Outreach channels) */}
              {activeSection === "outreach" && (
                <div className="space-y-6">
                  {selectedLead ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <div>
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Channel Interface</span>
                          <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">Active Pitch & Outreach Centre</h3>
                        </div>
                        <button
                          onClick={() => setSelectedLeadId(null)}
                          className="py-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold cursor-pointer"
                        >
                          Change Client
                        </button>
                      </div>

                      <CommunicationCenterTab 
                        lead={selectedLead} 
                        onUpdateLead={handleUpdateLead} 
                      />
                    </div>
                  ) : (
                    /* Client picker fallback for Outreach */
                    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-5">
                      <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full w-fit mx-auto">
                        <Mail size={24} />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-bold text-slate-800 font-sans">Focus a client to configure Pitch</h3>
                        <p className="text-xs text-slate-500 font-sans leading-relaxed">
                          Select a discovered client to draft custom sitemaps, send emails, or detect and track Instagram DM/WhatsApp sequences.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-2 text-left max-h-60 overflow-y-auto">
                        {leads.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => setSelectedLeadId(l.id)}
                            className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-800 border border-slate-200 rounded-xl transition-all cursor-pointer flex justify-between items-center text-xs text-slate-700 font-semibold"
                          >
                            <span>{l.businessName}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-normal">{l.category}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: WEBSITES (Sitemaps, live preview, custom domains) */}
              {activeSection === "websites" && (
                <div className="space-y-6">
                  {selectedLead ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <div>
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Website workspace</span>
                          <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">Tailwind Sitemap & Mockup Sandbox</h3>
                        </div>
                        <button
                          onClick={() => setSelectedLeadId(null)}
                          className="py-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold cursor-pointer"
                        >
                          Change Client
                        </button>
                      </div>

                      <AIWebsiteWorkspaceTab 
                        lead={selectedLead} 
                        onUpdateLead={handleUpdateLead} 
                      />
                    </div>
                  ) : (
                    /* Client picker fallback for Websites */
                    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-5">
                      <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full w-fit mx-auto">
                        <Globe size={24} />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-bold text-slate-800 font-sans">Focus a client to run website workspace</h3>
                        <p className="text-xs text-slate-500 font-sans leading-relaxed">
                          Build, compile, and preview high-converting Tailwind landing pages, sitemaps, custom domains, or manage invoice settling.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-2 text-left max-h-60 overflow-y-auto">
                        {leads.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => setSelectedLeadId(l.id)}
                            className="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-800 border border-slate-200 rounded-xl transition-all cursor-pointer flex justify-between items-center text-xs text-slate-700 font-semibold"
                          >
                            <span>{l.businessName}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-normal">
                              {l.generatedWebsite?.htmlCode ? "Mockup Compiled" : "Awaiting Code"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: PROJECTS (Active deliverables tracker) */}
              {activeSection === "projects" && (
                <ProjectsView leads={leads} onFocusLead={handleFocusLead} />
              )}

              {/* SECTION: FINANCE (Invoices ledger, payment gateways setup) */}
              {activeSection === "finance" && (
                <FinanceView 
                  leads={leads} 
                  onUpdateLead={handleUpdateLead} 
                  onFocusLead={handleFocusLead} 
                />
              )}

              {/* SECTION: SETTINGS */}
              {activeSection === "settings" && (
                <SettingsView />
              )}

              {/* SECTION: CLIENT DOSSIER & AUDIT DETAILED FOCUS */}
              {activeSection === "dossier_focus" && selectedLead && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Interactive contract & intelligence</span>
                      <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">Vulnerabilities & CRM Dossier</h3>
                    </div>
                    <button
                      onClick={() => setActiveSection("opportunities")}
                      className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-all"
                    >
                      Back to Opportunities
                    </button>
                  </div>

                  <LeadDossierTab 
                    lead={selectedLead} 
                    onUpdateLead={handleUpdateLead} 
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

    </div>
  );
}
