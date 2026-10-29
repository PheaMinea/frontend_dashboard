import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiImage,
  FiUploadCloud,
  FiX,
  FiStar,
  FiSearch,
  FiFilter,
  FiEye,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

import api, { getApiErrorMessage } from '../../services/api';
import { getImageUrl } from '../../utils/helpers';
import AdminModal from '../common/AdminModal';
import AdminCard from '../common/AdminCard';
import AdminTable from '../common/AdminTable';
import { useLanguage } from '../../contexts/LanguageContext';

const categoryOptions = [
  { en: 'School Activities', km: 'សកម្មភាពសាលា' },
  { en: 'Classroom', km: 'ថ្នាក់រៀន' },
  { en: 'Graduation', km: 'ពិធីបញ្ចប់ការសិក្សា' },
  { en: 'Trips', km: 'ដំណើរកម្សាន្ត' },
  { en: 'Special Events', km: 'ព្រឹត្តិការណ៍ពិសេស' },
  { en: 'Social Activities and Leadership', km: 'សកម្មភាពសង្គម និងភាពជាអ្នកដឹកនាំ' },
  { en: 'Education', km: 'ការអប់រំ' },
  { en: 'Workshops', km: 'សិក្ខាសាលា' },
  { en: 'Student Activities', km: 'សកម្មភាពសិស្ស' },
  { en: 'Learning Activities', km: 'សកម្មភាពសិក្សា' },
  { en: 'Technology and Education', km: 'បច្ចេកវិទ្យា និងការអប់រំ' },
  { en: 'Youth and Leadership', km: 'យុវជន និងភាពជាអ្នកដឹកនាំ' },
  { en: 'Social Activities', km: 'សកម្មភាពសង្គម' },
  { en: 'Knowledge Sharing', km: 'ចែករំលែកចំណេះដឹង' },
  { en: 'Teachers', km: 'គ្រូបង្រៀន' },
  { en: 'School Community', km: 'សហគមន៍សាលា' },
  { en: 'Study Tours', km: 'ទស្សនកិច្ចសិក្សា' },
  { en: 'Entrepreneurship', km: 'សហគ្រិនភាព' },
  { en: 'School News', km: 'ព័ត៌មានសាលា' },
];

const initialForm = {
  title_en: '',
  category_en: '',
  description_en: '',
  title_km: '',
  category_km: '',
  description_km: '',
  is_featured: false,
  order: 0,
};

