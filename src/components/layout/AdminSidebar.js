import React from 'react';
import { NavLink } from 'react-router-dom';

import {
  FiHome,
  FiImage,
  FiVideo,
  FiBookOpen,
  FiStar,
  FiAward,
  FiMessageSquare,
  FiSettings,
  FiX,
  FiLayers,
  FiHeart,
  FiUser,
} from 'react-icons/fi';

import { useLanguage } from '../../contexts/LanguageContext';
import logo from './SC ACADEMY new.png';

// ==========================================
// ADMIN SIDEBAR
// ==========================================

const AdminSidebar = ({
  isOpen = false,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const isKhmer = language === 'km' || language === 'kh';

  // ==========================================
  // MENU ITEMS
  // ==========================================

  const menuItems = [
    {
      key: 'admin.dashboard',
      name: t('admin.dashboard') || (isKhmer ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard'),
      path: '/',
      icon: FiHome,
    },
    {
      key: 'admin.gallery',
      name: t('admin.gallery') || (isKhmer ? 'វិចិត្រសាល' : 'Gallery'),
      path: '/gallery',
      icon: FiImage,
    },
    {
      key: 'admin.videos',
      name: t('admin.videos') || (isKhmer ? 'វីដេអូ' : 'Videos'),
      path: '/videos',
      icon: FiVideo,
    },
    {
      key: 'admin.courses',
      name: t('admin.courses') || (isKhmer ? 'វគ្គសិក្សា' : 'Courses'),
      path: '/courses',
      icon: FiBookOpen,
    },
    {
      key: 'admin.schools',
      name: t('admin.schools') || (isKhmer ? 'សាលារៀន' : 'Schools'),
      path: '/schools',
      icon: FiLayers,
    },
    {
      key: 'admin.alumni',
      name: t('admin.alumni') || (isKhmer ? 'អតីតសិស្ស' : 'Alumni'),
      path: '/alumni',
      icon: FiAward,
    },
    {
      key: 'admin.charity',
      name: t('admin.charity') || (isKhmer ? 'សប្បុរសធម៌' : 'Charity'),
      path: '/charity',
      icon: FiHeart,
    },
    {
      key: 'admin.testimonials',
      name: t('admin.testimonials') || (isKhmer ? 'មតិយោបល់' : 'Testimonials'),
      path: '/testimonials',
      icon: FiStar,
    },
    {
      key: 'admin.messages',
      name: t('admin.messages') || (isKhmer ? 'សារ' : 'Messages'),
      path: '/messages',
      icon: FiMessageSquare,
    },
    {
      key: 'admin.settings',
      name: t('admin.settings') || (isKhmer ? 'ការកំណត់' : 'Settings'),
      path: '/settings',
      icon: FiSettings,
    },
    {
      key: 'admin.profile',
      name: isKhmer ? 'ប្រវត្តិរូប Admin' : 'Admin Profile',
      path: '/profile',
      icon: FiUser,
    },
  ];

  // ==========================================
  // CLOSE MOBILE SIDEBAR
  // ==========================================

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <>
      {/* ======================================
          MOBILE OVERLAY
      ====================================== */}
      {isOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-blue-950/70
            backdrop-blur-[2px]
            lg:hidden
          "
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}
      <aside
        className={`
          fixed
          top-0
          left-0
          z-50
          w-[270px]
          h-screen
          bg-gradient-to-b
          from-[#071a3d]
          via-[#0b2d63]
          to-[#071a3d]
          text-white
          border-r
          border-white/10
          shadow-xl
          transition-transform
          duration-300
          ease-in-out
          lg:translate-x-0
          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
          ${isKhmer ? 'font-khmer' : 'font-english'}
        `}
      >
        {/* ====================================
            BRAND HEADER
        ==================================== */}
        <div
          className="
            h-[84px]
            px-4
            flex
            items-center
            justify-between
            border-b
            border-white/10
          "
        >
          {/* LOGO + BRAND */}
          <NavLink
            to="/"
            onClick={handleClose}
            className="
              flex
              items-center
              gap-3
              min-w-0
            "
          >
            {/* LOGO */}
            <div
              className="
                w-12
                h-12
                flex
                items-center
                justify-center
                flex-shrink-0
                bg-white
                rounded-full
                p-1.5
                shadow-md
              "
            >
              <img
                src={logo}
                alt="SC Academy"
                className="w-full h-full object-contain"
              />
            </div>

            {/* BRAND TEXT */}
            <div className="min-w-0">
              <h2
                className="
                  text-sm
                  font-extrabold
                  tracking-[0.14em]
                  text-white
                  leading-none
                  truncate
                "
              >
                SC ACADEMY
              </h2>

              <p
                className="
                  text-[10px]
                  font-medium
                  text-white/50
                  mt-1
                  truncate
                "
              >
                {t('admin.controlPanel') || (isKhmer ? 'ផ្ទាំងគ្រប់គ្រងទូទៅ' : 'Admin Control Panel')}
              </p>
            </div>
          </NavLink>

          {/* MOBILE CLOSE BUTTON */}
          <button
            type="button"
            onClick={handleClose}
            className="
              lg:hidden
              w-9
              h-9
              flex
              items-center
              justify-center
              flex-shrink-0
              rounded-lg
              bg-white/5
              text-white/60
              hover:bg-red-600
              hover:text-white
              transition-all
              duration-200
            "
            aria-label="Close sidebar"
          >
            <FiX size={19} />
          </button>
        </div>

        {/* ====================================
            NAVIGATION
        ==================================== */}
        <nav
          className="
            px-3
            pt-4
            pb-5
            overflow-y-auto
            scrollbar-thin
          "
          style={{
            height: 'calc(100vh - 84px)',
          }}
        >
          {/* ==================================
              MANAGEMENT LABEL
          ================================== */}
          <div
            className="
              flex
              items-center
              gap-2
              px-3
              mb-2
            "
          >
            <span
              className="
                w-1.5
                h-1.5
                bg-red-500
                rounded-full
                flex-shrink-0
              "
            />
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-white/40
                truncate
              "
            >
              {t('admin.management') || (isKhmer ? 'ការគ្រប់គ្រង' : 'MANAGEMENT')}
            </p>
          </div>

          {/* ==================================
              MENU ITEMS
          ================================== */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={handleClose}
                  className={({ isActive }) => `
                    relative
                    group
                    min-h-[46px]
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2
                    rounded-lg
                    text-[13px]
                    font-medium
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? `
                          bg-white
                          text-blue-900
                          shadow-sm
                        `
                        : `
                          text-white/60
                          hover:bg-white/10
                          hover:text-white
                        `
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* ACTIVE LEFT LINE */}
                      {isActive && (
                        <span
                          className="
                            absolute
                            left-0
                            top-1/2
                            -translate-y-1/2
                            w-[3px]
                            h-6
                            bg-red-600
                            rounded-r-full
                          "
                        />
                      )}

                      {/* ICON */}
                      <div
                        className={`
                          w-8
                          h-8
                          flex
                          items-center
                          justify-center
                          rounded-lg
                          flex-shrink-0
                          transition-all
                          duration-200
                          ${
                            isActive
                              ? `
                                bg-blue-50
                                text-blue-900
                              `
                              : `
                                bg-white/5
                                text-white/40
                                group-hover:bg-white/10
                                group-hover:text-white
                              `
                          }
                        `}
                      >
                        <Icon size={17} />
                      </div>

                      {/* MENU NAME */}
                      <span className="flex-1 truncate">
                        {item.name}
                      </span>

                      {/* ACTIVE DOT */}
                      {isActive && (
                        <span
                          className="
                            w-1.5
                            h-1.5
                            bg-red-600
                            rounded-full
                            flex-shrink-0
                          "
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* ==================================
              DIVIDER
          ================================== */}
          <div
            className="
              h-px
              bg-white/10
              my-4
              mx-2
            "
          />

          {/* ==================================
              SYSTEM STATUS
          ================================== */}
          <div
            className="
              mx-1
              p-3
              bg-white/5
              border
              border-white/10
              rounded-xl
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              {/* ONLINE STATUS */}
              <div
                className="
                  relative
                  flex-shrink-0
                "
              >
                <span
                  className="
                    block
                    w-2
                    h-2
                    bg-green-400
                    rounded-full
                  "
                />
                <span
                  className="
                    absolute
                    inset-0
                    w-2
                    h-2
                    bg-green-400
                    rounded-full
                    animate-ping
                    opacity-50
                  "
                />
              </div>

              <span
                className="
                  text-[11px]
                  font-semibold
                  text-white
                "
              >
                {t('admin.systemOnline') || (isKhmer ? 'ប្រព័ន្ធកំពុងដំណើរការ' : 'System Online')}
              </span>
            </div>

            <p
              className="
                text-[10px]
                text-white/40
                mt-1.5
                leading-5
              "
            >
              {t('admin.administration') || 'SC Academy Administration v2.0'}
            </p>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
