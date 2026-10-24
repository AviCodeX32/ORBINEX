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
  X 
} from "lucide-react";
import { UserProfile, fetchUserProfile, updateUserProfile } from "@/lib/api";

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetchUserProfile()
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load profile", err);
        setLoading(false);
      });
  }, []);

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
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-semibold">Loading verified student profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
          AS
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">{profile.full_name}</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Verified Student
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {profile.degree} • {profile.university} (Class of {profile.graduation_year})
          </p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {profile.bio}
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center shrink-0">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Current CGPA</span>
          <span className="text-xl font-black text-slate-900">{profile.cgpa} / 10.0</span>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile and AI recommendation preferences successfully updated!</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Academic Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Academic Qualifications & University</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email (Authenticated)</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">University / College</label>
              <input
                type="text"
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Degree & Major</label>
              <input
                type="text"
                value={profile.degree}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Graduation Year</label>
              <input
                type="number"
                value={profile.graduation_year}
                onChange={(e) => setProfile({ ...profile, graduation_year: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CGPA (out of 10.0)</label>
              <input
                type="number"
                step="0.01"
                value={profile.cgpa}
                onChange={(e) => setProfile({ ...profile, cgpa: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              <span>Skills & Competencies (AI Match Engine Keywords)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">{profile.skills.length} Skills</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-sm pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Next.js, Kubernetes, NLP)..."
              className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 flex-1"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Target Opportunity Types */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Target Opportunity Preferences</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { id: "hackathon", label: "Hackathons" },
              { id: "internship", label: "Internships" },
              { id: "scholarship", label: "Scholarships" },
              { id: "fellowship", label: "Fellowships" },
              { id: "coding_contest", label: "Coding Contests" },
              { id: "grant", label: "Research Grants" }
            ].map(type => (
              <label 
                key={type.id}
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer font-bold transition-all ${
                  profile.target_types.includes(type.id)
                    ? "bg-blue-50 border-blue-300 text-blue-900"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={profile.target_types.includes(type.id)}
                  onChange={() => handleTargetTypeToggle(type.id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Profile & Preferences"}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

