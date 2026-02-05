import { PostComposer } from "./PostComposer";
import { Post } from "./Post";
import { ChevronDown, Globe } from "lucide-react";
import { useFeed } from "@/hooks/useFeed";
import { InlineError } from "@/components/ui/InlineError";
import { Skeleton } from "@/components/ui/Skeleton";

export function Feed() {
  const { posts, loading, error, isEmpty, refetch, addPost } = useFeed();

  return (
    <div className="flex-1 w-full max-w-[640px] mx-auto">
      <PostComposer onPost={addPost} />
      
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-slate-200" />
        <button className="flex items-center gap-2 group/sort px-4 py-1.5 hover:bg-slate-100 rounded-full transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort by:</span>
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Top</span>
          <ChevronDown className="w-4 h-4 text-blue-600 transition-transform group-hover/sort:translate-y-0.5" />
        </button>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="space-y-6">
        {error && (
          <div className="unir-card p-6 border-red-100 bg-red-50/10">
            <InlineError
                title="Couldn’t load your feed"
                message={error?.message || "Please try again."}
                onRetry={refetch}
            />
          </div>
        )}
        {loading && (
          <>
            {[1, 2].map(i => (
                <div key={i} className="unir-card p-6 animate-pulse">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-2xl bg-slate-100" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-4 w-40 rounded-lg bg-slate-100" />
                            <Skeleton className="h-3 w-64 rounded-lg bg-slate-50" />
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <Skeleton className="h-3 w-full rounded-lg bg-slate-50" />
                        <Skeleton className="h-3 w-5/6 rounded-lg bg-slate-50" />
                        <Skeleton className="h-32 w-full mt-4 rounded-3xl bg-slate-100/50" />
                    </div>
                </div>
            ))}
          </>
        )}
        {isEmpty && !loading && (
          <div className="unir-card p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">Your feed is quiet</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">Follow more people or start a conversation to populate your feed.</p>
            <button 
                onClick={() => addPost?.("Hello UNIR!")}
                className="unir-btn-secondary !px-8"
            >
                Create your first post
            </button>
          </div>
        )}
        {!loading &&
          posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
      </div>
    </div>
  );
}

