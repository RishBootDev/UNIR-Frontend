import { Navbar } from "@/components/Navbar/Navbar";
import { Users, UserPlus, Search, UserCheck, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { networkService, profileService } from "@/services/api";
import { Spinner } from "@/components/ui/Spinner";
import { useNavigate } from "react-router-dom";

export default function NetworkPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("network"); // network, invitations, find
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "network") {
        const data = await networkService.getMyConnections();
        if (data && data.length > 0) {
            // Enrich with profile data
            const enriched = await Promise.all(data.map(async (p) => {
                try {
                    const profile = await profileService.getProfileById(p.userId);
                    return { 
                        ...p, 
                        ...profile, 
                        // Prioritize profile data but keep fallback if needed
                        firstName: profile.firstName,
                        lastName: profile.lastName, 
                        headline: profile.headline || "Member",
                        profilePictureUrl: profile.profilePictureUrl
                    };
                } catch (e) {
                    console.error(`Failed to enrich connection ${p.userId}`, e);
                    // Attempt to split name if profile fetch fails, or just return p
                    const names = (p.name || "").split(" ");
                    return { 
                        ...p, 
                        firstName: names[0] || "Unknown", 
                        lastName: names.slice(1).join(" ") || "",
                        headline: "Member" 
                    };
                }
            }));
            setConnections(enriched);
        } else {
            setConnections([]);
        }
      } else if (activeTab === "invitations") {
        const data = await networkService.getIncomingRequests();
        if (data && data.length > 0) {
           const enriched = await Promise.all(data.map(async (p) => {
                try {
                    const profile = await profileService.getProfileById(p.userId);
                    return { 
                        ...p, 
                        ...profile,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        headline: profile.headline || "Member",
                        profilePictureUrl: profile.profilePictureUrl
                    };
                } catch (e) {
                    console.error(`Failed to enrich request ${p.userId}`, e);
                    const names = (p.name || "").split(" ");
                    return { 
                        ...p, 
                        firstName: names[0] || "Unknown", 
                        lastName: names.slice(1).join(" ") || "",
                        headline: "Member" 
                    };
                }
            }));
            setRequests(enriched);
        } else {
             setRequests([]);
        }
      }
    } catch (err) {
      console.error("Failed to load network data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await profileService.getProfilesByName(searchQuery);
      setSearchResults(results || []);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
        setLoading(false);
    }
  };

  const handleAccept = async (senderId) => {
    try {
      await networkService.acceptRequest(senderId);
      setRequests(prev => prev.filter(req => req.userId !== senderId));
      // Optionally show toast
    } catch (err) {
      console.error("Failed to accept", err);
    }
  };

  const handleReject = async (senderId) => {
    try {
      await networkService.rejectRequest(senderId);
      setRequests(prev => prev.filter(req => req.userId !== senderId));
    } catch (err) {
      console.error("Failed to reject", err);
    }
  };

  const handleConnect = async (userId) => {
      try {
          await networkService.sendConnectionRequest(userId);
          alert("Connection request sent!");
      } catch (err) {
          console.error("Failed to connect", err);
          alert("Failed to send request");
      }
  };

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />
      <div className="pt-[72px] max-w-[1128px] mx-auto px-4 pb-10">
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-[250px] flex-shrink-0">
            <div className="unir-card overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Manage my network</h2>
                </div>
                <nav className="flex flex-col">
                    <button 
                        onClick={() => setActiveTab("network")}
                        className={`flex items-center justify-between px-6 py-4 transition-colors ${activeTab === "network" ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <span className="flex items-center gap-3"><Users className="w-5 h-5" /> Connections</span>
                        <span className="text-sm font-bold text-gray-500">{connections.length || ""}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab("invitations")}
                        className={`flex items-center justify-between px-6 py-4 transition-colors ${activeTab === "invitations" ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <span className="flex items-center gap-3"><UserPlus className="w-5 h-5" /> Invitations</span>
                        {requests.length > 0 && (
                            <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">{requests.length}</span>
                        )}
                    </button>
                    <button 
                         onClick={() => setActiveTab("find")}
                         className={`flex items-center justify-between px-6 py-4 transition-colors ${activeTab === "find" ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <span className="flex items-center gap-3"><Search className="w-5 h-5" /> Find People</span>
                    </button>
                </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="unir-card p-6 min-h-[500px]">
                
                {/* === MY CONNECTIONS TAB === */}
                {activeTab === "network" && (
                    <>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            My Connections <span className="text-gray-400 font-normal text-lg">({connections.length})</span>
                        </h2>
                        {loading ? <div className="flex justify-center p-10"><Spinner /></div> : (
                            connections.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {connections.map((person) => (
                                        <div key={person.userId} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                            <img 
                                                src={person.profilePictureUrl || "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"} 
                                                className="w-16 h-16 rounded-full object-cover border border-gray-100"
                                                alt={person.firstName}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate hover:underline cursor-pointer" onClick={() => navigate(`/profile/view/${person.userId}`)}>
                                                    {person.firstName} {person.lastName}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">{person.headline || "Member"}</p>
                                                <p className="text-xs text-gray-400 mt-1">Connected just now</p>
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <span className="sr-only">Options</span>
                                                •••
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-500">
                                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-lg">No connections yet</p>
                                    <button onClick={() => setActiveTab("find")} className="mt-4 text-blue-600 font-bold hover:underline">Find people to connect with</button>
                                </div>
                            )
                        )}
                    </>
                )}

                {/* === INVITATIONS TAB === */}
                {activeTab === "invitations" && (
                    <>
                        <h2 className="text-xl font-bold mb-6">Pending Invitations</h2>
                        {loading ? <div className="flex justify-center p-10"><Spinner /></div> : (
                            requests.length > 0 ? (
                                <div className="space-y-4">
                                    {requests.map((req) => (
                                        <div key={req.userId} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={req.profilePictureUrl || "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"} 
                                                    className="w-16 h-16 rounded-full object-cover"
                                                    alt={req.firstName}
                                                />
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg hover:underline cursor-pointer" onClick={() => navigate(`/profile/view/${req.userId}`)}>
                                                        {req.firstName} {req.lastName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{req.headline || "Member"}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Sent you a request</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleReject(req.userId)}
                                                    className="px-6 py-2 font-semibold text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                                                >
                                                    Ignore
                                                </button>
                                                <button 
                                                    onClick={() => handleAccept(req.userId)}
                                                    className="px-6 py-2 font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-500">
                                    <UserCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-lg">No pending invitations</p>
                                </div>
                            )
                        )}
                    </>
                )}

                {/* === FIND PEOPLE TAB === */}
                {activeTab === "find" && (
                    <>
                        <h2 className="text-xl font-bold mb-6">Find People</h2>
                        <form onSubmit={handleSearch} className="mb-8">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Search by name..." 
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors">
                                    Search
                                </button>
                            </div>
                        </form>

                        {loading ? <div className="flex justify-center p-10"><Spinner /></div> : (
                            searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                     {searchResults.map((person) => (
                                        <div key={person.userId} className="border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow relative group">
                                            <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-gray-50">
                                                <img 
                                                    src={person.profilePictureUrl || "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"} 
                                                    className="w-full h-full object-cover" 
                                                    alt={person.firstName}
                                                />
                                            </div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/profile/view/${person.userId}`)}>
                                                {person.firstName} {person.lastName}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{person.headline || "Member"}</p>
                                            
                                            <button 
                                                onClick={() => handleConnect(person.userId)}
                                                className="mt-4 w-full py-1.5 border border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors text-sm"
                                            >
                                                Connect
                                            </button>
                                        </div>
                                     ))}
                                </div>
                            ) : searchQuery && (
                                <div className="text-center py-10 text-gray-500">
                                    <p>No results found for "{searchQuery}"</p>
                                </div>
                            )
                        )}
                    </>
                )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
