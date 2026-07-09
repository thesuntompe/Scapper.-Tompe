import React, { useState } from "react";
import { 
  ShieldAlert, CheckCircle, Award, Target, HelpCircle, Flame, Star, Phone, Mail, MapPin, 
  Check, X, FileText, PenTool, DollarSign, Settings, Clock, AlertCircle, TrendingUp, Laptop, Zap, Sparkles
} from "lucide-react";
import { Lead } from "../types";

interface LeadDossierTabProps {
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
}

export default function LeadDossierTab({ lead, onUpdateLead }: LeadDossierTabProps) {
  const [subTab, setSubTab] = useState<"audit" | "crm" | "bi">("audit");
  
  // Signature pad simulation state
  const [signatureName, setSignatureName] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [signedLines, setSignedLines] = useState<boolean>(false);
  
  // Proposal & Contract simulation states
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [customPrice, setCustomPrice] = useState(lead.proposal?.price || 2499);
  
  // Follow-up state
  const [followupTemplate, setFollowupTemplate] = useState<"followup_1" | "followup_2">("followup_1");

  const isHighPriority = lead.leadScore >= 70;

  const contactPhone = lead.contactInfo?.phone_number || lead.phone || "";
  const contactEmail = lead.contactInfo?.email || lead.email || "";
  const contactInstagram = lead.contactInfo?.instagram_url || lead.socialMedia?.instagram || "";
  const contactFacebook = lead.contactInfo?.facebook_url || lead.socialMedia?.facebook || "";
  const contactLinkedin = lead.contactInfo?.linkedin_url || lead.socialMedia?.linkedin || "";
  const contactWebsite = lead.contactInfo?.website || lead.websiteUrl || "";
  const contactBusinessName = lead.contactInfo?.business_name || lead.businessName || "";

  const hasContactInfo = !!(contactPhone || contactEmail || contactInstagram || contactFacebook || contactLinkedin || contactWebsite);

  // Sync state changes with server
  const syncLeadChange = async (updates: Partial<Lead>) => {
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdateLead(updated);
      }
    } catch (err) {
      console.error("Failed to sync lead updates:", err);
    }
  };

  const handleToggleAutomation = () => {
    const isEnabled = lead.followupAutomation?.enabled;
    const nextTime = !isEnabled ? new Date(Date.now() + 86400000).toISOString() : undefined;
    
    syncLeadChange({
      followupAutomation: {
        enabled: !isEnabled,
        emailTemplateType: followupTemplate,
        nextScheduledTime: nextTime,
        daysSinceLastContact: !isEnabled ? 0 : lead.followupAutomation?.daysSinceLastContact
      },
      activities: [
        {
          id: `act_auto_${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: !isEnabled 
            ? `Follow-up automation enabled for ${lead.businessName}. Next scheduled check in 24 hours.`
            : `Follow-up automation paused.`,
          type: "outreach"
        },
        ...lead.activities
      ]
    });
  };

  const handleGenerateProposal = async () => {
    setCreatingProposal(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/generate-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: customPrice }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate proposal");
      }
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCreatingProposal(false);
    }
  };

  const handleAcceptProposal = () => {
    if (!lead.proposal) return;
    syncLeadChange({
      proposal: {
        ...lead.proposal,
        accepted: true
      },
      contract: {
        terms: `TERMS OF DIGITAL AGENCY REDESIGN CONTRACT

This Agreement is entered into by Singularity AI and ${lead.businessName} (represented by ${lead.ownerName}).
1. Scope: Custom Web Presence Design, HTTPS security setup, Google Review sync, mobile UI development.
2. Financials: The Client agrees to pay the sum of $${lead.proposal.price.toLocaleString()} USD.
3. Deployment: Work will be deployed live on fast production gateways. Upon full billing approval, the domain DNS will route to the active custom host.`,
        signed: false
      },
      activities: [
        {
          id: `act_prop_acc_${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: `Digital proposal accepted by client ${lead.ownerName}. Awaiting contract execution.`,
          type: "payment"
        },
        ...lead.activities
      ]
    });
  };

  const handleSignContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || !lead.contract) return;
    
    syncLeadChange({
      contract: {
        ...lead.contract,
        signed: true,
        signedAt: new Date().toISOString(),
        clientSignature: signatureName
      },
      status: "site_generated",
      invoice: {
        id: `inv_${Date.now().toString().substring(6)}`,
        amount: lead.proposal?.price || 2499,
        status: "pending",
        createdAt: new Date().toISOString()
      },
      activities: [
        {
          id: `act_sign_${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: `Contract legally executed by ${signatureName}. Pending invoice collection of $${(lead.proposal?.price || 2499).toLocaleString()}`,
          type: "payment"
        },
        ...lead.activities
      ]
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-sm gap-1">
        <button
          onClick={() => setSubTab("audit")}
          className={`flex-1 py-3 text-xs font-semibold rounded-lg font-sans transition-all flex items-center justify-center gap-2 ${
            subTab === "audit" 
              ? "bg-slate-900 text-white shadow-md" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Award size={14} />
          Presence & Verification Audit
        </button>
        <button
          onClick={() => setSubTab("crm")}
          className={`flex-1 py-3 text-xs font-semibold rounded-lg font-sans transition-all flex items-center justify-center gap-2 ${
            subTab === "crm" 
              ? "bg-slate-900 text-white shadow-md" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <FileText size={14} />
          SaaS CRM Pipeline & Deals
        </button>
        <button
          onClick={() => setSubTab("bi")}
          className={`flex-1 py-3 text-xs font-semibold rounded-lg font-sans transition-all flex items-center justify-center gap-2 ${
            subTab === "bi" 
              ? "bg-slate-900 text-white shadow-md" 
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <TrendingUp size={14} />
          Competitors & BI Report
        </button>
      </div>

      {/* VIEW 1: PRESENCE & VERIFICATION AUDIT */}
      {subTab === "audit" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Contact Verification Box */}
            <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">Verified Contact Intelligence</h3>
                <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Public Records Synced
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Business Name</span>
                  <p className="text-sm font-bold text-slate-800">{lead.businessName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Owner Name</span>
                  <p className="text-sm font-bold text-slate-800">{lead.ownerName || "Unavailable"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Verified Email Address</span>
                  <div className="flex items-center gap-1.5">
                    {lead.email ? (
                      <p className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1">
                        <Mail size={11} /> {lead.email}
                      </p>
                    ) : (
                      <p className="text-xs font-mono text-slate-400 italic">No Public Email Published</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Verified Phone Number</span>
                  <div className="flex items-center gap-1.5">
                    {lead.phone ? (
                      <p className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                        <Phone size={11} /> {lead.phone}
                      </p>
                    ) : (
                      <p className="text-xs font-mono text-slate-400 italic">No Phone Number Found</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Source breakdown and confidence indicators */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Contact Verification Trace & Sources</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Email Source</span>
                    <p className="font-semibold text-slate-700 truncate">{lead.contactSources?.emailSource || "None Detected"}</p>
                    <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-0.5">
                      <Check size={10} /> Conf: {lead.contactConfidence?.emailConfidence || 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Phone Source</span>
                    <p className="font-semibold text-slate-700 truncate">{lead.contactSources?.phoneSource || "Google Maps Profile"}</p>
                    <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-0.5">
                      <Check size={10} /> Conf: {lead.contactConfidence?.phoneConfidence || 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Owner Source</span>
                    <p className="font-semibold text-slate-700 truncate">{lead.contactSources?.ownerSource || "LLC Corporate filings"}</p>
                    <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-0.5">
                      <Check size={10} /> Conf: {lead.contactConfidence?.ownerConfidence || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Confidence Score Dial */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between items-center text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Verification Confidence</span>
              
              <div className="my-4 relative flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 animate-pulse border-t-transparent" />
                  <h1 className="text-3xl font-extrabold font-sans text-slate-800">
                    {lead.contactConfidence?.overallScore || 0}%
                  </h1>
                  <span className="text-[8px] font-mono text-indigo-600 uppercase mt-0.5 font-bold">Confidence</span>
                </div>
              </div>

              <div className="space-y-1 w-full">
                {lead.contactConfidence && lead.contactConfidence.overallScore >= 70 ? (
                  <div className="bg-emerald-50 text-emerald-700 text-[10px] font-sans py-1.5 px-3 rounded-lg font-bold border border-emerald-100 flex items-center justify-center gap-1">
                    <CheckCircle size={12} /> VERIFIED FOR OUTREACH
                  </div>
                ) : (
                  <div className="bg-rose-50 text-rose-700 text-[10px] font-sans py-1.5 px-3 rounded-lg font-bold border border-rose-100 flex items-center justify-center gap-1">
                    <ShieldAlert size={12} /> OUTREACH BLOCKED (&lt;70%)
                  </div>
                )}
                <p className="text-[9px] text-slate-400 leading-tight">
                  Our system blocks automated outreach if verification scores fall below 70% to ensure zero spam compliance.
                </p>
              </div>
            </div>

          </div>

          {/* Website Quality Audit Matrix */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">Website Quality Deficit Matrix</h3>
              <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded">
                Deficit score: {lead.onlinePresence.improvementScore}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">Mobile Responsive</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {lead.onlinePresence.mobileResponsive ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check size={12} /> Yes</span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1"><X size={12} /> Deficit (Broken)</span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">HTTPS/SSL Encrypted</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {lead.onlinePresence.securitySsl ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check size={12} /> Secure</span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1"><X size={12} /> Unsecure/Broken</span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">Google Review Sync</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {lead.onlinePresence.googleReviewsIntegration ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check size={12} /> Active</span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1"><X size={12} /> Deficit (None)</span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">Direct Booking Portal</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {lead.onlinePresence.hasBookingCapability ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check size={12} /> Configured</span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1"><X size={12} /> Deficit (Missing)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Core Technical Scoring metrics</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block">Accessibility Standard</span>
                    <p className="text-lg font-bold text-slate-800">{lead.onlinePresence.accessibilityScore || 0}/100</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block">SEO Visibility Score</span>
                    <p className="text-lg font-bold text-slate-800">{lead.onlinePresence.seoScore || 0}/100</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block">Estimated Web Store Age</span>
                    <p className="text-lg font-bold text-slate-800">
                      {lead.onlinePresence.websiteAgeYears ? `${lead.onlinePresence.websiteAgeYears} Years Old` : "No Website Found"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block">Presence Strategy</span>
                    <p className="text-xs font-bold text-slate-800">
                      {lead.onlinePresence.onlySocialPresence ? "Social-Only Profile (FB/IG)" : "Static Legacy Storefront"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Identified Strategic Vulnerabilities</span>
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                    {lead.onlinePresence.issuesDetected.map((issue, idx) => (
                      <p key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                        <ShieldAlert size={12} className="text-rose-500 shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Research History Dossier */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">AI Generated Corporate Dossier History</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">{lead.aiResearchSummary.history}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Verified Business Offerings</span>
                <div className="flex flex-wrap gap-1.5">
                  {lead.aiResearchSummary.services.map((srv, idx) => (
                    <span key={idx} className="text-[10px] font-mono bg-slate-100 text-slate-700 py-1 px-2.5 rounded-full border border-slate-200">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Identified Local Market Strengths</span>
                <div className="flex flex-wrap gap-1.5">
                  {lead.aiResearchSummary.strengths.map((str, idx) => (
                    <span key={idx} className="text-[10px] font-mono bg-emerald-50 text-emerald-700 py-1 px-2.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <Check size={9} /> {str}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SAAS CRM PIPELINE & DEALS */}
      {subTab === "crm" && (
        <div className="space-y-6">
          
          {/* CRM Stages Funnel Visualizer */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">SaaS CRM Funnel Timeline Progress</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">ACTIVE LEAD Funnel STAGE MANAGEMENT</p>
              </div>
              <span className="px-3 py-1 text-xs font-mono rounded bg-slate-900 text-white font-bold uppercase tracking-wider">
                Stage: {lead.status}
              </span>
            </div>

            {/* Pipeline Step Circles */}
            <div className="relative pt-2">
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -translate-y-1/2 z-0" />
              <div className="grid grid-cols-5 gap-2 relative z-10 text-center">
                {[
                  { key: "discovered", label: "Discovered" },
                  { key: "outreach", label: "Outreach" },
                  { key: "proposal", label: "Proposal" },
                  { key: "contract", label: "Contract" },
                  { key: "paid", label: "Closed/Paid" }
                ].map((stg, idx) => {
                  let isDone = false;
                  let isCurrent = false;
                  
                  if (stg.key === "discovered") {
                    isDone = true;
                    if (lead.status === "discovered") isCurrent = true;
                  } else if (stg.key === "outreach") {
                    isDone = lead.status !== "discovered";
                    if (lead.status === "outreach_drafted" || lead.status === "emailed") isCurrent = true;
                  } else if (stg.key === "proposal") {
                    isDone = ["planning", "site_generated", "client_review", "paid_and_deployed"].includes(lead.status);
                    if (lead.status === "planning") isCurrent = true;
                  } else if (stg.key === "contract") {
                    isDone = ["site_generated", "client_review", "paid_and_deployed"].includes(lead.status);
                    if (lead.status === "site_generated" || lead.status === "client_review") isCurrent = true;
                  } else if (stg.key === "paid") {
                    isDone = lead.status === "paid_and_deployed";
                    if (lead.status === "paid_and_deployed") isCurrent = true;
                  }

                  return (
                    <div key={idx} className="space-y-2">
                      <div className={`mx-auto w-8 h-8 rounded-full border-2 flex items-center justify-center font-sans font-extrabold text-xs transition-all ${
                        isCurrent 
                          ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 scale-110" 
                          : isDone 
                          ? "bg-slate-900 border-slate-900 text-white" 
                          : "bg-white border-slate-200 text-slate-400"
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-sans block font-semibold truncate ${isCurrent ? "text-indigo-600 font-bold" : isDone ? "text-slate-800" : "text-slate-400"}`}>
                        {stg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Panel: Proposal and Contract Generation Panel */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText size={16} className="text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-800">Proposal & Service Billing Generator</h4>
              </div>

              {!lead.proposal ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Configure and generate a digital service proposal. The client representative will receive the quote to authorize design contracts.
                  </p>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Set Redesign Contract Price ($ USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                        placeholder="2499"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateProposal}
                    disabled={creatingProposal}
                    className="w-full py-2.5 px-4 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {creatingProposal ? <Clock className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    Compile Custom Digital Proposal
                  </button>
                </div>
              ) : !lead.proposal.accepted ? (
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono uppercase bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded">
                    Status: Proposal Pending Review
                  </span>
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-bold text-slate-800">{lead.proposal.title}</h5>
                    <p className="text-lg font-extrabold text-slate-900">${lead.proposal.price.toLocaleString()}</p>
                    <ul className="space-y-1 text-[11px] text-slate-600 pl-4 list-disc font-sans">
                      {lead.proposal.scope.slice(0, 3).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                      <li>...and {lead.proposal.scope.length - 3} other modern SEO/Speed specifications</li>
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-indigo-100/60 flex gap-2">
                    <button
                      onClick={handleAcceptProposal}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-all"
                    >
                      Authorize & Accept Proposal
                    </button>
                  </div>
                </div>
              ) : !lead.contract?.signed ? (
                <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">
                      Status: Contract Execution Required
                    </span>
                    <PenTool size={14} className="text-emerald-600 animate-bounce" />
                  </div>
                  
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 h-28 overflow-y-auto whitespace-pre-line font-mono select-none">
                    {lead.contract?.terms}
                  </div>

                  <form onSubmit={handleSignContract} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-500">Sign Your Legal Name</label>
                      <input
                        type="text"
                        required
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                        placeholder="e.g. Gary Henderson"
                      />
                    </div>
                    
                    {/* Simulated canvas drawing block for visual fidelity */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-500">Draw signature below (Click/Drag)</label>
                      <div 
                        onMouseDown={() => { setIsSigning(true); setSignedLines(true); }}
                        onMouseUp={() => setIsSigning(false)}
                        onMouseLeave={() => setIsSigning(false)}
                        className="h-16 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-crosshair relative overflow-hidden select-none"
                      >
                        {signedLines ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-serif italic text-indigo-600 text-lg tracking-wider transform -rotate-3 select-none">
                              {signatureName || "Signing..."}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Sign on the dotted line</span>
                        )}
                        <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-300">Click to draw</div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm"
                    >
                      Authorize & Legally Sign Contract
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <CheckCircle size={14} />
                    <span>Redesign Agreement Fully Executed</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                    Legally authorized on {lead.contract.signedAt ? new Date(lead.contract.signedAt).toLocaleDateString() : "Today"} by client signature: <strong>{lead.contract.clientSignature}</strong>.
                  </p>
                  
                  {lead.invoice && (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 block">Invoice {lead.invoice.id}</span>
                        <p className="text-sm font-extrabold text-slate-800">${lead.invoice.amount.toLocaleString()}</p>
                      </div>
                      {lead.invoice.status === "paid" ? (
                        <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded font-bold">
                          Marked Paid
                        </span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-mono uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold animate-pulse">
                            Awaiting Payment
                          </span>
                          <span className="text-[8px] text-slate-400 font-sans mt-0.5">Settle under "AI Web Workspace"</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel: Follow-Up Automation Config */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Settings size={16} className="text-slate-700" />
                <h4 className="text-sm font-bold text-slate-800">Outreach Follow-up Automation</h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Autopilot Lead Followup</p>
                    <p className="text-[9px] text-slate-400 font-mono">AUTOMATED EMAIL OUTBOX CHECKS</p>
                  </div>
                  <button
                    onClick={handleToggleAutomation}
                    className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                      lead.followupAutomation?.enabled ? "bg-indigo-600" : "bg-slate-300"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      lead.followupAutomation?.enabled ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Select Follow-up Email sequence template</label>
                    <select
                      value={followupTemplate}
                      onChange={(e) => setFollowupTemplate(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                    >
                      <option value="followup_1">Sequence #1: Educational Redesign Impact (Day 3)</option>
                      <option value="followup_2">Sequence #2: Urgent Competitive Mobile Deficit (Day 5)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-slate-500 text-[11px] leading-relaxed">
                    <span className="font-bold text-slate-700">Sequence copy preview:</span>
                    <p className="italic font-sans">
                      {followupTemplate === "followup_1" 
                        ? `"Hi ${lead.ownerName || 'there'}, just following up regarding your Google rating of ${lead.googleRating}. Since you do not have an active booking portal, your ratings are driving customers to local competitors. I compiled a preview blueprint..."`
                        : `"Gary, local directories show mobile searches represent 62% of plumbers calls in Austin. Our audit flagged that protechplumbingaustin.net loading speed takes 7.8 seconds..."`
                      }
                    </p>
                  </div>

                  {lead.followupAutomation?.enabled && (
                    <div className="flex items-center gap-1.5 text-indigo-600 text-[10px] font-mono font-bold bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                      <Clock size={12} className="animate-spin" />
                      <span>Next sequence Scheduled: tomorrow at 9:00 AM UTC</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: BUSINESS INTELLIGENCE & ROI */}
      {subTab === "bi" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Competitor SEO Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Competitor SEO Deficit Gap</span>
              <div className="space-y-3">
                {lead.businessIntelligence?.competitorSEO?.map((comp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 truncate">{comp.competitor}</span>
                      <span className="font-mono text-indigo-600 font-bold">{comp.score}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${comp.score}%` }} />
                    </div>
                  </div>
                ))}
                
                {/* Lead SEO Gap Comparison */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{lead.businessName} (Target)</span>
                    <span className="font-mono text-rose-500 font-extrabold">{lead.onlinePresence.seoScore || 0}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full animate-pulse" style={{ width: `${lead.onlinePresence.seoScore || 15}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Opportunity Estimation Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">Estimated Annual Revenue Boost</span>
                <p className="text-xs text-slate-500 leading-relaxed font-sans mb-3">
                  Loss estimation due to broken mobile layouts, unsecure SSL, or missing Google reviews customer booking capture.
                </p>
              </div>
              <div className="text-center my-2 space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h1 className="text-3xl font-extrabold text-indigo-600 font-sans">
                  +${(lead.businessIntelligence?.revenueOpportunityEstimated || 45000).toLocaleString()}
                </h1>
                <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">Estimated Annual Revenue Boost</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center leading-tight">
                Calculated based on local search volume, rating conversions, and average checkout values.
              </p>
            </div>

            {/* Redesign ROI Estimation Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">Estimated Redesign ROI Rate</span>
                <p className="text-xs text-slate-500 leading-relaxed font-sans mb-3">
                  Return on investment rate comparing standard premium design contract expenses against annual revenue boost.
                </p>
              </div>
              <div className="text-center my-2 space-y-1 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <h1 className="text-3xl font-extrabold text-emerald-700 font-sans">
                  +{lead.businessIntelligence?.estimatedRoiPercent || 350}%
                </h1>
                <span className="text-[9px] font-mono text-emerald-600 uppercase tracking-wider block font-bold">Estimated Redesign ROI Rate</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center leading-tight">
                Typical customer capture gains exceed 3.5x contract pricing in Year 1 alone.
              </p>
            </div>

          </div>

          {/* Before vs After Comparison Report Section */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <TrendingUp size={16} className="text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-800">Before & After Redesign Impact Comparison</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BEFORE */}
              <div className="p-4 bg-rose-50/30 border border-rose-100 rounded-xl space-y-3">
                <span className="text-[10px] font-mono uppercase bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded">
                  Before: Existing Profile Deficit
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Google Organic SEO Index</span>
                    <span className="font-mono font-bold text-rose-600">{lead.onlinePresence.seoScore || 20}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Client Trust Rating (SSL)</span>
                    <span className="font-mono font-bold text-rose-600">Missing SSL (Unsecure)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Mobile Device Conversion Rate</span>
                    <span className="font-mono font-bold text-rose-600">0.8% (Broken layouts)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Google Reviews Integration</span>
                    <span className="font-mono font-bold text-rose-600">No Reviews Synced</span>
                  </div>
                </div>
              </div>

              {/* AFTER */}
              <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl space-y-3">
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">
                  After: Simulated Redesign Impact
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Google Organic SEO Index</span>
                    <span className="font-mono font-bold text-emerald-600">88/100 (90%+ Local Reach)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Client Trust Rating (SSL)</span>
                    <span className="font-mono font-bold text-emerald-600">HTTPS Secured (100%)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Mobile Device Conversion Rate</span>
                    <span className="font-mono font-bold text-emerald-600">4.5% (Swiss design conversion)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Google Reviews Integration</span>
                    <span className="font-mono font-bold text-emerald-600">Syncs G-Maps Reviews live</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
