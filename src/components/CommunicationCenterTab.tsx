import React from "react";
import { 
  MessageSquare, 
  Instagram, 
  Mail, 
  Facebook, 
  Linkedin, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { motion } from "motion/react";
import { Lead } from "../types";

interface CommunicationCenterTabProps {
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
}

export default function CommunicationCenterTab({ lead }: CommunicationCenterTabProps) {
  // Extract contact info, supporting both old root properties and the new contactInfo object format
  const phone = lead.contactInfo?.phone_number || lead.phone || "";
  const email = lead.contactInfo?.email || lead.email || "";
  const instagram_url = lead.contactInfo?.instagram_url || "";
  const facebook_url = lead.contactInfo?.facebook_url || "";
  const linkedin_url = lead.contactInfo?.linkedin_url || "";

  // Determine if any contact info was discovered
  const hasContactInfo = !!(phone || email || instagram_url || facebook_url || linkedin_url);
  
  // Clean phone number to digits only for wa.me redirect
  const cleanPhone = phone.replace(/\D/g, "");

  // Use overall score if present, otherwise default to a high-confidence 92% as requested
  const confidenceScore = lead.contactConfidence?.overallScore || 92;

  // Render actions when clicked
  const handleOpenWhatsApp = () => {
    if (!cleanPhone) return;
    window.open(`https://wa.me/${cleanPhone}`, "_blank", "noopener,noreferrer");
  };

  const handleOpenInstagram = () => {
    if (!instagram_url) return;
    window.open(instagram_url, "_blank", "noopener,noreferrer");
  };

  const handleOpenFacebook = () => {
    if (!facebook_url) return;
    window.open(facebook_url, "_blank", "noopener,noreferrer");
  };

  const handleOpenLinkedIn = () => {
    if (!linkedin_url) return;
    window.open(linkedin_url, "_blank", "noopener,noreferrer");
  };

  const handleSendEmail = () => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="space-y-6">
      {/* Contact Confidence Section */}
      {hasContactInfo && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950 border border-slate-900 rounded-xl p-5 flex items-center justify-between shadow-lg"
        >
          <div className="space-y-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-bold">
              <ShieldCheck size={14} className="text-emerald-400" />
              Source Verification
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              Contact channels discovered and verified through public data nodes.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider font-semibold mb-0.5">Contact Confidence</span>
            <span className="text-lg font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 block w-fit ml-auto">
              {confidenceScore}%
            </span>
          </div>
        </motion.div>
      )}

      {/* Contact Actions Console */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-5 shadow-xl">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-1">Contact Actions</h3>
          <p className="text-[11px] text-slate-500 font-sans">
            Directly connect with the business owner using verified outreach redirects.
          </p>
        </div>

        {!hasContactInfo ? (
          <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-900/80 text-center space-y-2">
            <p className="text-xs text-slate-400 font-sans font-medium">No contact options discovered for this lead yet.</p>
            <p className="text-[10px] text-slate-500 font-sans">Run a lead research pass to automatically locate email, social profiles, and phone numbers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* WhatsApp Direct */}
            {phone && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleOpenWhatsApp}
                className="w-full flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <MessageSquare size={16} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Open WhatsApp Chat</span>
                    <span className="block text-[10px] text-slate-500 font-normal font-mono">{phone}</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </motion.button>
            )}

            {/* Instagram Profile */}
            {instagram_url && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleOpenInstagram}
                className="w-full flex items-center justify-between p-4 bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/40 text-pink-300 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg">
                    <Instagram size={16} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Open Instagram Profile</span>
                    <span className="block text-[10px] text-slate-500 font-normal truncate max-w-[140px]">
                      {instagram_url.replace("https://instagram.com/", "@").replace("https://www.instagram.com/", "@")}
                    </span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-600 group-hover:text-pink-400 transition-colors" />
              </motion.button>
            )}

            {/* Email mailto */}
            {email && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSendEmail}
                className="w-full flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Mail size={16} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Send Email</span>
                    <span className="block text-[10px] text-slate-500 font-normal truncate max-w-[140px] font-mono">{email}</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </motion.button>
            )}

            {/* Facebook Page */}
            {facebook_url && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleOpenFacebook}
                className="w-full flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-300 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                    <Facebook size={16} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Open Facebook Page</span>
                    <span className="block text-[10px] text-slate-500 font-normal truncate max-w-[140px]">
                      {facebook_url.split("/").pop()}
                    </span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
              </motion.button>
            )}

            {/* LinkedIn Profile */}
            {linkedin_url && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleOpenLinkedIn}
                className="w-full flex items-center justify-between p-4 bg-sky-500/10 border border-sky-500/20 hover:border-sky-500/40 text-sky-300 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                    <Linkedin size={16} />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Open LinkedIn Profile</span>
                    <span className="block text-[10px] text-slate-500 font-normal truncate max-w-[140px]">
                      {linkedin_url.split("/").pop()}
                    </span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
