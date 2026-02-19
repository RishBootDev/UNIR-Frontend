import { useEffect, useState, useCallback, useRef } from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import {
  Search, Briefcase, ExternalLink, MapPin, Filter, X,
  Sparkles, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";
import { searchJobs } from "@/services/aiService";
import { profileService } from "@/services/api";
import { getUserId } from "@/auth/authStorage";
import { Spinner } from "@/components/ui/Spinner";

// ── Job-type filter chips ───────────────────────────────────────────
const JOB_TYPES = ["Full-time", "Part-time", "Remote", "Internship", "Contract", "Fresher"];
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior", "Lead", "Manager"];
const LOCATIONS = ["India", "USA", "UK", "Remote", "Europe", "Canada", "Australia"];

// ── Parse skills string from API: "Web Development with skills -> Frontend, React JS, ..." ──
function parseSkillsString(raw) {
  if (!raw || typeof raw !== "string") return [];
  const arrowIdx = raw.indexOf("->");
  if (arrowIdx !== -1) {
    return raw
      .slice(arrowIdx + 2)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

// ── Build search query from UI state ───────────────────────────────
function buildQuery({ text, jobType, experience, location, skills }) {
  const parts = [];
  if (text) parts.push(text);
  if (skills.length > 0) parts.push(skills.slice(0, 3).join(" "));
  if (jobType) parts.push(jobType);
  if (experience) parts.push(experience);
  if (location) parts.push(`in ${location}`);
  return parts.join(" ").trim() || "software developer jobs";
}

// ── Single job card ─────────────────────────────────────────────────
function JobCard({ job, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 bg-white ${
        isSelected
          ? "border-blue-500 shadow-md ring-2 ring-blue-100"
          : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      <div className="flex gap-3 items-start">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
          <Briefcase className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm leading-snug truncate ${isSelected ? "text-blue-700" : "text-slate-900 group-hover:text-blue-700"} transition-colors`}>
            {job.title}
          </h3>
          {job.snippet && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{job.snippet}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detail panel ────────────────────────────────────────────────────
function JobDetail({ job }) {
  if (!job) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 h-full flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
          <Briefcase className="w-7 h-7 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900 leading-snug">{job.title}</h2>
          {job.link && (
            <p className="text-xs text-slate-400 mt-1 truncate">{new URL(job.link).hostname}</p>
          )}
        </div>
      </div>

      {job.snippet && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About this role</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{job.snippet}</p>
        </div>
      )}

      {job.sitelinks && job.sitelinks.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quick links</h4>
          <div className="flex flex-wrap gap-2">
            {job.sitelinks.slice(0, 6).map((sl, i) => (
              <a
                key={i}
                href={sl.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition"
              >
                {sl.title}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto flex gap-3">
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition text-sm"
        >
          <ExternalLink className="w-4 h-4" /> Apply / View Job
        </a>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────
export default function JobsPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [userSkills, setUserSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skillsLoading, setSkillsLoading] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const hasFetched = useRef(false);

  // Load user skills on mount
  useEffect(() => {
    const userId = getUserId();
    if (!userId) { setSkillsLoading(false); return; }
    profileService.getSkills(userId)
      .then((raw) => {
        const parsed = parseSkillsString(raw);
        setUserSkills(parsed);
        // Auto-set first skill as search hint
        if (parsed.length > 0) setSelectedSkill(parsed[0]);
      })
      .catch(() => {})
      .finally(() => setSkillsLoading(false));
  }, []);

  // Fetch jobs whenever relevant state changes (debounced)
  const fetchJobs = useCallback(async () => {
    const q = buildQuery({
      text: searchText,
      jobType: selectedJobType,
      experience: selectedExp,
      location: selectedLocation,
      skills: selectedSkill ? [selectedSkill] : userSkills,
    });

    setLoading(true);
    setError(null);
    setSelectedIdx(0);
    try {
      const res = await searchJobs(q);
      setJobs(res?.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedJobType, selectedExp, selectedLocation, selectedSkill, userSkills]);

  // Auto-fetch once skills are loaded
  useEffect(() => {
    if (skillsLoading) return;
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchJobs();
  }, [skillsLoading, fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    hasFetched.current = true;
    fetchJobs();
  };

  const clearFilters = () => {
    setSelectedJobType("");
    setSelectedExp("");
    setSelectedLocation("");
    setSelectedSkill(userSkills[0] || "");
  };

  const activeFiltersCount = [selectedJobType, selectedExp, selectedLocation].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />
      <div className="pt-[72px]">

        {/* ── Hero Search Bar ── */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-[1128px] mx-auto px-4 py-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-blue-600">AI-Powered Personalised Jobs</span>
            </div>
            <form onSubmit={handleSearch} className="flex gap-3 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title, skill, or keyword..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm bg-slate-50"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition text-sm flex items-center gap-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" /> Search Jobs
              </button>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`px-4 py-2.5 border rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
                  activeFiltersCount > 0
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters {activeFiltersCount > 0 && <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFiltersCount}</span>}
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </form>

            {/* ── Filter Panel ── */}
            {showFilters && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-6">
                {/* Job Type */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Type</p>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedJobType(selectedJobType === t ? "" : t)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold border transition ${
                          selectedJobType === t
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Experience */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Experience</p>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_LEVELS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setSelectedExp(selectedExp === l ? "" : l)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold border transition ${
                          selectedExp === l
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-slate-600 border-slate-300 hover:border-purple-400"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Location */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <MapPin className="inline w-3 h-3 mr-1" />Location
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setSelectedLocation(selectedLocation === loc ? "" : loc)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold border transition ${
                          selectedLocation === loc
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-slate-600 border-slate-300 hover:border-green-400"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="self-end text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold"
                  >
                    <X className="w-3 h-3" /> Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1128px] mx-auto px-4 py-5 flex gap-5 flex-col lg:flex-row">

          {/* ── Left Sidebar: Skills ── */}
          <aside className="lg:w-[220px] flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-[80px]">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Skills</h3>
              {skillsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-7 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : userSkills.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {userSkills.map((skill, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedSkill(selectedSkill === skill ? "" : skill);
                      }}
                      className={`text-left text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                        selectedSkill === skill
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-700"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedSkill("")}
                    className={`text-left text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                      !selectedSkill
                        ? "bg-slate-700 text-white border-slate-700"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    All skills
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No skills found. Add skills to your profile for personalized results.</p>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={fetchJobs}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  Refresh Jobs
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 flex gap-4 flex-col lg:flex-row">

            {/* Jobs List */}
            <div className="lg:w-[340px] flex-shrink-0">
              {/* Active query badge */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 font-medium">
                  {loading ? "Searching..." : `${jobs.length} results found`}
                </p>
                {(selectedSkill || activeFiltersCount > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {selectedSkill && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        <Sparkles className="w-2.5 h-2.5" /> {selectedSkill}
                      </span>
                    )}
                    {selectedJobType && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{selectedJobType}</span>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-3 flex items-start gap-2">
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Couldn't load jobs</p>
                    <p className="text-xs mt-1">{error}</p>
                    <button onClick={fetchJobs} className="mt-2 text-xs font-bold text-red-600 underline">Retry</button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-100 rounded w-3/4" />
                          <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                          <div className="h-2 bg-slate-100 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && jobs.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No jobs found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                </div>
              )}

              {!loading && jobs.length > 0 && (
                <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1 scrollbar-thin">
                  {jobs.map((job, i) => (
                    <JobCard
                      key={i}
                      job={job}
                      isSelected={selectedIdx === i}
                      onClick={() => setSelectedIdx(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Detail Panel */}
            <div className="flex-1">
              {loading ? (
                <div className="bg-white rounded-xl border border-slate-200 h-[400px] flex items-center justify-center">
                  <Spinner />
                </div>
              ) : jobs[selectedIdx] ? (
                <JobDetail job={jobs[selectedIdx]} />
              ) : !error ? (
                <div className="bg-white rounded-xl border border-slate-200 h-[300px] flex items-center justify-center text-slate-400 text-sm">
                  Select a job to view details
                </div>
              ) : null}
            </div>

          </main>
        </div>

        {/* ── HireSense Footer Banner ── */}
        <div className="max-w-[1128px] mx-auto px-4 pb-10">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div>
              <h3 className="text-white font-bold text-lg">Looking for more opportunities?</h3>
              <p className="text-blue-100 text-sm mt-1">Explore thousands of jobs on HireSense — our full-featured job board platform.</p>
            </div>
            <a
              href="https://hiresense.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 rounded-full hover:bg-blue-50 transition shadow-md text-sm whitespace-nowrap"
            >
              <ExternalLink className="w-4 h-4" /> Visit HireSense
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
