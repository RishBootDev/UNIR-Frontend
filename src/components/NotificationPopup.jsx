import { useEffect, useState, useRef } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/useAuth";

const NotificationPopup = () => {
    const { user } = useAuth();
    const { notifications, refetch } = useNotifications();
    
    // We'll use a ref to track if it's the initial load to avoid popping up 
    // a notification incorrectly when the user first opens the app.
    const isInitialLoad = useRef(true);
    
    const [visible, setVisible] = useState(false);
    const [currentNotification, setCurrentNotification] = useState(null);

    useEffect(() => {
        // Request permission for Chrome notifications on mount
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        // Set up polling
        const intervalId = setInterval(() => {
            refetch();
        }, 30000);
        
        return () => clearInterval(intervalId);
    }, [refetch]);

    useEffect(() => {
        console.log("NotificationPopup: checking...", { user: user?.id, notificationsLength: notifications?.length, isInitialLoad: isInitialLoad.current });
        
        if (!user?.id || !notifications || notifications.length === 0) return;

        // Sort notifications to ensure we have the latest one
        const sortedNotifications = [...notifications].sort((a, b) => {
            // Try sorting by createdAt if available
            if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // Fallback to ID sorting (assuming numeric or comparable strings)
            if (a.id && b.id) {
                 return a.id > b.id ? -1 : 1;
            }
            return 0;
        });

        const latest = sortedNotifications[0]; 
        const lastSeenId = localStorage.getItem("lastSeenNotificationId");
        
        console.log("NotificationPopup: latest vs lastSeen", { latestId: latest.id, lastSeenId, match: String(latest.id) === String(lastSeenId) });

        if (String(latest.id) !== String(lastSeenId)) {
             console.log("NotificationPopup: NEW NOTIFICATION DETECTED!");
             
             // Check valid permission and if document is hidden, OR just show the in-app popup regardless of focus
             // The user asked for "popup", assuming the react component.
             
             setCurrentNotification(latest);
             setVisible(true);
             localStorage.setItem("lastSeenNotificationId", String(latest.id));
             
             if (Notification.permission === "granted" && !document.hasFocus()) {
                 new Notification("New Notification", {
                     body: latest.action, 
                     icon: "/vite.svg" 
                 });
             }
             
             setTimeout(() => setVisible(false), 5000);
        } else {
             console.log("NotificationPopup: No new notification.");
        }
        
        isInitialLoad.current = false;
        
    }, [notifications, user?.id]);

    if (!visible || !currentNotification) return null;


    return (
        <div className="fixed bottom-5 right-5 z-[1000] max-w-sm w-full bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-500 cursor-pointer hover:scale-[1.02] transition-transform"
             onClick={() => setVisible(false)}>
            <div className="relative shrink-0">
                <img 
                    src={currentNotification.user?.avatar || "https://cdn-icons-png.flaticon.com/512/3602/3602145.png"} 
                    alt="avatar" 
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-50 shadow-sm"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">New Notification</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Just now</span>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-snug line-clamp-2">
                    <span className="text-slate-900 font-bold">{currentNotification.user?.name}</span> {currentNotification.action}
                </p>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); setVisible(false); }}
                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );
};

export default NotificationPopup;
