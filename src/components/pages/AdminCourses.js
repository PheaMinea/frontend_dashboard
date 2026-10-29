import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBookOpen,
  FiLayers,
  FiUploadCloud,
  FiX,
  FiCheckCircle,
  FiXCircle } from 'react-icons/fi';

import api, { getApiErrorMessage } from '../../services/api';
import { getImageUrl } from '../../utils/helpers';

import AdminTable from '../common/AdminTable';
import AdminModal from '../common/AdminModal';
import AdminCard from '../common/AdminCard';

import { useLanguage } from '../../contexts/LanguageContext';

const initialCourseForm = {
  title_en: '',
  description_en: '',
  short_description_en: '',
  duration_en: '',
  level_en: '',

  what_you_learn_en: '',
  requirements_en: '',
  target_students_en: '',

  title_km: '',
  description_km: '',
  short_description_km: '',
  duration_km: '',
  level_km: '',

  what_you_learn_km: '',
  requirements_km: '',
  target_students_km: '',

  slug: '',
  category_id: '',

  status: 'available',
  certificate: true,
  language: '',
  schedule: '',

  is_active: true,
  is_featured: false,
  order: 0 };

const initialCategoryForm = {
  name_en: '',
  description_en: '',

  name_km: '',
  description_km: '',

  slug: '',
  is_active: true,
  order: 0 };

