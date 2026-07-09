import React, { useState } from "react";
import { 
  Mail, 
  Send, 
  Reply, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  User, 
  Calendar, 
  MessageSquare, 
  Instagram, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  CheckCheck, 
  Clock, 
  Bell, 
  Activity, 
  CheckSquare, 
  Trash2,
  Info
} from "lucide-react";
import { Lead, EmailMessage, WhatsAppMessage, InstagramMessage, InstagramProfile } from "../types";
import { googleSignIn, getAccessToken } from "../lib/auth";

interface CommunicationCenterTabProps {
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
}

export default function CommunicationCenterTab({ lead, onUpdateLead }: CommunicationCenterTabProps) {
  const [activeChannel, setActiveChannel] = useState<"email" | "whatsapp" | "instagram">("email");
  
  // General loaders
  const [draftingEmail, setDraftingEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  const [draftingWA, setDraftingWA] = useState(false);
  const [approvingWA, setApprovingWA] = useState(false);
  const [sendingWA, setSendingWA] = useState(false);
  const [trackingWA, setTrackingWA] = useState(false);
  
  const [detectingIG, setDetectingIG] = useState(false);
  const [draftingIG, setDraftingIG] = useState(false);
  const [approvingIG, setApprovingIG] = useState(false);
  const [sendingIG, setSendingIG] = useState(false);
  const [replyingIG, setReplyingIG] = useState(false);

  // States
  const [senderName, setSenderName] = useState(() => localStorage.getItem("singularity_sender_name") || "Alex / Singularity AI Partner");
  const [senderEmail, setSenderEmail] = useState(() => localStorage.getItem("singularity_sender_email") || "admin@singularityai.io");
  
  const [emailReplyText, setEmailReplyText] = useState("");
  const [whatsappReplyText, setWhatsappReplyText] = useState("");
  const [instagramReplyText, setInstagramReplyText] = useState("");
  
  const [autoBuild, setAutoBuild] = useState(() => {
    const cached = localStorage.getItem("singularity_auto_build");
    return cached !== "false"; // default true
  });

  // Reminder System
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderNote, setReminderNote] = useState("");

  // Helper variables
  const activeEmailDraft = lead.emails.find((e) => !e.sentAt && e.sender === "agent");
  const emailsSent = lead.emails.filter((e) => e.sentAt);

  const activeWADraft = lead.whatsappMessages?.[0]?.status === "draft" ? lead.whatsappMessages[0] : null;
  const waApproved = lead.whatsappMessages?.[0]?.status === "approved" ? lead.whatsappMessages[0] : null;
  const waSent = lead.whatsappMessages?.[0]?.status && ["sent", "delivered", "read", "replied", "meeting_scheduled"].includes(lead.whatsappMessages[0].status) ? lead.whatsappMessages[0] : null;
  const waLatestStatus = lead.whatsappMessages?.[0]?.status || "none";

  const activeIGDraft = lead.instagramMessages?.[0]?.status === "draft" ? lead.instagramMessages[0] : null;
  const igApproved = lead.instagramMessages?.[0]?.status === "approved" ? lead.instagramMessages[0] : null;
  const igSent = lead.instagramMessages?.[0]?.status && ["sent", "replied"].includes(lead.instagramMessages[0].status) ? lead.instagramMessages[0] : null;

  // 1. Email actions
  const handleGenerateEmailDraft = async () => {
    setDraftingEmail(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/generate-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderEmail, senderName }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate outreach email draft");
      }
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDraftingEmail(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        // Prompt Google sign in
        const res = await googleSignIn();
        if (res) {
          token = res.accessToken;
        }
      }

      if (!token) {
        throw new Error("Authentication with Google is required to send real emails.");
      }

      const response = await fetch(`/api/leads/${lead.id}/mark-sent`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to transmit outreach email");
      }
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleRecordEmailReply = async (textToSubmit: string) => {
    if (!textToSubmit.trim()) return;
    setDraftingEmail(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/record-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText: textToSubmit, autoBuildWebsite: autoBuild }),
      });
      if (!response.ok) throw new Error("Failed to record client reply");
      const data = await response.json();
      onUpdateLead(data.lead);
      setEmailReplyText("");
    } catch (e) {
      console.error(e);
    } finally {
      setDraftingEmail(false);
    }
  };

  // 2. WhatsApp Business actions
  const handleGenerateWADraft = async () => {
    setDraftingWA(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/whatsapp/draft`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to generate WhatsApp outreach draft");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDraftingWA(false);
    }
  };

  const handleApproveWA = async () => {
    setApprovingWA(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/whatsapp/approve`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve WhatsApp draft");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setApprovingWA(false);
    }
  };

  const handleSendWA = async () => {
    setSendingWA(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/whatsapp/send`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to transmit WhatsApp message");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSendingWA(false);
    }
  };

  const handleRecordWAReply = async (customText: string) => {
    if (!customText.trim()) return;
    setTrackingWA(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/whatsapp/record-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText: customText }),
      });
      if (!response.ok) throw new Error("Failed to record WhatsApp response");
      const data = await response.json();
      onUpdateLead(data.lead);
      setWhatsappReplyText("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setTrackingWA(false);
    }
  };

  // 3. Instagram Graph Direct actions
  const handleDetectIGAccount = async () => {
    setDetectingIG(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/instagram/detect`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to query Instagram Graph API nodes");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDetectingIG(false);
    }
  };

  const handleGenerateIGDraft = async () => {
    setDraftingIG(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/instagram/draft`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to draft Instagram outreach");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDraftingIG(false);
    }
  };

  const handleApproveIG = async () => {
    setApprovingIG(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/instagram/approve`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve Instagram draft");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setApprovingIG(false);
    }
  };

  const handleSendIG = async () => {
    setSendingIG(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/instagram/send`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to transmit Instagram DM");
      const data = await response.json();
      onUpdateLead(data.lead);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSendingIG(false);
    }
  };

  const handleRecordIGReply = async (customText: string) => {
    if (!customText.trim()) return;
    setReplyingIG(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/instagram/record-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText: customText }),
      });
      if (!response.ok) throw new Error("Failed to record Instagram response");
      const data = await response.json();
      onUpdateLead(data.lead);
      setInstagramReplyText("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setReplyingIG(false);
    }
  };

  // 4. Follow up Reminder Action
  const handleSaveReminder = () => {
    if (!reminderDate) {
      alert("Please select a valid reminder date.");
      return;
    }
    const updatedLead: Lead = {
      ...lead,
      followupAutomation: {
        enabled: true,
        nextScheduledTime: `${reminderDate}T${reminderTime || "12:00"}:00`,
        emailTemplateType: "followup_1",
        daysSinceLastContact: 0
      }
    };
    
    // Push reminder set to activities
    updatedLead.activities.unshift({
      id: `act_rem_${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `📅 Follow-up reminder scheduled for ${reminderDate} at ${reminderTime || "12:00"}. Note: ${reminderNote || "N/A"}.`,
      type: "outreach"
    });

    onUpdateLead(updatedLead);
    setReminderDate("");
    setReminderTime("");
    setReminderNote("");
  };

  const handleClearReminder = () => {
    const updatedLead: Lead = {
      ...lead,
      followupAutomation: {
        enabled: false,
        nextScheduledTime: undefined,
        emailTemplateType: undefined,
        daysSinceLastContact: undefined
      }
    };
    updatedLead.activities.unshift({
      id: `act_rem_clear_${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Follow-up reminder cancelled/cleared.`,
      type: "outreach"
    });
    onUpdateLead(updatedLead);
  };

  // Calculate Last Contact Time & Response status
  const getLastContactDetails = () => {
    let lastTime: string | null = null;
    let channel = "None";
    let status = "No contact initiated yet";
    let responseStatus = "Pending First Outreach";

    // Email
    const lastEmail = lead.emails?.[0];
    if (lastEmail?.sentAt) {
      lastTime = lastEmail.sentAt;
      channel = "Email";
      status = "Sent";
      responseStatus = lastEmail.sender === "client" ? "Replied / Qualified" : "Awaiting Client Reply";
    }

    // WhatsApp
    const lastWA = lead.whatsappMessages?.[0];
    if (lastWA?.sentAt) {
      if (!lastTime || new Date(lastWA.sentAt) > new Date(lastTime)) {
        lastTime = lastWA.sentAt;
        channel = "WhatsApp";
        status = lastWA.status.toUpperCase();
        responseStatus = lastWA.status === "replied" || lastWA.status === "meeting_scheduled" 
          ? "Replied / Qualified" 
          : "Awaiting Client Reply";
      }
    }

    // Instagram
    const lastIG = lead.instagramMessages?.[0];
    if (lastIG?.sentAt) {
      if (!lastTime || new Date(lastIG.sentAt) > new Date(lastTime)) {
        lastTime = lastIG.sentAt;
        channel = "Instagram";
        status = lastIG.status.toUpperCase();
        responseStatus = lastIG.status === "replied" ? "Replied / Qualified" : "Awaiting Client Reply";
      }
    }

    return { lastTime, channel, status, responseStatus };
  };

  const { lastTime, channel, status, responseStatus } = getLastContactDetails();

  return (
    <div className="space-y-6" id="sterling-communication-center">
      
      {/* Unified Overview Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl p-5 shadow-lg">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Unified Status Channel</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              {channel}
            </span>
            <span className="text-xs font-semibold">{status}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Response State</span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              responseStatus.includes("Replied") 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              {responseStatus}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Last Contact Time</span>
          <p className="text-xs font-medium font-sans">
            {lastTime ? new Date(lastTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "N/A"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Active Reminders</span>
          {lead.followupAutomation?.enabled && lead.followupAutomation.nextScheduledTime ? (
            <div className="flex items-center justify-between gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 animate-pulse">
                <Bell size={10} />
                {new Date(lead.followupAutomation.nextScheduledTime).toLocaleDateString()} @ {new Date(lead.followupAutomation.nextScheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button onClick={handleClearReminder} className="text-[10px] text-slate-500 hover:text-red-400 font-bold transition-colors">
                Clear
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">None Scheduled</p>
          )}
        </div>
      </div>

      {/* Main Channel Selector Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveChannel("email")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeChannel === "email"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Mail size={14} />
          <span>Email Channel</span>
        </button>

        <button
          onClick={() => setActiveChannel("whatsapp")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeChannel === "whatsapp"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MessageSquare size={14} className="text-emerald-500" />
          <span>WhatsApp Business</span>
        </button>

        <button
          onClick={() => setActiveChannel("instagram")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeChannel === "instagram"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Instagram size={14} className="text-pink-500" />
          <span>Instagram Business</span>
        </button>
      </div>

      {/* Grid Layout containing Channel Specific Workflow & Mock Client Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Controls & Configurations */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Identity & Auto-Build configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Channel Setup & Settings</span>
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Your Sender Signature Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => {
                    setSenderName(e.target.value);
                    localStorage.setItem("sterling_sender_name", e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {activeChannel === "email" && (
                <div>
                  <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Your Contact Email</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => {
                      setSenderEmail(e.target.value);
                      localStorage.setItem("sterling_sender_email", e.target.value);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Automation Toggle */}
              <div className="flex items-center gap-2 py-1.5 px-2 px-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  id="autoBuildGlobal"
                  checked={autoBuild}
                  onChange={(e) => {
                    setAutoBuild(e.target.checked);
                    localStorage.setItem("sterling_auto_build", e.target.checked ? "true" : "false");
                  }}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer h-3.5 w-3.5"
                />
                <label htmlFor="autoBuildGlobal" className="text-[9px] font-mono uppercase tracking-wider text-slate-300 cursor-pointer select-none font-bold">
                  Auto-build design mockups
                </label>
              </div>
            </div>
          </div>

          {/* Follow-up Reminder Scheduler */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <Bell size={14} className="text-amber-500 animate-bounce" />
              <span className="text-xs font-mono uppercase font-bold tracking-wider">Set Follow-up Reminder</span>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Reminder Notes / Action</label>
                <textarea
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  placeholder="e.g. Call back, pitch custom domain offer..."
                  className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 h-14 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleSaveReminder}
                disabled={!reminderDate}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-sans text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
              >
                Schedule Follow-up
              </button>
            </div>
          </div>

          {/* Core Pipeline Actions: Email */}
          {activeChannel === "email" && (
            <div className="bg-slate-950 border border-slate-900 text-slate-300 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <Mail size={12} className="text-indigo-400" />
                <span>Email Outreach Controls</span>
              </h3>

              {/* Block outreach if contact info or score is below 70% */}
              {lead.contactConfidence && lead.contactConfidence.overallScore < 70 && (
                <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl flex gap-2">
                  <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-300 font-sans leading-relaxed">
                    <strong>Confidence Check Blocked:</strong> Contact confidence overall score is {lead.contactConfidence.overallScore}%, which is below the required 70% threshold. Verify details manually.
                  </p>
                </div>
              )}

              {lead.emails.length === 0 && !draftingEmail && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Use Gemini to generate a professional outreach email based on verified public business profile gaps.
                  </p>
                  <button
                    onClick={handleGenerateEmailDraft}
                    disabled={draftingEmail || (lead.contactConfidence && lead.contactConfidence.overallScore < 70)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-xl text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>Generate Email Draft</span>
                  </button>
                </div>
              )}

              {activeEmailDraft && (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg space-y-1">
                    <span className="text-[9px] font-mono text-indigo-400 font-bold block uppercase">Review Drafted Email</span>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      Confirm the layout is correct, send it manually or record via API integration.
                    </p>
                  </div>
                  
                  <div className="p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                    <span className="text-[8px] font-mono font-bold text-amber-500 uppercase block">Human Manual Approval Required</span>
                    <p className="text-[9px] text-slate-400 font-sans">All messages require manual verification before transmission.</p>
                  </div>

                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {sendingEmail ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    <span>Approve & Send via Gmail</span>
                  </button>
                </div>
              )}

              {lead.status === "emailed" && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                    <span className="text-[9px] font-mono font-bold text-amber-400 block uppercase">Awaiting Email Response</span>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                      Paste client's reply to analyze intent and qualify or close outreach.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <textarea
                      value={emailReplyText}
                      onChange={(e) => setEmailReplyText(e.target.value)}
                      placeholder="Paste response text..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 h-20 font-sans"
                    />
                    
                    <button
                      onClick={() => handleRecordEmailReply(emailReplyText)}
                      disabled={draftingEmail || !emailReplyText.trim()}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-lg text-xs font-sans font-semibold cursor-pointer"
                    >
                      {draftingEmail ? "Processing Reply..." : "Record & AI-Analyze Reply"}
                    </button>
                  </div>
                </div>
              )}

              {lead.status === "replied_interested" && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1.5 text-center">
                  <CheckCircle2 size={16} className="text-emerald-400 mx-auto" />
                  <p className="text-xs font-mono font-bold text-emerald-400 uppercase">Email Qualified</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Check out the "AI Web Workspace" to generate and edit their custom website mockup!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Core Pipeline Actions: WhatsApp */}
          {activeChannel === "whatsapp" && (
            <div className="bg-slate-950 border border-slate-900 text-slate-300 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <MessageSquare size={12} className="text-emerald-400" />
                <span>WhatsApp Cloud API Workflow</span>
              </h3>

              {/* Status workflow indicators: Found -> Researched -> Approved -> Sent -> Replied */}
              <div className="space-y-2 border-b border-slate-900 pb-4">
                <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold">API pipeline node</span>
                <div className="flex flex-col gap-1 text-[9px] font-mono font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                    <span>Lead Discovered (Ready)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                    <span>Public Gaps Researched</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${["approved", "sent", "replied"].includes(waLatestStatus) ? "text-emerald-400" : "text-slate-600"}`}>
                    <CheckCircle2 size={10} className={["approved", "sent", "replied"].includes(waLatestStatus) ? "text-emerald-500" : "text-slate-800"} />
                    <span>Human Approval Verified</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${["sent", "replied"].includes(waLatestStatus) ? "text-emerald-400" : "text-slate-600"}`}>
                    <CheckCircle2 size={10} className={["sent", "replied"].includes(waLatestStatus) ? "text-emerald-500" : "text-slate-800"} />
                    <span>WhatsApp Transmitted (Sent)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${["replied"].includes(waLatestStatus) ? "text-emerald-400" : "text-slate-600"}`}>
                    <CheckCircle2 size={10} className={["replied"].includes(waLatestStatus) ? "text-emerald-500" : "text-slate-800"} />
                    <span>Prospect Replied (Intent)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                {(!lead.whatsappMessages || lead.whatsappMessages.length === 0) && !draftingWA && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Let Gemini write a highly natural, short WhatsApp outreach message tailored directly to this lead.
                    </p>
                    <button
                      onClick={handleGenerateWADraft}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={11} />
                      <span>Draft WhatsApp message</span>
                    </button>
                  </div>
                )}

                {activeWADraft && (
                  <div className="space-y-2.5">
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                      <span className="text-[9px] font-mono font-bold text-amber-500 uppercase block">Manual Agent Approval Required</span>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans mt-0.5">
                        Please review the drafted outreach in the phone screen. Click approve to authorize API transmission.
                      </p>
                    </div>
                    
                    <button
                      onClick={handleApproveWA}
                      disabled={approvingWA}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {approvingWA ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                      <span>Approve WhatsApp draft</span>
                    </button>
                  </div>
                )}

                {waApproved && (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                      <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase block">Draft Approved & Validated</span>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">Ready to transmit via WhatsApp Business Cloud API node.</p>
                    </div>
                    <button
                      onClick={handleSendWA}
                      disabled={sendingWA}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 cursor-pointer shadow-lg animate-pulse"
                    >
                      {sendingWA ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      <span>Transmit Approved WA Message</span>
                    </button>
                  </div>
                )}

                {/* Manual CRM response logging */}
                {waSent && waLatestStatus !== "replied" && (
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Log Client WhatsApp Reply</span>
                    
                    <div className="space-y-2">
                      <textarea
                        value={whatsappReplyText}
                        onChange={(e) => setWhatsappReplyText(e.target.value)}
                        placeholder="Type the customer's text or voice-note transcription..."
                        className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-indigo-600 h-16 font-sans placeholder-slate-400"
                      />
                      <button
                        onClick={() => handleRecordWAReply(whatsappReplyText)}
                        disabled={trackingWA || !whatsappReplyText.trim()}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded font-sans text-xs font-semibold cursor-pointer transition-colors"
                      >
                        {trackingWA ? "Logging Reply..." : "Log Client Reply"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Core Pipeline Actions: Instagram */}
          {activeChannel === "instagram" && (
            <div className="bg-slate-950 border border-slate-900 text-slate-300 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <Instagram size={12} className="text-pink-400" />
                <span>Instagram Graph Direct</span>
              </h3>

              {!lead.instagramProfile && (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-indigo-400 block font-bold uppercase">Detect Business Profile</span>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans">
                      Verify account parameters via Graph API node node query first to lock profile variables.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleDetectIGAccount}
                    disabled={detectingIG}
                    className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {detectingIG ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                    <span>Graph API: Scan Business Account</span>
                  </button>
                </div>
              )}

              {lead.instagramProfile && (
                <div className="space-y-4">
                  {/* Verified account card */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <img src={lead.instagramProfile.profilePicUrl} className="w-5 h-5 rounded-full object-cover border border-slate-800" referrerPolicy="no-referrer" />
                        <span className="text-xs font-bold text-white font-sans">@{lead.instagramProfile.username}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        Verified Business
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic font-sans leading-relaxed">
                      "{lead.instagramProfile.biography}"
                    </p>
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-850">
                      <span>Followers: {lead.instagramProfile.followersCount?.toLocaleString()}</span>
                      <span>Verified: Graph API Node</span>
                    </div>
                  </div>

                  {(!lead.instagramMessages || lead.instagramMessages.length === 0) && !draftingIG && (
                    <button
                      onClick={handleGenerateIGDraft}
                      className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={11} />
                      <span>Draft IG Direct Message</span>
                    </button>
                  )}

                  {activeIGDraft && (
                    <div className="space-y-2.5">
                      <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                        <span className="text-[9px] font-mono font-bold text-amber-500 uppercase block">Manual Approval Check</span>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-normal">
                          Outbox message is constructed using verified profile details. Approve below to transmit.
                        </p>
                      </div>
                      
                      <button
                        onClick={handleApproveIG}
                        disabled={approvingIG}
                        className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {approvingIG ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                        <span>Approve IG Direct draft</span>
                      </button>
                    </div>
                  )}

                  {igApproved && (
                    <button
                      onClick={handleSendIG}
                      disabled={sendingIG}
                      className="w-full py-2.5 px-4 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 cursor-pointer shadow-lg animate-pulse"
                    >
                      {sendingIG ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      <span>Transmit Approved IG Message</span>
                    </button>
                  )}

                  {igSent && lead.instagramMessages?.[0]?.status === "sent" && (
                    <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-slate-600 block">Log Client Instagram Reply</span>
                      <div className="space-y-2">
                        <textarea
                          value={instagramReplyText}
                          onChange={(e) => setInstagramReplyText(e.target.value)}
                          placeholder="Type customer's incoming DM message..."
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-pink-600 h-16 font-sans placeholder-slate-400"
                        />
                        <button
                          onClick={() => handleRecordIGReply(instagramReplyText)}
                          disabled={replyingIG || !instagramReplyText.trim()}
                          className="w-full py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded font-sans text-xs font-semibold cursor-pointer transition-colors"
                        >
                          {replyingIG ? "Logging DM..." : "Log Client DM"}
                        </button>
                      </div>
                    </div>
                  )}

                  {lead.instagramMessages?.[0]?.status === "replied" && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center space-y-1">
                      <CheckCircle2 size={14} className="text-emerald-400 mx-auto animate-pulse" />
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Lead Replied / Qualified</span>
                      <p className="text-[9px] text-slate-400 leading-normal font-sans">
                        CRM website builder automatically spawned customized layouts! Refine them inside AI Web Workspace.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Live Interactive Devices Mockups */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* EMAIL TAB DISPLAY */}
          {activeChannel === "email" && (
            <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden flex flex-col min-h-[460px] shadow-2xl">
              {/* Mail Box Header */}
              <div className="bg-slate-900 border-b border-slate-900 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold font-mono uppercase text-slate-300 ml-2">Secure Mail Portal</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">SSL Encrypted Outbox</span>
              </div>

              {/* Mail Thread Panel */}
              <div className="p-6 flex-1 space-y-5 overflow-y-auto max-h-[500px]">
                {lead.emails.length === 0 && !draftingEmail && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 py-24">
                    <Mail size={36} className="text-slate-800 mb-3" />
                    <p className="font-mono text-xs text-slate-400">Mailbox is Currently Empty</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-relaxed font-sans">
                      Let the AI Agent draft your business-gaps consultation email by selecting "Generate Email Draft" on the left.
                    </p>
                  </div>
                )}

                {draftingEmail && (
                  <div className="flex items-center justify-center py-24 space-y-3 flex-col">
                    <Loader2 className="animate-spin text-indigo-500" size={28} />
                    <p className="text-xs font-mono text-slate-400 text-center max-w-sm leading-normal">
                      Gemini is crawling public business directories, checking design compliance scores, and compiling draft parameters...
                    </p>
                  </div>
                )}

                {/* Message Render Thread */}
                {lead.emails.map((email) => {
                  const isAgent = email.sender === "agent";
                  return (
                    <div
                      key={email.id}
                      className={`flex flex-col space-y-1.5 p-4 rounded-xl border max-w-[90%] font-sans transition-all ${
                        isAgent
                          ? "bg-indigo-950/20 border-indigo-950/40 self-end ml-auto"
                          : "bg-slate-900 border-slate-800 self-start mr-auto"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${isAgent ? "bg-indigo-500/10 text-indigo-400" : "bg-slate-800 text-slate-400"}`}>
                            <User size={12} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              {isAgent ? `${senderName} (AI Agent)` : `${lead.ownerName} (${lead.businessName})`}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {isAgent ? `To: ${lead.email}` : `To: ${senderEmail}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <p className="text-[9px] font-mono text-slate-500">
                            {email.sentAt ? new Date(email.sentAt).toLocaleTimeString() : "DRAFT (UNAPPROVED)"}
                          </p>
                          {email.messageId && (
                            <p className="text-[8px] font-mono text-indigo-400" title="GAPI ID">
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
          )}

          {/* WHATSAPP TAB DISPLAY (Simulated Phone Screen!) */}
          {activeChannel === "whatsapp" && (
            <div className="flex justify-center">
              <div className="w-full max-w-[420px] bg-slate-900 rounded-[40px] p-3 border-[12px] border-slate-850 shadow-2xl relative">
                
                {/* Speaker Grill & Camera notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-slate-850 rounded-b-2xl z-20 flex items-center justify-center">
                  <div className="w-12 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Inner screen area */}
                <div className="rounded-[30px] overflow-hidden bg-slate-950 min-h-[480px] flex flex-col relative" style={{ backgroundImage: "radial-gradient(#15803d 1px, transparent 1px)", backgroundSize: "16px 16px", backgroundColor: "#0b141a" }}>
                  
                  {/* Phone Header */}
                  <div className="bg-[#075e54] text-white px-5 pt-7 pb-3 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#128c7e] text-white flex items-center justify-center font-mono font-bold text-xs uppercase shadow">
                        {lead.ownerName?.charAt(0) || "C"}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-sans tracking-wide">{lead.ownerName || "Carlos"}</h4>
                        <span className="text-[9px] text-emerald-100 font-sans flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>WhatsApp Business Verified</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-100 bg-[#128c7e] px-2 py-0.5 rounded-full uppercase">
                      Cloud API
                    </span>
                  </div>

                  {/* Chat logs viewport */}
                  <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[350px]">
                    {(!lead.whatsappMessages || lead.whatsappMessages.length === 0) && !draftingWA && (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
                        <MessageSquare size={32} className="text-[#128c7e] mb-2" />
                        <span className="text-[10px] font-mono text-emerald-200">No message drafts generated.</span>
                        <p className="text-[9px] text-slate-500 max-w-[180px] mt-1 font-sans">
                          Draft your first personalized Cloud API message from the controller on the left.
                        </p>
                      </div>
                    )}

                    {draftingWA && (
                      <div className="flex flex-col items-center justify-center py-16 space-y-2">
                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                        <span className="text-[10px] font-mono text-emerald-400">Gemini is polishing message templates...</span>
                      </div>
                    )}

                    {/* Render Chat Messages */}
                    {lead.whatsappMessages && [...lead.whatsappMessages].reverse().map((msg) => {
                      const isClient = msg.status === "replied";
                      return (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg text-xs font-sans max-w-[85%] relative flex flex-col ${
                            isClient
                              ? "bg-[#202c33] text-slate-200 self-start rounded-tl-none mr-auto shadow-sm"
                              : "bg-[#005c4b] text-[#e9edef] self-end rounded-tr-none ml-auto shadow-sm"
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                          <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-slate-400/90 self-end font-mono">
                            <span>
                              {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "DRAFT"}
                            </span>
                            {!isClient && (
                              <span>
                                {msg.status === "draft" && <Clock size={8} className="text-slate-500" />}
                                {msg.status === "approved" && <Check size={8} className="text-slate-400" />}
                                {msg.status === "sent" && <Check size={8} className="text-slate-200" />}
                                {msg.status === "replied" && <CheckCheck size={8} className="text-cyan-400" />}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Phone Bottom bar */}
                  <div className="bg-[#1f2c34] p-2.5 flex items-center justify-between border-t border-slate-900 mt-auto">
                    <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-1.5 text-xs text-slate-500 font-sans border border-slate-900/40">
                      Reply queue locked (Outbound only)
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* INSTAGRAM TAB DISPLAY (Simulated Instagram Direct screen!) */}
          {activeChannel === "instagram" && (
            <div className="flex justify-center">
              <div className="w-full max-w-[420px] bg-slate-900 rounded-[40px] p-3 border-[12px] border-slate-850 shadow-2xl relative">
                
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-slate-850 rounded-b-2xl z-20" />

                {/* Screen */}
                <div className="rounded-[30px] overflow-hidden bg-slate-950 min-h-[480px] flex flex-col relative" style={{ backgroundColor: "#000" }}>
                  
                  {/* IG Top bar */}
                  <div className="bg-black text-white px-5 pt-8 pb-3 border-b border-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Instagram size={14} className="text-pink-500" />
                      <span className="text-xs font-bold font-sans">
                        {lead.instagramProfile?.username ? `@${lead.instagramProfile.username}` : "Instagram Direct"}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase font-bold">
                      Graph API
                    </span>
                  </div>

                  {/* Message container */}
                  <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[350px]">
                    {!lead.instagramProfile && (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 py-16">
                        <Instagram size={36} className="text-slate-800 mb-2" />
                        <span className="text-[10px] font-mono text-slate-400">Awaiting Profile Link</span>
                        <p className="text-[9px] text-slate-500 max-w-[180px] mt-1 font-sans">
                          Use the "Graph API: Scan Business Account" controller to query nodes.
                        </p>
                      </div>
                    )}

                    {lead.instagramProfile && (!lead.instagramMessages || lead.instagramMessages.length === 0) && !draftingIG && (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 py-16">
                        <MessageSquare size={32} className="text-pink-500/80 mb-2" />
                        <span className="text-[10px] font-mono text-pink-300">Outbox Empty</span>
                        <p className="text-[9px] text-slate-500 max-w-[180px] mt-1 font-sans">
                          Click "Draft IG Direct Message" to compile custom DM templates.
                        </p>
                      </div>
                    )}

                    {draftingIG && (
                      <div className="flex flex-col items-center justify-center py-16 space-y-2">
                        <Loader2 className="animate-spin text-pink-500" size={24} />
                        <span className="text-[10px] font-mono text-pink-400">Drafting personalized DM copy...</span>
                      </div>
                    )}

                    {/* Messages list */}
                    {lead.instagramProfile && lead.instagramMessages && [...lead.instagramMessages].reverse().map((msg) => {
                      const isClient = msg.status === "replied";
                      return (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-2xl text-xs font-sans max-w-[80%] flex flex-col ${
                            isClient
                              ? "bg-[#262626] text-white self-start mr-auto"
                              : "bg-pink-600 text-white self-end ml-auto"
                          }`}
                        >
                          <p className="leading-relaxed">{msg.body}</p>
                          <span className="text-[8px] text-white/60 font-mono mt-1 text-right">
                            {msg.status.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* IG Bottom bar */}
                  <div className="bg-black p-2.5 flex items-center border-t border-slate-900 mt-auto">
                    <div className="flex-1 bg-[#121212] rounded-full px-4 py-1.5 text-xs text-slate-600 border border-slate-900/40">
                      Message...
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
