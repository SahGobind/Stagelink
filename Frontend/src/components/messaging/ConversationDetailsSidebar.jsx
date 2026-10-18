import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Flag,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

const ConversationDetailsSidebar = ({
  conversation,
  onOpenReport,
  onArchiveToggle,
}) => {
  if (!conversation) return null;

  const { participant, opportunity, sharedFiles = [], isArchived } = conversation;

  return (
    <div className="w-80 lg:w-88 border-l border-gray-100 bg-white flex flex-col h-full overflow-y-auto text-left select-none p-5 space-y-6">
      {/* 1. CASTING CONTACT OVERVIEW */}
      <div className="text-center space-y-2 pb-5 border-b border-gray-100">
        <div className="relative inline-block">
          <img
            src={participant?.avatar}
            alt={participant?.name}
            className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-gray-100 shadow-xs"
          />
          {participant?.verified && (
            <span
              className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full ring-2 ring-white"
              title="Verified Casting Director"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-brand-navy font-serif">
            {participant?.name}
          </h3>
          <p className="text-xs font-semibold text-brand-navy/70">
            {participant?.organization}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {participant?.role || 'Casting Director'}
          </p>
        </div>

        {/* Quick status pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{conversation.isOperationsTeam ? 'Official StageLink Operations' : 'Verified StageLink Casting Partner'}</span>
        </div>
      </div>

      {/* 2. RELATED CASTING OPPORTUNITY OR OPERATIONS DESK CARD */}
      {conversation.isOperationsTeam ? (
        <div className="space-y-3 pb-5 border-b border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
            Operations & Support Desk
          </h4>
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5 text-xs text-brand-navy">
            <p className="font-bold text-emerald-950 flex items-center gap-1.5">
              <span>🌟 Dedicated Performer Support</span>
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Text our operations team directly with any questions about audition callbacks, profile approval, shoot logistics, and payment receipts.
            </p>
            <div className="pt-2 border-t border-emerald-200/60 text-[10px] text-emerald-900 space-y-1 font-medium">
              <div>⏰ Desk Hours: Mon - Sat (9:00 AM - 8:00 PM IST)</div>
              <div>⚡ Response Time: Typically under 15 minutes</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Related Opportunity
            </h4>
            {opportunity?.id && (
              <Link
                to={`/opportunities/${opportunity.id}`}
                className="text-[11px] font-bold text-brand-navy hover:underline flex items-center gap-1"
              >
                <span>Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          {opportunity ? (
            <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 space-y-3">
            {opportunity.image && (
              <div className="h-28 rounded-xl overflow-hidden relative">
                <img
                  src={opportunity.image}
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                  {opportunity.category || 'Casting Call'}
                </div>
              </div>
            )}

            <div>
              <h5 className="text-xs font-bold text-brand-navy line-clamp-1">
                {opportunity.title}
              </h5>
              <p className="text-[11px] font-semibold text-brand-pink mt-0.5">
                Role: {opportunity.role || 'Principal Role'}
              </p>
            </div>

            <div className="space-y-1 text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
              {opportunity.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span>{opportunity.location}</span>
                </div>
              )}
              {opportunity.compensation && (
                <div className="flex items-center gap-1.5 font-semibold text-brand-navy">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{opportunity.compensation}</span>
                </div>
              )}
              {opportunity.deadline && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>Audition Deadline: {opportunity.deadline}</span>
                </div>
              )}
            </div>

            <Link
              to={`/opportunities/${opportunity.id}`}
              className="block w-full text-center py-2 px-3 bg-white border border-gray-200 hover:border-black rounded-xl text-xs font-bold text-brand-navy transition-colors shadow-2xs"
            >
              View Full Casting Call
            </Link>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gray-50 text-center text-xs text-gray-400">
              No specific opportunity linked to this thread.
            </div>
          )}
        </div>
      )}

      {/* 3. SHARED AUDITION FILES & SIDES */}
      <div className="space-y-3 pb-5 border-b border-gray-100 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
            Shared Files & Sides ({sharedFiles.length})
          </h4>
        </div>

        {sharedFiles.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No files exchanged yet.</p>
        ) : (
          <div className="space-y-2">
            {sharedFiles.map((file) => (
              <div
                key={file.id || file.name}
                className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-100/60 flex items-center justify-between gap-2 transition-colors"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand-navy truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {file.size} • {file.date}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    alert(`Downloaded local demo preview for: ${file.name}`);
                  }}
                  className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-white transition-colors"
                  title="Download file preview"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. ACTIONS & SAFETY */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onArchiveToggle}
          className="w-full text-center py-2 px-3 bg-gray-100 hover:bg-gray-200 text-brand-navy text-xs font-semibold rounded-xl transition-colors"
        >
          {isArchived ? 'Unarchive Conversation' : 'Archive Conversation'}
        </button>

        <button
          type="button"
          onClick={onOpenReport}
          className="w-full text-center py-2 px-3 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report Conversation</span>
        </button>

        <p className="text-[10px] text-gray-400 text-center leading-normal pt-1">
          StageLink Talent Trust & Safety • Communications are reviewed upon report submission.
        </p>
      </div>
    </div>
  );
};

export default ConversationDetailsSidebar;