const AdminCourses = () => {
  const { t, language } = useLanguage();

  const isKhmer = language === 'km' || language === 'kh';
  const langSuffix = isKhmer ? 'km' : 'en';

  const tr = (key, englishFallback, khmerFallback) => {
    const translated = t(key);

    if (translated && translated !== key) {
      return translated;
    }

    return isKhmer ? khmerFallback : englishFallback;
  };

  const [activeTab, setActiveTab] = useState('courses');

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseSubmitting, setCourseSubmitting] = useState(false);

  const [courseFormData, setCourseFormData] = useState({
    ...initialCourseForm });

  const [courseImageFile, setCourseImageFile] = useState(null);
  const [courseImagePreview, setCourseImagePreview] = useState('');

  const courseFileRef = useRef(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const [categoryFormData, setCategoryFormData] = useState({
    ...initialCategoryForm });


  const getCourseValue = (course, field) => {
    if (!course) {
      return '';
    }

    if (isKhmer) {
      return course[`${field}_km`] || course[`${field}_en`] || '';
    }

    return course[`${field}_en`] || course[`${field}_km`] || '';
  };

  const getCategoryValue = (category, field) => {
    if (!category) {
      return '';
    }

    if (isKhmer) {
      return category[`${field}_km`] || category[`${field}_en`] || '';
    }

    return category[`${field}_en`] || category[`${field}_km`] || '';
  };

  const getCategoryOptionLabel = (category) => {
    return (
      getCategoryValue(category, 'name') ||
      category.slug ||
      `Category #${category.id}`
    );
  };

  const getCourseCategoryName = (course) => {
    if (course?.category) {
      const name = getCategoryValue(course.category, 'name');

      if (name) {
        return name;
      }
    }

    const category = categories.find(
      (item) => String(item.id) === String(course?.category_id)
    );

    if (!category) {
      return tr(
        'courses.noCategory',
        'No Category',
        'គ្មានប្រភេទ'
      );
    }

    return (
      getCategoryValue(category, 'name') ||
      tr(
        'courses.noCategory',
        'No Category',
        'គ្មានប្រភេទ'
      )
    );
  };

  const createSlug = (value = '') => {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const minDelay = new Promise((resolve) => setTimeout(resolve, 500));

      const [
        coursesResult,
        categoriesResult,
      ] = await Promise.allSettled([
        api.get('/api/courses/'),
        api.get('/api/courses/categories/all'),
        minDelay,
      ]);

      if (coursesResult.status === 'fulfilled') {
        const coursesData =
          coursesResult.value.data;

        setCourses(
          Array.isArray(coursesData)
            ? coursesData
            : coursesData?.items || []
        );
      } else {
        console.error(
          'Fetch courses error:',
          coursesResult.reason
        );

        toast.error(
          getApiErrorMessage(
            coursesResult.reason,
            tr(
              'courses.loadCoursesFailed',
              'Failed to load courses.',
              'Failed to load courses.'
            )
          )
        );
      }

      if (categoriesResult.status === 'fulfilled') {
        const categoriesData =
          categoriesResult.value.data;

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData?.items || []
        );
      } else {
        console.error(
          'Fetch categories error:',
          categoriesResult.reason
        );

        toast.error(
          getApiErrorMessage(
            categoriesResult.reason,
            tr(
              'courses.loadCategoriesFailed',
              'Failed to load course categories.',
              'Failed to load course categories.'
            )
          )
        );
      }
    } catch (error) {
      console.error('Fetch courses error:', error);

      toast.error(
        getApiErrorMessage(
          error,
          tr(
            'courses.loadFailed',
            'Failed to load courses and categories.',
            'មិនអាចទាញយកវគ្គសិក្សា និងប្រភេទវគ្គសិក្សាបានទេ។'
          )
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (
        courseImagePreview &&
        courseImagePreview.startsWith('blob:')
      ) {
        URL.revokeObjectURL(courseImagePreview);
      }
    };
  }, [courseImagePreview]);

  const resetCourseForm = () => {
    setEditingCourse(null);

    setCourseFormData({
      ...initialCourseForm });

    setCourseImageFile(null);

    if (
      courseImagePreview &&
      courseImagePreview.startsWith('blob:')
    ) {
      URL.revokeObjectURL(courseImagePreview);
    }

    setCourseImagePreview('');

    if (courseFileRef.current) {
      courseFileRef.current.value = '';
    }
  };

  const handleAddCourse = () => {
    resetCourseForm();
    setCourseModalOpen(true);
  };

  const closeCourseModal = () => {
    if (courseSubmitting) {
      return;
    }

    setCourseModalOpen(false);
    resetCourseForm();
  };

  const handleCourseInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setCourseFormData((previous) => {
      const updated = {
        ...previous,
        [name]: type === 'checkbox' ? checked : value };

      if (
        name === 'title_en' &&
        !editingCourse
      ) {
        updated.slug = createSlug(value);
      }

      return updated;
    });
  };

  const handleCourseImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        tr(
          'courses.invalidImage',
          'Please select a JPG, JPEG, PNG or WEBP image.',
          'សូមជ្រើសរើសរូបភាពប្រភេទ JPG, JPEG, PNG ឬ WEBP។'
        )
      );

      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        tr(
          'courses.imageTooLarge',
          'Image must be 5 MB or smaller.',
          'រូបភាពត្រូវមានទំហំ 5 MB ឬតូចជាងនេះ។'
        )
      );

      event.target.value = '';
      return;
    }

    if (
      courseImagePreview &&
      courseImagePreview.startsWith('blob:')
    ) {
      URL.revokeObjectURL(courseImagePreview);
    }

    const preview = URL.createObjectURL(file);

    setCourseImageFile(file);
    setCourseImagePreview(preview);
  };

  const removeCourseImage = () => {
    if (
      courseImagePreview &&
      courseImagePreview.startsWith('blob:')
    ) {
      URL.revokeObjectURL(courseImagePreview);
    }

    setCourseImageFile(null);
    setCourseImagePreview('');

    if (courseFileRef.current) {
      courseFileRef.current.value = '';
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);

    setCourseFormData({
      title_en: course.title_en || '',
      description_en: course.description_en || '',
      short_description_en: course.short_description_en || '',
      duration_en: course.duration_en || '',
      level_en: course.level_en || '',

      title_km: course.title_km || '',
      description_km: course.description_km || '',
      short_description_km: course.short_description_km || '',
      duration_km: course.duration_km || '',
      level_km: course.level_km || '',

      slug: course.slug || '',
      category_id: course.category_id
        ? String(course.category_id)
        : '',

      is_active: course.is_active ?? true,
      is_featured: course.is_featured ?? false,
      order: course.sort_order ?? 0,
      what_you_learn_en:
  course.what_you_learn_en || '',

requirements_en:
  course.requirements_en || '',

target_students_en:
  course.target_students_en || '',

what_you_learn_km:
  course.what_you_learn_km || '',

requirements_km:
  course.requirements_km || '',

target_students_km:
  course.target_students_km || '',

status:
  course.status || 'available',

certificate:
  course.certificate ?? true,

language:
  course.language || '',

schedule:
  course.schedule || '' });

    setCourseImageFile(null);

    setCourseImagePreview(
      getImageUrl(course.image_url || '')
    );

    if (courseFileRef.current) {
      courseFileRef.current.value = '';
    }

    setCourseModalOpen(true);
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();

    const currentTitle =
      courseFormData[`title_${langSuffix}`]?.trim();

    if (!currentTitle) {
      toast.error(
        isKhmer
          ? 'សូមបញ្ចូលចំណងជើងវគ្គសិក្សា។'
          : 'Course title is required.'
      );

      return;
    }

    if (!courseFormData.category_id) {
      toast.error(
        tr(
          'courses.categoryRequired',
          'Please select a course category.',
          'សូមជ្រើសរើសប្រភេទវគ្គសិក្សា។'
        )
      );

      return;
    }

    try {
      setCourseSubmitting(true);

      const payload = new FormData();

      const titleEn =
        courseFormData.title_en?.trim() ||
        currentTitle;

      const titleKm =
        courseFormData.title_km?.trim() ||
        currentTitle;

      const descEn = (courseFormData.description_en || '').trim();
      const descKm = (courseFormData.description_km || '').trim();

      const generatedSlug = createSlug(
        courseFormData.slug?.trim() || titleEn || titleKm || `course-${Date.now()}`
      );

      payload.append('title_en', titleEn);
      payload.append('description_en', descEn);
      payload.append('short_description_en', descEn.slice(0, 160));
      payload.append('duration_en', (courseFormData.duration_en || '').trim());
      payload.append('level_en', (courseFormData.level_en || '').trim());

      payload.append('title_km', titleKm);
      payload.append('description_km', descKm);
      payload.append('short_description_km', descKm.slice(0, 160));
      payload.append('duration_km', (courseFormData.duration_km || '').trim());
      payload.append('level_km', (courseFormData.level_km || '').trim());

      payload.append('slug', generatedSlug);
      payload.append('category_id', String(courseFormData.category_id));
      payload.append('order', String(Number(courseFormData.order) || 0));

      payload.append('what_you_learn_en', (courseFormData.what_you_learn_en || '').trim());
      payload.append('requirements_en', (courseFormData.requirements_en || '').trim());
      payload.append('target_students_en', (courseFormData.target_students_en || '').trim());
      payload.append('what_you_learn_km', (courseFormData.what_you_learn_km || '').trim());
      payload.append('requirements_km', (courseFormData.requirements_km || '').trim());
      payload.append('target_students_km', (courseFormData.target_students_km || '').trim());
      payload.append('target_students_en', courseFormData.target_students_en.trim());
      payload.append('what_you_learn_km', courseFormData.what_you_learn_km.trim());
      payload.append('requirements_km', courseFormData.requirements_km.trim());
      payload.append('target_students_km', courseFormData.target_students_km.trim());
      payload.append('certificate', String(courseFormData.certificate));
      payload.append('language', courseFormData.language.trim());
      payload.append('schedule', courseFormData.schedule.trim());
      payload.append('course_status', courseFormData.status);

      payload.append(
        'is_active',
        String(courseFormData.is_active)
      );

      payload.append(
        'is_featured',
        String(courseFormData.is_featured)
      );

      payload.append(
        'order',
        String(Number(courseFormData.order) || 0)
      );

      if (courseImageFile) {
        payload.append(
          'image_file',
          courseImageFile
        );
      }

      if (editingCourse) {
        await api.put(
          `/api/courses/${editingCourse.id}`,
          payload
        );

        toast.success(
          tr(
            'courses.updatedSuccess',
            'Course updated successfully.',
            'បានកែប្រែវគ្គសិក្សាដោយជោគជ័យ។'
          )
        );
      } else {
        await api.post(
          '/api/courses/',
          payload
        );

        toast.success(
          tr(
            'courses.createdSuccess',
            'Course created successfully.',
            'បានបង្កើតវគ្គសិក្សាដោយជោគជ័យ។'
          )
        );
      }

      setCourseModalOpen(false);
      resetCourseForm();

      await fetchData();
    } catch (error) {
      console.error(
        'Save course error:',
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          tr(
            'courses.saveFailed',
            'Failed to save course.',
            'មិនអាចរក្សាទុកវគ្គសិក្សាបានទេ។'
          )
        )
      );
    } finally {
      setCourseSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    const confirmed = window.confirm(
      tr(
        'courses.deleteConfirm',
        'Are you sure you want to delete this course?',
        'តើអ្នកប្រាកដថាចង់លុបវគ្គសិក្សានេះមែនទេ?'
      )
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/api/courses/${id}`
      );

      toast.success(
        tr(
          'courses.deletedSuccess',
          'Course deleted successfully.',
          'បានលុបវគ្គសិក្សាដោយជោគជ័យ។'
        )
      );

      await fetchData();
    } catch (error) {
      console.error(
        'Delete course error:',
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          tr(
            'courses.deleteFailed',
            'Failed to delete course.',
            'មិនអាចលុបវគ្គសិក្សាបានទេ។'
          )
        )
      );
    }
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);

    setCategoryFormData({
      ...initialCategoryForm });
  };

  const handleAddCategory = () => {
    resetCategoryForm();
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    if (categorySubmitting) {
      return;
    }

    setCategoryModalOpen(false);
    resetCategoryForm();
  };

  const handleCategoryInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setCategoryFormData((previous) => {
      const updated = {
        ...previous,
        [name]: type === 'checkbox' ? checked : value };

      if (
        name === 'name_en' &&
        !editingCategory
      ) {
        updated.slug = createSlug(value);
      }

      return updated;
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);

    setCategoryFormData({
      name_en: category.name_en || '',
      description_en: category.description_en || '',

      name_km: category.name_km || '',
      description_km: category.description_km || '',

      slug: category.slug || '',
      is_active: category.is_active ?? true,
      order: category.sort_order ?? 0 });

    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    const currentName =
      categoryFormData[`name_${langSuffix}`]?.trim();

    if (!currentName) {
      toast.error(
        isKhmer
          ? 'សូមបញ្ចូលឈ្មោះប្រភេទវគ្គសិក្សា។'
          : 'Category name is required.'
      );

      return;
    }

    try {
      setCategorySubmitting(true);

      const payload = new FormData();

      const nameEn =
        categoryFormData.name_en?.trim() ||
        currentName;

      const nameKm =
        categoryFormData.name_km?.trim() ||
        currentName;

      const generatedCatSlug = createSlug(
        categoryFormData.slug?.trim() || nameEn || nameKm || `cat-${Date.now()}`
      );

      payload.append(
        'name_en',
        nameEn
      );

      payload.append(
        'description_en',
        (categoryFormData.description_en || '').trim()
      );

      payload.append(
        'name_km',
        nameKm
      );

      payload.append(
        'description_km',
        (categoryFormData.description_km || '').trim()
      );

      payload.append(
        'slug',
        generatedCatSlug
      );

      payload.append(
        'is_active',
        String(categoryFormData.is_active)
      );

      payload.append(
        'order',
        String(Number(categoryFormData.order) || 0)
      );

      if (editingCategory) {
        await api.put(
          `/api/courses/categories/${editingCategory.id}`,
          payload
        );

        toast.success(
          tr(
            'courses.categoryUpdated',
            'Category updated successfully.',
            'បានកែប្រែប្រភេទវគ្គសិក្សាដោយជោគជ័យ។'
          )
        );
      } else {
        await api.post(
          '/api/courses/categories',
          payload
        );

        toast.success(
          tr(
            'courses.categoryCreated',
            'Category created successfully.',
            'បានបង្កើតប្រភេទវគ្គសិក្សាដោយជោគជ័យ។'
          )
        );
      }

      setCategoryModalOpen(false);
      resetCategoryForm();

      await fetchData();
    } catch (error) {
      console.error(
        'Save category error:',
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          tr(
            'courses.categorySaveFailed',
            'Failed to save category.',
            'មិនអាចរក្សាទុកប្រភេទវគ្គសិក្សាបានទេ។'
          )
        )
      );
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmed = window.confirm(
      tr(
        'courses.categoryDeleteConfirm',
        'Are you sure you want to delete this category?',
        'តើអ្នកប្រាកដថាចង់លុបប្រភេទវគ្គសិក្សានេះមែនទេ?'
      )
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/api/courses/categories/${id}`
      );

      toast.success(
        tr(
          'courses.categoryDeleted',
          'Category deleted successfully.',
          'បានលុបប្រភេទវគ្គសិក្សាដោយជោគជ័យ។'
        )
      );

      await fetchData();
    } catch (error) {
      console.error(
        'Delete category error:',
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          tr(
            'courses.categoryDeleteFailed',
            'Failed to delete category.',
            'មិនអាចលុបប្រភេទវគ្គសិក្សាបានទេ។'
          )
        )
      );
    }
  };

  const activeCourses = courses.filter(
    (course) => course.is_active
  ).length;

  const featuredCourses = courses.filter(
    (course) => course.is_featured
  ).length;

  const activeCategories = categories.filter(
    (category) => category.is_active
  ).length;

  const courseColumns = [
    {
      key: 'image_url',
      label: tr(
        'courses.image',
        'Image',
        'រូបភាព'
      ),

      render: (value, row) => {
        const image = row.image_url || '';

        if (!image) {
          return (
            <div className="w-14 h-10 rounded-lg bg-[#F0F7FF] flex items-center justify-center text-[#0D1B3E]">
              <FiBookOpen size={18} />
            </div>
          );
        }

        return (
          <img
            src={getImageUrl(image)}
            alt={
              getCourseValue(row, 'title') ||
              'Course'
            }
            className="w-14 h-10 object-cover rounded-lg border border-[#E8EEF9]"
            onError={(event) => {
              event.currentTarget.style.display =
                'none';
            }}
          />
        );
      } },

    {
      key: `title_${langSuffix}`,

      label: tr(
        'courses.course',
        'Course',
        'វគ្គសិក្សា'
      ),

      render: (value, row) => {
        const title = getCourseValue(
          row,
          'title'
        );

        const description =
          getCourseValue(
            row,
            'short_description'
          ) ||
          getCourseValue(
            row,
            'description'
          );

        return (
          <div className="max-w-[240px]">
            <p className="text-sm font-bold text-[#0D1B3E] truncate">
              {title ||
                tr(
                  'courses.untitled',
                  'Untitled',
                  'គ្មានចំណងជើង'
                )}
            </p>

            {description && (
              <p className="text-xs text-[#6B8AFF] truncate mt-0.5">
                {description}
              </p>
            )}
          </div>
        );
      } },

    {
      key: 'category_id',

      label: tr(
        'courses.category',
        'Category',
        'ប្រភេទ'
      ),

      render: (value, row) => (
        <span className="inline-flex px-3 py-1 rounded-full bg-[#F0F7FF] text-[#0D1B3E] text-xs font-semibold">
          {getCourseCategoryName(row)}
        </span>
      ) },

    {
      key: `level_${langSuffix}`,

      label: tr(
        'courses.level',
        'Level',
        'កម្រិត'
      ),

      render: (value, row) => (
        <span className="text-sm text-[#6B8AFF]">
          {getCourseValue(row, 'level') ||
            '-'}
        </span>
      ) },

    {
      key: `duration_${langSuffix}`,

      label: tr(
        'courses.duration',
        'Duration',
        'រយៈពេល'
      ),

      render: (value, row) => (
        <span className="text-sm text-[#6B8AFF]">
          {getCourseValue(
            row,
            'duration'
          ) || '-'}
        </span>
      ) },

    {
      key: 'is_active',

      label: tr(
        'common.status',
        'Status',
        'ស្ថានភាព'
      ),

      render: (value) => (
        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
            ${
              value
                ? 'bg-[#EBF9F0] text-[#2E7D32]'
                : 'bg-[#FFEBEE] text-[#C62828]'
            }
          `}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              value
                ? 'bg-[#2E7D32]'
                : 'bg-[#C62828]'
            }`}
          />

          {value
            ? tr(
                'common.active',
                'Active',
                'សកម្ម'
              )
            : tr(
                'common.inactive',
                'Inactive',
                'អសកម្ម'
              )}
        </span>
      ) },

    {
      key: 'actions',

      label: tr(
        'common.actions',
        'Actions',
        'សកម្មភាព'
      ),

      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              handleEditCourse(row)
            }
            title={tr(
              'courses.editCourse',
              'Edit Course',
              'កែប្រែវគ្គសិក្សា'
            )}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F0F7FF] text-[#0D1B3E] hover:bg-[#0D1B3E] hover:text-white transition"
          >
            <FiEdit2 size={14} />
          </button>

          <button
            type="button"
            onClick={() =>
              handleDeleteCourse(row.id)
            }
            title={tr(
              'courses.deleteCourse',
              'Delete Course',
              'លុបវគ្គសិក្សា'
            )}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FFEBEE] text-[#C62828] hover:bg-[#C62828] hover:text-white transition"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ) },
  ];

  const categoryColumns = [
    {
      key: `name_${langSuffix}`,

      label: tr(
        'courses.categoryName',
        'Category Name',
        'ឈ្មោះប្រភេទ'
      ),

      render: (value, row) => (
        <div className="max-w-[220px]">
          <p className="text-sm font-bold text-[#0D1B3E] truncate">
            {getCategoryValue(
              row,
              'name'
            ) || '-'}
          </p>

          {getCategoryValue(
            row,
            'description'
          ) && (
            <p className="text-xs text-[#6B8AFF] truncate mt-0.5">
              {getCategoryValue(
                row,
                'description'
              )}
            </p>
          )}
        </div>
      ) },

    {
      key: 'slug',

      label: tr(
        'courses.slug',
        'Slug',
        'Slug'
      ),

      render: (value) => (
        <span className="text-xs text-[#6B8AFF] bg-[#F0F7FF] px-3 py-1 rounded-lg">
          {value || '-'}
        </span>
      ) },

    {
      key: 'order',

      label: tr(
        'courses.order',
        'Order',
        'លំដាប់'
      ),

      render: (value) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F0F7FF] text-[#0D1B3E] text-xs font-bold">
          {value ?? 0}
        </span>
      ) },

    {
      key: 'is_active',

      label: tr(
        'common.status',
        'Status',
        'ស្ថានភាព'
      ),

      render: (value) => (
        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
            ${
              value
                ? 'bg-[#EBF9F0] text-[#2E7D32]'
                : 'bg-[#FFEBEE] text-[#C62828]'
            }
          `}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              value
                ? 'bg-[#2E7D32]'
                : 'bg-[#C62828]'
            }`}
          />

          {value
            ? tr(
                'common.active',
                'Active',
                'សកម្ម'
              )
            : tr(
                'common.inactive',
                'Inactive',
                'អសកម្ម'
              )}
        </span>
      ) },

    {
      key: 'actions',

      label: tr(
        'common.actions',
        'Actions',
        'សកម្មភាព'
      ),

      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              handleEditCategory(row)
            }
            title={tr(
              'courses.editCategory',
              'Edit Category',
              'កែប្រែប្រភេទ'
            )}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F0F7FF] text-[#0D1B3E] hover:bg-[#0D1B3E] hover:text-white transition"
          >
            <FiEdit2 size={14} />
          </button>

          <button
            type="button"
            onClick={() =>
              handleDeleteCategory(row.id)
            }
            title={tr(
              'courses.deleteCategory',
              'Delete Category',
              'លុបប្រភេទ'
            )}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FFEBEE] text-[#C62828] hover:bg-[#C62828] hover:text-white transition"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ) },
  ];

  return (
    <div
      className={`min-h-screen p-6 bg-[#F0F7FF] ${
        isKhmer ? 'font-khmer' : 'font-english'
      }`}
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0D1B3E] text-white rounded-xl flex items-center justify-center shadow-md">
            <FiBookOpen size={22} />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0D1B3E]">
              {tr(
                'courses.title',
                'Courses Management',
                'គ្រប់គ្រងវគ្គសិក្សា'
              )}
            </h1>

            <p className="text-sm text-[#6B8AFF] mt-0.5">
              {tr(
                'courses.subtitle',
                'Manage courses and course categories',
                'គ្រប់គ្រងវគ្គសិក្សា និងមាតិកា YouTube'
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleAddCategory}
            className="h-11 px-5 inline-flex items-center justify-center gap-2 bg-white text-[#0D1B3E] rounded-lg text-sm font-semibold hover:bg-gray-50 transition shadow-sm border border-[#E8EEF9]"
          >
            <FiPlus size={18} />

            {tr(
              'courses.addCategory',
              'Add Category',
              'បន្ថែមប្រភេទ'
            )}
          </button>

          <button
            type="button"
            onClick={handleAddCourse}
            className="h-11 px-5 inline-flex items-center justify-center gap-2 bg-[#C23636] text-white rounded-lg text-sm font-semibold hover:bg-[#A92E2E] transition shadow-sm"
          >
            <FiPlus size={18} />

            {tr(
              'courses.addCourse',
              'Add Course',
              'បន្ថែមវគ្គសិក្សា'
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#F0F4FB]">
          <div>
            <p className="text-sm text-[#6B8AFF] mb-1">
              {tr(
                'courses.totalCourses',
                'Total Courses',
                'វគ្គសិក្សាសរុប'
              )}
            </p>

            <p className="text-2xl font-bold text-[#0D1B3E]">
              {courses.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#F0F4FB]">
          <div>
            <p className="text-sm text-[#6B8AFF] mb-1">
              {tr(
                'courses.activeCourses',
                'Active Courses',
                'វគ្គសិក្សាសកម្ម'
              )}
            </p>

            <p className="text-2xl font-bold text-[#0D1B3E]">
              {activeCourses}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#F0F4FB]">
          <div>
            <p className="text-sm text-[#6B8AFF] mb-1">
              {tr(
                'courses.featuredCourses',
                'Featured',
                'វគ្គសិក្សាពិសេស'
              )}
            </p>

            <p className="text-2xl font-bold text-[#0D1B3E]">
              {featuredCourses}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#F0F4FB]">
          <div>
            <p className="text-sm text-[#6B8AFF] mb-1">
              {tr(
                'courses.categories',
                'Categories',
                'ប្រភេទវគ្គសិក្សា'
              )}
            </p>

            <p className="text-2xl font-bold text-[#0D1B3E]">
              {activeCategories}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-white rounded-xl shadow-sm w-fit border border-[#F0F4FB]">
        <button
          type="button"
          onClick={() =>
            setActiveTab('courses')
          }
          className={`
            h-10
            px-5
            rounded-lg
            text-sm
            font-semibold
            flex
            items-center
            gap-2
            transition
            ${
              activeTab === 'courses'
                ? 'bg-[#0D1B3E] text-white shadow-sm'
                : 'text-[#6B8AFF] hover:bg-[#F0F7FF]'
            }
          `}
        >
          <FiBookOpen size={16} />

          {tr(
            'courses.courses',
            'Courses',
            'វគ្គសិក្សា'
          )}

          <span
            className={`
              min-w-[22px]
              h-6
              px-1
              rounded-md
              text-xs
              flex
              items-center
              justify-center
              ${
                activeTab === 'courses'
                  ? 'bg-white/20'
                  : 'bg-white'
              }
            `}
          >
            {courses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab('categories')
          }
          className={`
            h-10
            px-5
            rounded-lg
            text-sm
            font-semibold
            flex
            items-center
            gap-2
            transition
            ${
              activeTab === 'categories'
                ? 'bg-[#0D1B3E] text-white shadow-sm'
                : 'text-[#6B8AFF] hover:bg-[#F0F7FF]'
            }
          `}
        >
          <FiLayers size={16} />

          {tr(
            'courses.categories',
            'Categories',
            'ប្រភេទ'
          )}

          <span
            className={`
              min-w-[22px]
              h-6
              px-1
              rounded-md
              text-xs
              flex
              items-center
              justify-center
              ${
                activeTab === 'categories'
                  ? 'bg-white/20'
                  : 'bg-white'
              }
            `}
          >
            {categories.length}
          </span>
        </button>
      </div>

      {/* Main Table Card */}
      <AdminCard className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#F0F4FB]">
        {activeTab === 'courses' ? (
          <AdminTable
            columns={courseColumns}
            data={courses}
            loading={loading}
          />
        ) : (
          <AdminTable
            columns={categoryColumns}
            data={categories}
            loading={loading}
          />
        )}
      </AdminCard>

      <AdminModal
        isOpen={courseModalOpen}
        onClose={closeCourseModal}
        title={
          editingCourse
            ? tr(
                'courses.editCourse',
                'Edit Course',
                'កែប្រែវគ្គសិក្សា'
              )
            : tr(
                'courses.createCourse',
                'Create Course',
                'បង្កើតវគ្គសិក្សា'
              )
        }
      >
        <form onSubmit={handleCourseSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                    {isKhmer
                      ? 'ចំណងជើងវគ្គសិក្សា'
                      : 'Course Title'}

                    <span className="text-[#C23636] ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name={`title_${langSuffix}`}
                    value={
                      courseFormData[
                        `title_${langSuffix}`
                      ]
                    }
                    onChange={
                      handleCourseInputChange
                    }
                    className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition ${
                      isKhmer
                        ? 'font-khmer'
                        : 'font-english'
                    }`}
                    placeholder={
                      isKhmer
                        ? 'ការអភិវឌ្ឍគេហទំព័រ'
                        : 'Web Development'
                    }
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-[#0D1B3E]">
                      {isKhmer ? 'អំពីវគ្គសិក្សា' : 'About Course'}
                    </label>
                    <span className="text-[11px] text-[#6B8AFF]">
                      {isKhmer ? '(ចុះបន្ទាត់មួយចំណុចៗ)' : '(Enter each point on a new line)'}
                    </span>
                  </div>

                  <textarea
                    name={`description_${langSuffix}`}
                    value={
                      courseFormData[
                        `description_${langSuffix}`
                      ]
                    }
                    onChange={
                      handleCourseInputChange
                    }
                    rows={4}
                    className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition resize-none ${
                      isKhmer
                        ? 'font-khmer'
                        : 'font-english'
                    }`}
                    placeholder={
                      isKhmer
                        ? "ឧ. រៀនពីមូលដ្ឋានគ្រឹះដល់កម្រិតខ្ពស់\nអនុវត្តគម្រោងជាក់ស្តែង\nទទួលបានវិញ្ញាបនបត្របញ្ជាក់ការសិក្សា"
                        : "e.g. Learn fundamentals to advanced concepts\nHands-on real project practice\nReceive certificate of completion"
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                      {isKhmer
                        ? 'រយៈពេល'
                        : 'Duration'}
                    </label>

                    <select
                      name={`duration_${langSuffix}`}
                      value={
                        courseFormData[
                          `duration_${langSuffix}`
                        ]
                      }
                      onChange={
                        handleCourseInputChange
                      }
                      className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition bg-white ${
                        isKhmer
                          ? 'font-khmer'
                          : 'font-english'
                      }`}
                    >
                      <option value="">
                        {isKhmer ? 'ជ្រើសរើសរយៈពេល' : 'Select Duration'}
                      </option>
                      <option value={isKhmer ? '១ ខែ' : '1 Month'}>
                        {isKhmer ? '១ ខែ (1 Month)' : '1 Month'}
                      </option>
                      <option value={isKhmer ? '១ ខែកន្លះ' : '1.5 Months'}>
                        {isKhmer ? '១ ខែកន្លះ (1.5 Months)' : '1.5 Months'}
                      </option>
                      <option value={isKhmer ? '២ ខែ' : '2 Months'}>
                        {isKhmer ? '២ ខែ (2 Months)' : '2 Months'}
                      </option>
                      <option value={isKhmer ? '២ ខែកន្លះ' : '2.5 Months'}>
                        {isKhmer ? '២ ខែកន្លះ (2.5 Months)' : '2.5 Months'}
                      </option>
                      <option value={isKhmer ? '៣ ខែ' : '3 Months'}>
                        {isKhmer ? '៣ ខែ (3 Months)' : '3 Months'}
                      </option>
                      <option value={isKhmer ? '៤ ខែ' : '4 Months'}>
                        {isKhmer ? '៤ ខែ (4 Months)' : '4 Months'}
                      </option>
                      <option value={isKhmer ? '៦ ខែ' : '6 Months'}>
                        {isKhmer ? '៦ ខែ (6 Months)' : '6 Months'}
                      </option>
                      <option value={isKhmer ? 'បត់បែន' : 'Flexible'}>
                        {isKhmer ? 'បត់បែន (Flexible)' : 'Flexible'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                      {isKhmer
                        ? 'កម្រិត'
                        : 'Level'}
                    </label>

                    <select
                      name={`level_${langSuffix}`}
                      value={
                        courseFormData[
                          `level_${langSuffix}`
                        ]
                      }
                      onChange={
                        handleCourseInputChange
                      }
                      className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition bg-white ${
                        isKhmer
                          ? 'font-khmer'
                          : 'font-english'
                      }`}
                    >
                      <option value="">
                        {isKhmer ? 'ជ្រើសរើសកម្រិត' : 'Select Level'}
                      </option>
                      <option value={isKhmer ? 'គ្រប់កម្រិត' : 'All Levels'}>
                        {isKhmer ? 'គ្រប់កម្រិត (All Levels)' : 'All Levels'}
                      </option>
                      <option value={isKhmer ? 'កម្រិតដំបូង' : 'Beginner'}>
                        {isKhmer ? 'កម្រិតដំបូង (Beginner)' : 'Beginner'}
                      </option>
                      <option value={isKhmer ? 'កម្រិតមធ្យម' : 'Intermediate'}>
                        {isKhmer ? 'កម្រិតមធ្យម (Intermediate)' : 'Intermediate'}
                      </option>
                      <option value={isKhmer ? 'កម្រិតខ្ពស់' : 'Advanced'}>
                        {isKhmer ? 'កម្រិតខ្ពស់ (Advanced)' : 'Advanced'}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-[#0D1B3E]">
                      {isKhmer ? 'អ្វីដែលអ្នកនឹងរៀន' : 'What You Will Learn'}
                    </label>
                    <span className="text-[11px] text-[#6B8AFF]">
                      {isKhmer ? '(ចុះបន្ទាត់មួយចំណុចៗ)' : '(Enter each point on a new line)'}
                    </span>
                  </div>
                  <textarea
                    name={`what_you_learn_${langSuffix}`}
                    value={courseFormData[`what_you_learn_${langSuffix}`]}
                    onChange={handleCourseInputChange}
                    rows={4}
                    className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition ${
                      isKhmer ? 'font-khmer' : 'font-english'
                    }`}
                    placeholder={
                      isKhmer
                        ? "ឧ. ប្រើប្រាស់រូបមន្តស្មុគស្មាញដើម្បីដោះស្រាយបញ្ហា\nគ្រប់គ្រង និងវិភាគទិន្នន័យធំៗ\nបង្កើត Dashboards និងរបាយការណ៍អាជីព"
                        : "e.g. Use complex formulas to solve business problems\nAnalyze and manage large datasets\nBuild professional reports and dashboards"
                    }
                  />
                </div>

            <div className="border border-[#E8EEF9] rounded-xl p-4 bg-white space-y-4">
              <h3 className="text-sm font-bold text-[#0D1B3E]">
                {tr(
                  'courses.generalInformation',
                  'Category',
                  'ប្រភេទវគ្គសិក្សា'
                )}
              </h3>

              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {tr(
                    'courses.category',
                    'Category',
                    'ជ្រើសរើសប្រភេទ'
                  )}

                  <span className="text-[#C23636] ml-1">
                    *
                  </span>
                </label>

                <select
                  name="category_id"
                  value={
                    courseFormData.category_id
                  }
                  onChange={
                    handleCourseInputChange
                  }
                  className="w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition"
                  required
                >
                  <option value="">
                    {tr(
                      'courses.selectCategory',
                      'Select Category',
                      'ជ្រើសរើសប្រភេទ'
                    )}
                  </option>

                  {categories.length === 0 ? (
                    <option value="" disabled>
                      {tr(
                        'courses.noCategoriesAvailable',
                        'No categories available',
                        'No categories available'
                      )}
                    </option>
                  ) : (
                    categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {getCategoryOptionLabel(
                          category
                        )}
                      </option>
                    ))
                  )}
                </select>

                {categories.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      closeCourseModal();
                      resetCategoryForm();
                      setActiveTab('categories');
                      setCategoryModalOpen(true);
                    }}
                    className="mt-2 text-xs font-semibold text-[#6B8AFF] hover:text-[#0D1B3E] transition"
                  >
                    {tr(
                      'courses.createCategoryFirst',
                      'Create a category first',
                      'Create a category first'
                    )}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {tr(
                  'courses.courseImage',
                  'Course Image',
                  'រូបភាពវគ្គសិក្សា'
                )}
              </label>

              {!courseImagePreview ? (
                <div
                  onClick={() =>
                    courseFileRef.current?.click()
                  }
                  className="min-h-[150px] border-2 border-dashed border-[#E8EEF9] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-[#F0F7FF] hover:border-[#0D1B3E] transition"
                >
                  <input
                    ref={courseFileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={
                      handleCourseImageChange
                    }
                    className="hidden"
                  />

                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#0D1B3E] border border-[#E8EEF9] mb-3">
                    <FiUploadCloud size={23} />
                  </div>

                  <p className="text-sm font-semibold text-[#0D1B3E]">
                    {tr(
                      'courses.uploadImage',
                      'Upload Course Image',
                      'បញ្ចូលរូបភាពវគ្គសិក្សា'
                    )}
                  </p>

                  <p className="text-xs text-[#6B8AFF] mt-1">
                    JPG, JPEG, PNG, WEBP — 5 MB
                  </p>
                </div>
              ) : (
                <div className="relative h-[220px] rounded-xl overflow-hidden border border-[#E8EEF9] bg-[#F0F7FF] group">
                  <img
                    src={courseImagePreview}
                    alt="Course Preview"
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeCourseImage}
                    className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-[#C23636] text-white flex items-center justify-center hover:bg-[#A92E2E] shadow"
                  >
                    <FiX size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      courseFileRef.current?.click()
                    }
                    className="absolute bottom-3 right-3 h-9 px-3 bg-white text-[#0D1B3E] rounded-lg text-xs font-semibold shadow"
                  >
                    {tr(
                      'courses.changeImage',
                      'Change Image',
                      'ប្ដូររូបភាព'
                    )}
                  </button>

                  <input
                    ref={courseFileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={
                      handleCourseImageChange
                    }
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between gap-3 p-4 border border-[#E8EEF9] rounded-xl bg-white cursor-pointer hover:bg-[#F0F7FF] transition">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-9
                      h-9
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      ${
                        courseFormData.is_active
                          ? 'bg-[#EBF9F0] text-[#2E7D32]'
                          : 'bg-[#F0F7FF] text-[#6B8AFF]'
                      }
                    `}
                  >
                    {courseFormData.is_active ? (
                      <FiCheckCircle />
                    ) : (
                      <FiXCircle />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#0D1B3E]">
                      {tr(
                        'courses.activeCourse',
                        'Active Course',
                        'វគ្គសិក្សាសកម្ម'
                      )}
                    </p>

                    <p className="text-xs text-[#6B8AFF]">
                      {tr(
                        'courses.activeCourseHelp',
                        'Show this course on the website',
                        'បង្ហាញវគ្គសិក្សានេះនៅលើគេហទំព័រ'
                      )}
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  name="is_active"
                  checked={
                    courseFormData.is_active
                  }
                  onChange={
                    handleCourseInputChange
                  }
                  className="w-4 h-4 accent-[#0D1B3E]"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8EEF9] flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={closeCourseModal}
              disabled={courseSubmitting}
              className="h-10 px-4 bg-white border border-[#E8EEF9] text-[#6B8AFF] rounded-lg text-sm font-semibold hover:bg-[#F0F7FF] disabled:opacity-50 transition"
            >
              {tr(
                'common.cancel',
                'Cancel',
                'បោះបង់'
              )}
            </button>

            <button
              type="submit"
              disabled={courseSubmitting}
              className="min-w-[140px] h-10 px-5 bg-[#C23636] text-white rounded-lg text-sm font-semibold hover:bg-[#A92E2E] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {courseSubmitting
                ? editingCourse
                  ? tr(
                      'courses.updating',
                      'Updating...',
                      'កំពុងកែប្រែ...'
                    )
                  : tr(
                      'courses.creating',
                      'Creating...',
                      'កំពុងបង្កើត...'
                    )
                : editingCourse
                ? tr(
                    'courses.updateCourse',
                    'Update Course',
                    'រក្សាទុកការកែប្រែ'
                  )
                : tr(
                    'courses.createCourse',
                    'Create Course',
                    'បង្កើតវគ្គសិក្សា'
                  )}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={categoryModalOpen}
        onClose={closeCategoryModal}
        title={
          editingCategory
            ? tr(
                'courses.editCategory',
                'Edit Category',
                'កែប្រែប្រភេទ'
              )
            : tr(
                'courses.createCategory',
                'Create Category',
                'បង្កើតប្រភេទ'
              )
        }
      >
        <form onSubmit={handleCategorySubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer
                  ? 'ឈ្មោះប្រភេទ'
                  : 'Category Name'}

                <span className="text-[#C23636] ml-1">
                  *
                </span>
              </label>

              <input
                type="text"
                name={`name_${langSuffix}`}
                value={
                  categoryFormData[
                    `name_${langSuffix}`
                  ]
                }
                onChange={
                  handleCategoryInputChange
                }
                className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition ${
                  isKhmer
                    ? 'font-khmer'
                    : 'font-english'
                }`}
                placeholder={
                  isKhmer
                    ? 'វគ្គសិក្សាព័ត៌មានវិទ្យា'
                    : 'IT Courses'
                }
                required
              />
            </div>

            <label className="flex items-center justify-between gap-3 p-4 border border-[#E8EEF9] rounded-xl bg-white cursor-pointer hover:bg-[#F0F7FF] transition">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-9
                    h-9
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    ${
                      categoryFormData.is_active
                        ? 'bg-[#EBF9F0] text-[#2E7D32]'
                        : 'bg-[#F0F7FF] text-[#6B8AFF]'
                    }
                  `}
                >
                  {categoryFormData.is_active ? (
                    <FiCheckCircle />
                  ) : (
                    <FiXCircle />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#0D1B3E]">
                    {tr(
                      'courses.activeCategory',
                      'Active Category',
                      'ប្រភេទសកម្ម'
                    )}
                  </p>

                  <p className="text-xs text-[#6B8AFF]">
                    {tr(
                      'courses.activeCategoryHelp',
                      'Show this category on the website',
                      'បង្ហាញប្រភេទនេះនៅលើគេហទំព័រ'
                    )}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                name="is_active"
                checked={
                  categoryFormData.is_active
                }
                onChange={
                  handleCategoryInputChange
                }
                className="w-4 h-4 accent-[#0D1B3E]"
              />
            </label>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8EEF9] flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={closeCategoryModal}
              disabled={categorySubmitting}
              className="h-10 px-4 bg-white border border-[#E8EEF9] text-[#6B8AFF] rounded-lg text-sm font-semibold hover:bg-[#F0F7FF] disabled:opacity-50 transition"
            >
              {tr(
                'common.cancel',
                'Cancel',
                'បោះបង់'
              )}
            </button>

            <button
              type="submit"
              disabled={categorySubmitting}
              className="min-w-[150px] h-10 px-5 bg-[#C23636] text-white rounded-lg text-sm font-semibold hover:bg-[#A92E2E] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {categorySubmitting
                ? editingCategory
                  ? tr(
                      'courses.updating',
                      'Updating...',
                      'កំពុងកែប្រែ...'
                    )
                  : tr(
                      'courses.creating',
                      'Creating...',
                      'កំពុងបង្កើត...'
                    )
                : editingCategory
                ? tr(
                    'courses.updateCategory',
                    'Update Category',
                    'រក្សាទុកការកែប្រែ'
                  )
                : tr(
                    'courses.createCategory',
                    'Create Category',
                    'បង្កើតប្រភេទ'
                  )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminCourses;
