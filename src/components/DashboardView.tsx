import React, { useMemo } from "react";
import { 
  CheckSquare, Clock, FileText, CreditCard, Ship, Activity, 
  ArrowRight, ShieldAlert, Sparkles, TrendingUp, Users, DollarSign, ExternalLink
} from "lucide-react";
import { Lead } from "../types";

interface DashboardViewProps {
  leads: Lead[];
  onFocusLead: (leadId: string, tab: "dossier" | "outreach" | "website") => void;
  onNavigateSection: (section: string) => void;
}

export default function DashboardView({ leads, onFocusLead, onNavigateSection }: DashboardViewProps) {
  
  // 1. Compute dynamic metrics
  const stats = useMemo(() => {
    const total = leads.length;
    const highPriority = leads.filter(l => l.leadScore >= 70).length;
    const paidLeads = leads.filter(l => l.invoice?.status === "paid");
    const totalRevenue = paidLeads.reduce((acc, l) => acc + (l.invoice?.amount || 0), 0);
    const sitesBuilt = leads.filter(l => l.generatedWebsite?.htmlCode).length;

    return { total, highPriority, totalRevenue, sitesBuilt };
  }, [leads]);

  // 2. Generate Today's Tasks dynamically based on real Lead states
  const tasks = useMemo(() => {
    const taskList: { id: string; text: string; leadId: string; type: "audit" | "outreach" | "design" | "billing"; leadName: string }[] = [];
    
    leads.forEach((l) => {
      if (l.status === "discovered") {
        taskList.push({
          id: `task-audit-${l.id}`,
          text: `Audit online presence deficits for ${l.businessName}`,
          leadId: l.id,
          type: "audit",
          leadName: l.businessName
        });
      }
      if (l.status === "scored" || l.status === "followup_scheduled") {
        taskList.push({
          id: `task-outreach-${l.id}`,
          text: `Draft high-converting email campaign for ${l.businessName}`,
          leadId: l.id,
          type: "outreach",
          leadName: l.businessName
        });
      }
      if (l.status === "outreach_drafted") {
        taskList.push({
          id: `task-send-${l.id}`,
          text: `Send customized proposal deck to ${l.ownerName}`,
          leadId: l.id,
          type: "outreach",
          leadName: l.businessName
        });
      }
      if (l.status === "replied_interested" && !l.generatedWebsite?.htmlCode) {
        taskList.push({
          id: `task-design-${l.id}`,
          text: `Design high-fidelity Tailwind mockup for ${l.businessName}`,
          leadId: l.id,
          type: "design",
          leadName: l.businessName
        });
      }
      if (l.invoice && l.invoice.status === "pending") {
        taskList.push({
          id: `task-bill-${l.id}`,
          text: `Collect UPI / Bank Wire settlement of $${l.invoice.amount} for ${l.businessName}`,
          leadId: l.id,
          type: "billing",
          leadName: l.businessName
        });
      }
    });

    return taskList.slice(0, 5); // Limit to top 5
  }, [leads]);

  // 3. Pending Follow Ups
  const pendingFollowups = useMemo(() => {
    return leads.filter((l) => l.followupAutomation?.enabled || l.status === "followup_scheduled");
  }, [leads]);

  // 4. Clients Waiting For Proposal
  const waitingForProposal = useMemo(() => {
    return leads.filter((l) => !l.proposal && (l.status === "discovered" || l.status === "scored" || l.status === "replied_interested"));
  }, [leads]);

  // 5. Payments Pending
  const paymentsPending = useMemo(() => {
    return leads.filter((l) => l.invoice && l.invoice.status === "pending");
  }, [leads]);

  // 6. Deployments Pending
  const deploymentsPending = useMemo(() => {
    return leads.filter((l) => l.generatedWebsite?.htmlCode && l.status !== "paid_and_deployed");
  }, [leads]);

  // 7. Recent Activity feed aggregated from ALL leads
  const recentActivities = useMemo(() => {
    const allLogs: { leadId: string; leadName: string; message: string; timestamp: string; type: string }[] = [];
    
    leads.forEach((l) => {
      if (l.activities) {
        l.activities.forEach((act) => {
          allLogs.push({
            leadId: l.id,
            leadName: l.businessName,
            message: act.message,
            timestamp: act.timestamp,
            type: act.type
          });
        });
      }
    });

    // Sort by chronological order (newest first)
    return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
  }, [leads]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Overview stats ribbon (Linear/Stripe style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold font-sans">Active Pipeline Size</span>
            <Users size={16} className="text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.total}</span>
            <span className="text-xs text-emerald-600 font-bold font-sans">leads index</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold font-sans">High Deficit Targets</span>
            <ShieldAlert size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.highPriority}</span>
            <span className="text-xs text-amber-600 font-mono">Score &ge; 70</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold font-sans">Redesign Demos Built</span>
            <Sparkles size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.sitesBuilt}</span>
            <span className="text-xs text-indigo-600 font-sans">mockups live</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold font-sans">Settled Revenue</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">${stats.totalRevenue.toLocaleString()}</span>
            <span className="text-xs text-emerald-600 font-mono">USD Net</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left column (Tasks, Follow-ups, Proposals) + Right column (Payments, Deployments, Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: TODAY'S TASKS */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="text-indigo-600" size={16} />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Today's Focus Tasks</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold uppercase">
                Action items ({tasks.length})
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All caught up! Discover new leads in the <button onClick={() => onNavigateSection("discovery")} className="text-indigo-600 font-bold hover:underline">Discovery Wizard</button>.
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 border-slate-300 group-hover:border-indigo-500 transition-colors`}>
                        <span className="w-2 h-2 rounded-sm bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-800 font-medium leading-normal">{task.text}</p>
                        <span className="text-[9px] font-mono text-slate-400 uppercase mt-0.5 block">{task.type} • Client: {task.leadName}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onFocusLead(task.leadId, task.type === "billing" || task.type === "design" ? "website" : task.type === "outreach" ? "outreach" : "dossier")}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      Process <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 2: PENDING FOLLOW UPS */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-amber-500" size={16} />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Active Follow-up Workflows</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-bold uppercase">
                {pendingFollowups.length} scheduled
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingFollowups.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No scheduled follow-up campaigns active. Turn on automation in any client's CRM dossier tab.
                </div>
              ) : (
                pendingFollowups.map((lead) => (
                  <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{lead.businessName}</p>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                        Owner: {lead.ownerName || "Unavailable"} • Channel: {lead.email ? "Direct Email" : "Direct Link"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full font-bold">
                        AUTO-DRIP ACTIVE
                      </span>
                      <button
                        onClick={() => onFocusLead(lead.id, "dossier")}
                        className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 3: CLIENTS WAITING FOR PROPOSAL */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-blue-500" size={16} />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Awaiting Proposal Generation</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold uppercase">
                {waitingForProposal.length} prospects
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {waitingForProposal.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active clients waiting for pricing proposals.
                </div>
              ) : (
                waitingForProposal.map((lead) => (
                  <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{lead.businessName}</p>
                      <p className="text-[10px] text-slate-400 font-sans">HQ: {lead.location} • Lead Score: {lead.leadScore}/100</p>
                    </div>
                    <button
                      onClick={() => onFocusLead(lead.id, "dossier")}
                      className="text-xs py-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      Draft Proposal
                      <ArrowRight size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECTION 4: PAYMENTS PENDING */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="text-emerald-500" size={16} />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Awaiting Payment Settlement</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase">
                {paymentsPending.length} pending
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {paymentsPending.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All accounts settled. Zero outstanding invoices!
                </div>
              ) : (
                paymentsPending.map((lead) => (
                  <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{lead.businessName}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Invoice: #{lead.invoice?.id.substring(4, 11)} • Amount: ${lead.invoice?.amount}</p>
                    </div>
                    <button
                      onClick={() => onFocusLead(lead.id, "website")}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      Settle Offline
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 5: DEPLOYMENTS PENDING */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ship className="text-indigo-500" size={16} />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Ready for Deployment</h3>
              </div>
              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-bold uppercase">
                {deploymentsPending.length} ready
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {deploymentsPending.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No custom mockups waiting for build deployment.
                </div>
              ) : (
                deploymentsPending.map((lead) => (
                  <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{lead.businessName}</p>
                      <p className="text-[10px] text-slate-400 font-sans">Theme: {lead.generatedWebsite?.theme || "Modern"} • Code built</p>
                    </div>
                    <button
                      onClick={() => onFocusLead(lead.id, "website")}
                      className="text-xs py-1 px-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 rounded-lg font-bold transition-all cursor-pointer"
                    >
                      Deploy Edge
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 6: RECENT ACTIVITY STREAM */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="text-slate-500" size={16} />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Centralized CRM Audit Feed</h3>
              </div>
            </div>

            <div className="divide-y divide-slate-150 p-4 space-y-4 max-h-[380px] overflow-y-auto">
              {recentActivities.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-6">
                  No recent activities recorded.
                </div>
              ) : (
                recentActivities.map((act, i) => (
                  <div key={i} className="flex gap-3 pt-2 first:pt-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-slate-700 leading-normal font-sans">
                        <span className="font-bold text-slate-900">{act.leadName}</span>: {act.message}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 block">
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
    </div>
  );
}
