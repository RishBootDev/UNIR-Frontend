import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar/Navbar";
import { useAuth } from "@/context/useAuth";
import {
  Sparkles, Upload, FileText, Newspaper, BrainCircuit, ClipboardCheck,
  UserCheck, Send, X, ChevronRight, Bot, User, Loader2, AlertTriangle,
  Crown, MessageCircle, Star, ArrowLeft, Paperclip, Trash2, Zap, Info
} from "lucide-react";
import {
  analyzeFile, generateCaption, getTopNews, generateInterviewQuestions,
  reviewAnswers, getProfileScore, connectAstraChat,
} from "@/services/aiService";

const GHOST_AVATAR = "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png";

/* ─────────── Premium Gate Card ─────────── */
function PremiumGate() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-200/50">
        <Crown className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-3">Premium Feature</h2>
      <p className="text-slate-500 max-w-md mb-6 leading-relaxed">
        Astra AI is exclusively available for Premium members. Upgrade now to unlock
        AI-powered profile analysis, interview prep, caption generation, and more.
      </p>
      <button
        onClick={() => navigate("/premium")}
        className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-base hover:shadow-xl hover:shadow-amber-200/40 transition-all hover:-translate-y-0.5 active:scale-95"
      >
        Upgrade to Premium
      </button>
    </div>
  );
}

/* ─────────── Feature Card ─────────── */
function FeatureCard({ icon: Icon, title, description, gradient, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative p-6 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/60 hover:border-transparent text-left transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${gradient}`} />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow group-hover:scale-110 transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-bold text-slate-900 group-hover:text-white text-lg mb-2 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 group-hover:text-white/80 leading-relaxed transition-colors">{description}</p>
      </div>
      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
    </button>
  );
}

/* ─────────── File Drop Zone ─────────── */
function FileDropZone({ onFileSelect, acceptedTypes, file, onRemove }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  }, [onFileSelect]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
        dragOver
          ? "border-blue-400 bg-blue-50/80 scale-[1.01]"
          : file
          ? "border-green-300 bg-green-50/50"
          : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50"
      }`}
    >
      {file ? (
        <div className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 truncate">{file.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={onRemove} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-8 flex flex-col items-center gap-3 text-center cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Upload className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">Click to upload or drag & drop</p>
            <p className="text-xs text-slate-400 mt-1">{acceptedTypes || "PDF, DOC, Images (max 50MB)"}</p>
          </div>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes || ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"}
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); }}
      />
    </div>
  );
}

