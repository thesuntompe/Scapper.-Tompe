import React, { useMemo, useState } from "react";
import { 
  FolderGit2, CheckSquare, Laptop, Globe, ArrowUpRight, ShieldCheck, 
  Settings, Clock, Sparkles, AlertCircle, PlayCircle, Layers
} from "lucide-react";
import { Lead } from "../types";

interface ProjectsViewProps {
  leads: Lead[];
  onFocusLead: (leadId: string, tab: "dossier" | "outreach" | "website") => void;
}

const PROJECT_STAGES = [
  "Wireframe",
  "Content Collection",
  "Design Approval",
  "Development",
  "Testing",
  "Deployment",
  "Live"
];

export default function ProjectsView({ leads, onFocusLead }: ProjectsViewProps) {
  const [filter, setFilter] = useState<"all" | "active" | "live">("all");

  // Derive the 7-stage project status workflow based on lead CRM states
  const projects = useMemo(() => {
    return leads.map((l) => {
      const status = l.status;
      let stageIndex = 0; // default Wireframe
      let progress = 15;
      let statusClass = "text-slate-400 bg-slate-500/10 border-slate-500/20";

      if (status === "paid_and_deployed") {
        stageIndex = 6; // Live
        progress = 100;
        statusClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      } else if (l.generatedWebsite?.htmlCode && l.invoice?.status === "paid") {
        stageIndex = 5; // Deployment
        progress = 85;
        statusClass = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
      } else if (status === "client_review") {
        stageIndex = 4; // Testing
        progress = 70;
        statusClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      } else if (status === "site_generated") {
        stageIndex = 3; // Development
        progress = 55;
        statusClass = "text-blue-400 bg-blue-500/10 border-blue-500/20";
      } else if (status === "replied_interested" || status === "planning") {
        stageIndex = 2; // Design Approval
        progress = 40;
        statusClass = "text-violet-400 bg-violet-500/10 border-violet-500/20";
      } else if (status === "outreach_drafted" || status === "emailed" || status === "followup_scheduled") {
        stageIndex = 1; // Content Collection
        progress = 25;
        statusClass = "text-sky-400 bg-sky-500/10 border-sky-500/20";
      }

      return {
        lead: l,
        stage: PROJECT_STAGES[stageIndex],
        stageIndex,
        progress,
        statusClass,
        hasMockup: !!l.generatedWebsite?.htmlCode
      };
    });
  }, [leads]);

  const filteredProjects = useMemo(() => {
    if (filter === "all") return projects;
    if (filter === "active") return projects.filter(p => p.stageIndex < 6);
    if (filter === "live") return projects.filter(p => p.stageIndex === 6);
    return projects;
  }, [projects, filter]);

  return (
    <div className="space-y-4 animate-fadeIn text-[#F8FAFC]">
      {/* Header with reduced height */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pb-1.5 border-b border-[#1F2937]">
        <div>
          <h2 className="text-sm font-extrabold text-white font-sans tracking-tight leading-none">Deliverables Tracker</h2>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5">MILSTONE PHASES & DEVELOPMENT QUEUE</p>
        </div>
        <span className="text-[10px] bg-[#111827] border border-[#1F2937] text-slate-300 font-mono px-2.5 py-0.5 rounded-md">
          Total deliverables: {projects.length}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] p-1 rounded-xl shadow-md max-w-sm gap-1">
        {[
          { id: "all" as const, label: "All Deliverables" },
          { id: "active" as const, label: "In Development" },
          { id: "live" as const, label: "Production Live" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-1 py-1 text-[9px] font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              filter === tab.id 
                ? "bg-[#7C3AED] text-white shadow-sm" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project Rows */}
      <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] rounded-xl overflow-hidden shadow-xl divide-y divide-[#1F2937]">
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-sans">
            No projects found in this phase. Run Discovery and outreach to generate new coding deliverables.
          </div>
        ) : (
          filteredProjects.map((proj) => (
            <div key={proj.lead.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#1F2937]/30 transition-colors">
              {/* Left Column: Name & Deliverable Details */}
              <div className="space-y-1 max-w-sm shrink-0">
                <h4 className="text-xs font-extrabold text-white leading-tight font-sans">{proj.lead.businessName}</h4>
                <div className="flex items-center gap-1.5 flex-wrap text-[8px] font-mono text-slate-400">
                  <span className={`px-1.5 py-0.2 rounded border font-bold uppercase tracking-wider ${proj.statusClass}`}>
                    Phase: {proj.stage}
                  </span>
                  <span>•</span>
                  <span className={proj.hasMockup ? "text-indigo-400 font-bold" : "text-slate-500"}>
                    {proj.hasMockup ? "Tailwind Code Built" : "Sitemap Approved"}
                  </span>
                  <span>•</span>
                  <span className={proj.lead.invoice?.status === "paid" ? "text-emerald-400" : "text-slate-500"}>
                    {proj.lead.invoice?.status === "paid" ? "Invoice Paid" : "Awaiting Escrow"}
                  </span>
                </div>
              </div>

              {/* Middle Column: Interactive Pipeline Steps Visualizer (The 7 steps) */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                  <span>Development Progression</span>
                  <span className="font-bold text-[#A855F7]">{proj.progress}%</span>
                </div>
                
                {/* 7-step horizontal visual sequence bar */}
                <div className="grid grid-cols-7 gap-1">
                  {PROJECT_STAGES.map((stg, sIdx) => {
                    const isPassed = proj.stageIndex >= sIdx;
                    const isActive = proj.stageIndex === sIdx;
                    return (
                      <div key={stg} className="space-y-1">
                        <div className={`h-1 rounded-full transition-colors ${
                          isActive 
                            ? "bg-[#A855F7]" 
                            : isPassed 
                              ? "bg-[#7C3AED]" 
                              : "bg-[#1F2937]"
                        }`} title={stg} />
                        <span className={`hidden md:block text-[7px] font-mono truncate text-center leading-none ${
                          isActive 
                            ? "text-white font-bold" 
                            : isPassed 
                              ? "text-slate-400" 
                              : "text-slate-600"
                        }`}>
                          {stg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 lg:pl-4 shrink-0 justify-end">
                {proj.lead.status === "paid_and_deployed" ? (
                  <a
                    href={`/live/${proj.lead.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1 px-2.5 bg-[#111827] hover:bg-[#1F2937] border border-[#1F2937] text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                  >
                    View Domain
                    <ArrowUpRight size={11} />
                  </a>
                ) : (
                  <button
                    onClick={() => onFocusLead(proj.lead.id, proj.stageIndex >= 3 ? "website" : proj.stageIndex >= 1 ? "outreach" : "dossier")}
                    className="py-1 px-2.5 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Launch Build
                    <PlayCircle size={11} />
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
