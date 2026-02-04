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
    <article className="unir-card unir-card-hover group/post overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="relative">
                <img
                src={
                    author.avatar ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                }
                alt={author.name || "Profile"}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer tracking-tight">
                {author.name || "Unknown"}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 mb-1">{author.headline || "Professional"}</p>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 bg-slate-50 w-fit px-2 py-0.5 rounded-lg">
                {post?.timeAgo || "Recently"} • <Globe className="w-3 h-3" />
              </p>
            </div>
          </div>
          <button className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all active:scale-90">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-5">
          <p className="text-base text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{post?.content || ""}</p>
        </div>
      </div>

      {post?.image && (
        <div className="w-full">
          <img src={post.image} alt="Post" className="w-full object-cover max-h-[512px]" />
        </div>
      )}

      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center z-10">
                    <ThumbsUp className="w-3 h-3 text-white fill-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center z-0">
                    <div className="w-2 h-2 bg-white rounded-full opacity-50" />
                </div>
            </div>
            <span className="text-xs font-bold text-slate-500">{likeCount} reactions</span>
        </div>
        <div className="flex gap-4">
          <button className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">{commentCount} comments</button>
          <button className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">{post?.reposts ?? 0} reposts</button>
        </div>
      </div>

      <div className="mx-6 border-t border-slate-50" />

      <div className="flex items-center justify-between p-2 px-6">
        {[
            { icon: ThumbsUp, label: "Like", active: liked, onClick: handleLike },
            { icon: MessageCircle, label: "Comment", onClick: () => setShowComments(!showComments) },
            { icon: Repeat2, label: "Repost" },
            { icon: Send, label: "Send" }
        ].map(action => (
            <button
                key={action.label}
                onClick={action.onClick}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-all group/action ${
                    action.active ? "text-blue-600" : "text-slate-500"
                }`}
            >
                <action.icon className={`w-5 h-5 group-hover/action:scale-110 transition-transform ${action.active ? "fill-blue-600" : ""}`} />
                <span className="text-xs font-bold uppercase tracking-widest">{action.label}</span>
            </button>
        ))}
      </div>

      {showComments && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/30 animate-in slide-in-from-top-2 duration-300">
          <div className="mt-4 space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0">
                  {(c.author?.name || "U").slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-extrabold text-slate-900 tracking-tight">{c.author?.name || "Unknown"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{c.timeAgo || "Now"}</p>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{c.content || ""}</p>
                  </div>
                  <div className="flex gap-4 px-2 mt-1">
                    <button className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Like</button>
                    <button className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Your profile"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-md shrink-0"
            />
            <div className="flex-1 relative group">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder="Share your thoughts..."
                className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <button
                onClick={submitComment}
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-blue-500/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
});

