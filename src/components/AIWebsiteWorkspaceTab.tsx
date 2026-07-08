import React, { useState, useRef, useEffect } from "react";
import { 
  Code, Globe, Laptop, Tablet, Smartphone, Sparkles, Loader2, Send, 
  Download, CheckCircle2, DollarSign, Terminal, ArrowUpRight, Link2, 
  Coins, Check, Shield, AlertTriangle, RefreshCw, Copy, QrCode
} from "lucide-react";
import { Lead } from "../types";

interface AIWebsiteWorkspaceTabProps {
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
}

export default function AIWebsiteWorkspaceTab({ lead, onUpdateLead }: AIWebsiteWorkspaceTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    const realUrl = `${window.location.origin}/live/${lead.id}`;
    navigator.clipboard.writeText(realUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // Website generation settings
  const [colors, setColors] = useState("");
  const [booking, setBooking] = useState("");
  const [customInfo, setCustomInfo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [revising, setRevising] = useState(false);
  const [feedback, setFeedback] = useState("");
  
  // Workspace UI states
  const [viewMode, setViewMode] = useState<"preview" | "html" | "react">("preview");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployIndex, setDeployIndex] = useState(0);

  // Custom Domain Configuration States
  const [customDomainInput, setCustomDomainInput] = useState(lead.customDomain?.domainName || "");
  const [showDnsPanel, setShowDnsPanel] = useState(false);
  const [verifyingDns, setVerifyingDns] = useState(false);

  // Alternative Payment Station States
  const [paymentTab, setPaymentTab] = useState<"wire" | "manual" | "payment_link">("wire");
  const [manualNotes, setManualNotes] = useState(lead.paymentDetails?.manualNotes || "");
  const [wireRef, setWireRef] = useState(lead.paymentDetails?.wireReference || "");
  const [externalLink, setExternalLink] = useState(lead.paymentDetails?.externalLink || "");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset inputs when switching leads to prevent cross-contamination
  useEffect(() => {
    setCustomDomainInput(lead.customDomain?.domainName || "");
    setShowDnsPanel(false);
    setManualNotes(lead.paymentDetails?.manualNotes || "");
    setWireRef(lead.paymentDetails?.wireReference || "");
    setExternalLink(lead.paymentDetails?.externalLink || "");
    setCustomInfo("");
  }, [lead.id]);

  const handleGenerateSite = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/generate-website`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredColors: colors, bookingNeeds: booking, customInfo }),
      });
      if (!response.ok) throw new Error("Failed to generate website code");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleReviseSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || revising) return;

    setRevising(true);
    const instructionToSend = feedback;
    setFeedback("");

    try {
      const response = await fetch(`/api/leads/${lead.id}/revise-website`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: instructionToSend }),
      });
      if (!response.ok) throw new Error("Failed to revise website");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e) {
      console.error(e);
    } finally {
      setRevising(false);
    }
  };

  // Alternative payment settlement
  const handleCollectPayment = async (method: "manual" | "wire" | "payment_link") => {
    setSubmittingPayment(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/collect-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          manualNotes: method === "manual" ? manualNotes : "",
          wireReference: method === "wire" ? wireRef : "",
          externalLink: method === "payment_link" ? externalLink : ""
        })
      });
      if (!response.ok) throw new Error("Failed to collect payment");
      const data = await response.json();
      
      if (data.lead.invoice.status === "paid") {
        setDeployLogs([]);
        setDeployIndex(0);
      }
      onUpdateLead(data.lead);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Custom Domain management
  const handleConfigureDomain = async (dnsStatus: "pending" | "configured") => {
    if (dnsStatus === "configured") {
      setVerifyingDns(true);
      // Beautiful 2s delay simulation of checking Namecheap/GoDaddy propagation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVerifyingDns(false);
    }

    try {
      const response = await fetch(`/api/leads/${lead.id}/custom-domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: dnsStatus === "configured" ? customDomainInput : "",
          dnsStatus
        })
      });
      if (!response.ok) throw new Error("Failed to update custom domain");
      const data = await response.json();
      onUpdateLead(data.lead);
      if (dnsStatus === "configured") {
        setShowDnsPanel(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deploySteps = [
    "Initializing GitHub continuous deployment pipeline...",
    "Creating secure repository sterling-agency/prod-deploy-server...",
    "Compiling and validating custom responsive Tailwind styles...",
    "Uploading visual media and optimizing image routing layers...",
    "Generating Cloudflare Pages edge routing configurations...",
    "Provisioning free Let's Encrypt production SSL/TLS certificate...",
    "Attaching production custom domain and updating global DNS records...",
    "Deployment Live! Verified secure access via HTTPS gateway..."
  ];

  useEffect(() => {
    if (lead.status === "paid_and_deployed" && deployIndex < deploySteps.length) {
      const timer = setTimeout(() => {
        setDeployLogs((prev) => [...prev, `[SUCCESS] ${deploySteps[deployIndex]}`]);
        setDeployIndex((idx) => idx + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [lead.status, deployIndex]);

  const handleDownloadCode = () => {
    if (!lead.generatedWebsite.htmlCode) return;
    const blob = new Blob([lead.generatedWebsite.htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lead.businessName.toLowerCase().replace(/\s+/g, "_")}_website.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasCode = !!lead.generatedWebsite?.htmlCode;

  return (
    <div className="space-y-6">
      {!hasCode && !generating ? (
        /* Configuration step before generating */
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold">Automatic AI Web Designer & Generator</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">STEPS 9 - 11: SITE PLAN & AUTO GENERATION</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-400">Preferred Color Theme</label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g., Warm gold and deep charcoal, or fresh mint and white..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-400">Custom Business Profile & Info (Website Builder)</label>
              <textarea
                value={customInfo}
                onChange={(e) => setCustomInfo(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 h-28"
                placeholder="e.g., Custom pricing tiers ($49, $99, $149), a short founder bio, specific phone numbers, custom list of services, or client reviews..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-400">Specific Integration Needs</label>
              <textarea
                value={booking}
                onChange={(e) => setBooking(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 h-24"
                placeholder="e.g., An emergency scheduling table, or a catering order selector..."
              />
            </div>

            <button
              onClick={handleGenerateSite}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold font-sans rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles size={14} />
              Build Sitemap, Content Plan & Complete Site Code
            </button>
          </div>
        </div>
      ) : generating ? (
        /* Code Generator Terminal Loader */
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-8 max-w-xl mx-auto text-center space-y-4">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
          <h4 className="text-sm font-mono uppercase text-slate-200">Gemini is Coding and Designing Your Website...</h4>
          <div className="bg-slate-900 p-4 rounded-lg font-mono text-[10px] text-left text-indigo-400 space-y-1 max-h-48 overflow-y-auto">
            <p className="animate-pulse">▶ [INIT] Running AI Web Architect Copilot...</p>
            <p className="text-slate-500">▶ Creating sitemap and routes hierarchy...</p>
            <p className="text-slate-500">▶ Generating Conversion-Focused Marketing Copy...</p>
            <p className="text-slate-500">▶ Compiling Tailwind CSS & Lucide Script Injectors...</p>
            <p className="text-slate-500">▶ Engineering functional JS widgets: Time-slot Booking & FAQ Accordions...</p>
            <p className="text-slate-500">▶ Assembling clean React TSX component export...</p>
          </div>
          <p className="text-xs text-slate-500 font-sans">This process takes approximately 10-15 seconds for a full production sitemap, content, HTML layout, and React component code.</p>
        </div>
      ) : (
        /* Full Workspace Panel */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: AI Copilot, Invoice, Deployment Checklist (5 Columns) */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* Sitemap & Plan Details */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-3.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Sitemap & Content Blueprint</h3>
              <div className="space-y-2">
                {lead.websitePlan.sitemap?.map((page, idx) => (
                  <div key={idx} className="p-2 bg-slate-900/50 border border-slate-900 rounded-lg">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">{page.title}</span>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">{page.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Design Copilot Chat Panel */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">AI Design Copilot Editor</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Need color adjustments, copy revisions, or interactive feature additions? Just issue an instruction. Gemini will update the source and live layout.
              </p>

              <form onSubmit={handleReviseSite} className="space-y-2 pt-1">
                <div className="relative">
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={revising}
                    className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    placeholder={revising ? "AI Agent is compiling revisions..." : "e.g., Make background dark blue, change hero text..."}
                    required
                  />
                  <button
                    type="submit"
                    disabled={revising || !feedback.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-indigo-400 hover:text-white disabled:text-slate-600 transition-colors cursor-pointer"
                  >
                    {revising ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </form>
            </div>

            {/* ALTERNATIVE AGENCY PAYMENTS STATION */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Coins size={14} className="text-emerald-400" />
                  Step 14: Invoice & Payment Collection
                </h3>
              </div>

              {lead.invoice && (
                <div className="space-y-4">
                  {/* Total Card */}
                  <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Outbound Agency Invoice</span>
                      <span className="text-xs font-bold text-slate-300 font-mono">Invoice #{lead.invoice.id.substring(4, 12)}</span>
                      <h3 className="text-xl font-bold font-sans text-white mt-1">${lead.invoice.amount} USD</h3>
                    </div>

                    <div>
                      {lead.invoice.status === "paid" ? (
                        <span className="px-3 py-1.5 text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Invoice Paid
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg flex items-center gap-1">
                          Awaiting Collection
                        </span>
                      )}
                    </div>
                  </div>

                  {lead.invoice.status !== "paid" ? (
                    <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/20">
                      {/* Billing Tabs selector */}
                      <div className="flex bg-slate-950 border-b border-slate-850 p-1">
                        <button
                          type="button"
                          onClick={() => setPaymentTab("wire")}
                          className={`flex-1 py-2 text-[10px] font-mono rounded-lg transition-all font-bold cursor-pointer ${
                            paymentTab === "wire" 
                              ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" 
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Bank Wire
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentTab("manual")}
                          className={`flex-1 py-2 text-[10px] font-mono rounded-lg transition-all font-bold cursor-pointer ${
                            paymentTab === "manual" 
                              ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" 
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Manual Offline
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentTab("payment_link")}
                          className={`flex-1 py-2 text-[10px] font-mono rounded-lg transition-all font-bold cursor-pointer ${
                            paymentTab === "payment_link" 
                              ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" 
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Payment Link
                        </button>
                      </div>

                      <div className="p-4 space-y-3">
                        {paymentTab === "wire" && (
                          <div className="space-y-3">
                            <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-1.5 text-[10px] font-mono text-slate-400">
                              <p className="font-bold text-white text-[11px] border-b border-slate-800 pb-1 flex items-center justify-between">
                                <span>IBAN/SWIFT Wire Instructions</span>
                                <span className="text-[9px] font-normal text-indigo-400">Copy to client</span>
                              </p>
                              <p><span className="text-slate-500">Bank:</span> Sterling Commerce Vault</p>
                              <p><span className="text-slate-500">Routing:</span> 021000021</p>
                              <p><span className="text-slate-500">IBAN:</span> US76 STRL 3209 8121 2101</p>
                              <p><span className="text-slate-500">Reference:</span> {lead.businessName.toUpperCase().replace(/\s+/g, "-")}</p>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-mono text-slate-400 uppercase">SWIFT/Wire Reference Number</label>
                              <input
                                type="text"
                                value={wireRef}
                                onChange={(e) => setWireRef(e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                                placeholder="e.g. TXN-812739281-W"
                              />
                            </div>

                            <button
                              onClick={() => handleCollectPayment("wire")}
                              disabled={submittingPayment || !wireRef.trim()}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-lg text-[10px] uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {submittingPayment ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              Verify Bank Wire & Settle Invoice
                            </button>
                          </div>
                        )}

                        {paymentTab === "manual" && (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-mono text-slate-400 uppercase">Collection Audit Notes</label>
                              <textarea
                                value={manualNotes}
                                onChange={(e) => setManualNotes(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 h-16"
                                placeholder="e.g. Collected cash offline directly from owner Carlos. Signed agency receipt."
                              />
                            </div>

                            <button
                              onClick={() => handleCollectPayment("manual")}
                              disabled={submittingPayment || !manualNotes.trim()}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold rounded-lg text-[10px] uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {submittingPayment ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              Record Manual Offline Settlement
                            </button>
                          </div>
                        )}

                        {paymentTab === "payment_link" && (
                          <div className="space-y-3">
                            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                              Specify an external billing, Stripe, or PayPal Invoice checkout link that you have prepared for this client campaign.
                            </p>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-mono text-slate-400 uppercase">Client Invoice URL</label>
                              <div className="relative">
                                <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                  type="url"
                                  value={externalLink}
                                  onChange={(e) => setExternalLink(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                                  placeholder="https://buy.stripe.com/abc..."
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => handleCollectPayment("payment_link")}
                              disabled={submittingPayment || !externalLink.trim()}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-lg text-[10px] uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {submittingPayment ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                              Save external billing link
                            </button>

                            {lead.paymentDetails?.externalLink && (
                              <div className="mt-3 p-2 bg-slate-950 border border-slate-900 rounded-lg space-y-1.5">
                                <p className="text-[9px] font-mono text-indigo-400 font-bold flex items-center gap-1">
                                  <Check size={10} /> Billing Link Live:
                                </p>
                                <a 
                                  href={lead.paymentDetails.externalLink} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[10px] text-slate-300 font-mono underline block truncate hover:text-white"
                                >
                                  {lead.paymentDetails.externalLink}
                                </a>
                                <div className="border-t border-slate-900 pt-1.5 mt-1 flex justify-end">
                                  <button
                                    onClick={() => handleCollectPayment("manual")}
                                    className="py-1 px-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/10 hover:bg-indigo-600 hover:text-white rounded-md text-[9px] font-mono font-bold transition-all cursor-pointer"
                                  >
                                    Mark Link Settled Offline
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Settled details display */
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs space-y-1.5">
                      <p className="font-bold text-emerald-400 font-mono text-[10px] flex items-center gap-1 uppercase">
                        <Check size={12} />
                        Payment Settled via {lead.paymentMethod?.toUpperCase() || "Offline Collection"}
                      </p>
                      {lead.paymentMethod === "wire" && (
                        <p className="text-slate-400 font-mono text-[10px]">Wire Transaction Ref: <span className="text-white font-bold">{lead.paymentDetails?.wireReference}</span></p>
                      )}
                      {lead.paymentMethod === "manual" && (
                        <p className="text-slate-400 font-sans text-[10px]">Audit Notes: <span className="text-white italic">"{lead.paymentDetails?.manualNotes}"</span></p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Vercel logs deployment stream */}
              {lead.status === "paid_and_deployed" && (
                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block flex items-center gap-1.5">
                    <Terminal size={12} />
                    Production Deployment Console (Vercel Integration)
                  </span>

                  <div className="bg-slate-950 border border-slate-900 rounded-lg p-3.5 font-mono text-[9px] text-slate-400 h-44 overflow-y-auto space-y-1.5">
                    {deployLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 shrink-0">✔</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    {deployIndex < deploySteps.length && (
                      <div className="flex items-center gap-1 text-indigo-400 animate-pulse">
                        <span>▶</span>
                        <span>{deploySteps[deployIndex]}</span>
                      </div>
                    )}
                  </div>

                  {deployIndex === deploySteps.length && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 block">Production Link</span>
                        <a
                          href={`${window.location.origin}/live/${lead.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-400 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          Visit Live URL
                          <ArrowUpRight size={12} />
                        </a>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] rounded uppercase font-bold">
                        Online / Active
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BRAND CUSTOM DOMAIN CARD */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe size={14} className="text-indigo-400" />
                Step 15: Brand Identity (Custom Domain)
              </h3>

              {lead.customDomain?.verified ? (
                /* Configured state */
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                        <Shield size={12} />
                        Domain Securely Connected
                      </span>
                      <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">SSL ACTIVE</span>
                    </div>
                    
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Mapped Domain</span>
                      <a 
                        href={`${window.location.origin}/live/${lead.id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-mono font-bold text-white hover:text-indigo-400 hover:underline block mt-0.5"
                      >
                        https://{lead.customDomain.domainName}
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                      <div>
                        <span className="text-[8px] text-slate-500 block">Edge Server:</span>
                        sterling-pages.net
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block">Propagation:</span>
                        100% Verified
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConfigureDomain("pending")}
                    className="w-full py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] font-mono rounded-lg transition-all cursor-pointer"
                  >
                    Disconnect Custom Domain
                  </button>
                </div>
              ) : (
                /* Connect domain setup state */
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Attach a custom domain of your client's choice (e.g. <code>www.cafe-rene.com</code>) to brand the campaign and continuous deployment.
                  </p>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={customDomainInput}
                        onChange={(e) => setCustomDomainInput(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        placeholder="www.carlosbakery.com"
                      />
                    </div>
                    <button
                      onClick={() => setShowDnsPanel(true)}
                      disabled={!customDomainInput.trim()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
                    >
                      Configure DNS
                    </button>
                  </div>

                  {showDnsPanel && (
                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg space-y-3.5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono font-bold text-white uppercase flex items-center gap-1">
                          <AlertTriangle size={12} className="text-amber-500" />
                          Domain Registrar Instructions
                        </p>
                        <p className="text-[9px] text-slate-400 font-sans">
                          Sign into your domain provider (e.g. GoDaddy, Namecheap) and create these two DNS records:
                        </p>
                      </div>

                      {/* DNS records table */}
                      <div className="space-y-1 border border-slate-800 rounded overflow-hidden">
                        <div className="bg-slate-950 p-1.5 grid grid-cols-12 gap-1 text-[8px] font-mono uppercase text-slate-500 font-bold border-b border-slate-800">
                          <span className="col-span-3">Type</span>
                          <span className="col-span-3">Host</span>
                          <span className="col-span-6">Value / Target</span>
                        </div>
                        <div className="p-1.5 grid grid-cols-12 gap-1 text-[9px] font-mono text-slate-300 bg-slate-950/20 border-b border-slate-800">
                          <span className="col-span-3 text-indigo-400 font-bold">CNAME</span>
                          <span className="col-span-3">www</span>
                          <span className="col-span-6 truncate">sterling-agent.pages.dev</span>
                        </div>
                        <div className="p-1.5 grid grid-cols-12 gap-1 text-[9px] font-mono text-slate-300 bg-slate-950/20">
                          <span className="col-span-3 text-emerald-400 font-bold">A</span>
                          <span className="col-span-3">@</span>
                          <span className="col-span-6 truncate">104.16.243.7</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfigureDomain("configured")}
                          disabled={verifyingDns}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {verifyingDns ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Testing Propagation...
                            </>
                          ) : (
                            <>
                              <RefreshCw size={11} />
                              Verify & Bind Domain
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowDnsPanel(false)}
                          className="py-1.5 px-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* REAL DEVICE SANDBOX TESTING & QR CODE CARD */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Smartphone size={16} />
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Step 16: Device Testing & QR Code
                </h3>
              </div>

              <div className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
                <div className="flex gap-3 items-start flex-col sm:flex-row">
                  <div className="flex-1 space-y-2">
                    <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                      To open your website on a phone, tablet, or external browser, use this fully functional <strong>Sandbox Testing URL</strong>.
                    </p>
                    <p className="text-[10px] text-amber-500 font-sans flex items-start gap-1">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      <span>Note: The simulated agency domain <code>.sterling.agency</code> is a mockup. Please use the sandbox URL below for real testing.</span>
                    </p>
                  </div>

                  {/* QR Code generator using qrserver */}
                  <div className="bg-white p-1 rounded-lg shrink-0 border border-slate-800 self-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + "/live/" + lead.id)}`}
                      alt="Scan QR to open site on mobile"
                      className="w-20 h-20 block"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-900">
                  <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold">Real Sandbox URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/live/${lead.id}`}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono focus:outline-none"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono font-bold rounded-lg flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check size={12} className="text-emerald-400 animate-pulse" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Code & Interactive Iframe preview (7 Columns) */}
          <div className="xl:col-span-7 space-y-4">
            
            {/* Visual Viewport Controls & Code Toggles */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 border border-slate-900 px-4 py-3 rounded-xl">
              {/* Toggles */}
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
                    viewMode === "preview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Live Sandbox
                </button>
                <button
                  onClick={() => setViewMode("html")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
                    viewMode === "html" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  HTML Source
                </button>
                <button
                  onClick={() => setViewMode("react")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
                    viewMode === "react" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  React Code
                </button>
              </div>

              {/* Viewport size simulator only for preview */}
              {viewMode === "preview" && (
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setViewport("desktop")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewport === "desktop" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/10" : "text-slate-500 hover:text-slate-300"
                    }`}
                    title="Desktop (100%)"
                  >
                    <Laptop size={14} />
                  </button>
                  <button
                    onClick={() => setViewport("tablet")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewport === "tablet" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/10" : "text-slate-500 hover:text-slate-300"
                    }`}
                    title="Tablet (768px)"
                  >
                    <Tablet size={14} />
                  </button>
                  <button
                    onClick={() => setViewport("mobile")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewport === "mobile" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/10" : "text-slate-500 hover:text-slate-300"
                    }`}
                    title="Mobile (375px)"
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleDownloadCode}
                className="py-1.5 px-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download size={12} />
                Export HTML
              </button>
            </div>

            {/* Sandbox Stage */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-4">
              
              {viewMode === "preview" ? (
                /* Interactive Iframe Frame browser layout */
                <div
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-lg transition-all duration-300"
                  style={{
                    maxWidth: viewport === "mobile" ? "375px" : viewport === "tablet" ? "768px" : "100%",
                    height: "560px"
                  }}
                >
                  {/* Browser top-bar */}
                  <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    </div>
                    
                    {/* Real Clickable Interactive URL Bar */}
                    <a
                      href={`${window.location.origin}/live/${lead.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded px-3 py-1 font-mono text-[10px] text-slate-500 flex items-center justify-between gap-1.5 flex-1 cursor-pointer transition-all group select-none"
                      title="Click to open this fully working live website in a new tab"
                    >
                      <div className="flex items-center gap-1.5">
                        <Globe size={11} className="text-emerald-500 shrink-0" />
                        <span className="text-slate-500">https://</span>
                        <span className="text-slate-300 font-sans font-semibold group-hover:text-indigo-400 transition-colors">
                          {lead.customDomain?.verified 
                            ? lead.customDomain.domainName 
                            : `${lead.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.sterling.agency`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 group-hover:text-white font-sans shrink-0 font-medium">
                        <span>Open Live URL</span>
                        <ArrowUpRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </a>
                  </div>

                  {/* HTML render iframe */}
                  <div className="w-full h-full bg-white relative">
                    {revising && (
                      <div className="absolute inset-0 bg-slate-950/45 flex flex-col items-center justify-center text-center text-white backdrop-blur-xs z-50">
                        <Loader2 className="animate-spin text-indigo-500 mb-2" size={24} />
                        <span className="text-xs font-mono">Gemini is rewriting layout parameters...</span>
                      </div>
                    )}
                    {/* Point iframe straight to the live router path so form submissions go to real Express backend */}
                    <iframe
                      ref={iframeRef}
                      title="AI Site Render Sandbox"
                      src={`/live/${lead.id}`}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-modals allow-same-origin"
                    />
                  </div>
                </div>
              ) : (
                /* Code display panel */
                <div className="w-full font-mono text-[11px] text-slate-300 bg-slate-950 p-4 rounded-lg h-[560px] overflow-auto border border-slate-900 relative">
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          viewMode === "html"
                            ? lead.generatedWebsite.htmlCode || ""
                            : lead.generatedWebsite.reactCode || ""
                        );
                      }}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded hover:text-white transition-all hover:bg-slate-800 text-[10px] cursor-pointer"
                    >
                      Copy Code
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {viewMode === "html" ? lead.generatedWebsite.htmlCode : lead.generatedWebsite.reactCode}
                  </pre>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
