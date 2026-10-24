// API Client and Data Types for ORBINEX

export const API_BASE_URL = 
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000/api/v1";

export interface Opportunity {
  id: number;
  slug: string;
  title: string;
  organizer: string;
  organizer_logo: string | null;
  category: "hackathon" | "internship" | "scholarship" | "fellowship" | "coding_contest" | "grant";
  mode: "online" | "in-person" | "hybrid";
  location: string;
  short_description: string;
  full_description: string;
  direct_registration_url: string;
  official_website_url: string | null;
  prize_or_stipend_amount: number;
  prize_currency: string;
  prize_description: string;
  is_free: boolean;
  fee_amount: number;
  deadline: string;
  start_date: string | null;
  end_date: string | null;
  eligibility_education: string[];
  eligibility_criteria: string[];
  skills_required: string[];
  tags: string[];
  verification_status: "VERIFIED_OFFICIAL" | "COMMUNITY_REPORTED" | "UNDER_REVIEW" | "FLAGGED";
  trust_score: number;
  verification_evidence: {
    domain_verified?: boolean;
    ssl_secure?: boolean;
    registration_link_tested?: boolean;
    source_credibility?: string;
    verified_by?: string;
    last_checked_iso?: string;
    checklist?: string[];
    [key: string]: any;
  };
  canonical_id?: number | null;
  is_duplicate: boolean;
  merged_sources_count: number;
  source_platform: string;
  source_url: string | null;
  views_count: number;
  clicks_count: number;
  applications_count: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  match_score?: number;
  match_reason?: string;
}

export interface ApplicationTask {
  id: number;
  application_tracker_id: number;
  title: string;
  is_completed: boolean;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  created_at: string;
}

export interface ApplicationTracker {
  id: number;
  user_id: number;
  opportunity_id: number;
  status: "SAVED" | "APPLIED" | "UNDER_REVIEW" | "INTERVIEW_ROUND" | "ACCEPTED" | "REJECTED";
  applied_date: string | null;
  deadline: string | null;
  follow_up_date: string | null;
  notes: string | null;
  submission_url: string | null;
  match_score: number;
  created_at: string;
  updated_at: string;
  opportunity?: Opportunity;
  tasks: ApplicationTask[];
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
  bio?: string | null;
  education_level: string;
  university: string;
  degree: string;
  graduation_year: number;
  cgpa: number;
  skills: string[];
  interests: string[];
  target_types: string[];
  location_preference: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  notification_preferences: {
    email_alerts?: boolean;
    deadline_reminders?: boolean;
    daily_digest?: boolean;
    verified_only?: boolean;
  };
}

export interface MatchAnalysis {
  opportunity_id: number;
  overall_match_percentage: number;
  recommendation_verdict: string;
  skills_match: {
    matched: string[];
    missing: string[];
    coverage_rate: string;
  };
  eligibility_check: {
    is_eligible: boolean;
    degree_requirement: string[];
    user_degree: string;
  };
  strengths: string[];
  improvement_areas: string[];
  why_this_matches_you: string;
}

export interface PrepChecklist {
  opportunity_id: number;
  opportunity_title: string;
  phases: Array<{
    phase_name: string;
    actions: string[];
  }>;
  key_deliverables: string[];
  suggested_tech_stack: string[];
  insider_tips: string[];
}

export interface ResumeAnalysis {
  target_role: string;
  combined_score: number;
  ats_score: number;
  found_skills: string[];
  missing_skills: string[];
  strengths: string[];
  improvements: string[];
  summary_verdict: string;
  recommended_opportunities: Array<{
    id: number;
    title: string;
    organizer: string;
    category: string;
    deadline: string;
    prize_description: string;
    direct_registration_url: string;
  }>;
}

export interface Mentor {
  id: number;
  name: string;
  role: string;
  company: string;
  company_logo: string;
  avatar: string;
  rating: number;
  reviews_count: number;
  experience_years: number;
  skills: string[];
  bio: string;
  sessions_taken: number;
}

export interface SourceHealth {
  id: number;
  source_name: string;
  connector_type: string;
  target_url: string;
  last_synced_at: string;
  status: string;
  latency_ms: number;
  items_discovered: number;
  freshness_score: number;
  last_error?: string | null;
}

export interface AnalyticsOverview {
  total_opportunities: number;
  verified_opportunities: number;
  total_applications: number;
  active_students: number;
  category_distribution: Record<string, number>;
  sources_health_summary: Record<string, number>;
  average_trust_score: number;
}

// API Helper Fetch Functions
export async function fetchOpportunities(params?: {
  q?: string;
  category?: string;
  mode?: string;
  status?: string;
  is_free?: boolean;
  min_prize?: number;
  sort?: string;
}): Promise<Opportunity[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.category && params.category !== "all") query.set("category", params.category);
  if (params?.mode && params.mode !== "all") query.set("mode", params.mode);
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.is_free !== undefined) query.set("is_free", String(params.is_free));
  if (params?.min_prize) query.set("min_prize", String(params.min_prize));
  if (params?.sort) query.set("sort", params.sort);

  const res = await fetch(`${API_BASE_URL}/opportunities?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch opportunities");
  return res.json();
}

export async function fetchOpportunityDetails(idOrSlug: string | number): Promise<Opportunity> {
  const res = await fetch(`${API_BASE_URL}/opportunities/${idOrSlug}`);
  if (!res.ok) throw new Error("Failed to fetch opportunity details");
  return res.json();
}

export async function trackOpportunityClick(id: number): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/opportunities/${id}/click`, { method: "POST" });
  } catch (e) {
    console.error("Click tracking error:", e);
  }
}

