import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Send, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles, 
  Mail, 
  ExternalLink, 
  ShieldCheck,
  Check
} from "lucide-react";
import { 
  submitPartnerOpportunity, 
  draftPartnerOutreach, 
  savePartnerOutreachMessage, 
  fetchPartnerOutreachMessages 
} from "@/lib/api";

export const PartnerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"submit" | "outreach" | "campaigns">("submit");
  
  // Submit Form State
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("Devfolio Ecosystem");
  const [category, setCategory] = useState("hackathon");
  const [mode, setMode] = useState("online");
  const [location, setLocation] = useState("Virtual / Remote");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [regUrl, setRegUrl] = useState("");
  const [prizeDesc, setPrizeDesc] = useState("₹2,50,000 Cash Prize + Swag");
  const [prizeAmount, setPrizeAmount] = useState<number>(250000);
  const [deadlineDays, setDeadlineDays] = useState<number>(21);
  const [skillsStr, setSkillsStr] = useState("React, TypeScript, Python, AI/ML");

  // Outreach Form State
  const [recipientName, setRecipientName] = useState("Dr. R. Sharma / TPO Lead");
  const [recipientCollege, setRecipientCollege] = useState("IIT Roorkee Student Tech Council");
  const [recipientEmail, setRecipientEmail] = useState("techclub@iitr.ac.in");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [outreachMessages, setOutreachMessages] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "campaigns") {
      fetchPartnerOutreachMessages().then(setOutreachMessages).catch(console.error);
    }
  }, [activeTab]);

  const handleSubmitOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + Number(deadlineDays));

      const payload = {
        title,
        organizer,
        category,
        mode,
        location,
        short_description: shortDesc || title,
        full_description: fullDesc || shortDesc || title,
        direct_registration_url: regUrl,
        prize_or_stipend_amount: Number(prizeAmount),
        prize_currency: "INR",
        prize_description: prizeDesc,
        is_free: true,
        fee_amount: 0.0,
        deadline: deadlineDate.toISOString(),
        eligibility_education: ["Undergraduate", "Postgraduate", "Recent Graduate"],
        eligibility_criteria: ["Open to enrolled college students", "Team size: 1-4 members"],
        skills_required: skillsStr.split(",").map(s => s.trim()).filter(Boolean),
        tags: [category.toUpperCase(), "Partner Verified"]
      };

      await submitPartnerOpportunity(payload);
      setSuccessMessage("Opportunity successfully submitted and authenticated with Verified Partner badge!");
      // Reset form
      setTitle("");
      setShortDesc("");
      setFullDesc("");
      setRegUrl("");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftOutreach = async () => {
    setLoading(true);
    try {
      const res = await draftPartnerOutreach({
        recipient_name: recipientName,
        recipient_college: recipientCollege,
        recipient_email: recipientEmail,
      });
      setDraftSubject(res.subject);
      setDraftBody(res.body);
    } catch (err) {
      console.error("Outreach draft failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndApproveOutreach = async () => {
    if (!draftSubject || !draftBody) return;
    setLoading(true);
    try {
      await savePartnerOutreachMessage({
        partner_id: 1,
        recipient_name: recipientName,
        recipient_college: recipientCollege,
        recipient_email: recipientEmail,
        subject: draftSubject,
        body: draftBody,
        campaign_name: "Campus Ambassador & Tech Challenge Outreach"
      });
      setSuccessMessage("Outreach campaign message approved and scheduled!");
      setDraftSubject("");
      setDraftBody("");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Save outreach failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Partner Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                Colleges & Partner Organization Portal
              </h2>
              <p className="text-xs text-slate-500">
                Post verified opportunities, recruit top talent, and conduct AI-assisted campus community outreach.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("submit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "submit"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Opportunity</span>
          </button>

          <button
            onClick={() => setActiveTab("outreach")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "outreach"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Campus Outreach</span>
          </button>

          <button
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "campaigns"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Outreach History</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)}>Dismiss</button>
        </div>
      )}

      {/* TAB 1: SUBMIT OPPORTUNITY FORM */}
      {activeTab === "submit" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="max-w-2xl mb-6">
            <h3 className="text-base font-bold text-slate-900">
              Submit an Opportunity (Partner Submission)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Opportunities submitted by authorized partners receive pre-verified status and appear immediately in student recommendation feeds.
            </p>
          </div>

          <form onSubmit={handleSubmitOpportunity} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous AI Hackathon 2026"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Organizer / Company *
                </label>
                <input
                  type="text"
                  required
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="e.g. Devfolio Partner Org / Microsoft"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  <option value="hackathon">Hackathon</option>
                  <option value="internship">Internship</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="fellowship">Fellowship</option>
                  <option value="coding_contest">Coding Contest</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mode *
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  <option value="online">Online / Virtual</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Days to Deadline *
                </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Direct Registration Link (Official Portal URL) *
                </label>
                <input
                  type="url"
                  required
                  value={regUrl}
                  onChange={(e) => setRegUrl(e.target.value)}
                  placeholder="https://yourdomain.com/register"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Prize or Compensation Description *
                </label>
                <input
                  type="text"
                  value={prizeDesc}
                  onChange={(e) => setPrizeDesc(e.target.value)}
                  placeholder="e.g. ₹3,00,000 Cash Pool + Cloud Credits"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Short Description (1-2 sentences for student feed) *
              </label>
              <input
                type="text"
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Brief summary of the challenge, target audience, and key perks..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Description & Rules
              </label>
              <textarea
                rows={4}
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                placeholder="Detailed breakdown of rounds, problem tracks, judging criteria, and deliverables..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Skills Required (comma-separated)
              </label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="Python, React, Machine Learning, FastAPI"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? "Authenticating & Publishing..." : "Submit & Publish Verified Opportunity"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: AI CAMPUS OUTREACH DRAFTER */}
      {activeTab === "outreach" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI College & Ambassador Outreach Drafter</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate personalized partnership invitations for college Training & Placement Officers (TPOs), student tech clubs, and campus ambassadors with verified perks.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Name / Role</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Recipient College / University</label>
              <input
                type="text"
                value={recipientCollege}
                onChange={(e) => setRecipientCollege(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Official Email</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleDraftOutreach}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? "Drafting with AI..." : "Draft Personalized Outreach"}</span>
            </button>
          </div>

          {/* Outreach Output & Review */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Approval-Controlled Communication Preview
              </h3>

              {draftSubject ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Subject Line</span>
                    <input
                      type="text"
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 mt-1 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Message Body</span>
                    <textarea
                      rows={10}
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      className="w-full text-xs p-3 mt-1 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Fill in the recipient details on the left and click "Draft Personalized Outreach" to preview the message.
                </div>
              )}
            </div>

            {draftSubject && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={handleSaveAndApproveOutreach}
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Schedule Outreach</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: OUTREACH CAMPAIGN HISTORY */}
      {activeTab === "campaigns" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Campaign Communication & Partner Logs
          </h3>

          {outreachMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No approved outreach messages yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {outreachMessages.map(msg => (
                <div key={msg.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{msg.subject}</h4>
                    <p className="text-slate-500 mt-0.5">
                      To: <strong>{msg.recipient_name}</strong> ({msg.recipient_college}) • {msg.recipient_email}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    {msg.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

