import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { Image, Video, Calendar, FileText, X } from "lucide-react";

export function PostComposer({ onPost }) {
  const { user, profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");

  const handlePost = () => {
    if (postContent.trim()) {
      onPost?.(postContent);
      setPostContent("");
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="unir-card p-6 unir-card-hover group/composer">
        <div className="flex gap-4">
          <img
            src={
              profile?.profilePictureUrl ||
              user?.avatar ||
              "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"
            }
            alt="Profile"
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-transparent group-hover/composer:ring-blue-100 transition-all shadow-sm"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 h-12 px-6 text-left text-slate-400 font-medium bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 hover:border-slate-200 transition-all active:scale-[0.99]"
          >
            Share an update, image or idea...
          </button>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
          <div className="flex gap-1 xl:gap-2">
            {[
                { icon: Image, label: "Media", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: Calendar, label: "Event", color: "text-amber-500", bg: "bg-amber-50" },
                { icon: FileText, label: "Article", color: "text-indigo-500", bg: "bg-indigo-50" }
            ].map(item => (
                <button
                    key={item.label}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all group/btn"
                >
                    <div className={`p-1.5 ${item.bg} rounded-lg group-hover/btn:scale-110 transition-transform`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-sm font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-wider text-[11px]">{item.label}</span>
                </button>
            ))}
          </div>
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-sm">
            Drafts
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-[600px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={
                    profile?.profilePictureUrl ||
                    user?.avatar ||
                    "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"
                  }
                  alt="Profile"
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                />
                <div>
                  <p className="font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                    {profile ? `${profile.firstName} ${profile.lastName}` : user?.name}
                  </p>
                  <button className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors bg-slate-50 px-2 py-1 rounded-lg">
                    <span>Public</span>
                    <Video className="w-3 h-3 rotate-180" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's professional on your mind?"
                className="w-full min-h-[240px] resize-none text-xl font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between p-6 bg-slate-50/50 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                {[Image, Video, FileText, Calendar].map((Icon, idx) => (
                    <button key={idx} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-2xl transition-all active:scale-90">
                        <Icon className="w-5 h-5" />
                    </button>
                ))}
              </div>
              <button
                onClick={handlePost}
                disabled={!postContent.trim()}
                className="unir-btn-primary !py-3.5 !px-10 shadow-lg shadow-blue-500/20"
              >
                Connect & Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

