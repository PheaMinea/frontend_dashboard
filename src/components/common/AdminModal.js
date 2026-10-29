import React from 'react';
import { FiX } from 'react-icons/fi';

const AdminModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label="Close modal"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-76px)] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
