import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { toast } from 'react-toastify';

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiImage,
  FiMessageSquare,
  FiUser,
  FiCheckCircle,
} from 'react-icons/fi';

import api from '../../services/api';
import { getImageUrl } from '../../utils/helpers';

import AdminTable from '../common/AdminTable';
import AdminModal from '../common/AdminModal';
import AdminCard from '../common/AdminCard';

import {
  useLanguage,
} from '../../contexts/LanguageContext';


const DEFAULT_AVATAR =
  '/default-avatar.png';


const initialForm = {

  name: '',

  role_en: '',
  role_km: '',

  content_en: '',
  content_km: '',

  rating: 5,

  is_active: true,

  order: 0,

};


const AdminTestimonials = () => {

  // =====================================================
  // LANGUAGE
  // =====================================================

  const {
    t,
    language,
  } = useLanguage();


  const isKhmer =
    language === 'km' ||
    language === 'kh';


  // =====================================================
  // TRANSLATION FALLBACK
  // =====================================================

  const tr = (
    key,
    english,
    khmer
  ) => {

    const value =
      t(key);


    if (
      value &&
      value !== key
    ) {
      return value;
    }


    return isKhmer
      ? khmer
      : english;

  };


  // =====================================================
  // CURRENT LANGUAGE FIELDS
  // =====================================================

  const nameField = 'name';


  const roleField =
    isKhmer
      ? 'role_km'
      : 'role_en';


  const contentField =
    isKhmer
      ? 'content_km'
      : 'content_en';


  // =====================================================
  // STATE
  // =====================================================

  const [
    testimonials,
    setTestimonials,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);


  const [
    editingTestimonial,
    setEditingTestimonial,
  ] = useState(null);


  const [
    formData,
    setFormData,
  ] = useState({
    ...initialForm,
  });


  const [
    avatarFile,
    setAvatarFile,
  ] = useState(null);


  const [
    avatarPreview,
    setAvatarPreview,
  ] = useState(null);


  const fileInputRef =
    useRef(null);


  // =====================================================
  // FETCH
  // =====================================================

  const fetchTestimonials =
    async () => {

      try {
        setLoading(true);
        const minDelay = new Promise((resolve) => setTimeout(resolve, 500));

        const [response] = await Promise.all([
          api.get('/api/testimonials/'),
          minDelay,
        ]);

        const data =
          response.data;

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            'TESTIMONIALS RESPONSE:',
            data
          );
        }


        if (
          Array.isArray(data)
        ) {

          setTestimonials(
            data
          );

        } else if (
          Array.isArray(
            data?.items
          )
        ) {

          setTestimonials(
            data.items
          );

        } else {

          setTestimonials([]);

        }

      } catch (error) {

        console.error(
          'Fetch testimonials error:',
          error
        );


        toast.error(
          error.response?.data?.detail ||
          tr(
            'testimonials.loadFailed',
            'Failed to load testimonials.',
            'មិនអាចផ្ទុកមតិអតិថិជនបានទេ។'
          ),
          { toastId: 'testimonials-load-error' }
        );

      } finally {

        setLoading(false);

      }

    };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchTestimonials();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // =====================================================
  // CLEAN BLOB
  // =====================================================

  useEffect(() => {

    return () => {

      if (
        avatarPreview &&
        avatarPreview.startsWith(
          'blob:'
        )
      ) {

        URL.revokeObjectURL(
          avatarPreview
        );

      }

    };

  }, [avatarPreview]);


  // =====================================================
  // LOCALIZED NAME
  // =====================================================

  const getTestimonialName =
    (testimonial) => {

      if (!testimonial) {
        return '';
      }


      if (isKhmer) {

        return (
          testimonial.name_km ||
          testimonial.name_en ||
          testimonial.name ||
          ''
        );

      }


      return (
        testimonial.name_en ||
        testimonial.name_km ||
        testimonial.name ||
        ''
      );

    };


  // =====================================================
  // LOCALIZED ROLE
  // =====================================================

  const getTestimonialRole =
    (testimonial) => {

      if (!testimonial) {
        return '';
      }


      if (isKhmer) {

        return (
          testimonial.role_km ||
          testimonial.role_en ||
          testimonial.role ||
          ''
        );

      }


      return (
        testimonial.role_en ||
        testimonial.role_km ||
        testimonial.role ||
        ''
      );

    };


  // =====================================================
  // LOCALIZED CONTENT
  // =====================================================

  const getTestimonialContent =
    (testimonial) => {

      if (!testimonial) {
        return '';
      }


      if (isKhmer) {

        return (
          testimonial.content_km ||
          testimonial.content_en ||
          testimonial.content ||
          ''
        );

      }


      return (
        testimonial.content_en ||
        testimonial.content_km ||
        testimonial.content ||
        ''
      );

    };


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setEditingTestimonial(
      null
    );


    setFormData({
      ...initialForm,
    });


    setAvatarFile(null);


    if (
      avatarPreview &&
      avatarPreview.startsWith(
        'blob:'
      )
    ) {

      URL.revokeObjectURL(
        avatarPreview
      );

    }


    setAvatarPreview(null);


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        '';

    }

  };


  // =====================================================
  // CREATE MODAL
  // =====================================================

  const openCreateModal = () => {

    resetForm();

    setModalOpen(true);

  };


  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {

    if (saving) {
      return;
    }


    setModalOpen(false);

    resetForm();

  };


  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit =
    (testimonial) => {

      setEditingTestimonial(
        testimonial
      );


      setFormData({

        name: testimonial.name || '',


        role_en:
          testimonial.role_en ||
          testimonial.role ||
          '',

        role_km:
          testimonial.role_km ||
          '',


        content_en:
          testimonial.content_en ||
          testimonial.content ||
          '',

        content_km:
          testimonial.content_km ||
          '',


        rating:
          Number(
            testimonial.rating
          ) || 5,


        is_active:
          testimonial.is_active ??
          true,


        order:
          Number(
            testimonial.sort_order
          ) || 0,

      });


      setAvatarFile(null);


      if (
        avatarPreview &&
        avatarPreview.startsWith(
          'blob:'
        )
      ) {

        URL.revokeObjectURL(
          avatarPreview
        );

      }


      setAvatarPreview(
        testimonial.avatar_url
          ? getImageUrl(
              testimonial.avatar_url,
              DEFAULT_AVATAR
            )
          : null
      );


      if (
        fileInputRef.current
      ) {

        fileInputRef.current.value =
          '';

      }


      setModalOpen(true);

    };


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange =
    (e) => {

      const {
        name,
        value,
        type,
        checked,
      } = e.target;


      setFormData(
        (previous) => ({

          ...previous,

          [name]:
            type === 'checkbox'
              ? checked
              : value,

        })
      );

    };


  // =====================================================
  // AVATAR CHANGE
  // =====================================================

  const handleAvatarChange =
    (e) => {

      const file =
        e.target.files?.[0];


      if (!file) {
        return;
      }


      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        toast.error(
          tr(
            'testimonials.invalidImage',
            'Please select a JPG, JPEG, PNG or WEBP image.',
            'សូមជ្រើសរើសរូបភាព JPG, JPEG, PNG ឬ WEBP។'
          )
        );


        e.target.value = '';

        return;

      }


      const maxSize =
        5 * 1024 * 1024;


      if (
        file.size > maxSize
      ) {

        toast.error(
          tr(
            'testimonials.imageTooLarge',
            'Image must be 5 MB or smaller.',
            'រូបភាពត្រូវមានទំហំ 5 MB ឬតូចជាងនេះ។'
          )
        );


        e.target.value = '';

        return;

      }


      if (
        avatarPreview &&
        avatarPreview.startsWith(
          'blob:'
        )
      ) {

        URL.revokeObjectURL(
          avatarPreview
        );

      }


      setAvatarFile(
        file
      );


      setAvatarPreview(
        URL.createObjectURL(
          file
        )
      );

    };


  // =====================================================
  // VALIDATE
  // =====================================================

  const validateForm = () => {

    const currentName =
      String(
        formData[
          nameField
        ] || ''
      ).trim();


    const currentContent =
      String(
        formData[
          contentField
        ] || ''
      ).trim();


    if (!currentName) {

      toast.error(
        tr(
          'testimonials.nameRequired',
          'Name is required.',
          'សូមបញ្ចូលឈ្មោះ។'
        )
      );

      return false;

    }


    if (!currentContent) {

      toast.error(
        tr(
          'testimonials.contentRequired',
          'Testimonial content is required.',
          'សូមបញ្ចូលមតិយោបល់។'
        )
      );

      return false;

    }


    return true;

  };


  // =====================================================
  // BUILD FORM DATA
  // =====================================================

  const buildFormData = () => {

    const data =
      new FormData();


    const currentName =
      String(
        formData[
          nameField
        ] || ''
      ).trim();


    const currentRole =
      String(
        formData[
          roleField
        ] || ''
      ).trim();


    const currentContent =
      String(
        formData[
          contentField
        ] || ''
      ).trim();


    // =================================================
    // CREATE
    // =================================================

    if (
      !editingTestimonial
    ) {

      const roleEn =
        String(
          formData.role_en ||
          currentRole
        ).trim();


      const roleKm =
        String(
          formData.role_km ||
          currentRole
        ).trim();


      const contentEn =
        String(
          formData.content_en ||
          currentContent
        ).trim();


      const contentKm =
        String(
          formData.content_km ||
          currentContent
        ).trim();


      data.append(
        'name',
        currentName
      );


      data.append(
        'role_en',
        roleEn
      );


      data.append(
        'role_km',
        roleKm
      );


      data.append(
        'content_en',
        contentEn
      );


      data.append(
        'content_km',
        contentKm
      );

    }


    // =================================================
    // UPDATE
    // ONLY CURRENT LANGUAGE
    // =================================================

    if (
      editingTestimonial
    ) {

      data.append(
        nameField,
        currentName
      );


      data.append(
        'name',
        currentName
      );


      data.append(
        roleField,
        currentRole
      );


      data.append(
        contentField,
        currentContent
      );

    }


    // =================================================
    // COMMON FIELDS
    // =================================================

    data.append(
      'rating',
      String(
        Number(
          formData.rating
        ) || 5
      )
    );


    data.append(
      'is_active',
      String(
        formData.is_active
      )
    );


    data.append(
      'order',
      String(
        Number(
          formData.order
        ) || 0
      )
    );


    if (avatarFile) {

      data.append(
        'avatar',
        avatarFile
      );

    }


    return data;

  };


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      if (!validateForm()) {
        return;
      }


      try {

        setSaving(true);


        const data =
          buildFormData();


        // ===============================================
        // UPDATE
        // ===============================================

        if (
          editingTestimonial
        ) {

          await api.put(
            `/api/testimonials/${editingTestimonial.id}`,
            data
          );


          toast.success(
            tr(
              'testimonials.updatedSuccess',
              'Testimonial updated successfully.',
              'បានកែប្រែមតិយោបល់ដោយជោគជ័យ។'
            )
          );

        }


        // ===============================================
        // CREATE
        // ===============================================

        else {

          await api.post(
            '/api/testimonials/',
            data
          );


          toast.success(
            tr(
              'testimonials.createdSuccess',
              'Testimonial created successfully.',
              'បានបង្កើតមតិយោបល់ដោយជោគជ័យ។'
            )
          );

        }


        setModalOpen(false);

        resetForm();

        await fetchTestimonials();

      } catch (error) {

        console.error(
          'Testimonial submit error:',
          error
        );


        const detail =
          error.response?.data
            ?.detail ||
          error.response?.data
            ?.message;


        if (
          Array.isArray(detail)
        ) {

          toast.error(
            detail
              .map(
                (item) =>
                  item?.msg ||
                  tr(
                    'testimonials.operationFailed',
                    'Operation failed.',
                    'ប្រតិបត្តិការមិនបានជោគជ័យ។'
                  )
              )
              .join(', ')
          );

        } else {

          toast.error(
            detail ||
            tr(
              'testimonials.operationFailed',
              'Failed to save testimonial.',
              'មិនអាចរក្សាទុកមតិយោបល់បានទេ។'
            )
          );

        }

      } finally {

        setSaving(false);

      }

    };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          tr(
            'testimonials.deleteConfirm',
            'Are you sure you want to delete this testimonial?',
            'តើអ្នកប្រាកដថាចង់លុបមតិយោបល់នេះមែនទេ?'
          )
        );


      if (!confirmDelete) {
        return;
      }


      try {

        await api.delete(
          `/api/testimonials/${id}`
        );


        toast.success(
          tr(
            'testimonials.deletedSuccess',
            'Testimonial deleted successfully.',
            'បានលុបមតិយោបល់ដោយជោគជ័យ។'
          )
        );


        await fetchTestimonials();

      } catch (error) {

        console.error(
          'Delete testimonial error:',
          error
        );


        toast.error(
          error.response?.data
            ?.detail ||
          tr(
            'testimonials.deleteFailed',
            'Failed to delete testimonial.',
            'មិនអាចលុបមតិយោបល់បានទេ។'
          )
        );

      }

    };


  // =====================================================
  // STARS
  // =====================================================

  const renderStars =
    (rating) => {

      const safeRating =
        Math.max(
          0,
          Math.min(
            5,
            Number(rating) || 0
          )
        );


      return (

        <div
          className="
            flex
            items-center
            gap-0.5
          "
        >

          {
            [...Array(5)].map(
              (_, index) => (

                <FiStar
                  key={index}

                  size={15}

                  className={
                    index <
                    safeRating
                      ? `
                        text-[#FFB300]
                        fill-current
                      `
                      : 'text-[#E8EEF9]'
                  }
                />

              )
            )
          }

        </div>

      );

    };


  // =====================================================
  // LOCALIZED TABLE DATA
  // =====================================================

  const localizedTestimonials =
    testimonials.map(
      (testimonial) => ({

        ...testimonial,

        display_name:
          getTestimonialName(
            testimonial
          ),

        display_role:
          getTestimonialRole(
            testimonial
          ),

        display_content:
          getTestimonialContent(
            testimonial
          ),

      })
    );


  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = [

    {
      key: 'avatar_url',

      label:
        tr(
          'testimonials.avatar',
          'Avatar',
          'រូបភាព'
        ),

      render: (value) => (

        <div
          className="
            w-14
            h-14

            rounded-xl

            overflow-hidden

            border
            border-[#E8EEF9]

            bg-[#F0F7FF]

            shadow-sm
          "
        >

          <img
            src={
              getImageUrl(
                value,
                DEFAULT_AVATAR
              )
            }

            alt={
              tr(
                'testimonials.avatar',
                'Avatar',
                'រូបភាព'
              )
            }

            className="
              w-full
              h-full

              object-cover
            "

            onError={(e) => {

              console.error(
                'TESTIMONIAL IMAGE FAILED:',
                e.currentTarget.src
              );

              if (
                !e.currentTarget.dataset.fallbackApplied
              ) {
                e.currentTarget.dataset.fallbackApplied =
                  'true';
                e.currentTarget.src =
                  DEFAULT_AVATAR;
              }

            }}
          />

        </div>

      ),
    },


    {
      key: 'display_name',

      label:
        tr(
          'testimonials.name',
          'Name',
          'ឈ្មោះ'
        ),

      render: (value) => (

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              w-9
              h-9

              flex
              items-center
              justify-center

              rounded-lg

              bg-[#F0F7FF]
              text-[#0D1B3E]

              flex-shrink-0
            "
          >

            <FiUser
              size={17}
            />

          </div>


          <p
            className="
              font-semibold
              text-[#0D1B3E]
            "
          >
            {value || '-'}
          </p>

        </div>

      ),
    },


    {
      key: 'display_role',

      label:
        tr(
          'testimonials.role',
          'Role',
          'តួនាទី'
        ),

      render: (value) => (

        <span
          className="
            inline-flex

            px-3
            py-1

            rounded-full

            bg-[#F0F7FF]
            text-[#0D1B3E]

            text-xs
            font-medium
          "
        >
          {value || '-'}
        </span>

      ),
    },


    {
      key: 'display_content',

      label:
        tr(
          'testimonials.content',
          'Content',
          'មតិយោបល់'
        ),

      render: (value) => (

        <p
          className="
            max-w-xs

            text-sm
            text-[#6B8AFF]

            line-clamp-2

            leading-5
          "
        >
          {value || '-'}
        </p>

      ),
    },


    {
      key: 'rating',

      label:
        tr(
          'testimonials.rating',
          'Rating',
          'ការវាយតម្លៃ'
        ),

      render: (value) => (

        <div
          className="
            space-y-0.5
          "
        >

          {
            renderStars(
              value
            )
          }


          <span
            className="
              text-xs
              text-[#6B8AFF]
            "
          >
            {value || 0}/5
          </span>

        </div>

      ),
    },


    {
      key: 'is_active',

      label:
        tr(
          'common.status',
          'Status',
          'ស្ថានភាព'
        ),

      render: (value) => (

        <span
          className={`
            inline-flex
            items-center
            gap-2

            px-3
            py-1

            rounded-full

            text-xs
            font-semibold

            ${
              value
                ? `
                  bg-[#EBF9F0]
                  text-[#2E7D32]
                `
                : `
                  bg-[#FFEBEE]
                  text-[#C62828]
                `
            }
          `}
        >

          <span
            className={`
              w-1.5
              h-1.5

              rounded-full

              ${
                value
                  ? 'bg-[#2E7D32]'
                  : 'bg-[#C62828]'
              }
            `}
          />


          {
            value
              ? tr(
                  'common.active',
                  'Active',
                  'សកម្ម'
                )
              : tr(
                  'common.inactive',
                  'Inactive',
                  'អសកម្ម'
                )
          }

        </span>

      ),
    },


    {
      key: 'actions',

      label:
        tr(
          'common.actions',
          'Actions',
          'សកម្មភាព'
        ),

      render: (_, row) => (

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <button
            type="button"

            onClick={() =>
              handleEdit(row)
            }

            title={
              tr(
                'testimonials.editTestimonial',
                'Edit Testimonial',
                'កែប្រែមតិយោបល់'
              )
            }

            className="
              w-8
              h-8

              flex
              items-center
              justify-center

              rounded-lg

              bg-[#F0F7FF]
              text-[#0D1B3E]

              hover:bg-[#0D1B3E]
              hover:text-white

              transition-all
              duration-200
            "
          >

            <FiEdit2
              size={15}
            />

          </button>


          <button
            type="button"

            onClick={() =>
              handleDelete(
                row.id
              )
            }

            title={
              tr(
                'testimonials.deleteTestimonial',
                'Delete Testimonial',
                'លុបមតិយោបល់'
              )
            }

            className="
              w-8
              h-8

              flex
              items-center
              justify-center

              rounded-lg

              bg-[#FFEBEE]
              text-[#C62828]

              hover:bg-[#C62828]
              hover:text-white

              transition-all
              duration-200
            "
          >

            <FiTrash2
              size={15}
            />

          </button>

        </div>

      ),
    },

  ];


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className={`
        w-full
        min-h-screen
        p-6
        bg-[#F0F7FF]

        ${
          isKhmer
            ? 'font-khmer'
            : 'font-english'
        }
      `}
    >

      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex
          flex-col

          lg:flex-row
          lg:items-center
          lg:justify-between

          gap-4

          mb-8
        "
      >

        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <div
            className="
              w-12
              h-12

              flex
              items-center
              justify-center

              rounded-xl

              bg-[#0D1B3E]
              text-white

              shadow-md
            "
          >

            <FiMessageSquare
              size={22}
            />

          </div>


          <div>

            <h1
              className="
                text-2xl
                md:text-3xl

                font-bold

                text-[#0D1B3E]

                leading-tight
              "
            >
              {tr(
                'testimonials.title',
                'Testimonials',
                'មតិយោបល់'
              )}
            </h1>


            <p
              className="
                text-sm
                text-[#6B8AFF]

                mt-0.5
              "
            >
              {tr(
                'testimonials.subtitle',
                'Manage student testimonials',
                'គ្រប់គ្រងមតិយោបល់របស់សិស្ស'
              )}
            </p>

          </div>

        </div>


        <button
          type="button"

          onClick={
            openCreateModal
          }

          className="
            inline-flex
            items-center
            justify-center
            gap-2

            h-11

            px-5

            bg-[#C23636]
            hover:bg-[#A92E2E]

            text-white

            rounded-lg

            text-sm
            font-semibold

            shadow-sm

            transition-all
            duration-200
          "
        >

          <FiPlus
            size={18}
          />


          {tr(
            'testimonials.addTestimonial',
            'Add Testimonial',
            'បន្ថែមមតិយោបល់'
          )}

        </button>

      </div>


      {/* =================================================
          TABLE
      ================================================== */}

      <AdminCard
        className="
          overflow-hidden

          bg-white

          border
          border-[#F0F4FB]

          rounded-xl

          shadow-sm
        "
      >

        <AdminTable
          columns={
            columns
          }

          data={
            localizedTestimonials
          }

          loading={
            loading
          }
        />

      </AdminCard>


      {/* =================================================
          MODAL
      ================================================== */}

      <AdminModal
        isOpen={
          modalOpen
        }

        onClose={
          closeModal
        }

        title={
          editingTestimonial
            ? tr(
                'testimonials.editTestimonial',
                'Edit Testimonial',
                'កែប្រែមតិយោបល់'
              )
            : tr(
                'testimonials.createTestimonial',
                'Create Testimonial',
                'បង្កើតមតិយោបល់'
              )
        }
      >

        <div
          className={
            isKhmer
              ? 'font-khmer'
              : 'font-english'
          }
        >

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div
              className="
                space-y-5
              "
            >

              {/* =========================================
                  CURRENT LANGUAGE INFORMATION
              ========================================= */}

              <div
                className="
                  p-4

                  rounded-xl

                  bg-[#F0F7FF]

                  border
                  border-[#E8EEF9]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <FiMessageSquare
                    size={17}

                    className="
                      text-[#0D1B3E]
                    "
                  />


                  <h3
                    className="
                      text-sm
                      font-bold
                      text-[#0D1B3E]
                    "
                  >
                    {
                      isKhmer
                        ? 'ព័ត៌មានមតិយោបល់'
                        : 'Testimonial Information'
                    }
                  </h3>

                </div>


                <p
                  className="
                    text-xs
                    text-[#6B8AFF]
                    mt-1
                  "
                >
                  {
                    isKhmer
                      ? 'អ្នកកំពុងបញ្ចូលព័ត៌មានជាភាសាខ្មែរ។'
                      : 'You are editing the English content.'
                  }
                </p>

              </div>


              {/* =========================================
                  NAME + ROLE
              ========================================= */}

              <div
                className="
                  grid
                  grid-cols-1

                  md:grid-cols-2

                  gap-4
                "
              >

                {/* NAME */}

                <div>

                  <label
                    className="
                      block

                      text-sm
                      font-semibold

                      text-[#0D1B3E]

                      mb-1.5
                    "
                  >

                    {tr(
                      'testimonials.name',
                      'Name',
                      'ឈ្មោះ'
                    )}

                    <span
                      className="
                        text-[#C23636]
                        ml-1
                      "
                    >
                      *
                    </span>

                  </label>


                  <input
                    type="text"

                    name={
                      nameField
                    }

                    value={
                      formData[
                        nameField
                      ]
                    }

                    onChange={
                      handleChange
                    }

                    placeholder={
                      isKhmer
                        ? 'បញ្ចូលឈ្មោះ'
                        : 'Enter name'
                    }

                    required

                    className="
                      w-full

                      px-4
                      py-2.5

                      border
                      border-[#E8EEF9]

                      rounded-lg

                      bg-[#F0F7FF]

                      text-[#0D1B3E]

                      placeholder:text-[#6B8AFF]

                      focus:outline-none
                      focus:border-[#0D1B3E]
                      focus:ring-1
                      focus:ring-[#0D1B3E]

                      transition-all
                      duration-200
                    "
                  />

                </div>


                {/* ROLE */}

                <div>

                  <label
                    className="
                      block

                      text-sm
                      font-semibold

                      text-[#0D1B3E]

                      mb-1.5
                    "
                  >
                    {tr(
                      'testimonials.role',
                      'Role',
                      'តួនាទី'
                    )}
                  </label>


                  <input
                    type="text"

                    name={
                      roleField
                    }

                    value={
                      formData[
                        roleField
                      ]
                    }

                    onChange={
                      handleChange
                    }

                    placeholder={
                      isKhmer
                        ? 'ឧ. សិស្ស'
                        : 'e.g. Student'
                    }

                    className="
                      w-full

                      px-4
                      py-2.5

                      border
                      border-[#E8EEF9]

                      rounded-lg

                      bg-[#F0F7FF]

                      text-[#0D1B3E]

                      placeholder:text-[#6B8AFF]

                      focus:outline-none
                      focus:border-[#0D1B3E]
                      focus:ring-1
                      focus:ring-[#0D1B3E]

                      transition-all
                      duration-200
                    "
                  />

                </div>

              </div>


              {/* =========================================
                  CONTENT
              ========================================= */}

              <div>

                <label
                  className="
                    block

                    text-sm
                    font-semibold

                    text-[#0D1B3E]

                    mb-1.5
                  "
                >

                  {tr(
                    'testimonials.content',
                    'Content',
                    'មតិយោបល់'
                  )}

                  <span
                    className="
                      text-[#C23636]
                      ml-1
                    "
                  >
                    *
                  </span>

                </label>


                <textarea
                  name={
                    contentField
                  }

                  value={
                    formData[
                      contentField
                    ]
                  }

                  onChange={
                    handleChange
                  }

                  rows={5}

                  required

                  placeholder={
                    isKhmer
                      ? 'បញ្ចូលមតិយោបល់...'
                      : 'Enter testimonial content...'
                  }

                  className="
                    w-full

                    px-4
                    py-3

                    border
                    border-[#E8EEF9]

                    rounded-lg

                    bg-[#F0F7FF]

                    text-[#0D1B3E]

                    placeholder:text-[#6B8AFF]

                    resize-y

                    focus:outline-none
                    focus:border-[#0D1B3E]
                    focus:ring-1
                    focus:ring-[#0D1B3E]

                    transition-all
                    duration-200
                  "
                />

              </div>


              {/* =========================================
                  RATING + ORDER
              ========================================= */}

              <div
                className="
                  grid
                  grid-cols-1

                  md:grid-cols-2

                  gap-4
                "
              >

                {/* RATING */}

                <div>

                  <label
                    className="
                      block

                      text-sm
                      font-semibold

                      text-[#0D1B3E]

                      mb-1.5
                    "
                  >
                    {tr(
                      'testimonials.rating',
                      'Rating',
                      'ការវាយតម្លៃ'
                    )}
                  </label>


                  <select
                    name="rating"

                    value={
                      formData.rating
                    }

                    onChange={
                      handleChange
                    }

                    className="
                      w-full

                      px-4
                      py-2.5

                      border
                      border-[#E8EEF9]

                      rounded-lg

                      bg-white

                      text-[#0D1B3E]

                      focus:outline-none
                      focus:border-[#0D1B3E]
                      focus:ring-1
                      focus:ring-[#0D1B3E]

                      transition-all
                      duration-200
                    "
                  >

                    <option value={5}>
                      5
                    </option>

                    <option value={4}>
                      4
                    </option>

                    <option value={3}>
                      3
                    </option>

                    <option value={2}>
                      2
                    </option>

                    <option value={1}>
                      1
                    </option>

                  </select>

                </div>


                {/* ORDER */}

                <div>

                  <label
                    className="
                      block

                      text-sm
                      font-semibold

                      text-[#0D1B3E]

                      mb-1.5
                    "
                  >
                    {tr(
                      'testimonials.order',
                      'Order',
                      'លំដាប់'
                    )}
                  </label>


                  <input
                    type="number"

                    name="order"

                    min="0"

                    value={
                      formData.order
                    }

                    onChange={
                      handleChange
                    }

                    className="
                      w-full

                      px-4
                      py-2.5

                      border
                      border-[#E8EEF9]

                      rounded-lg

                      bg-[#F0F7FF]

                      text-[#0D1B3E]

                      focus:outline-none
                      focus:border-[#0D1B3E]
                      focus:ring-1
                      focus:ring-[#0D1B3E]

                      transition-all
                      duration-200
                    "
                  />

                </div>

              </div>


              {/* =========================================
                  AVATAR
              ========================================= */}

              <div>

                <label
                  className="
                    block

                    text-sm
                    font-semibold

                    text-[#0D1B3E]

                    mb-2
                  "
                >
                  {tr(
                    'testimonials.avatar',
                    'Avatar',
                    'រូបភាព'
                  )}
                </label>


                <div
                  className="
                    flex
                    flex-col

                    sm:flex-row
                    sm:items-center

                    gap-4
                  "
                >

                  <div
                    className="
                      w-24
                      h-24

                      rounded-2xl

                      overflow-hidden

                      bg-[#F0F7FF]

                      border
                      border-[#E8EEF9]

                      flex
                      items-center
                      justify-center

                      flex-shrink-0
                    "
                  >

                    {
                      avatarPreview ? (

                        <img
                          src={
                            avatarPreview
                          }

                          alt={
                            tr(
                              'testimonials.avatar',
                              'Avatar',
                              'រូបភាព'
                            )
                          }

                          className="
                            w-full
                            h-full

                            object-cover
                          "

                          onError={(e) => {

                            console.error(
                              'TESTIMONIAL IMAGE FAILED:',
                              e.currentTarget.src
                            );

                            if (
                              !e.currentTarget.dataset.fallbackApplied
                            ) {
                              e.currentTarget.dataset.fallbackApplied =
                                'true';
                              e.currentTarget.src =
                                DEFAULT_AVATAR;
                            }

                          }}
                        />

                      ) : (

                        <FiImage
                          size={30}

                          className="
                            text-[#6B8AFF]
                          "
                        />

                      )
                    }

                  </div>


                  <div
                    className="
                      flex-1
                    "
                  >

                    <input
                      ref={
                        fileInputRef
                      }

                      type="file"

                      accept="
                        image/jpeg,
                        image/jpg,
                        image/png,
                        image/webp
                      "

                      onChange={
                        handleAvatarChange
                      }

                      className="
                        block
                        w-full

                        text-sm
                        text-[#0D1B3E]

                        file:mr-4
                        file:py-2
                        file:px-4

                        file:rounded-lg
                        file:border-0

                        file:bg-[#F0F7FF]
                        file:text-[#0D1B3E]

                        file:font-semibold

                        hover:file:bg-[#E8EEF9]

                        cursor-pointer
                      "
                    />


                    <p
                      className="
                        text-xs
                        text-[#6B8AFF]

                        mt-2
                      "
                    >
                      {tr(
                        'testimonials.imageHint',
                        'JPG, PNG or WEBP. Maximum 5 MB.',
                        'JPG, PNG ឬ WEBP។ ទំហំអតិបរមា 5 MB។'
                      )}
                    </p>

                  </div>

                </div>

              </div>


              {/* =========================================
                  STATUS
              ========================================= */}

              <div
                className="
                  flex
                  items-center
                  justify-between

                  gap-4

                  p-4

                  rounded-xl

                  bg-[#F0F7FF]

                  border
                  border-[#E8EEF9]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      w-10
                      h-10

                      rounded-lg

                      bg-white

                      flex
                      items-center
                      justify-center

                      text-[#0D1B3E]

                      border
                      border-[#E8EEF9]
                    "
                  >

                    <FiCheckCircle
                      size={19}
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[#0D1B3E]
                      "
                    >
                      {tr(
                        'common.status',
                        'Status',
                        'ស្ថានភាព'
                      )}
                    </p>


                    <p
                      className="
                        text-xs
                        text-[#6B8AFF]

                        mt-0.5
                      "
                    >
                      {
                        formData.is_active
                          ? tr(
                              'common.active',
                              'Active',
                              'សកម្ម'
                            )
                          : tr(
                              'common.inactive',
                              'Inactive',
                              'អសកម្ម'
                            )
                      }
                    </p>

                  </div>

                </div>


                <button
                  type="button"

                  onClick={() =>
                    setFormData(
                      (
                        previous
                      ) => ({

                        ...previous,

                        is_active:
                          !previous.is_active,

                      })
                    )
                  }

                  className={`
                    relative

                    inline-flex

                    h-7
                    w-12

                    flex-shrink-0

                    cursor-pointer

                    rounded-full

                    transition-colors
                    duration-200

                    focus:outline-none

                    ${
                      formData.is_active
                        ? 'bg-[#0D1B3E]'
                        : 'bg-[#E8EEF9]'
                    }
                  `}
                >

                  <span
                    className={`
                      pointer-events-none

                      inline-block

                      h-5
                      w-5

                      mt-1

                      rounded-full

                      bg-white

                      shadow

                      transform

                      transition-transform
                      duration-200

                      ${
                        formData.is_active
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }
                    `}
                  />

                </button>

              </div>

            </div>


            {/* =========================================
                FOOTER
            ========================================= */}

            <div
              className="
                flex
                flex-col-reverse

                sm:flex-row
                sm:justify-end

                gap-3

                mt-7

                pt-5

                border-t
                border-[#E8EEF9]
              "
            >

              <button
                type="button"

                onClick={
                  closeModal
                }

                disabled={
                  saving
                }

                className="
                  px-5
                  py-2.5

                  rounded-lg

                  border
                  border-[#E8EEF9]

                  bg-white

                  text-[#6B8AFF]

                  text-sm
                  font-semibold

                  hover:bg-[#F0F7FF]

                  disabled:opacity-50
                  disabled:cursor-not-allowed

                  transition-all
                  duration-200
                "
              >

                {tr(
                  'common.cancel',
                  'Cancel',
                  'បោះបង់'
                )}

              </button>


              <button
                type="submit"

                disabled={
                  saving
                }

                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2

                  px-5
                  py-2.5

                  rounded-lg

                  bg-[#C23636]
                  hover:bg-[#A92E2E]

                  text-white

                  text-sm
                  font-semibold

                  shadow-sm

                  disabled:opacity-60
                  disabled:cursor-not-allowed

                  transition-all
                  duration-200
                "
              >

                {
                  saving ? (

                    <>

                      <span
                        className="
                          w-4
                          h-4

                          rounded-full

                          border-2
                          border-white/30
                          border-t-white

                          animate-spin
                        "
                      />


                      {tr(
                        'common.saving',
                        'Saving...',
                        'កំពុងរក្សាទុក...'
                      )}

                    </>

                  ) : editingTestimonial ? (

                    <>

                      <FiEdit2
                        size={16}
                      />


                      {tr(
                        'common.update',
                        'Update',
                        'កែប្រែ'
                      )}

                    </>

                  ) : (

                    <>

                      <FiPlus
                        size={16}
                      />


                      {tr(
                        'common.create',
                        'Create',
                        'បង្កើត'
                      )}

                    </>

                  )
                }

              </button>

            </div>

          </form>

        </div>

      </AdminModal>

    </div>

  );

};


export default AdminTestimonials;
