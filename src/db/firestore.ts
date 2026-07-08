import fs from "fs";
import path from "path";

// Define Operation Types as requested by Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// Global variables for Firebase Firestore
let db: any = null;
let useFirestore = false;
let collectionRef: any = null;

// Firebase modules loaded dynamically to prevent compilation failures if not active
let fbDoc: any = null;
let fbGetDoc: any = null;
let fbGetDocs: any = null;
let fbSetDoc: any = null;
let fbDeleteDoc: any = null;
let fbCollection: any = null;

const LEADS_FILE = path.join(process.cwd(), "data", "leads.json");

// Safe Error Handler following exact skill guidelines
function handleFirestoreError(error: unknown, operationType: OperationType, docPath: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null
    },
    operationType,
    path: docPath
  };
  console.error('Firestore Error Detailed Logs: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Self-initializing async function
export async function initFirestore() {
  if (db) return { useFirestore, db };

  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, "utf-8");
      const firebaseConfig = JSON.parse(raw);
      if (firebaseConfig && firebaseConfig.projectId) {
        // Dynamically import client-side Firebase package on the server
        const { initializeApp } = await import("firebase/app");
        const { getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc, collection } = await import("firebase/firestore");
        
        const app = initializeApp(firebaseConfig);
        const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
        db = getFirestore(app, dbId);
        
        fbDoc = doc;
        fbGetDoc = getDoc;
        fbGetDocs = getDocs;
        fbSetDoc = setDoc;
        fbDeleteDoc = deleteDoc;
        fbCollection = collection;
        
        collectionRef = collection(db, "leads");
        useFirestore = true;
        console.log("✔ Server is connected directly to cloud Firestore database!");
        return { useFirestore: true, db };
      }
    } catch (e) {
      console.error("⚠ Firebase startup failed, falling back to local files:", e);
    }
  } else {
    console.log("ℹ No firebase-applet-config.json found yet. Local JSON fallback active.");
  }
  return { useFirestore: false, db: null };
}

// Generic file-based fallback helpers
function readLocalLeads(): any[] {
  try {
    if (!fs.existsSync(path.dirname(LEADS_FILE))) {
      fs.mkdirSync(path.dirname(LEADS_FILE), { recursive: true });
    }
    if (!fs.existsSync(LEADS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(LEADS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Local leads read error:", error);
    return [];
  }
}

function writeLocalLeads(leads: any[]) {
  try {
    if (!fs.existsSync(path.dirname(LEADS_FILE))) {
      fs.mkdirSync(path.dirname(LEADS_FILE), { recursive: true });
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (error) {
    console.error("Local leads write error:", error);
  }
}

// Helper to recursively remove or replace undefined values with null for Firestore compatibility
function sanitizeData(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeData);
  }
  if (typeof obj === "object") {
    const res: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        res[key] = sanitizeData(obj[key]);
      }
    }
    return res;
  }
  return obj;
}

// CRUD: GET ALL LEADS
export async function dbGetLeads(): Promise<any[]> {
  const { useFirestore: active } = await initFirestore();
  if (active && db) {
    try {
      const snapshot = await fbGetDocs(collectionRef);
      const list: any[] = [];
      snapshot.forEach((docSnap: any) => {
        list.push({ ...docSnap.data(), id: docSnap.id });
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "leads");
    }
  }
  return readLocalLeads();
}

// CRUD: SAVE SINGLE LEAD
export async function dbSaveLead(lead: any): Promise<void> {
  const sanitized = sanitizeData(lead);
  const { useFirestore: active } = await initFirestore();
  if (active && db) {
    const docPath = `leads/${sanitized.id}`;
    try {
      const docRef = fbDoc(db, "leads", sanitized.id);
      await fbSetDoc(docRef, sanitized);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }
  
  const leads = readLocalLeads();
  const idx = leads.findIndex(l => l.id === sanitized.id);
  if (idx === -1) {
    leads.push(sanitized);
  } else {
    leads[idx] = sanitized;
  }
  writeLocalLeads(leads);
}

// CRUD: SAVE MULTIPLE LEADS
export async function dbSaveLeads(newLeads: any[]): Promise<void> {
  const sanitizedLeads = newLeads.map(l => sanitizeData(l));
  const { useFirestore: active } = await initFirestore();
  if (active && db) {
    try {
      for (const lead of sanitizedLeads) {
        const docRef = fbDoc(db, "leads", lead.id);
        await fbSetDoc(docRef, lead);
      }
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "leads_batch");
    }
  }
  
  const leads = readLocalLeads();
  const existingIds = new Set(leads.map(l => l.id));
  const merged = [...sanitizedLeads.filter(nl => !existingIds.has(nl.id)), ...leads];
  writeLocalLeads(merged);
}

// CRUD: RESET DATABASE
export async function dbResetLeads(defaultLeads: any[]): Promise<any[]> {
  const sanitizedDefaults = defaultLeads.map(l => sanitizeData(l));
  const { useFirestore: active } = await initFirestore();
  if (active && db) {
    try {
      // Clear all existing documents in cloud Firestore
      const snapshot = await fbGetDocs(collectionRef);
      for (const docSnap of snapshot.docs) {
        const docRef = fbDoc(db, "leads", docSnap.id);
        await fbDeleteDoc(docRef);
      }
      // Populate defaults
      for (const lead of sanitizedDefaults) {
        const docRef = fbDoc(db, "leads", lead.id);
        await fbSetDoc(docRef, lead);
      }
      return sanitizedDefaults;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "leads_all");
    }
  }
  
  writeLocalLeads(sanitizedDefaults);
  return sanitizedDefaults;
}
