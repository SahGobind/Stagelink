import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, FileText, HardDrive } from 'lucide-react';
import Button from '../common/Button';

const MessageComposer = ({ onSendMessage }) => {
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

  return (
    <div className="border-t border-neutral-200 bg-white p-2.5 sm:p-4 space-y-2">
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
          placeholder="Type a message to casting directors..."
          aria-label="Message text"
          className="flex-1 bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-brand-navy placeholder-neutral-400 outline-none transition-colors min-w-0"
        />

        {/* Send Button */}
        <Button
          type="submit"
          size="sm"
          disabled={!text.trim() && !selectedFile}
          className="shrink-0 min-h-[40px] px-3 sm:px-4"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 mr-1 sm:mr-1.5" />
          <span className="hidden xs:inline sm:inline">Send</span>
        </Button>
      </form>

      {/* Demo Notice */}
      <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1 pt-0.5">
        <span className="flex items-center gap-1 truncate">
          <HardDrive className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="hidden sm:inline">Frontend Demo: Messages are simulated locally in session storage.</span>
          <span className="sm:hidden">Demo: messages stored locally.</span>
        </span>
        <span className="hidden md:inline shrink-0">Shift + Enter for new line</span>
      </div>
    </div>
  );
};

export default MessageComposer;
