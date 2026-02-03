import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { Image, Video, Calendar, FileText, X } from "lucide-react";

export function PostComposer({ onPost }) {
  const { user } = useAuth();
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
      <div className="unir-card p-4">
        <div className="flex gap-3">
          <img src={user?.avatar} alt="Profile" className="w-12 h-12 rounded-full" />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 h-12 px-4 text-left text-[rgba(0,0,0,0.6)] bg-transparent border border-[rgba(0,0,0,0.3)] rounded-full hover:bg-[rgba(0,0,0,0.04)] transition-colors"
          >
            Start a post
          </button>
        </div>
        <div className="flex justify-between mt-3 pt-1">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[rgba(0,0,0,0.04)] transition-colors"
          >
            <Image className="w-6 h-6 text-[#378fe9]" />
            <span className="text-sm font-semibold text-[rgba(0,0,0,0.6)]">Media</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[rgba(0,0,0,0.04)] transition-colors"
          >
            <Calendar className="w-6 h-6 text-[#c37d16]" />
            <span className="text-sm font-semibold text-[rgba(0,0,0,0.6)]">Event</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[rgba(0,0,0,0.04)] transition-colors"
          >
            <FileText className="w-6 h-6 text-[#e16745]" />
            <span className="text-sm font-semibold text-[rgba(0,0,0,0.6)]">Write article</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-[10vh]">
          <div className="w-full max-w-[552px] bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3">
                <img src={user?.avatar} alt="Profile" className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-semibold text-[rgba(0,0,0,0.9)]">{user?.name}</p>
                  <button className="text-sm text-[rgba(0,0,0,0.6)] hover:text-[#0a66c2]">
                    Post to Anyone
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)] transition-colors"
              >
                <X className="w-6 h-6 text-[rgba(0,0,0,0.6)]" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What do you want to talk about?"
                className="w-full min-h-[200px] resize-none text-lg placeholder:text-[rgba(0,0,0,0.6)] focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between p-4 border-t border-[rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)] transition-colors">
                  <Image className="w-6 h-6 text-[rgba(0,0,0,0.6)]" />
                </button>
                <button className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)] transition-colors">
                  <Video className="w-6 h-6 text-[rgba(0,0,0,0.6)]" />
                </button>
                <button className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)] transition-colors">
                  <FileText className="w-6 h-6 text-[rgba(0,0,0,0.6)]" />
                </button>
              </div>
              <button
                onClick={handlePost}
                disabled={!postContent.trim()}
                className="px-4 py-1.5 bg-[#0a66c2] text-white font-semibold rounded-full hover:bg-[#004182] disabled:bg-[rgba(0,0,0,0.08)] disabled:text-[rgba(0,0,0,0.3)] disabled:cursor-not-allowed transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

