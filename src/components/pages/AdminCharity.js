import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FiCheck,
  FiEdit2,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUploadCloud,
  FiX,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

import api, { getApiErrorMessage } from "../../services/api";
import { useLanguage } from "../../contexts/LanguageContext";
import { getImageUrl } from "../../utils/helpers";
import AdminModal from "../common/AdminModal";

const INITIAL_IMAGE_FORM = {
  title_en: "",
  title_km: "",
  description_en: "",
  description_km: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

const AdminCharity = () => {
  const { t, language } = useLanguage();
  const isKhmer = language === "km" || language === "kh";
  const suffix = isKhmer ? "km" : "en";

  const [images, setImages] = useState([]);
  const [imageForm, setImageForm] = useState(INITIAL_IMAGE_FORM);

  const [loadingImages, setLoadingImages] = useState(true);
  const [savingImage, setSavingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showImageForm, setShowImageForm] = useState(false);
  const [editingImageId, setEditingImageId] = useState(null);
  const [search, setSearch] = useState("");

  const tr = (key, english, khmer) => {
    const translated = typeof t === "function" ? t(key) : "";

    if (
      translated &&
      translated !== key &&
      !String(translated).includes("undefined")
    ) {
      return translated;
    }

    return isKhmer ? khmer : english;
  };

  const localized = (item, field, fallback = "") => {
    const selected = item?.[`${field}_${suffix}`];

    if (
      selected !== undefined &&
      selected !== null &&
      String(selected).trim() !== ""
    ) {
      return selected;
    }

    return fallback;
  };

  const apiError = (error, fallback) => {
    if (typeof getApiErrorMessage === "function") {
      return getApiErrorMessage(error, fallback);
    }

    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg || item)
        .filter(Boolean)
        .join(", ");
    }

    return error?.response?.data?.message || error?.message || fallback;
  };


  const fetchImages = useCallback(async () => {
    try {
      setLoadingImages(true);
      const minDelay = new Promise((resolve) => setTimeout(resolve, 500));

      const [response] = await Promise.all([
        api.get("/api/charity/images/admin/all", {
          params: {
            skip: 0,
            limit: 200,
          },
        }),
        minDelay,
      ]);

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.items)
        ? response.data.items
        : [];

      setImages(data);
    } catch (error) {
      console.error("Fetch charity images error:", error);

      toast.error(
        apiError(
          error,
          tr(
            "charity.imagesLoadFailed",
            "Failed to load charity images.",
            "មិនអាចទាញយករូបភាពសប្បុរសធម៌បានទេ។"
          )
        )
      );

      setImages([]);
    } finally {
      setLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const filteredImages = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return images;

    return images.filter((item) =>
      [
        item.title_en,
        item.title_km,
        item.description_en,
        item.description_km,
        item.sort_order,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [images, search]);


  const handleImageFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setImageForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const resetImageForm = () => {
    setImageForm(INITIAL_IMAGE_FORM);
    setEditingImageId(null);
    setShowImageForm(false);
  };

  const openCreateImage = () => {
    setImageForm(INITIAL_IMAGE_FORM);
    setEditingImageId(null);
    setShowImageForm(true);
  };

  const openEditImage = (item) => {
    setImageForm({
      title_en: item.title_en || "",
      title_km: item.title_km || "",
      description_en: item.description_en || "",
      description_km: item.description_km || "",
      image_url: item.image_url || "",
      sort_order:
        item.sort_order !== undefined && item.sort_order !== null
          ? Number(item.sort_order)
          : 0,
      is_active:
        item.is_active === undefined ? true : Boolean(item.is_active),
    });

    setEditingImageId(item.id);
    setShowImageForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const uploadImageFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        tr(
          "charity.invalidImage",
          "Only JPG, PNG and WEBP images are allowed.",
          "អនុញ្ញាតតែរូបភាព JPG, PNG និង WEBP ប៉ុណ្ណោះ។"
        )
      );
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        tr(
          "charity.imageTooLarge",
          "Image size must not exceed 5 MB.",
          "ទំហំរូបភាពមិនត្រូវលើសពី 5MB។"
        )
      );
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingImage(true);

      const response = await api.post(
        "/api/charity/images/upload",
        formData
      );

      const imagePath = response.data?.path || response.data?.url;

      if (!imagePath) {
        throw new Error("Backend did not return image path.");
      }

      setImageForm((current) => ({
        ...current,
        image_url: imagePath,
      }));

      toast.success(
        tr(
          "charity.imageUploaded",
          "Image uploaded successfully.",
          "បាន Upload រូបភាពដោយជោគជ័យ។"
        )
      );
    } catch (error) {
      console.error("Upload charity image error:", error);

      toast.error(
        apiError(
          error,
          tr(
            "charity.uploadFailed",
            "Failed to upload image.",
            "មិនអាច Upload រូបភាពបានទេ។"
          )
        )
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const saveImage = async (event) => {
    event.preventDefault();

    if (!imageForm.image_url) {
      toast.error(
        tr(
          "charity.imageRequired",
          "Please upload an image.",
          "សូម Upload រូបភាព។"
        )
      );
      return;
    }

    const currentTitleField = `title_${suffix}`;
    const currentTitle = String(imageForm[currentTitleField] || "").trim();

    if (!currentTitle) {
      toast.error(
        isKhmer
          ? "សូមបញ្ចូលចំណងជើងរូបភាពសកម្មភាព។"
          : "Please enter the activity image title."
      );
      return;
    }

    const titleEn = imageForm.title_en?.trim() || currentTitle;
    const titleKm = imageForm.title_km?.trim() || currentTitle;
    const descEn = imageForm.description_en?.trim() || imageForm[`description_${suffix}`]?.trim() || "";
    const descKm = imageForm.description_km?.trim() || imageForm[`description_${suffix}`]?.trim() || "";

    try {
      setSavingImage(true);

      const payload = {
        title_en: titleEn,
        title_km: titleKm,
        description_en: descEn || null,
        description_km: descKm || null,
        image_url: imageForm.image_url,
        sort_order: Number(imageForm.sort_order) || 0,
        is_active: Boolean(imageForm.is_active),
      };

      if (editingImageId) {
        await api.put(
          `/api/charity/images/${editingImageId}`,
          payload
        );

        toast.success(
          tr(
            "charity.imageUpdated",
            "Charity image updated successfully.",
            "បានកែប្រែរូបភាពសប្បុរសធម៌ដោយជោគជ័យ។"
          )
        );
      } else {
        await api.post("/api/charity/images", payload);

        toast.success(
          tr(
            "charity.imageCreated",
            "Charity image added successfully.",
            "បានបន្ថែមរូបភាពសប្បុរសធម៌ដោយជោគជ័យ។"
          )
        );
      }

      resetImageForm();
      await fetchImages();
    } catch (error) {
      console.error("Save charity image error:", error);

      toast.error(
        apiError(
          error,
          tr(
            "charity.imageSaveFailed",
            "Failed to save charity image.",
            "មិនអាចរក្សាទុករូបភាពសប្បុរសធម៌បានទេ។"
          )
        )
      );
    } finally {
      setSavingImage(false);
    }
  };

  const deleteImage = async (item) => {
    const name =
      localized(item, "title") ||
      item.title_en ||
      item.title_km ||
      tr("charity.image", "this image", "រូបភាពនេះ");

    const confirmed = window.confirm(
      isKhmer
        ? `តើអ្នកប្រាកដថាចង់លុប "${name}" មែនទេ?`
        : `Delete "${name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);

      await api.delete(`/api/charity/images/${item.id}`);

      toast.success(
        tr(
          "charity.imageDeleted",
          "Charity image deleted successfully.",
          "បានលុបរូបភាពសប្បុរសធម៌ដោយជោគជ័យ។"
        )
      );

      await fetchImages();
    } catch (error) {
      console.error("Delete charity image error:", error);

      toast.error(
        apiError(
          error,
          tr(
            "charity.imageDeleteFailed",
            "Failed to delete charity image.",
            "មិនអាចលុបរូបភាពសប្បុរសធម៌បានទេ។"
          )
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleImageStatus = async (item) => {
    try {
      const payload = {
        is_active: !item.is_active,
      };

      await api.put(`/api/charity/images/${item.id}`, payload);

      setImages((current) =>
        current.map((record) =>
          record.id === item.id
            ? {
                ...record,
                ...payload,
              }
            : record
        )
      );
    } catch (error) {
      console.error("Update charity image status error:", error);

      toast.error(
        apiError(
          error,
          tr(
            "charity.statusFailed",
            "Failed to update status.",
            "មិនអាចធ្វើបច្ចុប្បន្នភាពស្ថានភាពបានទេ។"
          )
        )
      );
    }
  };


  if (loadingImages) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F0F7FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#F0F7FF] border-t-[#0D1B3E]" />
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-screen p-6 bg-[#F0F7FF] ${
        isKhmer ? "font-khmer" : "font-english"
      }`}
    >
      <div className="mx-auto w-full max-w-[1450px]">
        
        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0D1B3E] text-white flex items-center justify-center shadow-md flex-shrink-0">
              <FiImage size={22} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0D1B3E]">
                {tr(
                  "charity.title",
                  "Charity Management",
                  "គ្រប់គ្រងសកម្មភាពសប្បុរសធម៌"
                )}
              </h1>

              <p className="text-sm text-[#6B8AFF] mt-0.5">
                {tr(
                  "charity.subtitle",
                  "Manage charity activity images shown on the public website.",
                  "គ្រប់គ្រងរូបភាពសកម្មភាពសប្បុរសធម៌ដែលបង្ហាញលើគេហទំព័រ។"
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchImages}
              disabled={loadingImages || savingImage}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#E8EEF9] bg-white px-5 text-sm font-bold text-[#0D1B3E] transition hover:bg-[#F0F7FF] disabled:opacity-60"
            >
              <FiRefreshCw
                size={16}
                className={loadingImages ? "animate-spin" : ""}
              />
              {tr("common.refresh", "Refresh", "ផ្ទុកឡើងវិញ")}
            </button>

            <button
              type="button"
              onClick={openCreateImage}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#C23636] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#A92E2E]"
            >
              <FiPlus size={18} />
              {tr(
                "charity.addImage",
                "Add Image",
                "បន្ថែមរូបភាព"
              )}
            </button>
          </div>
        </div>

        {/* ==========================================
            STATS
        ========================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[#F0F4FB] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#6B8AFF]">
                  {isKhmer ? "រូបភាពសរុប" : "Total Photos"}
                </p>
                <p className="text-2xl font-bold text-[#0D1B3E] mt-1">
                  {images.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#F0F7FF] text-[#0D1B3E] flex items-center justify-center">
                <FiImage size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#F0F4FB] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#6B8AFF]">
                  {isKhmer ? "រូបភាពសកម្ម" : "Active Photos"}
                </p>
                <p className="text-2xl font-bold text-[#0D1B3E] mt-1">
                  {images.filter((img) => img.is_active).length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#F0F7FF] text-[#0D1B3E] flex items-center justify-center">
                <FiCheck size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            MODAL
        ========================================== */}
        <AdminModal
          isOpen={showImageForm}
          onClose={resetImageForm}
          title={
            editingImageId
              ? isKhmer
                ? "កែប្រែរូបភាពសប្បុរសធម៌"
                : "Edit Charity Photo"
              : isKhmer
              ? "បន្ថែមរូបភាពសប្បុរសធម៌ថ្មី"
              : "Add New Charity Photo"
          }
        >
          <form onSubmit={saveImage}>
            <div className="space-y-4">
              {/* IMAGE UPLOAD & PREVIEW */}
              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer ? "រូបភាពសកម្មភាពសប្បុរសធម៌" : "Charity Photo"}
                  <span className="text-[#C23636] ml-1">*</span>
                </label>

                {!imageForm.image_url ? (
                  <label className="min-h-[160px] border-2 border-dashed border-[#E8EEF9] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-[#F0F7FF] hover:border-[#0D1B3E] transition p-6 text-center block">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={uploadImageFile}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#0D1B3E] border border-[#E8EEF9] mb-3 shadow-xs mx-auto">
                      {uploadingImage ? (
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8EEF9] border-t-[#0D1B3E]" />
                      ) : (
                        <FiUploadCloud size={24} />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#0D1B3E]">
                      {uploadingImage
                        ? isKhmer
                          ? "កំពុង Upload រូបភាព..."
                          : "Uploading photo..."
                        : isKhmer
                        ? "ចុចដើម្បីជ្រើសរើសរូបភាពសប្បុរសធម៌"
                        : "Click to select charity photo"}
                    </p>
                    <p className="text-xs text-[#6B8AFF] mt-1">
                      JPG, PNG, WEBP — Max 5MB
                    </p>
                  </label>
                ) : (
                  <div className="relative h-[220px] rounded-xl overflow-hidden border border-[#E8EEF9] bg-[#F0F7FF] group">
                    <img
                      src={getImageUrl(imageForm.image_url)}
                      alt="Charity Preview"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setImageForm((prev) => ({ ...prev, image_url: "" }))
                      }
                      className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-[#C23636] text-white flex items-center justify-center hover:bg-[#A92E2E] shadow transition"
                    >
                      <FiTrash2 size={16} />
                    </button>

                    <label className="absolute bottom-3 right-3 h-9 px-3 bg-white text-[#0D1B3E] rounded-lg text-xs font-semibold shadow hover:bg-slate-50 cursor-pointer inline-flex items-center">
                      <span>{isKhmer ? "ប្ដូររូបភាព" : "Change Photo"}</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={uploadImageFile}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* TITLE */}
              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer ? "ចំណងជើងសកម្មភាព" : "Activity Title"}
                  <span className="text-[#C23636] ml-1">*</span>
                </label>
                <input
                  type="text"
                  name={`title_${suffix}`}
                  value={imageForm[`title_${suffix}`] || ""}
                  onChange={handleImageFormChange}
                  placeholder={
                    isKhmer
                      ? "ឧ. សកម្មភាពចែកសម្ភារៈសិក្សាដល់សិស្សានុសិស្ស"
                      : "e.g. Learning Materials Donation to Students"
                  }
                  required
                  className="w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm font-semibold text-[#0D1B3E] block mb-1.5">
                  {isKhmer ? "ការពិពណ៌នាអំពីសកម្មភាព" : "Activity Description"}
                </label>
                <textarea
                  name={`description_${suffix}`}
                  rows={3}
                  value={imageForm[`description_${suffix}`] || ""}
                  onChange={handleImageFormChange}
                  placeholder={
                    isKhmer
                      ? "សរសេរការពិពណ៌នាសង្ខេបអំពីសកម្មភាពសប្បុរសធម៌នេះ..."
                      : "Write a short description about this charity activity..."
                  }
                  className="w-full border border-[#E8EEF9] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E] transition resize-none"
                />
              </div>

              {/* ACTIVE SWITCH */}
              <label className="flex items-center justify-between gap-3 p-4 border border-[#E8EEF9] rounded-xl bg-white cursor-pointer hover:bg-[#F0F7FF] transition">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      imageForm.is_active
                        ? "bg-[#EBF9F0] text-[#2E7D32]"
                        : "bg-[#F0F7FF] text-[#6B8AFF]"
                    }`}
                  >
                    {imageForm.is_active ? (
                      <FiCheckCircle size={18} />
                    ) : (
                      <FiXCircle size={18} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#0D1B3E]">
                      {isKhmer ? "សកម្មភាពសកម្ម" : "Active Photo"}
                    </p>
                    <p className="text-xs text-[#6B8AFF]">
                      {isKhmer
                        ? "បង្ហាញរូបភាពនេះនៅលើគេហទំព័រ"
                        : "Show this photo on website"}
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  name="is_active"
                  checked={imageForm.is_active}
                  onChange={handleImageFormChange}
                  className="w-4 h-4 accent-[#0D1B3E]"
                />
              </label>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6 pt-4 border-t border-[#E8EEF9] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              <button
                type="button"
                onClick={resetImageForm}
                disabled={savingImage || uploadingImage}
                className="h-10 px-4 bg-white border border-[#E8EEF9] text-[#6B8AFF] rounded-lg text-sm font-semibold hover:bg-[#F0F7FF] disabled:opacity-50 transition"
              >
                {isKhmer ? "បោះបង់" : "Cancel"}
              </button>

              <button
                type="submit"
                disabled={savingImage || uploadingImage}
                className="min-w-[140px] h-10 px-5 bg-[#C23636] text-white rounded-lg text-sm font-semibold hover:bg-[#A92E2E] disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
              >
                {savingImage || uploadingImage ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {isKhmer ? "កំពុងរក្សាទុក..." : "Saving..."}
                  </>
                ) : editingImageId ? (
                  <>
                    <FiEdit2 size={15} />
                    {isKhmer ? "រក្សាទុកការកែប្រែ" : "Update Photo"}
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    {isKhmer ? "រក្សាទុករូបភាព" : "Save Photo"}
                  </>
                )}
              </button>
            </div>
          </form>
        </AdminModal>

        {/* ==========================================
            FILTERS / LIST
        ========================================== */}
        <div className="bg-white border border-[#F0F4FB] rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-[#E8EEF9] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#C23636]">
                {tr(
                  "charity.imageLibrary",
                  "Charity Image Library",
                  "បណ្ណាល័យរូបភាពសប្បុរសធម៌"
                )}
              </p>

              <h2 className="mt-0.5 text-lg font-bold text-[#0D1B3E]">
                {tr(
                  "charity.images",
                  "Charity Images",
                  "រូបភាពសប្បុរសធម៌"
                )}
              </h2>
            </div>

            <div className="relative w-full sm:w-[300px]">
              <FiSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8AFF]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={tr(
                  "charity.searchImages",
                  "Search images...",
                  "ស្វែងរករូបភាព..."
                )}
                className="h-10 w-full rounded-lg border border-[#E8EEF9] bg-[#F0F7FF] pl-9 pr-3 text-sm outline-none text-[#0D1B3E] transition focus:border-[#0D1B3E] focus:bg-white"
              />
            </div>
          </div>

          {filteredImages.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F7FF] text-[#0D1B3E]">
                <FiImage size={28} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#0D1B3E]">
                {tr(
                  "charity.noImages",
                  "No Charity Images",
                  "មិនទាន់មានរូបភាពសប្បុរសធម៌"
                )}
              </h3>

              <button
                type="button"
                onClick={openCreateImage}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-[#C23636] px-5 text-sm font-bold text-white hover:bg-[#A92E2E] transition"
              >
                <FiPlus size={18} />
                {tr(
                  "charity.addImage",
                  "Add Image",
                  "បន្ថែមរូបភាព"
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[850px] border-collapse">
                  <thead>
                    <tr className="bg-[#F0F7FF] text-left">
                      {[
                        tr("common.image", "Image", "រូបភាព"),
                        tr("common.title", "Title", "ចំណងជើង"),
                        tr(
                          "common.description",
                          "Description",
                          "ការពិពណ៌នា"
                        ),
                        tr("common.status", "Status", "ស្ថានភាព"),
                        tr("common.actions", "Actions", "សកម្មភាព"),
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="border-b border-[#E8EEF9] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B8AFF]"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredImages.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#F0F4FB] last:border-b-0 hover:bg-[#F0F7FF]/50 transition"
                      >
                        <td className="px-5 py-4">
                          <div className="h-16 w-24 overflow-hidden rounded-lg bg-[#F0F7FF] border border-[#E8EEF9]">
                            <img
                              src={getImageUrl(item.image_url)}
                              alt={localized(item, "title", "Charity")}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[220px] truncate text-sm font-bold text-[#0D1B3E]">
                            {localized(item, "title", "—")}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[320px] line-clamp-2 text-xs leading-5 text-[#6B8AFF]">
                            {localized(item, "description", "—")}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => toggleImageStatus(item)}
                            className={`inline-flex h-8 items-center rounded-full px-3 text-[10px] font-bold transition ${
                              item.is_active
                                ? "bg-[#EBF9F0] text-[#2E7D32] hover:bg-[#C8E6C9]"
                                : "bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2]"
                            }`}
                          >
                            {item.is_active
                              ? tr("common.active", "Active", "សកម្ម")
                              : tr(
                                  "common.inactive",
                                  "Inactive",
                                  "អសកម្ម"
                                )}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditImage(item)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0F7FF] text-[#0D1B3E] hover:bg-[#0D1B3E] hover:text-white transition"
                            >
                              <FiEdit2 size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteImage(item)}
                              disabled={deletingId === item.id}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFEBEE] text-[#C62828] hover:bg-[#C62828] hover:text-white transition disabled:opacity-60"
                            >
                              {deletingId === item.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                              ) : (
                                <FiTrash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
                {filteredImages.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-[#F0F4FB] bg-white shadow-sm"
                  >
                    <div className="h-[210px] bg-[#F0F7FF]">
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={localized(item, "title", "Charity")}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="text-base font-bold text-[#0D1B3E]">
                        {localized(item, "title", "—")}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#6B8AFF]">
                        {localized(item, "description", "—")}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-[#E8EEF9] pt-4">
                        <button
                          type="button"
                          onClick={() => toggleImageStatus(item)}
                          className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                            item.is_active
                              ? "bg-[#EBF9F0] text-[#2E7D32]"
                              : "bg-[#FFEBEE] text-[#C62828]"
                          }`}
                        >
                          {item.is_active
                            ? tr("common.active", "Active", "សកម្ម")
                            : tr(
                                "common.inactive",
                                "Inactive",
                                "អសកម្ម"
                              )}
                        </button>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditImage(item)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E8EEF9] text-[#0D1B3E] hover:bg-[#F0F7FF]"
                          >
                            <FiEdit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteImage(item)}
                            disabled={deletingId === item.id}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-[#FFEBEE] text-[#C62828] disabled:opacity-60"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCharity;
