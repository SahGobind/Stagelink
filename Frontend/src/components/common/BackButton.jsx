import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({
  to,
  fallback = '/',
  label = 'Back',
  className = '',
  variant = 'dark', // 'dark' | 'light'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else if (typeof window !== 'undefined' && window.history && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  const styleVariants = {
    dark: 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white shadow-2xs',
    light: 'bg-white hover:bg-gray-50 border border-gray-200/90 text-gray-700 hover:text-black shadow-2xs',
  };

  const chosenStyle = styleVariants[variant] || styleVariants.dark;

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${chosenStyle} ${className}`}
      title="Go back to previous page"
      aria-label={label ? `Go back: ${label}` : 'Go back'}
    >
      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 shrink-0" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;

