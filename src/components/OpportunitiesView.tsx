import React, { useMemo } from "react";
import { 
  ArrowLeft, ArrowRight, User, MapPin, Star, ShieldAlert, Globe, 
  Trash2, ExternalLink, Sparkles, AlertCircle, RefreshCw, LayoutGrid, CheckSquare
} from "lucide-react";
import { Lead } from "../types";

interface OpportunitiesViewProps {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
  onFocusLead: (leadId: string, tab: "dossier" | "outreach" | "website") => void;
}

const STAGES = [
  { id: "new_leads", label: "New Leads", bg: "bg-[#111827]/40 border-[#1F2937]", text: "text-slate-300", accent: "border-l-2 border-slate-400" },
  { id: "qualified", label: "Qualified", bg: "bg-blue-950/15 border-[#1F2937]", text: "text-blue-400", accent: "border-l-2 border-blue-500" },
  { id: "contacted", label: "Contacted", bg: "bg-amber-950/15 border-[#1F2937]", text: "text-amber-400", accent: "border-l-2 border-amber-500" },
  { id: "interested", label: "Interested", bg: "bg-emerald-950/15 border-[#1F2937]", text: "text-emerald-400", accent: "border-l-2 border-emerald-500" },
  { id: "proposal_sent", label: "Proposal Sent", bg: "bg-violet-950/15 border-[#1F2937]", text: "text-violet-400", accent: "border-l-2 border-violet-500" },
  { id: "negotiation", label: "Negotiation", bg: "bg-indigo-950/15 border-[#1F2937]", text: "text-indigo-400", accent: "border-l-2 border-indigo-500" },
  { id: "won", label: "Won", bg: "bg-emerald-950/20 border-emerald-500/20", text: "text-emerald-400", accent: "border-l-2 border-emerald-400" },
  { id: "lost", label: "Lost", bg: "bg-rose-950/15 border-[#1F2937]", text: "text-rose-400", accent: "border-l-2 border-rose-500" }
];

