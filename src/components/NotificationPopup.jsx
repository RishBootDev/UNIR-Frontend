import { useEffect, useState } from "react";
import { notificationsService } from "../services/api";
import { useAuth } from "../context/useAuth";

const NotificationPopup = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [visible, setVisible] = useState(false);
    const [currentNotification, setCurrentNotification] = useState(null);

    useEffect(() => {
        // Request permission for Chrome notifications on mount
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const fetchNotifications = async () => {
            try {
                const data = await notificationsService.getNotifications(user.id);
                // Simple logic: if we have more notifications than before, show the latest one
                // ideally, the backend would filter "unread" or we track the last seen ID locally.
                // For this demo, we'll just check if the latest one is different than what we have stored
                // or just standard polling and showing the latest if it's new.
                if (data && data.length > 0) {
                   const latest = data[0]; // Assuming sorted by desc
                   
                   // Check against local storage or state to see if it's "new"
                   const lastSeenId = localStorage.getItem("lastSeenNotificationId");
                   
                   if (!lastSeenId || latest.id > parseInt(lastSeenId)) {
                       setCurrentNotification(latest);
                       setVisible(true);
                       localStorage.setItem("lastSeenNotificationId", latest.id);
                       
                       // Trigger Chrome Notification
                       if (Notification.permission === "granted") {
                           new Notification("New Notification", {
                               body: latest.message,
                               icon: "/vite.svg" // Replace with app icon
                           });
                       }
                       
                       // Hide visual popup after 5 seconds
                       setTimeout(() => setVisible(false), 5000);
                   }
                   setNotifications(data);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        // Poll every 30 seconds
        const intervalId = setInterval(fetchNotifications, 30000);
        fetchNotifications(); // Initial fetch

        return () => clearInterval(intervalId);
    }, [user]);

    if (!visible || !currentNotification) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#333',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxWidth: '300px',
            animation: 'slideIn 0.5s ease-out'
        }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>New Notification</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>{currentNotification.message}</p>
        </div>
    );
};

export default NotificationPopup;
