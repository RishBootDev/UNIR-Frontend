import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import UNIR_LOGO from "@/assets/UNIR_logo.jpeg";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(`${formData.firstName} ${formData.lastName}`.trim(), formData.email, formData.password);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <header className="py-4 px-6">
        <Link to="/" className="flex items-center gap-1">
          <img src={UNIR_LOGO} alt="UNIR" className="w-[34px] h-[34px] object-contain" />
          <span className="text-[#0a66c2] text-2xl font-bold">UNIR</span>
        </Link>
      </header>
      <main className="max-w-[400px] mx-auto pt-8 px-4">
        <h1 className="text-3xl text-[rgba(0,0,0,0.9)] mb-2">Make the most of your professional life</h1>
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm text-[rgba(0,0,0,0.6)] mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[rgba(0,0,0,0.6)] rounded text-[rgba(0,0,0,0.9)] focus:outline-none focus:border-[#0a66c2] focus:border-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[rgba(0,0,0,0.6)] mb-1">Password (6+ characters)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-[rgba(0,0,0,0.6)] rounded text-[rgba(0,0,0,0.9)] focus:outline-none focus:border-[#0a66c2] focus:border-2"
                    minLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-[rgba(0,0,0,0.6)]">
                  By clicking Agree & Join or Continue, you agree to the UNIR{" "}
                  <a href="#" className="text-[#0a66c2] hover:underline">
                    User Agreement
                  </a>
                  ,{" "}
                  <a href="#" className="text-[#0a66c2] hover:underline">
                    Privacy Policy
                  </a>
                  , and{" "}
                  <a href="#" className="text-[#0a66c2] hover:underline">
                    Cookie Policy
                  </a>
                  .
                </p>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0a66c2] text-white font-semibold rounded-full hover:bg-[#004182] transition-colors"
                >
                  Agree & Join
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-[rgba(0,0,0,0.6)] mb-1">First name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-[rgba(0,0,0,0.6)] rounded text-[rgba(0,0,0,0.9)] focus:outline-none focus:border-[#0a66c2] focus:border-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[rgba(0,0,0,0.6)] mb-1">Last name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-[rgba(0,0,0,0.6)] rounded text-[rgba(0,0,0,0.9)] focus:outline-none focus:border-[#0a66c2] focus:border-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0a66c2] text-white font-semibold rounded-full hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Creating account..." : "Continue"}
                </button>
              </>
            )}
          </form>
          <div className="flex items-center gap-2 my-6">
            <div className="flex-1 h-px bg-[rgba(0,0,0,0.15)]" />
            <span className="text-sm text-[rgba(0,0,0,0.6)]">or</span>
            <div className="flex-1 h-px bg-[rgba(0,0,0,0.15)]" />
          </div>
          <div className="space-y-3">
            <button className="w-full py-3 border border-[rgba(0,0,0,0.6)] rounded-full font-semibold text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)] hover:border-black flex items-center justify-center gap-2 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
        <p className="text-center mt-6 text-[rgba(0,0,0,0.9)]">
          Already on UNIR?{" "}
          <Link to="/login" className="text-[#0a66c2] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </main>
      <footer className="mt-12 pb-6 text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.6)] mb-2">
          <img src={UNIR_LOGO} alt="UNIR" className="w-[14px] h-[14px] object-contain" />
          UNIR Corporation © 2024
        </div>
      </footer>
    </div>
  );
}

