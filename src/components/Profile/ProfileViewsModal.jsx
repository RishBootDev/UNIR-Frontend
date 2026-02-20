import { useEffect, useState } from "react"; // Removed unused X import
import { X, User } from "lucide-react"; // Import X here
import { profileService, networkService } from "@/services/api";
import { useNavigate } from "react-router-dom";

export function ProfileViewsModal({ isOpen, onClose, viewers }) {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && viewers && viewers.length > 0) {
            loadViewersDetails();
        } else {
            setProfiles([]);
            setLoading(false);
        }
    }, [isOpen, viewers]);

    const loadViewersDetails = async () => {
        setLoading(true);
        try {
            // Fetch profile for each viewer
            // Note: In a real app we'd want a bulk fetch endpoint.
            // Here we do parallel individual fetches.
            const uniqueViewerIds = [...new Set(viewers.map(v => v.id))];
            
            const profilePromises = uniqueViewerIds.map(id => 
                profileService.getProfileById(id)
                    .then(p => ({ ...p, time: viewers.find(v => v.id === id)?.viewedAt })) // Attach view time if available, though backend didn't return it in the simplified map. backend returned {id, Isblur}
                    .catch(() => null)
            );
            
            const results = await Promise.all(profilePromises);
            setProfiles(results.filter(p => p !== null));
        } catch (err) {
            console.error("Failed to load viewer profiles", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Who viewed your profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Loading...</div>
                    ) : profiles.length > 0 ? (
                        profiles.map((profile) => (
                            <div 
                                key={profile.userId} 
                                onClick={() => {
                                    onClose();
                                    navigate(`/profile/view/${profile.userId}`);
                                }}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                                    {profile.profilePictureUrl ? (
                                        <img src={profile.profilePictureUrl} alt={profile.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                            <User className="w-6 h-6 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                        {profile.firstName} {profile.lastName}
                                    </h3>
                                    <p className="text-xs text-slate-500 truncate">{profile.headline || "No headline"}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{profile.location}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-sm text-slate-500">No profile views yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
