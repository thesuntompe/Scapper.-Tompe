import React, { useState, useMemo } from "react";
import { 
  DollarSign, CreditCard, Landmark, CheckCircle, Clock, AlertTriangle, 
  Settings, Copy, Check, QrCode, ArrowUpRight, ShieldCheck, HelpCircle
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
  const [settleMethod, setSettleMethod] = useState<"wire" | "manual" | "upi" | "razorpay">("manual");
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

  // Derive all active and completed invoices
  const { pendingInvoices, paidInvoices, totals } = useMemo(() => {
    const pending: { lead: Lead; id: string; amount: number; date: string }[] = [];
    const paid: { lead: Lead; id: string; amount: number; date: string; method: string; ref?: string; note?: string }[] = [];
    let netPending = 0;
    let netCollected = 0;

    leads.forEach((l) => {
      if (l.invoice) {
        if (l.invoice.status === "pending") {
          pending.push({
            lead: l,
            id: l.invoice.id,
            amount: l.invoice.amount,
            date: l.invoice.createdAt
          });
          netPending += l.invoice.amount;
        } else if (l.invoice.status === "paid") {
          paid.push({
            lead: l,
            id: l.invoice.id,
            amount: l.invoice.amount,
            date: l.invoice.createdAt,
            method: l.paymentMethod || "manual",
            ref: l.paymentDetails?.wireReference,
            note: l.paymentDetails?.manualNotes
          });
          netCollected += l.invoice.amount;
        }
      }
    });

    return { 
      pendingInvoices: pending, 
      paidInvoices: paid, 
      totals: { pending: netPending, collected: netCollected, count: pending.length + paid.length } 
    };
  }, [leads]);

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
          manualNotes: settleMethod === "manual" ? manualNote : `Settled via administrative finance gateway. Details: ${manualNote}`,
          wireReference: settleMethod === "wire" || settleMethod === "upi" ? wireRef : `MAN-${Date.now()}`,
          externalLink: ""
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
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-md font-bold text-slate-800 font-sans tracking-tight">Agency Revenue Ledger</h2>
          <p className="text-[10px] text-slate-400 font-mono">FINANCE, GATEWAYS & MANUAL CONFIRMATIONS</p>
        </div>
        <span className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono px-2.5 py-1 rounded-full font-bold">
          Razorpay & UPI Active
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Awaiting Collection</span>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
            ${totals.pending.toLocaleString()} <span className="text-xs font-normal text-slate-400 font-sans">USD</span>
          </h3>
          <p className="text-[10px] text-amber-600 mt-2 font-semibold">● {pendingInvoices.length} outstanding invoices</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Settled Earnings</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 tracking-tight mt-1">
            ${totals.collected.toLocaleString()} <span className="text-xs font-normal text-slate-400 font-sans">USD</span>
          </h3>
          <p className="text-[10px] text-emerald-600 mt-2 font-semibold">✔ {paidInvoices.length} successfully collected invoices</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Overall Yield Rate</span>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
            {totals.count > 0 ? Math.round((paidInvoices.length / totals.count) * 100) : 0}%
          </h3>
          <p className="text-[10px] text-slate-400 mt-2">Conversion efficiency based on contract approvals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Ledger listings (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Pending Invoices */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700">Pending Inbound Invoices</h3>
              <span className="text-[9px] font-mono bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 font-bold uppercase">
                Collection queue ({pendingInvoices.length})
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Zero pending accounts receivable.
                </div>
              ) : (
                pendingInvoices.map((inv) => (
                  <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-all">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{inv.lead.businessName}</p>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono mt-1">
                        <span>Inv: #{inv.id.substring(4, 11)}</span>
                        <span>•</span>
                        <span>Date: {new Date(inv.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-xs font-bold font-sans text-slate-800">${inv.amount} USD</span>
                      
                      {settlingLeadId === inv.lead.id ? (
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl animate-fadeIn">
                          <select 
                            value={settleMethod} 
                            onChange={(e) => setSettleMethod(e.target.value as any)}
                            className="bg-white border border-slate-200 text-[10px] font-semibold py-1 px-1.5 rounded-lg focus:outline-none"
                          >
                            <option value="manual">Manual Cash</option>
                            <option value="wire">Bank Wire</option>
                            <option value="upi">UPI Unified</option>
                          </select>
                          
                          {(settleMethod === "wire" || settleMethod === "upi") && (
                            <input 
                              type="text" 
                              value={wireRef} 
                              onChange={(e) => setWireRef(e.target.value)}
                              placeholder="Txn ID Ref..." 
                              className="bg-white border border-slate-200 text-[10px] px-2 py-1 rounded-lg w-28 focus:outline-none"
                            />
                          )}

                          {settleMethod === "manual" && (
                            <input 
                              type="text" 
                              value={manualNote} 
                              onChange={(e) => setManualNote(e.target.value)}
                              placeholder="Audit notes..." 
                              className="bg-white border border-slate-200 text-[10px] px-2 py-1 rounded-lg w-28 focus:outline-none"
                            />
                          )}

                          <button 
                            onClick={handleSettleSubmit}
                            disabled={submittingSettle}
                            className="text-[10px] py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
                          >
                            {submittingSettle ? "..." : "Settle"}
                          </button>
                          <button 
                            onClick={() => setSettlingLeadId(null)}
                            className="text-[10px] py-1 px-2 bg-slate-250 text-slate-600 rounded-lg font-bold hover:bg-slate-300 cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSettlingLeadId(inv.lead.id);
                            setSettleMethod("manual");
                          }}
                          className="text-[10px] py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all cursor-pointer shadow-sm"
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
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700">Settled Transactions</h3>
              <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase">
                Audited & Settled ({paidInvoices.length})
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {paidInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No completed cashflows in the ledger ledger.
                </div>
              ) : (
                paidInvoices.map((inv) => (
                  <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/10">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-800">{inv.lead.businessName}</p>
                        <span className="px-1.5 py-0.2 text-[8px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 rounded uppercase font-bold">
                          Settled
                        </span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 space-y-0.5 mt-1">
                        <p>Invoice: #{inv.id.substring(4, 11)} • Method: <span className="text-slate-600 uppercase font-bold">{inv.method}</span></p>
                        {inv.ref && <p>Transaction Reference: <span className="text-slate-600 font-bold">{inv.ref}</span></p>}
                        {inv.note && <p>Audit Note: <span className="italic text-slate-500">"{inv.note}"</span></p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-sans text-xs font-bold text-emerald-600 shrink-0">
                      +${inv.amount} USD
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right column - Setup details (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* RAZORPAY & UPI ROUTING GATEWAY SETUP */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Landmark size={14} className="text-indigo-600" />
              Routing Configuration
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">Unified UPI VPA</label>
                <input 
                  type="text" 
                  value={upiId} 
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. agency@upi" 
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">Merchant Name (Payee)</label>
                <input 
                  type="text" 
                  value={merchantName} 
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="Singularity AI Technologies" 
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">Razorpay Key ID (API Link)</label>
                <input 
                  type="password" 
                  value={razorpayKey} 
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  placeholder="rzp_live_abc123..." 
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1 border-t border-slate-100 pt-3">
                <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">IBAN/Swift Bank Routing</label>
                <input 
                  type="text" 
                  value={bankIban} 
                  onChange={(e) => setBankIban(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 font-mono text-[10px]"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                {savingSettings ? "Saving credentials..." : "Persist Gateway Config"}
              </button>
            </form>
          </div>

          {/* ACTIVE UPI QR STATION FOR CLIENTS */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <QrCode size={14} className="text-emerald-500" />
              Unified UPI Terminal
            </h3>

            <div className="text-center space-y-3">
              {/* Fake QR visual representing standard static merchant UPI code */}
              <div className="w-28 h-28 mx-auto bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center p-2 relative group overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
                  {/* Outer border markers */}
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="10" y="10" width="15" height="15" fill="currentColor" />
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="75" y="10" width="15" height="15" fill="currentColor" />
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="10" y="75" width="15" height="15" fill="currentColor" />
                  
                  {/* Simulated matrix pixels */}
                  <rect x="40" y="15" width="5" height="15" fill="currentColor" />
                  <rect x="45" y="45" width="15" height="10" fill="currentColor" />
                  <rect x="15" y="40" width="10" height="15" fill="currentColor" />
                  <rect x="75" y="40" width="15" height="15" fill="currentColor" />
                  <rect x="40" y="70" width="15" height="15" fill="currentColor" />
                  <rect x="70" y="70" width="10" height="10" fill="currentColor" />
                  <rect x="50" y="5" width="10" height="5" fill="currentColor" />
                </svg>
                {/* Overlay brand logo */}
                <div className="absolute inset-0 bg-indigo-650/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border border-slate-200 shadow">SINGULARITY</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-800 block">UPI Static QR Code Live</span>
                <p className="text-[10px] text-slate-400 font-mono">{upiId}</p>
                <p className="text-[9px] text-slate-400 italic">Payee: {merchantName}</p>
              </div>

              <div className="flex gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="py-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-[9px] font-mono font-bold text-slate-600 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedUpi ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                  Copy VPA
                </button>
                <button
                  type="button"
                  onClick={handleCopyBank}
                  className="py-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-[9px] font-mono font-bold text-slate-600 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedBank ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
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
