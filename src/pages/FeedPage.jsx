import { Navbar } from "@/components/Navbar/Navbar";
import { LeftSidebar } from "@/components/Sidebar/LeftSidebar";
import { RightSidebar } from "@/components/Sidebar/RightSidebar";
import { Feed } from "@/components/Feed/Feed";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />
      <div className="pt-[52px]">
        <div className="max-w-[1128px] mx-auto px-4 py-6">
          <div className="flex gap-6">
            <div className="hidden lg:block">
              <LeftSidebar />
            </div>
            <Feed />
            <div className="hidden xl:block">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

