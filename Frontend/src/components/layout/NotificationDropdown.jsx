import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  MessageSquare,
  Trophy,
  Film,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'interview_invitation':
    case 'audition':
      return {
        icon: Sparkles,
        bg: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case 'new_message':
      return {
        icon: MessageSquare,
        bg: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 'shortlisted':
      return {
        icon: Trophy,
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    case 'reminder':
      return {
        icon: Clock,
        bg: 'bg-purple-100 text-purple-800 border-purple-200',
      };
    default:
      return {
        icon: Film,
        bg: 'bg-pink-100 text-brand-pink border-pink-200',
      };
  }
};

const NotificationDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (notif) => {
    markAsRead(notif.id);
    onClose();
    if (notif.link) {
      navigate(notif.link);
    } else {
      navigate('/candidate/notifications');
    }
  };

  const notificationsViewAllLink =
    user?.role === 'admin' || user?.role === 'recruiter'
      ? '/admin/messages'
      : '/candidate/notifications';

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 text-left overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-50 text-brand-pink flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 font-serif">
              Notifications
            </h3>
            <p className="text-[10px] text-gray-500 font-medium">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-bold text-brand-pink hover:text-rose-700 hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title="Close notifications"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-700">No notifications yet</p>
            <p className="text-[11px] text-gray-400 max-w-[220px] mx-auto">
              Audition callbacks, casting invites, and messages will appear here.
            </p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notif) => {
            const iconConfig = getNotificationIcon(notif.type);
            const Icon = iconConfig.icon;

            return (
              <button
                key={notif.id}
                type="button"
                onClick={() => handleItemClick(notif)}
                className={`w-full p-3 sm:p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer group ${
                  notif.read ? 'bg-white hover:bg-gray-50/80' : 'bg-pink-50/40 hover:bg-pink-50/70'
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${iconConfig.bg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <h4
                      className={`text-xs truncate ${
                        notif.read ? 'font-semibold text-gray-800' : 'font-bold text-gray-900'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-pink shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{notif.timestamp}</span>
                    </span>

                    {notif.actionLabel && (
                      <span className="font-bold text-brand-pink group-hover:underline flex items-center gap-0.5">
                        <span>{notif.actionLabel}</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-gray-50/90 border-t border-gray-100 flex items-center justify-between text-xs">
        <Link
          to={notificationsViewAllLink}
          onClick={onClose}
          className="w-full py-1.5 text-center font-bold text-xs text-brand-navy hover:text-brand-pink transition-colors flex items-center justify-center gap-1.5"
        >
          <span>View All Notifications ({notifications.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
