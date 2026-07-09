import React, { useMemo } from "react";
import { 
  Users, CheckSquare, Clock, ShieldAlert, Sparkles, DollarSign, 
  TrendingUp, Activity, ArrowRight, Play, Eye, Layers, Percent
} from "lucide-react";
import { Lead } from "../types";

interface DashboardViewProps {
  leads: Lead[];
  onFocusLead: (leadId: string, tab: "dossier" | "outreach" | "website") => void;
  onNavigateSection: (section: string) => void;
}

export default function DashboardView({ leads, onFocusLead, onNavigateSection }: DashboardViewProps) {
  
  // 1. Dynamic metric derivations
  const stats = useMemo(() => {
    // New Leads
    const newLeads = leads.filter(l => l.status === "discovered" || l.status === "scored").length;
    
    // Active Clients (those engaged in outreach or projects)
    const activeClients = leads.filter(
      l => l.status !== "discovered" && l.status !== "scored" && l.status !== "replied_uninterested"
    ).length;

    // Pending Followups
    const pendingFollowups = leads.filter(
      l => l.followupAutomation?.enabled || l.status === "followup_scheduled"
    ).length;

    // Websites Live
    const websitesLive = leads.filter(l => l.status === "paid_and_deployed" || l.generatedWebsite?.htmlCode).length;

    // Pipeline Value
    const pipelineValue = leads.reduce((acc, l) => acc + (l.proposal?.price || 1500), 0);

    // Monthly Revenue Goal
    const closedRevenue = leads
      .filter(l => l.invoice?.status === "paid")
      .reduce((acc, l) => acc + (l.invoice?.amount || 0), 0);
    const monthlyGoal = 25000;
    const goalPercent = Math.min(Math.round((closedRevenue / monthlyGoal) * 100), 100);

    return {
      newLeads,
      activeClients,
      pendingFollowups,
      websitesLive,
      pipelineValue,
      closedRevenue,
      monthlyGoal,
      goalPercent
    };
  }, [leads]);

  // 2. Today's Focus Tasks
  const tasks = useMemo(() => {
    const list: { id: string; text: string; leadId: string; type: "audit" | "outreach" | "design" | "billing"; leadName: string }[] = [];
    leads.forEach((l) => {
      if (l.status === "discovered") {
        list.push({
          id: `task-audit-${l.id}`,
          text: `Audit online presence deficits for ${l.businessName}`,
          leadId: l.id,
          type: "audit",
          leadName: l.businessName
        });
      } else if (l.status === "scored" || l.status === "followup_scheduled") {
        list.push({
          id: `task-outreach-${l.id}`,
          text: `Configure outreach drip campaign for ${l.businessName}`,
          leadId: l.id,
          type: "outreach",
          leadName: l.businessName
        });
      } else if (l.status === "replied_interested" && !l.generatedWebsite?.htmlCode) {
        list.push({
          id: `task-design-${l.id}`,
          text: `Generate instant custom Tailwind build for ${l.businessName}`,
          leadId: l.id,
          type: "design",
          leadName: l.businessName
        });
      } else if (l.invoice && l.invoice.status === "pending") {
        list.push({
          id: `task-bill-${l.id}`,
          text: `Record payment settlement of $${l.invoice.amount} for ${l.businessName}`,
          leadId: l.id,
          type: "billing",
          leadName: l.businessName
        });
      }
    });
    return list.slice(0, 4); // Compact: limit to top 4 tasks
  }, [leads]);

  // 3. Upcoming Followups
  const upcomingFollowups = useMemo(() => {
    return leads
      .filter(l => l.followupAutomation?.enabled || l.status === "followup_scheduled")
      .slice(0, 4);
  }, [leads]);

  // 4. Recent Activity Logs
  const recentActivities = useMemo(() => {
    const logs: { leadId: string; leadName: string; message: string; timestamp: string; type: string }[] = [];
    leads.forEach((l) => {
      if (l.activities) {
        l.activities.forEach((act) => {
          logs.push({
            leadId: l.id,
            leadName: l.businessName,
            message: act.message,
            timestamp: act.timestamp,
            type: act.type
          });
        });
      }
    });
    // Sort newest first, keep compact (top 4)
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 4);
  }, [leads]);

  // 5. Funnel counts
  const funnel = useMemo(() => {
    const total = leads.length || 1; // avoid divide by zero
    const newLeads = leads.filter(l => l.status === "discovered" || l.status === "scored").length;
    const contacted = leads.filter(l => l.status === "outreach_drafted" || l.status === "emailed" || l.status === "followup_scheduled").length;
    const interested = leads.filter(l => l.status === "replied_interested" || l.status === "planning").length;
    const converted = leads.filter(l => l.status === "site_generated" || l.status === "client_review" || l.status === "paid_and_deployed").length;

    return [
      { label: "1. Discovered", count: newLeads, pct: Math.round((newLeads / total) * 100), color: "bg-[#7C3AED]" },
      { label: "2. Contacted", count: contacted, pct: Math.round((contacted / total) * 100), color: "bg-[#8B5CF6]" },
      { label: "3. Interested", count: interested, pct: Math.round((interested / total) * 100), color: "bg-[#A855F7]" },
      { label: "4. Signed / Live", count: converted, pct: Math.round((converted / total) * 100), color: "bg-[#EC4899]" }
    ];
  }, [leads]);

  return (
    <div className="space-y-4 animate-fadeIn pb-6 text-[#F8FAFC]">
      
      {/* Header section with reduced height (40% shorter) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pb-1.5 border-b border-[#1F2937]">
        <div>
          <h2 className="text-sm font-extrabold text-white font-sans tracking-tight leading-none">Command Center</h2>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5">REAL-TIME REVENUE METRICS & AGENT STATUS</p>
        </div>
        <div className="text-[10px] bg-[#111827]/80 border border-[#1F2937] text-slate-300 font-mono px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-pulse" />
          Queue: {leads.length} Target Accounts
        </div>
      </div>

      {/* Compact Grid Layout for Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* ROW 1: New Leads & Active Clients */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] hover:border-[#7C3AED]/40 transition-all rounded-xl p-3 shadow-md flex flex-col justify-between h-[85px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">New Leads</span>
            <Users size={14} className="text-[#A855F7]" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-none font-mono">{stats.newLeads}</div>
            <span className="text-[8px] font-mono text-slate-500 block mt-0.5">Pending Scans / Score</span>
          </div>
        </div>

        <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] hover:border-[#7C3AED]/40 transition-all rounded-xl p-3 shadow-md flex flex-col justify-between h-[85px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">Active Clients</span>
            <Layers size={14} className="text-emerald-500" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-none font-mono">{stats.activeClients}</div>
            <span className="text-[8px] font-mono text-emerald-500 block mt-0.5">Engaged In Funnel</span>
          </div>
        </div>

        {/* ROW 2: Pending Followups & Websites Live */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] hover:border-[#7C3AED]/40 transition-all rounded-xl p-3 shadow-md flex flex-col justify-between h-[85px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">Pending Followups</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-none font-mono">{stats.pendingFollowups}</div>
            <span className="text-[8px] font-mono text-slate-500 block mt-0.5">Campaigns Active</span>
          </div>
        </div>

        <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] hover:border-[#7C3AED]/40 transition-all rounded-xl p-3 shadow-md flex flex-col justify-between h-[85px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">Websites Live</span>
            <Sparkles size={14} className="text-indigo-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-none font-mono">{stats.websitesLive}</div>
            <span className="text-[8px] font-mono text-indigo-400 block mt-0.5">Tailwind Pages Generated</span>
          </div>
        </div>

        {/* ROW 3: Pipeline Value & Monthly Revenue Goal */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] hover:border-[#7C3AED]/40 transition-all rounded-xl p-3 shadow-md flex flex-col justify-between h-[85px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">Pipeline Value</span>
            <DollarSign size={14} className="text-[#7C3AED]" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-none font-mono">${stats.pipelineValue.toLocaleString()}</div>
            <span className="text-[8px] font-mono text-slate-500 block mt-0.5">Drafted Proposals sum</span>
          </div>
        </div>

        <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] hover:border-[#7C3AED]/40 transition-all rounded-xl p-3 shadow-md flex flex-col justify-between h-[85px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">Revenue Goal</span>
            <TrendingUp size={14} className="text-pink-500" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-none font-mono">{stats.goalPercent}%</div>
            <span className="text-[8px] font-mono text-pink-400 block mt-0.5">${stats.closedRevenue.toLocaleString()} of $25K</span>
          </div>
        </div>
      </div>

      {/* Panels Layout (Side-by-side in responsive grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        
        {/* Panel 1: Today's Tasks */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] rounded-xl overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px]">
          <div className="px-4 py-2 bg-[#111827] border-b border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckSquare size={13} className="text-[#7C3AED]" />
              <span className="text-xs font-bold text-white font-sans">Today's Focus Tasks</span>
            </div>
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">
              {tasks.length} items
            </span>
          </div>

          <div className="divide-y divide-[#1F2937] flex-1">
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-full">
                All caught up! Discover new leads inside the Discovery Wizard.
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-3 flex items-center justify-between hover:bg-[#1F2937]/30 transition-colors group">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="mt-0.5 w-3.5 h-3.5 rounded border border-[#1F2937] group-hover:border-[#7C3AED] flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-sm bg-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-200 line-clamp-1">{task.text}</p>
                      <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5 block">{task.type} • Client: {task.leadName}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onFocusLead(task.leadId, task.type === "billing" || task.type === "design" ? "website" : task.type === "outreach" ? "outreach" : "dossier")}
                    className="text-[10px] text-[#A855F7] hover:text-[#7C3AED] font-bold font-mono uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                  >
                    Run <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 2: Upcoming Followups */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] rounded-xl overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px]">
          <div className="px-4 py-2 bg-[#111827] border-b border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-amber-500" />
              <span className="text-xs font-bold text-white font-sans">Upcoming Followups</span>
            </div>
            <span className="text-[8px] font-mono text-amber-500 font-bold uppercase">
              {upcomingFollowups.length} scheduled
            </span>
          </div>

          <div className="divide-y divide-[#1F2937] flex-1">
            {upcomingFollowups.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-full">
                No active followups or auto-drips active.
              </div>
            ) : (
              upcomingFollowups.map((lead) => (
                <div key={lead.id} className="p-3 flex items-center justify-between hover:bg-[#1F2937]/30 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-200 leading-tight">{lead.businessName}</p>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5">
                      {lead.ownerName || "Unknown Owner"} • Lead Score: {lead.leadScore}/100
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#A855F7] py-0.5 px-2 rounded-full font-bold">
                      DRIP ACTIVE
                    </span>
                    <button
                      onClick={() => onFocusLead(lead.id, "dossier")}
                      className="text-[10px] text-slate-400 hover:text-white font-bold cursor-pointer"
                    >
                      Audit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 3: Conversion Funnel */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] rounded-xl overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px]">
          <div className="px-4 py-2 bg-[#111827] border-b border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers size={13} className="text-pink-500" />
              <span className="text-xs font-bold text-white font-sans">Conversion Funnel</span>
            </div>
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">
              Metrics Progression
            </span>
          </div>

          <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-center">
            {funnel.map((stage, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="font-semibold text-slate-200">{stage.label}</span>
                  <span className="font-bold">{stage.count} ({stage.pct}%)</span>
                </div>
                <div className="w-full bg-[#1F2937] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`${stage.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(stage.pct, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 4: Recent Activity */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-[#1F2937] rounded-xl overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px]">
          <div className="px-4 py-2 bg-[#111827] border-b border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity size={13} className="text-emerald-500" />
              <span className="text-xs font-bold text-white font-sans">Recent Activity</span>
            </div>
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">
              Live Agency Log
            </span>
          </div>

          <div className="divide-y divide-[#1F2937] flex-1 max-h-[175px] overflow-y-auto">
            {recentActivities.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-full">
                No recent activity recorded.
              </div>
            ) : (
              recentActivities.map((act, i) => (
                <div key={i} className="p-3 flex items-start gap-2 hover:bg-[#1F2937]/10 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-300 leading-normal font-sans">
                      <span className="font-bold text-white">{act.leadName}</span>: {act.message}
                    </p>
                    <span className="text-[8px] font-mono text-slate-500 block">
                      {new Date(act.timestamp).toLocaleDateString()} @ {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
