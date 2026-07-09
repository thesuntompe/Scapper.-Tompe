import React, { useState, useMemo } from "react";
import { 
  DollarSign, CreditCard, Landmark, CheckCircle, Clock, AlertTriangle, 
  Copy, Check, QrCode, ArrowUpRight, TrendingUp, Sparkles, Percent
} from "lucide-react";
import { Lead } from "../types";

interface FinanceViewProps {
  leads: Lead[];
  onUpdateLead: (updatedLead: Lead) => void;
  onFocusLead: (leadId: string, tab: "dossier" | "outreach" | "website") => void;
}

export default function FinanceView({ leads, onUpdateLead, onFocusLead }: FinanceViewProps) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Agency Payment Configuration Settings (saved in localStorage for persistence)
  const [upiId, setUpiId] = useState(() => localStorage.getItem("singularity_upi_id") || "singularityai@upi");
  const [merchantName, setMerchantName] = useState(() => localStorage.getItem("singularity_merchant_name") || "Singularity AI Technologies Ltd");
  const [razorpayKey, setRazorpayKey] = useState(() => localStorage.getItem("singularity_razorpay_key") || "");
  const [bankIban, setBankIban] = useState(() => localStorage.getItem("singularity_bank_iban") || "US76 STRL 3209 8121 2101");
  const [bankSwift, setBankSwift] = useState(() => localStorage.getItem("singularity_bank_swift") || "SCVBUS33XXX");

  const [savingSettings, setSavingSettings] = useState(false);

  // Settle states
  const [settlingLeadId, setSettlingLeadId] = useState<string | null>(null);
  const [settleMethod, setSettleMethod] = useState<"wire" | "manual" | "upi" | "razorpay" | "payment_link">("manual");
  const [wireRef, setWireRef] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [submittingSettle, setSubmittingSettle] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    localStorage.setItem("singularity_upi_id", upiId);
    localStorage.setItem("singularity_merchant_name", merchantName);
    localStorage.setItem("singularity_razorpay_key", razorpayKey);
    localStorage.setItem("singularity_bank_iban", bankIban);
    localStorage.setItem("singularity_bank_swift", bankSwift);
    setTimeout(() => setSavingSettings(false), 800);
  };

  // Derive all active and completed invoices & dynamic revenue tracking
  const metrics = useMemo(() => {
    let closedRevenue = 0;
    let pendingRevenue = 0;
    let potentialRevenue = 0;
    let paidCount = 0;
    let totalDealCount = 0;

    const pendingInvoicesList: { lead: Lead; id: string; amount: number; date: string }[] = [];
    const paidInvoicesList: { lead: Lead; id: string; amount: number; date: string; method: string; ref?: string; note?: string }[] = [];

    leads.forEach((l) => {
      // 1. Calculate Potential Revenue (leads that aren't lost/uninterested)
      if (l.status !== "replied_uninterested") {
        const potentialPrice = l.proposal?.price || l.invoice?.amount || 1250;
        potentialRevenue += potentialPrice;
        totalDealCount++;
      }

      // 2. Track real invoices
      if (l.invoice) {
        if (l.invoice.status === "pending") {
          pendingInvoicesList.push({
            lead: l,
            id: l.invoice.id,
            amount: l.invoice.amount,
            date: l.invoice.createdAt
          });
          pendingRevenue += l.invoice.amount;
        } else if (l.invoice.status === "paid") {
          paidInvoicesList.push({
            lead: l,
            id: l.invoice.id,
            amount: l.invoice.amount,
            date: l.invoice.createdAt,
            method: l.paymentMethod || "manual",
            ref: l.paymentDetails?.wireReference,
            note: l.paymentDetails?.manualNotes
          });
          closedRevenue += l.invoice.amount;
          paidCount++;
        }
      }
    });

    const averageDealSize = paidCount > 0 
      ? Math.round(closedRevenue / paidCount) 
      : (totalDealCount > 0 ? Math.round(potentialRevenue / totalDealCount) : 1250);

    return {
      potential: potentialRevenue,
      closed: closedRevenue,
      pending: pendingRevenue,
      averageDeal: averageDealSize,
      pendingInvoices: pendingInvoicesList,
      paidInvoices: paidInvoicesList,
      paidCount,
      totalCount: pendingInvoicesList.length + paidInvoicesList.length
    };
  }, [leads]);

  // Dynamically compute configured payment options in the priority order
  const availableMethods = useMemo(() => {
    const list = [];
    const hasUpi = !!(upiId || "").trim();
    const hasRazorpay = !!(razorpayKey || "").trim();
    const hasBank = !!(bankIban || "").trim();

    if (hasUpi) {
      list.push({ value: "upi" as const, label: "UPI" });
    }
    if (hasRazorpay) {
      list.push({ value: "razorpay" as const, label: "Razorpay" });
    }
    list.push({ value: "payment_link" as const, label: "Payment Link" });
    if (hasBank) {
      list.push({ value: "wire" as const, label: "Bank Transfer" });
    }
    // Fallback Manual Settle
    list.push({ value: "manual" as const, label: "Manual Offline" });
    return list;
  }, [upiId, razorpayKey, bankIban]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 1500);
  };

  const handleCopyBank = () => {
    navigator.clipboard.writeText(`IBAN: ${bankIban}\nSWIFT: ${bankSwift}`);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 1500);
  };

  const handleSettleSubmit = async () => {
    if (!settlingLeadId) return;
    setSubmittingSettle(true);

    try {
      const response = await fetch(`/api/leads/${settlingLeadId}/collect-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: settleMethod,
          manualNotes: settleMethod === "manual" ? manualNote : `Settled via finance portal. Ref: ${wireRef || manualNote}`,
          wireReference: settleMethod === "wire" || settleMethod === "upi" || settleMethod === "razorpay" ? wireRef : `MAN-${Date.now()}`,
          externalLink: settleMethod === "payment_link" ? wireRef : ""
        })
      });

      if (!response.ok) throw new Error("Failed to settle invoice");
      const data = await response.json();
      onUpdateLead(data.lead);
      
      // Reset forms
      setSettlingLeadId(null);
      setWireRef("");
      setManualNote("");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingSettle(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12 text-[#F8FAFC]">
      {/* Header with reduced height */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1F2937]">
        <div>
          <h2 className="text-sm font-extrabold text-white font-sans tracking-tight">Financial Ledger & Revenue Tracker</h2>
          <p className="text-[9px] text-slate-400 font-mono">TRACK REAL REVENUE AND STREAMLINE INBOUND TRANSACTIONS</p>
        </div>
        <span className="text-[10px] bg-[#111827] border border-[#1F2937] text-slate-300 font-mono px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-pulse" />
          UPI Routing Enabled
        </span>
      </div>

      {/* Dynamic Stats Row with compact sizing */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111827]/60 border border-[#1F2937] rounded-xl p-3 flex flex-col justify-between h-[80px]">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Potential Revenue</span>
          <div>
            <h3 className="text-lg font-black text-white leading-none font-mono">
              ${metrics.potential.toLocaleString()}
            </h3>
            <span className="text-[8px] font-mono text-slate-500 block mt-0.5">Discovered Pipeline Sum</span>
          </div>
        </div>

        <div className="bg-[#111827]/60 border border-[#1F2937] rounded-xl p-3 flex flex-col justify-between h-[80px]">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Closed Earnings</span>
          <div>
            <h3 className="text-lg font-black text-emerald-400 leading-none font-mono">
              ${metrics.closed.toLocaleString()}
            </h3>
            <span className="text-[8px] font-mono text-emerald-500 block mt-0.5">{metrics.paidCount} Paid Invoices</span>
          </div>
        </div>

        <div className="bg-[#111827]/60 border border-[#1F2937] rounded-xl p-3 flex flex-col justify-between h-[80px]">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Pending Revenue</span>
          <div>
            <h3 className="text-lg font-black text-amber-500 leading-none font-mono">
              ${metrics.pending.toLocaleString()}
            </h3>
            <span className="text-[8px] font-mono text-amber-500/80 block mt-0.5">{metrics.pendingInvoices.length} Outstanding</span>
          </div>
        </div>

        <div className="bg-[#111827]/60 border border-[#1F2937] rounded-xl p-3 flex flex-col justify-between h-[80px]">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Avg Deal Size</span>
          <div>
            <h3 className="text-lg font-black text-indigo-400 leading-none font-mono">
              ${metrics.averageDeal.toLocaleString()}
            </h3>
            <span className="text-[8px] font-mono text-indigo-400/80 block mt-0.5">Average Contract Yield</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column - Ledger listings (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Active Pending Invoices */}
          <div className="bg-[#111827]/60 border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-2 border-b border-[#1F2937] bg-[#111827] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-sans">Pending Inbound Invoices</h3>
              <span className="text-[8px] font-mono bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase">
                Awaiting Payment ({metrics.pendingInvoices.length})
              </span>
            </div>

            <div className="divide-y divide-[#1F2937]">
              {metrics.pendingInvoices.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  Zero pending accounts receivable. Create interactive websites to trigger client billing.
                </div>
              ) : (
                metrics.pendingInvoices.map((inv) => (
                  <div key={inv.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1F2937]/20 transition-all">
                    <div>
                      <p className="text-xs font-bold text-white">{inv.lead.businessName}</p>
                      <div className="flex flex-wrap gap-2 text-[9px] text-slate-400 font-mono mt-0.5">
                        <span>Invoice ID: #{inv.id.substring(4, 11)}</span>
                        <span>•</span>
                        <span>Generated: {new Date(inv.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <span className="text-xs font-bold font-mono text-slate-200">${inv.amount}</span>
                      
                      {settlingLeadId === inv.lead.id ? (
                        <div className="flex items-center gap-1.5 bg-[#0B1020] border border-[#1F2937] p-1.5 rounded-lg animate-fadeIn">
                          <select 
                            value={settleMethod} 
                            onChange={(e) => setSettleMethod(e.target.value as any)}
                            className="bg-[#111827] border border-[#1F2937] text-[9px] text-slate-300 font-semibold py-1 px-1 rounded-md focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                          >
                            {availableMethods.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                          
                          {(settleMethod === "wire" || settleMethod === "upi" || settleMethod === "razorpay") && (
                            <input 
                              type="text" 
                              value={wireRef} 
                              onChange={(e) => setWireRef(e.target.value)}
                              placeholder="Ref ID / VPA ID..." 
                              className="bg-[#111827] border border-[#1F2937] text-[9px] text-slate-300 px-1.5 py-1 rounded-md w-24 focus:outline-none focus:border-[#7C3AED]"
                            />
                          )}

                          {settleMethod === "payment_link" && (
                            <input 
                              type="text" 
                              value={wireRef} 
                              onChange={(e) => setWireRef(e.target.value)}
                              placeholder="Checkout Link URL..." 
                              className="bg-[#111827] border border-[#1F2937] text-[9px] text-slate-300 px-1.5 py-1 rounded-md w-24 focus:outline-none focus:border-[#7C3AED]"
                            />
                          )}

                          {settleMethod === "manual" && (
                            <input 
                              type="text" 
                              value={manualNote} 
                              onChange={(e) => setManualNote(e.target.value)}
                              placeholder="Notes..." 
                              className="bg-[#111827] border border-[#1F2937] text-[9px] text-slate-300 px-1.5 py-1 rounded-md w-24 focus:outline-none focus:border-[#7C3AED]"
                            />
                          )}

                          <button 
                            onClick={handleSettleSubmit}
                            disabled={submittingSettle}
                            className="text-[9px] py-1 px-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-md font-bold cursor-pointer disabled:opacity-50"
                          >
                            {submittingSettle ? "..." : "Settle"}
                          </button>
                          <button 
                            onClick={() => setSettlingLeadId(null)}
                            className="text-[9px] py-1 px-1.5 bg-[#1F2937] hover:bg-slate-800 text-slate-400 rounded-md font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSettlingLeadId(inv.lead.id);
                            setSettleMethod("manual");
                          }}
                          className="text-[9px] py-1 px-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-md transition-all cursor-pointer shadow-sm"
                        >
                          Verify Payment
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Settled Transactions */}
          <div className="bg-[#111827]/60 border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-2 border-b border-[#1F2937] bg-[#111827] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-sans">Settled Transactions</h3>
              <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                Audited & Cleared ({metrics.paidInvoices.length})
              </span>
            </div>

            <div className="divide-y divide-[#1F2937]">
              {metrics.paidInvoices.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No completed cashflows in the ledger database.
                </div>
              ) : (
                metrics.paidInvoices.map((inv) => (
                  <div key={inv.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#1F2937]/10 transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-200">{inv.lead.businessName}</p>
                        <span className="px-1 py-0.2 text-[8px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded uppercase font-bold">
                          Settled
                        </span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 space-y-0.5 mt-0.5">
                        <p>Invoice: #{inv.id.substring(4, 11)} • Method: <span className="text-slate-400 uppercase font-bold">{inv.method}</span></p>
                        {inv.ref && <p>Transaction Reference: <span className="text-slate-400 font-bold">{inv.ref}</span></p>}
                        {inv.note && <p>Audit Note: <span className="italic text-slate-400">"{inv.note}"</span></p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs font-bold text-emerald-400 shrink-0 self-end sm:self-auto">
                      +${inv.amount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right column - Setup details (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* UPI Routing Gateway Setup */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5 border-b border-[#1F2937] pb-1.5">
              <Landmark size={14} className="text-[#7C3AED]" />
              Gateway Routing
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs font-sans">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">Unified UPI VPA</label>
                <input 
                  type="text" 
                  value={upiId} 
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. agency@upi" 
                  className="w-full px-2.5 py-1.5 bg-[#0B1020] border border-[#1F2937] rounded-lg text-slate-200 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">Merchant Name (Payee)</label>
                <input 
                  type="text" 
                  value={merchantName} 
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="Singularity AI Technologies" 
                  className="w-full px-2.5 py-1.5 bg-[#0B1020] border border-[#1F2937] rounded-lg text-slate-200 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">Razorpay Key ID</label>
                <input 
                  type="password" 
                  value={razorpayKey} 
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  placeholder="rzp_live_abc123..." 
                  className="w-full px-2.5 py-1.5 bg-[#0B1020] border border-[#1F2937] rounded-lg text-slate-200 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="space-y-1 border-t border-[#1F2937] pt-2">
                <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">IBAN/Swift Routing</label>
                <input 
                  type="text" 
                  value={bankIban} 
                  onChange={(e) => setBankIban(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0B1020] border border-[#1F2937] rounded-lg text-slate-300 focus:outline-none focus:border-[#7C3AED] font-mono text-[9px]"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                {savingSettings ? "Persisting..." : "Save Gateway Config"}
              </button>
            </form>
          </div>

          {/* Active UPI QR Terminal */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5 border-b border-[#1F2937] pb-1.5">
              <QrCode size={14} className="text-emerald-500" />
              Unified UPI Terminal
            </h3>

            <div className="text-center space-y-2.5">
              <div className="w-24 h-24 mx-auto bg-white border border-[#1F2937] rounded-lg flex items-center justify-center p-1.5 relative group overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="10" y="10" width="15" height="15" fill="currentColor" />
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="75" y="10" width="15" height="15" fill="currentColor" />
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="10" y="75" width="15" height="15" fill="currentColor" />
                  
                  <rect x="40" y="15" width="5" height="15" fill="currentColor" />
                  <rect x="45" y="45" width="15" height="10" fill="currentColor" />
                  <rect x="15" y="40" width="10" height="15" fill="currentColor" />
                  <rect x="75" y="40" width="15" height="15" fill="currentColor" />
                  <rect x="40" y="70" width="15" height="15" fill="currentColor" />
                  <rect x="70" y="70" width="10" height="10" fill="currentColor" />
                  <rect x="50" y="5" width="10" height="5" fill="currentColor" />
                </svg>
                <div className="absolute inset-0 bg-[#7C3AED]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-slate-950 text-[#F8FAFC] px-1 py-0.5 rounded text-[7px] font-mono font-bold border border-[#1F2937] shadow">SINGULARITY</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-white block">UPI Static QR Code Live</span>
                <p className="text-[9px] text-slate-400 font-mono leading-none">{upiId}</p>
                <p className="text-[8px] text-slate-500 italic mt-0.5">Payee: {merchantName}</p>
              </div>

              <div className="flex gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="py-1 px-2 bg-[#0B1020] border border-[#1F2937] hover:bg-[#111827] rounded-md text-[8px] font-mono font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedUpi ? <Check size={8} className="text-emerald-500" /> : <Copy size={8} />}
                  Copy VPA
                </button>
                <button
                  type="button"
                  onClick={handleCopyBank}
                  className="py-1 px-2 bg-[#0B1020] border border-[#1F2937] hover:bg-[#111827] rounded-md text-[8px] font-mono font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedBank ? <Check size={8} className="text-emerald-500" /> : <Copy size={8} />}
                  Copy IBAN
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