export async function fetchApplications(): Promise<ApplicationTracker[]> {
  const res = await fetch(`${API_BASE_URL}/tracker`);
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

export async function addToTracker(data: {
  opportunity_id: number;
  status: string;
  notes?: string;
}): Promise<ApplicationTracker> {
  const res = await fetch(`${API_BASE_URL}/tracker`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add to tracker");
  return res.json();
}

export async function updateApplication(
  id: number,
  data: {
    status?: string;
    notes?: string;
    submission_url?: string;
    follow_up_date?: string;
  }
): Promise<ApplicationTracker> {
  const res = await fetch(`${API_BASE_URL}/tracker/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update application");
  return res.json();
}

export async function deleteApplication(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tracker/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete application");
}

export async function addApplicationTask(
  applicationId: number,
  task: { title: string; priority?: string }
): Promise<ApplicationTask> {
  const res = await fetch(`${API_BASE_URL}/tracker/${applicationId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to add task");
  return res.json();
}

export async function toggleApplicationTask(taskId: number): Promise<ApplicationTask> {
  const res = await fetch(`${API_BASE_URL}/tracker/tasks/${taskId}/toggle`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to toggle task");
  return res.json();
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/user/profile`);
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/user/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update user profile");
  return res.json();
}

export async function requestMatchAnalysis(opportunityId: number): Promise<MatchAnalysis> {
  const res = await fetch(`${API_BASE_URL}/ai/match-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opportunity_id: opportunityId }),
  });
  if (!res.ok) throw new Error("Failed to analyze match");
  return res.json();
}

export async function requestPrepChecklist(opportunityId: number): Promise<PrepChecklist> {
  const res = await fetch(`${API_BASE_URL}/ai/prep-checklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opportunity_id: opportunityId }),
  });
  if (!res.ok) throw new Error("Failed to get prep checklist");
  return res.json();
}

export async function requestSOPDraft(opportunityId: number, targetRole?: string): Promise<SOPDraft> {
  const res = await fetch(`${API_BASE_URL}/ai/sop-draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opportunity_id: opportunityId, target_role_or_track: targetRole }),
  });
  if (!res.ok) throw new Error("Failed to generate SOP");
  return res.json();
}

export async function fetchAdminVerificationQueue(): Promise<Opportunity[]> {
  const res = await fetch(`${API_BASE_URL}/admin/verification-queue?status_filter=ALL`);
  if (!res.ok) throw new Error("Failed to fetch verification queue");
  return res.json();
}

export async function reviewOpportunityStatus(
  id: number,
  action: { verification_status: string; trust_score?: number; notes?: string }
): Promise<Opportunity> {
  const res = await fetch(`${API_BASE_URL}/admin/verification-review/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  if (!res.ok) throw new Error("Failed to review opportunity");
  return res.json();
}

export async function fetchDuplicates(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/admin/duplicates`);
  if (!res.ok) throw new Error("Failed to fetch duplicates");
  return res.json();
}

export async function mergeDuplicates(primaryId: number, duplicateIds: number[]): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/admin/duplicates/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ primary_id: primaryId, duplicate_ids: duplicateIds }),
  });
  if (!res.ok) throw new Error("Failed to merge duplicates");
  return res.json();
}

export async function fetchSourceHealth(): Promise<SourceHealth[]> {
  const res = await fetch(`${API_BASE_URL}/admin/source-health`);
  if (!res.ok) throw new Error("Failed to fetch source health");
  return res.json();
}

export async function syncSourcesNow(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/admin/source-health/sync-now`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to sync sources");
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsOverview> {
  const res = await fetch(`${API_BASE_URL}/admin/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function submitPartnerOpportunity(data: any): Promise<Opportunity> {
  const res = await fetch(`${API_BASE_URL}/partner/submit-opportunity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit partner opportunity");
  return res.json();
}

export async function draftPartnerOutreach(data: {
  recipient_name: string;
  recipient_college: string;
  recipient_email: string;
  opportunity_id?: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/ai/partner-outreach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to draft outreach");
  return res.json();
}

export async function savePartnerOutreachMessage(data: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/partner/outreach-messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save outreach message");
  return res.json();
}

export async function fetchPartnerOutreachMessages(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/partner/outreach-messages`);
  if (!res.ok) throw new Error("Failed to fetch outreach messages");
  return res.json();
}

export async function requestResumeAnalysis(
  resumeText: string,
  targetRole: string = "Fullstack SDE"
): Promise<ResumeAnalysis> {
  const res = await fetch(`${API_BASE_URL}/ai/resume-analyzer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_text: resumeText, target_role: targetRole }),
  });
  if (!res.ok) throw new Error("Failed to analyze resume");
  return res.json();
}
