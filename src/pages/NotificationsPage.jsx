import { Navbar } from "@/components/Navbar/Navbar";
import { Settings } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { InlineError } from "@/components/ui/InlineError";
import { Skeleton } from "@/components/ui/Skeleton";

export default function NotificationsPage() {
  const { notifications, loading, error, isEmpty, refetch, markAllRead } = useNotifications();

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />
      <div className="pt-[52px]">
        <div className="max-w-[1128px] mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="hidden lg:block w-[225px] flex-shrink-0">
              <div className="unir-card p-4">
                <h2 className="font-semibold text-[rgba(0,0,0,0.9)] mb-4">Manage your notifications</h2>
                <a
                  href="#"
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.6)]"
                >
                  <Settings className="w-5 h-5" /> View settings
                </a>
              </div>
            </aside>
            <main className="flex-1">
              <div className="unir-card">
                <div className="p-4 border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between">
                  <h2 className="font-semibold text-[rgba(0,0,0,0.9)]">All Notifications</h2>
                  <button onClick={markAllRead} className="text-sm text-[#0a66c2] font-semibold hover:underline">
                    Mark all as read
                  </button>
                </div>
                <div>
                  {error && (
                    <div className="p-4">
                      <InlineError
                        title="Couldn’t load notifications"
                        message={error?.message || "Please try again."}
                        onRetry={refetch}
                      />
                    </div>
                  )}
                  {loading && (
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-72" />
                          <Skeleton className="h-3 w-28 mt-2" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-64" />
                          <Skeleton className="h-3 w-24 mt-2" />
                        </div>
                      </div>
                    </div>
                  )}
                  {isEmpty && !loading && (
                    <div className="p-6 text-sm text-[rgba(0,0,0,0.6)]">You’re all caught up.</div>
                  )}
                  {!loading && notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-4 border-b border-[rgba(0,0,0,0.08)] hover:bg-[rgba(0,0,0,0.04)] cursor-pointer ${
                        !notification.read ? "bg-[#e7f3ff]" : ""
                      }`}
                    >
                      <img
                        src={notification.user.avatar}
                        alt={notification.user.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-[rgba(0,0,0,0.9)]">
                          <span className="font-semibold">{notification.user.name}</span> {notification.action}
                        </p>
                        <p className="text-xs text-[rgba(0,0,0,0.6)] mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && <span className="w-2 h-2 bg-[#0a66c2] rounded-full" />}
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

