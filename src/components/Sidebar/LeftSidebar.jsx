import { Link } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Bookmark, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function LeftSidebar() {
  const { user, profile } = useAuth();
  const [showMoreRecent, setShowMoreRecent] = useState(false);

  const recentGroups = [
    { name: "React Developers", icon: "⚛️" },
    { name: "UI/UX Design", icon: "🎨" },
    { name: "Tech Startups", icon: "🚀" },
    { name: "Remote Work", icon: "🏠" },
    { name: "AI & Machine Learning", icon: "🤖" },
  ];

  return (
    <aside className="w-[240px] flex-shrink-0">
      <div className="unir-card overflow-hidden unir-card-hover group">
        <div className="h-16 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        </div>
        <div className="px-4 pb-4 -mt-10 relative z-10">
          <Link to="/profile" className="block w-20 h-20 mx-auto transition-transform active:scale-95">
            <img
              src={profile?.profilePictureUrl || user?.avatar || "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"}
              alt="Profile"
              className="w-full h-full rounded-2xl border-4 border-white shadow-md object-cover bg-white"
            />
          </Link>
          <div className="text-center mt-3">
            <Link to="/profile" className="font-bold text-slate-900 hover:text-blue-600 transition-colors block leading-tight">
              {profile ? `${profile.firstName} ${profile.lastName}` : user?.name}
            </Link>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 px-2 leading-relaxed">
              {profile?.headline || user?.headline || "No headline yet"}
            </p>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4">
          <Link to="/profile" className="flex justify-between items-center px-4 py-2 text-[11px] hover:bg-slate-50 transition-colors group/row">
            <span className="text-slate-500 font-medium">Connections</span>
            <span className="text-blue-600 font-bold group-hover/row:scale-110 transition-transform">{profile?.connections?.length || 0}</span>
          </Link>
          <Link to="/profile" className="flex justify-between items-center px-4 py-2 text-[11px] hover:bg-slate-50 transition-colors group/row">
            <span className="text-slate-500 font-medium">Profile Views</span>
            <span className="text-blue-600 font-bold group-hover/row:scale-110 transition-transform">142</span>
          </Link>
        </div>
        <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">My Premium</p>
          <Link to="/premium" className="flex items-center gap-2 text-[11px] font-bold text-slate-700 hover:text-blue-600 transition-colors">
            <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded flex items-center justify-center text-[10px] text-white shadow-sm">
                ★
            </div>
            Access exclusive insights
          </Link>
        </div>
        <div className="border-t border-slate-100 px-4 py-3 bg-white">
          <Link to="/saved" className="flex items-center gap-3 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition-colors group/link">
            <Bookmark className="w-4 h-4 group-hover/link:fill-blue-600 transition-all" /> 
            Saved items
          </Link>
        </div>
      </div>

      <div className="unir-card mt-3 py-3 overflow-hidden">
        <div className="px-4 py-1 mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent</p>
        </div>
        <div className="space-y-1">
            {recentGroups.slice(0, showMoreRecent ? recentGroups.length : 3).map((group, index) => (
              <Link
                key={index}
                to={`/groups/${index}`}
                className="flex items-center gap-3 px-4 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
              >
                <span className="text-sm">{group.icon}</span>
                <span className="truncate">{group.name}</span>
              </Link>
            ))}
        </div>
        <button
          onClick={() => setShowMoreRecent(!showMoreRecent)}
          className="flex items-center justify-center gap-1 mt-2 px-4 py-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 w-full transition-colors rounded-xl mx-auto max-w-[90%]"
        >
          {showMoreRecent ? (
            <>
              Show less <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
        <div className="border-t border-slate-100 mt-2 pt-2">
          <Link
            to="/groups"
            className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Discover communities
          </Link>
        </div>
      </div>
    </aside>
  );
}

