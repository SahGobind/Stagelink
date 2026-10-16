import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';

const FileUpload = ({
  label,
  accept = 'image/*,application/pdf',
  onFileSelect,
  file,
  onFileRemove,
  helperText = 'PNG, JPG, PDF up to 10MB',
  required,
  error,
}) => {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect?.(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
          {label} {required && <span className="text-brand-error">*</span>}
        </label>
      )}

      {file ? (
        <div className="flex items-center justify-between p-4 bg-brand-pink-light/40 border border-brand-pink/20 rounded-2xl animate-in fade-in duration-200">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-pink shadow-xs">
              <File className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-brand-navy truncate">{file.name}</p>
              <p className="text-xs text-brand-text-secondary flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
                <span>Ready to submit ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </p>
            </div>
          </div>
          {onFileRemove && (
            <button
              type="button"
              onClick={onFileRemove}
              className="text-gray-400 hover:text-brand-error p-1.5 rounded-lg hover:bg-white transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
            isDragOver
              ? 'border-brand-pink bg-brand-pink-light scale-[0.99]'
              : 'border-brand-border hover:border-brand-pink bg-white hover:bg-brand-pink-light/20'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileSelect?.(e.target.files[0]);
              }
            }}
          />
          <div className="w-12 h-12 rounded-2xl bg-brand-pink-light flex items-center justify-center text-brand-pink mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-brand-navy">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-brand-text-secondary mt-1">{helperText}</p>
        </div>
      )}

      {error && (
        <p className="text-xs text-brand-error font-medium flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
