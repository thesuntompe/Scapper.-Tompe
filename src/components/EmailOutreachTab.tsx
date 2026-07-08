import React, { useState } from "react";
import { Mail, Send, Reply, Loader2, Sparkles, CheckCircle2, AlertCircle, Phone, User, Calendar } from "lucide-react";
import { Lead } from "../types";

interface EmailOutreachTabProps {
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
}

export default function EmailOutreachTab({ lead, onUpdateLead }: EmailOutreachTabProps) {
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [recordingReply, setRecordingReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  // Persisted sender identity ("My Mail")
  const [senderName, setSenderName] = useState(() => localStorage.getItem("sterling_sender_name") || "Alex Sterling / Sterling & Co. Digital Agency");
  const [senderEmail, setSenderEmail] = useState(() => localStorage.getItem("sterling_sender_email") || "hackingm29@gmail.com");
  
  // Persisted option to auto-build website when positive reply arrives
  const [autoBuild, setAutoBuild] = useState(() => {
    const cached = localStorage.getItem("sterling_auto_build");
    return cached !== "false"; // defaults to true
  });

  const handleGenerateDraft = async () => {
    setDrafting(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/generate-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderEmail, senderName }),
      });
      if (!response.ok) throw new Error("Failed to generate outreach email draft");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e) {
      console.error(e);
    } finally {
      setDrafting(false);
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/mark-sent`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to record email as sent");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleRecordReply = async (textToSubmit: string) => {
    if (!textToSubmit.trim()) return;
    setRecordingReply(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/record-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText: textToSubmit, autoBuildWebsite: autoBuild }),
      });
      if (!response.ok) throw new Error("Failed to record client reply");
      const data = await response.json();
      onUpdateLead(data.lead);
      setReplyText("");
    } catch (e) {
      console.error(e);
    } finally {
      setRecordingReply(false);
    }
  };

  const activeDraft = lead.emails.find((e) => !e.sentAt && e.sender === "agent");
  const emailsSent = lead.emails.filter((e) => e.sentAt);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Automation Controls */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Sender Identity (My Mail) Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Your Sender Identity (My Mail)</span>
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Your Name / Agency</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => {
                    setSenderName(e.target.value);
                    localStorage.setItem("sterling_sender_name", e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Sterling Digital"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Your Email Address</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => {
                    setSenderEmail(e.target.value);
                    localStorage.setItem("sterling_sender_email", e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. hackingm29@gmail.com"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Changing these settings automatically updates the signature of newly generated outreach drafts!
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400">Pipeline Outreach Control</h3>

            {/* Stage 1: Generate Draft */}
            {lead.emails.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The AI Agent will analyze the presence deficits of <strong>{lead.businessName}</strong> and draft a highly personalized, non-spammy initial outreach email offering a free custom homepage mockup.
                </p>
                <button
                  onClick={handleGenerateDraft}
                  disabled={drafting}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-all disabled:text-slate-500"
                >
                  {drafting ? (
                    <>
                       <Loader2 size={14} className="animate-spin" />
                      Drafting with Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Draft Personalized Outreach
                    </>
                  )}
                </button>
              </div>
            )}

             {/* Stage 2: Send Draft */}
            {activeDraft && (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">Status: Outreach Drafted</span>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    A personalized draft is compiled. Review the text in the outbox editor, send it via your email app, and click below to record as sent.
                  </p>
                </div>
                
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-all"
                >
                  {sending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Recording Send...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Approve & Mark as Sent
                    </>
                  )}
                </button>

                <div className="pt-2.5 border-t border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Launch Personal Email App</span>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`mailto:${lead.email}?subject=${encodeURIComponent(activeDraft.subject)}&body=${encodeURIComponent(activeDraft.body)}`}
                      className="py-2 px-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-300 rounded-lg text-center text-[10px] font-mono font-medium flex items-center justify-center gap-1.5 transition-all"
                      title="Compose in your local default email client"
                    >
                      <Mail size={12} className="text-indigo-400" />
                      Mail App
                    </a>
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${encodeURIComponent(activeDraft.subject)}&body=${encodeURIComponent(activeDraft.body)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-300 rounded-lg text-center text-[10px] font-mono font-medium flex items-center justify-center gap-1.5 transition-all"
                      title="Open and compose directly inside Gmail (Web)"
                    >
                      <Send size={12} className="text-indigo-400" />
                      Gmail Web
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 3: Awaiting / Record Customer Reply */}
            {lead.status === "emailed" && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">Status: Outreach Sent</span>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Awaiting client response. Paste the email reply received from the client below to analyze intent and qualify!
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold">Paste Client Reply Email</label>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Paste email response text here..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 h-24 font-sans"
                  />
                </div>

                {/* Automation trigger checkbox */}
                <div className="flex items-center gap-2 py-1.5 px-2.5 bg-slate-900/50 border border-slate-800/80 rounded-lg">
                  <input
                    type="checkbox"
                    id="autoBuild"
                    checked={autoBuild}
                    onChange={(e) => {
                      setAutoBuild(e.target.checked);
                      localStorage.setItem("sterling_auto_build", e.target.checked ? "true" : "false");
                    }}
                    className="rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer h-3.5 w-3.5"
                  />
                  <label htmlFor="autoBuild" className="text-[9px] font-mono uppercase tracking-wider text-slate-300 cursor-pointer select-none font-bold">
                    Auto-build mockup website
                  </label>
                </div>

                <button
                  onClick={() => handleRecordReply(replyText)}
                  disabled={recordingReply || !replyText.trim()}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-all"
                >
                  {recordingReply ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Analyzing Reply...
                    </>
                  ) : (
                    <>
                      <Reply size={14} />
                      AI-Analyze & Record Reply
                    </>
                  )}
                </button>

                {/* Templates helper */}
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold mb-1.5">Load Sample Client Reply</span>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => setReplyText(`Hey! Thanks for reaching out. Our website is indeed super outdated and hasn't been updated in years. We've been wanting to remodel it. Can you make something with navy blue and gold? I'd love to see what you can build. Thanks, Carlos`)}
                      className="text-left text-[9px] font-sans text-slate-400 hover:text-white p-1.5 bg-slate-900 rounded border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                    >
                      👍 <strong>Carlos:</strong> "Website is super outdated, make something with navy blue and gold..."
                    </button>
                    <button
                      onClick={() => setReplyText(`Hi. How much does a website like this cost? And are there any monthly fees? Let me see the free mockup first before we make any decisions. Thanks, Mateo.`)}
                      className="text-left text-[9px] font-sans text-slate-400 hover:text-white p-1.5 bg-slate-900 rounded border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                    >
                      🤔 <strong>Mateo:</strong> "How much does a website like this cost? Let me see the mockup first..."
                    </button>
                    <button
                      onClick={() => setReplyText(`Thanks for the email, but we already have a web designer we work with. No thank you. Best, Gary`)}
                      className="text-left text-[9px] font-sans text-slate-400 hover:text-white p-1.5 bg-slate-900 rounded border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                    >
                      👎 <strong>Gary:</strong> "Already have a web designer we work with. No thank you..."
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 4: Qualified / Complete */}
            {(lead.status === "replied_interested" || lead.status === "planning" || lead.status === "site_generated" || lead.status === "client_review" || lead.status === "paid_and_deployed") && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold font-mono uppercase">Lead Qualified</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The client has agreed to a website project. {lead.status === "site_generated" ? "A website mockup has been automatically built according to their reply!" : "You can generate their website mockup."} Please open the <strong>AI Web Workspace</strong> tab to view and refine the design!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Simulated Mail Client Screen */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden flex flex-col min-h-[420px]">
            {/* Mail Box Header */}
            <div className="bg-slate-900/60 border-b border-slate-900 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-indigo-400" />
                <span className="text-xs font-bold font-mono uppercase text-slate-300">Secure Outreach Mailbox</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">SSL Encrypted Portal</span>
            </div>

            {/* Mail Thread Panel */}
            <div className="p-5 flex-1 space-y-5 overflow-y-auto max-h-[480px]">
              {lead.emails.length === 0 && !drafting && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 py-16">
                  <Mail size={32} className="text-slate-800 mb-3" />
                  <p className="font-mono text-xs text-slate-400">Outbox Empty</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                    Click 'Draft Personalized Outreach' on the left to activate Gemini and craft an email.
                  </p>
                </div>
              )}

              {drafting && (
                <div className="flex items-center justify-center py-20 space-y-2 flex-col">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                  <p className="text-xs font-mono text-slate-400">Gemini is conducting deep presence synthesis and writing email copy...</p>
                </div>
              )}

              {/* Message Render Thread */}
              {lead.emails.map((email) => {
                const isAgent = email.sender === "agent";
                return (
                  <div
                    key={email.id}
                    className={`flex flex-col space-y-1.5 p-4 rounded-xl border max-w-[90%] font-sans ${
                      isAgent
                        ? "bg-indigo-950/20 border-indigo-950/50 self-end ml-auto"
                        : "bg-slate-900 border-slate-800/80 self-start mr-auto"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${isAgent ? "bg-indigo-500/15 text-indigo-400" : "bg-slate-800 text-slate-400"}`}>
                          <User size={12} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            {isAgent ? "Sterling Digital (AI Agent)" : `${lead.ownerName} (${lead.businessName})`}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {isAgent ? `To: ${lead.email}` : "To: Sterling Agency"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="text-[9px] font-mono text-slate-500">
                          {email.sentAt ? new Date(email.sentAt).toLocaleTimeString() : "DRAFT"}
                        </p>
                        {email.messageId && (
                          <p className="text-[8px] font-mono text-indigo-500" title="GAPI Identifier">
                            ID: {email.messageId.substring(0, 15)}...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-900/60 space-y-1.5">
                      <p className="text-xs font-bold text-slate-300 font-sans">
                        Subject: <span className="text-slate-200 font-medium">{email.subject}</span>
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap pt-1 text-slate-300">
                        {email.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
