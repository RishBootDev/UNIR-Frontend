import { Info, Newspaper, RefreshCw, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { networkService, profileService } from "@/services/api";
import { getTopNews } from "@/services/aiService";
import { useAuth } from "@/context/useAuth";

export function RightSidebar() {
  const { profile } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState(new Set());

  // Top News state
  const [newsText, setNewsText] = useState(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  // Fetch AI Top News on mount using user's profile headline as the field
  useEffect(() => {
    const fetchNews = async () => {
      const field = profile?.industry || "Technology";
      setNewsLoading(true);
      setNewsError(null);
      try {
        const res = await getTopNews(field);
        setNewsText(res?.data || res);
      } catch (err) {
        setNewsError("Could not load news.");
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, [profile?.industry]);

  const handleRefreshNews = async () => {
    const field = profile?.industry || "Technology";
    setNewsLoading(true);
    setNewsError(null);
    try {
      const res = await getTopNews(field);
      setNewsText(res?.data || res);
    } catch (err) {
      setNewsError("Could not load news.");
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await networkService.getSecondDegreeConnections();
        // Limit to 3 for the sidebar view
        const limitedData = (data || []).slice(0, 3);
        
        // Fetch full profile for each person to get avatar and headline
        const enrichedSuggestions = await Promise.all(
            limitedData.map(async (person) => {
                try {
                    const profile = await profileService.getProfileById(person.userId);
                    return {
                        id: person.userId,
                        name: `${profile.firstName} ${profile.lastName}`,
                        headline: profile.headline || "Member",
                        avatar: profile.profilePictureUrl || "https://cdn-icons-png.flaticon.com/512/3602/3602145.png",
                        mutual: 0 
                    };
                } catch (e) {
                    // Fallback if profile fetch fails
                    console.error(`Failed to fetch profile for user ${person.userId}`, e);
                    return {
                        id: person.userId,
                        name: person.name || "Unknown User", // Person entity has name
                        headline: "Member",
                        avatar: "https://cdn-icons-png.flaticon.com/512/3602/3602145.png",
                        mutual: 0
                    };
                }
            })
        );

        setSuggestions(enrichedSuggestions);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleConnect = async (userId) => {
    try {
      setSentRequests(prev => new Set(prev).add(userId));
      await networkService.sendConnectionRequest(userId);
    } catch (err) {
      console.error("Failed to send request:", err);
      // Revert if failed
      setSentRequests(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <aside className="w-[300px] flex-shrink-0">
      {/* UNIR Top News – AI powered, free for all users */}
      <div className="unir-card p-5 unir-card-hover">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-slate-800 tracking-tight">UNIR Spotlight</h3>
          </div>
          <button
            onClick={handleRefreshNews}
            disabled={newsLoading}
            title="Refresh news"
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-orange-500 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {newsLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-2 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : newsError ? (
          <p className="text-xs text-slate-400 text-center py-4">{newsError}</p>
        ) : Array.isArray(newsText) && newsText.length > 0 ? (
          <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {newsText.map((item, i) => (
              <li key={i} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                <p className="text-[12px] font-semibold text-slate-800 leading-snug">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1">
                  {item.source && (
                    <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md">
                      {item.source}
                    </span>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 hover:underline inline-block transition-colors"
                    >
                      Read more →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No news available.</p>
        )}

        <p className="mt-3 text-[10px] text-slate-400 italic">
          AI-curated for: {profile?.industry || "Technology"}
        </p>
      </div>

      <div className="unir-card mt-3 p-5 unir-card-hover">
        <h3 className="font-bold text-slate-800 tracking-tight mb-4">Expand your network</h3>
        
        {loading ? (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-3 bg-slate-100 rounded w-3/4" />
                            <div className="h-2 bg-slate-100 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        ) : suggestions.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
                No new suggestions right now.
            </div>
        ) : (
            <div className="space-y-5">
            {suggestions.map((person) => {
                const isSent = sentRequests.has(person.id);
                return (
                    <div key={person.id} className="flex gap-3 group/person">
                    <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-transparent group-hover/person:ring-blue-100 transition-all shadow-sm" />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800 truncate leading-tight">{person.name}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{person.headline}</p>
                        
                        {/* Only show mutuals if > 0 */}
                        {person.mutual > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                                <div className="flex -space-x-1.5">
                                    <div className="w-3 h-3 rounded-full bg-blue-100 border border-white" />
                                    <div className="w-3 h-3 rounded-full bg-indigo-100 border border-white" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">{person.mutual} mutual connections</p>
                            </div>
                        )}

                        <button 
                            onClick={() => !isSent && handleConnect(person.id)}
                            disabled={isSent}
                            className={`mt-2 flex items-center justify-center gap-1 w-full py-1.5 text-xs font-bold border-2 rounded-xl transition-all shadow-sm
                                ${isSent 
                                    ? "bg-green-50 text-green-600 border-green-50 cursor-default" 
                                    : "text-blue-600 border-blue-50 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95 shadow-blue-500/5"
                                }`}
                        >
                        {isSent ? (
                            <>
                                <Check className="w-3 h-3" /> Sent
                            </>
                        ) : (
                            <>
                                <span className="text-sm leading-none">+</span> Connect
                            </>
                        )}
                        </button>
                    </div>
                    </div>
                );
            })}
            </div>
        )}

        <a href="#" className="block mt-5 text-[11px] font-bold text-center text-slate-500 hover:text-blue-600 transition-colors py-2 border-t border-slate-50">
          See all suggestions
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

