import { Link } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Bookmark, Plus, Zap, ChevronDown, ChevronUp, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { postsService, profileService, networkService, subscriptionService } from "@/services/api";

export function LeftSidebar() {
  const { user, profile } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [profileViews, setProfileViews] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user?.id) {
        setLoading(true);
        postsService.getUserPosts(user.id, { page: 0, size: 5 })
            .then(data => {
                setUserPosts(data.content || []);
            })
            .catch(err => console.error("Failed to load sidebar posts", err))
            .finally(() => setLoading(false));

        // Fetch cover image
        profileService.getProfileCoverImage()
            .then(data => setCoverImage(data.url))
            .catch(() => {});

        // Fetch connections count
        networkService.getMyConnections()
            .then(data => setConnectionsCount(Array.isArray(data) ? data.length : 0))
            .catch(() => {});

        // Fetch profile views count
        profileService.getProfileViews(user.id)
            .then(data => {
                setProfileViews(data.viewCount || 0);
            })
            .catch(err => console.error("Failed to load profile views", err));

        // Check subscription status
        subscriptionService.getStatus(user.id)
            .then(data => {
                if (data && data.active) {
                    setIsPremium(true);
                }
            })
            .catch(() => {});
    }
  }, [user?.id]);

  return (
    <aside className="w-[240px] flex-shrink-0">
      <div className="unir-card relative unir-card-hover group">
        {/* Premium Crown - Floating on Top Left Corner */}
        {isPremium && (
            <div className="absolute -top-4 -left-4 z-50 transform -rotate-[30deg] filter drop-shadow-md">
                <div className="bg-gradient-to-br from-yellow-100 to-white p-2 rounded-full border-2 border-yellow-300 shadow-sm">
                    <Crown className="w-8 h-8 text-yellow-600 fill-yellow-500" strokeWidth={2.5} />
                </div>
            </div>
        )}

        <div className="h-16 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden rounded-t-2xl">
            {coverImage && (
                <img 
                    src={coverImage} 
                    alt="Cover" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[0px]" />
        </div>
        <div className="px-4 pb-4 -mt-10 relative z-10">
          <Link to="/profile" className="block w-20 h-20 mx-auto transition-transform active:scale-95 relative">
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
            <span className="text-blue-600 font-bold group-hover/row:scale-110 transition-transform">{connectionsCount}</span>
          </Link>
          <Link to="/profile/views" className="flex justify-between items-center px-4 py-2 text-[11px] hover:bg-slate-50 transition-colors group/row">
            <span className="text-slate-500 font-medium">Profile Views</span>
            <span className="text-blue-600 font-bold group-hover/row:scale-110 transition-transform">{profileViews}</span>
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
        <div className="px-4 py-1 mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Recent Posts</p>
          <Link to="/profile" className="text-slate-400 hover:text-blue-600 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="space-y-1">
            {loading ? (
                <div className="px-4 py-2 text-center">
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                </div>
            ) : userPosts.length > 0 ? (
                userPosts.slice(0, showAllActivity ? 5 : 3).map((post) => (
                    <div key={post.id} className="px-4 py-2 hover:bg-slate-50 cursor-pointer group/item transition-colors">
                        <p className="text-[11px] font-medium text-slate-600 line-clamp-2 group-hover/item:text-blue-600 transition-colors leading-relaxed">
                            {post.content}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>{new Date(post.createdAt + (post.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <span>{post.likes || 0} likes</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="px-4 py-3 text-center">
                    <p className="text-[11px] text-slate-400 italic">No posts yet</p>
                    <Link to="/profile" className="block mt-1 text-[10px] font-bold text-blue-600 hover:underline">Create your first post</Link>
                </div>
            )}
        </div>

        {userPosts.length > 3 && (
            <button
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="flex items-center justify-center gap-1 mt-2 px-4 py-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 w-full transition-colors rounded-xl mx-auto max-w-[90%]"
            >
                {showAllActivity ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                ) : (
                    <>Show more <ChevronDown className="w-3 h-3" /></>
                )}
            </button>
        )}

        <div className="border-t border-slate-100 mt-2 pt-2">
          <Link
            to="/profile"
            className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            Show all activity
          </Link>
        </div>
      </div>
    </aside>
  );
}

