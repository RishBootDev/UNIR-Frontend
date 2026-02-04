import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
import UNIR_LOGO from "@/assets/UNIR_logo.jpeg";

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileMenuRef = useRef(null);
  const businessMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (businessMenuRef.current && !businessMenuRef.current.contains(event.target)) {
        setShowBusinessMenu(false);
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
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-[rgba(0,0,0,0.08)] z-50">
      <div className="max-w-[1128px] mx-auto px-4 h-[52px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/feed" className="flex items-center" onClick={closeMenus}>
            <img src={UNIR_LOGO} alt="UNIR" className="w-[34px] h-[34px] object-contain" />
          </Link>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.6)]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[280px] h-[34px] bg-[#eef3f8] rounded pl-9 pr-3 text-sm placeholder:text-[rgba(0,0,0,0.6)] focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenus}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-3 py-1 min-w-[80px] h-[52px] border-b-2 transition-colors ${
                  isActive
                    ? "border-black text-black"
                    : "border-transparent text-[rgba(0,0,0,0.6)] hover:text-black"
                }`
              }
              end
            >
              <item.icon className="w-6 h-6" strokeWidth={1.5} />
              <span className="text-xs mt-0.5">{item.label}</span>
            </NavLink>
          ))}

          <div className="h-[52px] w-px bg-[rgba(0,0,0,0.08)] mx-1" />

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex flex-col items-center justify-center px-3 py-1 min-w-[80px] h-[52px] text-[rgba(0,0,0,0.6)] hover:text-black transition-colors"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src={
                    profile?.profilePictureUrl ||
                    user?.avatar ||
                    "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs mt-0.5 flex items-center">
                Me <ChevronDown className="w-3 h-3 ml-0.5" />
              </span>
            </button>
            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-0 w-[280px] bg-white rounded-lg shadow-lg border border-[rgba(0,0,0,0.08)] overflow-hidden">
                <div className="p-4 border-b border-[rgba(0,0,0,0.08)]">
                  <div className="flex gap-3">
                    <img
                      src={
                        profile?.profilePictureUrl ||
                        user?.avatar ||
                        "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"
                      }
                      alt="Profile"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-[rgba(0,0,0,0.9)]">
                        {profile ? `${profile.firstName} ${profile.lastName}` : user?.name}
                      </h4>
                      <p className="text-sm text-[rgba(0,0,0,0.6)]">
                         {profile?.headline || user?.headline || "No headline yet"}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block mt-3 w-full text-center py-1 border border-[#0a66c2] text-[#0a66c2] rounded-full text-sm font-semibold hover:bg-[#e7f3ff] transition-colors"
                    onClick={closeMenus}
                  >
                    View Profile
                  </Link>
                </div>
                <div className="py-2">
                  <p className="px-4 py-1 text-sm font-semibold text-[rgba(0,0,0,0.9)]">Account</p>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]"
                  >
                    Settings & Privacy
                  </Link>
                  <Link
                    to="/help"
                    className="block px-4 py-2 text-sm text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]"
                  >
                    Help
                  </Link>
                  <Link
                    to="/language"
                    className="block px-4 py-2 text-sm text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]"
                  >
                    Language
                  </Link>
                </div>
                <div className="py-2 border-t border-[rgba(0,0,0,0.08)]">
                  <p className="px-4 py-1 text-sm font-semibold text-[rgba(0,0,0,0.9)]">Manage</p>
                  <Link
                    to="/posts"
                    className="block px-4 py-2 text-sm text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]"
                  >
                    Posts & Activity
                  </Link>
                  <Link
                    to="/job-posting"
                    className="block px-4 py-2 text-sm text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]"
                  >
                    Job Posting Account
                  </Link>
                </div>
                <div className="py-2 border-t border-[rgba(0,0,0,0.08)]">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)]"
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

