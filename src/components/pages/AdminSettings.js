import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiSettings,
  FiGlobe,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFacebook,
  FiYoutube,
  FiImage,
  FiSave,
  FiMessageCircle,
  FiMap,
  FiUploadCloud,
  FiTrash2,
  FiEdit2,
  FiLock,
  FiUnlock,
  FiX,
  FiInfo,
} from 'react-icons/fi';

import api from '../../services/api';
import AdminCard from '../common/AdminCard';
import { getImageUrl } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';

const initialSettings = {
  site_name_en: 'SC Academy',
  site_name_km: 'SC Academy',
  site_description_en: '',
  site_description_km: '',
  logo_url: '',
  favicon_url: '',
  address_en: '',
  address_km: '',
  phone: '',
  email: '',
  facebook_url: '',
  telegram_url: '',
  youtube_url: '',
  google_map_url: '',
};

const AdminSettings = () => {
  const { t, language } = useLanguage();
  const isKhmer = language === 'km' || language === 'kh';

  const siteNameField = isKhmer ? 'site_name_km' : 'site_name_en';
  const siteDescriptionField = isKhmer
    ? 'site_description_km'
    : 'site_description_en';
  const addressField = isKhmer ? 'address_km' : 'address_en';

  const tr = (key, english, khmer) => {
    const value = t(key);
    if (value && value !== key) {
      return value;
    }
    return isKhmer ? khmer : english;
  };

  const [settings, setSettings] = useState({
    ...initialSettings,
  });

  const [originalSettings, setOriginalSettings] = useState({
    ...initialSettings,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [faviconLoadError, setFaviconLoadError] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/settings/');
      const data = response.data;

      if (data) {
        const loaded = {
          ...initialSettings,
          ...data,
        };
        setSettings(loaded);
        setOriginalSettings(loaded);
      } else {
        setSettings({
          ...initialSettings,
        });
        setOriginalSettings({
          ...initialSettings,
        });
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      toast.error(
        error.response?.data?.detail ||
          tr(
            'settings.loadFailed',
            'Failed to load settings.',
            'មិនអាចផ្ទុកការកំណត់បានទេ។'
          ),
        { toastId: 'settings-load-error' }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field, value) => {
    if (!isEditing) return;
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCancelEdit = () => {
    setSettings({ ...originalSettings });
    setIsEditing(false);
    setLogoLoadError(false);
    setFaviconLoadError(false);
    toast.info(
      isKhmer ? 'បានបោះបង់ការកែប្រែ។' : 'Edit mode cancelled.'
    );
  };

  const handleUploadImage = async (field, file) => {
    if (!isEditing || !file) return;
    const formData = new FormData();
    formData.append('file', file);

    const isLogo = field === 'logo_url';
    if (isLogo) setUploadingLogo(true);
    else setUploadingFavicon(true);

    try {
      const res = await api.post('/api/settings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imagePath = res.data?.image_url;
      if (imagePath) {
        setSettings((prev) => ({ ...prev, [field]: imagePath }));
        if (isLogo) setLogoLoadError(false);
        else setFaviconLoadError(false);
        toast.success(
          isKhmer
            ? 'បានបញ្ចូលរូបភាពដោយជោគជ័យ។'
            : 'Image uploaded successfully.'
        );
      }
    } catch (err) {
      console.error('Upload image error:', err);
      toast.error(
        isKhmer ? 'មិនអាចបញ្ចូលរូបភាពបានទេ។' : 'Failed to upload image.'
      );
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isEditing) return;

    try {
      setSaving(true);

      const payload = {
        site_name_en: settings.site_name_en?.trim() || 'SC Academy',
        site_name_km: settings.site_name_km?.trim() || settings.site_name_en?.trim() || 'SC Academy',
        site_description_en: settings.site_description_en?.trim() || null,
        site_description_km: settings.site_description_km?.trim() || null,
        address_en: settings.address_en?.trim() || null,
        address_km: settings.address_km?.trim() || null,
        logo_url: settings.logo_url?.trim() || null,
        favicon_url: settings.favicon_url?.trim() || null,
        phone: settings.phone?.trim() || null,
        email: settings.email?.trim() || null,
        facebook_url: settings.facebook_url?.trim() || null,
        telegram_url: settings.telegram_url?.trim() || null,
        youtube_url: settings.youtube_url?.trim() || null,
        google_map_url: settings.google_map_url?.trim() || null,
      };

      const response = await api.put('/api/settings/', payload);

      if (response.data) {
        const savedData = {
          ...settings,
          ...response.data,
        };
        setSettings(savedData);
        setOriginalSettings(savedData);
      }

      setIsEditing(false);

      toast.success(
        tr(
          'settings.saved',
          'Settings saved successfully.',
          'បានរក្សាទុកការកំណត់ដោយជោគជ័យ។'
        )
      );
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error(
        error.response?.data?.detail ||
          tr(
            'settings.saveFailed',
            'Failed to save settings.',
            'មិនអាចរក្សាទុកការកំណត់បានទេ។'
          )
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F0F7FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#F0F7FF] border-t-[#0D1B3E]" />
      </div>
    );
  }

  const inputBaseClasses =
    'w-full border border-[#E8EEF9] rounded-lg text-sm text-[#0D1B3E] placeholder:text-[#6B8AFF] outline-none transition ' +
    (isEditing
      ? 'bg-[#F0F7FF] focus:border-[#0D1B3E] focus:bg-white focus:ring-1 focus:ring-[#0D1B3E] cursor-text'
      : 'bg-[#F8FAFC] text-[#334155] border-slate-200/80 cursor-not-allowed opacity-90 select-none');

  return (
    <div
      className={`w-full min-h-screen p-6 bg-[#F0F7FF] ${
        isKhmer ? 'font-khmer' : 'font-english'
      }`}
    >
      <div className="w-full max-w-[1200px] mx-auto space-y-6">
        {/* ================= HEADER & ACTION BAR ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8EEF9] shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#0D1B3E] text-white shadow-md flex-shrink-0">
              <FiSettings size={22} />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0D1B3E] leading-tight">
                  {tr('settings.title', 'Settings', 'ការកំណត់')}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isEditing
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FiUnlock size={13} className="text-amber-600" />
                      <span>{isKhmer ? 'របៀបកែប្រែ' : 'Editing Mode'}</span>
                    </>
                  ) : (
                    <>
                      <FiLock size={13} className="text-slate-500" />
                      <span>{isKhmer ? 'បានចាក់សោ (Read-only)' : 'Locked (Read-only)'}</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-[#6B8AFF] mt-0.5">
                {tr(
                  'settings.subtitle',
                  'Manage website settings and contact information',
                  'គ្រប់គ្រងការកំណត់គេហទំព័រ និងព័ត៌មានទំនាក់ទំនង'
                )}
              </p>
            </div>
          </div>

          {/* TOP ACTION BUTTONS */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-11 px-6 rounded-xl bg-[#0D1B3E] hover:bg-[#1a2d5e] text-white text-sm font-semibold shadow-sm inline-flex items-center gap-2 transition cursor-pointer active:scale-98"
              >
                <FiEdit2 size={16} />
                <span>{isKhmer ? 'កែប្រែការកំណត់' : 'Edit Settings'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving || uploadingLogo || uploadingFavicon}
                  className="h-11 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-sm font-semibold shadow-xs inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <FiX size={16} />
                  <span>{isKhmer ? 'បោះបង់' : 'Cancel'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || uploadingLogo || uploadingFavicon}
                  className="h-11 px-6 rounded-xl bg-[#C23636] hover:bg-[#A92E2E] text-white text-sm font-semibold shadow-sm inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-60 active:scale-98"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      <span>{tr('settings.saving', 'Saving...', 'កំពុងរក្សាទុក...')}</span>
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      <span>{tr('settings.saveChanges', 'Save Changes', 'រក្សាទុក')}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ================= SITE INFORMATION ================= */}
          <AdminCard className="overflow-hidden bg-white border border-[#F0F4FB] rounded-xl shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8EEF9]">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0D1B3E]">
                <FiGlobe size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0D1B3E]">
                  {tr(
                    'settings.siteInformation',
                    'Site Information',
                    'ព័ត៌មានគេហទំព័រ'
                  )}
                </h2>
                <p className="text-xs text-[#6B8AFF] mt-0.5">
                  {tr(
                    'settings.siteInformationSubtitle',
                    'Manage your website name and description',
                    'គ្រប់គ្រងឈ្មោះ និងការពិពណ៌នាគេហទំព័រ'
                  )}
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-1.5">
                    {tr('settings.siteName', 'Site Name', 'ឈ្មោះគេហទំព័រ')}
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={settings[siteNameField] || ''}
                    onChange={(e) => handleChange(siteNameField, e.target.value)}
                    className={`${inputBaseClasses} h-11 px-3.5`}
                    placeholder="SC Academy"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-1.5">
                    {tr(
                      'settings.siteDescription',
                      'Site Description',
                      'ការពិពណ៌នាគេហទំព័រ'
                    )}
                  </label>
                  <textarea
                    rows={3}
                    disabled={!isEditing}
                    value={settings[siteDescriptionField] || ''}
                    onChange={(e) =>
                      handleChange(siteDescriptionField, e.target.value)
                    }
                    className={`${inputBaseClasses} p-3.5 resize-none`}
                    placeholder={
                      isKhmer
                        ? 'សរសេរការពិពណ៌នាអំពីសាលា...'
                        : 'Write site description...'
                    }
                  />
                </div>
              </div>
            </div>
          </AdminCard>

          {/* ================= LOGO & FAVICON UPLOAD ================= */}
          <AdminCard className="overflow-hidden bg-white border border-[#F0F4FB] rounded-xl shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8EEF9]">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0D1B3E]">
                <FiImage size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0D1B3E]">
                  {isKhmer ? 'រូបសញ្ញា Logo និង Favicon' : 'Logo & Favicon'}
                </h2>
                <p className="text-xs text-[#6B8AFF] mt-0.5">
                  {isKhmer
                    ? 'បញ្ចូលរូបសញ្ញា Logo និង Favicon សម្រាប់បង្ហាញលើគេហទំព័រ'
                    : 'Upload logo and favicon images for your website'}
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LOGO UPLOAD */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-[#0D1B3E]">
                      {isKhmer ? 'រូបសញ្ញាសាលា (Logo)' : 'School Logo'}
                    </label>
                    {!isEditing && (
                      <span className="text-xs text-slate-400 font-medium">
                        {isKhmer ? '🔒 ចុចកែប្រែដើម្បីប្ដូរ' : '🔒 Read-only'}
                      </span>
                    )}
                  </div>

                  {!settings.logo_url || logoLoadError ? (
                    <label
                      className={`min-h-[160px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-5 text-center block transition ${
                        isEditing
                          ? 'border-[#E8EEF9] bg-[#F0F7FF] hover:border-[#0D1B3E] cursor-pointer'
                          : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.svg,image/*"
                        onChange={(e) =>
                          handleUploadImage('logo_url', e.target.files?.[0])
                        }
                        disabled={!isEditing || uploadingLogo}
                        className="hidden"
                      />
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#0D1B3E] border border-[#E8EEF9] mb-3 shadow-xs mx-auto">
                        {uploadingLogo ? (
                          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8EEF9] border-t-[#0D1B3E]" />
                        ) : isEditing ? (
                          <FiUploadCloud size={24} />
                        ) : (
                          <FiLock size={20} className="text-slate-400" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#0D1B3E]">
                        {uploadingLogo
                          ? isKhmer
                            ? 'កំពុងបញ្ចូល Logo...'
                            : 'Uploading Logo...'
                          : logoLoadError
                          ? isKhmer
                            ? 'រូបភាពមុនរកមិនឃើញ'
                            : 'Image not found'
                          : !isEditing
                          ? isKhmer
                            ? 'មិនទាន់មាន Logo'
                            : 'No Logo uploaded'
                          : isKhmer
                          ? 'ចុចដើម្បីជ្រើសរើស Logo សាលា'
                          : 'Click to select school logo'}
                      </p>
                      <p className="text-xs text-[#6B8AFF] mt-1">
                        {isEditing
                          ? 'PNG, JPG, WEBP, SVG — Max 5MB'
                          : isKhmer
                          ? 'ចុចប៊ូតុង "កែប្រែការកំណត់" ដើម្បីបញ្ចូលរូបភាព'
                          : 'Click "Edit Settings" to upload'}
                      </p>
                    </label>
                  ) : (
                    <div className="relative h-[160px] rounded-xl overflow-hidden border border-[#E8EEF9] bg-[#F0F7FF] flex items-center justify-center p-4">
                      <img
                        src={getImageUrl(settings.logo_url)}
                        alt="School Logo"
                        className="max-h-full max-w-full object-contain"
                        onError={() => setLogoLoadError(true)}
                      />

                      {isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              handleChange('logo_url', '');
                              setLogoLoadError(false);
                            }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[#C23636] text-white flex items-center justify-center hover:bg-[#A92E2E] shadow transition cursor-pointer"
                            title={isKhmer ? 'លុប Logo' : 'Remove Logo'}
                          >
                            <FiTrash2 size={15} />
                          </button>

                          <label className="absolute bottom-3 right-3 h-8 px-3 bg-white text-[#0D1B3E] rounded-lg text-xs font-semibold shadow hover:bg-slate-50 cursor-pointer inline-flex items-center">
                            <span>{isKhmer ? 'ប្ដូរ Logo' : 'Change Logo'}</span>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,.svg,image/*"
                              onChange={(e) =>
                                handleUploadImage('logo_url', e.target.files?.[0])
                              }
                              disabled={uploadingLogo}
                              className="hidden"
                            />
                          </label>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* FAVICON UPLOAD */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-[#0D1B3E]">
                      {isKhmer ? 'រូបសញ្ញា Favicon (លើ Tab Browser)' : 'Favicon'}
                    </label>
                    {!isEditing && (
                      <span className="text-xs text-slate-400 font-medium">
                        {isKhmer ? '🔒 ចុចកែប្រែដើម្បីប្ដូរ' : '🔒 Read-only'}
                      </span>
                    )}
                  </div>

                  {!settings.favicon_url || faviconLoadError ? (
                    <label
                      className={`min-h-[160px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-5 text-center block transition ${
                        isEditing
                          ? 'border-[#E8EEF9] bg-[#F0F7FF] hover:border-[#0D1B3E] cursor-pointer'
                          : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.ico,.svg,image/*"
                        onChange={(e) =>
                          handleUploadImage('favicon_url', e.target.files?.[0])
                        }
                        disabled={!isEditing || uploadingFavicon}
                        className="hidden"
                      />
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#0D1B3E] border border-[#E8EEF9] mb-3 shadow-xs mx-auto">
                        {uploadingFavicon ? (
                          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8EEF9] border-t-[#0D1B3E]" />
                        ) : isEditing ? (
                          <FiUploadCloud size={24} />
                        ) : (
                          <FiLock size={20} className="text-slate-400" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#0D1B3E]">
                        {uploadingFavicon
                          ? isKhmer
                            ? 'កំពុងបញ្ចូល Favicon...'
                            : 'Uploading Favicon...'
                          : faviconLoadError
                          ? isKhmer
                            ? 'Favicon មុនរកមិនឃើញ'
                            : 'Favicon not found'
                          : !isEditing
                          ? isKhmer
                            ? 'មិនទាន់មាន Favicon'
                            : 'No Favicon uploaded'
                          : isKhmer
                          ? 'ចុចដើម្បីជ្រើសរើស Favicon'
                          : 'Click to select Favicon'}
                      </p>
                      <p className="text-xs text-[#6B8AFF] mt-1">
                        {isEditing
                          ? 'ICO, PNG, SVG, WEBP — Max 2MB'
                          : isKhmer
                          ? 'ចុចប៊ូតុង "កែប្រែការកំណត់" ដើម្បីបញ្ចូល Favicon'
                          : 'Click "Edit Settings" to upload'}
                      </p>
                    </label>
                  ) : (
                    <div className="relative h-[160px] rounded-xl overflow-hidden border border-[#E8EEF9] bg-[#F0F7FF] flex items-center justify-center p-4">
                      <img
                        src={getImageUrl(settings.favicon_url)}
                        alt="Favicon"
                        className="w-14 h-14 object-contain rounded-lg shadow-xs bg-white p-2 border border-[#E8EEF9]"
                        onError={() => setFaviconLoadError(true)}
                      />

                      {isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              handleChange('favicon_url', '');
                              setFaviconLoadError(false);
                            }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[#C23636] text-white flex items-center justify-center hover:bg-[#A92E2E] shadow transition cursor-pointer"
                            title={isKhmer ? 'លុប Favicon' : 'Remove Favicon'}
                          >
                            <FiTrash2 size={15} />
                          </button>

                          <label className="absolute bottom-3 right-3 h-8 px-3 bg-white text-[#0D1B3E] rounded-lg text-xs font-semibold shadow hover:bg-slate-50 cursor-pointer inline-flex items-center">
                            <span>{isKhmer ? 'ប្ដូរ Favicon' : 'Change Favicon'}</span>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,.ico,.svg,image/*"
                              onChange={(e) =>
                                handleUploadImage('favicon_url', e.target.files?.[0])
                              }
                              disabled={uploadingFavicon}
                              className="hidden"
                            />
                          </label>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AdminCard>

          {/* ================= CONTACT INFORMATION ================= */}
          <AdminCard className="overflow-hidden bg-white border border-[#F0F4FB] rounded-xl shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8EEF9]">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0D1B3E]">
                <FiPhone size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0D1B3E]">
                  {tr(
                    'settings.contactInformation',
                    'Contact Information',
                    'ព័ត៌មានទំនាក់ទំនង'
                  )}
                </h2>
                <p className="text-xs text-[#6B8AFF] mt-0.5">
                  {tr(
                    'settings.contactInformationSubtitle',
                    'Manage your school contact numbers, email and location',
                    'គ្រប់គ្រងលេខទូរស័ព្ទ អ៊ីមែល និងទីតាំងសាលា'
                  )}
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-1.5">
                    {tr('settings.phone', 'Phone Number', 'លេខទូរស័ព្ទ')}
                  </label>
                  <div className="relative">
                    <FiPhone
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B8AFF]"
                    />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={settings.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`${inputBaseClasses} h-11 pl-10 pr-3.5`}
                      placeholder="+855 12 345 678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-1.5">
                    {tr('settings.email', 'Email Address', 'អ៊ីមែល')}
                  </label>
                  <div className="relative">
                    <FiMail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B8AFF]"
                    />
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={settings.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`${inputBaseClasses} h-11 pl-10 pr-3.5`}
                      placeholder="info@scacademy.edu.kh"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-1.5">
                    {tr('settings.address', 'Address', 'អាសយដ្ឋាន')}
                  </label>
                  <div className="relative">
                    <FiMapPin
                      size={16}
                      className="absolute left-3.5 top-3.5 text-[#6B8AFF]"
                    />
                    <textarea
                      rows={2}
                      disabled={!isEditing}
                      value={settings[addressField] || ''}
                      onChange={(e) => handleChange(addressField, e.target.value)}
                      className={`${inputBaseClasses} pl-10 pr-3.5 py-3 resize-none`}
                      placeholder={
                        isKhmer
                          ? 'បញ្ចូលអាសយដ្ឋានសាលា...'
                          : 'Enter school address...'
                      }
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-1.5">
                    {tr(
                      'settings.googleMapUrl',
                      'Google Maps Link',
                      'តំណ Google Map'
                    )}
                  </label>
                  <div className="relative">
                    <FiMap
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B8AFF]"
                    />
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={settings.google_map_url || ''}
                      onChange={(e) =>
                        handleChange('google_map_url', e.target.value)
                      }
                      className={`${inputBaseClasses} h-11 pl-10 pr-3.5`}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* ================= SOCIAL MEDIA ================= */}
          <AdminCard className="overflow-hidden bg-white border border-[#F0F4FB] rounded-xl shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8EEF9]">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0D1B3E]">
                <FiFacebook size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0D1B3E]">
                  {tr(
                    'settings.socialLinks',
                    'Social Media Links',
                    'បណ្តាញសង្គម'
                  )}
                </h2>
                <p className="text-xs text-[#6B8AFF] mt-0.5">
                  {tr(
                    'settings.socialLinksSubtitle',
                    'Connect your social media pages',
                    'ភ្ជាប់ទំព័របណ្តាញសង្គមរបស់សាលា'
                  )}
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-1.5">
                    Facebook Page
                  </label>
                  <div className="relative">
                    <FiFacebook
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1877F2]"
                    />
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={settings.facebook_url || ''}
                      onChange={(e) =>
                        handleChange('facebook_url', e.target.value)
                      }
                      className={`${inputBaseClasses} h-11 pl-10 pr-3.5`}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-1.5">
                    Telegram Channel
                  </label>
                  <div className="relative">
                    <FiMessageCircle
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#229ED9]"
                    />
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={settings.telegram_url || ''}
                      onChange={(e) =>
                        handleChange('telegram_url', e.target.value)
                      }
                      className={`${inputBaseClasses} h-11 pl-10 pr-3.5`}
                      placeholder="https://t.me/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0D1B3E] mb-1.5">
                    YouTube Channel
                  </label>
                  <div className="relative">
                    <FiYoutube
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF0000]"
                    />
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={settings.youtube_url || ''}
                      onChange={(e) =>
                        handleChange('youtube_url', e.target.value)
                      }
                      className={`${inputBaseClasses} h-11 pl-10 pr-3.5`}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* ================= BOTTOM ACTION BAR ================= */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E8EEF9] shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FiInfo size={16} className="text-[#2563EB]" />
              <span>
                {isEditing
                  ? isKhmer
                    ? 'អ្នកកំពុងស្ថិតក្នុងរបៀបកែប្រែ — សូមចុច "រក្សាទុក" ដើម្បីអនុវត្តការផ្លាស់ប្តូរ'
                    : 'You are in edit mode — Click "Save Changes" to apply'
                  : isKhmer
                  ? 'ព័ត៌មានត្រូវបានចាក់សោសុវត្ថិភាព — ចុច "កែប្រែការកំណត់" ដើម្បីកែប្រែ'
                  : 'Information is locked for safety — Click "Edit Settings" to modify'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="h-10 px-5 rounded-lg bg-[#0D1B3E] hover:bg-[#1a2d5e] text-white text-sm font-semibold shadow-sm inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <FiEdit2 size={15} />
                  <span>{isKhmer ? 'កែប្រែការកំណត់' : 'Edit Settings'}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving || uploadingLogo || uploadingFavicon}
                    className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold inline-flex items-center gap-2 transition cursor-pointer"
                  >
                    <FiX size={15} />
                    <span>{isKhmer ? 'បោះបង់' : 'Cancel'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={saving || uploadingLogo || uploadingFavicon}
                    className="h-10 inline-flex items-center justify-center gap-2 px-6 rounded-lg bg-[#C23636] hover:bg-[#A92E2E] text-white text-sm font-semibold shadow-sm transition disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        <span>
                          {tr('settings.saving', 'Saving...', 'កំពុងរក្សាទុក...')}
                        </span>
                      </>
                    ) : (
                      <>
                        <FiSave size={15} />
                        <span>
                          {tr(
                            'settings.saveChanges',
                            'Save Changes',
                            'រក្សាទុកការកំណត់'
                          )}
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