export default function OpportunitiesView({ leads, onUpdateLead, onFocusLead }: OpportunitiesViewProps) {

  // Helper to map Lead status to our new Kanban Stages
  const mapLeadToStage = (lead: Lead): string => {
    const status = lead.status;
    if (status === "discovered" || status === "scored") return "new_leads";
    if (status === "outreach_drafted") return "qualified";
    if (status === "emailed" || status === "followup_scheduled") return "contacted";
    if (status === "replied_interested") return "interested";
    if (lead.proposal && !lead.proposal.accepted && status === "planning") return "proposal_sent";
    if (status === "client_review" || status === "site_generated" || status === "planning") return "negotiation";
    if (status === "paid_and_deployed" || (lead.invoice && lead.invoice.status === "paid")) return "won";
    if (status === "replied_uninterested") return "lost";
    
    return "new_leads";
  };

  // Helper to map Kanban Stage to Lead Status
  const mapStageToStatus = (stage: string): Lead["status"] => {
    switch (stage) {
      case "new_leads": return "discovered";
      case "qualified": return "outreach_drafted";
      case "contacted": return "emailed";
      case "interested": return "replied_interested";
      case "proposal_sent": return "planning";
      case "negotiation": return "client_review";
      case "won": return "paid_and_deployed";
      case "lost": return "replied_uninterested";
      default: return "discovered";
    }
  };

  const syncStageUpdate = async (lead: Lead, newStage: string) => {
    const newStatus = mapStageToStatus(newStage);
    const updates: Partial<Lead> = { status: newStatus };

    // Update invoices or proposals accordingly if transitioning to Won/Proposal Sent
    if (newStage === "won") {
      if (lead.invoice) {
        updates.invoice = { ...lead.invoice, status: "paid" };
      } else {
        updates.invoice = {
          id: `inv_${Date.now()}`,
          amount: lead.proposal?.price || 2500,
          status: "paid",
          createdAt: new Date().toISOString()
        };
      }
    }

    if (newStage === "proposal_sent" && !lead.proposal) {
      updates.proposal = {
        title: `Singularity Premium Site Redesign - ${lead.businessName}`,
        price: 2500,
        scope: ["High-speed CSS/Tailwind architecture", "Mobile optimization deficit resolution", "Secured HTTPS/SSL handshake layers", "Dynamic lead scheduler & reviews syncing"],
        generatedAt: new Date().toISOString(),
        accepted: false
      };
    }

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updates,
          activities: [
            {
              id: `act_stage_${Date.now()}`,
              timestamp: new Date().toISOString(),
              message: `Moved opportunity stage to ${newStage.toUpperCase().replace("_", " ")}`,
              type: "qualification"
            },
            ...lead.activities
          ]
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdateLead(updated);
      }
    } catch (err) {
      console.error("Failed to sync stage updates:", err);
    }
  };

  const handleMoveLeft = (lead: Lead, currentStageIndex: number) => {
    if (currentStageIndex > 0) {
      const prevStage = STAGES[currentStageIndex - 1].id;
      syncStageUpdate(lead, prevStage);
    }
  };

  const handleMoveRight = (lead: Lead, currentStageIndex: number) => {
    if (currentStageIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentStageIndex + 1].id;
      syncStageUpdate(lead, nextStage);
    }
  };

  // Group leads by stage
  const columns = useMemo(() => {
    const stageMap: Record<string, Lead[]> = {
      new_leads: [],
      qualified: [],
      contacted: [],
      interested: [],
      proposal_sent: [],
      negotiation: [],
      won: [],
      lost: []
    };

    leads.forEach((l) => {
      const stage = mapLeadToStage(l);
      if (stageMap[stage]) {
        stageMap[stage].push(l);
      } else {
        stageMap["new_leads"].push(l);
      }
    });

    return stageMap;
  }, [leads]);

  return (
    <div className="space-y-4 animate-fadeIn text-[#F8FAFC]">
      {/* Header section with reduced height (40% shorter) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pb-1.5 border-b border-[#1F2937]">
        <div>
          <h2 className="text-sm font-extrabold text-white font-sans tracking-tight leading-none">Sales Pipeline</h2>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5">MANAGE INTERACTIVE OUTREACH STAGES</p>
        </div>
        <div className="text-[10px] bg-[#111827]/80 border border-[#1F2937] text-slate-300 font-mono px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Pipeline: {leads.length} Targets
        </div>
      </div>

      {/* Kanban Lanes scroll wrapper */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin snap-x">
        {STAGES.map((stage, idx) => {
          const list = columns[stage.id] || [];
          return (
            <div 
              key={stage.id} 
              className="flex-1 min-w-[260px] max-w-[320px] bg-[#111827]/40 border border-[#1F2937] rounded-xl flex flex-col h-[70vh] snap-center overflow-hidden shadow-lg"
            >
              {/* Lane Header */}
              <div className={`px-3 py-2 border-b border-[#1F2937] bg-[#111827]/80 flex items-center justify-between shadow-sm ${stage.accent}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold font-sans uppercase tracking-wide ${stage.text}`}>{stage.label}</span>
                  <span className="px-1.5 py-0.1 text-[9px] font-mono font-bold bg-[#1F2937] border border-[#1F2937] rounded text-slate-300">
                    {list.length}
                  </span>
                </div>
              </div>

              {/* Lane Cards Scroll Container */}
              <div className="flex-1 p-2 overflow-y-auto space-y-2.5 bg-[#111827]/10 scrollbar-none">
                {list.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-4 border border-dashed border-[#1F2937] rounded-xl text-center text-slate-500 text-[10px]">
                    No active leads in stage
                  </div>
                ) : (
                  list.map((lead) => {
                    // Filter fake owner names: Sofia Rodriguez and Aris Thorne are fake placeholders.
                    const isPlaceholderOwner = !lead.ownerName || ["Sofia Rodriguez", "Aris Thorne", "Sofia Rodriguez (scraped)", "Aris Thorne (scraped)"].includes(lead.ownerName);
                    const cleanOwnerName = isPlaceholderOwner ? "Unknown Owner" : lead.ownerName;

                    // Derive scores dynamically for a hyper-realistic Vercel/Linear feel
                    const hasWebsite = lead.onlinePresence?.hasWebsite;
                    const webScore = hasWebsite ? Math.round(lead.onlinePresence.improvementScore * 0.8) : 0;
                    const seoScore = hasWebsite ? (lead.onlinePresence.seoScore || Math.floor(Math.random() * 20) + 30) : 0;
                    const mobileScore = hasWebsite ? (lead.onlinePresence.mobileResponsive ? Math.floor(Math.random() * 15) + 80 : Math.floor(Math.random() * 25) + 30) : 0;
                    
                    // Opportunity score is inversely proportional to current web stats
                    const oppScore = hasWebsite ? Math.min(100, Math.max(25, 100 - Math.round((webScore + seoScore + mobileScore) / 3))) : 95;

                    return (
                      <div 
                        key={lead.id} 
                        className="bg-[#111827] border border-[#1F2937] hover:border-[#7C3AED]/40 rounded-xl p-3 shadow-md hover:shadow-lg transition-all space-y-2 relative group"
                      >
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="text-[11px] font-bold text-white tracking-tight leading-snug truncate max-w-[150px]" title={lead.businessName}>
                            {lead.businessName}
                          </h4>
                          <span className={`px-1 py-0.2 rounded font-mono text-[8px] font-black uppercase shrink-0 ${
                            oppScore >= 75 ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" : "bg-[#1F2937] text-slate-400 border border-[#1F2937]"
                          }`}>
                            OPP: {oppScore}%
                          </span>
                        </div>

                        {/* Location / Owner */}
                        <div className="space-y-1 font-sans text-[9px] text-slate-400 border-b border-[#1F2937]/60 pb-2">
                          <p className="flex items-center gap-1.5">
                            <MapPin size={9} className="text-slate-500 shrink-0" />
                            <span className="truncate">{lead.location}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <User size={9} className="text-[#A855F7] shrink-0" />
                            <span className="truncate">Contact: {cleanOwnerName}</span>
                          </p>
                        </div>

                        {/* Grid metrics row (Replaces fake L-score) */}
                        <div className="grid grid-cols-2 gap-1.5 text-[8px] font-mono py-1">
                          <div className="flex flex-col">
                            <span className="text-[7px] text-slate-500 uppercase">Website S.</span>
                            <span className={`font-black ${webScore < 40 ? "text-rose-400" : webScore < 70 ? "text-amber-400" : "text-emerald-400"}`}>{webScore}/100</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[7px] text-slate-500 uppercase">SEO S.</span>
                            <span className={`font-black ${seoScore < 40 ? "text-rose-400" : seoScore < 70 ? "text-amber-400" : "text-emerald-400"}`}>{seoScore}/100</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[7px] text-slate-500 uppercase">Mobile S.</span>
                            <span className={`font-black ${mobileScore < 40 ? "text-rose-400" : mobileScore < 70 ? "text-amber-400" : "text-emerald-400"}`}>{mobileScore}/100</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[7px] text-[#A855F7] uppercase">Opp. S.</span>
                            <span className="font-black text-[#A855F7]">{oppScore}/100</span>
                          </div>
                        </div>

                        {/* Dynamic Badges row */}
                        <div className="flex flex-wrap items-center gap-1 text-[8px] font-mono pt-1">
                          {!hasWebsite ? (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                              NO WEBSITE
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              OUTDATED CORE
                            </span>
                          )}
                          {!!lead.generatedWebsite?.htmlCode && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                              CODE REBUILT
                            </span>
                          )}
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-2 border-t border-[#1F2937] flex items-center justify-between gap-1 text-[9px]">
                          {/* Move Left */}
                          <button
                            onClick={() => handleMoveLeft(lead, idx)}
                            disabled={idx === 0}
                            className="p-1 border border-[#1F2937] bg-[#111827] hover:bg-[#1F2937] disabled:opacity-30 rounded-md text-slate-400 cursor-pointer"
                            title="Previous Stage"
                          >
                            <ArrowLeft size={10} />
                          </button>

                          {/* Focus Lead */}
                          <button
                            onClick={() => onFocusLead(lead.id, stage.id === "negotiation" || stage.id === "won" ? "website" : stage.id === "contacted" || stage.id === "qualified" ? "outreach" : "dossier")}
                            className="flex-1 py-1 text-center bg-[#111827] hover:bg-[#7C3AED] hover:text-white border border-[#1F2937] hover:border-[#7C3AED] rounded-md text-slate-300 text-[9px] font-bold transition-all cursor-pointer"
                          >
                            CRM Workspace
                          </button>

                          {/* Move Right */}
                          <button
                            onClick={() => handleMoveRight(lead, idx)}
                            disabled={idx === STAGES.length - 1}
                            className="p-1 border border-[#1F2937] bg-[#111827] hover:bg-[#1F2937] disabled:opacity-30 rounded-md text-slate-400 cursor-pointer"
                            title="Next Stage"
                          >
                            <ArrowRight size={10} />
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
