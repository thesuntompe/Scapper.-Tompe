import React from "react";
import { Star, Globe, ShieldAlert, AlertCircle, RotateCcw, ChevronRight, X, Filter, CheckCircle2, Instagram, MessageCircle, Mail, Phone } from "lucide-react";
import { Lead } from "../types";

const getCountry = (lead: Lead) => {
  if (lead.country) return lead.country;
  const parts = lead.location?.split(",").map(p => p.trim()) || [];
  if (parts.length >= 3) return parts[parts.length - 1];
  if (parts.length === 2) {
    const last = parts[1];
    if (last.length === 2 && last === last.toUpperCase()) return "USA";
    return last;
  }
  return lead.location || "Global";
};

const getCity = (lead: Lead) => {
  if (lead.city) return lead.city;
  const parts = lead.location?.split(",").map(p => p.trim()) || [];
  return parts[0] || "Global City";
};

const getWebsiteStatusLabel = (lead: Lead) => {
  const op = lead.onlinePresence;
  const issues = op.issuesDetected || [];
  
  if (!op.hasWebsite) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold font-mono">
        <ShieldAlert size={10} />
        No Website
      </span>
    );
  }
  
  const isBroken = issues.some(i => i.toLowerCase().includes("broken") || i.toLowerCase().includes("non-functional"));
  if (isBroken) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold font-mono">
        <AlertCircle size={10} />
        Broken Website
      </span>
    );
  }
  
  if (op.mobileResponsive === false) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold font-mono">
        <Globe size={10} />
        Non-Responsive
      </span>
    );
  }
  
  if (op.loadingSpeed === "slow") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold font-mono">
        Slow Website
      </span>
    );
  }

  if (op.designQuality === "poor") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold font-mono">
        Poor Design
      </span>
    );
  }

  if (op.websiteAgeYears && op.websiteAgeYears > 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono">
        Old ({op.websiteAgeYears} yrs)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-mono">
      Exists (Modern)
    </span>
  );
};

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

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [countryInput, setCountryInput] = React.useState("");
  const [stateInput, setStateInput] = React.useState("");
  const [cityInput, setCityInput] = React.useState("");
  const [categoryInput, setCategoryInput] = React.useState("");
  const [minRating, setMinRating] = React.useState<number>(0);
  const [websiteStatus, setWebsiteStatus] = React.useState<string>("all");
  const [businessSize, setBusinessSize] = React.useState<string>("all");

  // Helper to determine priority category score matching the specified priority list
  const getPriorityScore = (lead: Lead): number => {
    const op = lead.onlinePresence;
    if (!op.hasWebsite) return 100; // Priority 1: No website
    
    // Priority 2: Outdated or non-mobile-friendly websites
    const isOutdatedOrNonMobile = op.mobileResponsive === false || (op.issuesDetected && op.issuesDetected.some(i => i.toLowerCase().includes("outdated") || i.toLowerCase().includes("mobile") || i.toLowerCase().includes("responsive")));
    if (isOutdatedOrNonMobile) return 75;
    
    // Priority 3: Slow or poorly designed websites
    const isSlowOrPoorDesign = op.loadingSpeed === "slow" || op.designQuality === "poor" || (op.issuesDetected && op.issuesDetected.some(i => i.toLowerCase().includes("slow") || i.toLowerCase().includes("design") || i.toLowerCase().includes("speed") || i.toLowerCase().includes("experience")));
    if (isSlowOrPoorDesign) return 50;
    
    // Priority 4: Websites older than 5 years
    const isOlderThan5Years = op.websiteAgeYears !== undefined && op.websiteAgeYears > 5;
    if (isOlderThan5Years) return 25;
    
    return 0;
  };

  // Perform filtration based on selected activeFilter and advanced criteria
  const filteredLeads = React.useMemo(() => {
    // 1. Initial base filter
    let list = leads.filter((lead) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "high_priority") return lead.leadScore >= 70;
      if (activeFilter === "sent") return lead.emails.some((e) => e.sentAt && e.sender === "agent");
      if (activeFilter === "sites_built") return !!lead.generatedWebsite?.htmlCode || lead.status === "site_generated" || lead.status === "client_review" || lead.status === "paid_and_deployed";
      if (activeFilter === "revenue") return lead.invoice?.status === "paid";
      return true;
    });

    // 2. Apply Location (Country, State, City) Filters
    if (countryInput.trim()) {
      const query = countryInput.toLowerCase().trim();
      list = list.filter(lead => lead.location?.toLowerCase().includes(query));
    }
    if (stateInput.trim()) {
      const query = stateInput.toLowerCase().trim();
      list = list.filter(lead => lead.location?.toLowerCase().includes(query));
    }
    if (cityInput.trim()) {
      const query = cityInput.toLowerCase().trim();
      list = list.filter(lead => lead.location?.toLowerCase().includes(query));
    }

    // 3. Apply Category Filter
    if (categoryInput.trim()) {
      const query = categoryInput.toLowerCase().trim();
      list = list.filter(lead => lead.category?.toLowerCase().includes(query));
    }

    // 4. Apply Minimum Rating Filter
    if (minRating > 0) {
      list = list.filter(lead => lead.googleRating >= minRating);
    }

    // 5. Apply Business Size Filter (based on Google Review count)
    if (businessSize !== "all") {
      list = list.filter(lead => {
        const count = lead.reviewCount || 0;
        if (businessSize === "small") return count < 30;
        if (businessSize === "medium") return count >= 30 && count <= 150;
        if (businessSize === "large") return count > 150;
        return true;
      });
    }

    // 6. Apply Website Status Filter and "skip modern responsive" requirement
    list = list.filter(lead => {
      const op = lead.onlinePresence;
      const issues = op.issuesDetected || [];
      
      // Determine if they already have a modern responsive website to skip
      const isModernResponsive = op.hasWebsite && op.mobileResponsive !== false && op.loadingSpeed !== "slow" && op.designQuality !== "poor";
      
      if (websiteStatus === "all") {
        // Skip modern responsive websites as requested
        return !isModernResponsive;
      }
      if (websiteStatus === "no_website") {
        return !op.hasWebsite || issues.some(i => i.toLowerCase().includes("no website") || i.toLowerCase().includes("absence"));
      }
      if (websiteStatus === "broken_website") {
        return issues.some(i => i.toLowerCase().includes("broken") || i.toLowerCase().includes("non-functional"));
      }
      if (websiteStatus === "old_website") {
        return (op.websiteAgeYears !== undefined && op.websiteAgeYears > 5) || issues.some(i => i.toLowerCase().includes("old") || i.toLowerCase().includes("outdated") || i.toLowerCase().includes("years"));
      }
      if (websiteStatus === "non_responsive") {
        return op.mobileResponsive === false || issues.some(i => i.toLowerCase().includes("mobile") || i.toLowerCase().includes("responsive"));
      }
      if (websiteStatus === "slow_website") {
        return op.loadingSpeed === "slow" || issues.some(i => i.toLowerCase().includes("speed") || i.toLowerCase().includes("slow"));
      }
      if (websiteStatus === "poor_design") {
        return op.designQuality === "poor" || issues.some(i => i.toLowerCase().includes("experience") || i.toLowerCase().includes("design") || i.toLowerCase().includes("poor"));
      }
      return true;
    });

    // 7. Sort by Priority order
    list.sort((a, b) => {
      const scoreA = getPriorityScore(a);
      const scoreB = getPriorityScore(b);
      return scoreB - scoreA;
    });

    return list;
  }, [leads, activeFilter, countryInput, stateInput, cityInput, categoryInput, minRating, websiteStatus, businessSize]);

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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
      {/* Header Controls */}
      <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
        <div>
          <h2 className="text-md font-bold text-slate-800 font-sans tracking-tight">AI CRM Lead Pipeline</h2>
          <p className="text-[10px] text-slate-400 font-mono">QUALIFIED ACQUISITION SELECTION</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-[10px] font-mono py-1.5 px-3 border rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              showAdvanced 
                ? "bg-indigo-600 border-indigo-700 text-white font-semibold" 
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <Filter size={12} />
            {showAdvanced ? "Hide Filters" : "Advanced Filters"}
          </button>

          <button
            onClick={onResetDB}
            className="text-[10px] font-mono py-1.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset leads to pre-populated campaign samples"
          >
            <RotateCcw size={12} />
            Reset Ledger
          </button>
        </div>
      </div>

      {/* Collapsible Advanced Filters Panel */}
      {showAdvanced && (
        <div className="px-6 py-5 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Country</label>
            <input
              type="text"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500 font-sans shadow-sm"
              placeholder="e.g. India, Australia, UK"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">State or Region</label>
            <input
              type="text"
              value={stateInput}
              onChange={(e) => setStateInput(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500 font-sans shadow-sm"
              placeholder="e.g. Telangana, Sydney, NY"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">City</label>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500 font-sans shadow-sm"
              placeholder="e.g. Hyderabad, London, Dallas"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Business Category</label>
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500 font-sans shadow-sm"
              placeholder="e.g. Cafe, HVAC, Dental"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500 font-sans shadow-sm"
            >
              <option value="0">All Ratings</option>
              <option value="3">3.0+ Stars</option>
              <option value="4">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Website Status</label>
            <select
              value={websiteStatus}
              onChange={(e) => setWebsiteStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500 font-sans shadow-sm"
            >
              <option value="all">All Businesses</option>
              <option value="no_website">No Website</option>
              <option value="broken_website">Broken Website</option>
              <option value="old_website">Old Website (&gt;5 yrs)</option>
              <option value="non_responsive">Non Responsive Website</option>
              <option value="slow_website">Slow Website</option>
              <option value="poor_design">Website Exists but Poor Design</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Business Size</label>
            <select
              value={businessSize}
              onChange={(e) => setBusinessSize(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500 font-sans shadow-sm"
            >
              <option value="all">All Sizes</option>
              <option value="small">Small (&lt; 30 reviews)</option>
              <option value="medium">Medium (30 - 150 reviews)</option>
              <option value="large">Large (&gt; 150 reviews)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setCountryInput("");
                setStateInput("");
                setCityInput("");
                setCategoryInput("");
                setMinRating(0);
                setWebsiteStatus("all");
                setBusinessSize("all");
              }}
              className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold font-sans flex items-center justify-center gap-1.5 transition-all border border-slate-200 cursor-pointer shadow-sm"
            >
              <RotateCcw size={11} />
              Reset All Filters
            </button>
          </div>
        </div>
      )}

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
            <table className="w-full text-left border-collapse min-w-[1150px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4 text-center">Website Status</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4 text-center">Instagram</th>
                  <th className="py-3 px-4 text-center">WhatsApp</th>
                  <th className="py-3 px-4 text-center">Lead Score</th>
                  <th className="py-3 px-4">AI Recommendation</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLeadId === lead.id;
                  const isHighPriority = lead.leadScore >= 70;
                  const igUrl = lead.contactInfo?.instagram_url || (lead.socialMedia?.instagram ? (lead.socialMedia.instagram.startsWith("http") ? lead.socialMedia.instagram : `https://instagram.com/${lead.socialMedia.instagram.replace(/^@/, "")}`) : "");
                  const cleanPhone = (lead.contactInfo?.phone_number || lead.phone || "").replace(/\D/g, "");
                  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "";

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
                      {/* Business Name */}
                      <td className="py-4 px-4 font-sans text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {lead.businessName}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 font-sans text-xs text-slate-600">
                        {lead.category}
                      </td>

                      {/* Country */}
                      <td className="py-4 px-4 font-sans text-xs text-slate-600">
                        {getCountry(lead)}
                      </td>

                      {/* City */}
                      <td className="py-4 px-4 font-sans text-xs text-slate-600">
                        {getCity(lead)}
                      </td>

                      {/* Website Status */}
                      <td className="py-4 px-4 text-center">
                        {getWebsiteStatusLabel(lead)}
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 font-mono text-[11px]">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-indigo-600 hover:underline flex items-center gap-1.5 font-sans"
                            title={lead.email}
                          >
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate max-w-[120px]">{lead.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Phone Number */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                        {lead.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone size={11} className="text-slate-400" />
                            {lead.phone}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Instagram Link */}
                      <td className="py-4 px-4 text-center">
                        {igUrl ? (
                          <a
                            href={igUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
                            title="Instagram Profile"
                          >
                            <Instagram size={13} />
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>

                      {/* WhatsApp Link */}
                      <td className="py-4 px-4 text-center">
                        {waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="WhatsApp Chat"
                          >
                            <MessageCircle size={13} />
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>

                      {/* Lead Score */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 justify-center">
                          {isHighPriority && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          )}
                          <span className={`text-xs font-bold font-mono ${
                            isHighPriority ? "text-amber-600" : "text-slate-500"
                          }`}>
                            {lead.leadScore}
                          </span>
                        </div>
                      </td>

                      {/* AI Recommendation */}
                      <td className="py-4 px-4">
                        <p className="text-[11px] text-slate-500 font-sans max-w-[200px] leading-relaxed truncate" title={lead.aiRecommendation || lead.onlinePresence?.issuesDetected?.[0]}>
                          {lead.aiRecommendation || lead.onlinePresence?.issuesDetected?.[0] || "No issues identified."}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
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
