import { Info, ChevronDown } from "lucide-react";
import { useState } from "react";

export function RightSidebar() {
  const [showAllNews, setShowAllNews] = useState(false);

  const newsItems = [
    { title: "Tech layoffs continue in 2024", readers: "12,543", time: "2h ago" },
    { title: "AI regulations proposed by EU", readers: "8,721", time: "4h ago" },
    { title: "Remote work trends shifting", readers: "6,234", time: "5h ago" },
    { title: "Startup funding rebounds Q1", readers: "4,892", time: "6h ago" },
    { title: "New JavaScript framework released", readers: "3,156", time: "8h ago" },
  ];

  const suggestions = [
    {
      name: "Sarah Chen",
      headline: "Product Manager at Google",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      mutual: 12,
    },
    {
      name: "Michael Torres",
      headline: "Engineering Lead at Meta",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      mutual: 8,
    },
    {
      name: "Emily Watson",
      headline: "Senior Designer at Apple",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      mutual: 5,
    },
  ];

  return (
    <aside className="w-[300px] flex-shrink-0">
      <div className="unir-card p-5 unir-card-hover">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 tracking-tight">UNIR Spotlight</h3>
          <Info className="w-4 h-4 text-slate-400 cursor-help hover:text-blue-500 transition-colors" />
        </div>
        <ul className="space-y-3">
          {newsItems.slice(0, showAllNews ? newsItems.length : 3).map((item, index) => (
            <li key={index} className="group/news">
              <a href="#" className="block py-1 hover:bg-slate-50 transition-colors rounded-xl -mx-2 px-2">
                <p className="text-sm font-bold text-slate-700 leading-tight group-hover/news:text-blue-600 transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md">{item.time}</span>
                    <span className="text-[10px] text-slate-400 font-medium">• {item.readers} readers</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowAllNews(!showAllNews)}
          className="flex items-center justify-center gap-1 mt-4 text-[11px] font-bold text-blue-600 hover:bg-blue-50 w-full py-2 rounded-xl transition-all"
        >
          {showAllNews ? "View less stories" : "View more stories"}{" "}
          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showAllNews ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="unir-card mt-3 p-5 unir-card-hover">
        <h3 className="font-bold text-slate-800 tracking-tight mb-4">Expand your network</h3>
        <div className="space-y-5">
          {suggestions.map((person, index) => (
            <div key={index} className="flex gap-3 group/person">
              <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-transparent group-hover/person:ring-blue-100 transition-all shadow-sm" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 truncate leading-tight">{person.name}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{person.headline}</p>
                <div className="flex items-center gap-1 mt-1">
                    <div className="flex -space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-blue-100 border border-white" />
                        <div className="w-3 h-3 rounded-full bg-indigo-100 border border-white" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{person.mutual} mutual connections</p>
                </div>
                <button className="mt-2 flex items-center justify-center gap-1 w-full py-1.5 text-xs font-bold text-blue-600 border-2 border-blue-50 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 shadow-sm shadow-blue-500/5">
                  <span className="text-sm leading-none">+</span> Connect
                </button>
              </div>
            </div>
          ))}
        </div>
        <a href="#" className="block mt-5 text-[11px] font-bold text-center text-slate-500 hover:text-blue-600 transition-colors py-2 border-t border-slate-50">
          See all suggestions Manager
        </a>
      </div>

      <div className="mt-4 px-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[rgba(0,0,0,0.6)]">
          <a href="#" className="hover:text-[#0a66c2] hover:underline">About</a>
          <a href="#" className="hover:text-[#0a66c2] hover:underline">Accessibility</a>
          <a href="#" className="hover:text-[#0a66c2] hover:underline">Help Center</a>
          <a href="#" className="hover:text-[#0a66c2] hover:underline">Privacy & Terms</a>
          <a href="#" className="hover:text-[#0a66c2] hover:underline">Ad Choices</a>
          <a href="#" className="hover:text-[#0a66c2] hover:underline">Advertising</a>
          <a href="#" className="hover:text-[#0a66c2] hover:underline">Business Services</a>
        </div>
        <div className="flex items-center gap-1 mt-3 text-xs text-[rgba(0,0,0,0.6)]">
          <div className="w-[16px] h-[16px] bg-[#0a66c2] rounded flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">U</span>
          </div>
          UNIR Corporation © 2024
        </div>
      </div>
    </aside>
  );
}

