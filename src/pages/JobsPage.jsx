import { Navbar } from "@/components/Navbar/Navbar";
import { Bookmark, Search, Briefcase } from "lucide-react";
import { useMemo, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { InlineError } from "@/components/ui/InlineError";
import { Skeleton } from "@/components/ui/Skeleton";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { jobs, loading, error, isEmpty, refetch } = useJobs(searchQuery);
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const selectedJob = useMemo(() => {
    if (!jobs || jobs.length === 0) return null;
    const byId = selectedJobId ? jobs.find((j) => j.id === selectedJobId) : null;
    return byId ?? jobs[0] ?? null;
  }, [jobs, selectedJobId]);

  const toggleSave = (jobId) => {
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
  };

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />
      <div className="pt-[52px]">
        <div className="bg-white border-b border-[rgba(0,0,0,0.08)] py-4">
          <div className="max-w-[1128px] mx-auto px-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(0,0,0,0.6)]" />
              <input
                type="text"
                placeholder="Search by title, skill, or company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[rgba(0,0,0,0.6)] rounded focus:outline-none focus:border-[#0a66c2]"
              />
            </div>
            <button className="px-6 py-2 bg-[#0a66c2] text-white font-semibold rounded hover:bg-[#004182] whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
        <div className="max-w-[1128px] mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <aside className="hidden lg:block w-[225px] flex-shrink-0">
              <div className="unir-card p-4">
                <nav className="space-y-2">
                  <a
                    href="#"
                    className="flex items-center gap-3 px-2 py-2 rounded bg-[#e7f3ff] text-[#0a66c2] font-semibold"
                  >
                    <Bookmark className="w-5 h-5" /> My jobs
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.6)]"
                  >
                    <Briefcase className="w-5 h-5" /> Job alerts
                  </a>
                </nav>
              </div>
            </aside>
            <main className="flex-1 flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-[340px] flex-shrink-0 space-y-2">
                {error && (
                  <InlineError
                    title="Couldn’t load jobs"
                    message={error?.message || "Please try again."}
                    onRetry={refetch}
                  />
                )}
                {loading && (
                  <>
                    <div className="unir-card p-4">
                      <div className="flex gap-3">
                        <Skeleton className="w-12 h-12 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-40" />
                          <Skeleton className="h-3 w-28 mt-2" />
                          <Skeleton className="h-3 w-24 mt-2" />
                        </div>
                      </div>
                    </div>
                    <div className="unir-card p-4">
                      <div className="flex gap-3">
                        <Skeleton className="w-12 h-12 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-44" />
                          <Skeleton className="h-3 w-32 mt-2" />
                          <Skeleton className="h-3 w-20 mt-2" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {isEmpty && (
                  <div className="unir-card p-6 text-sm text-[rgba(0,0,0,0.6)]">
                    No jobs found. Try a different search.
                  </div>
                )}
                {!loading &&
                  jobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`unir-card p-4 cursor-pointer ${
                        selectedJob?.id === job.id ? "ring-2 ring-[#0a66c2]" : "hover:shadow-md"
                      }`}
                    >
                      <div className="flex gap-3">
                        <img src={job.logo} alt={job.company} className="w-12 h-12 rounded" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#0a66c2]">{job.title}</h3>
                          <p className="text-sm text-[rgba(0,0,0,0.9)]">{job.company}</p>
                          <p className="text-sm text-[rgba(0,0,0,0.6)]">{job.location}</p>
                          <p className="text-xs text-[rgba(0,0,0,0.6)] mt-1">{job.posted}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(job.id);
                          }}
                          className="p-2 hover:bg-[rgba(0,0,0,0.04)] rounded-full h-fit"
                        >
                          <Bookmark
                            className={`w-5 h-5 ${
                              savedJobs.includes(job.id)
                                ? "fill-[#0a66c2] text-[#0a66c2]"
                                : "text-[rgba(0,0,0,0.6)]"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              {selectedJob && (
                <div className="flex-1 unir-card p-6">
                <div className="flex gap-4 mb-4">
                  <img src={selectedJob.logo} alt={selectedJob.company} className="w-16 h-16 rounded" />
                  <div>
                    <h1 className="text-xl font-semibold text-[rgba(0,0,0,0.9)]">{selectedJob.title}</h1>
                    <p className="text-[rgba(0,0,0,0.9)]">{selectedJob.company}</p>
                    <p className="text-sm text-[rgba(0,0,0,0.6)]">{selectedJob.location}</p>
                  </div>
                </div>
                <div className="flex gap-3 mb-6">
                  <button className="px-6 py-2 bg-[#0a66c2] text-white font-semibold rounded-full hover:bg-[#004182]">
                    Apply now
                  </button>
                  <button
                    onClick={() => toggleSave(selectedJob.id)}
                    className="px-6 py-2 border border-[#0a66c2] text-[#0a66c2] font-semibold rounded-full hover:bg-[#e7f3ff]"
                  >
                    {savedJobs.includes(selectedJob.id) ? "Saved" : "Save"}
                  </button>
                </div>
                <div className="border-t border-[rgba(0,0,0,0.08)] pt-4">
                  <h2 className="font-semibold text-[rgba(0,0,0,0.9)] mb-2">About the job</h2>
                  <p className="text-sm text-[rgba(0,0,0,0.9)]">
                    We are looking for an experienced {selectedJob.title} to join our team.
                  </p>
                  <p className="text-sm mt-2">
                    <span className="font-semibold">Salary:</span> {selectedJob.salary}
                  </p>
                </div>
                </div>
              )}
              {!loading && !selectedJob && !isEmpty && (
                <div className="flex-1 unir-card p-6 text-sm text-[rgba(0,0,0,0.6)]">
                  Select a job to view details.
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

