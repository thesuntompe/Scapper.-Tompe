export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'research' | 'score' | 'outreach' | 'email_received' | 'qualification' | 'site_build' | 'payment' | 'deploy';
}

export interface EmailMessage {
  id: string;
  subject: string;
  body: string;
  sentAt?: string;
  messageId?: string;
  type: 'initial_outreach' | 'followup' | 'qualification' | 'proposal';
  sender: 'agent' | 'client';
}

export interface OnlinePresence {
  hasWebsite: boolean;
  loadingSpeed?: string;
  mobileResponsive?: boolean;
  designQuality?: string;
  seoScore?: number;
  securitySsl?: boolean;
  improvementScore: number; // 0-100
  issuesDetected: string[];
  accessibilityScore?: number; // 0-100
  hasBookingCapability?: boolean;
  googleReviewsIntegration?: boolean;
  websiteAgeYears?: number;
  onlySocialPresence?: boolean;
  websiteQualityScore?: number; // 0-100
}

export interface AIResearchSummary {
  history?: string;
  services: string[];
  targetCustomers?: string;
  competitors: string[];
  strengths: string[];
  weaknesses: string[];
  marketPosition?: string;
  faqs?: { q: string, a: string }[];
}

export interface WebsitePlan {
  sitemap: { title: string; route: string; description: string }[];
  contentPlan: string;
  preferredColors?: string[];
  logoAvailability?: string;
}

export interface GeneratedWebsite {
  htmlCode?: string;
  reactCode?: string;
  cssCode?: string;
  theme?: string;
  revisionsCount: number;
}

export interface Invoice {
  id: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: string;
}

export interface ContactConfidence {
  emailConfidence: number; // 0-100
  phoneConfidence: number; // 0-100
  ownerConfidence: number; // 0-100
  overallScore: number; // 0-100
}

export interface ContactSources {
  emailSource?: string;
  phoneSource?: string;
  ownerSource?: string;
}

export interface CRMStages {
  currentStage: 'discovered' | 'outreach_drafted' | 'emailed' | 'proposal_sent' | 'contract_signed' | 'payment_pending' | 'deployed';
  history: { stage: string; updatedAt: string }[];
}

export interface BusinessIntelligence {
  competitorSEO?: { competitor: string; score: number }[];
  revenueOpportunityEstimated?: number;
  seoOpportunityScore?: number;
  estimatedRoiPercent?: number;
  beforeAndAfterPdfUrl?: string;
}

export interface Proposal {
  title: string;
  price: number;
  scope: string[];
  generatedAt: string;
  accepted: boolean;
}

export interface Contract {
  terms: string;
  signed: boolean;
  signedAt?: string;
  clientSignature?: string;
}

export interface FollowupAutomation {
  enabled: boolean;
  nextScheduledTime?: string;
  emailTemplateType?: 'followup_1' | 'followup_2';
  daysSinceLastContact?: number;
}

export interface BusinessContactInfo {
  business_name: string;
  email: string;
  phone_number: string;
  website: string;
  instagram_url: string;
  facebook_url: string;
  linkedin_url: string;
}

export interface Lead {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  category: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  googleRating: number;
  reviewCount: number;
  socialMedia: {
    yelp?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  onlinePresence: OnlinePresence;
  aiResearchSummary: AIResearchSummary;
  leadScore: number;
  aiRecommendation?: string;
  status: 'discovered' | 'scored' | 'outreach_drafted' | 'emailed' | 'replied_interested' | 'replied_uninterested' | 'planning' | 'site_generated' | 'client_review' | 'paid_and_deployed' | 'followup_scheduled';
  emails: EmailMessage[];
  websitePlan: WebsitePlan;
  generatedWebsite: GeneratedWebsite;
  invoice?: Invoice;
  customDomain?: {
    domainName: string;
    verified: boolean;
    dnsStatus: 'pending' | 'configured';
  };
  paymentMethod?: 'manual' | 'wire' | 'payment_link' | 'upi' | 'razorpay';
  paymentDetails?: {
    manualNotes?: string;
    wireReference?: string;
    externalLink?: string;
  };
  activities: ActivityLog[];
  contactConfidence?: ContactConfidence;
  contactSources?: ContactSources;
  crmStages?: CRMStages;
  businessIntelligence?: BusinessIntelligence;
  proposal?: Proposal;
  contract?: Contract;
  followupAutomation?: FollowupAutomation;
  contactInfo?: BusinessContactInfo;
  createdAt?: string;
  updatedAt?: string;
  lastContacted?: string | null;
  contactAttempts?: number;
}

export interface CampaignStats {
  totalResearched: number;
  scoredLeads: number;
  highPriority: number;
  emailsSent: number;
  interestedReplies: number;
  sitesGenerated: number;
  revenueEarned: number;
}
