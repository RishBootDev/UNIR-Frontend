import { PostComposer } from "./PostComposer";
import { Post } from "./Post";
import { ChevronDown } from "lucide-react";
import { useFeed } from "@/hooks/useFeed";
import { InlineError } from "@/components/ui/InlineError";
import { Skeleton } from "@/components/ui/Skeleton";

export function Feed() {
  const { posts, loading, error, isEmpty, refetch, addPost } = useFeed();

  return (
    <main className="flex-1 max-w-[555px]">
      <PostComposer onPost={addPost} />
      <div className="flex items-center gap-2 my-3">
        <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
        <button className="flex items-center gap-1 text-xs text-[rgba(0,0,0,0.6)]">
          Sort by: <span className="font-semibold">Top</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {error && (
          <InlineError
            title="Couldn’t load your feed"
            message={error?.message || "Please try again."}
            onRetry={refetch}
          />
        )}
        {loading && (
          <>
            <div className="unir-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-64 mt-2" />
                </div>
              </div>
              <Skeleton className="h-24 w-full mt-4" />
            </div>
            <div className="unir-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-3 w-52 mt-2" />
                </div>
              </div>
              <Skeleton className="h-28 w-full mt-4" />
            </div>
          </>
        )}
        {isEmpty && (
          <div className="unir-card p-6 text-sm text-[rgba(0,0,0,0.6)]">
            Your feed is empty. Start by creating a post.
          </div>
        )}
        {!loading &&
          posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
      </div>
    </main>
  );
}

