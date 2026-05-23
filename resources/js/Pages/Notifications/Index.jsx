import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Trash2, Mail, MailOpen, Clock, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function NotificationsPage({ notifications }) {
    const { toast } = useToast();
    const [localNotifications, setLocalNotifications] = useState(notifications.data);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            case 'info':
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getNotificationBadgeColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'info':
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post('/notifications/mark-read', { id: notificationId });
            
            setLocalNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );

            toast({
                title: "Marked as read",
                description: "Notification has been marked as read.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to mark notification as read.",
                variant: "destructive",
            });
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            
            setLocalNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );

            toast({
                title: "All marked as read",
                description: "All notifications have been marked as read.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to mark all notifications as read.",
                variant: "destructive",
            });
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`/notifications/${notificationId}`);
            
            setLocalNotifications(prev =>
                prev.filter(notif => notif.id !== notificationId)
            );

            toast({
                title: "Deleted",
                description: "Notification has been deleted.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete notification.",
                variant: "destructive",
            });
        }
    };

    const clearAll = async () => {
        if (!confirm('Are you sure you want to delete all notifications?')) return;

        try {
            await axios.delete('/notifications');
            
            setLocalNotifications([]);

            toast({
                title: "All cleared",
                description: "All notifications have been deleted.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to clear notifications.",
                variant: "destructive",
            });
        }
    };

    const unreadCount = localNotifications.filter(n => !n.read).length;

    return (
        <SidebarProvider>
            <Head title="Notifications" />
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Notifications</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gray-50">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell className="h-6 w-6 text-blue-600" />
                                    <div>
                                        <CardTitle>Notifications</CardTitle>
                                        <CardDescription>
                                            Stay updated on your application status and important updates
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                            {unreadCount} unread
                                        </Badge>
                                    )}
                                    {localNotifications.length > 0 && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={markAllAsRead}
                                                disabled={unreadCount === 0}
                                            >
                                                <CheckCheck className="h-4 w-4 mr-2" />
                                                Mark all read
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearAll}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Clear all
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {localNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No notifications yet
                                    </h3>
                                    <p className="text-gray-600">
                                        You'll see updates about your applications here
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {localNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 rounded-lg border transition-all ${
                                                notification.read
                                                    ? 'bg-white border-gray-200'
                                                    : 'bg-blue-50 border-blue-200'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-semibold text-gray-900">
                                                                {notification.title}
                                                            </h4>
                                                            <Badge
                                                                variant="outline"
                                                                className={getNotificationBadgeColor(notification.type)}
                                                            >
                                                                {notification.type}
                                                            </Badge>
                                                            {!notification.read && (
                                                                <Badge variant="secondary" className="bg-blue-600 text-white">
                                                                    New
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {!notification.read && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    title="Mark as read"
                                                                >
                                                                    <MailOpen className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteNotification(notification.id)}
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDate(notification.created_at)}
                                                        </div>
                                                        {notification.link && (
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="h-auto p-0 text-blue-600"
                                                                onClick={() => router.visit(notification.link)}
                                                            >
                                                                View details →
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
