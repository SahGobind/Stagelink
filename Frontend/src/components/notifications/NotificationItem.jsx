import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  FileText,
  Clock,
  Trophy,
  Sparkles,
  Award,
  Film,
  Calendar,
  Check,
  ChevronRight,
} from 'lucide-react';

const NotificationItem = ({ notification, onMarkRead }) => {
  const navigate = useNavigate();
  if (!notification) return null;

  const getIconAndBadge = (type) => {
    switch (type) {
      case 'new_message':
        return {
          icon: MessageSquare,
          bgColor: 'bg-neutral-900 text-white',
          badgeText: 'Message',
        };
      case 'interview_invitation':
        return {
          icon: Sparkles,
          bgColor: 'bg-black text-white',
          badgeText: 'Audition Callback',
        };
      case 'shortlisted':
        return {
          icon: Trophy,
          bgColor: 'bg-amber-500 text-white',
          badgeText: 'Shortlisted',
        };
      case 'application_decision':
        return {
          icon: Award,
          bgColor: 'bg-emerald-600 text-white',
          badgeText: 'Casting Decision',
        };
      case 'application_under_review':
        return {
          icon: Clock,
          bgColor: 'bg-sky-600 text-white',
          badgeText: 'Under Review',
        };
      case 'application_submitted':
        return {
          icon: FileText,
          bgColor: 'bg-gray-700 text-white',
          badgeText: 'Submitted',
        };
      case 'matching_opportunity':
        return {
          icon: Film,
          bgColor: 'bg-brand-navy text-white',
          badgeText: 'Matching Role',
        };
      case 'reminder':
        return {
          icon: Calendar,
          bgColor: 'bg-amber-600 text-white',
          badgeText: 'Reminder',
        };
      default:
        return {
          icon: Sparkles,
          bgColor: 'bg-gray-600 text-white',
          badgeText: 'Notice',
        };
    }
  };

  const { icon: Icon, bgColor, badgeText } = getIconAndBadge(notification.type);

  const handleClickItem = () => {
    if (!notification.read) {
      onMarkRead?.(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkReadOnly = (e) => {
    e.stopPropagation();
    onMarkRead?.(notification.id);
  };

  return (
    <div
      onClick={handleClickItem}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClickItem();
        }
      }}
      className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer text-left ${
        notification.read
          ? 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-xs'
          : 'bg-neutral-50/70 border-gray-300 shadow-2xs hover:border-black'
      }`}
    >
      {/* Icon & Details */}
      <div className="flex items-start space-x-3.5 min-w-0 flex-1">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${bgColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
              {badgeText}
            </span>
            <span className="text-[11px] text-gray-400">
              {notification.timestamp}
            </span>
            {!notification.read && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-navy">
                <span className="w-2 h-2 rounded-full bg-black shrink-0" />
                <span>New</span>
              </span>
            )}
          </div>

          <h3
            className={`text-sm font-bold font-serif leading-tight ${
              notification.read ? 'text-brand-navy' : 'text-black'
            }`}
          >
            {notification.title}
          </h3>

          <p className="text-xs text-brand-text-secondary leading-relaxed">
            {notification.message}
          </p>
        </div>
      </div>

      {/* Action CTA & Mark as Read Button */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto justify-between sm:justify-end">
        {notification.link && (
          <span className="px-3 py-1.5 bg-white border border-gray-200 group-hover:border-black group-hover:bg-black group-hover:text-white rounded-xl text-xs font-bold text-brand-navy shadow-2xs flex items-center gap-1 transition-all">
            <span>{notification.actionLabel || 'View Details'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}

        {!notification.read && (
          <button
            type="button"
            onClick={handleMarkReadOnly}
            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
            title="Mark as read"
            aria-label="Mark notification as read"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
