import { Navbar } from "@/components/Navbar/Navbar";
import { Users, UserPlus, Settings } from "lucide-react";
import { useState } from "react";
import { useNetworkSuggestions } from "@/hooks/useNetworkSuggestions";
import { InlineError } from "@/components/ui/InlineError";
import { Skeleton } from "@/components/ui/Skeleton";

export default function NetworkPage() {
  const { suggestions, loading, error, isEmpty, refetch } = useNetworkSuggestions();
  const [connectedIds, setConnectedIds] = useState([]);

  const handleConnect = (name) => {
    setConnectedIds((prev) => [...prev, name]);
  };

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />
      <div className="pt-[52px]">
        <div className="max-w-[1128px] mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="hidden lg:block w-[225px] flex-shrink-0">
              <div className="unir-card p-4">
                <h2 className="font-semibold text-[rgba(0,0,0,0.9)] mb-4">Manage my network</h2>
                <nav className="space-y-1">
                  <a
                    href="#"
                    className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.6)]"
                  >
                    <Users className="w-5 h-5" /> Connections <span className="ml-auto">500</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.6)]"
                  >
                    <UserPlus className="w-5 h-5" /> Following & followers
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.6)]"
                  >
                    <Settings className="w-5 h-5" /> Groups <span className="ml-auto">12</span>
                  </a>
                </nav>
              </div>
            </aside>
            <main className="flex-1">
              <div className="unir-card p-4">
                <h2 className="font-semibold text-[rgba(0,0,0,0.9)] mb-4">People you may know</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {error && (
                    <div className="sm:col-span-2 lg:col-span-4">
                      <InlineError
                        title="Couldn’t load suggestions"
                        message={error?.message || "Please try again."}
                        onRetry={refetch}
                      />
                    </div>
                  )}
                  {loading &&
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
                        <div className="h-16 bg-[rgba(0,0,0,0.08)]" />
                        <div className="p-3 -mt-8 text-center">
                          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                          <Skeleton className="h-3 w-24 mx-auto mt-3" />
                          <Skeleton className="h-3 w-32 mx-auto mt-2" />
                          <Skeleton className="h-8 w-full mt-3 rounded-full" />
                        </div>
                      </div>
                    ))}
                  {isEmpty && !loading && (
                    <div className="sm:col-span-2 lg:col-span-4 text-sm text-[rgba(0,0,0,0.6)]">
                      No suggestions right now.
                    </div>
                  )}
                  {!loading && suggestions.map((person, index) => (
                    <div
                      key={index}
                      className="border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-16 bg-gradient-to-r from-[#0077b5] to-[#00a0dc]" />
                      <div className="p-3 -mt-8 text-center">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-16 h-16 rounded-full border-2 border-white mx-auto"
                        />
                        <p className="font-semibold text-sm text-[rgba(0,0,0,0.9)] mt-2">{person.name}</p>
                        <p className="text-xs text-[rgba(0,0,0,0.6)] line-clamp-2 h-8">{person.headline}</p>
                        <p className="text-xs text-[rgba(0,0,0,0.6)] mt-1">{person.mutual} mutual connections</p>
                        <button
                          onClick={() => handleConnect(person.name)}
                          disabled={connectedIds.includes(person.name)}
                          className={`mt-3 w-full py-1.5 rounded-full text-sm font-semibold transition-colors ${
                            connectedIds.includes(person.name)
                              ? "bg-[rgba(0,0,0,0.08)] text-[rgba(0,0,0,0.3)] cursor-not-allowed"
                              : "border border-[#0a66c2] text-[#0a66c2] hover:bg-[#e7f3ff]"
                          }`}
                        >
                          {connectedIds.includes(person.name) ? "Pending" : "Connect"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

