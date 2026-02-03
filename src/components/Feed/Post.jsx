import { memo, useMemo, useState } from "react";
import { ThumbsUp, MessageCircle, Repeat2, Send, MoreHorizontal, Globe } from "lucide-react";

export const Post = memo(function Post({ post }) {
  const author = post?.author ?? {};
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(() => post?.commentItems ?? []);

  const handleLike = () => {
    setLiked(!liked);
  };

  const likeCount = (post?.likes ?? 0) + (liked ? 1 : 0);
  const commentCount = (post?.comments ?? localComments.length) + Math.max(0, localComments.length - (post?.commentItems?.length ?? 0));

  const comments = useMemo(() => {
    const base = Array.isArray(post?.commentItems) ? post.commentItems : [];
    const extra = Array.isArray(localComments) ? localComments : [];
    // Deduplicate by id
    const map = new Map();
    for (const c of [...base, ...extra]) map.set(String(c.id || `${c.author?.name}-${c.timeAgo}-${c.content}`), c);
    return Array.from(map.values());
  }, [post, localComments]);

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    const newComment = {
      id: `local-${Date.now()}`,
      author: { name: "You", avatar: "" },
      content: text,
      timeAgo: "Now",
    };
    setLocalComments((prev) => [...prev, newComment]);
    setCommentText("");
  };

  return (
    <article className="unir-card">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            <img
              src={
                author.avatar ||
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              }
              alt={author.name || "Profile"}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-[rgba(0,0,0,0.9)] hover:text-[#0a66c2] hover:underline cursor-pointer">
                {author.name || "Unknown"}
              </h3>
              <p className="text-xs text-[rgba(0,0,0,0.6)] line-clamp-1">{author.headline || ""}</p>
              <p className="text-xs text-[rgba(0,0,0,0.6)] flex items-center gap-1">
                {post?.timeAgo || ""} • <Globe className="w-3 h-3" />
              </p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)] transition-colors">
            <MoreHorizontal className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
          </button>
        </div>
        <div className="mt-3">
          <p className="text-sm text-[rgba(0,0,0,0.9)] whitespace-pre-wrap">{post?.content || ""}</p>
        </div>
      </div>

      {post?.image && (
        <div className="w-full">
          <img src={post.image} alt="Post" className="w-full object-cover max-h-[512px]" />
        </div>
      )}

      <div className="px-4 py-2 flex items-center justify-between text-xs text-[rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-1">
          <span className="flex items-center justify-center w-4 h-4 bg-[#0a66c2] rounded-full">
            <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
          </span>
          <span>{likeCount}</span>
        </div>
        <div className="flex gap-3">
          <span>{commentCount} comments</span>
          <span>{post?.reposts ?? 0} reposts</span>
        </div>
      </div>

      <div className="border-t border-[rgba(0,0,0,0.08)] mx-4" />

      <div className="flex items-center justify-around py-1 px-2">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-3 rounded hover:bg-[rgba(0,0,0,0.04)] transition-colors ${
            liked ? "text-[#0a66c2]" : "text-[rgba(0,0,0,0.6)]"
          }`}
        >
          <ThumbsUp className={`w-5 h-5 ${liked ? "fill-[#0a66c2]" : ""}`} />
          <span className="text-sm font-semibold">Like</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-3 rounded hover:bg-[rgba(0,0,0,0.04)] transition-colors text-[rgba(0,0,0,0.6)]"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Comment</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-3 rounded hover:bg-[rgba(0,0,0,0.04)] transition-colors text-[rgba(0,0,0,0.6)]">
          <Repeat2 className="w-5 h-5" />
          <span className="text-sm font-semibold">Repost</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-3 rounded hover:bg-[rgba(0,0,0,0.04)] transition-colors text-[rgba(0,0,0,0.6)]">
          <Send className="w-5 h-5" />
          <span className="text-sm font-semibold">Send</span>
        </button>
      </div>

      {showComments && (
        <div className="px-4 pb-4 border-t border-[rgba(0,0,0,0.08)]">
          <div className="mt-3 space-y-3">
            {comments.length === 0 && (
              <p className="text-sm text-[rgba(0,0,0,0.6)]">No comments yet. Be the first to comment.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-10 h-10 rounded-full bg-[rgba(0,0,0,0.08)] flex items-center justify-center text-xs font-semibold text-[rgba(0,0,0,0.6)]">
                  {(c.author?.name || "U").slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="unir-card p-3">
                    <p className="text-sm font-semibold text-[rgba(0,0,0,0.9)]">{c.author?.name || "Unknown"}</p>
                    <p className="text-sm text-[rgba(0,0,0,0.9)] mt-1 whitespace-pre-wrap">{c.content || ""}</p>
                  </div>
                  <p className="text-xs text-[rgba(0,0,0,0.6)] mt-1">{c.timeAgo || ""}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Your profile"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border border-[rgba(0,0,0,0.3)] rounded-full text-sm focus:outline-none focus:border-[#0a66c2]"
              />
            </div>
            <button
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-[#0a66c2] text-white font-semibold rounded-full hover:bg-[#004182] disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </article>
  );
});

