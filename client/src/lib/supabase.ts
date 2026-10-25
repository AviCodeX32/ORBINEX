import { createClient, User } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Sign in with Google OAuth via Supabase
 */
export async function signInWithGoogle() {
  if (!supabase) {
    return { data: null, error: new Error("Supabase credentials not configured") };
  }
  const res = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (res.error) {
    return res;
  }

  // If Supabase returned redirect URL, navigate browser to it
  if (res.data?.url) {
    window.location.href = res.data.url;
  }

  return res;
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase credentials not configured") };
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase credentials not configured") };
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "Student Builder",
      },
    },
  });
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  if (!supabase) return { error: null };
  return await supabase.auth.signOut();
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user;
    const { data: { user } } = await supabase.auth.getUser();
    return user || null;
  } catch (err) {
    return null;
  }
}

/**
 * Upload Resume file to Supabase storage bucket 'resume'
 */
export async function uploadResumeToSupabase(
  file: File, 
  userId: string = "guest"
): Promise<{ url: string | null; error: Error | null }> {
  if (!supabase) {
    // Local fallback for offline mode
    return { url: URL.createObjectURL(file), error: null };
  }

  try {
    const fileExt = file.name.split(".").pop() || "pdf";
    const cleanFileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `resumes/${cleanFileName}`;

    // Upload to user's 'resume' bucket
    const { error: uploadError } = await supabase.storage
      .from("resume")
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type || "application/pdf"
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("resume").getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    console.error("Supabase resume bucket upload error:", err);
    return { url: null, error: err };
  }
}
