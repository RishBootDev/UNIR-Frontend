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
      <div className="unir-card p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-[rgba(0,0,0,0.9)]">UNIR News</h3>
          <Info className="w-4 h-4 text-[rgba(0,0,0,0.6)]" />
        </div>
        <ul className="space-y-1">
          {newsItems.slice(0, showAllNews ? newsItems.length : 3).map((item, index) => (
            <li key={index}>
              <a href="#" className="block py-1 hover:bg-[rgba(0,0,0,0.04)] -mx-3 px-3">
                <p className="text-sm font-semibold text-[rgba(0,0,0,0.9)] leading-tight">
                  {item.title}
                </p>
                <p className="text-xs text-[rgba(0,0,0,0.6)] mt-0.5">
                  {item.time} • {item.readers} readers
                </p>
              </a>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowAllNews(!showAllNews)}
          className="flex items-center gap-1 mt-2 text-sm text-[rgba(0,0,0,0.6)] hover:text-[#0a66c2]"
        >
          {showAllNews ? "Show less" : "Show more"}{" "}
          <ChevronDown className={`w-4 h-4 transition-transform ${showAllNews ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="unir-card mt-2 p-3">
        <h3 className="font-semibold text-[rgba(0,0,0,0.9)] mb-3">Add to your feed</h3>
        <div className="space-y-3">
          {suggestions.map((person, index) => (
            <div key={index} className="flex gap-2">
              <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[rgba(0,0,0,0.9)] truncate">{person.name}</p>
                <p className="text-xs text-[rgba(0,0,0,0.6)] truncate">{person.headline}</p>
                <p className="text-xs text-[rgba(0,0,0,0.6)]">{person.mutual} mutual connections</p>
                <button className="mt-1 flex items-center gap-1 px-3 py-1 text-sm font-semibold text-[rgba(0,0,0,0.6)] border border-[rgba(0,0,0,0.6)] rounded-full hover:bg-[rgba(0,0,0,0.04)] hover:border-black hover:text-black transition-colors">
                  <span className="text-lg leading-none">+</span> Follow
                </button>
              </div>
            </div>
          ))}
        </div>
        <a href="#" className="block mt-3 text-sm text-[rgba(0,0,0,0.6)] hover:text-[#0a66c2]">
          View all recommendations →
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

