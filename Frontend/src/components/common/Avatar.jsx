import React from 'react';

const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const statusSizes = {
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2',
  };

  const getInitials = (n) => {
    if (!n) return 'SC';
    return n
      .trim()
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-brand-pink-light text-brand-pink font-semibold border border-brand-pink/20 select-none shadow-subtle ${
          sizes[size] || sizes.md
        }`}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'User Avatar'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-white ${
            status === 'online'
              ? 'bg-brand-success'
              : status === 'busy'
              ? 'bg-brand-pink'
              : 'bg-gray-400'
          } ${statusSizes[size] || statusSizes.md}`}
        />
      )}
    </div>
  );
};

export default Avatar;
