import { Link } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Bookmark, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function LeftSidebar() {
  const { user } = useAuth();
  const [showMoreRecent, setShowMoreRecent] = useState(false);

  const recentGroups = [
    { name: "React Developers", icon: "⚛️" },
    { name: "UI/UX Design", icon: "🎨" },
    { name: "Tech Startups", icon: "🚀" },
    { name: "Remote Work", icon: "🏠" },
    { name: "AI & Machine Learning", icon: "🤖" },
  ];

  return (
    <aside className="w-[225px] flex-shrink-0">
      <div className="unir-card overflow-hidden">
        <div className="h-14 bg-gradient-to-r from-[#0a66c2] to-[#0073b1]" />
        <div className="px-3 pb-3 -mt-8">
          <Link to="/profile">
            <img
              src={user?.avatar}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-white mx-auto"
            />
          </Link>
          <div className="text-center mt-2">
            <Link to="/profile" className="font-semibold text-[rgba(0,0,0,0.9)] hover:underline">
              {user?.name}
            </Link>
            <p className="text-xs text-[rgba(0,0,0,0.6)] mt-0.5 line-clamp-2">{user?.headline}</p>
          </div>
        </div>
        <div className="border-t border-[rgba(0,0,0,0.08)] py-3">
          <Link to="/profile" className="flex justify-between px-3 py-1 text-xs hover:bg-[rgba(0,0,0,0.04)]">
            <span className="text-[rgba(0,0,0,0.6)]">Connections</span>
            <span className="text-[#0a66c2] font-semibold">{user?.connections}</span>
          </Link>
          <Link to="/profile" className="flex justify-between px-3 py-1 text-xs hover:bg-[rgba(0,0,0,0.04)]">
            <span className="text-[rgba(0,0,0,0.6)]">Who viewed your profile</span>
            <span className="text-[#0a66c2] font-semibold">142</span>
          </Link>
        </div>
        <div className="border-t border-[rgba(0,0,0,0.08)] px-3 py-3">
          <p className="text-xs text-[rgba(0,0,0,0.6)]">Access exclusive tools & insights</p>
          <Link to="/premium" className="flex items-center gap-1 mt-1 text-xs font-semibold text-[rgba(0,0,0,0.9)] hover:text-[#0a66c2]">
            <span className="text-amber-600">⬛</span> Try Premium for free
          </Link>
        </div>
        <div className="border-t border-[rgba(0,0,0,0.08)] px-3 py-3">
          <Link to="/saved" className="flex items-center gap-2 text-xs text-[rgba(0,0,0,0.6)] hover:text-[#0a66c2]">
            <Bookmark className="w-4 h-4" /> Saved items
          </Link>
        </div>
      </div>

      <div className="unir-card mt-2 py-2">
        <div className="px-3 py-1">
          <p className="text-xs font-semibold text-[rgba(0,0,0,0.6)]">Recent</p>
        </div>
        {recentGroups.slice(0, showMoreRecent ? recentGroups.length : 3).map((group, index) => (
          <Link
            key={index}
            to={`/groups/${index}`}
            className="flex items-center gap-2 px-3 py-2 text-xs text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]"
          >
            <span>{group.icon}</span>
            <span className="truncate">{group.name}</span>
          </Link>
        ))}
        <button
          onClick={() => setShowMoreRecent(!showMoreRecent)}
          className="flex items-center gap-1 px-3 py-2 text-xs text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)] w-full"
        >
          {showMoreRecent ? (
            <>
              <ChevronUp className="w-4 h-4" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Show more
            </>
          )}
        </button>
        <div className="border-t border-[rgba(0,0,0,0.08)] mt-1 pt-2">
          <Link
            to="/groups"
            className="flex items-center gap-2 px-3 py-2 text-xs text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]"
          >
            <Plus className="w-4 h-4" /> Discover more
          </Link>
        </div>
      </div>
    </aside>
  );
}