/* ─────────── Result Display ─────────── */
function ResultDisplay({ data, type }) {
  if (!data) return null;

  if (type === "profile-analysis" && data?.content) {
    const c = data.content;
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {c.profile_strengths?.length > 0 && (
          <Section title="💪 Profile Strengths" items={c.profile_strengths} color="green" />
        )}
        {c.profile_gaps?.length > 0 && (
          <Section title="⚠️ Profile Gaps" items={c.profile_gaps} color="amber" />
        )}
        {c.headline_optimization?.length > 0 && (
          <Section title="📝 Headline Optimization" items={c.headline_optimization} color="blue" />
        )}
        {c.about_section_optimization?.length > 0 && (
          <Section title="📋 About Section" items={c.about_section_optimization} color="purple" />
        )}
        {c.skills_optimization?.length > 0 && (
          <Section title="🛠️ Skills Optimization" items={c.skills_optimization} color="indigo" />
        )}
        {c.experience_optimization?.length > 0 && (
          <Section title="💼 Experience Tips" items={c.experience_optimization} color="cyan" />
        )}
        {c.recruiter_view && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-2">👁️ Recruiter's View</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{c.recruiter_view}</p>
          </div>
        )}
        {c.action_steps?.length > 0 && (
          <Section title="🚀 Action Steps" items={c.action_steps} color="emerald" numbered />
        )}
      </div>
    );
  }

  if (type === "caption" && data?.content) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-500" /> Generated Caption
          </h4>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{data.content.caption}</p>
          {data.content.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {data.content.hashtags.map((tag, i) => (
                <span key={i} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(data.content.caption + "\n\n" + (data.content.hashtags || []).map(t => t.startsWith("#") ? t : `#${t}`).join(" ")); }}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          📋 Copy to clipboard
        </button>
      </div>
    );
  }

  if (type === "news") {
    return (
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-orange-500" /> Top News Summary
        </h4>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
        </div>
      </div>
    );
  }

  if (type === "interview") {
    return (
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-violet-500" /> Interview Questions
        </h4>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
        </div>
      </div>
    );
  }

  if (type === "review") {
    return (
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-teal-500" /> Answer Review
        </h4>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
        </div>
      </div>
    );
  }

  if (type === "profile-score" && data?.content) {
    const c = data.content;
    return (
      <div className="space-y-5 animate-in fade-in duration-500">
        <div className="flex items-center gap-6 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={c.score >= 75 ? "#22c55e" : c.score >= 50 ? "#eab308" : "#ef4444"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(c.score / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{c.score}</span>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-800">Profile Score</h4>
            <p className="text-sm text-slate-500 mt-1">
              {c.score >= 75 ? "Excellent! Your profile stands out." : c.score >= 50 ? "Good, but room for improvement." : "Needs significant improvement."}
            </p>
          </div>
        </div>
        {c.strengths?.length > 0 && <Section title="💪 Strengths" items={c.strengths} color="green" />}
        {c.improvements?.length > 0 && <Section title="🔧 Improvements" items={c.improvements} color="amber" />}
        {c.suggestions?.length > 0 && <Section title="💡 Suggestions" items={c.suggestions} color="blue" numbered />}
      </div>
    );
  }

  // Fallback
  return (
    <div className="p-5 bg-white rounded-xl border border-slate-200 animate-in fade-in duration-500">
      <pre className="text-sm text-slate-700 whitespace-pre-wrap overflow-auto">
        {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/* ─────────── Section ─────────── */
function Section({ title, items, color, numbered }) {
  const colors = {
    green: "bg-green-50 border-green-200 text-green-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
    cyan: "bg-cyan-50 border-cyan-200 text-cyan-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    teal: "bg-teal-50 border-teal-200 text-teal-800",
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[color] || colors.blue}`}>
      <h4 className="font-bold mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
            {numbered ? (
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold">{i + 1}</span>
            ) : (
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60" />
            )}
            <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FEATURE VIEWS
   ═══════════════════════════════════════════════════ */

/* ─────────── Profile Analyzer ─────────── */
function ProfileAnalyzerView({ onBack }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeFile(file, msg);
      setResult(res?.data || res);
    } catch (err) {
      if (err.code === "PREMIUM_REQUIRED") setError("premium");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeatureViewLayout
      onBack={onBack}
      title="Profile Analyzer"
      subtitle="Upload your resume or profile for LinkedIn optimization insights"
      icon={UserCheck}
      gradient="from-blue-500 to-indigo-600"
    >
      {error === "premium" ? (
        <PremiumGate />
      ) : (
        <div className="space-y-5">
          <FileDropZone file={file} onFileSelect={setFile} onRemove={() => setFile(null)} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Additional question (optional)</label>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="e.g. How can I optimize for data science roles?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>
          {error && error !== "premium" && <ErrorBar message={error} />}
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Sparkles className="w-5 h-5" /> Analyze Profile</>}
          </button>
          {result && <ResultDisplay data={result} type="profile-analysis" />}
        </div>
      )}
    </FeatureViewLayout>
  );
}

/* ─────────── Caption Generator ─────────── */
function CaptionGeneratorView({ onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateCaption(file);
      setResult(res?.data || res);
    } catch (err) {
      if (err.code === "PREMIUM_REQUIRED") setError("premium");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeatureViewLayout
      onBack={onBack}
      title="Caption Generator"
      subtitle="Upload an image or document to generate a professional LinkedIn caption"
      icon={MessageCircle}
      gradient="from-pink-500 to-rose-600"
    >
      {error === "premium" ? (
        <PremiumGate />
      ) : (
        <div className="space-y-5">
          <FileDropZone
            file={file}
            onFileSelect={setFile}
            onRemove={() => setFile(null)}
            acceptedTypes=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx"
          />
          {error && error !== "premium" && <ErrorBar message={error} />}
          <button
            onClick={handleGenerate}
            disabled={!file || loading}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-pink-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate Caption</>}
          </button>
          {result && <ResultDisplay data={result} type="caption" />}
        </div>
      )}
    </FeatureViewLayout>
  );
}

/* ─────────── Top News ─────────── */
function TopNewsView({ onBack }) {
  const [field, setField] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    if (!field.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await getTopNews(field);
      setResult(res?.data || res);
    } catch (err) {
      if (err.code === "PREMIUM_REQUIRED") setError("premium");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeatureViewLayout
      onBack={onBack}
      title="Top News"
      subtitle="Get AI-curated news summaries for your professional field"
      icon={Newspaper}
      gradient="from-orange-500 to-amber-600"
    >
      {error === "premium" ? (
        <PremiumGate />
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your field or topic</label>
            <input
              value={field}
              onChange={(e) => setField(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder="e.g. Artificial Intelligence, Software Development, Data Science..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
            />
          </div>
          {error && error !== "premium" && <ErrorBar message={error} />}
          <button
            onClick={handleFetch}
            disabled={!field.trim() || loading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Fetching News...</> : <><Newspaper className="w-5 h-5" /> Get Top News</>}
          </button>
          {result && <ResultDisplay data={result} type="news" />}
        </div>
      )}
    </FeatureViewLayout>
  );
}

/* ─────────── Interview Prep ─────────── */
function InterviewPrepView({ onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateInterviewQuestions(file);
      setResult(res?.data || res);
    } catch (err) {
      if (err.code === "PREMIUM_REQUIRED") setError("premium");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeatureViewLayout
      onBack={onBack}
      title="Interview Prep"
      subtitle="Upload your resume to get tailored interview questions"
      icon={BrainCircuit}
      gradient="from-violet-500 to-purple-600"
    >
      {error === "premium" ? (
        <PremiumGate />
      ) : (
        <div className="space-y-5">
          <FileDropZone file={file} onFileSelect={setFile} onRemove={() => setFile(null)} />
          {error && error !== "premium" && <ErrorBar message={error} />}
          <button
            onClick={handleGenerate}
            disabled={!file || loading}
            className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Questions...</> : <><BrainCircuit className="w-5 h-5" /> Generate Questions</>}
          </button>
          {result && <ResultDisplay data={result} type="interview" />}
        </div>
      )}
    </FeatureViewLayout>
  );
}

/* ─────────── Answer Review ─────────── */
function AnswerReviewView({ onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleReview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await reviewAnswers(file);
      setResult(res?.data || res);
    } catch (err) {
      if (err.code === "PREMIUM_REQUIRED") setError("premium");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeatureViewLayout
      onBack={onBack}
      title="Answer Review"
      subtitle="Upload your handwritten or typed answers for AI-powered evaluation"
      icon={ClipboardCheck}
      gradient="from-teal-500 to-emerald-600"
    >
      {error === "premium" ? (
        <PremiumGate />
      ) : (
        <div className="space-y-5">
          <FileDropZone
            file={file}
            onFileSelect={setFile}
            onRemove={() => setFile(null)}
            acceptedTypes=".png,.jpg,.jpeg,.webp,.pdf"
          />
          {error && error !== "premium" && <ErrorBar message={error} />}
          <button
            onClick={handleReview}
            disabled={!file || loading}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-teal-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Reviewing...</> : <><ClipboardCheck className="w-5 h-5" /> Review Answers</>}
          </button>
          {result && <ResultDisplay data={result} type="review" />}
        </div>
      )}
    </FeatureViewLayout>
  );
}

/* ─────────── Profile Score ─────────── */
function ProfileScoreView({ onBack }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScore = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await getProfileScore(profile || {});
      setResult(res?.data || res);
    } catch (err) {
      if (err.code === "PREMIUM_REQUIRED") setError("premium");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeatureViewLayout
      onBack={onBack}
      title="Profile Score"
      subtitle="Get an AI-powered score and recommendations for your profile"
      icon={Star}
      gradient="from-amber-500 to-yellow-600"
    >
      {error === "premium" ? (
        <PremiumGate />
      ) : (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 leading-relaxed">
              This will analyze your current UNIR profile and provide a comprehensive score with personalized improvement suggestions.
            </div>
          </div>
          {error && error !== "premium" && <ErrorBar message={error} />}
          <button
            onClick={handleScore}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-amber-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Scoring...</> : <><Star className="w-5 h-5" /> Get My Score</>}
          </button>
          {result && <ResultDisplay data={result} type="profile-score" />}
        </div>
      )}
    </FeatureViewLayout>
  );
}

/* ─────────── Astra Chat ─────────── */
function AstraChatView({ onBack }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatIdRef = useRef(`chat-${Date.now()}`);

  useEffect(() => {
    try {
      const socket = connectAstraChat();
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("[Astra] Connected to AI chat");
        setConnected(true);
        setError(null);
      });

      socket.on("disconnect", () => {
        console.log("[Astra] Disconnected from AI chat");
        setConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.error("[Astra] Connection error:", err.message);
        setError("Failed to connect to Astra AI. Please ensure AI service is running.");
        setConnected(false);
      });

      socket.on("ai-message-response", ({ response, chatId }) => {
        setMessages(prev => [...prev, { role: "ai", content: response, time: new Date() }]);
        setLoading(false);
      });

      socket.on("ai-message-error", ({ error: errMsg }) => {
        setMessages(prev => [...prev, { role: "error", content: errMsg, time: new Date() }]);
        setLoading(false);
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      setError("Failed to initialize Astra AI chat.");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !connected || loading) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: msg, time: new Date() }]);
    setInput("");
    setLoading(true);

    socketRef.current?.emit("ai-message", {
      chatId: chatIdRef.current,
      message: msg,
    });
  };

  return (
    <FeatureViewLayout
      onBack={onBack}
      title="Astra AI Chat"
      subtitle="Your intelligent AI assistant with memory"
      icon={Bot}
      gradient="from-cyan-500 to-blue-600"
      noPadding
    >
      <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
        {/* Connection status */}
        <div className={`px-4 py-2 text-xs font-medium flex items-center gap-2 border-b ${
          connected ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"
        }`}>
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          {connected ? "Connected to Astra AI" : error || "Connecting..."}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-200/50">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hi, I'm Astra AI!</h3>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                I'm your intelligent assistant created by Ritul Jain. Ask me anything about technology,
                career advice, problem-solving, or just have a conversation!
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {["Tell me about yourself", "Help with my career", "Latest tech trends"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); }}
                    className="px-4 py-2 text-xs font-medium bg-slate-100 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-blue-100"
                  : msg.role === "error"
                  ? "bg-red-100"
                  : "bg-gradient-to-br from-cyan-400 to-blue-600"
              }`}>
                {msg.role === "user" ? (
                  <img
                    src={profile?.profilePictureUrl || GHOST_AVATAR}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : msg.role === "error" ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-md"
                    : msg.role === "error"
                    ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-md"
                    : "bg-slate-100 text-slate-800 rounded-tl-md"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-md">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={connected ? "Type a message..." : "Connecting to Astra AI..."}
              disabled={!connected}
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white border border-transparent focus:border-blue-300 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!connected || !input.trim() || loading}
              className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </FeatureViewLayout>
  );
}

/* ─────────── Feature View Layout ─────────── */
function FeatureViewLayout({ onBack, title, subtitle, icon: Icon, gradient, children, noPadding }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className={noPadding ? "" : ""}>{children}</div>
    </div>
  );
}

