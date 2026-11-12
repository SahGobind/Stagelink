import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Users,
  AlertCircle,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

const AdminNotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useNotifications();
  const { user } = useAuth();

  const [filterType, setFilterType] = useState('all');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'system',
    targetRole: 'all',
  });
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;

    addNotification({
      title: broadcastForm.title,
      message: broadcastForm.message,
      type: broadcastForm.type,
      time: 'Just now',
      read: false,
      sender: user?.fullName || 'StageLink Administration',
    });

    setIsBroadcastModalOpen(false);
    setBroadcastForm({ title: '', message: '', type: 'system', targetRole: 'all' });
    setSuccessMsg('Announcement successfully dispatched to platform members.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredNotifs = (notifications || []).filter((n) => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'system') return n.type === 'system';
    if (filterType === 'audition') return n.type === 'audition' || n.type === 'application';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">System Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit platform broadcast alerts, dispatch notices, and member communications.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Mark All as Read
            </button>
          )}
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Announcement</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        {['all', 'unread', 'system', 'audition'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all cursor-pointer ${
              filterType === type
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type === 'all' ? 'All Notifications' : type}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No notifications matching your filter.</p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                n.read ? 'hover:bg-slate-50/60' : 'bg-slate-50/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type === 'system'
                    ? 'bg-purple-50 text-purple-600'
                    : n.type === 'audition'
                    ? 'bg-[#FA5A36]/10 text-[#FA5A36]'
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs ${n.read ? 'text-slate-800' : 'font-bold text-slate-900'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.time || 'Recently'}</span>
                </div>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-[#FA5A36] shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Broadcast Platform Announcement"
      >
        <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs text-slate-700">
          <div>
            <label className="block font-semibold mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Scheduled Maintenance, Important Policy Update"
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#FA5A36]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Target Audience</label>
            <select
              value={broadcastForm.targetRole}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#FA5A36]"
            >
              <option value="all">All Platform Members (Artists & Studios)</option>
              <option value="candidate">Artists & Performers Only</option>
              <option value="recruiter">Production Studios Only</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Announcement Message *</label>
            <textarea
              rows={3}
              required
              placeholder="Write your announcement details here..."
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#FA5A36]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl font-semibold cursor-pointer"
            >
              Dispatch Announcement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminNotificationsPage;

