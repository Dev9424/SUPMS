import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Notifications({ user }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async() => {
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const fetchUnreadCount = async() => {
        try {
            const res = await axios.get('/notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const markAsRead = async(id) => {
        try {
            await axios.put(`/notifications/${id}/read`);
            fetchNotifications();
            fetchUnreadCount();
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async() => {
        try {
            await axios.put('/notifications/read-all');
            fetchNotifications();
            fetchUnreadCount();
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const deleteNotification = async(id) => {
        try {
            await axios.delete(`/notifications/${id}`);
            fetchNotifications();
            fetchUnreadCount();
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            fetchNotifications();
            fetchUnreadCount();
        }
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    const getTypeIcon = (type) => {
        const icons = {
            appointment: '📅',
            visit: '🏥',
            payment: '💰',
            general: '📢'
        };
        return icons[type] || icons.general;
    };

    return (
        <div className="notifications-container">
            <button 
                className="notification-bell"
                onClick={toggleDropdown}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="badge">{unreadCount}</span>
                )}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="mark-all-btn">
                                Mark all as read
                            </button>
                        )}
                        <button onClick={() => setShowDropdown(false)} className="close-btn">✕</button>
                    </div>

                    <div className="dropdown-content">
                        {notifications.length === 0 ? (
                            <p className="no-notifications">No notifications</p>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="notification-icon">
                                        {getTypeIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <span className="time-ago">{getTimeAgo(notification.created_at)}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                        className="delete-btn"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notifications;
