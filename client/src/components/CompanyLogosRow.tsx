import React from "react";
import { ArrowRight, Users, CheckCircle2 } from "lucide-react";

interface CompanyLogosRowProps {
  onExploreMentorship: () => void;
}

export const CompanyLogosRow: React.FC<CompanyLogosRowProps> = ({
  onExploreMentorship,
}) => {
  const companies = [
    {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
      mentorsCount: "120+ Mentors",
      tag: "Tech & AI",
    },
    {
      name: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      mentorsCount: "95+ Mentors",
      tag: "Cloud & SDE",
    },
    {
      name: "Microsoft",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
      mentorsCount: "80+ Mentors",
      tag: "Systems & DSA",
    },
    {
      name: "IBM",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
      mentorsCount: "60+ Mentors",
      tag: "Enterprise AI",
    },
    {
      name: "Flipkart",
      logo: "https://img.icons8.com/color/512/flipkart.png",
      mentorsCount: "75+ Mentors",
      tag: "E-Commerce",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Mentors & Partners from Top Companies</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Get 1-on-1 guidance, resume reviews, and hackathon project strategy from leaders at top tier tech firms.
          </p>
        </div>

        <button
          onClick={onExploreMentorship}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
        >
          <span>Explore All Mentors</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        {companies.map((comp) => (
          <div
            key={comp.name}
            onClick={onExploreMentorship}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
          >
            <div className="h-9 flex items-center justify-center mb-2">
              <img
                src={comp.logo}
                alt={comp.name}
                className="max-h-7 max-w-[90px] object-contain grayscale group-hover:grayscale-0 transition-all"
              />
            </div>
            <span className="text-xs font-black text-slate-800 group-hover:text-blue-600">
              {comp.name}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
              {comp.mentorsCount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
