import { Navbar } from "@/components/Navbar/Navbar";
import { LeftSidebar } from "@/components/Sidebar/LeftSidebar";
import { RightSidebar } from "@/components/Sidebar/RightSidebar";
import { Feed } from "@/components/Feed/Feed";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-[72px]">
        <div className="max-w-[1240px] mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="hidden lg:block w-[240px] flex-shrink-0">
              <LeftSidebar />
            </div>
            <main className="flex-1 min-w-0">
              <Feed />
            </main>
            <div className="hidden xl:block w-[320px] flex-shrink-0">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

