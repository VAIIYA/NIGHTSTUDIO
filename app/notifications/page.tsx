"use client";

import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="text-center py-12">
        <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No notifications yet</p>
      </div>
    </div>
  );
}

