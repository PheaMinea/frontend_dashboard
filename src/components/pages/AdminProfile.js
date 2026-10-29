import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiSave,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiKey,
  FiActivity,
  FiCamera,
  FiTrash2,
  FiUploadCloud,
  FiEdit3,
  FiX,
} from 'react-icons/fi';

import api, { getApiErrorMessage } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { getImageUrl } from '../../utils/helpers';
import AdminCard from '../common/AdminCard';
import AdminLoading from '../common/AdminLoading';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const { language } = useLanguage();
  const isKhmer = language === 'km' || language === 'kh';

  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'password' | 'security'
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Edit Mode State (Default is false: Read-Only view)
  const [isEditing, setIsEditing] = useState(false);

  // Saved Profile Data from Server
  const [profileData, setProfileData] = useState({
    username: '',
    full_name: '',
    email: '',
    avatar_url: '',
    role: '',
    created_at: '',
    updated_at: '',
    is_active: true,
  });

  // Edit Form Data (Draft while editing)
  const [editFormData, setEditFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    avatar_url: '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch latest current admin profile
  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await api.get('/api/auth/me');
      if (res.data) {
        const loaded = {
          username: res.data.username || '',
          full_name: res.data.full_name || '',
          email: res.data.email || '',
          avatar_url: res.data.avatar_url || '',
          role: res.data.role || 'super_admin',
          created_at: res.data.created_at || '',
          updated_at: res.data.updated_at || '',
          is_active: res.data.is_active !== undefined ? res.data.is_active : true,
        };
        setProfileData(loaded);
        setEditFormData({
          username: loaded.username,
          full_name: loaded.full_name,
          email: loaded.email,
          avatar_url: loaded.avatar_url,
        });
        if (updateUser) {
          updateUser(loaded);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      if (user) {
        const loaded = {
          username: user.username || user.name || '',
          full_name: user.full_name || '',
          email: user.email || '',
          avatar_url: user.avatar_url || '',
          role: user.role || 'super_admin',
          created_at: user.created_at || '',
          updated_at: user.updated_at || '',
          is_active: true,
        };
        setProfileData(loaded);
        setEditFormData({
          username: loaded.username,
          full_name: loaded.full_name,
          email: loaded.email,
          avatar_url: loaded.avatar_url,
        });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Start Editing
  const handleStartEdit = () => {
    setEditFormData({
      username: profileData.username,
      full_name: profileData.full_name,
      email: profileData.email,
      avatar_url: profileData.avatar_url,
    });
    setAvatarLoadError(false);
    setIsEditing(true);
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditFormData({
      username: profileData.username,
      full_name: profileData.full_name,
      email: profileData.email,
      avatar_url: profileData.avatar_url,
    });
    setAvatarLoadError(false);
    setIsEditing(false);
  };

  // Handle Avatar Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isKhmer ? 'សូមជ្រើសរើសឯកសារជារូបភាព' : 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isKhmer ? 'ទំហំរូបភាពមិនអាចលើសពី 5MB ឡើយ' : 'Image size cannot exceed 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/api/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.avatar_url) {
        const newUrl = res.data.avatar_url;
        setAvatarLoadError(false);
        setProfileData((prev) => ({ ...prev, avatar_url: newUrl }));
        setEditFormData((prev) => ({ ...prev, avatar_url: newUrl }));

        if (updateUser) {
          updateUser({ avatar_url: newUrl });
        }

        const storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
        localStorage.setItem(
          'admin_user',
          JSON.stringify({
            ...storedUser,
            avatar_url: newUrl,
          })
        );

        toast.success(isKhmer ? 'បានផ្លាស់ប្តូររូបថត Profile ដោយជោគជ័យ!' : 'Avatar updated successfully!');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, isKhmer ? 'ការបញ្ចូលរូបថតមិនជោគជ័យ' : 'Failed to upload avatar'));
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    try {
      setLoading(true);
      const res = await api.put('/api/auth/profile', {
        username: profileData.username.trim(),
        full_name: profileData.full_name.trim(),
        email: profileData.email.trim(),
        avatar_url: '',
      });

      if (res.data) {
        setProfileData((prev) => ({ ...prev, avatar_url: '' }));
        setEditFormData((prev) => ({ ...prev, avatar_url: '' }));
        setAvatarLoadError(false);

        if (updateUser) {
          updateUser({ avatar_url: '' });
        }

        const storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
        localStorage.setItem(
          'admin_user',
          JSON.stringify({
            ...storedUser,
            avatar_url: '',
          })
        );
        toast.success(isKhmer ? 'បានលុបរូបថត Profile' : 'Avatar removed');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, isKhmer ? 'មិនអាចលុបរូបថតបានទេ' : 'Failed to remove avatar'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Profile Update Submit (Name, Username, Email)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.username.trim() || !editFormData.email.trim()) {
      toast.error(isKhmer ? 'សូមបំពេញឈ្មោះគណនី និងអ៊ីមែលឱ្យបានត្រឹមត្រូវ' : 'Please fill in username and email');
      return;
    }

    try {
      setLoading(true);
      const res = await api.put('/api/auth/profile', {
        username: editFormData.username.trim(),
        full_name: editFormData.full_name.trim(),
        email: editFormData.email.trim(),
        avatar_url: editFormData.avatar_url,
      });

      if (res.data) {
        const updated = {
          ...profileData,
          username: res.data.username,
          full_name: res.data.full_name || '',
          email: res.data.email,
          avatar_url: res.data.avatar_url || '',
        };
        setProfileData(updated);
        setIsEditing(false);

        if (updateUser) {
          updateUser(updated);
        }

        toast.success(isKhmer ? 'បានកែប្រែព័ត៌មាន Profile ដោយជោគជ័យ!' : 'Profile updated successfully!');

        const storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
        localStorage.setItem(
          'admin_user',
          JSON.stringify({
            ...storedUser,
            username: res.data.username,
            full_name: res.data.full_name,
            email: res.data.email,
            avatar_url: res.data.avatar_url,
          })
        );
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, isKhmer ? 'ការកែប្រែព័ត៌មានមិនជោគជ័យ' : 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.current_password) {
      toast.error(isKhmer ? 'សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន' : 'Please enter your current password');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error(isKhmer ? 'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួអក្សរ' : 'New password must be at least 8 characters');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error(isKhmer ? 'ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់មិនត្រូវគ្នាឡើយ' : 'New password and confirmation do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.put('/api/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      });

      toast.success(isKhmer ? 'បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ!' : 'Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, isKhmer ? 'ការប្តូរពាក្យសម្ងាត់មិនជោគជ័យ' : 'Failed to change password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayName = profileData.full_name || profileData.username || 'Admin';
  const currentAvatar = isEditing ? editFormData.avatar_url : profileData.avatar_url;
  const firstLetter = displayName?.charAt(0)?.toUpperCase() || 'A';

  if (profileLoading) {
    return <AdminLoading fullScreen label={isKhmer ? 'កំពុងផ្ទុកព័ត៌មាន Profile...' : 'Loading profile...'} />;
  }

  return (
    <div className={`space-y-6 ${isKhmer ? 'font-khmer' : 'font-english'}`}>
      {/* HIDDEN FILE INPUT FOR AVATAR UPLOAD */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
              <FiUser size={22} />
            </span>
            <span>{isKhmer ? 'ប្រវត្តិរូប Admin (Profile)' : 'Admin Profile'}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isKhmer
              ? 'ព័ត៌មានគណនីផ្ទាល់ខ្លួន (ឈ្មោះ, អ៊ីមែល, រូបថត) និងសុវត្ថិភាពពាក្យសម្ងាត់'
              : 'View and manage your administrator personal info and security settings'}
          </p>
        </div>

        {/* TOP EDIT BUTTON */}
        {!isEditing && activeTab === 'general' && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <FiEdit3 size={15} />
            <span>{isKhmer ? 'កែសម្រួលព័ត៌មាន (Edit Profile)' : 'Edit Profile'}</span>
          </button>
        )}
      </div>

      {/* HERO PROFILE SUMMARY CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar Circular */}
          <div className="relative flex-shrink-0 group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-1 shadow-2xl overflow-hidden relative">
              {currentAvatar && !avatarLoadError ? (
                <img
                  src={getImageUrl(currentAvatar)}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center text-white">
                  <span className="text-4xl font-extrabold">{firstLetter}</span>
                  {!currentAvatar && (
                    <span className="text-[9px] text-blue-300 font-normal mt-0.5 opacity-80">
                      {isKhmer ? 'គ្មានរូបថត' : 'No Photo'}
                    </span>
                  )}
                </div>
              )}

              {/* Upload Overlay (Active in Edit Mode) */}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-1 rounded-full bg-black/70 opacity-90 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                  title="Change Avatar"
                >
                  {uploadingAvatar ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <FiCamera size={20} />
                      <span className="text-[10px]">{isKhmer ? 'ប្ដូររូបថត' : 'Change'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Active Status Badge */}
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md" title="Active" />
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {profileData.full_name ? `${profileData.full_name} (${profileData.username})` : profileData.username}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 border border-blue-400/30 text-blue-300 backdrop-blur-md">
                <FiShield size={13} />
                <span className="uppercase">{profileData.role || 'Super Admin'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isKhmer ? 'សកម្ម (Active)' : 'Active'}</span>
              </span>
            </div>

            <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-2 mb-3">
              <FiMail size={15} className="text-blue-400" />
              <span>{profileData.email}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <FiCalendar size={13} />
                <span>
                  {isKhmer ? 'ថ្ងៃបង្កើត៖ ' : 'Created: '}
                  {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <FiActivity size={13} />
                <span>{isKhmer ? 'ស្ថានភាព៖ សិទ្ធិពេញលេញ' : 'Access: Full Administrator Access'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'general'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FiUser size={16} />
          <span>{isKhmer ? 'ព័ត៌មានទូទៅ (Profile Info)' : 'Profile Info'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'password'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FiLock size={16} />
          <span>{isKhmer ? 'ប្ដូរពាក្យសម្ងាត់ (Password)' : 'Change Password'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'security'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FiShield size={16} />
          <span>{isKhmer ? 'សុវត្ថិភាព & សិទ្ធិ (Security)' : 'Security & Roles'}</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: GENERAL INFORMATION
      ========================================================= */}
      {activeTab === 'general' && (
        <AdminCard>
          {!isEditing ? (
            /* ===================================================
               VIEW MODE (READ ONLY DISPLAY)
            =================================================== */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isKhmer ? 'ព័ត៌មានគណនីផ្ទាល់ខ្លួន' : 'Personal Account Information'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isKhmer ? 'ព័ត៌មានលម្អិតរបស់អ្នកគ្រប់គ្រងប្រព័ន្ធ' : 'Your administrator profile details'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-sm active:scale-95"
                >
                  <FiEdit3 size={14} />
                  <span>{isKhmer ? 'កែប្រែព័ត៌មាន' : 'Edit Profile'}</span>
                </button>
              </div>

              {/* READ ONLY FIELDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Profile Photo Display */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg overflow-hidden shadow-sm flex-shrink-0">
                    {profileData.avatar_url && !avatarLoadError ? (
                      <img
                        src={getImageUrl(profileData.avatar_url)}
                        alt={displayName}
                        className="w-full h-full object-cover rounded-xl"
                        onError={() => setAvatarLoadError(true)}
                      />
                    ) : (
                      firstLetter
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      {isKhmer ? 'រូបថត Profile' : 'Profile Photo'}
                    </span>
                    <p className="text-xs font-medium text-slate-700">
                      {profileData.avatar_url ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <FiCheckCircle size={13} /> {isKhmer ? 'បានដាក់រូបថតរួចរាល់' : 'Custom photo set'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          {isKhmer ? 'មិនទាន់មានរូបថត (ប្រើអក្សរសម្គាល់)' : 'No custom photo (Using initial letter)'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {isKhmer ? 'ឈ្មោះពេញ (Full Name)' : 'Full Name'}
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {profileData.full_name || <span className="text-slate-400 italic">{isKhmer ? 'មិនទាន់បានបញ្ចូល' : 'Not set'}</span>}
                  </p>
                </div>

                {/* Username */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {isKhmer ? 'ឈ្មោះគណនី (Username)' : 'Username'}
                  </span>
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    @{profileData.username}
                  </p>
                </div>

                {/* Email */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {isKhmer ? 'អ៊ីមែល (Email Address)' : 'Email Address'}
                  </span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FiMail size={15} className="text-[#2563EB]" />
                    <span>{profileData.email}</span>
                  </p>
                </div>

                {/* Role */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {isKhmer ? 'តួនាទី (Role)' : 'Role'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                    <FiShield size={13} />
                    <span className="uppercase">{profileData.role || 'SUPER_ADMIN'}</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ===================================================
               EDIT MODE (ACTIVE EDITING FORM)
            =================================================== */
            <form onSubmit={handleProfileSubmit} className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-blue-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#2563EB] flex items-center gap-2">
                    <FiEdit3 size={18} />
                    <span>{isKhmer ? 'កំពុងកែសម្រួលព័ត៌មាន Profile' : 'Editing Profile Information'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isKhmer ? 'កែសម្រួលឈ្មោះពេញ (Name) ឈ្មោះគណនី (Username) អ៊ីមែល (Email) និងរូបភាព Profile' : 'Update your personal identity and avatar image'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 animate-pulse">
                  Edit Mode
                </span>
              </div>

              {/* AVATAR UPLOAD SECTION (IN EDIT MODE) */}
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xl overflow-hidden shadow-sm flex-shrink-0">
                  {editFormData.avatar_url && !avatarLoadError ? (
                    <img
                      src={getImageUrl(editFormData.avatar_url)}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-xl"
                      onError={() => setAvatarLoadError(true)}
                    />
                  ) : (
                    firstLetter
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    {isKhmer ? 'រូបថតប្រវត្តិរូប (Profile Image)' : 'Profile Image'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {isKhmer ? 'គាំទ្រ JPG, PNG, WEBP (ទំហំអតិបរមា 5MB)' : 'Supports JPG, PNG, WEBP (Max 5MB)'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold inline-flex items-center gap-1.5 transition active:scale-95"
                    >
                      <FiUploadCloud size={14} />
                      <span>{isKhmer ? 'ជ្រើសរើសរូបថតថ្មី' : 'Upload Photo'}</span>
                    </button>
                    {editFormData.avatar_url && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-50 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                      >
                        <FiTrash2 size={13} />
                        <span>{isKhmer ? 'លុបរូប' : 'Remove Photo'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* INPUT FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* FULL NAME */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isKhmer ? 'ឈ្មោះពេញ (Full Name)' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiUser size={16} />
                    </div>
                    <input
                      type="text"
                      value={editFormData.full_name}
                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                      placeholder={isKhmer ? 'ឧទាហរណ៍៖ សុខ សាន' : 'e.g. Sok San'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-200 bg-white text-sm font-medium text-slate-900 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none transition"
                    />
                  </div>
                </div>

                {/* USERNAME */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isKhmer ? 'ឈ្មោះគណនី (Username)' : 'Username'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiKey size={16} />
                    </div>
                    <input
                      type="text"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-200 bg-white text-sm font-medium text-slate-900 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none transition"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isKhmer ? 'អ៊ីមែល (Email Address)' : 'Email Address'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiMail size={16} />
                    </div>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-200 bg-white text-sm font-medium text-slate-900 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none transition"
                    />
                  </div>
                </div>

                {/* ROLE (DISABLED) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isKhmer ? 'តួនាទី (Role)' : 'Role'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiShield size={16} />
                    </div>
                    <input
                      type="text"
                      value={profileData.role ? profileData.role.toUpperCase() : 'SUPER_ADMIN'}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (CANCEL & SAVE) */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-2 transition"
                >
                  <FiX size={15} />
                  <span>{isKhmer ? 'បោះបង់ (Cancel)' : 'Cancel'}</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition shadow-sm active:scale-95"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <FiSave size={16} />
                  )}
                  <span>{isKhmer ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </AdminCard>
      )}

      {/* =========================================================
          TAB 2: CHANGE PASSWORD (2-COLUMN BALANCED SUITE)
      ========================================================= */}
      {activeTab === 'password' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: MAIN FORM CARD (7 COLS) */}
          <div className="lg:col-span-7">
            <AdminCard>
              <form onSubmit={handlePasswordSubmit} className="space-y-5 px-2 sm:px-4 py-1">
                {/* Form Title */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] shadow-sm">
                      <FiKey size={20} />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {isKhmer ? 'ប្តូរពាក្យសម្ងាត់គណនី' : 'Change Your Password'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isKhmer
                          ? 'សូមជ្រើសរើសពាក្យសម្ងាត់ដែលមានសុវត្ថិភាព និងមានយ៉ាងតិច ៨ តួអក្សរ'
                          : 'Update your login password with secure credentials'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* CURRENT PASSWORD */}
                  <div className="w-full">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {isKhmer ? 'ពាក្យសម្ងាត់បច្ចុប្បន្ន' : 'Current Password'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <FiLock size={17} />
                      </div>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        required
                        placeholder="••••••••"
                        className="w-full pl-12 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showCurrentPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* NEW PASSWORD */}
                  <div className="w-full">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {isKhmer ? 'ពាក្យសម្ងាត់ថ្មី' : 'New Password'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <FiLock size={17} />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        required
                        placeholder="••••••••"
                        minLength={8}
                        className="w-full pl-12 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM NEW PASSWORD */}
                  <div className="w-full">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {isKhmer ? 'បញ្ជាក់ពាក្យសម្ងាត់ថ្មី' : 'Confirm New Password'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <FiLock size={17} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        required
                        placeholder="••••••••"
                        className="w-full pl-12 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
                  >
                    {passwordLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <FiSave size={16} />
                    )}
                    <span>{isKhmer ? 'ប្ដូរពាក្យសម្ងាត់ឥឡូវនេះ' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </AdminCard>
          </div>

          {/* RIGHT: SECURITY GUIDELINE & CHECKLIST CARD (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                  <FiShield size={20} />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isKhmer ? 'លក្ខខណ្ឌសុវត្ថិភាព' : 'Security Requirements'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isKhmer ? 'ផ្ទៀងផ្ទាត់កម្រិតសុវត្ថិភាពពាក្យសម្ងាត់' : 'Password strength validation'}
                  </p>
                </div>
              </div>

              {/* Dynamic Live Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      passwordData.new_password.length >= 8
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {passwordData.new_password.length >= 8 ? '✓' : '•'}
                  </span>
                  <span
                    className={`font-medium transition-colors ${
                      passwordData.new_password.length >= 8 ? 'text-emerald-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {isKhmer ? 'មានយ៉ាងតិច ៨ តួអក្សរ' : 'At least 8 characters long'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      passwordData.new_password && passwordData.new_password === passwordData.confirm_password
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {passwordData.new_password && passwordData.new_password === passwordData.confirm_password
                      ? '✓'
                      : '•'}
                  </span>
                  <span
                    className={`font-medium transition-colors ${
                      passwordData.new_password && passwordData.new_password === passwordData.confirm_password
                        ? 'text-emerald-700 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    {isKhmer ? 'ពាក្យសម្ងាត់ទាំងពីរត្រូវគ្នា' : 'Passwords match identically'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      /[0-9]/.test(passwordData.new_password) && /[a-zA-Z]/.test(passwordData.new_password)
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {/[0-9]/.test(passwordData.new_password) && /[a-zA-Z]/.test(passwordData.new_password)
                      ? '✓'
                      : '•'}
                  </span>
                  <span
                    className={`font-medium transition-colors ${
                      /[0-9]/.test(passwordData.new_password) && /[a-zA-Z]/.test(passwordData.new_password)
                        ? 'text-emerald-700 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    {isKhmer ? 'មានលាយអក្សរ និងលេខ' : 'Mix of letters and numbers'}
                  </span>
                </div>
              </div>

              {/* Encryption Info Pill */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-slate-600 flex items-start gap-2.5">
                <FiLock className="text-[#2563EB] flex-shrink-0 mt-0.5" size={15} />
                <p className="leading-relaxed">
                  {isKhmer
                    ? 'ពាក្យសម្ងាត់ត្រូវបានការពារដោយប្រព័ន្ធ BCrypt Encryption Hash ធានាសុវត្ថិភាពខ្ពស់បំផុត។'
                    : 'Your password is encrypted using high-grade BCrypt hashing algorithms.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: SECURITY & DETAILS
      ========================================================= */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdminCard>
            <div className="px-1 sm:px-2 py-1">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2.5">
                <FiShield className="text-[#2563EB]" size={18} />
                <span>{isKhmer ? 'សិទ្ធិ & ការអនុញ្ញាត (Privileges)' : 'Security Privileges'}</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100/90">
                  <span className="text-xs font-bold text-slate-700">{isKhmer ? 'គ្រប់គ្រងវគ្គសិក្សា (Courses)' : 'Manage Courses'}</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wide">Granted</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100/90">
                  <span className="text-xs font-bold text-slate-700">{isKhmer ? 'គ្រប់គ្រងវិចិត្រសាល (Gallery & Videos)' : 'Manage Media'}</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wide">Granted</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100/90">
                  <span className="text-xs font-bold text-slate-700">{isKhmer ? 'គ្រប់គ្រងការកំណត់ (Settings & Brand)' : 'Manage Settings'}</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wide">Granted</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100/90">
                  <span className="text-xs font-bold text-slate-700">{isKhmer ? 'គ្រប់គ្រងសារទំនាក់ទំនង (Messages)' : 'View Messages'}</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wide">Granted</span>
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="px-1 sm:px-2 py-1">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2.5">
                <FiActivity className="text-[#2563EB]" size={18} />
                <span>{isKhmer ? 'ព័ត៌មានលម្អិតនៃគណនី' : 'Account Details'}</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-slate-500 font-medium">{isKhmer ? 'អត្តសញ្ញាណគណនី (ID)' : 'Account ID'}</span>
                  <span className="font-mono font-bold text-slate-800">#ADM-{profileData.username}</span>
                </div>
                <div className="flex justify-between items-center px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-slate-500 font-medium">{isKhmer ? 'កាលបរិច្ឆេទបង្កើត' : 'Account Created'}</span>
                  <span className="font-medium text-slate-800">
                    {profileData.created_at ? new Date(profileData.created_at).toLocaleString() : 'System Default'}
                  </span>
                </div>
                <div className="flex justify-between items-center px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-slate-500 font-medium">{isKhmer ? 'កែប្រែចុងក្រោយ' : 'Last Updated'}</span>
                  <span className="font-medium text-slate-800">
                    {profileData.updated_at ? new Date(profileData.updated_at).toLocaleString() : 'Just now'}
                  </span>
                </div>
                <div className="flex justify-between items-center px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-slate-500 font-medium">{isKhmer ? 'ស្ថានភាព Session' : 'Current Session'}</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Authenticated & Active</span>
                  </span>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
