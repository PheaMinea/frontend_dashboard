import axios from "axios";
import { API_BASE_URL } from "../utils/helpers";


// =========================================================
// SC ACADEMY - API CONFIGURATION
// =========================================================


// ---------------------------------------------------------
// API BASE URL
// ---------------------------------------------------------

// ---------------------------------------------------------
// AXIOS INSTANCE
// ---------------------------------------------------------

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    Accept: "application/json",
  },
});


// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token");

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const requestUrl = error?.config?.baseURL && error?.config?.url
      ? `${error.config.baseURL}${error.config.url}`
      : error?.config?.url;

    console.error("API request failed", {
      message: error?.message,
      method: error?.config?.method,
      url: requestUrl,
      status: error?.response?.status,
      response: error?.response?.data,
    });

    const status =
      error?.response?.status;

    const detail =
      error?.response?.data?.detail;

    if (
      status === 401 &&
      (
        detail ===
          "Could not validate credentials" ||
        detail ===
          "Not authenticated"
      )
    ) {
      localStorage.removeItem(
        "access_token"
      );

      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.assign(
          "/login"
        );
      }
    }

    return Promise.reject(error);
  }
);


// =========================================================
// API ERROR MESSAGE
// =========================================================

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  const detail =
    error?.response?.data?.detail;

  // FastAPI validation errors
  if (Array.isArray(detail)) {
    return detail
      .map(
        (item) =>
          item?.msg ||
          String(item)
      )
      .filter(Boolean)
      .join(", ");
  }

  // FastAPI normal error
  if (
    typeof detail === "string" &&
    detail
  ) {
    return detail;
  }

  // Other API error format
  if (
    error?.response?.data?.message
  ) {
    return (
      error.response.data.message
    );
  }

  // Axios/network error
  if (error?.message) {
    return error.message;
  }

  return fallback;
};


// =========================================================
// AUTH API
// =========================================================


// ---------------------------------------------------------
// ADMIN LOGIN
// ---------------------------------------------------------

