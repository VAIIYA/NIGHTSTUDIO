"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Bell, Heart, MessageCircle, UserPlus, Eye, Crown, Repeat2, Check, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notification } from "@/types";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount
} from "@/lib/server-actions";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  unlock: Eye,
  subscription: Crown,
  repost: Repeat2,
};

export default function NotificationsPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (connected && publicKey) {
      loadNotifications();
    } else {
      setIsLoading(false);
    }
  }, [connected, publicKey]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const [fetchedNotifications, count] = await Promise.all([
        getNotifications(publicKey!.toString(), 100, 0),
        getUnreadNotificationCount(publicKey!.toString())
      ]);
      setNotifications(fetchedNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId, publicKey!.toString());
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(publicKey!.toString());
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId, publicKey!.toString());
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.postId) {
      router.push(`/post/${notification.postId}`);
    } else if (notification.type === 'follow' && notification.sender) {
      router.push(`/profile/${notification.sender}`);
    }
  };

  if (!connected || !publicKey) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please connect your wallet to view notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            When people interact with your content, you&apos;ll see them here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type];
            return (
              <div
                key={notification.id}
                className={`glass-card p-4 hover:border-primary/30 transition-all cursor-pointer ${!notification.isRead ? 'border-primary/40 bg-primary/5 shadow-primary/10' : ''
                  }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${notification.type === 'like' ? 'bg-red-500/10 text-red-500' :
                      notification.type === 'comment' ? 'bg-blue-500/10 text-blue-500' :
                        notification.type === 'follow' ? 'bg-green-500/10 text-green-500' :
                          notification.type === 'unlock' ? 'bg-purple-500/10 text-purple-500' :
                            notification.type === 'subscription' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-orange-500/10 text-orange-500'
                    }`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                      {notification.amount && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {notification.amount} USDC
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="p-1"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

