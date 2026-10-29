import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiLock,
  FiShield,
  FiEye,
  FiEyeOff,
  FiArrowRight } from 'react-icons/fi';

import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import logo from '../layout/logo.webp';

const AdminLogin = () => {
  const { language, changeLanguage, t } = useLanguage();
  const isKhmer = language === 'km';
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      toast.error(t('login.required') || 'Username and password are required');
      return;
    }

    setLoading(true);

    try {
      const result = await login(username.trim(), password);

      if (result?.success) {
        toast.success(t('login.success') || 'Login successful!');
        navigate('/', { replace: true });
        return;
      }

      toast.error(result?.error || t('login.failed') || 'Invalid username or password');
    } catch (error) {
      console.error('Login error:', error);
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        t('login.error') ||
        'An error occurred during login';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#070D1E] px-4 py-8 overflow-hidden selection:bg-[#EF233C] selection:text-white font-sans">
      {/* Dynamic Background Mesh Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[15%] -top-[15%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-br from-[#143DAA]/35 to-[#0F2A75]/10 blur-[120px]" />
        <div className="absolute -right-[10%] -bottom-[10%] w-[55vw] h-[55vw] max-w-[550px] max-h-[550px] rounded-full bg-gradient-to-tl from-[#EF233C]/20 to-[#143DAA]/10 blur-[130px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-[#143DAA]/10 blur-[160px]" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px' }}
        />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[460px]">
        {/* Top Language Switcher Bar */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              disabled={loading}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
                language === 'en'
                  ? 'bg-[#143DAA] text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => changeLanguage('km')}
              disabled={loading}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
                language === 'km'
                  ? 'bg-[#EF233C] text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              ខ្មែរ
            </button>
          </div>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/80 relative overflow-hidden">
          {/* Subtle Top Red Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#143DAA] via-[#EF233C] to-[#143DAA]" />

          {/* Logo & Header */}
          <div className="text-center mb-8 pt-2">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#F8FAFC] border border-[#143DAA]/10 shadow-sm mb-4">
              <img
                src={logo}
                alt="SC Academy"
                className="h-12 w-auto object-contain max-w-[150px]"
              />
            </div>

            <h1 className={`text-2xl sm:text-3xl font-extrabold text-[#143DAA] tracking-tight ${isKhmer ? 'font-khmer' : ''}`}>
              {isKhmer ? 'ផ្ទាំងគ្រប់គ្រងរដ្ឋបាល' : 'Admin Portal'}
            </h1>
            <p className={`text-xs sm:text-sm text-gray-500 mt-1.5 ${isKhmer ? 'font-khmer' : ''}`}>
              {isKhmer ? 'សូមបញ្ចូលគណនីរបស់អ្នកដើម្បីបន្ត' : 'Sign in with your administrator credentials'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="admin-username"
                className={`block text-xs font-bold text-[#143DAA] mb-1.5 ${isKhmer ? 'font-khmer' : ''}`}
              >
                {isKhmer ? 'ឈ្មោះគណនី (Username)' : 'Username'}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiUser size={18} />
                </div>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isKhmer ? 'បញ្ចូលឈ្មោះគណនី' : 'Enter your username'}
                  required
                  disabled={loading}
                  autoComplete="username"
                  autoFocus
                  className="w-full h-12 rounded-xl bg-[#F8FAFC] border border-gray-200 pl-11 pr-4 text-sm text-[#0F172A] font-medium placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#143DAA] focus:ring-4 focus:ring-[#143DAA]/10 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className={`block text-xs font-bold text-[#143DAA] mb-1.5 ${isKhmer ? 'font-khmer' : ''}`}
              >
                {isKhmer ? 'លេខសម្ងាត់ (Password)' : 'Password'}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiLock size={18} />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isKhmer ? 'បញ្ចូលលេខសម្ងាត់' : 'Enter your password'}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full h-12 rounded-xl bg-[#F8FAFC] border border-gray-200 pl-11 pr-11 text-sm text-[#0F172A] font-medium placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#143DAA] focus:ring-4 focus:ring-[#143DAA]/10 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#143DAA] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#143DAA] focus:ring-[#143DAA]"
                />
                <span className={`text-xs font-medium text-gray-600 ${isKhmer ? 'font-khmer' : ''}`}>
                  {isKhmer ? 'ចងចាំខ្ញុំ' : 'Remember me'}
                </span>
              </label>

              <button
                type="button"
                onClick={() =>
                  toast.info(
                    isKhmer
                      ? 'សូមទាក់ទង Super Admin ដើម្បីកំណត់ Password ឡើងវិញ។'
                      : 'Please contact the Super Admin to reset your password.'
                  )
                }
                className={`text-xs font-bold text-[#143DAA] hover:text-[#EF233C] transition-colors ${
                  isKhmer ? 'font-khmer' : ''
                }`}
              >
                {isKhmer ? 'ភ្លេចលេខសម្ងាត់?' : 'Forgot Password?'}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-[#143DAA] to-[#1a4cd2] hover:from-[#EF233C] hover:to-[#d91a2a] text-white text-sm font-bold shadow-lg shadow-[#143DAA]/25 hover:shadow-xl hover:shadow-[#EF233C]/30 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                isKhmer ? 'font-khmer' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isKhmer ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Signing in...'}</span>
                </span>
              ) : (
                <>
                  <span>{isKhmer ? 'ចូលប្រើប្រាស់' : 'Sign In'}</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-semibold text-gray-500">
            <FiShield size={14} className="text-[#143DAA]" />
            <span className={isKhmer ? 'font-khmer' : ''}>
              {isKhmer ? 'ប្រព័ន្ធការពារសុវត្ថិភាព SC Academy' : 'Encrypted & Secure Access'}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-white/50 font-medium">
          &copy; {new Date().getFullYear()} SC Academy School. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;