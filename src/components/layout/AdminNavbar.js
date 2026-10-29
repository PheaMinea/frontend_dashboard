import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiLogOut,
  FiBell,
  FiMenu,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiGlobe,
} from 'react-icons/fi';

import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { getImageUrl } from '../../utils/helpers';

// =====================================================
// ADMIN NAVBAR
// =====================================================

const AdminNavbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const { unreadCount } = useNotification();
  const isKhmer = language === 'km' || language === 'kh';

  const [showProfile, setShowProfile] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [avatarErr, setAvatarErr] = useState(false);

  const displayName = user?.full_name || user?.username || user?.name || 'Admin';
  const userEmail = user?.email || (isKhmer ? 'អ្នកគ្រប់គ្រងទូទៅ' : 'Administrator');
  const avatarUrl = user?.avatar_url || '';
  const firstLetter = displayName?.charAt(0)?.toUpperCase() || 'A';

  useEffect(() => {
    setAvatarErr(false);
  }, [avatarUrl]);

  const handleLogout = () => {
    setShowProfile(false);
    setShowLanguage(false);
    logout();
  };

  const handleLanguageChange = (selectedLanguage) => {
    changeLanguage(selectedLanguage);
    setShowLanguage(false);
  };

  const handleToggleLanguage = () => {
    setShowLanguage((prev) => !prev);
    setShowProfile(false);
  };

  const handleToggleProfile = () => {
    setShowProfile((prev) => !prev);
    setShowLanguage(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 lg:left-[270px] right-0 z-40 h-[72px] bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_12px_rgba(15,23,42,0.04)] ${
        isKhmer ? 'font-khmer' : 'font-english'
      }`}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* LEFT: MOBILE MENU TOGGLE */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Toggle menu"
          >
            <FiMenu size={22} />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 hidden sm:block">
              {isKhmer ? 'ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធ' : 'Administration Portal'}
            </h2>
          </div>
        </div>

        {/* RIGHT: NOTIFICATION, LANGUAGE & PROFILE */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* NOTIFICATION BUTTON */}
          <Link
            to="/messages"
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-[#2563EB] hover:bg-blue-50 transition"
            title="Messages"
          >
            <FiBell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* LANGUAGE SELECTOR */}
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <FiGlobe size={16} className="text-[#2563EB]" />
              <span className="uppercase">{language}</span>
              <FiChevronDown size={13} className={`transition-transform ${showLanguage ? 'rotate-180' : ''}`} />
            </button>

            {showLanguage && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLanguage(false)} />
                <div className="absolute right-0 top-[48px] z-50 w-36 bg-white border border-slate-200 rounded-xl shadow-xl p-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      language === 'en' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('km')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      language === 'km' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>ភាសាខ្មែរ</span>
                    {language === 'km' && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="w-[1px] h-6 bg-slate-200" />

          {/* USER PROFILE DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleProfile}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition"
            >
              <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden flex-shrink-0">
                {avatarUrl && !avatarErr ? (
                  <img
                    src={getImageUrl(avatarUrl)}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setAvatarErr(true)}
                  />
                ) : (
                  firstLetter
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight max-w-[120px] truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {user?.role ? user.role.toUpperCase() : 'SUPER_ADMIN'}
                </p>
              </div>
              <FiChevronDown size={14} className={`text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 top-[52px] z-50 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                        {avatarUrl && !avatarErr ? (
                          <img
                            src={getImageUrl(avatarUrl)}
                            alt={displayName}
                            className="w-full h-full object-cover rounded-full"
                            onError={() => setAvatarErr(true)}
                          />
                        ) : (
                          firstLetter
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfile(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#2563EB] transition"
                    >
                      <FiUser size={16} className="text-[#2563EB]" />
                      <span>{isKhmer ? 'ប្រវត្តិរូប Admin (Profile)' : 'My Profile'}</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setShowProfile(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      <FiSettings size={16} />
                      <span>{isKhmer ? 'ការកំណត់ (Settings)' : 'Settings'}</span>
                    </Link>
                  </div>

                  <div className="p-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition"
                    >
                      <FiLogOut size={16} />
                      <span>{t('common.logout') || (isKhmer ? 'ចាកចេញ' : 'Logout')}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
