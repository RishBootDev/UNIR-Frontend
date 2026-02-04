import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { X } from "lucide-react";
import UNIR_LOGO from "@/assets/UNIR_logo.jpeg";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      const from = location.state?.from?.pathname || "/feed";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-lg text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-8 animate-in slide-in-from-bottom-4 duration-500">
                <img src={UNIR_LOGO} alt="UNIR" className="w-8 h-8 rounded-lg" />
                <span className="text-white font-bold tracking-tight">UNIR Professional Network</span>
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6 animate-in slide-in-from-bottom-6 duration-700">
                Welcome to your <span className="text-blue-400">Professional</span> Community
            </h1>
            <p className="text-lg text-slate-300 mb-10 animate-in slide-in-from-bottom-8 duration-900">
                Connect with colleagues, share your expertise, and discover your next big opportunity.
            </p>
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-1000">
                {[
                    { count: "50k+", label: "Professionals" },
                    { count: "12k+", label: "Companies" }
                ].map(stat => (
                    <div key={stat.label} className="p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
                        <p className="text-3xl font-black text-white">{stat.count}</p>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center justify-center mb-12">
                 <img src={UNIR_LOGO} alt="UNIR" className="w-12 h-12 rounded-xl shadow-lg" />
            </div>
            
            <div className="bg-white lg:bg-transparent rounded-[2.5rem] p-8 lg:p-0">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Sign In</h2>
                <p className="text-slate-500 mt-2 font-medium">Stay updated on your professional world</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 animate-in shake-in duration-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="unir-input !py-3.5 !px-5 text-base"
                    required
                  />
                </div>
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                    <button type="button" className="text-xs font-bold text-blue-600 hover:underline">Forgot?</button>
                  </div>
                  <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="unir-input !py-3.5 !px-5 text-base"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                    >
                        {showPassword ? <X className="w-5 h-5" /> : <X className="w-5 h-5 rotate-45" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="unir-btn-primary w-full !py-4 !rounded-2xl text-lg mt-8"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                    </span>
                  ) : "Sign in to UNIR"}
                </button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-50 lg:bg-white text-slate-400 font-bold uppercase tracking-widest">or</span>
                </div>
              </div>

              <button className="unir-btn-secondary w-full !py-4 !rounded-2xl flex items-center justify-center gap-3 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <p className="text-center mt-10 text-slate-500 font-medium">
                New to UNIR?{" "}
                <Link to="/register" className="text-blue-600 font-extrabold hover:underline">
                  Join now
                </Link>
              </p>
            </div>
        </div>

        {/* Floating Footer */}
        <footer className="absolute bottom-6 left-0 right-0 text-center px-6">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <a href="#" className="hover:text-blue-600 transition-colors">User Agreement</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Community Guidelines</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a>
                <div className="flex items-center gap-1">
                    <img src={UNIR_LOGO} alt="UNIR" className="w-3 h-3 grayscale opacity-50" />
                    <span>UNIR © 2024</span>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}

