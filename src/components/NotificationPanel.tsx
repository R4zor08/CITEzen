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
        return <CheckCircle2Icon className="h-5 w-5 text-green-400 shrink-0" />;
      case 'comment':
        return <MessageSquareIcon className="h-5 w-5 text-blue-400 shrink-0" />;
      case 'assignment':
        return <AlertCircleIcon className="h-5 w-5 text-orange-400 shrink-0" />;
      default:
        return <InfoIcon className="h-5 w-5 text-purple-400 shrink-0" />;
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
    <div className="w-full max-w-full sm:max-w-2xl lg:max-w-3xl mx-auto overflow-hidden animate-fade-in flex flex-col glass-panel border border-white/10 rounded-2xl shadow-2xl min-h-[min(70vh,640px)] sm:min-h-[60vh] max-h-[calc(100dvh-8rem)] sm:max-h-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 lg:p-6 border-b border-white/10 bg-dark-700/50 shrink-0">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="h-11 w-11 sm:h-10 sm:w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
            <BellIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Your Notifications
              </h3>
              {unreadCount > 0 &&
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-purple-500/20 px-2 text-xs font-bold text-purple-400 border border-purple-500/30">
                  {unreadCount} new
                </span>
              }
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Stay updated on your concerns
            </p>
          </div>
        </div>
        {unreadCount > 0 &&
        <button
          type="button"
          onClick={() => void onMarkAllRead()}
          className="w-full sm:w-auto min-h-[44px] sm:min-h-0 text-sm font-medium px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white flex items-center justify-center gap-2 transition-colors touch-manipulation shrink-0">
          
            <CheckIcon className="h-4 w-4 shrink-0" /> Mark all read
          </button>
        }
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-2.5 sm:space-y-3 custom-scrollbar">
        {notifications.length === 0 ?
        <div className="flex flex-col items-center justify-center min-h-[240px] sm:min-h-[320px] text-gray-500 space-y-4 py-12 px-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <BellIcon className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-sm sm:text-base max-w-xs leading-relaxed">
              You're all caught up!
              <br />
              <span className="text-gray-500">No new notifications.</span>
            </p>
          </div> :

        notifications.map((notification) =>
        <button
          key={notification.id}
          type="button"
          onClick={() => {
            if (!notification.read) void onMarkRead(notification.id);
          }}
          className={`w-full text-left flex gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all touch-manipulation border ${notification.read ? 'opacity-80 hover:bg-white/5 border-transparent' : 'bg-white/5 border-white/10 hover:bg-white/10 shadow-md'}`}>
          
              <div
            className={`mt-0.5 flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${notification.read ? 'bg-dark-800 border border-white/5' : 'bg-dark-700 border border-white/10'}`}>
            
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 mb-1">
                  <h4
                className={`text-sm sm:text-base leading-snug ${notification.read ? 'font-medium text-gray-300' : 'font-semibold text-white'}`}>
                
                    {notification.title}
                  </h4>
                  <span className="text-[11px] sm:text-xs text-gray-500 shrink-0 font-medium">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                <p
              className={`text-xs sm:text-sm leading-relaxed ${notification.read ? 'text-gray-500' : 'text-gray-400'}`}>
              
                  {notification.message}
                </p>
              </div>
              {!notification.read &&
          <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.8)] self-start sm:mt-3" aria-hidden />
          }
            </button>
        )
        }
      </div>
    </div>);

}
