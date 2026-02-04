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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Visual Side - Consistent with Login */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-8">
                <img src={UNIR_LOGO} alt="UNIR" className="w-8 h-8 rounded-lg" />
                <span className="text-white font-bold tracking-tight">Join the Network</span>
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
                Build your <span className="text-indigo-400">Professional</span> future today.
            </h1>
            <p className="text-lg text-slate-300 mb-10">
                Join thousands of professionals who are already growing their careers on UNIR.
            </p>
            <div className="space-y-4">
                {[
                    "Discover new opportunities",
                    "Connect with industry leaders",
                    "Showcase your expertise"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/80 font-medium">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        </div>
                        {item}
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10">
             <div className="lg:hidden flex items-center justify-center mb-10">
                 <img src={UNIR_LOGO} alt="UNIR" className="w-12 h-12 rounded-xl shadow-lg" />
            </div>

            <div className="bg-white lg:bg-transparent rounded-[2.5rem] p-8 lg:p-0">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        {[1, 2].map(s => (
                            <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step >= s ? "w-8 bg-blue-600" : "w-4 bg-slate-200"}`} />
                        ))}
                    </div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        {step === 1 ? "Create Account" : "Final Details"}
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">
                        {step === 1 ? "Start your journey with us" : "Tell us a bit about yourself"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {step === 1 ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="name@example.com"
                                    className="unir-input !py-3.5 !px-5 text-base"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Min. 6 characters"
                                    className="unir-input !py-3.5 !px-5 text-base"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed px-1">
                                By joining, you agree to our <a href="#" className="text-blue-600 font-bold hover:underline">User Agreement</a>, <a href="#" className="text-blue-600 font-bold hover:underline">Privacy Policy</a>, and <a href="#" className="text-blue-600 font-bold hover:underline">Cookie Policy</a>.
                            </p>
                            <button
                                type="submit"
                                className="unir-btn-primary w-full !py-4 !rounded-2xl text-lg mt-4"
                            >
                                Agree & Continue
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="John"
                                        className="unir-input !py-3.5 !px-5 text-base"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Doe"
                                        className="unir-input !py-3.5 !px-5 text-base"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="unir-btn-secondary flex-1 !py-4 !rounded-2xl"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="unir-btn-primary flex-[2] !py-4 !rounded-2xl"
                                >
                                    {loading ? "Creating..." : "Finish Setup"}
                                </button>
                            </div>
                        </>
                    )}
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
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 font-extrabold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>

            {/* Floating Footer */}
            <footer className="absolute bottom-6 left-0 right-0 text-center px-6 hidden lg:block">
                <div className="flex justify-center gap-x-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <a href="#" className="hover:text-blue-600 transition-colors">User Agreement</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a>
                    <span>UNIR © 2024</span>
                </div>
            </footer>
        </div>
      </div>
    </div>
  );
}

