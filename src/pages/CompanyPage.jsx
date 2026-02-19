import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyService, experienceService, aiService } from "@/services/api";
import { Navbar } from "@/components/Navbar/Navbar";
import { Spinner } from "@/components/ui/Spinner";
import { Building2, Globe, MapPin, Briefcase, Plus, Check, User, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/useAuth";

export default function CompanyPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [activeTab, setActiveTab] = useState("Home");
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState(null);

  useEffect(() => {
    if (activeTab === "People" && company && people.length === 0) {
        loadPeople();
    }
  }, [activeTab, company]);

  useEffect(() => {
    if (activeTab === "Jobs" && company && jobs.length === 0 && !loadingJobs) {
      loadJobs();
    }
  }, [activeTab, company]);

  const loadPeople = async () => {
    try {
        setLoadingPeople(true);
        const data = await experienceService.getProfilesByCompany(company.name);
        setPeople(data || []);
    } catch (err) {
        console.error("Failed to load people", err);
    } finally {
        setLoadingPeople(false);
    }
  };

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      setJobsError(null);
      const response = await aiService.searchJobs(company.name);
      setJobs(response?.data || []);
    } catch (err) {
      console.error("Failed to load jobs", err);
      setJobsError("Could not load job listings. Please try again later.");
    } finally {
      setLoadingJobs(false);
    }
  };

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
      <div className="min-h-screen">
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
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-[72px] max-w-[1128px] mx-auto px-4 pb-10">
        
        {/* Banner Image */}
        <div className="h-[200px] w-full rounded-t-xl bg-gray-100 relative overflow-hidden group">
            {company.coverPhotoUrl ? (
                <img 
                    src={company.coverPhotoUrl} 
                    alt={`${company.name} cover`} 
                    className="w-full h-full object-cover object-center"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-700 to-slate-900">
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            )}
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 px-8 pb-8 relative">
           {/* Logo - Overlapping Banner */}
           <div className="-mt-[60px] mb-4 relative z-10 inline-block">
               <div className="w-[120px] h-[120px] bg-white p-1.5 rounded-xl shadow-md border border-gray-100 overflow-hidden">
                   {company.logoUrl ? (
                       <img 
                           src={company.logoUrl} 
                           alt={company.name} 
                           className="w-full h-full object-contain object-center bg-gray-50 rounded-lg" 
                       />
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
               {["Home", "About", "Jobs", "People"].map(tab => (
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

        {/* Example Grid for content */}
        <div className="mt-6">
            {activeTab === "Home" && (
                <div className="flex gap-6">
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
            )}

            {activeTab === "People" && (
                <div className="unir-card p-6 min-h-[400px]">
                    <h2 className="text-xl font-bold mb-6">People</h2>
                    {loadingPeople ? (
                        <div className="flex justify-center py-10"><Spinner /></div>
                    ) : people.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {people.map((person, i) => (
                                <div 
                                    key={person.userId || i} 
                                    className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md hover:border-green-200 transition-all cursor-pointer bg-white group"
                                    onClick={() => navigate(`/profile/view/${person.userId}`)}
                                >
                                    <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-slate-100 group-hover:border-green-100 transition-colors">
                                        <img 
                                            src={person.profilePictureUrl || "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"} 
                                            className="w-full h-full object-cover" 
                                            alt={person.firstName} 
                                        />
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{person.firstName} {person.lastName}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{person.headline || "Member"}</p>
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                await import("@/services/api").then(m => m.networkService.sendConnectionRequest(person.userId));
                                                alert("Connection request sent!");
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to send request");
                                            }
                                        }}
                                        className="mt-3 text-xs font-semibold text-green-600 border border-green-600 rounded-full px-4 py-1 hover:bg-green-50 transition w-full"
                                    >
                                        Connect
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-10 text-gray-500">
                             <User className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                             <p>No people found linked to this company yet.</p>
                         </div>
                    )}
                </div>
            )}

            {activeTab === "Jobs" && (
              <div className="unir-card p-6 min-h-[400px]">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Jobs at {company.name}
                </h2>
                {loadingJobs ? (
                  <div className="flex justify-center py-10"><Spinner /></div>
                ) : jobsError ? (
                  <div className="text-center py-10">
                    <p className="text-red-500 text-sm mb-3">{jobsError}</p>
                    <button
                      onClick={loadJobs}
                      className="text-sm font-semibold text-blue-600 border border-blue-600 rounded-full px-4 py-1.5 hover:bg-blue-50 transition"
                    >
                      Retry
                    </button>
                  </div>
                ) : jobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobs.map((job, i) => (
                      <div
                        key={i}
                        className="border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all bg-white group flex flex-col gap-2"
                      >
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                          {job.title}
                        </h3>
                        {job.snippet && (
                          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{job.snippet}</p>
                        )}
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-600 rounded-full px-3 py-1 hover:bg-blue-50 transition w-fit"
                        >
                          <ExternalLink className="w-3 h-3" /> View Job
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No job listings found for {company.name}.</p>
                  </div>
                )}
              </div>
            )}

        </div>


      </div>
    </div>
  );
}
