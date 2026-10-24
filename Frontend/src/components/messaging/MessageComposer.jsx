import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, FileText, HardDrive, Sparkles, MessageCircle } from 'lucide-react';
import Button from '../common/Button';

const OPERATIONS_QUICK_CHIPS = [
  'Hi Operations Team, could you please check my profile verification status?',
  'Hello! I have a question regarding my upcoming audition schedule.',
  'Hi team, can you assist with my banking and compensation details?',
  'Hello, I would like to confirm call sheet and shoot location details.',
];

const STAFF_QUICK_CHIPS = [
  'Your profile verification has been approved.',
  'Your audition callback details have been updated.',
  'Please upload an updated video reel or headshot.',
  'Your support inquiry has been resolved.',
];

const MessageComposer = ({
  onSendMessage,
  isOperationsTeam = false,
  isStaff = false,
  participantName = '',
}) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || 'document',
        isLocalPreview: true,
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    onSendMessage({
      text: text.trim(),
      attachment: selectedFile,
    });

    setText('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSelectQuickChip = (chipText) => {
    setText(chipText);
  };

  return (
    <div className="border-t border-neutral-200 bg-white p-2.5 sm:p-4 space-y-2.5">
      {/* Quick Prompts for Staff or Candidate */}
      {isStaff ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
            <Sparkles className="w-3 h-3 text-indigo-600 fill-indigo-600" />
            <span>Staff Quick Replies:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {STAFF_QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuickChip(chip)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-medium transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      ) : isOperationsTeam ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
            <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-600" />
            <span>Quick Text Topics:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {OPERATIONS_QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuickChip(chip)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-medium transition-colors cursor-pointer"
              >
                {chip.length > 40 ? chip.substring(0, 38) + '...' : chip}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* File Preview Chip if attached */}
      {selectedFile && (
        <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
          <div className="flex items-center gap-2 truncate min-w-0">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate min-w-0">
              <p className="font-bold text-brand-navy truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-neutral-400">
                {selectedFile.size} • Local browser preview
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors shrink-0"
            title="Remove attachment"
            aria-label="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Composer Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov"
          aria-label="Attach local media or resume file"
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 sm:p-2.5 text-neutral-500 hover:text-black rounded-xl hover:bg-neutral-100 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black min-h-[40px] min-w-[40px] flex items-center justify-center"
          title="Select local document or demo reel file"
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isStaff
              ? `Reply to ${participantName || 'member'}...`
              : isOperationsTeam
              ? 'Text our operations team (e.g., verification, auditions, payouts)...'
              : 'Type a message to casting directors...'
          }
          aria-label="Message text"
          className="flex-1 bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-brand-navy placeholder-neutral-400 outline-none transition-colors min-w-0"
        />

        {/* Send Button */}
        <Button
          type="submit"
          size="sm"
          disabled={!text.trim() && !selectedFile}
          className="shrink-0 min-h-[40px] px-3 sm:px-4 bg-black hover:bg-neutral-800 text-white font-bold"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 mr-1 sm:mr-1.5" />
          <span className="hidden xs:inline sm:inline">Send</span>
        </Button>
      </form>

      {/* Info notice */}
      <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1 pt-0.5">
        <span className="flex items-center gap-1 truncate">
          <HardDrive className="w-3 h-3 text-neutral-400 shrink-0" />
          {isOperationsTeam ? (
            <span>Direct channel to StageLink Operations Desk. Responses typically under 15 mins.</span>
          ) : (
            <span>Safe StageLink messaging with casting directors and studios.</span>
          )}
        </span>
        <span className="hidden md:inline shrink-0">Press Enter to send</span>
      </div>
    </div>
  );
};

export default MessageComposer;

