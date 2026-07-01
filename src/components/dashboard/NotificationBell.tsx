"use client";

import { useState, useEffect } from "react";
import { Bell, Megaphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  publishedAt: string;
}

export function NotificationBell() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
        
        // Count unread based on localStorage last read time
        const lastRead = localStorage.getItem("SU_LAST_NOTIFICATION_READ");
        if (!lastRead) {
          setUnreadCount(data.announcements.length);
        } else {
          const lastReadTime = new Date(lastRead).getTime();
          const unread = data.announcements.filter(
            (ann: Announcement) => new Date(ann.publishedAt).getTime() > lastReadTime
          );
          setUnreadCount(unread.length);
        }
      }
    } catch {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = () => {
    localStorage.setItem("SU_LAST_NOTIFICATION_READ", new Date().toISOString());
    setUnreadCount(0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800/30";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800/30";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800/30";
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) handleMarkAsRead(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-7 w-7 rounded">
          <Bell className="h-3.5 w-3.5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded border shadow-md bg-[hsl(var(--card))] p-0 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <DropdownMenuLabel className="text-xs font-semibold flex items-center gap-1.5 p-0">
            <Megaphone className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            Bulletin Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-[8px] h-4 rounded-sm px-1 font-bold">
              {unreadCount} New
            </Badge>
          )}
        </div>

        <div className="max-h-[280px] overflow-y-auto">
          {loading && announcements.length === 0 ? (
            <div className="py-8 flex items-center justify-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching bulletins...
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-8 text-center text-[10px] text-[hsl(var(--muted-foreground))]">
              No recent announcements broadcasted.
            </div>
          ) : (
            announcements.map((ann) => (
              <div 
                key={ann.id} 
                className="p-3 border-b hover:bg-[hsl(var(--accent))] transition-colors space-y-1.5 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[11px] font-semibold text-[hsl(var(--foreground))] line-clamp-1">
                    {ann.title}
                  </h4>
                  <Badge variant="outline" className={`rounded-sm text-[7px] h-3.5 px-1 font-bold uppercase ${getPriorityColor(ann.priority)}`}>
                    {ann.priority}
                  </Badge>
                </div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] line-clamp-2 leading-normal">
                  {ann.content}
                </p>
                <p className="text-[8px] text-[hsl(var(--muted-foreground))/0.8] text-right font-medium">
                  {formatDate(ann.publishedAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
