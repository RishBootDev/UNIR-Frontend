import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Search,
  Grid3X3,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { companyService, institutionService } from "@/services/api";
import UNIR_LOGO from "@/assets/UNIR_logo.jpeg";

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate(); // Add navigate
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ companies: [], institutions: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const profileMenuRef = useRef(null);
  const businessMenuRef = useRef(null);
  const searchRef = useRef(null); // Ref for search container

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
        if (searchQuery.length < 2) {
            setSearchResults({ companies: [], institutions: [] });
            return;
        }

        setIsSearching(true);
        try {
            const [companies, institutions] = await Promise.all([
                companyService.search(searchQuery).catch(() => []), 
                institutionService.search(searchQuery).catch(() => [])
            ]);
            setSearchResults({ companies: companies || [], institutions: institutions || [] });
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (type, name) => {
      setShowResults(false);
      setSearchQuery(""); // Optional: clear search on navigation
      if (type === 'company') navigate(`/company/${encodeURIComponent(name)}`);
      if (type === 'institution') navigate(`/institution/${encodeURIComponent(name)}`);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (businessMenuRef.current && !businessMenuRef.current.contains(event.target)) {
        setShowBusinessMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = useMemo(
    () => [
      { to: "/feed", icon: Home, label: "Home" },
      { to: "/network", icon: Users, label: "My Network" },
      { to: "/jobs", icon: Briefcase, label: "Jobs" },
      { to: "/messaging", icon: MessageSquare, label: "Messaging" },
      { to: "/notifications", icon: Bell, label: "Notifications" },
    ],
    []
  );

  const closeMenus = () => {
    setShowProfileMenu(false);
    setShowBusinessMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 unir-glass z-[100] border-b border-slate-200/50">
      <div className="max-w-[1128px] mx-auto px-4 h-[64px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/feed" className="flex items-center group transition-transform active:scale-95" onClick={closeMenus}>
            <div className="p-1 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <img src={UNIR_LOGO} alt="UNIR" className="w-[32px] h-[32px] object-contain" />
            </div>
          </Link>
          <div className="relative group" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search companies, institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              className="w-[280px] h-[40px] bg-slate-100/80 rounded-xl pl-10 pr-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:w-[320px] focus:shadow-sm border border-transparent focus:border-blue-200 transition-all duration-300"
            />
            {/* Search Results Dropdown */}
            {showResults && searchQuery.length > 1 && (
                <div className="absolute top-full left-0 mt-2 w-[320px] bg-white rounded-xl shadow-xl border border-slate-100 max-h-[400px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
                    {isSearching ? (
                        <div className="p-4 text-center text-slate-500 text-sm">Searching...</div>
                    ) : (
                        <>
                            {searchResults.companies.length > 0 && (
                                <div className="py-2">
                                    <h4 className="px-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Companies</h4>
                                    {searchResults.companies.map((c, i) => (
                                        <div 
                                            key={`comp-${i}`} 
                                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                                            onClick={() => handleResultClick('company', c.name)}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                                                {c.logoUrl ? <img src={c.logoUrl} className="w-full h-full object-contain rounded-lg" /> : <Briefcase size={16} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-slate-700 truncate">{c.name}</div>
                                                <div className="text-xs text-slate-400 truncate">{c.industry || "Company"}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchResults.institutions.length > 0 && (
                                <div className="py-2 border-t border-slate-100">
                                    <h4 className="px-4 pb-2 pt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Institutions</h4>
                                    {searchResults.institutions.map((inst, i) => (
                                        <div 
                                            key={`inst-${i}`} 
                                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                                            onClick={() => handleResultClick('institution', inst.name)}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100 text-orange-400">
                                                {inst.logoUrl ? <img src={inst.logoUrl} className="w-full h-full object-contain rounded-lg" /> : <span className="text-xs font-bold">Edu</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-slate-700 truncate">{inst.name}</div>
                                                <div className="text-xs text-slate-400 truncate">{inst.city ? `${inst.city}, ${inst.country}` : "Institution"}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchResults.companies.length === 0 && searchResults.institutions.length === 0 && (
                                <div className="p-8 text-center">
                                    <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                        <Search className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm text-slate-500">No results found for "{searchQuery}"</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
          </div>
        </div>

        <div className="flex items-center h-full">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenus}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-4 h-full relative group transition-all ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-900"
                }`
              }
              end
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 group-active:scale-90`} strokeWidth={1.8} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              <div className="absolute bottom-0 left-4 right-4 h-1 rounded-t-full bg-blue-600 scale-x-0 group-[.active]:scale-x-100 transition-transform origin-center" />
            </NavLink>
          ))}

          <div className="h-8 w-px bg-slate-200 mx-2" />

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex flex-col items-center justify-center px-4 h-full text-slate-500 hover:text-slate-900 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-blue-400 p-0.5 transition-all overflow-hidden bg-slate-100">
                <img
                  src={
                    profile?.profilePictureUrl ||
                    user?.avatar ||
                    "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[10px] mt-0.5 font-medium flex items-center">
                Me <ChevronDown className="w-3 h-3 ml-0.5 group-hover:translate-y-0.5 transition-transform" />
              </span>
            </button>
            {showProfileMenu && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-[300px] bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex gap-4">
                    <img
                      src={
                        profile?.profilePictureUrl ||
                        user?.avatar ||
                        "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"
                      }
                      alt="Profile"
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">
                        {profile ? `${profile.firstName} ${profile.lastName}` : user?.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                         {profile?.headline || user?.headline || "No headline yet"}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block mt-4 w-full text-center py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
                    onClick={closeMenus}
                  >
                    View Full Profile
                  </Link>
                </div>
                <div className="p-2">
                  <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account</p>
                  {[
                    { to: "/settings", label: "Settings & Privacy" },
                    { to: "/help", label: "Help & Support" },
                    { to: "/language", label: "Language Preferences" }
                  ].map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                      onClick={closeMenus}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={businessMenuRef}>
            <button
              onClick={() => setShowBusinessMenu(!showBusinessMenu)}
              className="flex flex-col items-center justify-center px-3 py-1 min-w-[80px] h-[52px] text-[rgba(0,0,0,0.6)] hover:text-black transition-colors"
            >
              <Grid3X3 className="w-6 h-6" strokeWidth={1.5} />
              <span className="text-xs mt-0.5 flex items-center">
                For Business <ChevronDown className="w-3 h-3 ml-0.5" />
              </span>
            </button>
            {showBusinessMenu && (
              <div className="absolute top-full right-0 mt-0 w-[320px] bg-white rounded-lg shadow-lg border border-[rgba(0,0,0,0.08)] p-4">
                <h3 className="font-semibold mb-3 text-[rgba(0,0,0,0.9)]">
                  Visit More UNIR Products
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "Learning", icon: "📚" },
                    { name: "Talent", icon: "👥" },
                    { name: "Sales", icon: "📊" },
                    { name: "Marketing", icon: "📢" },
                    { name: "Hiring", icon: "💼" },
                    { name: "Admin", icon: "⚙️" },
                  ].map((product) => (
                    <div
                      key={product.name}
                      className="flex flex-col items-center p-2 rounded hover:bg-[rgba(0,0,0,0.04)] cursor-pointer"
                    >
                      <span className="text-2xl mb-1">{product.icon}</span>
                      <span className="text-xs text-[rgba(0,0,0,0.6)]">{product.name}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.08)]">
                  <h4 className="font-semibold text-sm mb-2 text-[rgba(0,0,0,0.9)]">
                    UNIR Business Services
                  </h4>
                  <p className="text-xs text-[rgba(0,0,0,0.6)]">
                    Grow and nurture your network on UNIR
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

