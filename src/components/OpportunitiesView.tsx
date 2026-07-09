import React, { useMemo } from "react";
import { 
  ArrowLeft, ArrowRight, User, MapPin, Star, ShieldAlert, Globe, 
  Trash2, ExternalLink, Sparkles, AlertCircle, RefreshCw
} from "lucide-react";
import { Lead } from "../types";

interface OpportunitiesViewProps {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
  onFocusLead: (leadId: string, tab: "dossier" | "outreach" | "website") => void;
}

const STAGES = [
  { id: "research", label: "Research", bg: "bg-slate-50 border-slate-200", text: "text-slate-700" },
  { id: "ready", label: "Ready", bg: "bg-blue-50/40 border-blue-100", text: "text-blue-700" },
  { id: "contacted", label: "Contacted", bg: "bg-amber-50/45 border-amber-100", text: "text-amber-700" },
  { id: "interested", label: "Interested", bg: "bg-emerald-50/40 border-emerald-100", text: "text-emerald-700" },
  { id: "proposal_sent", label: "Proposal Sent", bg: "bg-violet-50/40 border-violet-100", text: "text-violet-700" },
  { id: "negotiation", label: "Negotiation", bg: "bg-indigo-50/40 border-indigo-100", text: "text-indigo-700" },
  { id: "won", label: "Won", bg: "bg-emerald-600/10 border-emerald-500/20", text: "text-emerald-600" },
  { id: "lost", label: "Lost", bg: "bg-rose-50/45 border-rose-100", text: "text-rose-700" }
];

export default function OpportunitiesView({ leads, onUpdateLead, onFocusLead }: OpportunitiesViewProps) {

  // Helper to map Lead status to our Kanban Stages
  const mapLeadToStage = (lead: Lead): string => {
    const status = lead.status;
    if (status === "discovered" || status === "scored" || status === "followup_scheduled") return "research";
    if (status === "outreach_drafted") return "ready";
    if (status === "emailed") return "contacted";
    if (status === "replied_interested") return "interested";
    
    // Check if proposal exists and is accepted
    if (lead.proposal && !lead.proposal.accepted) return "proposal_sent";
    if (status === "client_review" || status === "site_generated" || status === "planning") return "negotiation";
    if (status === "paid_and_deployed" || (lead.invoice && lead.invoice.status === "paid")) return "won";
    if (status === "replied_uninterested") return "lost";
    
    return "research";
  };

  // Helper to map Kanban Stage to Lead Status
  const mapStageToStatus = (stage: string): Lead["status"] => {
    switch (stage) {
      case "research": return "discovered";
      case "ready": return "outreach_drafted";
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

    // Settle invoice or update proposal flags if transitioning to Won/Proposal Sent
    if (newStage === "won") {
      if (lead.invoice) {
        updates.invoice = { ...lead.invoice, status: "paid" };
      } else {
        updates.invoice = {
          id: `inv_${Date.now()}`,
          amount: lead.proposal?.price || 2499,
          status: "paid",
          createdAt: new Date().toISOString()
        };
      }
    }

    if (newStage === "proposal_sent" && !lead.proposal) {
      updates.proposal = {
        title: `Custom Digital Redesign - ${lead.businessName}`,
        price: 2499,
        scope: ["Custom Web Presence", "Mobile Optimization", "SSL Handshake security", "Interactive scheduling widgets"],
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
              message: `Manually moved opportunity stage to ${newStage.toUpperCase().replace("_", " ")}`,
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
      research: [],
      ready: [],
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
        stageMap["research"].push(l);
      }
    });

    return stageMap;
  }, [leads]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview stats */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-md font-bold text-slate-800 font-sans tracking-tight">Opportunity Sales Pipeline</h2>
          <p className="text-[10px] text-slate-400 font-mono">DRAG-AND-DROP REVENUE TRACKING PANEL</p>
        </div>
        <span className="text-xs text-slate-500 font-mono font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping inline-block" />
          Active Leads: {leads.length}
        </span>
      </div>

      {/* Horizontal Scrollable Kanban Lanes container */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin snap-x">
        {STAGES.map((stage, idx) => {
          const list = columns[stage.id] || [];
          return (
            <div 
              key={stage.id} 
              className="flex-1 min-w-[280px] max-w-[340px] bg-slate-50/60 border border-slate-200/80 rounded-2xl flex flex-col h-[70vh] snap-center overflow-hidden shadow-sm"
            >
              {/* Lane Header */}
              <div className="px-4 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold font-sans ${stage.text}`}>{stage.label}</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-150 rounded text-slate-500">
                    {list.length}
                  </span>
                </div>
              </div>

              {/* Lane Cards Scroll View */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-none">
                {list.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                    No active targets
                  </div>
                ) : (
                  list.map((lead) => {
                    const isHigh = lead.leadScore >= 70;
                    const hasCode = !!lead.generatedWebsite?.htmlCode;
                    return (
                      <div 
                        key={lead.id} 
                        className="bg-white border border-slate-200 hover:border-slate-350 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 relative group"
                      >
                        {/* Title & Score */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 leading-snug truncate pr-2 max-w-[170px]" title={lead.businessName}>
                            {lead.businessName}
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold shrink-0 ${
                            isHigh ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-50 text-slate-500 border border-slate-200"
                          }`}>
                            L-Score: {lead.leadScore}
                          </span>
                        </div>

                        {/* Location / Owner */}
                        <div className="space-y-1 font-sans text-[10px] text-slate-400">
                          <p className="flex items-center gap-1">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{lead.location}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <User size={10} className="shrink-0" />
                            <span className="truncate">Owner: {lead.ownerName || "Unavailable"}</span>
                          </p>
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono">
                          {lead.onlinePresence.hasWebsite ? (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                              Outdated Web
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 font-bold">
                              No Website
                            </span>
                          )}
                          {hasCode && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold">
                              Mockup Done
                            </span>
                          )}
                        </div>

                        {/* Action buttons footer */}
                        <div className="pt-2 border-t border-slate-150 flex items-center justify-between gap-1 text-[10px]">
                          {/* Left Arrow */}
                          <button
                            onClick={() => handleMoveLeft(lead, idx)}
                            disabled={idx === 0}
                            className="p-1 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 rounded text-slate-500 cursor-pointer"
                            title="Move back"
                          >
                            <ArrowLeft size={11} />
                          </button>

                          {/* Detail Workspace focus link */}
                          <button
                            onClick={() => onFocusLead(lead.id, stage.id === "negotiation" || stage.id === "won" ? "website" : stage.id === "contacted" || stage.id === "ready" ? "outreach" : "dossier")}
                            className="flex-1 py-1 text-center bg-slate-50 hover:bg-indigo-650 hover:text-white border border-slate-200 hover:border-indigo-600 rounded-lg text-slate-600 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Workspace
                          </button>

                          {/* Right Arrow */}
                          <button
                            onClick={() => handleMoveRight(lead, idx)}
                            disabled={idx === STAGES.length - 1}
                            className="p-1 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 rounded text-slate-500 cursor-pointer"
                            title="Move forward"
                          >
                            <ArrowRight size={11} />
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
