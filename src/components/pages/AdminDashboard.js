import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiBookOpen,
  FiImage,
  FiMessageSquare,
  FiPlus,
  FiSettings,
  FiShield,
  FiArrowRight,
  FiMail,
  FiTrendingUp,
  FiRefreshCw,
  FiArrowUpRight,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import AdminLoading from '../common/AdminLoading';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isKhmer = language === 'km' || language === 'kh';

  const [dashboardData, setDashboardData] = useState({
    total_admin: 0,
    total_courses: 0,
    total_messages: 0,
    total_gallery: 0,
    total_videos: 0,
    total_schools: 0,
    recent_messages: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 600));
    try {
      const [res] = await Promise.all([
        api.get('/api/admin/dashboard-stats'),
        minDelay,
      ]);
      if (res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.warn('Dashboard stats fallback:', err);
      try {
        const [coursesRes, messagesRes, galleryRes, usersRes, videosRes] = await Promise.allSettled([
          api.get('/api/courses/'),
          api.get('/api/contact/'),
          api.get('/api/gallery/'),
          api.get('/api/admin/users'),
          api.get('/api/videos/'),
        ]);

        const getLen = (r) => (r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data.length : 0);

        setDashboardData({
          total_courses: getLen(coursesRes),
          total_messages: getLen(messagesRes),
          total_gallery: getLen(galleryRes),
          total_admin: getLen(usersRes),
          total_videos: getLen(videosRes),
          total_schools: 1,
          recent_messages: messagesRes.status === 'fulfilled' && Array.isArray(messagesRes.value.data) ? messagesRes.value.data.slice(0, 5) : [],
        });
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
      }
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Vibrant Multi-Color Top Stat Cards
  const topStats = useMemo(() => [
    {
      id: 'courses',
      count: dashboardData.total_courses,
      label: isKhmer ? 'វគ្គសិក្សាទាំងអស់' : 'Total Courses',
      sublabel: isKhmer ? 'កម្មវិធីបណ្តុះបណ្តាល' : 'Training Programs',
      icon: FiBookOpen,
      path: '/courses',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100/80',
      iconHover: 'group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/25',
      cardHover: 'hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5',
      topBarGradient: 'from-blue-500 to-indigo-600',
      arrowColor: 'group-hover:text-blue-600',
    },
    {
      id: 'messages',
      count: dashboardData.total_messages,
      label: isKhmer ? 'សារទំនាក់ទំនង' : 'Contact Inquiries',
      sublabel: isKhmer ? 'សារពីភ្ញៀវចូលមើល' : 'Visitor Inquiries',
      icon: FiMessageSquare,
      path: '/messages',
      textColor: 'text-amber-600',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100/80',
      iconHover: 'group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-orange-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-amber-500/25',
      cardHover: 'hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5',
      topBarGradient: 'from-amber-400 to-orange-500',
      arrowColor: 'group-hover:text-amber-600',
    },
    {
      id: 'gallery',
      count: dashboardData.total_gallery,
      label: isKhmer ? 'រូបភាព Gallery' : 'Gallery Photos',
      sublabel: isKhmer ? 'រូបភាពសកម្មភាព' : 'Activity Photos',
      icon: FiImage,
      path: '/gallery',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100/80',
      iconHover: 'group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-emerald-500/25',
      cardHover: 'hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5',
      topBarGradient: 'from-emerald-400 to-teal-600',
      arrowColor: 'group-hover:text-emerald-600',
    },
    {
      id: 'admin',
      count: dashboardData.total_admin,
      label: isKhmer ? 'អ្នកគ្រប់គ្រង' : 'Admin Accounts',
      sublabel: isKhmer ? 'គណនីគ្រប់គ្រងប្រព័ន្ធ' : 'Active Admins',
      icon: FiShield,
      path: '/settings',
      textColor: 'text-pink-600',
      iconBg: 'bg-pink-50 text-pink-600 border-pink-100/80',
      iconHover: 'group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-pink-500/25',
      cardHover: 'hover:border-pink-300 hover:shadow-lg hover:shadow-pink-500/5',
      topBarGradient: 'from-purple-500 to-pink-500',
      arrowColor: 'group-hover:text-pink-600',
    },
  ], [dashboardData, isKhmer]);

  const [animateRing, setAnimateRing] = useState(false);

  useEffect(() => {
    setAnimateRing(false);
    const timer = setTimeout(() => {
      setAnimateRing(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [dashboardData]);

  // Unified Content breakdown metrics with vibrant color identities
  const contentMetrics = [
    {
      key: 'courses',
      label: isKhmer ? 'វគ្គសិក្សា (Courses)' : 'Courses',
      value: dashboardData.total_courses,
      color: '#2563EB',
      gradient: 'from-blue-500 to-indigo-600',
      dotColor: 'bg-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      key: 'gallery',
      label: isKhmer ? 'រូបភាព Gallery (Photos)' : 'Gallery Photos',
      value: dashboardData.total_gallery,
      color: '#10B981',
      gradient: 'from-emerald-400 to-emerald-600',
      dotColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      key: 'videos',
      label: isKhmer ? 'វីដេអូបណ្តុះបណ្តាល (Videos)' : 'Videos',
      value: dashboardData.total_videos,
      color: '#8B5CF6',
      gradient: 'from-purple-400 to-indigo-600',
      dotColor: 'bg-purple-500',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      key: 'messages',
      label: isKhmer ? 'សារទំនាក់ទំនង (Messages)' : 'Messages',
      value: dashboardData.total_messages,
      color: '#F59E0B',
      gradient: 'from-amber-400 to-amber-600',
      dotColor: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      key: 'admin',
      label: isKhmer ? 'អ្នកគ្រប់គ្រង (Admin Users)' : 'Admin Users',
      value: dashboardData.total_admin,
      color: '#EC4899',
      gradient: 'from-pink-400 to-rose-600',
      dotColor: 'bg-pink-500',
      badgeBg: 'bg-pink-50 text-pink-700 border-pink-100',
    },
  ];

  const totalContent = contentMetrics.reduce((sum, item) => sum + item.value, 0);
  const highestMetric = Math.max(...contentMetrics.map((item) => item.value), 1);

  // SVG Donut calculation with vibrant animated multi-segments
  const radius = 62;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = useMemo(() => {
    const rawItems = [
      {
        key: 'courses',
        label: isKhmer ? 'វគ្គសិក្សា' : 'Courses',
        count: dashboardData.total_courses,
        color: '#2563EB',
        gradientId: 'gradCourses',
        startColor: '#3B82F6',
        endColor: '#1D4ED8',
      },
      {
        key: 'gallery',
        label: isKhmer ? 'រូបភាព' : 'Gallery',
        count: dashboardData.total_gallery,
        color: '#10B981',
        gradientId: 'gradGallery',
        startColor: '#34D399',
        endColor: '#059669',
      },
      {
        key: 'videos',
        label: isKhmer ? 'វីដេអូ' : 'Videos',
        count: dashboardData.total_videos,
        color: '#8B5CF6',
        gradientId: 'gradVideos',
        startColor: '#A78BFA',
        endColor: '#7C3AED',
      },
      {
        key: 'messages',
        label: isKhmer ? 'សារទំនាក់ទំនង' : 'Messages',
        count: dashboardData.total_messages,
        color: '#F59E0B',
        gradientId: 'gradMessages',
        startColor: '#FBBF24',
        endColor: '#D97706',
      },
      {
        key: 'admin',
        label: isKhmer ? 'អ្នកគ្រប់គ្រង' : 'Admins',
        count: dashboardData.total_admin,
        color: '#EC4899',
        gradientId: 'gradAdmin',
        startColor: '#F472B6',
        endColor: '#DB2777',
      },
    ];

    const activeTotal = rawItems.reduce((sum, it) => sum + it.count, 0);

    let cumulativeLength = 0;
    return rawItems.map((item) => {
      const fraction = activeTotal > 0 ? item.count / activeTotal : 0;
      const strokeLen = fraction * circumference;
      const offset = cumulativeLength;
      if (item.count > 0) {
        cumulativeLength += strokeLen;
      }
      return {
        ...item,
        percentage: Math.round(fraction * 100),
        strokeLength: strokeLen,
        offset,
      };
    });
  }, [dashboardData, circumference, isKhmer]);

  if (loading) {
    return <AdminLoading label={isKhmer ? 'កំពុងផ្ទុកទិន្នន័យ...' : 'Loading statistics...'} />;
  }

  return (
    <main className={`min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8 space-y-6 ${isKhmer ? 'font-khmer' : ''}`}>
      
      {/* =====================================================
          1. TOP WELCOME BANNER (VIBRANT CYBER-NAVY GRADIENT)
      ===================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F172A] to-[#1E1B4B] p-6 sm:p-8 text-white shadow-md border border-blue-500/20">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-2.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SC Academy Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
              {isKhmer ? 'សូមស្វាគមន៍មកកាន់ផ្ទាំងគ្រប់គ្រង Admin' : 'Welcome back, Admin'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300/80 font-normal max-w-xl">
              {isKhmer
                ? 'តាមដាន និងគ្រប់គ្រងទិន្នន័យវគ្គសិក្សា រូបភាព និងសារទំនាក់ទំនងជាក់ស្តែង។'
                : 'Track and manage your real-time school programs, gallery, and contact inquiries.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs transition-all backdrop-blur-md cursor-pointer active:scale-95"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} size={14} />
              <span>{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <FiPlus size={15} />
                <span>Quick Action</span>
              </button>

              {/* Dropdown Menu */}
              {showQuickMenu && (
                <div className="absolute right-0 mt-2.5 w-52 rounded-xl bg-white p-1.5 shadow-xl border border-slate-200 z-50 animate-fade-in text-slate-800">
                  <button
                    type="button"
                    onClick={() => { setShowQuickMenu(false); navigate('/courses'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-50 hover:text-[#2563EB] transition-colors text-left cursor-pointer"
                  >
                    <FiBookOpen className="text-[#2563EB]" />
                    <span>{isKhmer ? 'គ្រប់គ្រងវគ្គសិក្សា' : 'Manage Courses'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowQuickMenu(false); navigate('/gallery'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-left cursor-pointer"
                  >
                    <FiImage className="text-emerald-600" />
                    <span>{isKhmer ? 'រូបភាព Gallery' : 'Upload Gallery'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowQuickMenu(false); navigate('/messages'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-amber-50 hover:text-amber-600 transition-colors text-left cursor-pointer"
                  >
                    <FiMessageSquare className="text-amber-600" />
                    <span>{isKhmer ? 'សារទំនាក់ទំនង' : 'View Messages'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowQuickMenu(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-purple-50 hover:text-purple-600 transition-colors text-left cursor-pointer"
                  >
                    <FiSettings className="text-purple-600" />
                    <span>{isKhmer ? 'ការកំណត់ប្រព័ន្ធ' : 'Admin Settings'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. TOP 4 STAT CARDS (VIBRANT MULTI-COLOR THEME)
      ===================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {topStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              onClick={() => navigate(stat.path)}
              className={`relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs transition-all duration-300 cursor-pointer group flex flex-col justify-between ${stat.cardHover}`}
            >
              {/* Top Accent Gradient Bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${stat.topBarGradient} absolute top-0 left-0 right-0 opacity-80 group-hover:opacity-100 transition-opacity`} />

              <div className="flex items-start justify-between pt-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-2xs ${stat.iconBg} ${stat.iconHover}`}>
                  <Icon size={21} />
                </div>
                <FiArrowUpRight className={`text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${stat.arrowColor}`} size={18} />
              </div>

              <div className="mt-5">
                <p className={`text-3xl sm:text-4xl font-black tracking-tight tabular-nums transition-colors duration-200 ${stat.textColor}`}>
                  {stat.count}
                </p>
                <h3 className="mt-1 text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {stat.label}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {stat.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* =====================================================
          3. REAL CONTENT ANALYTICS & DISTRIBUTION
      ===================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: CONTENT VOLUME & BREAKDOWN (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isKhmer ? 'ការបែងចែកមាតិកាប្រព័ន្ធ' : 'Content & Records Analytics'}
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {isKhmer ? 'ទិន្នន័យជាក់ស្តែងនៃមាតិកាដែលកំពុងដំណើរការក្នុងប្រព័ន្ធ។' : 'Real-time volume of records currently active in the database.'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <FiTrendingUp size={13} className="text-[#2563EB]" /> Live Data
            </span>
          </div>

          {/* Animated Multi-Color Gradient Progress Bars */}
          <div className="mt-6 space-y-4">
            {contentMetrics.map((metric, idx) => {
              const targetWidth = metric.value
                ? Math.min(Math.max((metric.value / highestMetric) * 100, 6), 100)
                : 0;

              return (
                <div key={metric.key || metric.label} className="group">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${metric.dotColor} shadow-2xs group-hover:scale-125 transition-transform duration-200`}
                      />
                      <span className="text-slate-800">{metric.label}</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold tabular-nums border ${metric.badgeBg}`}
                    >
                      {metric.value}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100/90 overflow-hidden p-0.5 border border-slate-200/50">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${metric.gradient} shadow-xs transition-all duration-1000 ease-out`}
                      style={{
                        width: `${animateRing ? targetWidth : 0}%`,
                        transitionDelay: `${idx * 80}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{isKhmer ? 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ' : 'Last refreshed'}: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-[#1E3A8A] font-bold">{isKhmer ? 'ទិន្នន័យសរុប' : 'Total Items'}: {totalContent}</span>
          </div>
        </div>

        {/* RIGHT: SYSTEM CONTENT PROPORTION (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isKhmer ? 'ផលធៀបមាតិកា' : 'Content Proportion'}
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {isKhmer ? 'ការបែងចែកមាតិកាប្រព័ន្ធទាំងអស់' : 'Real-time category distribution'}
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          {/* SVG Animated Color Donut Chart */}
          <div className="my-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Glowing Background Pulse */}
              <div className="absolute inset-4 rounded-full bg-blue-500/5 blur-xl pointer-events-none" />

              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                <defs>
                  {donutSegments.map((seg) => (
                    <linearGradient
                      key={seg.gradientId}
                      id={seg.gradientId}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={seg.startColor} />
                      <stop offset="100%" stopColor={seg.endColor} />
                    </linearGradient>
                  ))}
                </defs>

                {/* Base Background Track Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="18"
                />

                {/* Animated Category Color Segments */}
                {totalContent > 0 ? (
                  donutSegments.map((seg) => {
                    if (seg.count <= 0) return null;
                    const animatedLength = animateRing ? seg.strokeLength : 0;
                    return (
                      <circle
                        key={seg.key}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={`url(#${seg.gradientId})`}
                        strokeWidth="18"
                        strokeDasharray={`${animatedLength} ${circumference}`}
                        strokeDashoffset={-seg.offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    );
                  })
                ) : (
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#2563EB"
                    strokeWidth="18"
                    strokeDasharray={`${animateRing ? circumference : 0} ${circumference}`}
                    strokeDashoffset="0"
                    className="transition-all duration-1000 ease-out opacity-40"
                  />
                )}
              </svg>

              {/* Center Total Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                <span className="text-3xl font-black text-[#1E3A8A] tracking-tight tabular-nums transition-transform duration-500 scale-100">
                  {totalContent}
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">
                  {isKhmer ? 'សរុបទាំងអស់' : 'TOTAL'}
                </span>
              </div>
            </div>

            {/* Dynamic Multi-Color Category Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 max-w-xs">
              {donutSegments.map((seg) => (
                <div key={seg.key} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span>{seg.label}</span>
                  <span className="text-slate-400 text-[11px] font-bold">({seg.count})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3.5 text-center text-xs">
            <div className="p-1.5 rounded-lg bg-blue-50/50">
              <p className="font-extrabold text-[#2563EB] text-sm tabular-nums">{dashboardData.total_courses}</p>
              <p className="text-slate-500 font-medium text-[11px] truncate">{isKhmer ? 'វគ្គសិក្សា' : 'Courses'}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50/50">
              <p className="font-extrabold text-emerald-600 text-sm tabular-nums">{dashboardData.total_gallery}</p>
              <p className="text-slate-500 font-medium text-[11px] truncate">{isKhmer ? 'រូបភាព' : 'Photos'}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-50/50">
              <p className="font-extrabold text-purple-600 text-sm tabular-nums">{dashboardData.total_videos}</p>
              <p className="text-slate-500 font-medium text-[11px] truncate">{isKhmer ? 'វីដេអូ' : 'Videos'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. RECENT INQUIRIES & MESSAGES (CLEAN WHITE CARD)
      ===================================================== */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isKhmer ? 'សារទំនាក់ទំនងថ្មីៗ' : 'Recent Inquiries & Messages'}
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {isKhmer ? 'សារ និងសំណួរដែលបានផ្ញើចេញពីទំព័រ Contact' : 'Direct messages submitted by website visitors.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/messages')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <span>{isKhmer ? 'មើលសារទាំងអស់' : 'View All Messages'}</span>
            <FiArrowRight size={14} />
          </button>
        </div>

        {dashboardData.recent_messages && dashboardData.recent_messages.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {dashboardData.recent_messages.map((msg, index) => (
              <div key={msg.id || index} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiMail size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{msg.name || 'Anonymous'}</p>
                      {msg.email && <span className="text-xs text-slate-400 truncate">({msg.email})</span>}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{msg.subject || msg.message || 'No subject'}</p>
                  </div>
                </div>

                {msg.created_at && (
                  <span className="text-[11px] font-medium text-slate-400 flex-shrink-0">
                    {msg.created_at}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
            <FiMessageSquare size={24} className="mx-auto text-slate-300 mb-1.5" />
            <p className="text-xs font-bold text-slate-600">{isKhmer ? 'មិនទាន់មានសារទំនាក់ទំនងថ្មីទេ' : 'No contact messages yet'}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{isKhmer ? 'សារដែលភ្ញៀវផ្ញើមកនឹងបង្ហាញនៅទីនេះ' : 'Messages submitted on the contact page will appear here.'}</p>
          </div>
        )}
      </section>

    </main>
  );
};

export default AdminDashboard;
