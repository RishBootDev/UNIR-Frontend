import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { institutionService, educationService } from "@/services/api";
import { Navbar } from "@/components/Navbar/Navbar";
import { Spinner } from "@/components/ui/Spinner";
import { GraduationCap, Globe, MapPin, School, Plus, Check } from "lucide-react";
import { useAuth } from "@/context/useAuth";

export default function InstitutionPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [alumni, setAlumni] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(false);

  useEffect(() => {
    if (activeTab === "Alumni" && institution && alumni.length === 0) {
        loadAlumni();
    }
  }, [activeTab, institution]);

  const loadAlumni = async () => {
      try {
          setLoadingAlumni(true);
          const data = await educationService.getProfilesByInstitute(institution.name);
          setAlumni(data || []);
      } catch (err) {
          console.error("Failed to load alumni", err);
      } finally {
          setLoadingAlumni(false);
      }
  };

  useEffect(() => {
    if (name) {
      loadInstitution();
    }
  }, [name]);

  const loadInstitution = async () => {
    try {
      setLoading(true);
      setError(null);
      // API returns a list. we try to find exact match or take the first one.
      const results = await institutionService.search(name);
      
      if (!results || results.length === 0) {
        setError("Institution not found");
        return;
      }

      // Try to find exact case-insensitive match
      const exactMatch = results.find(i => i.name.toLowerCase() === name.toLowerCase());
      setInstitution(exactMatch || results[0]);
    } catch (err) {
      console.error("Failed to load institution", err);
      setError("Failed to load institution details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  if (error || !institution) {
    return (
      <div className="min-h-screen bg-[#f3f2ef]">
        <Navbar />
        <div className="pt-[80px] max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Institution Not Found</h1>
            <p className="text-gray-500 mt-2">We couldn't find an institution named "{name}".</p>
            <button onClick={() => navigate('/feed')} className="mt-4 unir-btn-primary">Go to Feed</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      <div className="pt-[72px] max-w-[1128px] mx-auto px-4 pb-10">
        
        {/* Banner Image */}
        <div className="h-[200px] w-full rounded-t-xl bg-gradient-to-r from-amber-700 to-orange-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 px-8 pb-8 relative">
           {/* Logo - Overlapping Banner */}
           <div className="-mt-[60px] mb-4 relative z-10 inline-block">
               <div className="w-[120px] h-[120px] bg-white p-2 rounded-xl shadow-md border border-gray-100">
                   {institution.logoUrl ? (
                       <img src={institution.logoUrl} alt={institution.name} className="w-full h-full object-contain" />
                   ) : (
                       <div className="w-full h-full bg-orange-50 flex items-center justify-center rounded-lg">
                           <School className="w-12 h-12 text-orange-300" />
                       </div>
                   )}
               </div>
           </div>

           <div className="flex justify-between items-start">
               <div>
                   <h1 className="text-3xl font-bold text-gray-900">{institution.name}</h1>
                   <div className="flex items-center gap-3 mt-2 text-gray-600 text-sm">
                       <span className="font-medium bg-orange-50 text-orange-700 px-2 py-0.5 rounded">Higher Education</span>
                       {(institution.city || institution.country) && (
                           <>
                             <span className="text-gray-300">•</span>
                             <span className="flex items-center gap-1 text-gray-500">
                               <MapPin className="w-4 h-4" /> 
                               {[institution.city, institution.country].filter(Boolean).join(", ")}
                             </span>
                           </>
                       )}
                       {institution.websiteUrl && (
                            <>
                             <span className="text-gray-300">•</span>
                             <a href={institution.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                                 <Globe className="w-4 h-4" /> Website
                             </a>
                            </>
                       )}
                   </div>
                   <p className="mt-4 text-sm text-gray-500 max-w-2xl">
                       A premier institution dedicated to learning and research. Connect with alumni, students, and faculty.
                   </p>
               </div>
               
               <div className="flex gap-2">
                   <button 
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`flex items-center gap-2 px-6 py-1.5 rounded-full font-semibold border transition-all ${isFollowing ? 'border-gray-400 text-gray-600 hover:bg-gray-50' : 'bg-blue-600 border-transparent text-white hover:bg-blue-700'}`}
                   >
                       {isFollowing ? <><Check className="w-5 h-5" /> Following</> : <><Plus className="w-5 h-5" /> Follow</>}
                   </button>
                   <button className="px-6 py-1.5 rounded-full font-semibold border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all">
                       Visit website
                   </button>
               </div>
           </div>



           {/* Tabs */}
           <div className="flex gap-8 mt-8 border-b border-gray-200">
               {["Home", "About", "Alumni", "Jobs"].map(tab => (
                   <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-800'}`}
                   >
                       {tab}
                   </button>
               ))}
           </div>
        </div>

        {/* Content Grid */}
        <div className="mt-6">
            {activeTab === "Home" && (
                <div className="flex gap-6">
                    <div className="flex-1">
                        <div className="unir-card p-6 mb-4">
                            <h2 className="text-xl font-bold mb-4">About</h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {institution.name} is located in {[institution.city, institution.country].filter(Boolean).join(", ")}. 
                                We offer a wide range of undergraduate and postgraduate programs.
                            </p>
                        </div>
                    </div>
                     <div className="w-[300px]">
                        <div className="unir-card p-4">
                            <h3 className="font-semibold mb-2">Pages people view</h3>
                            <p className="text-xs text-gray-500">Suggestions unavailable.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Alumni" && (
                <div className="unir-card p-6 min-h-[400px]">
                    <h2 className="text-xl font-bold mb-6">Alumni</h2>
                    {loadingAlumni ? (
                        <div className="flex justify-center py-10"><Spinner /></div>
                    ) : alumni.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {alumni.map((alum, i) => (
                                <div 
                                    key={alum.userId || i} 
                                    className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md hover:border-green-200 transition-all cursor-pointer bg-white group"
                                    onClick={() => navigate(`/profile/view/${alum.userId}`)}
                                >
                                    <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-slate-100 group-hover:border-green-100 transition-colors">
                                        <img 
                                            src={alum.profilePictureUrl || "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"} 
                                            className="w-full h-full object-cover" 
                                            alt={alum.firstName} 
                                        />
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{alum.firstName} {alum.lastName}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{alum.headline || "Alumni"}</p>
                                    
                                    <button className="mt-3 text-xs font-semibold text-green-600 border border-green-600 rounded-full px-4 py-1 hover:bg-green-50 transition w-full">Connect</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-10 text-gray-500">
                             <School className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                             <p>No alumni found for this institution yet.</p>
                         </div>
                    )}
                </div>
            )}
            
            {/* ... Other tabs ... */}
        </div>

      </div>
    </div>
  );
}
