import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/Components/ui/dropdown-menu';
import { Badge } from '@/Components/ui/badge';
import { router } from '@inertiajs/react';

export function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(route('notifications.index'));
            const data = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        // Mark as read
        fetch(route('notifications.mark-read'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({ id: notification.id }),
        });

        // Navigate to link
        if (notification.link) {
            router.visit(notification.link);
        }
        
        setIsOpen(false);
    };

    const getNotificationIcon = (type) => {
        const iconClass = "h-4 w-4";
        switch (type) {
            case 'payment_pending':
            case 'payment_verified':
                return <span className="text-blue-600">💳</span>;
            case 'application_pending':
            case 'application_approved':
                return <span className="text-green-600">📄</span>;
            case 'certificate_issued':
                return <span className="text-purple-600">🎓</span>;
            default:
                return <span>🔔</span>;
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 font-semibold border-b">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                            ({unreadCount} unread)
                        </span>
                    )}
                </div>
                {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        No notifications
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 cursor-pointer ${
                                !notification.read ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex gap-3 w-full">
                                <div className="flex-shrink-0 mt-1">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatTimeAgo(notification.created_at)}
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-4 py-2 text-center">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => {
                                    setNotifications([]);
                                    setUnreadCount(0);
                                    setIsOpen(false);
                                }}
                            >
                                Clear all
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
