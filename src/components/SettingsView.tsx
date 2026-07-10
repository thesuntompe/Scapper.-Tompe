import React, { useState, useEffect } from "react";
import { 
  Settings, Check, Info, Mail, Database, FileSpreadsheet, HardDrive, RefreshCw,
  LogOut, ShieldAlert, Sparkles, AlertCircle, ShieldCheck, Play, ArrowRight, CheckCircle2,
  Lock, ArrowUpRight, HelpCircle, Laptop, Download, Globe, Cpu, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface ProvisioningStep {
  id: string;
  name: string;
  priority: number;
  description: string;
  status: "idle" | "pending" | "success" | "failed";
}

export default function SettingsView() {
  // Account state
  const [googleLinked, setGoogleLinked] = useState(() => {
    const saved = localStorage.getItem("singularity_google_linked");
    return saved !== null ? saved === "true" : false; // Default disconnected by default
  });

  const [currentMode, setCurrentMode] = useState<"Cloud Mode Active" | "Manual Mode Active">(() => {
    const saved = localStorage.getItem("singularity_current_mode");
    return (saved as "Cloud Mode Active" | "Manual Mode Active") || "Manual Mode Active";
  });

  // AI Engine State
  const [aiStatus, setAiStatus] = useState<any>({
    status: "Inactive",
    provider: "Gemini",
    gemini: "Inactive",
    openai: "Inactive"
  });

  useEffect(() => {
    const loadAiSettings = async () => {
      try {
        const res = await fetch("/api/ai/status");
        if (res.ok) {
          const statusData = await res.json();
          setAiStatus(statusData);
        }
      } catch (e) {
        console.error("Failed to load AI settings:", e);
      }
    };
    loadAiSettings();
  }, []);


  // Services State
  const [firebaseStatus, setFirebaseStatus] = useState<"Connected" | "Local Mode">(() => {
    return (localStorage.getItem("singularity_firebase_status") as "Connected" | "Local Mode") || "Local Mode";
  });
  const [sheetsStatus, setSheetsStatus] = useState<"Connected" | "Disabled">(() => {
    return (localStorage.getItem("singularity_sheets_status") as "Connected" | "Disabled") || "Disabled";
  });
  const [gmailStatus, setGmailStatus] = useState<"Connected" | "Manual Email Mode">(() => {
    return (localStorage.getItem("singularity_gmail_status") as "Connected" | "Manual Email Mode") || "Manual Email Mode";
  });
  const [mapsStatus, setMapsStatus] = useState<"Enabled" | "Fallback Search Engine">(() => {
    return (localStorage.getItem("singularity_maps_status") as "Enabled" | "Fallback Search Engine") || "Fallback Search Engine";
  });

  // Simulator / UI State
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningProgress, setProvisioningProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [simulateInsufficientPermissions, setSimulateInsufficientPermissions] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardComplete, setWizardComplete] = useState(false);

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem("singularity_google_linked", String(googleLinked));
    localStorage.setItem("singularity_current_mode", currentMode);
    localStorage.setItem("singularity_firebase_status", firebaseStatus);
    localStorage.setItem("singularity_sheets_status", sheetsStatus);
    localStorage.setItem("singularity_gmail_status", gmailStatus);
    localStorage.setItem("singularity_maps_status", mapsStatus);
  }, [googleLinked, currentMode, firebaseStatus, sheetsStatus, gmailStatus, mapsStatus]);

  // Provisioning Steps Definition
  const [steps, setSteps] = useState<ProvisioningStep[]>([
    { id: "firebase", name: "Firebase Firestore", priority: 1, description: "Secure cloud storage database for active prospects", status: "idle" },
    { id: "sheets", name: "Google Sheets Integration", priority: 2, description: "Automated 'Singularity AI Leads' spreadsheet", status: "idle" },
    { id: "gmail", name: "Gmail Communication", priority: 3, description: "Seamless outreach directly from your account", status: "idle" },
    { id: "drive", name: "Google Drive Backup Hub", priority: 4, description: "Automated document backups and offline exports", status: "idle" },
    { id: "maps", name: "Google Maps Places", priority: 5, description: "Intelligent local business discovery engine", status: "idle" },
  ]);

  // Launch Automatic Provisioning Engine
  const startAutomaticProvisioning = () => {
    setIsProvisioning(true);
    setProvisioningProgress(0);
    setActiveStepIndex(0);
    setShowWizard(false);
    setWizardComplete(false);

    // Reset step statuses to idle or pending
    setSteps(prev => prev.map((s, idx) => ({ ...s, status: idx === 0 ? "pending" : "idle" })));
  };

  // Run the provisioning simulation
  useEffect(() => {
    if (!isProvisioning) return;

    const interval = setInterval(() => {
      setSteps(currentSteps => {
        const nextSteps = [...currentSteps];
        const currentStep = nextSteps[activeStepIndex];

        if (!currentStep) return currentSteps;

        // Determine if this step should fail (simulate insufficient cloud account permissions)
        const isFailureStep = simulateInsufficientPermissions && (currentStep.id === "maps" || currentStep.id === "firebase");

        if (isFailureStep) {
          currentStep.status = "failed";
          clearInterval(interval);
          setIsProvisioning(false);
          setShowWizard(true); // Automatically show one-click wizard
          return nextSteps;
        } else {
          currentStep.status = "success";
          const nextIndex = activeStepIndex + 1;

          if (nextIndex < nextSteps.length) {
            nextSteps[nextIndex].status = "pending";
            setActiveStepIndex(nextIndex);
            setProvisioningProgress(Math.round((nextIndex / nextSteps.length) * 100));
          } else {
            // All steps completed successfully
            clearInterval(interval);
            setIsProvisioning(false);
            setProvisioningProgress(100);
            
            // Set all services to active
            setFirebaseStatus("Connected");
            setSheetsStatus("Connected");
            setGmailStatus("Connected");
            setMapsStatus("Enabled");
            setCurrentMode("Cloud Mode Active");
          }
          return nextSteps;
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isProvisioning, activeStepIndex, simulateInsufficientPermissions]);

  // Handle manual fallback mode toggle
  const toggleFallbackMode = () => {
    if (currentMode === "Cloud Mode Active") {
      setCurrentMode("Manual Mode Active");
      setFirebaseStatus("Local Mode");
      setSheetsStatus("Disabled");
      setGmailStatus("Manual Email Mode");
      setMapsStatus("Fallback Search Engine");
    } else {
      setCurrentMode("Cloud Mode Active");
      setFirebaseStatus("Connected");
      setSheetsStatus("Connected");
      setGmailStatus("Connected");
      setMapsStatus("Enabled");
    }
  };

  // Wizard action simulations (Simple One-Click Grant Buttons)
  const [wizardGrants, setWizardGrants] = useState({
    database: false,
    sheets: false,
    gmail: false,
    maps: false,
  });

  const handleWizardGrant = (key: keyof typeof wizardGrants) => {
    setWizardGrants(prev => ({ ...prev, [key]: true }));
  };

  const completeWizardSetup = () => {
    setFirebaseStatus("Connected");
    setSheetsStatus("Connected");
    setGmailStatus("Connected");
    setMapsStatus("Enabled");
    setCurrentMode("Cloud Mode Active");
    setShowWizard(false);
    setWizardComplete(true);
    // Mark steps success
    setSteps(prev => prev.map(s => ({ ...s, status: "success" })));
  };

  const handleCSVExportDemo = () => {
    alert("Exporting lead databases... Singularity_Leads_Report.csv downloaded successfully!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-16 text-[#F8FAFC]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E293B]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-sans">Cloud Sync & Account Link</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Control automated systems, local fallbacks, and account authorization</p>
        </div>
        <div className="mt-3 sm:mt-0 flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
            currentMode === "Cloud Mode Active" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentMode === "Cloud Mode Active" ? "bg-emerald-400" : "bg-amber-400"}`} />
            {currentMode}
          </span>
        </div>
      </div>

      {/* Profile Section: Apple Setup Styling */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-extrabold text-white text-lg shadow-lg">
              H
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">hackingm29@gmail.com</h3>
                {googleLinked && (
                  <span className="text-[9px] font-bold uppercase font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Google Account Linked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Linked as the primary owner and billing contact for this workspace.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {googleLinked ? (
              <button 
                onClick={() => {
                  setGoogleLinked(false);
                  setCurrentMode("Manual Mode Active");
                  setFirebaseStatus("Local Mode");
                  setSheetsStatus("Disabled");
                  setGmailStatus("Manual Email Mode");
                  setMapsStatus("Fallback Search Engine");
                }}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-[#1E293B] text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-2"
              >
                <LogOut size={13} />
                Unlink Account
              </button>
            ) : (
              <button 
                onClick={() => {
                  setGoogleLinked(true);
                  startAutomaticProvisioning();
                }}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2"
              >
                <Sparkles size={13} />
                Link Google Account
              </button>
            )}

            <button
              onClick={toggleFallbackMode}
              className="py-2 px-4 bg-slate-900 hover:bg-slate-800 border border-[#1E293B] text-xs text-slate-400 font-semibold rounded-xl transition-all"
            >
              {currentMode === "Cloud Mode Active" ? "Use Offline Mode" : "Use Cloud Sync"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Connection Statuses and Onboarding Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Connection Status Panel (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-indigo-400" />
                Integration Status
              </h3>
              <span className="text-[10px] font-mono text-slate-500 font-medium">REAL-TIME TELEMETRY</span>
            </div>

            <div className="space-y-3">
              {/* Firebase Item */}
              <div className="flex items-center justify-between p-3.5 bg-[#1E293B]/30 rounded-xl border border-[#1E293B]/60 hover:bg-[#1E293B]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <Database size={15} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">Database Core</span>
                    <span className="block text-[10px] text-slate-400">Stores prospects, active websites, and campaigns.</span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  firebaseStatus === "Connected" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}>
                  {firebaseStatus === "Connected" ? "Connected" : "Local Mode"}
                </span>
              </div>

              {/* Google Sheets Item */}
              <div className="flex items-center justify-between p-3.5 bg-[#1E293B]/30 rounded-xl border border-[#1E293B]/60 hover:bg-[#1E293B]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <FileSpreadsheet size={15} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">Leads Spreadsheet</span>
                    <span className="block text-[10px] text-slate-400">Syncs prospects directly to 'Singularity AI Leads'.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sheetsStatus === "Connected" && (
                    <button 
                      onClick={() => alert("Sheets directory synchronization triggered successfully!")}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                      title="Sync spreadsheet"
                    >
                      <RefreshCw size={10} />
                    </button>
                  )}
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    sheetsStatus === "Connected" 
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
                      : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                  }`}>
                    {sheetsStatus === "Connected" ? "Sync Ready" : "Disabled"}
                  </span>
                </div>
              </div>

              {/* Gmail Item */}
              <div className="flex items-center justify-between p-3.5 bg-[#1E293B]/30 rounded-xl border border-[#1E293B]/60 hover:bg-[#1E293B]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#A855F7]/10 text-[#A855F7] rounded-lg">
                    <Mail size={15} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">Outreach Mailer</span>
                    <span className="block text-[10px] text-slate-400">Delivers personalized contracts and proposal emails.</span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  gmailStatus === "Connected" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}>
                  {gmailStatus === "Connected" ? "Connected" : "Manual Email Mode"}
                </span>
              </div>

              {/* Maps Discovery */}
              <div className="flex items-center justify-between p-3.5 bg-[#1E293B]/30 rounded-xl border border-[#1E293B]/60 hover:bg-[#1E293B]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Globe size={15} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">Maps Discovery Engine</span>
                    <span className="block text-[10px] text-slate-400">Enables dynamic, real-world prospect scanning.</span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  mapsStatus === "Enabled" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}>
                  {mapsStatus === "Enabled" ? "Enabled" : "Fallback Search Engine"}
                </span>
              </div>

            </div>
          </div>

          {/* Local Mode Features Ledger Card */}
          <div className="bg-[#0F172A]/70 border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">Local Workspace Capabilities</h4>
              <span className="text-[9px] font-mono text-slate-500 uppercase">OFFLINE RESILIENCY</span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-normal">
              When Google services are offline or permissions are limited, Singularity automatically activates resilient local mode features to keep your business running smoothly:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 text-xs flex items-center gap-2.5 text-slate-300">
                <Database size={13} className="text-indigo-400 shrink-0" />
                <span>Local Prospect Vault</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 text-xs flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet size={13} className="text-emerald-400 shrink-0" />
                  <span>One-click CSV Exports</span>
                </div>
                <button 
                  onClick={handleCSVExportDemo}
                  className="p-1 text-[8px] bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 font-mono transition-colors cursor-pointer"
                >
                  Download
                </button>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 text-xs flex items-center gap-2.5 text-slate-300">
                <Mail size={13} className="text-[#A855F7] shrink-0" />
                <span>Manual Desktop Email Drips</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 text-xs flex items-center gap-2.5 text-slate-300">
                <Globe size={13} className="text-blue-400 shrink-0" />
                <span>One-click Web Mockups</span>
              </div>
            </div>
          </div>
        </div>

        {/* Provisioning Control Box (Right 1 Column) */}
        <div className="space-y-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Sparkles size={14} />
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">Cloud Provisioning</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automatically allocate cloud resources, map directories, and request Google integration nodes with one-click orchestration.
              </p>
            </div>

            {/* Simulating Insufficient Permissions Flag */}
            <div className="p-3 bg-[#1E293B]/30 border border-[#1E293B]/70 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-300 font-medium">Test Permission Failures</span>
                <input 
                  type="checkbox" 
                  checked={simulateInsufficientPermissions}
                  onChange={(e) => setSimulateInsufficientPermissions(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                />
              </div>
              <p className="text-[9px] text-slate-500 leading-tight">
                Simulates limited Google Cloud account credentials, automatically triggering the local fallback wizard.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {isProvisioning ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-indigo-400">
                    <span>Configuring services...</span>
                    <span>{provisioningProgress}%</span>
                  </div>
                  <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${provisioningProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={startAutomaticProvisioning}
                  disabled={!googleLinked}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play size={12} fill="currentColor" />
                  Auto-Provision Cloud
                </button>
              )}

              {showWizard && (
                <button
                  onClick={() => setShowWizard(true)}
                  className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 rounded-xl text-[10px] font-bold uppercase tracking-wider font-mono transition-all"
                >
                  Configure Local Onboarding
                </button>
              )}

              {wizardComplete && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg text-center flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} /> ONBOARDING VERIFIED
                </div>
              )}
            </div>

            {/* Micro progress trace of steps */}
            <div className="space-y-2 pt-2 border-t border-[#1E293B]">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Resource Build Sequence</span>
              <div className="space-y-1.5">
                {steps.map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between text-[10px] font-sans text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-slate-600">0{idx+1}</span>
                      <span className={s.status === "pending" ? "text-indigo-400 font-bold" : s.status === "success" ? "text-slate-300" : ""}>{s.name}</span>
                    </span>
                    {s.status === "success" && <span className="text-emerald-400 font-mono font-bold text-[9px] uppercase">Success</span>}
                    {s.status === "pending" && <span className="text-indigo-400 font-mono font-bold text-[9px] uppercase animate-pulse">Building</span>}
                    {s.status === "failed" && <span className="text-rose-400 font-mono font-bold text-[9px] uppercase">Review Needed</span>}
                    {s.status === "idle" && <span className="text-slate-600 font-mono text-[9px] uppercase">Pending</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Fallback Setup Wizard Modal/Overlay (One-Click Setup, No Raw Credentials) */}
      <AnimatePresence>
        {showWizard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-6"
            >
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">One-Click Configuration Wizard</span>
                <h3 className="text-base font-bold text-white mt-1">Setup Workspace Cloud Access</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Google permissions are insufficient for fully automatic background building. Grant permissions below to bypass raw credentials.
                </p>
              </div>

              {/* Wizard Steps list */}
              <div className="space-y-3">
                {/* Database Auth */}
                <div className="flex items-center justify-between p-3.5 bg-[#1E293B]/40 rounded-xl border border-[#1E293B] hover:bg-[#1E293B]/60 transition-all">
                  <div>
                    <span className="block text-xs font-bold text-slate-200">Establish Firestore Storage</span>
                    <span className="block text-[10px] text-slate-500">Creates the default document ledger in your project.</span>
                  </div>
                  {wizardGrants.database ? (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                  ) : (
                    <button
                      onClick={() => handleWizardGrant("database")}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Grant Setup
                    </button>
                  )}
                </div>

                {/* Sheets Auth */}
                <div className="flex items-center justify-between p-3.5 bg-[#1E293B]/40 rounded-xl border border-[#1E293B] hover:bg-[#1E293B]/60 transition-all">
                  <div>
                    <span className="block text-xs font-bold text-slate-200">Initialize Google Spreadsheet</span>
                    <span className="block text-[10px] text-slate-500">Generates 'Singularity AI Leads' in Google Sheets.</span>
                  </div>
                  {wizardGrants.sheets ? (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Sync Ready</span>
                  ) : (
                    <button
                      onClick={() => handleWizardGrant("sheets")}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Authorize Sheets
                    </button>
                  )}
                </div>

                {/* Gmail Auth */}
                <div className="flex items-center justify-between p-3.5 bg-[#1E293B]/40 rounded-xl border border-[#1E293B] hover:bg-[#1E293B]/60 transition-all">
                  <div>
                    <span className="block text-xs font-bold text-slate-200">Link Gmail Sending</span>
                    <span className="block text-[10px] text-slate-500">Allows Singularity to queue and dispatch custom contract emails.</span>
                  </div>
                  {wizardGrants.gmail ? (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Linked</span>
                  ) : (
                    <button
                      onClick={() => handleWizardGrant("gmail")}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Connect Gmail
                    </button>
                  )}
                </div>

                {/* Maps Auth */}
                <div className="flex items-center justify-between p-3.5 bg-[#1E293B]/40 rounded-xl border border-[#1E293B] hover:bg-[#1E293B]/60 transition-all">
                  <div>
                    <span className="block text-xs font-bold text-slate-200">Activate Location Discoveries</span>
                    <span className="block text-[10px] text-slate-500">Enables background maps API capabilities.</span>
                  </div>
                  {wizardGrants.maps ? (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Enabled</span>
                  ) : (
                    <button
                      onClick={() => handleWizardGrant("maps")}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Activate Engine
                    </button>
                  )}
                </div>
              </div>

              {/* Wizard Bottom bar */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
                <button
                  onClick={() => {
                    setShowWizard(false);
                    setCurrentMode("Manual Mode Active");
                    setFirebaseStatus("Local Mode");
                    setSheetsStatus("Disabled");
                    setGmailStatus("Manual Email Mode");
                    setMapsStatus("Fallback Search Engine");
                  }}
                  className="text-[10px] font-mono text-slate-500 hover:text-slate-300 font-bold uppercase transition-colors"
                >
                  Cancel & Use Local Mode
                </button>

                <button
                  disabled={!Object.values(wizardGrants).every(Boolean)}
                  onClick={completeWizardSetup}
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/15"
                >
                  Verify Onboarding Setup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide Card - Apple Info Block */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 flex gap-4 text-xs text-indigo-200 font-sans leading-relaxed shadow-lg">
        <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Seamless One-Click Onboarding On-Demand</p>
          <p className="text-slate-400 text-[10px] leading-relaxed">
            Singularity utilizes official Google APIs, automatically building default spreadsheets, establishing secure cloud databases, and authorizing outgoing mail configurations. If permissions are restricted, the onboarding wizard or local offline fallback guarantees uncompromised access to website generators, CRM boards, and lead tracking.
          </p>
        </div>
      </div>

    </div>
  );
}
