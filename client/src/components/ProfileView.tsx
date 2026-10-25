import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  GraduationCap, 
  Sparkles, 
  Code, 
  Link as LinkIcon, 
  Bell, 
  Check, 
  CheckCircle2, 
  Plus, 
  X,
  LogIn
} from "lucide-react";
import { UserProfile, fetchUserProfile, updateUserProfile } from "@/lib/api";

interface ProfileViewProps {
  currentUser?: any;
  onOpenAuthModal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onOpenAuthModal,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // If user is NOT signed in, show Auth Gate
  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto border border-slate-200">
          <UserIcon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">
            Sign In to Access Your Student Profile
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Personalize your education details, verify your college status, track your skills, and get personalized recommendations for hackathons and jobs.
          </p>
        </div>
        <button
          onClick={() => onOpenAuthModal && onOpenAuthModal()}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In / Create Account</span>
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchUserProfile()
      .then(data => {
        // Sync with authenticated Supabase user metadata if available
        if (currentUser) {
          const authName = currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || data.full_name;
          data.full_name = authName;
          data.email = currentUser.email || data.email;
        }
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load profile", err);
        setLoading(false);
      });
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateUserProfile(profile);
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save profile error", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!profile || !newSkill.trim()) return;
    if (!profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleTargetTypeToggle = (type: string) => {
    if (!profile) return;
    const exists = profile.target_types.includes(type);
    const updated = exists 
      ? profile.target_types.filter(t => t !== type)
      : [...profile.target_types, type];
    setProfile({ ...profile, target_types: updated });
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-xs">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-semibold">Loading verified student profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.full_name || currentUser?.email?.split("@")[0] || "Student";
  const userInitials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
          {userInitials || "U"}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">{displayName}</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Student
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {profile.degree || "Computer Science"} • {profile.university || "Engineering Institute"} (Class of {profile.graduation_year || 2026})
          </p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {profile.bio || "Active builder participating in competitive hackathons and engineering roles."}
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Talent Score</span>
          <p className="text-2xl font-black text-slate-900">850</p>
          <span className="text-[10px] text-emerald-600 font-bold">Top 5% Builder</span>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
        
        {/* Education Details */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Academic Qualifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">College / University</label>
              <input
                type="text"
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Degree & Major</label>
              <input
                type="text"
                value={profile.degree}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Graduation Year</label>
              <input
                type="number"
                value={profile.graduation_year}
                onChange={(e) => setProfile({ ...profile, graduation_year: parseInt(e.target.value) || 2026 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-slate-800 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Technical Competencies */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Code className="w-4 h-4 text-emerald-600" />
            <span>Technical Skills & Competencies</span>
          </h3>

          <div className="flex flex-wrap gap-2 mb-3">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold border border-slate-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="Add skill (e.g. Next.js, Docker, Kubernetes)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-slate-800 font-medium text-xs"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Target Opportunity Types */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Target Opportunity Preferences</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: "hackathon", label: "Hackathons" },
              { id: "job", label: "Full-Time Jobs" },
              { id: "internship", label: "Internships" },
              { id: "scholarship", label: "Scholarships" },
              { id: "fellowship", label: "Fellowships" },
              { id: "coding_contest", label: "Coding Contests" },
            ].map((item) => {
              const active = profile.target_types.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleTargetTypeToggle(item.id)}
                  className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="block truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* External Profiles */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <LinkIcon className="w-4 h-4 text-blue-600" />
            <span>Developer Presence Links</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">GitHub Profile</label>
              <input
                type="text"
                value={profile.github_url || ""}
                onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={profile.linkedin_url || ""}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Portfolio / Devfolio URL</label>
              <input
                type="text"
                value={profile.portfolio_url || ""}
                onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                placeholder="https://yourname.dev"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-slate-800 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <div>
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>

      </form>

    </div>
  );
};
