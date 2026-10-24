import React, { useState } from "react";
import { 
  Users, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  Video, 
  Sparkles,
  X
} from "lucide-react";

export const MentorshipView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const categories = [
    { id: "All", label: "All Sessions" },
    { id: "CV Review", label: "CV Review", icon: FileText },
    { id: "Interview Prep", label: "Interview Preparation", icon: MessageSquare },
    { id: "Hackathon Strategy", label: "Hackathon Strategy", icon: Sparkles },
    { id: "Placement Support", label: "Placement Support", icon: Briefcase },
    { id: "Career Guidance", label: "Career Guidance", icon: Users },
  ];

  const mentors = [
    {
      id: 1,
      name: "Rohit Verma",
      role: "Senior Software Engineer (L5)",
      company: "Google",
      company_logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviews_count: 142,
      experience_years: 6,
      skills: ["System Design", "Distributed Systems", "LeetCode/DSA", "Resume Review"],
      bio: "Ex-Amazon, currently building scalable storage infrastructure at Google. Mentored 300+ students into FAANG internships.",
      sessions_taken: 312,
      next_slot: "Tomorrow, 6:00 PM IST",
      category: "Interview Prep"
    },
    {
      id: 2,
      name: "Ananya Deshmukh",
      role: "Engineering Lead & Hackathon Judge",
      company: "Amazon",
      company_logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      rating: 5.0,
      reviews_count: 98,
      experience_years: 7,
      skills: ["Hackathons", "Fullstack", "AWS Architecture", "Pitch Decks"],
      bio: "Lead judge at ETHIndia and SIH. Helping student builders turn hackathon prototypes into funded startups and Amazon PPIs.",
      sessions_taken: 185,
      next_slot: "Saturday, 4:30 PM IST",
      category: "Hackathon Strategy"
    },
    {
      id: 3,
      name: "Vikram Singhania",
      role: "Principal Architect",
      company: "Microsoft",
      company_logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 4.8,
      reviews_count: 110,
      experience_years: 9,
      skills: ["Azure Cloud", "Microservices", "Placement Strategy", "CV Polish"],
      bio: "Passionate educator & engineering leader at Microsoft Azure. Reviewing CVs and preparing students for tech interviews.",
      sessions_taken: 240,
      next_slot: "Today, 8:00 PM IST",
      category: "CV Review"
    },
    {
      id: 4,
      name: "Sneha Mukherjee",
      role: "Staff Engineer (Search & Recommendations)",
      company: "Flipkart",
      company_logo: "https://img.icons8.com/color/512/flipkart.png",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviews_count: 85,
      experience_years: 5,
      skills: ["GRiD Prep", "Competitive Coding", "FastAPI", "High-Throughput Systems"],
      bio: "Flipkart GRiD winner alumni. Guiding students through competitive challenge tracks and fast-track interview rounds.",
      sessions_taken: 160,
      next_slot: "Sunday, 11:00 AM IST",
      category: "Placement Support"
    }
  ];

  const filteredMentors = selectedCategory === "All"
    ? mentors
    : mentors.filter(m => m.category === selectedCategory || m.skills.includes(selectedCategory));

  const handleBookSession = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedMentor(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Unstop Inspired Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-3xl p-6 sm:p-10 text-white shadow-md">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold tracking-wide backdrop-blur-md">
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>1-ON-1 ONLINE MENTORSHIP</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            1-on-1 Online Mentorship in India
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Get personalized guidance, resume audits, and hackathon project strategies from expert engineers and judges at top tier tech companies.
          </p>
        </div>
      </div>

      {/* Category Pills Bar (Unstop screenshot #2) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mentors from Top Companies Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-1">
          Mentors from Top Companies
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Learn directly from engineers who evaluate candidates at these organizations.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
            { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
            { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
            { name: "IBM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
            { name: "Flipkart", logo: "https://img.icons8.com/color/512/flipkart.png" }
          ].map(comp => (
            <div key={comp.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
              <img src={comp.logo} alt={comp.name} className="h-6 object-contain mb-2" />
              <span className="text-xs font-bold text-slate-800">{comp.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Mentors Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">
            Top Rated Mentors Available This Week
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{filteredMentors.length} Verified Mentors</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMentors.map(mentor => (
            <div key={mentor.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <img src={mentor.avatar} alt={mentor.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-xs" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-slate-900">{mentor.name}</h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">{mentor.role}</p>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                        <img src={mentor.company_logo} alt={mentor.company} className="h-3.5 object-contain" />
                        <span>• {mentor.experience_years} yrs exp</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-black text-amber-900 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{mentor.rating}</span>
                    <span className="text-[10px] text-amber-700 font-normal">({mentor.reviews_count})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {mentor.bio}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {mentor.skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Next: {mentor.next_slot}</span>
                </span>

                <button
                  onClick={() => setSelectedMentor(mentor)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Book 1-on-1 Session
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Session Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedMentor(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-slate-900">Mentorship Session Confirmed!</h3>
                <p className="text-xs text-slate-500">
                  Google Meet link and calendar invitation sent for {selectedMentor.next_slot}.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <img src={selectedMentor.avatar} alt={selectedMentor.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{selectedMentor.name}</h3>
                    <p className="text-slate-500 font-semibold">{selectedMentor.role} at {selectedMentor.company}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Session Type</span>
                  <span className="font-bold text-slate-800 text-xs">1-on-1 Strategy & Code / CV Review (45 Mins)</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Problem Statement / Goals</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Reviewing my Smart India Hackathon solution architecture deck and resume..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <button
                  onClick={handleBookSession}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition-colors"
                >
                  Confirm Free Student Mentorship Call
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