/* ─────────── Error Bar ─────────── */
function ErrorBar({ message }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function AiAssistantPage() {
  const { profile } = useAuth();
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      id: "chat",
      icon: Bot,
      title: "Astra AI Chat",
      description: "Chat with your intelligent AI assistant powered by memory and tools",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      id: "profile-analyzer",
      icon: UserCheck,
      title: "Profile Analyzer",
      description: "Upload your resume for comprehensive LinkedIn optimization insights",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      id: "caption",
      icon: MessageCircle,
      title: "Caption Generator",
      description: "Generate professional LinkedIn captions from your images and documents",
      gradient: "from-pink-500 to-rose-600",
    },

    {
      id: "interview",
      icon: BrainCircuit,
      title: "Interview Prep",
      description: "Generate tailored interview questions based on your resume",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      id: "review",
      icon: ClipboardCheck,
      title: "Answer Review",
      description: "Upload your answer sheets for AI-powered evaluation and scoring",
      gradient: "from-teal-500 to-emerald-600",
    },
    {
      id: "profile-score",
      icon: Star,
      title: "Profile Score",
      description: "Get an AI-generated score with personalized improvement tips",
      gradient: "from-amber-500 to-yellow-600",
    },
  ];

  const renderActiveView = () => {
    const goBack = () => setActiveFeature(null);
    switch (activeFeature) {
      case "chat": return <AstraChatView onBack={goBack} />;
      case "profile-analyzer": return <ProfileAnalyzerView onBack={goBack} />;
      case "caption": return <CaptionGeneratorView onBack={goBack} />;

      case "interview": return <InterviewPrepView onBack={goBack} />;
      case "review": return <AnswerReviewView onBack={goBack} />;
      case "profile-score": return <ProfileScoreView onBack={goBack} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-[80px] pb-10">
        <div className="max-w-[1128px] mx-auto px-4">
          {activeFeature ? (
            <div className="max-w-3xl mx-auto">
              {renderActiveView()}
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="text-center mb-10 animate-in fade-in duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/60 text-cyan-700 text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" />
                  Powered by Gemini & Groq AI
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
                  Astra AI <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Assistant</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Your AI-powered toolkit for career growth, profile optimization, and professional development.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                {features.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    gradient={feature.gradient}
                    onClick={() => setActiveFeature(feature.id)}
                  />
                ))}
              </div>

              {/* Info */}
              <div className="mt-10 text-center animate-in fade-in duration-1000">
                <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Most AI features require a Premium subscription
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
