import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiAward,
  FiCheck,
  FiEdit2,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiTrash2,
  FiUser,
  FiX,
  FiUploadCloud,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

import api, { getApiErrorMessage } from "../../services/api";
import { useLanguage } from "../../contexts/LanguageContext";
import { getImageUrl } from "../../utils/helpers";
import AdminModal from "../common/AdminModal";

/* =========================================================
   EMPTY FORM
========================================================= */

const EMPTY_FORM = {
  name_en: "",
  name_km: "",

  // Keep backend field names unchanged
  // role = Course
  role_en: "",
  role_km: "",

  // company = Current Job / Institution
  company_en: "",
  company_km: "",

  // story = Student Testimonial
  story_en: "",
  story_km: "",

  image_url: "",
  graduation_year: "",
  is_featured: false,
  is_active: true,
  order: 0,
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AdminAlumni = () => {
  const { t, language } = useLanguage();

  const isKhmer =
    language === "km" ||
    language === "kh";

  /*
   * One visible form.
   * Data is saved into the language-specific database field.
   */
  const languageSuffix = isKhmer ? "km" : "en";

  const fieldNames = {
    name: `name_${languageSuffix}`,
    role: `role_${languageSuffix}`,
    company: `company_${languageSuffix}`,
    story: `story_${languageSuffix}`,
  };

  /* =========================================================
     TRANSLATION HELPER
  ========================================================= */

  const tr = (key, english, khmer) => {
    const translated =
      typeof t === "function" ? t(key) : "";

    if (
      translated &&
      translated !== key &&
      !String(translated).includes("undefined")
    ) {
      return translated;
    }

    return isKhmer ? khmer : english;
  };

  /* =========================================================
     LOCALIZED VALUE
  ========================================================= */

  const localized = (
    item,
    field,
    fallback = ""
  ) => {
    if (!item) return fallback;

    const selectedField =
      `${field}_${isKhmer ? "km" : "en"}`;

    const value = item[selectedField];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }

    return fallback;
  };

  /* =========================================================
     STATE
  ========================================================= */

  const [alumni, setAlumni] = useState([]);

  const [formData, setFormData] =
    useState(EMPTY_FORM);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [imagePreview, setImagePreview] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [featuredFilter, setFeaturedFilter] =
    useState("all");

  const [editingId, setEditingId] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  /* =========================================================
     API URL
  ========================================================= */

  /* =========================================================
     MESSAGE
  ========================================================= */

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });

    window.clearTimeout(showMessage.timer);

    showMessage.timer =
      window.setTimeout(() => {
        setMessage({
          type: "",
          text: "",
        });
      }, 4000);
  };

  /* =========================================================
     API ERROR
  ========================================================= */

  const getApiErrorMessage = (error) => {
    const detail =
      error?.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg || item)
        .filter(Boolean)
        .join(", ");
    }

    if (typeof detail === "string") {
      return detail;
    }

    return (
      error?.response?.data?.message ||
      error?.message ||
      tr(
        "alumni.operationFailed",
        "Something went wrong. Please try again.",
        "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្ដងទៀត។"
      )
    );
  };

  /* =========================================================
     FETCH ALUMNI
  ========================================================= */

  const fetchAlumni =
    useCallback(async () => {
      try {
        setLoading(true);
        const minDelay = new Promise((resolve) => setTimeout(resolve, 500));

        const [response] = await Promise.all([
          api.get("/api/alumni/admin/all", {
            params: {
              skip: 0,
              limit: 200,
            },
          }),
          minDelay,
        ]);

        if (process.env.NODE_ENV !== "production") {
          console.log(
            "ALUMNI RESPONSE:",
            response.data
          );
        }

        const data =
          Array.isArray(response.data)
            ? response.data
            : Array.isArray(
                response.data?.items
              )
            ? response.data.items
            : [];

        if (process.env.NODE_ENV !== "production") {
          console.log(
            "ALUMNI API ITEM:",
            data[0]
          );
        }

        setAlumni(data);
      } catch (error) {
        console.error(
          "Fetch alumni error:",
          {
            message: error?.message,
            code: error?.code,
            method: error?.config?.method,
            baseURL: error?.config?.baseURL,
            url: error?.config?.url,
            finalURL: `${error?.config?.baseURL || ""}${error?.config?.url || ""}`,
            status: error?.response?.status,
            response: error?.response?.data,
          }
        );

        showMessage(
          "error",
          getApiErrorMessage(error)
        );

        setAlumni([]);
      } finally {
        setLoading(false);
      }
    // The fetch callback intentionally runs only from the mount effect and
    // from explicit create/update/delete refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  /* =========================================================
     FILTER ALUMNI
  ========================================================= */

  const filteredAlumni = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return alumni.filter((item) => {
      const searchableText = [
        item.name_en,
        item.name_km,
        item.role_en,
        item.role_km,
        item.company_en,
        item.company_km,
        item.graduation_year,
      ]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined
        )
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        keyword === "" ||
        searchableText.includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          item.is_active) ||
        (statusFilter === "inactive" &&
          !item.is_active);

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" &&
          item.is_featured) ||
        (featuredFilter === "regular" &&
          !item.is_featured);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFeatured
      );
    });
  }, [
    alumni,
    search,
    statusFilter,
    featuredFilter,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    return {
      total: alumni.length,

      active: alumni.filter(
        (item) => item.is_active
      ).length,

      featured: alumni.filter(
        (item) => item.is_featured
      ).length,

      inactive: alumni.filter(
        (item) => !item.is_active
      ).length,
    };
  }, [alumni]);

  /* =========================================================
     IMAGE PREVIEW
  ========================================================= */

  const clearImagePreview = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImagePreview("");
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    clearImagePreview();

    setFormData(EMPTY_FORM);

    setEditingId(null);

    setShowForm(false);
  };

  /* =========================================================
     CREATE FORM
  ========================================================= */

  const openCreateForm = () => {
    clearImagePreview();

    setFormData(EMPTY_FORM);

    setEditingId(null);

    setShowForm(true);
  };

  /* =========================================================
     EDIT FORM
  ========================================================= */

  const openEditForm = (item) => {
    clearImagePreview();

    setEditingId(item.id);

    setFormData({
      name_en:
        item.name_en || "",

      name_km:
        item.name_km || "",

      role_en:
        item.role_en || "",

      role_km:
        item.role_km || "",

      company_en:
        item.company_en || "",

      company_km:
        item.company_km || "",

      story_en:
        item.story_en || "",

      story_km:
        item.story_km || "",

      image_url:
        item.image_url || "",

      graduation_year:
        item.graduation_year !== null &&
        item.graduation_year !== undefined
          ? String(
              item.graduation_year
            )
          : "",

      is_featured:
        Boolean(item.is_featured),

      is_active:
        item.is_active === undefined
          ? true
          : Boolean(item.is_active),

      order:
        item.sort_order !== null &&
        item.sort_order !== undefined
          ? Number(item.sort_order)
          : 0,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageUpload =
    async (event) => {
      const input =
        event.target;

      const file =
        input.files?.[0];

      if (!file) return;

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        showMessage(
          "error",

          isKhmer
            ? "អនុញ្ញាតតែរូបភាព JPG, PNG និង WEBP ប៉ុណ្ណោះ។"
            : "Only JPG, PNG and WEBP images are allowed."
        );

        input.value = "";

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        showMessage(
          "error",

          isKhmer
            ? "ទំហំរូបភាពមិនត្រូវលើសពី 5MB។"
            : "Image size must not exceed 5 MB."
        );

        input.value = "";

        return;
      }

      clearImagePreview();

      const temporaryPreview =
        URL.createObjectURL(file);

      setImagePreview(
        temporaryPreview
      );

      const uploadData =
        new FormData();

      uploadData.append(
        "file",
        file
      );

      try {
        setUploadingImage(true);

        const response =
          await api.post(
            "/api/alumni/upload",
            uploadData
          );

        const uploadedPath =
          response.data?.path ||
          response.data?.url;

        if (!uploadedPath) {
          throw new Error(
            "Backend did not return an image path."
          );
        }

        URL.revokeObjectURL(
          temporaryPreview
        );

        setFormData(
          (previous) => ({
            ...previous,
            image_url: uploadedPath,
          })
        );

        setImagePreview(
          getImageUrl(uploadedPath)
        );

        showMessage(
          "success",

          isKhmer
            ? "បានបញ្ចូលរូបភាពដោយជោគជ័យ។"
            : "Image uploaded successfully."
        );
      } catch (error) {
        console.error(
          "Upload alumni image error:",
          {
            message: error?.message,
            method: error?.config?.method,
            baseURL: error?.config?.baseURL,
            url: error?.config?.url,
            status: error?.response?.status,
            data: error?.response?.data,
          }
        );

        clearImagePreview();

        showMessage(
          "error",
          getApiErrorMessage(error)
        );
      } finally {
        setUploadingImage(false);

        input.value = "";
      }
    };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeSelectedImage =
    () => {
      clearImagePreview();

      setFormData(
        (previous) => ({
          ...previous,
          image_url: "",
        })
      );
    };

  /* =========================================================
     BUILD PAYLOAD
  ========================================================= */

  const buildPayload = () => {
    const nameEn =
      formData.name_en.trim() ||
      formData.name_km.trim();

    return {
      name_en:
        nameEn,

      name_km:
        formData.name_km.trim() ||
        null,

      role_en:
        formData.role_en.trim() ||
        null,

      role_km:
        formData.role_km.trim() ||
        null,

      company_en:
        formData.company_en.trim() ||
        null,

      company_km:
        formData.company_km.trim() ||
        null,

      story_en:
        formData.story_en.trim() ||
        null,

      story_km:
        formData.story_km.trim() ||
        null,

      image_url:
        formData.image_url.trim() ||
        null,

      graduation_year:
        formData.graduation_year === ""
          ? null
          : Number(
              formData.graduation_year
            ),

      is_featured:
        Boolean(
          formData.is_featured
        ),

      is_active:
        Boolean(
          formData.is_active
        ),

      sort_order:
        Number(
          formData.order
        ) || 0,
    };
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const nameEn =
      formData.name_en.trim() ||
      formData.name_km.trim();

    if (
      nameEn.length < 2
    ) {
      showMessage(
        "error",

        isKhmer
          ? "សូមបញ្ចូលឈ្មោះសិស្សយ៉ាងហោចណាស់ ២ តួអក្សរ។"
          : "Student name must have at least 2 characters."
      );

      return false;
    }

    if (
      formData.graduation_year !==
        "" &&
      (!Number.isInteger(
        Number(
          formData.graduation_year
        )
      ) ||
        Number(
          formData.graduation_year
        ) < 1900 ||
        Number(
          formData.graduation_year
        ) > 2100)
    ) {
      showMessage(
        "error",

        isKhmer
          ? "ឆ្នាំសិក្សាត្រូវស្ថិតចន្លោះឆ្នាំ 1900 និង 2100។"
          : "Study year must be between 1900 and 2100."
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        setSaving(true);

        const payload =
          buildPayload();

        if (process.env.NODE_ENV !== "production") {
          console.log(
            "ALUMNI PAYLOAD:",
            payload
          );
        }

        if (editingId) {
          await api.put(
            `/api/alumni/${editingId}`,
            payload
          );

          showMessage(
            "success",

            isKhmer
              ? "បានកែប្រែព័ត៌មានសិស្សដោយជោគជ័យ។"
              : "Student information updated successfully."
          );
        } else {
          await api.post(
            "/api/alumni/",
            payload
          );

          showMessage(
            "success",

            isKhmer
              ? "បានបង្កើតព័ត៌មានសិស្សដោយជោគជ័យ។"
              : "Student information created successfully."
          );
        }

        resetForm();

        await fetchAlumni();
      } catch (error) {
        console.error(
          "Save alumni error:",
          {
            message: error?.message,
            method: error?.config?.method,
            baseURL: error?.config?.baseURL,
            url: error?.config?.url,
            status: error?.response?.status,
            data: error?.response?.data,
          }
        );

        showMessage(
          "error",
          getApiErrorMessage(error)
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete =
    async (item) => {
      const displayName =
        localized(
          item,
          "name",
          item.name_en ||
            item.name_km ||
            ""
        ) ||
        (isKhmer
          ? "សិស្សនេះ"
          : "this student");

      const confirmed =
        window.confirm(
          isKhmer
            ? `តើអ្នកប្រាកដថាចង់លុប "${displayName}" មែនទេ?`
            : `Delete "${displayName}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(item.id);

        await api.delete(
          `/api/alumni/${item.id}`
        );

        showMessage(
          "success",

          isKhmer
            ? "បានលុបព័ត៌មានសិស្សដោយជោគជ័យ។"
            : "Student deleted successfully."
        );

        await fetchAlumni();
      } catch (error) {
        console.error(
          "Delete alumni error:",
          {
            message: error?.message,
            method: error?.config?.method,
            baseURL: error?.config?.baseURL,
            url: error?.config?.url,
            status: error?.response?.status,
            data: error?.response?.data,
          }
        );

        showMessage(
          "error",
          getApiErrorMessage(error)
        );
      } finally {
        setDeletingId(null);
      }
    };

  /* =========================================================
     QUICK UPDATE
  ========================================================= */

  const handleQuickUpdate =
    async (item, field) => {
      try {
        const payload = {
          [field]:
            !item[field],
        };

        await api.put(
          `/api/alumni/${item.id}`,
          payload
        );

        setAlumni(
          (previous) =>
            previous.map(
              (record) =>
                record.id ===
                item.id
                  ? {
                      ...record,
                      ...payload,
                    }
                  : record
            )
        );

        showMessage(
          "success",

          field === "is_active"
            ? isKhmer
              ? "បានធ្វើបច្ចុប្បន្នភាពស្ថានភាព។"
              : "Status updated."
            : isKhmer
            ? "បានធ្វើបច្ចុប្បន្នភាពការបង្ហាញពិសេស។"
            : "Featured status updated."
        );
      } catch (error) {
        console.error(
          "Quick update alumni error:",
          error
        );

        showMessage(
          "error",
          getApiErrorMessage(error)
        );
      }
    };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className={`w-full min-h-screen p-6 bg-[#F0F7FF] ${
        isKhmer
          ? "font-khmer"
          : "font-english"
      }`}
    >
      <div className="w-full max-w-[1450px] mx-auto">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-[#0D1B3E] text-white flex items-center justify-center shadow-md flex-shrink-0">
              <FiAward size={22} />
            </div>

            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-[#0D1B3E] leading-tight">
                {isKhmer
                  ? "គ្រប់គ្រងព័ត៌មានសិស្ស"
                  : "Student Management"}
              </h1>

              <p className="text-sm text-[#6B8AFF] mt-0.5">
                {isKhmer
                  ? "បង្កើត កែប្រែ និងគ្រប់គ្រងព័ត៌មាន និងចំណាប់អារម្មណ៍របស់សិស្ស SC Academy។"
                  : "Create, update and manage SC Academy student profiles and testimonials."}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              openCreateForm
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#C23636] text-white px-5 text-sm font-semibold shadow-sm transition hover:bg-[#A92E2E]"
          >
            <FiPlus size={18} />

            {isKhmer
              ? "បន្ថែមសិស្ស"
              : "Add Student"}
          </button>

        </div>

        {/* ================= MESSAGE ================= */}

        {message.text && (
          <div
            className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${
              message.type ===
              "success"
                ? "border-[#EBF9F0] bg-[#EBF9F0] text-[#2E7D32]"
                : "border-[#FFEBEE] bg-[#FFEBEE] text-[#C62828]"
            }`}
          >
            <div className="flex items-center gap-2">

              {message.type ===
              "success" ? (
                <FiCheck
                  size={18}
                />
              ) : (
                <FiX
                  size={18}
                />
              )}

              {message.text}

            </div>

            <button
              type="button"
              onClick={() =>
                setMessage({
                  type: "",
                  text: "",
                })
              }
              className="p-1 rounded-md transition hover:bg-black/5"
            >
              <FiX size={18} />
            </button>

          </div>
        )}

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          {[
            {
              title:
                isKhmer
                  ? "សិស្សសរុប"
                  : "Total Students",

              value:
                stats.total,

              icon:
                FiUser,
            },

            {
              title:
                isKhmer
                  ? "សិស្សសកម្ម"
                  : "Active Students",

              value:
                stats.active,

              icon:
                FiCheck,
            },

            {
              title:
                isKhmer
                  ? "សិស្សអសកម្ម"
                  : "Inactive Students",

              value:
                stats.inactive,

              icon:
                FiX,
            },
          ].map((stat) => {

            const Icon =
              stat.icon;

            return (
              <div
                key={
                  stat.title
                }
                className="bg-white rounded-xl border border-[#F0F4FB] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-sm text-[#6B8AFF]">
                      {
                        stat.title
                      }
                    </p>

                    <p className="text-2xl font-bold text-[#0D1B3E] mt-1">
                      {
                        stat.value
                      }
                    </p>

                  </div>

                  <div className="h-10 w-10 rounded-xl bg-[#F0F7FF] text-[#0D1B3E] flex items-center justify-center">

                    <Icon
                      size={18}
                    />

                  </div>

                </div>
              </div>
            );
          })}

        </div>

        {/* ================= MODAL ================= */}
        <AdminModal
          isOpen={showForm}
          onClose={resetForm}
          title={
            editingId
              ? isKhmer
                ? "កែប្រែព័ត៌មានសិស្ស"
                : "Edit Student"
              : isKhmer
              ? "បង្កើតព័ត៌មានសិស្ស"
              : "Add New Student"
          }
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* STUDENT NAME */}
              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer ? "ឈ្មោះសិស្ស" : "Student Name"}
                  <span className="text-[#C23636] ml-1">*</span>
                </label>
                <input
                  type="text"
                  name={fieldNames.name}
                  value={formData[fieldNames.name]}
                  onChange={handleChange}
                  placeholder={
                    isKhmer ? "ឧ. សុខ ចាន់ថន" : "e.g. Sok Chanthon"
                  }
                  required
                  className="w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition"
                />
              </div>

              {/* COURSE STUDIED */}
              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer ? "វគ្គសិក្សាដែលបានរៀន" : "Course Studied"}
                  <span className="text-[#C23636] ml-1">*</span>
                </label>
                <input
                  type="text"
                  name={fieldNames.role}
                  value={formData[fieldNames.role]}
                  onChange={handleChange}
                  placeholder={
                    isKhmer
                      ? "ឧ. វគ្គ Full Stack Web Development"
                      : "e.g. Full Stack Web Development"
                  }
                  className="w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition"
                />
              </div>

              {/* CURRENT JOB & STUDY YEAR GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                    {isKhmer
                      ? "ការងារ ឬស្ថាប័នបច្ចុប្បន្ន"
                      : "Current Job / Workplace"}
                  </label>
                  <input
                    type="text"
                    name={fieldNames.company}
                    value={formData[fieldNames.company]}
                    onChange={handleChange}
                    placeholder={
                      isKhmer
                        ? "ឧ. Web Developer នៅក្រុមហ៊ុន ABC"
                        : "e.g. Web Developer at ABC Co."
                    }
                    className="w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                    {isKhmer ? "ឆ្នាំបញ្ចប់ការសិក្សា" : "Graduation Year"}
                  </label>
                  <input
                    type="number"
                    name="graduation_year"
                    min="1900"
                    max="2100"
                    value={formData.graduation_year}
                    onChange={handleChange}
                    placeholder="2025"
                    className="w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition"
                  />
                </div>
              </div>

              {/* STUDENT PHOTO UPLOAD */}
              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer ? "រូបថតសិស្ស" : "Student Photo"}
                </label>

                {!formData.image_url && !imagePreview ? (
                  <label className="min-h-[140px] border-2 border-dashed border-[#E8EEF9] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-[#F0F7FF] hover:border-[#0D1B3E] transition p-5 text-center block">
                    <input
                      id="alumni-image"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#0D1B3E] border border-[#E8EEF9] mb-3 shadow-xs mx-auto">
                      {uploadingImage ? (
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8EEF9] border-t-[#0D1B3E]" />
                      ) : (
                        <FiUploadCloud size={23} />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#0D1B3E]">
                      {uploadingImage
                        ? isKhmer
                          ? "កំពុងបញ្ចូលរូបភាព..."
                          : "Uploading..."
                        : isKhmer
                        ? "ចុចដើម្បីជ្រើសរើសរូបថតសិស្ស"
                        : "Click to select student photo"}
                    </p>
                    <p className="text-xs text-[#6B8AFF] mt-1">
                      JPG, PNG, WEBP — Max 5MB
                    </p>
                  </label>
                ) : (
                  <div className="relative h-[200px] rounded-xl overflow-hidden border border-[#E8EEF9] bg-[#F0F7FF] group">
                    <img
                      src={
                        imagePreview ||
                        getImageUrl(formData.image_url)
                      }
                      alt="Student"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-[#C23636] text-white flex items-center justify-center hover:bg-[#A92E2E] shadow"
                    >
                      <FiTrash2 size={16} />
                    </button>

                    <label className="absolute bottom-3 right-3 h-9 px-3 bg-white text-[#0D1B3E] rounded-lg text-xs font-semibold shadow hover:bg-slate-50 cursor-pointer inline-flex items-center">
                      <span>{isKhmer ? "ប្ដូររូបភាព" : "Change Photo"}</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* TESTIMONIAL / STORY */}
              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer
                    ? "ចំណាប់អារម្មណ៍ ឬរឿងរ៉ាវជោគជ័យ"
                    : "Student Testimonial / Story"}
                </label>
                <textarea
                  name={fieldNames.story}
                  rows={3}
                  value={formData[fieldNames.story]}
                  onChange={handleChange}
                  placeholder={
                    isKhmer
                      ? "សរសេរចំណាប់អារម្មណ៍ ឬបទពិសោធន៍រៀននៅ SC Academy..."
                      : "Write the student's learning experience or testimonial..."
                  }
                  className="w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition resize-none"
                />
              </div>

              {/* ACTIVE SWITCH */}
              <label className="flex items-center justify-between gap-3 p-4 border border-[#E8EEF9] rounded-xl bg-white cursor-pointer hover:bg-[#F0F7FF] transition">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      formData.is_active
                        ? "bg-[#EBF9F0] text-[#2E7D32]"
                        : "bg-[#F0F7FF] text-[#6B8AFF]"
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
                      {isKhmer ? "សិស្សសកម្ម" : "Active Student"}
                    </p>
                    <p className="text-xs text-[#6B8AFF]">
                      {isKhmer
                        ? "បង្ហាញព័ត៌មានសិស្សនេះនៅលើគេហទំព័រ"
                        : "Show student profile on website"}
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#0D1B3E]"
                />
              </label>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6 pt-4 border-t border-[#E8EEF9] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving || uploadingImage}
                className="h-10 px-4 bg-white border border-[#E8EEF9] text-[#6B8AFF] rounded-lg text-sm font-semibold hover:bg-[#F0F7FF] disabled:opacity-50 transition"
              >
                {isKhmer ? "បោះបង់" : "Cancel"}
              </button>

              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="min-w-[140px] h-10 px-5 bg-[#C23636] text-white rounded-lg text-sm font-semibold hover:bg-[#A92E2E] disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
              >
                {saving || uploadingImage ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {isKhmer ? "កំពុងរក្សាទុក..." : "Saving..."}
                  </>
                ) : editingId ? (
                  <>
                    <FiEdit2 size={15} />
                    {isKhmer ? "រក្សាទុកការកែប្រែ" : "Update Student"}
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    {isKhmer ? "រក្សាទុកព័ត៌មានសិស្ស" : "Save Student"}
                  </>
                )}
              </button>
            </div>
          </form>
        </AdminModal>

        {/* ================= FILTERS ================= */}

        <div className="mb-6 bg-white border border-[#F0F4FB] rounded-xl p-4 shadow-sm">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_auto]">

            <div className="relative">

              <FiSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8AFF]"
              />

              <input
                type="search"
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder={
                  isKhmer
                    ? "ស្វែងរកសិស្ស..."
                    : "Search students..."
                }
                className="h-[42px] w-full rounded-lg border border-[#E8EEF9] bg-[#F0F7FF] pl-9 pr-3 text-sm outline-none transition focus:border-[#0D1B3E] focus:bg-white focus:ring-1 focus:ring-[#0D1B3E]"
              />

            </div>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
              className="h-[42px] rounded-lg border border-[#E8EEF9] bg-[#F0F7FF] px-3 text-sm font-semibold text-[#0D1B3E] outline-none"
            >

              <option value="all">
                {isKhmer
                  ? "ស្ថានភាពទាំងអស់"
                  : "All Status"}
              </option>

              <option value="active">
                {isKhmer
                  ? "សកម្ម"
                  : "Active"}
              </option>

              <option value="inactive">
                {isKhmer
                  ? "អសកម្ម"
                  : "Inactive"}
              </option>

            </select>

            <button
              type="button"
              onClick={
                fetchAlumni
              }
              disabled={
                loading
              }
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg border border-[#E8EEF9] bg-white px-4 text-xs font-bold text-[#0D1B3E]"
            >

              <FiRefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              {isKhmer
                ? "ផ្ទុកឡើងវិញ"
                : "Refresh"}

            </button>

          </div>

        </div>

        {/* ================= LIST ================= */}

        <div className="bg-white border border-[#F0F4FB] rounded-xl shadow-sm overflow-hidden">

          <div className="flex flex-col gap-2 border-b border-[#E8EEF9] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-[#C23636]">

                {isKhmer
                  ? "បញ្ជីសិស្ស"
                  : "Student Directory"}

              </p>

              <h2 className="text-lg font-bold text-[#0D1B3E] mt-0.5">

                {isKhmer
                  ? "ព័ត៌មានសិស្ស"
                  : "Student Records"}

              </h2>

            </div>

            <p className="text-xs font-semibold text-[#6B8AFF]">

              {isKhmer
                ? `កំពុងបង្ហាញ ${filteredAlumni.length} ក្នុងចំណោម ${alumni.length}`
                : `Showing ${filteredAlumni.length} of ${alumni.length}`}

            </p>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="flex min-h-[280px] items-center justify-center">

              <div className="text-center">

                <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-4 border-[#F0F7FF] border-t-[#0D1B3E]" />

                <p className="mt-3 text-sm font-semibold text-[#6B8AFF]">

                  {isKhmer
                    ? "កំពុងផ្ទុកព័ត៌មានសិស្ស..."
                    : "Loading students..."}

                </p>

              </div>

            </div>

          ) : filteredAlumni.length ===
            0 ? (

            /* EMPTY */

            <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F7FF] text-[#0D1B3E]">

                <FiAward
                  size={28}
                />

              </div>

              <h3 className="mt-4 text-lg font-bold text-[#0D1B3E]">

                {isKhmer
                  ? "រកមិនឃើញព័ត៌មានសិស្ស"
                  : "No Students Found"}

              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#6B8AFF]">

                {isKhmer
                  ? "សូមបន្ថែមព័ត៌មានសិស្សដំបូង ឬកែប្រែតម្រងស្វែងរក។"
                  : "Add the first student or change your filters."}

              </p>

              <button
                type="button"
                onClick={
                  openCreateForm
                }
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#C23636] px-5 text-sm font-bold text-white"
              >

                <FiPlus
                  size={18}
                />

                {isKhmer
                  ? "បន្ថែមសិស្ស"
                  : "Add Student"}

              </button>

            </div>

          ) : (

            <>

              {/* ================= DESKTOP TABLE ================= */}

              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full min-w-[1050px] border-collapse">

                  <thead>

                    <tr className="bg-[#F0F7FF] text-left">

                      {[
                        isKhmer
                          ? "សិស្ស"
                          : "Student",

                        isKhmer
                          ? "វគ្គសិក្សា និងស្ថាប័ន"
                          : "Course & Institution",

                        isKhmer
                          ? "ឆ្នាំសិក្សា"
                          : "Study Year",

                        isKhmer
                          ? "ស្ថានភាព"
                          : "Status",

                        isKhmer
                          ? "សកម្មភាព"
                          : "Actions",
                      ].map(
                        (
                          heading
                        ) => (

                          <th
                            key={
                              heading
                            }
                            className="border-b border-[#E8EEF9] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B8AFF]"
                          >
                            {
                              heading
                            }
                          </th>

                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {filteredAlumni.map(
                      (item) => (

                        <tr
                          key={
                            item.id
                          }
                          className="border-b border-[#F0F4FB] transition last:border-b-0 hover:bg-[#F0F7FF]/50"
                        >

                          {/* STUDENT */}

                          <td className="px-5 py-4">

                            <div className="flex min-w-[230px] items-center gap-3">

                              <div className="relative h-12 w-12 flex-none overflow-hidden rounded-xl bg-[#F0F7FF]">

                                {item.image_url && (

                                   <img
                                     src={getImageUrl(
                                       item.image_url
                                     )}
                                     alt={localized(
                                       item,
                                       "name",
                                       "Student"
                                     )}
                                     className="absolute inset-0 z-10 h-full w-full object-cover"
                                     onError={(
                                       event
                                     ) => {
                                       if (
                                         !event.currentTarget.dataset.fallbackApplied
                                       ) {
                                         event.currentTarget.dataset.fallbackApplied =
                                           "true";
                                         event.currentTarget.src =
                                           "/default-avatar.png";
                                       }
                                     }}
                                   />

                                )}

                                <div className="absolute inset-0 flex items-center justify-center text-[#6B8AFF]">

                                  <FiUser
                                    size={20}
                                  />

                                </div>

                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-[#0D1B3E]">

                                  {localized(
                                    item,
                                    "name",
                                    "—"
                                  )}

                                </p>

                                <p className="mt-1 truncate text-xs text-[#6B8AFF]">

                                  {isKhmer
                                    ? item.name_en ||
                                      "—"
                                    : item.name_km ||
                                      "—"}

                                </p>

                              </div>

                            </div>

                          </td>

                          {/* COURSE */}

                          <td className="px-5 py-4">

                            <div className="max-w-[260px]">

                              <p className="truncate text-xs font-semibold text-[#0D1B3E]">

                                {localized(
                                  item,
                                  "role",
                                  "—"
                                )}

                              </p>

                              <p className="mt-1 truncate text-xs text-[#6B8AFF]">

                                {localized(
                                  item,
                                  "company",
                                  "—"
                                )}

                              </p>

                            </div>

                          </td>

                          {/* YEAR */}

                          <td className="px-5 py-4 text-xs font-semibold text-[#0D1B3E]">

                            {item.graduation_year ||
                              "—"}

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <button
                              type="button"
                              onClick={() =>
                                handleQuickUpdate(
                                  item,
                                  "is_active"
                                )
                              }
                              className={`inline-flex h-8 items-center rounded-full px-3 text-[10px] font-bold ${
                                item.is_active
                                  ? "bg-[#EBF9F0] text-[#2E7D32]"
                                  : "bg-[#FFEBEE] text-[#C62828]"
                              }`}
                            >

                              {item.is_active
                                ? isKhmer
                                  ? "សកម្ម"
                                  : "Active"
                                : isKhmer
                                ? "អសកម្ម"
                                : "Inactive"}

                            </button>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(
                                    item
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0F7FF] text-[#0D1B3E] transition hover:bg-[#0D1B3E] hover:text-white"
                                title={
                                  isKhmer
                                    ? "កែប្រែ"
                                    : "Edit"
                                }
                              >

                                <FiEdit2
                                  size={15}
                                />

                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    item
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  item.id
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFEBEE] text-[#C62828] transition hover:bg-[#C62828] hover:text-white disabled:opacity-60"
                                title={
                                  isKhmer
                                    ? "លុប"
                                    : "Delete"
                                }
                              >

                                {deletingId ===
                                item.id ? (

                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />

                                ) : (

                                  <FiTrash2
                                    size={15}
                                  />

                                )}

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* ================= MOBILE ================= */}

              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">

                {filteredAlumni.map(
                  (item) => (

                    <div
                      key={
                        item.id
                      }
                      className="overflow-hidden rounded-xl border border-[#F0F4FB] bg-white shadow-sm"
                    >

                      <div className="relative h-[210px] bg-[#F0F7FF]">

                        {item.image_url ? (

                          <img
                            src={getImageUrl(
                              item.image_url
                            )}
                            alt={localized(
                              item,
                              "name",
                              "Student"
                            )}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              console.error(
                                "ALUMNI IMAGE FAILED:",
                                event.currentTarget.src
                              );

                              if (
                                !event.currentTarget.dataset.fallbackApplied
                              ) {
                                event.currentTarget.dataset.fallbackApplied =
                                  "true";
                                event.currentTarget.src =
                                  "/default-avatar.png";
                              }
                            }}
                          />

                        ) : (

                          <div className="flex h-full items-center justify-center text-[#E8EEF9]">

                            <FiUser
                              size={44}
                            />

                          </div>

                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B3E]/80 via-transparent to-transparent" />

                        <div className="absolute left-3 top-3 flex gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[9px] font-bold text-white ${
                              item.is_active
                                ? "bg-[#2E7D32]"
                                : "bg-[#C62828]"
                            }`}
                          >

                            {item.is_active
                              ? isKhmer
                                ? "សកម្ម"
                                : "Active"
                              : isKhmer
                              ? "អសកម្ម"
                              : "Inactive"}

                          </span>

                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-4 text-white">

                          <h3 className="text-base font-bold">

                            {localized(
                              item,
                              "name",
                              isKhmer
                                ? "សិស្ស"
                                : "Student"
                            )}

                          </h3>

                          <p className="mt-1 text-xs text-white/80">

                            {isKhmer
                              ? item.name_en ||
                                ""
                              : item.name_km ||
                                ""}

                          </p>

                        </div>

                      </div>

                      <div className="p-4">

                        <p className="text-xs font-semibold text-[#C23636]">

                          {localized(
                            item,
                            "role",
                            "—"
                          )}

                        </p>

                        <p className="mt-1 text-xs text-[#6B8AFF]">

                          {localized(
                            item,
                            "company",
                            "—"
                          )}

                        </p>

                        <div className="mt-4 flex items-center justify-between border-t border-[#E8EEF9] pt-4">

                          <span className="text-[10px] font-semibold text-[#6B8AFF]">

                            {isKhmer
                              ? "ឆ្នាំសិក្សា"
                              : "Study Year"}
                            :{" "}
                            {item.graduation_year ||
                              "—"}

                          </span>

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  item
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0F7FF] text-[#0D1B3E]"
                            >

                              <FiEdit2
                                size={15}
                              />

                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  item
                                )
                              }
                              disabled={
                                deletingId ===
                                item.id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFEBEE] text-[#C62828] disabled:opacity-60"
                            >

                              {deletingId ===
                              item.id ? (

                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />

                              ) : (

                                <FiTrash2
                                  size={15}
                                />

                              )}

                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </>

          )}

        </div>

      </div>
    </div>
  );
};

/* =========================================================
   INPUT FIELD
========================================================= */

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  min,
  max,
  wrapperClassName = "",
}) => {
  return (
    <div className={wrapperClassName}>

      <label
        htmlFor={name}
        className="mb-1.5 block text-[11px] font-bold text-[#0D1B3E]"
      >

        {label}

        {required && (
          <span className="ml-1 text-[#C23636]">
            *
          </span>
        )}

      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className="h-[44px] w-full rounded-lg border border-[#E8EEF9] bg-[#F0F7FF] px-3 text-sm text-[#0D1B3E] outline-none transition placeholder:text-[#6B8AFF] focus:border-[#0D1B3E] focus:bg-white focus:ring-1 focus:ring-[#0D1B3E]"
      />

    </div>
  );
};

/* =========================================================
   TEXTAREA
========================================================= */

const TextareaField = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  wrapperClassName = "",
}) => {
  return (
    <div className={wrapperClassName}>

      <label
        htmlFor={name}
        className="mb-1.5 block text-[11px] font-bold text-[#0D1B3E]"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={5}
        placeholder={placeholder}
        className="min-h-[130px] w-full resize-y rounded-lg border border-[#E8EEF9] bg-[#F0F7FF] px-3 py-3 text-sm leading-6 text-[#0D1B3E] outline-none transition placeholder:text-[#6B8AFF] focus:border-[#0D1B3E] focus:bg-white focus:ring-1 focus:ring-[#0D1B3E]"
      />

    </div>
  );
};

/* =========================================================
   CHECKBOX
========================================================= */

const CheckboxField = ({
  label,
  name,
  checked,
  onChange,
}) => {
  return (
    <label
      htmlFor={name}
      className="flex cursor-pointer items-center justify-between gap-4"
    >

      <span className="text-xs font-bold text-[#0D1B3E]">
        {label}
      </span>

      <span className="relative inline-flex">

        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />

        <span className="h-6 w-11 rounded-full bg-[#E8EEF9] transition peer-checked:bg-[#0D1B3E]" />

        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />

      </span>

    </label>
  );
};

export default AdminAlumni;
