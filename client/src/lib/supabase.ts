import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Sign in with Google via Supabase OAuth
 */
export async function signInWithGoogle() {
  if (!supabase) {
    console.warn("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env");
    return { data: null, error: new Error("Supabase credentials not configured in .env") };
  }
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase credentials not configured in .env") };
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase credentials not configured in .env") };
  }
  return await supabase.auth.signUp({ email, password });
}

/**
 * Sign out
 */
export async function signOutUser() {
  if (!supabase) return { error: null };
  return await supabase.auth.signOut();
}

/**
 * Upload Resume file to Supabase storage bucket 'resumes'
 */
export async function uploadResumeToSupabase(file: File, userId: string = "guest"): Promise<{ url: string | null; error: Error | null }> {
  if (!supabase) {
    // Local fallback for offline/development mode
    return { url: URL.createObjectURL(file), error: null };
  }
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `resumes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("resumes").getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    console.error("Supabase resume upload error:", err);
    return { url: null, error: err };
  }
}
