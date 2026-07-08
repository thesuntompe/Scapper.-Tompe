import { Users, AlertTriangle, Send, Code, ShieldAlert, DollarSign } from "lucide-react";
import { Lead } from "../types";

interface MetricCardsProps {
  leads: Lead[];
  activeFilter: "all" | "high_priority" | "sent" | "sites_built" | "revenue";
  onFilterChange: (filter: "all" | "high_priority" | "sent" | "sites_built" | "revenue") => void;
}

export default function MetricCards({ leads, activeFilter, onFilterChange }: MetricCardsProps) {
  const totalResearched = leads.length;
  const highPriority = leads.filter(l => l.leadScore >= 70).length;
  const emailsSent = leads.reduce((acc, l) => acc + l.emails.filter(e => e.sentAt).length, 0);
  const sitesGenerated = leads.filter(l => l.generatedWebsite?.htmlCode).length;
  const paidLeads = leads.filter(l => l.invoice?.status === "paid");
  const totalRevenue = paidLeads.reduce((acc, l) => acc + (l.invoice?.amount || 0), 0);
  
  const stats = [
    {
      id: "all" as const,
      label: "Businesses Discovered",
      value: totalResearched,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      activeBg: "bg-blue-50/50 border-blue-400 shadow-sm"
    },
    {
      id: "high_priority" as const,
      label: "High Priority (Score >= 70)",
      value: highPriority,
      icon: ShieldAlert,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      activeBg: "bg-amber-50/50 border-amber-400 shadow-sm"
    },
    {
      id: "sent" as const,
      label: "Outreach Emails Sent",
      value: emailsSent,
      icon: Send,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      activeBg: "bg-emerald-50/50 border-emerald-400 shadow-sm"
    },
    {
      id: "sites_built" as const,
      label: "AI Sites Generated",
      value: sitesGenerated,
      icon: Code,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      activeBg: "bg-indigo-50/50 border-indigo-400 shadow-sm"
    },
    {
      id: "revenue" as const,
      label: "Revenue Collected",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      activeBg: "bg-rose-50/50 border-rose-400 shadow-sm"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const isActive = activeFilter === stat.id;
        return (
          <button
            key={i}
            onClick={() => onFilterChange(stat.id)}
            className={`p-5 rounded-xl border flex items-center justify-between text-left transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus:outline-none ${
              isActive
                ? stat.activeBg + " border-2 ring-2 ring-indigo-500/10"
                : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-bold font-sans text-slate-800 mt-1 tracking-tight flex items-center gap-2">
                {stat.value}
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping inline-block" />
                )}
              </h3>
            </div>
            <div className={`p-3 rounded-lg border ${stat.color} ${isActive ? "scale-115 shadow-sm" : ""}`}>
              <Icon size={18} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
