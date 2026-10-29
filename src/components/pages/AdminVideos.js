import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPlay,
  FiVideo,
  FiEye,
  FiStar,
  FiCalendar,
  FiExternalLink,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

import api from '../../services/api';
import { getImageUrl } from '../../utils/helpers';

import AdminTable from '../common/AdminTable';
import AdminModal from '../common/AdminModal';
import AdminCard from '../common/AdminCard';

import {
  useLanguage,
} from '../../contexts/LanguageContext';


const AdminVideos = () => {

  const {
    t,
    language,
  } = useLanguage();

  const isKhmer =
    language === 'km' ||
    language === 'kh';

  const tr = (key, englishFallback, khmerFallback) => {
    const value = t(key);
    if (value && value !== key) return value;
    return isKhmer ? khmerFallback : englishFallback;
  };


  const [
    videos,
    setVideos,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);


  const [
    editingVideo,
    setEditingVideo,
  ] = useState(null);


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  // ==========================================
  // FORM DATA
  // ==========================================

  const [
    formData,
    setFormData,
  ] = useState({

    title_en: '',
    title_km: '',

    description_en: '',
    description_km: '',

    category_en: '',
    category_km: '',

    video_url: '',
    thumbnail_url: '',
    published_at: '',
    is_featured: false,
    is_active: true,

  });


  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = [

    {
      en: 'School Activities',
      km: 'សកម្មភាពសាលា',
    },

    {
      en: 'Classroom',
      km: 'ថ្នាក់រៀន',
    },

    {
      en: 'Graduation',
      km: 'ពិធីបញ្ចប់ការសិក្សា',
    },

    {
      en: 'Trips',
      km: 'ដំណើរកម្សាន្ត',
    },

    {
      en: 'Special Events',
      km: 'ព្រឹត្តិការណ៍ពិសេស',
    },

  ];


  // ==========================================
  // CURRENT LANGUAGE FIELDS
  // ==========================================

  const titleField =
    isKhmer
      ? 'title_km'
      : 'title_en';


  const descriptionField =
    isKhmer
      ? 'description_km'
      : 'description_en';


  const categoryField =
    isKhmer
      ? 'category_km'
      : 'category_en';


  // ==========================================
  // LOCALIZED VALUE
  // ==========================================

  const getLocalizedValue = (
    item,
    field
  ) => {

    if (!item) {
      return '';
    }


    if (isKhmer) {

      return (
        item[`${field}_km`] ||
        item[`${field}_en`] ||
        item[field] ||
        ''
      );

    }


    return (
      item[`${field}_en`] ||
      item[`${field}_km`] ||
      item[field] ||
      ''
    );

  };


  // ==========================================
  // CATEGORY LABEL
  // ==========================================

  const getCategoryLabel = (
    video
  ) => {

    if (!video) {
      return '-';
    }


    const value =
      getLocalizedValue(
        video,
        'category'
      );


    return value || '-';

  };


  // ==========================================
  // FETCH
  // ==========================================

  const fetchVideos = async () => {

    try {
      setLoading(true);
      const minDelay = new Promise((resolve) => setTimeout(resolve, 500));

      const [response] = await Promise.all([
        api.get('/api/videos/'),
        minDelay,
      ]);

      setVideos(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          'VIDEO API ITEM:',
          Array.isArray(response.data)
            ? response.data[0]
            : undefined
        );
      }

    } catch (error) {

      console.error(
        'Fetch videos error:',
        {
          message: error?.message,
          code: error?.code,
          method: error?.config?.method,
          baseURL: error?.config?.baseURL,
          url: error?.config?.url,
          finalURL: `${error?.config?.baseURL || ''}${error?.config?.url || ''}`,
          status: error?.response?.status,
          response: error?.response?.data,
        }
      );


      toast.error(
        error.response?.data?.detail ||
        t(
          'videos.loadFailed'
        )
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchVideos();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {

    setEditingVideo(null);


    setFormData({

      title_en: '',
      title_km: '',

      description_en: '',
      description_km: '',

      category_en: '',
      category_km: '',

      video_url: '',
      thumbnail_url: '',
      published_at: '',
      is_featured: false,
      is_active: true,

    });

  };


  // ==========================================
  // ADD
  // ==========================================

  const handleAdd = () => {

    resetForm();

    setModalOpen(true);

  };


  // ==========================================
  // CLOSE
  // ==========================================

  const handleCloseModal = () => {

    setModalOpen(false);

    resetForm();

  };


  // ==========================================
  // LOCALIZED CHANGE
  // ==========================================

  const handleLocalizedChange = (
    field,
    value
  ) => {

    const fieldName =
      isKhmer
        ? `${field}_km`
        : `${field}_en`;


    setFormData(
      (previous) => ({

        ...previous,

        [fieldName]: value,

      })
    );

  };


  // ==========================================
  // CATEGORY CHANGE
  // ==========================================

  const handleCategoryChange = (
    e
  ) => {

    const selectedValue =
      e.target.value;


    if (!selectedValue) {

      setFormData(
        (previous) => ({

          ...previous,

          category_en: '',
          category_km: '',

        })
      );

      return;

    }


    const selected =
      categories.find(
        (category) =>
          category.en ===
            selectedValue ||
          category.km ===
            selectedValue
      );


    if (!selected) {
      return;
    }


    setFormData(
      (previous) => ({

        ...previous,

        category_en:
          selected.en,

        category_km:
          selected.km,

      })
    );

  };


  // ==========================================
  // YOUTUBE ID
  // ==========================================

  const getYoutubeId = (
    url
  ) => {

    if (!url) {
      return null;
    }


    try {

      const cleanUrl =
        url.trim();


      if (
        cleanUrl.includes(
          'youtube.com/watch'
        )
      ) {

        const parsedUrl =
          new URL(cleanUrl);


        return (
          parsedUrl.searchParams.get(
            'v'
          )
        );

      }


      if (
        cleanUrl.includes(
          'youtu.be/'
        )
      ) {

        return cleanUrl
          .split(
            'youtu.be/'
          )[1]
          ?.split('?')[0]
          ?.split('&')[0];

      }


      if (
        cleanUrl.includes(
          'youtube.com/shorts/'
        )
      ) {

        return cleanUrl
          .split(
            'youtube.com/shorts/'
          )[1]
          ?.split('?')[0]
          ?.split('&')[0];

      }


      if (
        cleanUrl.includes(
          'youtube.com/embed/'
        )
      ) {

        return cleanUrl
          .split(
            'youtube.com/embed/'
          )[1]
          ?.split('?')[0]
          ?.split('&')[0];

      }


      return null;

    } catch (error) {

      console.error(
        'YouTube ID error:',
        error
      );


      return null;

    }

  };


  // ==========================================
  // YOUTUBE THUMBNAIL
  // ==========================================

  const getYoutubeThumbnail = (
    url
  ) => {

    const youtubeId =
      getYoutubeId(url);


    if (!youtubeId) {
      return '';
    }


    return (
      `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    );

  };


  // ==========================================
  // VIDEO THUMBNAIL
  // ==========================================

  const getThumbnail = (
    video
  ) => {

    if (!video) {
      return '';
    }


    if (
      video.thumbnail?.trim()
    ) {

      const customThumbnail =
        video.thumbnail.trim();


      const thumbnailYoutubeId =
        getYoutubeId(
          customThumbnail
        );


      if (thumbnailYoutubeId) {

        return (
          `https://img.youtube.com/vi/${thumbnailYoutubeId}/hqdefault.jpg`
        );

      }


      return getImageUrl(customThumbnail);

    }


    if (
      video.thumbnail_url?.trim()
    ) {

      const customThumbnail =
        video.thumbnail_url.trim();


      const thumbnailYoutubeId =
        getYoutubeId(
          customThumbnail
        );


      if (thumbnailYoutubeId) {

        return (
          `https://img.youtube.com/vi/${thumbnailYoutubeId}/hqdefault.jpg`
        );

      }


      return getImageUrl(customThumbnail);

    }


    return getYoutubeThumbnail(
      video.video_url
    );

  };


  // ==========================================
  // FORM THUMBNAIL
  // ==========================================

  const getFormThumbnail = () => {

    if (
      formData.thumbnail_url?.trim()
    ) {

      const customThumbnail =
        formData.thumbnail_url.trim();


      const thumbnailYoutubeId =
        getYoutubeId(
          customThumbnail
        );


      if (thumbnailYoutubeId) {

        return (
          `https://img.youtube.com/vi/${thumbnailYoutubeId}/hqdefault.jpg`
        );

      }


      return getImageUrl(customThumbnail);

    }


    return getYoutubeThumbnail(
      formData.video_url
    );

  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return '-';
    }


    try {

      const dateOnly =
        String(date).slice(
          0,
          10
        );


      const parts =
        dateOnly.split('-');


      if (
        parts.length === 3
      ) {

        const [
          year,
          month,
          day,
        ] = parts;


        return (
          `${day}/${month}/${year}`
        );

      }


      const parsed =
        new Date(date);


      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {

        return '-';

      }


      return (
        parsed.toLocaleDateString(
          isKhmer
            ? 'km-KH'
            : 'en-GB'
        )
      );

    } catch {

      return '-';

    }

  };


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentTitle =
      formData[titleField]?.trim() ||
      formData.title_en?.trim() ||
      formData.title_km?.trim();

    if (!currentTitle) {
      toast.error(
        isKhmer
          ? 'សូមបញ្ចូលចំណងជើងវីដេអូ។'
          : 'Video title is required.'
      );
      return;
    }

    if (!formData.video_url?.trim()) {
      toast.error(
        isKhmer
          ? 'សូមបញ្ចូលតំណភ្ជាប់វីដេអូ (Video URL)។'
          : 'Please enter a video URL.'
      );
      return;
    }

    const titleEn = formData.title_en?.trim() || currentTitle;
    const titleKm = formData.title_km?.trim() || currentTitle;

    const descEn =
      formData.description_en?.trim() ||
      formData[descriptionField]?.trim() ||
      '';

    const descKm =
      formData.description_km?.trim() ||
      formData[descriptionField]?.trim() ||
      '';

    const catEn =
      formData.category_en?.trim() ||
      (isKhmer ? 'School Activities' : formData[categoryField]?.trim() || 'School Activities');

    const catKm =
      formData.category_km?.trim() ||
      (isKhmer ? formData[categoryField]?.trim() || 'សកម្មភាពសាលា' : 'សកម្មភាពសាលា');

    const publishedDate =
      formData.published_at?.trim() ||
      new Date().toISOString().split('T')[0];

    try {
      setSubmitting(true);

      const payload = {
        title_en: titleEn,
        title_km: titleKm,
        description_en: descEn,
        description_km: descKm,
        category_en: catEn,
        category_km: catKm,
        video_url: formData.video_url.trim(),
        thumbnail_url:
          formData.thumbnail_url?.trim() ||
          getYoutubeThumbnail(formData.video_url.trim()),
        published_at: `${publishedDate}T00:00:00`,
        is_featured: Boolean(formData.is_featured),
        is_active: Boolean(formData.is_active),
      };

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          'VIDEO PAYLOAD:',
          payload
        );
      }


      if (editingVideo) {

        await api.put(
          `/api/videos/${editingVideo.id}`,
          payload
        );


        toast.success(
          t(
            'videos.updatedSuccess'
          )
        );

      } else {

        await api.post(
          '/api/videos/',
          payload
        );


        toast.success(
          t(
            'videos.addedSuccess'
          )
        );

      }


      handleCloseModal();


      await fetchVideos();

    } catch (error) {

      console.error(
        'Video operation error:',
        {
          message: error?.message,
          code: error?.code,
          method: error?.config?.method,
          baseURL: error?.config?.baseURL,
          url: error?.config?.url,
          finalURL: `${error?.config?.baseURL || ''}${error?.config?.url || ''}`,
          status: error?.response?.status,
          response: error?.response?.data,
        }
      );


      console.error(
        'Backend response:',
        error.response?.data
      );


      let message =
        t(
          'videos.operationFailed'
        );


      const detail =
        error.response?.data?.detail;


      if (
        typeof detail ===
        'string'
      ) {

        message = detail;

      } else if (
        Array.isArray(detail)
      ) {

        message = detail
          .map(
            (item) => {

              const field =
                item?.loc?.[
                  item.loc.length - 1
                ];


              return (
                `${field || t(
                  'videos.field'
                )}: ${
                  item?.msg ||
                  t(
                    'videos.invalidValue'
                  )
                }`
              );

            }
          )
          .join(', ');

      }


      toast.error(
        message
      );

    } finally {

      setSubmitting(false);

    }

  };


  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (
    video
  ) => {

    setEditingVideo(
      video
    );


    setFormData({

      title_en:
        video.title_en ||
        video.title ||
        '',

      title_km:
        video.title_km ||
        '',


      description_en:
        video.description_en ||
        video.description ||
        '',

      description_km:
        video.description_km ||
        '',


      category_en:
        video.category_en ||
        video.category ||
        '',

      category_km:
        video.category_km ||
        '',


      video_url:
        video.video_url ||
        '',

      thumbnail_url:
        video.thumbnail_url ||
        '',

      published_at:
        video.published_at
          ? String(
              video.published_at
            ).slice(
              0,
              10
            )
          : '',

      is_featured:
        Boolean(
          video.is_featured
        ),

      is_active: video.is_active ?? true,

    });


    setModalOpen(
      true
    );

  };


  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        t(
          'videos.deleteConfirm'
        )
      );


    if (!confirmed) {
      return;
    }


    try {

      await api.delete(
        `/api/videos/${id}`
      );


      toast.success(
        t(
          'videos.deletedSuccess'
        )
      );


      await fetchVideos();

    } catch (error) {

      console.error(
        'Delete video error:',
        {
          message: error?.message,
          method: error?.config?.method,
          baseURL: error?.config?.baseURL,
          url: error?.config?.url,
          status: error?.response?.status,
          data: error?.response?.data,
        }
      );


      toast.error(
        error.response?.data?.detail ||
        t(
          'videos.deleteFailed'
        )
      );

    }

  };


  // ==========================================
  // OPEN VIDEO
  // ==========================================

  const handleOpenVideo = (
    url
  ) => {

    if (!url) {
      return;
    }


    window.open(
      getImageUrl(url),
      '_blank',
      'noopener,noreferrer'
    );

  };


  // ==========================================
  // COUNTS
  // ==========================================

  const featuredCount =
    videos.filter(
      (video) =>
        video.is_featured
    ).length;


  const totalViews =
    videos.reduce(
      (total, video) =>
        total +
        Number(
          video.views || 0
        ),
      0
    );


  const categoryCount =
    new Set(
      videos
        .map(
          (video) =>
            getLocalizedValue(
              video,
              'category'
            )
        )
        .filter(Boolean)
    ).size;


  // ==========================================
  // COLUMNS
  // ==========================================

  const columns = [

    {
      key: 'thumbnail',

      label:
        t(
          'videos.video'
        ),

      render: (_, row) => {

        const thumbnail =
          getThumbnail(
            row
          );


        const title =
          getLocalizedValue(
            row,
            'title'
          );


        return (

          <div
            className="
              relative
              w-[105px]
              h-[62px]
              bg-blue-50
              rounded-lg
              overflow-hidden
              flex-shrink-0
              group
            "
          >

            {
              thumbnail ? (

                <img
                  src={
                    thumbnail
                  }

                  alt={
                    title ||
                    t(
                      'videos.video'
                    )
                  }

                  className="
                    w-full
                    h-full
                    object-cover
                  "

                  onError={(e) => {
                    if (
                      !e.currentTarget.dataset.fallbackApplied
                    ) {
                      e.currentTarget.dataset.fallbackApplied =
                        'true';
                      e.currentTarget.src =
                        '/default-avatar.png';
                    }

                  }}
                />

              ) : (

                <div
                  className="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    text-blue-300
                  "
                >

                  <FiVideo
                    size={22}
                  />

                </div>

              )
            }


            <button
              type="button"

              onClick={() =>
                handleOpenVideo(
                  row.video_url
                )
              }

              title={
                t(
                  'videos.watchVideo'
                )
              }

              className="
                absolute
                inset-0
                bg-black/20
                flex
                items-center
                justify-center
                opacity-0
                group-hover:opacity-100
                transition
              "
            >

              <div
                className="
                  w-8
                  h-8
                  bg-red-600
                  text-white
                  rounded-full
                  flex
                  items-center
                  justify-center
                  shadow
                "
              >

                <FiPlay
                  size={14}
                  className="ml-0.5"
                />

              </div>

            </button>

          </div>

        );

      },
    },


    {
      key: 'title',

      label:
        t(
          'videos.titleColumn'
        ),

      render: (
        _,
        row
      ) => {

        const title =
          getLocalizedValue(
            row,
            'title'
          );


        const description =
          getLocalizedValue(
            row,
            'description'
          );


        return (

          <div
            className="
              max-w-[240px]
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <p
                className="
                  font-semibold
                  text-blue-900
                  truncate
                "
              >

                {
                  title ||
                  t(
                    'videos.untitled'
                  )
                }

              </p>


              {
                row.is_featured && (

                  <FiStar
                    size={13}

                    className="
                      text-red-600
                      fill-current
                      flex-shrink-0
                    "
                  />

                )
              }

            </div>


            {
              description && (

                <p
                  className="
                    text-xs
                    text-blue-400
                    truncate
                    mt-1
                  "
                >

                  {description}

                </p>

              )
            }

          </div>

        );

      },
    },


    {
      key: 'category',

      label:
        t(
          'videos.category'
        ),

      render: (
        _,
        row
      ) => {

        const category =
          getCategoryLabel(
            row
          );


        return category !== '-' ? (

          <span
            className="
              inline-flex
              px-2.5
              py-1
              bg-blue-50
              text-blue-900
              rounded-full
              text-[11px]
              font-semibold
              whitespace-nowrap
            "
          >

            {category}

          </span>

        ) : (

          <span
            className="
              text-blue-300
            "
          >
            -
          </span>

        );

      },
    },


    {
      key: 'date',

      label:
        t(
          'videos.date'
        ),

      render: (
        value
      ) => (

        <div
          className="
            flex
            items-center
            gap-1.5
            text-sm
            text-blue-500
            whitespace-nowrap
          "
        >

          <FiCalendar
            size={13}
            className="text-red-600"
          />


          {
            formatDate(
              value
            )
          }

        </div>

      ),
    },


    {
      key: 'views',

      label:
        t(
          'videos.views'
        ),

      render: (
        value
      ) => (

        <div
          className="
            inline-flex
            items-center
            gap-1.5
            text-sm
            text-blue-500
          "
        >

          <FiEye
            size={14}
            className="text-blue-300"
          />


          {
            Number(
              value || 0
            ).toLocaleString(
              isKhmer
                ? 'km-KH'
                : 'en-GB'
            )
          }

        </div>

      ),
    },


    {
      key: 'actions',

      label:
        t(
          'common.actions'
        ),

      render: (
        _,
        row
      ) => (

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
              handleOpenVideo(
                row.video_url
              )
            }

            className="
              w-8
              h-8
              flex
              items-center
              justify-center
              bg-blue-50
              text-blue-600
              rounded-lg
              hover:bg-blue-600
              hover:text-white
              transition
            "

            title={
              t(
                'videos.watchVideo'
              )
            }
          >

            <FiPlay
              size={14}
            />

          </button>


          <button
            type="button"

            onClick={() =>
              handleEdit(
                row
              )
            }

            className="
              w-8
              h-8
              flex
              items-center
              justify-center
              bg-blue-50
              text-blue-900
              rounded-lg
              hover:bg-blue-900
              hover:text-white
              transition
            "

            title={
              t(
                'videos.editVideo'
              )
            }
          >

            <FiEdit2
              size={14}
            />

          </button>


          <button
            type="button"

            onClick={() =>
              handleDelete(
                row.id
              )
            }

            className="
              w-8
              h-8
              flex
              items-center
              justify-center
              bg-red-50
              text-red-600
              rounded-lg
              hover:bg-red-600
              hover:text-white
              transition
            "

            title={
              t(
                'videos.deleteVideo'
              )
            }
          >

            <FiTrash2
              size={14}
            />

          </button>

        </div>

      ),
    },

  ];


  const formThumbnail =
    getFormThumbnail();


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div
      className={`
        w-full
        ${
          isKhmer
            ? 'font-khmer'
            : 'font-english'
        }
      `}
    >


      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
          mb-6
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
              bg-blue-900
              text-white
              rounded-xl
              flex
              items-center
              justify-center
              shadow-sm
            "
          >

            <FiVideo
              size={18}
            />

          </div>


          <div>

            <h1
              className="
                text-xl
                md:text-2xl
                font-bold
                text-blue-900
              "
            >

              {t(
                'videos.title'
              )}

            </h1>


            <p
              className="
                text-xs
                md:text-sm
                text-blue-400
                mt-1
              "
            >

              {t(
                'videos.subtitle'
              )}

            </p>

          </div>

        </div>


        <button
          type="button"

          onClick={
            handleAdd
          }

          className="
            h-10
            px-4
            inline-flex
            items-center
            justify-center
            gap-2
            bg-red-600
            text-white
            rounded-lg
            text-sm
            font-semibold
            shadow-sm
            hover:bg-red-700
            hover:shadow-md
            transition-all
          "
        >

          <FiPlus
            size={17}
          />


          {t(
            'videos.addVideo'
          )}

        </button>

      </div>


      {/* SUMMARY */}

      <div
        className="
          grid
          grid-cols-2
          xl:grid-cols-4
          gap-3
          mb-6
        "
      >

        <div
          className="
            bg-white
            border
            border-blue-200
            rounded-xl
            p-4
            shadow-sm
          "
        >

          <p
            className="
              text-xs
              text-blue-400
            "
          >
            {t(
              'videos.totalVideos'
            )}
          </p>


          <p
            className="
              text-2xl
              font-bold
              text-blue-900
              mt-1
            "
          >
            {videos.length}
          </p>

        </div>


        <div
          className="
            bg-white
            border
            border-red-100
            rounded-xl
            p-4
            shadow-sm
          "
        >

          <p
            className="
              text-xs
              text-blue-400
            "
          >
            {t(
              'videos.featuredVideos'
            )}
          </p>


          <p
            className="
              text-2xl
              font-bold
              text-red-600
              mt-1
            "
          >
            {featuredCount}
          </p>

        </div>


        <div
          className="
            bg-white
            border
            border-blue-200
            rounded-xl
            p-4
            shadow-sm
          "
        >

          <p
            className="
              text-xs
              text-blue-400
            "
          >
            {t(
              'videos.totalViews'
            )}
          </p>


          <p
            className="
              text-2xl
              font-bold
              text-blue-600
              mt-1
            "
          >

            {
              totalViews.toLocaleString(
                isKhmer
                  ? 'km-KH'
                  : 'en-GB'
              )
            }

          </p>

        </div>


        <div
          className="
            bg-white
            border
            border-blue-200
            rounded-xl
            p-4
            shadow-sm
          "
        >

          <p
            className="
              text-xs
              text-blue-400
            "
          >
            {t(
              'videos.categories'
            )}
          </p>


          <p
            className="
              text-2xl
              font-bold
              text-blue-600
              mt-1
            "
          >
            {categoryCount}
          </p>

        </div>

      </div>


      {/* TABLE */}

      <AdminCard
        className="
          border
          border-blue-200
          rounded-xl
          shadow-sm
          overflow-hidden
        "
      >

        <div
          className="
            px-5
            py-4
            border-b
            border-blue-200
          "
        >

          <h2
            className="
              text-sm
              font-bold
              text-blue-900
            "
          >
            {t(
              'videos.allVideos'
            )}
          </h2>


          <p
            className="
              text-xs
              text-blue-300
              mt-1
            "
          >

            {videos.length}{' '}

            {
              videos.length === 1
                ? t(
                    'videos.videoFound'
                  )
                : t(
                    'videos.videosFound'
                  )
            }

          </p>

        </div>


        <AdminTable
          columns={
            columns
          }

          data={
            videos
          }

          loading={
            loading
          }
        />

      </AdminCard>


      {/* ======================================
          MODAL
      ======================================= */}

      <AdminModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
          editingVideo
            ? tr('videos.editVideo', 'Edit Video', 'កែប្រែវីដេអូ')
            : tr('videos.addVideo', 'Add Video', 'បន្ថែមវីដេអូ')
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* VIDEO URL */}
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer ? 'តំណភ្ជាប់វីដេអូ (YouTube URL)' : 'Video Link (YouTube URL)'}
                <span className="text-[#C23636] ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      video_url: e.target.value,
                    }))
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full border border-[#E8EEF9] rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition"
                  required
                />
                <FiExternalLink className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B8AFF]" />
              </div>
            </div>

            {/* LIVE THUMBNAIL PREVIEW */}
            {formThumbnail && (
              <div className="relative w-full h-[180px] sm:h-[200px] rounded-xl overflow-hidden bg-[#F0F7FF] border border-[#E8EEF9] group">
                <img
                  src={formThumbnail}
                  alt="Video Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#C23636] text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <FiPlay size={20} className="ml-0.5" />
                  </div>
                </div>
              </div>
            )}

            {/* VIDEO TITLE */}
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer ? 'ចំណងជើងវីដេអូ' : 'Video Title'}
                <span className="text-[#C23636] ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData[titleField]}
                onChange={(e) =>
                  handleLocalizedChange('title', e.target.value)
                }
                placeholder={
                  isKhmer
                    ? 'ឧ. សកម្មភាពសិក្សាអនុវត្តជាក់ស្តែងក្នុងបន្ទប់ Lab IT'
                    : 'e.g. Hands-on IT Lab Practical Sessions'
                }
                className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition ${
                  isKhmer ? 'font-khmer' : 'font-english'
                }`}
                required
              />
            </div>

            {/* CATEGORY & PUBLISH DATE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer ? 'ប្រភេទវីដេអូ' : 'Video Category'}
                </label>
                <select
                  value={formData[categoryField]}
                  onChange={handleCategoryChange}
                  className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition bg-white ${
                    isKhmer ? 'font-khmer' : 'font-english'
                  }`}
                >
                  <option value="">
                    {isKhmer ? 'ជ្រើសរើសប្រភេទ' : 'Select Category'}
                  </option>
                  {categories.map((cat) => {
                    const val = isKhmer ? cat.km : cat.en;
                    return (
                      <option key={cat.en} value={val}>
                        {val}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer ? 'កាលបរិច្ឆេទបង្ហោះ' : 'Publish Date'}
                </label>
                <input
                  type="date"
                  value={
                    formData.published_at ||
                    new Date().toISOString().split('T')[0]
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      published_at: e.target.value,
                    }))
                  }
                  className="w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition bg-white"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer ? 'ការពិពណ៌នាសង្ខេប' : 'Video Description'}
              </label>
              <textarea
                value={formData[descriptionField]}
                onChange={(e) =>
                  handleLocalizedChange('description', e.target.value)
                }
                rows={3}
                placeholder={
                  isKhmer
                    ? 'បញ្ចូលការពិពណ៌នាសង្ខេបអំពីវីដេអូនេះ...'
                    : 'Enter short description for this video...'
                }
                className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition ${
                  isKhmer ? 'font-khmer' : 'font-english'
                }`}
              />
            </div>

            {/* ACTIVE SWITCH */}
            <label className="flex items-center justify-between gap-3 p-4 border border-[#E8EEF9] rounded-xl bg-white cursor-pointer hover:bg-[#F0F7FF] transition">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    formData.is_active
                      ? 'bg-[#EBF9F0] text-[#2E7D32]'
                      : 'bg-[#F0F7FF] text-[#6B8AFF]'
                  }`}
                >
                  {formData.is_active ? (
                    <FiCheckCircle size={18} />
                  ) : (
                    <FiXCircle size={18} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#0D1B3E]">
                    {isKhmer ? 'វីដេអូសកម្ម' : 'Active Video'}
                  </p>
                  <p className="text-xs text-[#6B8AFF]">
                    {isKhmer
                      ? 'បង្ហាញវីដេអូនេះនៅលើគេហទំព័រ'
                      : 'Show this video on the website'}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-[#0D1B3E]"
              />
            </label>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-6 pt-4 border-t border-[#E8EEF9] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={submitting}
              className="h-10 px-4 bg-white border border-[#E8EEF9] text-[#6B8AFF] rounded-lg text-sm font-semibold hover:bg-[#F0F7FF] disabled:opacity-50 transition"
            >
              {tr('common.cancel', 'Cancel', 'បោះបង់')}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="min-w-[140px] h-10 px-5 bg-[#C23636] text-white rounded-lg text-sm font-semibold hover:bg-[#A92E2E] disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {tr('common.saving', 'Saving...', 'កំពុងរក្សាទុក...')}
                </>
              ) : editingVideo ? (
                <>
                  <FiEdit2 size={15} />
                  {tr('videos.updateVideo', 'Update Video', 'រក្សាទុកការកែប្រែ')}
                </>
              ) : (
                <>
                  <FiPlus size={16} />
                  {tr('videos.addVideo', 'Add Video', 'បន្ថែមវីដេអូ')}
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>

    </div>

  );

};


export default AdminVideos;
