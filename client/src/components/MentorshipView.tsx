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
      company_logo: "/logos/flipkart.svg",
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
    <div className="space-y-6 animate-in fade-in select-none">
      
      {/* Clean Header (Removed bright blue banner as requested) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            1-on-1 Mentorship & Mock Interviews
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalized guidance, resume audits, and hackathon strategies directly from verified engineers at top tech companies.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold self-start sm:self-auto border border-slate-200">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Verified Industry Mentors</span>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mentors from Top Companies Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 mb-1">
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
            { name: "Flipkart", logo: "/logos/flipkart.svg" }
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
          <h3 className="text-sm font-extrabold text-slate-900">
            Top Rated Mentors Available This Week
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{filteredMentors.length} Verified Mentors</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMentors.map(mentor => (
            <div key={mentor.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-all">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <img src={mentor.avatar} alt={mentor.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-xs" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-slate-900">{mentor.name}</h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">{mentor.role}</p>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <img src={mentor.company_logo} alt={mentor.company} className="h-3.5 object-contain" />
                        <span>• {mentor.experience_years} yrs exp</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{mentor.rating}</span>
                    <span className="text-amber-600 text-[10px]">({mentor.reviews_count})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {mentor.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.skills.map((skill: string) => (
                    <span key={skill} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Next: <strong className="text-slate-800">{mentor.next_slot}</strong></span>
                </div>

                <button
                  onClick={() => setSelectedMentor(mentor)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Book Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 text-xs">
            <button
              onClick={() => setSelectedMentor(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Session Confirmed!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Google Meet link and preparation checklist sent to your registered email for your session with {selectedMentor.name}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <img src={selectedMentor.avatar} alt={selectedMentor.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Book Mentorship with {selectedMentor.name}</h3>
                    <p className="text-xs text-slate-500">{selectedMentor.role} at {selectedMentor.company}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Select Session Topic</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-blue-500 text-xs">
                    <option>Technical Resume & GitHub Review (30 mins)</option>
                    <option>Mock Coding & System Design Interview (45 mins)</option>
                    <option>Hackathon Idea Validation & Tech Stack Choice (30 mins)</option>
                    <option>Placement & Off-Campus Hiring Strategy (45 mins)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Available Slot</label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-bold flex items-center justify-between">
                    <span>{selectedMentor.next_slot}</span>
                    <span className="text-[11px] text-blue-700 font-semibold">100% Free for Students</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Notes or Specific Questions (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="E.g., I'm preparing for upcoming SDE interviews / SIH hardware round..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <button
                  onClick={handleBookSession}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer mt-2"
                >
                  Confirm Free Mentorship Slot
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
