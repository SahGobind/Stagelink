import React from 'react';
import { Check, CheckCheck, FileText, Download } from 'lucide-react';

const MessageBubble = ({ message, participantName }) => {
  if (!message) return null;

  const isOwn = Boolean(message.isOwn);

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-4 group`}>
      {/* Sender Subtitle if incoming */}
      {!isOwn && (
        <span className="text-[11px] font-bold text-gray-500 mb-1 ml-1">
          {message.senderName || participantName}
        </span>
      )}

      {/* Bubble Container */}
      <div
        className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs space-y-2 transition-all ${
          isOwn
            ? 'bg-black text-white rounded-br-xs'
            : 'bg-white border border-gray-200 text-brand-navy rounded-bl-xs'
        }`}
      >
        {/* Message Text */}
        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* Attachment Card if present */}
        {message.attachment && (
          <div
            className={`p-2.5 rounded-xl flex items-center justify-between gap-3 border ${
              isOwn
                ? 'bg-neutral-900 border-neutral-700 text-white'
                : 'bg-gray-50 border-gray-200 text-brand-navy'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isOwn ? 'bg-neutral-800 text-white' : 'bg-white border border-gray-200 text-black'
                }`}
              >
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{message.attachment.name}</p>
                <p
                  className={`text-[10px] ${
                    isOwn ? 'text-neutral-400' : 'text-gray-400'
                  }`}
                >
                  {message.attachment.size || 'Audition File'} • Local Attachment
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(`Downloaded local demo preview for: ${message.attachment.name}`);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isOwn
                  ? 'hover:bg-neutral-800 text-neutral-300'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Meta (Timestamp & Read Receipt) */}
      <div
        className={`flex items-center gap-1.5 text-[10px] text-gray-400 mt-1 px-1 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}
      >
        <span>{message.timestamp}</span>

        {isOwn && (
          <span className="flex items-center gap-0.5">
            {message.readStatus === 'read' ? (
              <span className="flex items-center text-emerald-600" title="Read">
                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-[9px] font-semibold ml-0.5">Read</span>
              </span>
            ) : (
              <span className="flex items-center text-gray-400" title="Delivered">
                <Check className="w-3.5 h-3.5" />
                <span className="text-[9px] ml-0.5">Sent</span>
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
