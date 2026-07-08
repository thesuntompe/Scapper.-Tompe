import React from "react";
import { Star, Globe, ShieldAlert, AlertCircle, RotateCcw, ChevronRight, X, Filter, CheckCircle2 } from "lucide-react";
import { Lead } from "../types";

interface LeadsDashboardProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  onResetDB: () => void;
  activeFilter: "all" | "high_priority" | "sent" | "sites_built" | "revenue";
  onClearFilter: () => void;
}

export default function LeadsDashboard({
  leads,
  selectedLeadId,
  onSelectLead,
  onResetDB,
  activeFilter,
  onClearFilter
}: LeadsDashboardProps) {

  const getStatusBadge = (status: Lead["status"]) => {
    switch (status) {
      case "discovered":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">Discovered</span>;
      case "outreach_drafted":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">Outreach Drafted</span>;
      case "emailed":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">Sent</span>;
      case "replied_interested":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">Interested</span>;
      case "replied_uninterested":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase">Passed</span>;
      case "planning":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-violet-50 text-violet-700 border border-violet-200 uppercase">Planning</span>;
      case "site_generated":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">Site Built</span>;
      case "client_review":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase">In Review</span>;
      case "paid_and_deployed":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-600 text-white border border-emerald-700 uppercase">Paid & Deployed</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 text-slate-500 uppercase">{status}</span>;
    }
  };

  // Perform filtration based on selected activeFilter
  const filteredLeads = leads.filter((lead) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "high_priority") return lead.leadScore >= 70;
    if (activeFilter === "sent") return lead.emails.some((e) => e.sentAt && e.sender === "agent");
    if (activeFilter === "sites_built") return !!lead.generatedWebsite?.htmlCode || lead.status === "site_generated" || lead.status === "client_review" || lead.status === "paid_and_deployed";
    if (activeFilter === "revenue") return lead.invoice?.status === "paid";
    return true;
  });

  const getFilterLabel = () => {
    switch (activeFilter) {
      case "high_priority":
        return "High Priority Leads (Score >= 70)";
      case "sent":
        return "Leads with Outreach Emails Sent";
      case "sites_built":
        return "Leads with AI Website Mockups Generated";
      case "revenue":
        return "Leads with Revenue Collected";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header Controls */}
      <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
        <div>
          <h2 className="text-md font-bold text-slate-800 font-sans tracking-tight">AI CRM Lead Pipeline</h2>
          <p className="text-[10px] text-slate-400 font-mono">STEP 4: QUALIFIED ACQUISITION SELECTION</p>
        </div>
        
        <button
          onClick={onResetDB}
          className="text-[10px] font-mono py-1.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
          title="Reset leads to pre-populated campaign samples"
        >
          <RotateCcw size={12} />
          Reset Ledger
        </button>
      </div>

      {/* Active Filter Banner */}
      {activeFilter !== "all" && (
        <div className="px-6 py-3 bg-indigo-50/50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-indigo-700">
            <Filter size={13} className="text-indigo-600" />
            <span className="font-semibold font-sans text-xs">
              Filter: <span className="text-slate-800 font-mono">{getFilterLabel()}</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100/50 text-indigo-800 font-mono font-bold">
              {filteredLeads.length} Leads
            </span>
          </div>
          <button
            onClick={onClearFilter}
            className="flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-slate-800 py-1 px-2 bg-white border border-slate-200 rounded-md transition-all cursor-pointer"
          >
            <X size={10} />
            Show All
          </button>
        </div>
      )}

      {leads.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <AlertCircle className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="font-mono text-xs text-slate-500">No leads discovered yet inside secure cloud cache.</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans">
            Use the Left-Hand discovery board to initiate autonomous background spider indexes!
          </p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <Filter className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="font-mono text-xs text-slate-500">No leads match the current filter criteria.</p>
          <button
            onClick={onClearFilter}
            className="mt-3 text-[10px] font-sans font-bold py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
          >
            Clear Active Filter
          </button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-6">Business & category</th>
                  <th className="py-3 px-4">Reviews</th>
                  <th className="py-3 px-4 text-center">Deficit Status</th>
                  <th className="py-3 px-4 text-center">Deficit Index</th>
                  <th className="py-3 px-4 text-center">Outreach Score</th>
                  <th className="py-3 px-4 text-center">Pipeline State</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLeadId === lead.id;
                  const isHighPriority = lead.leadScore >= 70;
                  const hasWebsite = lead.onlinePresence.hasWebsite;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`cursor-pointer transition-all duration-150 group ${
                        isSelected
                          ? "bg-slate-50 border-l-2 border-l-indigo-600"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors font-sans">{lead.businessName}</p>
                          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <span>{lead.category}</span>
                            <span className="text-slate-300">•</span>
                            <span>{lead.location}</span>
                          </p>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="text-amber-500 shrink-0" size={12} fill="currentColor" />
                          <span className="text-xs font-bold text-slate-700">{lead.googleRating}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({lead.reviewCount})</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {hasWebsite ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-mono">
                            <Globe size={10} />
                            Outdated
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-mono font-bold">
                            <ShieldAlert size={10} />
                            No Website
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`text-xs font-mono font-bold ${
                          lead.onlinePresence.improvementScore >= 80
                            ? "text-rose-600"
                            : lead.onlinePresence.improvementScore >= 50
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}>
                          {lead.onlinePresence.improvementScore}%
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                          {isHighPriority && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          )}
                          <span className={`text-xs font-bold font-mono ${
                            isHighPriority ? "text-amber-600" : "text-slate-400"
                          }`}>
                            {lead.leadScore}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(lead.status)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border flex items-center gap-0.5 ml-auto transition-all cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Workspace
                          <ChevronRight size={12} className={isSelected ? "" : "group-hover:translate-x-0.5 transition-transform"} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST CARD VIEW */}
          <div className="block md:hidden divide-y divide-slate-100 bg-white">
            {filteredLeads.map((lead) => {
              const isSelected = selectedLeadId === lead.id;
              const isHighPriority = lead.leadScore >= 70;
              const hasWebsite = lead.onlinePresence.hasWebsite;
              const isEmailed = lead.emails.some((e) => e.sentAt && e.sender === "agent");
              const isMockupReady = !!lead.generatedWebsite?.htmlCode || lead.status === "site_generated" || lead.status === "client_review" || lead.status === "paid_and_deployed";

              return (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={`p-5 space-y-4 cursor-pointer transition-colors duration-150 ${
                    isSelected ? "bg-slate-50 border-l-4 border-l-indigo-600" : "hover:bg-slate-50/50"
                  }`}
                >
                  {/* Top line: Name, Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-800 leading-tight">{lead.businessName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {lead.category} • {lead.location}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(lead.status)}
                    </div>
                  </div>

                  {/* Rating & Website presence line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 py-0.5 px-2 bg-slate-50 rounded border border-slate-200">
                      <Star className="text-amber-500 shrink-0" size={11} fill="currentColor" />
                      <span className="font-bold text-slate-700 text-[11px]">{lead.googleRating}</span>
                      <span className="text-slate-400 text-[9px] font-mono">({lead.reviewCount})</span>
                    </div>

                    {hasWebsite ? (
                      <div className="inline-flex items-center gap-1 py-0.5 px-2 rounded bg-blue-50 border border-blue-100 text-blue-600 font-mono text-[9px]">
                        <Globe size={10} />
                        Outdated Site
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 py-0.5 px-2 rounded bg-rose-50 border border-rose-100 text-rose-600 font-mono text-[9px] font-bold">
                        <ShieldAlert size={10} />
                        No Website
                      </div>
                    )}
                  </div>

                  {/* Performance Indicators & Scores */}
                  <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Audited Score</span>
                      <span className={`text-xs font-mono font-extrabold ${
                        lead.onlinePresence.improvementScore >= 80 ? "text-rose-600" : lead.onlinePresence.improvementScore >= 50 ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {lead.onlinePresence.improvementScore}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Outreach Score</span>
                      <div className="flex items-center gap-1">
                        {isHighPriority && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                        <span className={`text-xs font-mono font-extrabold ${isHighPriority ? "text-amber-600" : "text-slate-400"}`}>
                          {lead.leadScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specific Action Tracking Checklist (Emails and Website) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Outreach State:</span>
                      {isEmailed ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle2 size={11} /> Emailed
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">Awaiting Draft</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Redesign Demo:</span>
                      {isMockupReady ? (
                        <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                          <CheckCircle2 size={11} /> Generated
                        </span>
                      ) : (
                        <span className="text-slate-400">Not Synced</span>
                      )}
                    </div>
                    {lead.invoice && (
                      <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-200 pt-1.5 mt-1.5">
                        <span className="text-slate-500 font-bold">Billing Ledger:</span>
                        <span className={`font-bold uppercase ${lead.invoice.status === "paid" ? "text-emerald-600" : "text-amber-500"}`}>
                          {lead.invoice.status === "paid" ? "Paid" : "Pending"} (${lead.invoice.amount})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tap Action Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead(lead);
                    }}
                    className={`w-full py-2 px-4 rounded-xl font-sans font-bold text-[11px] flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    Open CRM Console
                    <ChevronRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
