<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display the notifications page
     */
    public function page()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return inertia('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Get notifications for the authenticated user
     */
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'link' => $notification->link,
                    'read' => $notification->read,
                    'created_at' => $notification->created_at,
                    'data' => $notification->data,
                ];
            });
        
        return response()->json($notifications);
    }
    
    /**
     * Get unread count
     */
    public function unreadCount()
    {
        $count = Notification::where('user_id', auth()->id())
            ->where('read', false)
            ->count();
        
        return response()->json(['count' => $count]);
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:notifications,id',
        ]);

        $notification = Notification::where('id', $validated['id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $notification->markAsRead();
        
        return response()->json(['success' => true]);
    }

    /**
     * Mark all as read
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);
        
        return response()->json(['success' => true]);
    }

    /**
     * Delete notification
     */
    public function destroy($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $notification->delete();
        
        return response()->json(['success' => true]);
    }

    /**
     * Clear all notifications
     */
    public function clearAll()
    {
        Notification::where('user_id', auth()->id())->delete();
        
        return response()->json(['success' => true]);
    }
}