export const loginAdmin = async (
  username,
  password
) => {
  const formData =
    new URLSearchParams();

  formData.append(
    "username",
    username.trim()
  );

  formData.append(
    "password",
    password
  );

  const response = await api.post(
    "/api/auth/token",
    formData,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};


// ---------------------------------------------------------
// GET CURRENT ADMIN
// ---------------------------------------------------------

export const getCurrentAdmin =
  async () => {
    const response =
      await api.get(
        "/api/auth/me"
      );

    return response.data;
  };


// ---------------------------------------------------------
// ADMIN LOGOUT
// ---------------------------------------------------------

export const logoutAdmin =
  async () => {
    try {
      const response =
        await api.post(
          "/api/auth/logout"
        );

      return response.data;
    } finally {
      localStorage.removeItem(
        "access_token"
      );
    }
  };


// ---------------------------------------------------------
// AUTH API OBJECT
// ---------------------------------------------------------

export const authAPI = {
  login: loginAdmin,
  me: getCurrentAdmin,
  logout: logoutAdmin,
};


// =========================================================
// ENROLLMENTS API
// =========================================================


// ---------------------------------------------------------
// GET ALL ENROLLMENTS
// ---------------------------------------------------------

export const getEnrollments =
  async (
    skip = 0,
    limit = 100
  ) => {
    const response =
      await api.get(
        "/api/enrollments/",
        {
          params: {
            skip,
            limit,
          },
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET SINGLE ENROLLMENT
// ---------------------------------------------------------

export const getEnrollment =
  async (
    enrollmentId
  ) => {
    const response =
      await api.get(
        `/api/enrollments/${enrollmentId}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// CREATE ENROLLMENT
// ---------------------------------------------------------

export const createEnrollment =
  async (
    data
  ) => {
    const response =
      await api.post(
        "/api/enrollments/",
        data
      );

    return response.data;
  };


// ---------------------------------------------------------
// UPDATE ENROLLMENT STATUS
// ---------------------------------------------------------

export const updateEnrollmentStatus =
  async (
    enrollmentId,
    status
  ) => {
    const response =
      await api.patch(
        `/api/enrollments/${enrollmentId}/status`,
        {
          status,
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// DELETE ENROLLMENT
// ---------------------------------------------------------

export const deleteEnrollment =
  async (
    enrollmentId
  ) => {
    const response =
      await api.delete(
        `/api/enrollments/${enrollmentId}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// ENROLLMENTS API OBJECT
// ---------------------------------------------------------

export const enrollmentsAPI = {
  getAll: getEnrollments,
  getOne: getEnrollment,
  create: createEnrollment,
  updateStatus:
    updateEnrollmentStatus,
  delete: deleteEnrollment,
};


// =========================================================
// COURSES API
// =========================================================


// ---------------------------------------------------------
// GET COURSES
// ---------------------------------------------------------

export const getCourses =
  async ({
    skip = 0,
    limit = 100,
    categoryId = null,
    isActive = true,
    isFeatured = null,
    status = null,
    search = null,
  } = {}) => {
    const params = {
      skip,
      limit,
      is_active: isActive,
    };

    if (
      categoryId !== null &&
      categoryId !== ""
    ) {
      params.category_id =
        categoryId;
    }

    if (
      isFeatured !== null &&
      isFeatured !== ""
    ) {
      params.is_featured =
        isFeatured;
    }

    if (status) {
      params.status = status;
    }

    if (search) {
      params.search = search;
    }

    const response =
      await api.get(
        "/api/courses/",
        {
          params,
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET SINGLE COURSE
// ---------------------------------------------------------

export const getCourse =
  async (
    courseId
  ) => {
    const response =
      await api.get(
        `/api/courses/${courseId}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET COURSE BY SLUG
// ---------------------------------------------------------

export const getCourseBySlug =
  async (
    slug
  ) => {
    const response =
      await api.get(
        `/api/courses/slug/${slug}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET FEATURED COURSES
// ---------------------------------------------------------

export const getFeaturedCourses =
  async (
    limit = 6
  ) => {
    const response =
      await api.get(
        "/api/courses/featured",
        {
          params: {
            limit,
          },
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET POPULAR COURSES
// ---------------------------------------------------------

export const getPopularCourses =
  async (
    limit = 4
  ) => {
    const response =
      await api.get(
        "/api/courses/popular",
        {
          params: {
            limit,
          },
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// CREATE COURSE
// FormData required
// ---------------------------------------------------------

export const createCourse =
  async (
    formData
  ) => {
    const response =
      await api.post(
        "/api/courses/",
        formData
      );

    return response.data;
  };


// ---------------------------------------------------------
// UPDATE COURSE
// FormData required
// ---------------------------------------------------------

export const updateCourse =
  async (
    courseId,
    formData
  ) => {
    const response =
      await api.put(
        `/api/courses/${courseId}`,
        formData
      );

    return response.data;
  };


// ---------------------------------------------------------
// DELETE COURSE
// ---------------------------------------------------------

export const deleteCourse =
  async (
    courseId
  ) => {
    const response =
      await api.delete(
        `/api/courses/${courseId}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET COURSE CATEGORIES
// ---------------------------------------------------------

export const getCourseCategories =
  async (
    skip = 0,
    limit = 100
  ) => {
    const response =
      await api.get(
        "/api/courses/categories",
        {
          params: {
            skip,
            limit,
          },
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET ALL COURSE CATEGORIES
// ---------------------------------------------------------

export const getAllCourseCategories =
  async () => {
    const response =
      await api.get(
        "/api/courses/categories/all"
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET SINGLE COURSE CATEGORY
// ---------------------------------------------------------

export const getCourseCategory =
  async (
    categoryId
  ) => {
    const response =
      await api.get(
        `/api/courses/categories/${categoryId}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// CREATE COURSE CATEGORY
// FormData required
// ---------------------------------------------------------

export const createCourseCategory =
  async (
    formData
  ) => {
    const response =
      await api.post(
        "/api/courses/categories",
        formData
      );

    return response.data;
  };


// ---------------------------------------------------------
// UPDATE COURSE CATEGORY
// FormData required
// ---------------------------------------------------------

export const updateCourseCategory =
  async (
    categoryId,
    formData
  ) => {
    const response =
      await api.put(
        `/api/courses/categories/${categoryId}`,
        formData
      );

    return response.data;
  };


// ---------------------------------------------------------
// DELETE COURSE CATEGORY
// ---------------------------------------------------------

export const deleteCourseCategory =
  async (
    categoryId
  ) => {
    const response =
      await api.delete(
        `/api/courses/categories/${categoryId}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// COURSES API OBJECT
// ---------------------------------------------------------

export const coursesAPI = {
  getAll: getCourses,
  getOne: getCourse,
  getBySlug: getCourseBySlug,

  getFeatured:
    getFeaturedCourses,

  getPopular:
    getPopularCourses,

  create: createCourse,
  update: updateCourse,
  delete: deleteCourse,

  categories: {
    getActive:
      getCourseCategories,

    getAll:
      getAllCourseCategories,

    getOne:
      getCourseCategory,

    create:
      createCourseCategory,

    update:
      updateCourseCategory,

    delete:
      deleteCourseCategory,
  },
};




// =========================================================
// CHARITY API
// =========================================================


// ---------------------------------------------------------
// GET CHARITY CONTENT
// PUBLIC
// ---------------------------------------------------------

export const getCharityContent =
  async () => {
    const response =
      await api.get(
        "/api/charity/"
      );

    return response.data;
  };


// ---------------------------------------------------------
// CREATE CHARITY CONTENT
// ADMIN ONLY
// ---------------------------------------------------------

export const createCharityContent =
  async (
    data
  ) => {
    const response =
      await api.post(
        "/api/charity/",
        data
      );

    return response.data;
  };


// ---------------------------------------------------------
// UPDATE CHARITY CONTENT
// ADMIN ONLY
// ---------------------------------------------------------

export const updateCharityContent =
  async (
    data
  ) => {
    const response =
      await api.put(
        "/api/charity/",
        data
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET PUBLIC CHARITY IMAGES
// ---------------------------------------------------------

export const getPublicCharityImages =
  async (
    skip = 0,
    limit = 100
  ) => {
    const response =
      await api.get(
        "/api/charity/images",
        {
          params: {
            skip,
            limit,
          },
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET ALL CHARITY IMAGES
// ADMIN ONLY
// ---------------------------------------------------------

export const getAllCharityImages =
  async (
    skip = 0,
    limit = 200
  ) => {
    const response =
      await api.get(
        "/api/charity/images/admin/all",
        {
          params: {
            skip,
            limit,
          },
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET SINGLE CHARITY IMAGE
// ---------------------------------------------------------

export const getCharityImage =
  async (
    imageId
  ) => {
    const response =
      await api.get(
        `/api/charity/images/${imageId}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// CREATE CHARITY IMAGE
// ADMIN ONLY
// ---------------------------------------------------------

export const createCharityImage =
  async (
    data
  ) => {
    const response =
      await api.post(
        "/api/charity/images",
        data
      );

    return response.data;
  };


// ---------------------------------------------------------
// UPDATE CHARITY IMAGE
// ADMIN ONLY
// ---------------------------------------------------------

export const updateCharityImage =
  async (
    imageId,
    data
  ) => {
    const response =
      await api.put(
        `/api/charity/images/${imageId}`,
        data
      );

    return response.data;
  };


// ---------------------------------------------------------
// DELETE CHARITY IMAGE
// ADMIN ONLY
// ---------------------------------------------------------

export const deleteCharityImage =
  async (
    imageId
  ) => {
    const response =
      await api.delete(
        `/api/charity/images/${imageId}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// UPLOAD CHARITY IMAGE FILE
// ADMIN ONLY
// ---------------------------------------------------------

export const uploadCharityImage =
  async (
    file,
    onUploadProgress
  ) => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await api.post(
        "/api/charity/images/upload",
        formData,
        {
          onUploadProgress,
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// CHARITY API OBJECT
// ---------------------------------------------------------

export const charityAPI = {
  content: {
    get:
      getCharityContent,

    create:
      createCharityContent,

    update:
      updateCharityContent,
  },

  images: {
    getPublic:
      getPublicCharityImages,

    getAll:
      getAllCharityImages,

    getOne:
      getCharityImage,

    create:
      createCharityImage,

    update:
      updateCharityImage,

    delete:
      deleteCharityImage,

    upload:
      uploadCharityImage,
  },
};


// =========================================================
// ALUMNI API
// =========================================================


// ---------------------------------------------------------
// GET ALL ALUMNI
// ADMIN ONLY
// ---------------------------------------------------------

export const getAllAlumni =
  async (
    skip = 0,
    limit = 200
  ) => {
    const response =
      await api.get(
        "/api/alumni/admin/all",
        {
          params: {
            skip,
            limit,
          },
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET FEATURED ALUMNI
// ---------------------------------------------------------

export const getFeaturedAlumni =
  async (
    limit = 6
  ) => {
    const response =
      await api.get(
        "/api/alumni/featured",
        {
          params: {
            limit,
          },
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET PUBLIC ALUMNI
// ---------------------------------------------------------

export const getAlumniList =
  async (
    skip = 0,
    limit = 100
  ) => {
    const response =
      await api.get(
        "/api/alumni/",
        {
          params: {
            skip,
            limit,
          },
        }
      );

    return response.data;
  };


// ---------------------------------------------------------
// GET SINGLE ALUMNI
// ---------------------------------------------------------

export const getAlumni =
  async (
    alumniId
  ) => {
    const response =
      await api.get(
        `/api/alumni/${alumniId}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// CREATE ALUMNI
// ---------------------------------------------------------

export const createAlumni =
  async (
    data
  ) => {
    const response =
      await api.post(
        "/api/alumni/",
        data
      );

    return response.data;
  };


// ---------------------------------------------------------
// UPDATE ALUMNI
// ---------------------------------------------------------

export const updateAlumni =
  async (
    alumniId,
    data
  ) => {
    const response =
      await api.put(
        `/api/alumni/${alumniId}`,
        data
      );

    return response.data;
  };


// ---------------------------------------------------------
// DELETE ALUMNI
// ---------------------------------------------------------

export const deleteAlumni =
  async (
    alumniId
  ) => {
    const response =
      await api.delete(
        `/api/alumni/${alumniId}`
      );

    return response.data;
  };


// ---------------------------------------------------------
// ALUMNI API OBJECT
// ---------------------------------------------------------

export const alumniAPI = {
  getAll: getAllAlumni,

  getFeatured:
    getFeaturedAlumni,

  getPublic:
    getAlumniList,

  getOne:
    getAlumni,

  create:
    createAlumni,

  update:
    updateAlumni,

  delete:
    deleteAlumni,
};


// =========================================================
// DEFAULT EXPORT
// MUST STAY AT THE END
// =========================================================

export default api;