const AdminGallery = () => {
  const { language } = useLanguage();
  const isKhmer = language === 'km' || language === 'kh';

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [previewModalImg, setPreviewModalImg] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [formData, setFormData] = useState({ ...initialForm });

  const getLocalizedValue = (item, field) => {
    if (!item) return '';
    if (isKhmer) {
      return item[`${field}_km`] || item[`${field}_en`] || '';
    }
    return item[`${field}_en`] || item[`${field}_km`] || '';
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const minDelay = new Promise((resolve) => setTimeout(resolve, 600));
      const [response] = await Promise.all([
        api.get('/api/gallery/'),
        minDelay,
      ]);
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Gallery error:', error);
      toast.error(getApiErrorMessage(error, isKhmer ? 'មិនអាចទាញទិន្នន័យរូបភាពបានទេ' : 'Failed to load gallery images'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleOpenCreate = () => {
    setEditingImage(null);
    setFormData({ ...initialForm });
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const handleEdit = (img) => {
    setEditingImage(img);
    setFormData({
      title_en: img.title_en || '',
      category_en: img.category_en || '',
      description_en: img.description_en || '',
      title_km: img.title_km || '',
      category_km: img.category_km || '',
      description_km: img.description_km || '',
      is_featured: Boolean(img.is_featured),
      order: img.order || 0,
    });
    setImageFile(null);
    setImagePreview(img.image_url ? getImageUrl(img.image_url) : '');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      isKhmer ? 'តើអ្នកប្រាកដជាចង់លុបរូបភាពនេះមែនទេ?' : 'Are you sure you want to delete this image?'
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/gallery/${id}`);
      toast.success(isKhmer ? 'បានលុបរូបភាពដោយជោគជ័យ' : 'Image deleted successfully');
      setImages((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(getApiErrorMessage(error, isKhmer ? 'មិនអាចលុបរូបភាពបានទេ' : 'Failed to delete image'));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(isKhmer ? 'សូមជ្រើសរើស File រូបភាពដែលត្រឹមត្រូវ' : 'Please select a valid image file');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingImage && !imageFile) {
      toast.error(isKhmer ? 'សូមជ្រើសរើសរូបភាពដើម្បី Upload' : 'Please select an image file to upload');
      return;
    }

    const titleKm =
      formData.title_km?.trim() ||
      formData.title_en?.trim() ||
      (isKhmer ? 'រូបភាពវិចិត្រសាល' : 'Gallery Photo');

    const titleEn =
      formData.title_en?.trim() ||
      formData.title_km?.trim() ||
      'Gallery Photo';

    const catKm =
      formData.category_km?.trim() ||
      (isKhmer ? 'សកម្មភាពសាលា' : 'School Activities');

    const catEn =
      formData.category_en?.trim() ||
      (isKhmer ? 'School Activities' : 'School Activities');

    const descKm =
      formData.description_km?.trim() ||
      formData.description_en?.trim() ||
      '';

    const descEn =
      formData.description_en?.trim() ||
      formData.description_km?.trim() ||
      '';

    try {
      setSubmitting(true);
      const data = new FormData();

      data.append('title_en', titleEn);
      data.append('category_en', catEn);
      data.append('description_en', descEn);
      data.append('title_km', titleKm);
      data.append('category_km', catKm);
      data.append('description_km', descKm);
      data.append('is_featured', formData.is_featured ? 'true' : 'false');
      data.append('order', String(formData.order || 0));

      if (imageFile) {
        data.append('file', imageFile);
      }

      if (editingImage) {
        await api.put(`/api/gallery/${editingImage.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(isKhmer ? 'បានកែប្រែរូបភាពដោយជោគជ័យ' : 'Image updated successfully');
      } else {
        await api.post('/api/gallery/', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(isKhmer ? 'បានបញ្ចូលរូបភាពថ្មីដោយជោគជ័យ' : 'Image uploaded successfully');
      }

      setModalOpen(false);
      await fetchImages();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(getApiErrorMessage(error, isKhmer ? 'មិនអាចរក្សាទុកទិន្នន័យបានទេ' : 'Failed to save image'));
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered images
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const titleEn = (img.title_en || '').toLowerCase();
      const titleKm = (img.title_km || '').toLowerCase();
      const catEn = img.category_en || '';
      const catKm = img.category_km || '';
      const term = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || titleEn.includes(term) || titleKm.includes(term);
      const matchesCategory =
        selectedCategory === 'ALL' || catEn === selectedCategory || catKm === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [images, searchTerm, selectedCategory]);

  // Statistics
  const featuredCount = useMemo(() => images.filter((i) => i.is_featured).length, [images]);
  const categoriesCount = useMemo(
    () => new Set(images.map((i) => getLocalizedValue(i, 'category')).filter(Boolean)).size,
    [images, isKhmer]
  );

  // Table Columns
  const columns = [
    {
      key: 'image',
      label: isKhmer ? 'រូបភាព' : 'Image',
      render: (_, row) => {
        const fullUrl = row.image_url ? getImageUrl(row.image_url) : '/default-avatar.png';
        const title = getLocalizedValue(row, 'title') || 'Gallery Photo';
        return (
          <div
            className="relative w-[105px] h-[62px] bg-blue-50 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group border border-blue-100"
            onClick={() => setPreviewModalImg(fullUrl)}
          >
            <img
              src={fullUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = '/default-avatar.png';
              }}
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <FiEye size={16} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'title',
      label: isKhmer ? 'ចំណងជើង' : 'Title',
      render: (_, row) => {
        const primaryTitle = getLocalizedValue(row, 'title') || (isKhmer ? 'គ្មានចំណងជើង' : 'Untitled');
        const secondaryTitle = isKhmer ? row.title_en : row.title_km;
        const description = getLocalizedValue(row, 'description');

        return (
          <div className="max-w-[320px]">
            <p className="font-semibold text-blue-900 truncate">{primaryTitle}</p>
            {secondaryTitle && secondaryTitle !== primaryTitle && (
              <p className="text-xs text-blue-400 truncate">{secondaryTitle}</p>
            )}
            {description && (
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{description}</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'category',
      label: isKhmer ? 'ប្រភេទ' : 'Category',
      render: (_, row) => {
        const catName = getLocalizedValue(row, 'category') || (isKhmer ? 'ទូទៅ' : 'General');
        return (
          <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-900 rounded-full text-[11px] font-semibold whitespace-nowrap">
            {catName}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: isKhmer ? 'សកម្មភាព' : 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleEdit(row)}
            className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-900 rounded-lg hover:bg-blue-900 hover:text-white transition"
            title={isKhmer ? 'កែប្រែ' : 'Edit'}
          >
            <FiEdit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
            title={isKhmer ? 'លុប' : 'Delete'}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`w-full ${isKhmer ? 'font-khmer' : 'font-english'}`}>
      
      {/* HEADER (Exact style matching other pages) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-900 text-white rounded-xl flex items-center justify-center shadow-sm">
            <FiImage size={18} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-blue-900">
              {isKhmer ? 'គ្រប់គ្រងវិចិត្រសាលរូបភាព' : 'Gallery Management'}
            </h1>
            <p className="text-xs md:text-sm text-blue-400 mt-1">
              {isKhmer
                ? 'បន្ថែម កែប្រែ និងលុបរូបភាពសកម្មភាពផ្សេងៗរបស់សាលា។'
                : 'Upload, manage, and organize school activity and campus photographs.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="h-10 px-4 inline-flex items-center justify-center gap-2 bg-red-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-red-700 hover:shadow-md transition-all"
        >
          <FiPlus size={17} />
          <span>{isKhmer ? 'បន្ថែមរូបភាពថ្មី' : 'Upload Image'}</span>
        </button>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-blue-400">
            {isKhmer ? 'រូបភាពសរុប' : 'Total Photos'}
          </p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {images.length}
          </p>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-blue-400">
            {isKhmer ? 'ប្រភេទសរុប' : 'Categories'}
          </p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {categoriesCount}
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH (Exact AdminCard layout) */}
      <div className="mb-6">
        <AdminCard>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isKhmer ? 'ស្វែងរកតាមចំណងជើងរូបភាព...' : 'Search by image title...'}
                className="w-full pl-10 pr-4 py-2 text-sm border border-blue-200 rounded-lg focus:border-blue-900 focus:outline-none transition-colors text-blue-900"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-500"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-blue-300 flex-shrink-0" size={16} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 text-sm border border-blue-200 rounded-lg focus:border-blue-900 focus:outline-none font-semibold text-blue-900 bg-white"
              >
                <option value="ALL">{isKhmer ? 'ប្រភេទទាំងអស់' : 'All Categories'}</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.en} value={cat.en}>
                    {isKhmer ? cat.km : cat.en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* ADMIN TABLE */}
      <AdminTable columns={columns} data={filteredImages} loading={loading} />

      {/* UPLOAD / EDIT MODAL */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingImage
            ? (isKhmer ? 'កែប្រែរូបភាពវិចិត្រសាល' : 'Edit Gallery Photo')
            : (isKhmer ? 'បញ្ចូលរូបភាពថ្មីក្នុងវិចិត្រសាល' : 'Upload Gallery Photo')
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* IMAGE UPLOAD AREA */}
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer ? 'ជ្រើសរើសរូបភាព' : 'Choose Photo / Image'}
                <span className="text-[#C23636] ml-1">*</span>
              </label>

              {!imageFile && !imagePreview ? (
                <label className="min-h-[140px] border-2 border-dashed border-[#E8EEF9] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-[#F0F7FF] hover:border-[#0D1B3E] transition p-5 text-center block">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#0D1B3E] border border-[#E8EEF9] mb-3 shadow-xs mx-auto">
                    <FiUploadCloud size={23} />
                  </div>
                  <p className="text-sm font-semibold text-[#0D1B3E]">
                    {isKhmer ? 'ចុចទីនេះដើម្បីជ្រើសរើសរូបភាព' : 'Click to select image file'}
                  </p>
                  <p className="text-xs text-[#6B8AFF] mt-1">
                    JPG, JPEG, PNG, WEBP — 10 MB
                  </p>
                </label>
              ) : (
                <div className="relative h-[220px] rounded-xl overflow-hidden border border-[#E8EEF9] bg-[#F0F7FF] group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-[#C23636] text-white flex items-center justify-center hover:bg-[#A92E2E] shadow"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  <label className="absolute bottom-3 right-3 h-9 px-3 bg-white text-[#0D1B3E] rounded-lg text-xs font-semibold shadow hover:bg-slate-50 cursor-pointer inline-flex items-center">
                    <span>{isKhmer ? 'ប្ដូររូបភាព' : 'Change Image'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* PHOTO TITLE */}
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer ? 'ចំណងជើងរូបភាព' : 'Photo Title'}
              </label>
              <input
                type="text"
                value={isKhmer ? formData.title_km : formData.title_en}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    title_km: isKhmer ? val : formData.title_km || val,
                    title_en: !isKhmer ? val : formData.title_en || val,
                  });
                }}
                placeholder={
                  isKhmer
                    ? 'ឧ. សកម្មភាពសិក្ខាសាលាចែករំលែកចំណេះដឹង IT'
                    : 'e.g. IT Knowledge Sharing Workshop'
                }
                className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition ${
                  isKhmer ? 'font-khmer' : 'font-english'
                }`}
              />
            </div>

            {/* CATEGORY DROPDOWN */}
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer ? 'ប្រភេទរូបភាព' : 'Photo Category'}
              </label>
              <select
                value={isKhmer ? (formData.category_km || 'សកម្មភាពសាលា') : (formData.category_en || 'School Activities')}
                onChange={(e) => {
                  const selectedVal = e.target.value;
                  const selected = categoryOptions.find(
                    (c) => c.km === selectedVal || c.en === selectedVal
                  );
                  setFormData({
                    ...formData,
                    category_km: selected ? selected.km : selectedVal,
                    category_en: selected ? selected.en : selectedVal,
                  });
                }}
                className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition bg-white ${
                  isKhmer ? 'font-khmer' : 'font-english'
                }`}
              >
                {categoryOptions.map((c) => (
                  <option key={c.en} value={isKhmer ? c.km : c.en}>
                    {isKhmer ? c.km : c.en}
                  </option>
                ))}
              </select>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer ? 'ការពិពណ៌នាសង្ខេប' : 'Short Description'}
              </label>
              <textarea
                rows={3}
                value={isKhmer ? formData.description_km : formData.description_en}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    description_km: isKhmer ? val : formData.description_km,
                    description_en: !isKhmer ? val : formData.description_en,
                  });
                }}
                placeholder={
                  isKhmer
                    ? 'បញ្ចូលព័ត៌មានបន្ថែមអំពីរូបភាព...'
                    : 'Enter additional details about this photo...'
                }
                className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition resize-none ${
                  isKhmer ? 'font-khmer' : 'font-english'
                }`}
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-6 pt-4 border-t border-[#E8EEF9] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
              className="h-10 px-4 bg-white border border-[#E8EEF9] text-[#6B8AFF] rounded-lg text-sm font-semibold hover:bg-[#F0F7FF] disabled:opacity-50 transition"
            >
              {isKhmer ? 'បោះបង់' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="min-w-[140px] h-10 px-5 bg-[#C23636] text-white rounded-lg text-sm font-semibold hover:bg-[#A92E2E] disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {isKhmer ? 'កំពុងរក្សាទុក...' : 'Saving...'}
                </>
              ) : editingImage ? (
                <>
                  <FiEdit2 size={15} />
                  {isKhmer ? 'រក្សាទុកការកែប្រែ' : 'Update Photo'}
                </>
              ) : (
                <>
                  <FiPlus size={16} />
                  {isKhmer ? 'បញ្ចូលរូបភាព' : 'Upload Photo'}
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Full Image Preview Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-black">
            <img src={previewModalImg} alt="Preview" className="max-w-full max-h-[85vh] object-contain mx-auto" />
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminGallery;
