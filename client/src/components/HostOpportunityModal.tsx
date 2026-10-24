import React, { useState } from "react";
import { X, Building2, PlusCircle, CheckCircle2, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { submitPartnerOpportunity } from "@/lib/api";

interface HostOpportunityModalProps {
  onClose: () => void;
  onOpportunityCreated?: () => void;
}

export const HostOpportunityModal: React.FC<HostOpportunityModalProps> = ({
  onClose,
  onOpportunityCreated,
}) => {
  const [organizerName, setOrganizerName] = useState("Avnish Maurya");
  const [orgEntity, setOrgEntity] = useState("Tech Innovation Cell & Dev Club");
  const [email, setEmail] = useState("organizer@orbinex.ai");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("hackathon");
  const [mode, setMode] = useState("online");
  const [location, setLocation] = useState("Virtual / All India");
  const [prizeDesc, setPrizeDesc] = useState("₹2,50,000 Cash Pool + Cloud Credits");
  const [prizeAmount, setPrizeAmount] = useState<number>(250000);
  const [deadlineDays, setDeadlineDays] = useState<number>(21);
  const [regUrl, setRegUrl] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [skills, setSkills] = useState("React, Python, Machine Learning, FastAPI");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !regUrl.trim()) return;
    setLoading(true);

    try {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + Number(deadlineDays));

      const payload = {
        title,
        organizer: orgEntity || organizerName,
        category,
        mode,
        location,
        short_description: shortDesc || title,
        full_description: `${shortDesc || title}\n\nOrganized by ${organizerName} (${orgEntity}).\nOfficial Registration: ${regUrl}`,
        direct_registration_url: regUrl,
        prize_or_stipend_amount: Number(prizeAmount),
        prize_currency: "INR",
        prize_description: prizeDesc,
        is_free: true,
        fee_amount: 0.0,
        deadline: deadlineDate.toISOString(),
        eligibility_education: ["Undergraduate", "Postgraduate", "Recent Graduate"],
        eligibility_criteria: ["Open to enrolled college students & early builders", "Teams of 1 to 4 members"],
        skills_required: skills.split(",").map(s => s.trim()).filter(Boolean),
        tags: [category.toUpperCase(), "Organizer Verified", "Official"]
      };

      await submitPartnerOpportunity(payload);
      setSuccess(true);
      if (onOpportunityCreated) onOpportunityCreated();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error("Failed to host opportunity", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Host / List an Opportunity</h2>
              <p className="text-xs text-slate-500">
                Register as an organizer or campus lead to list a verified hackathon, internship, or challenge.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {success ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Opportunity Listed Successfully!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your opportunity has been authenticated by the ORBINEX Verification Engine and published to student feeds.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Organizer Credentials */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Organizer Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Organizer Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">College / Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={orgEntity}
                      onChange={(e) => setOrgEntity(e.target.value)}
                      placeholder="e.g. Google Developer Group / IIT Delhi"
                      className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Opportunity Information */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Opportunity / Hackathon Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National GenAI Autonomous Buildathon 2026"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="internship">Internship</option>
                    <option value="scholarship">Scholarship</option>
                    <option value="fellowship">Fellowship</option>
                    <option value="coding_contest">Coding Contest</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mode *</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="online">Online / Virtual</option>
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Days to Deadline *</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={deadlineDays}
                    onChange={(e) => setDeadlineDays(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Direct Registration URL *</label>
                  <input
                    type="url"
                    required
                    value={regUrl}
                    onChange={(e) => setRegUrl(e.target.value)}
                    placeholder="https://yourportal.com/register"
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prize / Reward Description *</label>
                  <input
                    type="text"
                    value={prizeDesc}
                    onChange={(e) => setPrizeDesc(e.target.value)}
                    placeholder="e.g. ₹5,00,000 + PPI fast-track"
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Description (1-2 sentences) *</label>
                <textarea
                  rows={2}
                  required
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Summary of track problems, eligibility, and deliverables..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recommended Tech Stacks / Skills (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, TypeScript, Python, PyTorch, Docker"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? "Verifying & Publishing..." : "Register as Organizer & Publish Listing"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
