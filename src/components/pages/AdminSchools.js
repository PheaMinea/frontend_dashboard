import React, {
  useEffect,
  useRef,
  useState } from 'react';

import { toast } from 'react-toastify';

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiHome,
  FiCheckCircle } from 'react-icons/fi';

import api, {
  getApiErrorMessage } from '../../services/api';

import {
  getImageUrl } from '../../utils/helpers';

import {
  useLanguage } from '../../contexts/LanguageContext';

import AdminTable from '../common/AdminTable';
import AdminModal from '../common/AdminModal';
import AdminCard from '../common/AdminCard';


const DEFAULT_IMG = '/default-avatar.png';


// ==========================================
// INITIAL FORM
// ==========================================

const initialForm = {
  name_en: '',
  name_km: '',

  acronym: '',

  tag_en: '',
  tag_km: '',

  description_en: '',
  description_km: '',

  features_en: '',
  features_km: '',

  is_active: true,
  order: 0 };


// ==========================================
// ADMIN SCHOOLS
// ==========================================

const AdminSchools = () => {

  // ========================================
  // LANGUAGE
  // ========================================

  const {
    t,
    language } = useLanguage();


  const isKhmer =
    language === 'km' ||
    language === 'kh';


  // ========================================
  // TRANSLATION FALLBACK
  // ========================================

  const tr = (
    key,
    englishFallback,
    khmerFallback
  ) => {

    const value = t(key);

    if (
      value &&
      value !== key
    ) {
      return value;
    }

    return isKhmer
      ? khmerFallback
      : englishFallback;
  };


  // ========================================
  // STATES
  // ========================================

  const [
    schools,
    setSchools,
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
    editingSchool,
    setEditingSchool,
  ] = useState(null);


  const [
    formData,
    setFormData,
  ] = useState({
    ...initialForm });


  const [
    imageFile,
    setImageFile,
  ] = useState(null);


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const fileRef = useRef(null);


  // ========================================
  // CURRENT LANGUAGE FIELD NAMES
  // ========================================

  const nameField =
    isKhmer
      ? 'name_km'
      : 'name_en';


  const tagField =
    isKhmer
      ? 'tag_km'
      : 'tag_en';


  const descriptionField =
    isKhmer
      ? 'description_km'
      : 'description_en';


  const featuresField =
    isKhmer
      ? 'features_km'
      : 'features_en';


  // ========================================
  // GET SCHOOL NAME
  // ========================================

  const getSchoolName = (school) => {

    if (!school) {
      return '-';
    }


    if (isKhmer) {

      return (
        school.name_km ||
        school.name_en ||
        '-'
      );
    }


    return (
      school.name_en ||
      school.name_km ||
      '-'
    );
  };


  // ========================================
  // GET SCHOOL TAG
  // ========================================

  const getSchoolTag = (school) => {

    if (!school) {
      return '-';
    }


    if (isKhmer) {

      return (
        school.tag_km ||
        school.tag_en ||
        '-'
      );
    }


    return (
      school.tag_en ||
      school.tag_km ||
      '-'
    );
  };


  // ========================================
  // FETCH SCHOOLS
  // ========================================

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const minDelay = new Promise((resolve) => setTimeout(resolve, 500));

      const [response] = await Promise.all([
        api.get('/api/schools/'),
        minDelay,
      ]);

      setSchools(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        'Fetch schools error:',
        error
      );


      toast.error(
        getApiErrorMessage(
          error,

          tr(
            'schools.loadFailed',
            'Failed to load schools.',
            'មិនអាចទាញយកទិន្នន័យសាលាបានទេ។'
          )
        )
      );

    } finally {

      setLoading(false);
    }
  };


  // ========================================
  // LOAD SCHOOLS
  // ========================================

  useEffect(() => {

    fetchSchools();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {

    setEditingSchool(null);


    setFormData({
      ...initialForm });


    setImageFile(null);

    setSubmitting(false);


    if (fileRef.current) {

      fileRef.current.value = '';
    }
  };


  // ========================================
  // OPEN CREATE MODAL
  // ========================================

  const openCreateModal = () => {

    resetForm();

    setModalOpen(true);
  };


  // ========================================
  // CLOSE MODAL
  // ========================================

  const closeModal = () => {

    if (submitting) {
      return;
    }


    setModalOpen(false);

    resetForm();
  };


  // ========================================
  // INPUT CHANGE
  // ========================================

  const handleInputChange = (
    event
  ) => {

    const {
      name,
      value,
      type,
      checked } = event.target;


    setFormData(
      (previous) => ({

        ...previous,

        [name]:
          type === 'checkbox'
            ? checked
            : value })
    );
  };


  // ========================================
  // IMAGE CHANGE
  // ========================================

  const handleImageChange = (
    event
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {

      setImageFile(null);

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
          'schools.invalidImage',
          'Please select a JPG, JPEG, PNG or WEBP image.',
          'សូមជ្រើសរើសរូបភាពប្រភេទ JPG, JPEG, PNG ឬ WEBP។'
        )
      );


      event.target.value = '';

      setImageFile(null);

      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      toast.error(
        tr(
          'schools.imageTooLarge',
          'Image must be 5 MB or smaller.',
          'រូបភាពត្រូវមានទំហំ 5 MB ឬតូចជាងនេះ។'
        )
      );


      event.target.value = '';

      setImageFile(null);

      return;
    }


    setImageFile(file);
  };


  // ========================================
  // EDIT SCHOOL
  // ========================================

  const handleEdit = (
    school
  ) => {

    setEditingSchool(
      school
    );


    setFormData({

      name_en:
        school.name_en || '',

      name_km:
        school.name_km || '',


      acronym:
        school.acronym || '',


      tag_en:
        school.tag_en || '',

      tag_km:
        school.tag_km || '',


      description_en:
        school.description_en || '',

      description_km:
        school.description_km || '',


      features_en:
        school.features_en || '',

      features_km:
        school.features_km || '',


      is_active:
        school.is_active ?? true,


      order:
        school.sort_order ?? 0 });


    setImageFile(null);


    if (fileRef.current) {

      fileRef.current.value = '';
    }


    setModalOpen(true);
  };


  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    // ======================================
    // CHECK CURRENT LANGUAGE NAME ONLY
    // ======================================

    if (
      !String(
        formData[nameField] || ''
      ).trim()
    ) {

      toast.error(
        isKhmer
          ? 'សូមបញ្ចូលឈ្មោះសាលា។'
          : 'Please enter the school name.'
      );

      return;
    }


    try {

      setSubmitting(true);


      const payload =
        new FormData();

      const nameEn =
        formData.name_en.trim() ||
        formData[nameField].trim();

      const nameKm =
        formData.name_km.trim() ||
        formData[nameField].trim();


      // ====================================
      // BILINGUAL DATA
      // ====================================

      payload.append(
        'name_en',
        nameEn
      );


      payload.append(
        'name_km',
        nameKm
      );


      const tagEn =
        formData.tag_en?.trim() ||
        formData[tagField]?.trim() ||
        '';

      const tagKm =
        formData.tag_km?.trim() ||
        formData[tagField]?.trim() ||
        '';

      payload.append(
        'tag_en',
        tagEn
      );

      payload.append(
        'tag_km',
        tagKm
      );

      const descEn =
        formData.description_en?.trim() ||
        formData[descriptionField]?.trim() ||
        '';

      const descKm =
        formData.description_km?.trim() ||
        formData[descriptionField]?.trim() ||
        '';

      payload.append(
        'description_en',
        descEn
      );

      payload.append(
        'description_km',
        descKm
      );

      const featuresEn =
        formData.features_en?.trim() ||
        formData[featuresField]?.trim() ||
        '';

      const featuresKm =
        formData.features_km?.trim() ||
        formData[featuresField]?.trim() ||
        '';

      payload.append(
        'features_en',
        featuresEn
      );

      payload.append(
        'features_km',
        featuresKm
      );


      // ====================================
      // COMMON DATA
      // ====================================

      payload.append(
        'acronym',
        formData.acronym.trim()
      );


      payload.append(
        'is_active',
        String(
          formData.is_active
        )
      );


      payload.append(
        'order',
        String(
          Number(
            formData.order
          ) || 0
        )
      );


      // ====================================
      // IMAGE
      // ====================================

      if (imageFile) {

        payload.append(
          'image',
          imageFile
        );
      }


      // ====================================
      // UPDATE
      // ====================================

      if (editingSchool) {

        await api.put(
          `/api/schools/${editingSchool.id}`,
          payload
        );


        toast.success(
          tr(
            'schools.updatedSuccess',
            'School updated successfully.',
            'បានកែប្រែព័ត៌មានសាលាដោយជោគជ័យ។'
          )
        );

      } else {

        // ==================================
        // CREATE
        // ==================================

        await api.post(
          '/api/schools/',
          payload
        );


        toast.success(
          tr(
            'schools.createdSuccess',
            'School created successfully.',
            'បានបង្កើតសាលាដោយជោគជ័យ។'
          )
        );
      }


      setModalOpen(false);

      resetForm();


      await fetchSchools();

    } catch (error) {

      console.error(
        'School operation error:',
        error
      );


      toast.error(
        getApiErrorMessage(
          error,

          tr(
            'common.operationFailed',
            'Operation failed.',
            'ប្រតិបត្តិការមិនបានជោគជ័យ។'
          )
        )
      );

    } finally {

      setSubmitting(false);
    }
  };


  // ========================================
  // DELETE SCHOOL
  // ========================================

  const handleDelete = async (
    schoolId
  ) => {

    const confirmed =
      window.confirm(
        tr(
          'schools.deleteConfirm',
          'Are you sure you want to delete this school?',
          'តើអ្នកប្រាកដថាចង់លុបសាលានេះមែនទេ?'
        )
      );


    if (!confirmed) {
      return;
    }


    try {

      await api.delete(
        `/api/schools/${schoolId}`
      );


      toast.success(
        tr(
          'schools.deletedSuccess',
          'School deleted successfully.',
          'បានលុបសាលាដោយជោគជ័យ។'
        )
      );


      await fetchSchools();

    } catch (error) {

      console.error(
        'Delete school error:',
        error
      );


      toast.error(
        getApiErrorMessage(
          error,

          tr(
            'schools.deleteFailed',
            'Failed to delete school.',
            'មិនអាចលុបសាលាបានទេ។'
          )
        )
      );
    }
  };


  // ========================================
  // TABLE COLUMNS
  // ========================================

  const columns = [

    // ======================================
    // IMAGE
    // ======================================

    {
      key: 'image_url',

      label: tr(
        'schools.image',
        'Image',
        'រូបភាព'
      ),

      render: (value) => (

        <div
          className="
            w-16
            h-12

            rounded-lg
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
                DEFAULT_IMG
              )
            }

            alt={
              tr(
                'schools.image',
                'School image',
                'រូបភាពសាលា'
              )
            }

            className="
              w-full
              h-full
              object-cover
            "

            onError={(event) => {

              event.currentTarget.src =
                DEFAULT_IMG;
            }}
          />

        </div>
      ) },


    // ======================================
    // ACRONYM
    // ======================================

    {
      key: 'acronym',

      label: tr(
        'schools.acronym',
        'Acronym',
        'អក្សរកាត់'
      ),

      render: (value) => (

        <span
          className="
            inline-flex
            items-center
            justify-center

            min-w-[48px]

            px-3
            py-1

            rounded-lg

            bg-[#F0F7FF]
            text-[#0D1B3E]

            border
            border-[#E8EEF9]

            text-xs
            font-bold
          "
        >
          {value || '-'}
        </span>
      ) },


    // ======================================
    // SCHOOL NAME
    // ======================================

    {
      key: 'name_en',

      label: tr(
        'schools.schoolName',
        'School Name',
        'ឈ្មោះសាលា'
      ),

      render: (
        value,
        row
      ) => (

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

            <FiHome
              size={17}
            />

          </div>


          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                font-semibold
                text-[#0D1B3E]

                truncate
              "
            >
              {
                getSchoolName(
                  row
                )
              }
            </p>

          </div>

        </div>
      ) },


    // ======================================
    // TAG
    // ======================================

    {
      key: 'tag_en',

      label: tr(
        'schools.tag',
        'Tag',
        'ស្លាក'
      ),

      render: (
        value,
        row
      ) => (

        <span
          className="
            inline-flex

            px-3
            py-1

            rounded-full

            bg-[#F0F7FF]
            text-[#6B8AFF]

            text-xs
            font-medium
          "
        >
          {
            getSchoolTag(
              row
            )
          }
        </span>
      ) },


    // ======================================
    // ORDER
    // ======================================

    {
      key: 'order',

      label: tr(
        'schools.order',
        'Order',
        'លំដាប់'
      ),

      render: (value) => (

        <span
          className="
            inline-flex
            items-center
            justify-center

            w-8
            h-8

            rounded-lg

            bg-[#F0F7FF]
            text-[#0D1B3E]

            font-semibold
            text-xs
          "
        >
          {value ?? 0}
        </span>
      ) },


    // ======================================
    // STATUS
    // ======================================

    {
      key: 'is_active',

      label: tr(
        'schools.status',
        'Status',
        'ស្ថានភាព'
      ),

      render: (value) => (

        <span
          className={
            value
              ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF9F0] text-[#2E7D32]'
              : 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEBEE] text-[#C62828]'
          }
        >

          <span
            className={
              value
                ? 'w-1.5 h-1.5 rounded-full bg-[#2E7D32]'
                : 'w-1.5 h-1.5 rounded-full bg-[#C62828]'
            }
          />


          {
            value
              ? tr(
                  'schools.active',
                  'Active',
                  'សកម្ម'
                )
              : tr(
                  'schools.inactive',
                  'Inactive',
                  'អសកម្ម'
                )
          }

        </span>
      ) },


    // ======================================
    // ACTIONS
    // ======================================

    {
      key: 'actions',

      label: tr(
        'common.actions',
        'Actions',
        'សកម្មភាព'
      ),

      render: (
        value,
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
              handleEdit(
                row
              )
            }

            title={
              tr(
                'common.edit',
                'Edit',
                'កែប្រែ'
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
                'common.delete',
                'Delete',
                'លុប'
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
      ) },
  ];


  // ========================================
  // RETURN
  // ========================================

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

      {/* ==================================
          HEADER
      ================================== */}

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

              flex-shrink-0
            "
          >
            <FiHome
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
              {
                tr(
                  'schools.title',
                  'Schools Management',
                  'គ្រប់គ្រងសាលា'
                )
              }
            </h1>


            <p
              className="
                text-sm
                text-[#6B8AFF]

                mt-0.5
              "
            >
              {
                tr(
                  'schools.subtitle',
                  'Manage school information and content',
                  'គ្រប់គ្រងព័ត៌មាន និងមាតិកាសាលា'
                )
              }
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


          {
            tr(
              'schools.addSchool',
              'Add School',
              'បន្ថែមសាលា'
            )
          }

        </button>

      </div>


      {/* ==================================
          TABLE
      ================================== */}

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
          columns={columns}

          data={schools}

          loading={loading}
        />

      </AdminCard>


      {/* ==================================
          MODAL
      ================================== */}

      <AdminModal
        isOpen={modalOpen}

        onClose={
          closeModal
        }

        title={
          editingSchool
            ? tr(
                'schools.editSchool',
                'Edit School',
                'កែប្រែសាលា'
              )
            : tr(
                'schools.addSchool',
                'Add School',
                'បន្ថែមសាលា'
              )
        }
      >

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* SCHOOL NAME */}
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer ? 'ឈ្មោះសាលា / សាខា' : 'School / Campus Name'}
                <span className="text-[#C23636] ml-1">*</span>
              </label>
              <input
                type="text"
                name={nameField}
                value={formData[nameField]}
                onChange={handleInputChange}
                className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition ${
                  isKhmer ? 'font-khmer' : 'font-english'
                }`}
                placeholder={
                  isKhmer
                    ? 'សាលា SC Academy (សាខាទួលគោក)'
                    : 'SC Academy (Toul Kork Campus)'
                }
                required
              />
            </div>

            {/* ADDRESS & ACRONYM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer ? 'អាសយដ្ឋាន / ទីតាំងសាលា' : 'Campus Address / Location'}
                </label>
                <input
                  type="text"
                  name={tagField}
                  value={formData[tagField]}
                  onChange={handleInputChange}
                  className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition ${
                    isKhmer ? 'font-khmer' : 'font-english'
                  }`}
                  placeholder={
                    isKhmer
                      ? 'ផ្ទះលេខ ១៤ ផ្លូវ ៣៤៩ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ'
                      : '14 Street 349, Toul Kork, Phnom Penh'
                  }
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer ? 'អក្សរកាត់' : 'Acronym'}
                </label>
                <input
                  type="text"
                  name="acronym"
                  value={formData.acronym}
                  onChange={handleInputChange}
                  className="w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition uppercase"
                  placeholder="ឧ. SC, SCA, TK"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer ? 'ការពិពណ៌នាអំពីសាលា' : 'School Description'}
              </label>
              <textarea
                name={descriptionField}
                value={formData[descriptionField]}
                onChange={handleInputChange}
                rows={3}
                className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition ${
                  isKhmer ? 'font-khmer' : 'font-english'
                }`}
                placeholder={
                  isKhmer
                    ? 'បញ្ចូលការពិពណ៌នាអំពីសាលា ឬសាខានេះ...'
                    : 'Enter description for this school campus...'
                }
              />
            </div>

            {/* FEATURES */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-[#0D1B3E]">
                  {isKhmer ? 'លក្ខណៈពិសេស / បរិក្ខារសាលា' : 'Campus Highlights & Facilities'}
                </label>
                <span className="text-[11px] text-[#6B8AFF]">
                  {isKhmer ? '(ចុះបន្ទាត់មួយចំណុចៗ)' : '(Enter each point on a new line)'}
                </span>
              </div>
              <textarea
                name={featuresField}
                value={formData[featuresField]}
                onChange={handleInputChange}
                rows={3}
                className={`w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition ${
                  isKhmer ? 'font-khmer' : 'font-english'
                }`}
                placeholder={
                  isKhmer
                    ? "ឧ. បន្ទប់កុំព្យូទ័របំពាក់ម៉ាស៊ីនទំនើប\nគ្រូជំនាញមានបទពិសោធន៍ខ្ពស់\nបរិយាកាសសិក្សាមានផាសុកភាព"
                    : "e.g. Modern computer lab facilities\nExperienced IT mentors\nComfortable learning environment"
                }
              />
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                {isKhmer ? 'រូបភាពសាលា / សាខា' : 'School / Campus Image'}
              </label>

              {!imageFile && !editingSchool?.image_url ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="min-h-[140px] border-2 border-dashed border-[#E8EEF9] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-[#F0F7FF] hover:border-[#0D1B3E] transition p-5 text-center"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#0D1B3E] border border-[#E8EEF9] mb-3 shadow-xs">
                    <FiImage size={23} />
                  </div>

                  <p className="text-sm font-semibold text-[#0D1B3E]">
                    {isKhmer ? 'បញ្ចូលរូបភាពសាលា' : 'Upload School Image'}
                  </p>

                  <p className="text-xs text-[#6B8AFF] mt-1">
                    JPG, JPEG, PNG, WEBP — 5 MB
                  </p>
                </div>
              ) : (
                <div className="relative h-[220px] rounded-xl overflow-hidden border border-[#E8EEF9] bg-[#F0F7FF] group">
                  <img
                    src={
                      imageFile
                        ? URL.createObjectURL(imageFile)
                        : getImageUrl(editingSchool.image_url, DEFAULT_IMG)
                    }
                    alt="School Preview"
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-[#C23636] text-white flex items-center justify-center hover:bg-[#A92E2E] shadow"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-3 right-3 h-9 px-3 bg-white text-[#0D1B3E] rounded-lg text-xs font-semibold shadow hover:bg-slate-50"
                  >
                    {isKhmer ? 'ប្ដូររូបភាព' : 'Change Image'}
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* ACTIVE STATUS TOGGLE */}
            <label className="flex items-center justify-between gap-3 p-4 border border-[#E8EEF9] rounded-xl bg-white cursor-pointer hover:bg-[#F0F7FF] transition">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    formData.is_active
                      ? 'bg-[#EBF9F0] text-[#2E7D32]'
                      : 'bg-[#F0F7FF] text-[#6B8AFF]'
                  }`}
                >
                  <FiCheckCircle size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#0D1B3E]">
                    {isKhmer ? 'សាលាសកម្ម' : 'Active School'}
                  </p>
                  <p className="text-xs text-[#6B8AFF]">
                    {isKhmer
                      ? 'បង្ហាញព័ត៌មានសាលានេះនៅលើគេហទំព័រ'
                      : 'Show this school on the website'}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 accent-[#0D1B3E]"
              />
            </label>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-6 pt-4 border-t border-[#E8EEF9] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
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
              ) : editingSchool ? (
                <>
                  <FiEdit2 size={15} />
                  {tr('schools.updateSchool', 'Update School', 'រក្សាទុកការកែប្រែ')}
                </>
              ) : (
                <>
                  <FiPlus size={16} />
                  {tr('schools.createSchool', 'Create School', 'បង្កើតសាលា')}
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>

    </div>
  );
};


export default AdminSchools;
