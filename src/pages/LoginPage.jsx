import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
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
    <div className="min-h-screen bg-[#f3f2ef]">
      <header className="py-4 px-6">
        <Link to="/" className="flex items-center gap-1">
          <img src={UNIR_LOGO} alt="UNIR" className="w-[34px] h-[34px] object-contain" />
          <span className="text-unir-blue text-2xl font-bold">UNIR</span>
        </Link>
      </header>
      <main className="max-w-[352px] mx-auto pt-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-semibold text-unir-text mb-1">Sign in</h1>
          <p className="text-sm text-unir-text-secondary mb-6">Stay updated on your professional world</p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or Phone"
                className="w-full px-3 py-3 border border-unir-text-secondary rounded text-unir-text placeholder:text-unir-text-secondary focus:outline-none focus:border-unir-blue focus:border-2"
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-3 border border-unir-text-secondary rounded text-unir-text placeholder:text-unir-text-secondary focus:outline-none focus:border-unir-blue focus:border-2"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-unir-blue font-semibold text-sm hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {/* <Link to="/forgot-password" className="block text-unir-blue font-semibold text-sm hover:underline">
              Forgot password?
            </Link> */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-unir-blue text-white font-semibold rounded-full hover:bg-unir-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="flex items-center gap-2 my-6">
            <div className="flex-1 h-px bg-[rgba(0,0,0,0.15)]" />
            <span className="text-sm text-unir-text-secondary">or</span>
            <div className="flex-1 h-px bg-[rgba(0,0,0,0.15)]" />
          </div>
          <div className="space-y-3">
            <button className="w-full py-3 border border-unir-text-secondary rounded-full font-semibold text-unir-text-secondary hover:bg-[rgba(0,0,0,0.04)] hover:border-black flex items-center justify-center gap-2 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <button className="w-full py-3 border border-unir-text-secondary rounded-full font-semibold text-unir-text-secondary hover:bg-[rgba(0,0,0,0.04)] hover:border-black flex items-center justify-center gap-2 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
              Sign in with Apple
            </button>
          </div>
        </div>
        <p className="text-center mt-6 text-unir-text">
          New to UNIR?{" "}
          <Link to="/register" className="text-unir-blue font-semibold hover:underline">
            Join now
          </Link>
        </p>
      </main>
      <footer className="mt-12 pb-6 text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-unir-text-secondary mb-2">
          <img src={UNIR_LOGO} alt="UNIR" className="w-3.5 h-3.5 object-contain" />
          UNIR Corporation © 2024
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-unir-text-secondary">
          <a href="#" className="hover:text-unir-blue">
            User Agreement
          </a>
          <a href="#" className="hover:text-unir-blue">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-unir-blue">
            Community Guidelines
          </a>
          <a href="#" className="hover:text-unir-blue">
            Cookie Policy
          </a>
          <a href="#" className="hover:text-unir-blue">
            Copyright Policy
          </a>
        </div>
      </footer>
    </div>
  );
}

