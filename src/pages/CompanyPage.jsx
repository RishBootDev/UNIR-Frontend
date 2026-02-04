import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyService } from "@/services/api";
import { Navbar } from "@/components/Navbar/Navbar";
import { Spinner } from "@/components/ui/Spinner";
import { Building2, Globe, MapPin, Briefcase, Plus, Check } from "lucide-react";
import { useAuth } from "@/context/useAuth";

export default function CompanyPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (name) {
      loadCompany();
    }
  }, [name]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      // API returns a list. we try to find exact match or take the first one.
      const results = await companyService.search(name);
      
      if (!results || results.length === 0) {
        setError("Company not found");
        return;
      }

      // Try to find exact case-insensitive match
      const exactMatch = results.find(c => c.name.toLowerCase() === name.toLowerCase());
      setCompany(exactMatch || results[0]);
    } catch (err) {
      console.error("Failed to load company", err);
      setError("Failed to load company details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#f3f2ef]">
        <Navbar />
        <div className="pt-[80px] max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Company Not Found</h1>
            <p className="text-gray-500 mt-2">We couldn't find a company named "{name}".</p>
            <button onClick={() => navigate('/feed')} className="mt-4 unir-btn-primary">Go to Feed</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      <div className="pt-[72px] max-w-[1128px] mx-auto px-4 pb-10">
        
        {/* Banner Image (Placeholder) */}
        <div className="h-[200px] w-full rounded-t-xl bg-gradient-to-r from-slate-700 to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 px-8 pb-8 relative">
           {/* Logo - Overlapping Banner */}
           <div className="-mt-[60px] mb-4 relative z-10 inline-block">
               <div className="w-[120px] h-[120px] bg-white p-2 rounded-xl shadow-md border border-gray-100">
                   {company.logoUrl ? (
                       <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                   ) : (
                       <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-lg">
                           <Building2 className="w-12 h-12 text-gray-300" />
                       </div>
                   )}
               </div>
           </div>

           <div className="flex justify-between items-start">
               <div>
                   <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                   <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                       {company.industry && (
                           <>
                             <span className="font-medium">{company.industry}</span>
                             <span className="text-gray-300">•</span>
                           </>
                       )}
                       {company.location && (
                           <span className="flex items-center gap-1 text-gray-500">
                               <MapPin className="w-4 h-4" /> {company.location}
                           </span>
                       )}
                       {company.website && (
                            <>
                             <span className="text-gray-300">•</span>
                             <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                                 <Globe className="w-4 h-4" /> Website
                             </a>
                            </>
                       )}
                   </div>
                   <p className="mt-4 text-sm text-gray-500 max-w-2xl">
                       {/* Description Placeholder if not provided */}
                       Leading the way in {company.industry || "innovation"}. Follow us for updates, career opportunities, and more.
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
               <button className="py-3 text-sm font-semibold text-green-600 border-b-2 border-green-600">Home</button>
               <button className="py-3 text-sm font-semibold text-gray-500 hover:text-gray-800">About</button>
               <button className="py-3 text-sm font-semibold text-gray-500 hover:text-gray-800">Jobs</button>
               <button className="py-3 text-sm font-semibold text-gray-500 hover:text-gray-800">People</button>
           </div>
        </div>

        {/* Example Grid for content */}
        <div className="flex gap-6 mt-6">
            <div className="flex-1">
                <div className="unir-card p-6 mb-4">
                    <h2 className="text-xl font-bold mb-4">About</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {company.name} is a company in the {company.industry || "Non-specified"} industry. 
                        We are committed to excellence and innovation.
                    </p>
                </div>
                <div className="unir-card p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Updates</h2>
                    <p className="text-gray-500 italic text-sm">No recent updates posted.</p>
                </div>
            </div>
            
            <div className="w-[300px]">
                <div className="unir-card p-4">
                    <h3 className="font-semibold mb-2">Similar Companies</h3>
                    {/* Placeholder */}
                    <p className="text-xs text-gray-500">Suggestions unavailable.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
