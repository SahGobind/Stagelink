import React from 'react';

const PageContainer = ({
  children,
  className = '',
  maxWidth = '7xl',
}) => {
  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px]',
    '2xl': 'max-w-[1536px]',
    '7xl': 'max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px]',
    full: 'max-w-full',
  };

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 md:px-8 xl:px-10 py-5 sm:py-7 ${maxWidths[maxWidth] || maxWidths['7xl']} ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
