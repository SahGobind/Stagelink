import React, { useState, useMemo } from 'react';
import { Bell, CheckCheck, Inbox, ShieldCheck } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import NotificationFilters from '../../components/notifications/NotificationFilters';
import NotificationItem from '../../components/notifications/NotificationItem';
import EmptyState from '../../components/common/EmptyState';
import { useNotifications } from '../../context/NotificationContext';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'messages' | 'applications' | 'opportunities' | 'reminders'

  // Dynamic counts for each filter category
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      messages: notifications.filter((n) => n.category === 'messages' || n.type === 'new_message').length,
      applications: notifications.filter(
        (n) =>
          n.category === 'applications' ||
          n.type === 'application_submitted' ||
          n.type === 'application_under_review' ||
          n.type === 'shortlisted' ||
          n.type === 'interview_invitation' ||
          n.type === 'application_decision'
      ).length,
      opportunities: notifications.filter(
        (n) => n.category === 'opportunities' || n.type === 'matching_opportunity'
      ).length,
      reminders: notifications.filter((n) => n.category === 'reminders' || n.type === 'reminder').length,
    };
  }, [notifications]);

  // Filtered notification list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'messages') {
        return notif.category === 'messages' || notif.type === 'new_message';
      }
      if (activeFilter === 'applications') {
        return (
          notif.category === 'applications' ||
          notif.type === 'application_submitted' ||
          notif.type === 'application_under_review' ||
          notif.type === 'shortlisted' ||
          notif.type === 'interview_invitation' ||
          notif.type === 'application_decision'
        );
      }
      if (activeFilter === 'opportunities') {
        return notif.category === 'opportunities' || notif.type === 'matching_opportunity';
      }
      if (activeFilter === 'reminders') {
        return notif.category === 'reminders' || notif.type === 'reminder';
      }
      return true;
    });
  }, [notifications, activeFilter]);

  return (
    <PageContainer maxWidth="lg" className="space-y-6 text-left py-6 pb-24">
      {/* Header and Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold">
              <Bell className="w-3.5 h-3.5" />
              <span>Casting Activity Feed</span>
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
            Notifications & Audition Alerts
          </h1>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Stay up to date on casting reviews, callback invitations, direct studio messages, and deadlines.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="px-4 py-2 bg-white border border-gray-200 hover:border-black rounded-xl text-xs font-bold text-brand-navy shadow-2xs flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <NotificationFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      {/* Notifications Feed */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications in this category"
          description={
            activeFilter === 'all'
              ? 'You have caught up with all casting updates, auditions, and direct messages.'
              : `There are currently no alerts under the ${activeFilter} filter.`
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={markAsRead}
            />
          ))}
        </div>
      )}

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>StageLink Verified Casting Notifications • Official Auditions and Legitimate Productions Only</span>
        </div>
      </div>
    </PageContainer>
  );
};

export default NotificationsPage;
