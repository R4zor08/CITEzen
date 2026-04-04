import React from 'react';
import { Notification } from '../types';
import {
  BellIcon,
  CheckIcon,
  CheckCircle2Icon,
  MessageSquareIcon,
  AlertCircleIcon,
  InfoIcon } from
'lucide-react';
interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}
export function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkAllRead
}: NotificationPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle2Icon className="h-4 w-4 text-green-400" />;
      case 'comment':
        return <MessageSquareIcon className="h-4 w-4 text-blue-400" />;
      case 'assignment':
        return <AlertCircleIcon className="h-4 w-4 text-orange-400" />;
      default:
        return <InfoIcon className="h-4 w-4 text-purple-400" />;
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <div className="w-full mx-auto overflow-hidden animate-fade-in flex flex-col bg-dark-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 min-h-[60vh]">
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-dark-700/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <BellIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Your Notifications
            </h3>
            <p className="text-sm text-gray-400">
              Stay updated on your concerns
            </p>
          </div>
          {unreadCount > 0 &&
          <span className="ml-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-purple-500/20 px-2 text-xs font-bold text-purple-400 border border-purple-500/30">
              {unreadCount} new
            </span>
          }
        </div>
        {unreadCount > 0 &&
        <button
          onClick={onMarkAllRead}
          className="text-sm font-medium px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors">
          
            <CheckIcon className="h-4 w-4" /> Mark all read
          </button>
        }
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
        {notifications.length === 0 ?
        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
              <BellIcon className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-base">
              You're all caught up!
              <br />
              No new notifications.
            </p>
          </div> :

        notifications.map((notification) =>
        <div
          key={notification.id}
          onClick={() => !notification.read && onMarkRead(notification.id)}
          className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer ${notification.read ? 'opacity-70 hover:bg-white/5' : 'bg-white/5 border border-white/10 hover:bg-white/10 shadow-lg'}`}>
          
              <div
            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.read ? 'bg-dark-800' : 'bg-dark-700 border border-white/5'}`}>
            
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h4
                className={`text-base truncate ${notification.read ? 'font-medium text-gray-300' : 'font-semibold text-white'}`}>
                
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                <p
              className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-400'}`}>
              
                  {notification.message}
                </p>
              </div>
              {!notification.read &&
          <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mt-3 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
          }
            </div>
        )
        }
      </div>
    </div>);

}