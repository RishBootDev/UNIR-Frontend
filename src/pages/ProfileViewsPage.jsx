import { useEffect, useState } from "react";
import { User, ArrowLeft } from "lucide-react";
import { profileService } from "@/services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Navbar } from "@/components/Navbar/Navbar";

export default function ProfileViewsPage() {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            loadViewers();
        }
    }, [user?.id]);

    const loadViewers = async () => {
        setLoading(true);
        try {
            // Get the list of viewers first
            const viewsData = await profileService.getProfileViews(user.id);
            const viewers = viewsData.viewedBy || [];

            if (viewers.length > 0) {
                // Fetch profile for each viewer
                const uniqueViewerIds = [...new Set(viewers.map(v => v.id))];
                
                const profilePromises = uniqueViewerIds.map(id => 
                    profileService.getProfileById(id)
                        .then(p => ({ ...p, time: viewers.find(v => v.id === id)?.viewedAt }))
                        .catch(() => null)
                );
                
                const results = await Promise.all(profilePromises);
                setProfiles(results.filter(p => p !== null));
            } else {
                setProfiles([]);
            }
        } catch (err) {
            console.error("Failed to load viewer profiles", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F2EF]">
            <Navbar />
            <main className="pt-20 pb-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-2 hover:bg-white rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900">Who viewed your profile</h1>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Loading...</div>
                        ) : profiles.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {profiles.map((profile) => (
                                    <div 
                                        key={profile.userId} 
                                        className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <Link to={`/profile/view/${profile.userId}`} className="shrink-0">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200">
                                                {profile.profilePictureUrl ? (
                                                    <img src={profile.profilePictureUrl} alt={profile.firstName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                        <User className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link 
                                                to={`/profile/view/${profile.userId}`}
                                                className="font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors truncate block"
                                            >
                                                {profile.firstName} {profile.lastName}
                                            </Link>
                                            <p className="text-sm text-slate-500 truncate">{profile.headline || "No headline"}</p>
                                            <p className="text-xs text-slate-400 mt-1">{profile.location}</p>
                                        </div>
                                        <Link 
                                            to={`/profile/view/${profile.userId}`}
                                            className="px-4 py-2 bg-white border border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors text-sm"
                                        >
                                            View Profile
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">No profile views yet</h3>
                                <p className="text-slate-500 mt-2">When someone views your profile, they'll appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
