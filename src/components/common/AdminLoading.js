import React from 'react';

const AdminLoading = ({
  fullScreen = false,
  label = '',
  compact = false,
}) => {
  return (
    <div
      className={`${
        fullScreen
          ? 'fixed inset-0 z-[9999]'
          : compact
          ? 'min-h-[160px]'
          : 'min-h-[300px]'
      } flex flex-col items-center justify-center bg-transparent p-4`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center justify-center text-center">
        {/* Pure SVG Circular Spinner with NO Background */}
        <svg
          className="animate-spin text-[#2563EB]"
          style={{ width: compact ? '36px' : '48px', height: compact ? '36px' : '48px' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3.5"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>

        {label && (
          <p className="mt-3 text-xs sm:text-sm font-semibold text-slate-600">
            {label}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminLoading;
