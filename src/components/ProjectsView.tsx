import React, { useMemo, useState } from "react";
import { 
  FolderGit2, CheckSquare, Laptop, Globe, ArrowUpRight, ShieldCheck, 
  Settings, Clock, Sparkles, AlertCircle, PlayCircle
} from "lucide-react";
import { Lead } from "../types";

interface ProjectsViewProps {
  leads: Lead[];
  onFocusLead: (leadId: string, tab: "dossier" | "outreach" | "website") => void;
}

export default function ProjectsView({ leads, onFocusLead }: ProjectsViewProps) {
  const [filter, setFilter] = useState<"all" | "design" | "code" | "live">("all");

  // Derive active deliverables/projects from lead statuses
  const projects = useMemo(() => {
    return leads.map((l) => {
      let progress = 15; // default discovery stage
      let phase = "Audit & Discovery";
      let statusClass = "bg-slate-100 text-slate-500 border-slate-200";

      if (l.status === "outreach_drafted" || l.status === "emailed") {
        progress = 30;
        phase = "Client Pitching";
        statusClass = "bg-blue-50 text-blue-600 border-blue-100";
      } else if (l.status === "replied_interested" || l.status === "planning") {
        progress = 50;
        phase = "Sitemap & Wireframe";
        statusClass = "bg-violet-50 text-violet-600 border-violet-100";
      } else if (l.status === "site_generated" || l.status === "client_review") {
        progress = 75;
        phase = "HTML/CSS High Fidelity";
        statusClass = "bg-indigo-50 text-indigo-600 border-indigo-100";
      } else if (l.status === "paid_and_deployed") {
        progress = 100;
        phase = "Production Deployed";
        statusClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
      }

      return {
        lead: l,
        progress,
        phase,
        statusClass,
        hasMockup: !!l.generatedWebsite?.htmlCode
      };
    });
  }, [leads]);

  const filteredProjects = useMemo(() => {
    if (filter === "all") return projects;
    if (filter === "design") return projects.filter(p => p.progress === 50);
    if (filter === "code") return projects.filter(p => p.progress === 75);
    if (filter === "live") return projects.filter(p => p.progress === 100);
    return projects;
  }, [projects, filter]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-md font-bold text-slate-800 font-sans tracking-tight">Active Agency Deliverables</h2>
          <p className="text-[10px] text-slate-400 font-mono">PROJECT TRAFFIC CONTROL & BUILD METRICS</p>
        </div>
        <span className="text-xs bg-slate-50 border border-slate-200 text-slate-600 font-mono px-2.5 py-1 rounded-full font-bold">
          Queue: {projects.length} Total
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-sm max-w-md gap-1">
        {[
          { id: "all" as const, label: "All Works" },
          { id: "design" as const, label: "Wireframes" },
          { id: "code" as const, label: "Coding / Demos" },
          { id: "live" as const, label: "Production Live" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-1 py-1.5 text-[10px] font-bold font-sans rounded-lg transition-all cursor-pointer ${
              filter === tab.id 
                ? "bg-white text-slate-800 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project rows */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No projects in this stage. Build code or pitch leads to advance milestones!
          </div>
        ) : (
          filteredProjects.map((proj) => (
            <div key={proj.lead.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/20 transition-colors">
              {/* LHS: Name & Deliverables Checklist */}
              <div className="space-y-2 max-w-sm">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-none">{proj.lead.businessName}</h4>
                  <span className="text-[9px] font-mono text-slate-400 uppercase mt-1 block">Vulnerability Score: {proj.lead.leadScore}/100</span>
                </div>
                
                {/* Visual Checklist items */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-sans text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-indigo-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                    {proj.phase}
                  </span>
                  <span>•</span>
                  <span className={proj.hasMockup ? "text-slate-700 font-bold" : "text-slate-450"}>
                    {proj.hasMockup ? "✔ Code Compiled" : "Awaiting Code Build"}
                  </span>
                  <span>•</span>
                  <span>
                    {proj.lead.invoice?.status === "paid" ? "✔ Invoice Paid" : "Payment Pending"}
                  </span>
                </div>
              </div>

              {/* Progress Bar & percentage */}
              <div className="flex-1 max-w-md space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Campaign Milestone</span>
                  <span className="font-bold text-slate-700">{proj.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-700 ease-out"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* RHS Action triggers */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                {proj.lead.status === "paid_and_deployed" ? (
                  <a
                    href={`${window.location.origin}/live/${proj.lead.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    View Domain
                    <ArrowUpRight size={11} />
                  </a>
                ) : (
                  <button
                    onClick={() => onFocusLead(proj.lead.id, proj.progress >= 75 ? "website" : proj.progress >= 30 ? "outreach" : "dossier")}
                    className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    Launch Workspace
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
