import { apiClient } from "@/helpers/apiClient";
import { fetchToken } from "@/helpers/getToken";
import axios from "axios";

const BASE_URL = "https://test.techunlock.org/test/api";

export const getLearnersStats = async () => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/learners-stats/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getFeedback = async (params = {}) => {
  const token = await fetchToken();
  const queryString = new URLSearchParams(params).toString();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/feedbacks/?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const addFeedback = async (feedbackData) => {
  const token = await fetchToken();
  try {
    const response = await apiClient.post(
      `${BASE_URL}/course/add-feedback/`,
      feedbackData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during adding feedback:", error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/dashboard-stats/?period_days=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const createCourse = async (data) => {
  const token = await fetchToken();
  const response = await apiClient.post(
    `${BASE_URL}/course/add-courses/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const editCourse = async (data, id) => {
  const token = await fetchToken();
  const response = await apiClient.put(
    `${BASE_URL}/course/course-details/${id}/`,

    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteCourse = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.delete(
    `${BASE_URL}/course/course-details/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getCourseStats = async () => {
  const token = await fetchToken();
  const response = await apiClient.get(`${BASE_URL}/admin-app/course-stats/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getCourseDetails = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/course-details/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// MODULES
export const getModuleDetails = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/module-details/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const editModules = async (data, id) => {
  const token = await fetchToken();
  const response = await apiClient.put(
    `${BASE_URL}/admin-app/module-details/${id}/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteModules = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.delete(
    `${BASE_URL}/admin-app/module-details/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// ADMIN USERS
export const getAdminUsers = async () => {
  const token = await fetchToken();
  const response = await apiClient.get(`${BASE_URL}/admin-app/admins/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createAdminUser = async (data) => {
  const token = await fetchToken();
  const response = await apiClient.post(`${BASE_URL}/admin-app/admins/`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const editAdminUser = async (data, id) => {
  const token = await fetchToken();
  const response = await apiClient.put(
    `${BASE_URL}/admin-app/admins/${id}/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.delete(
    `${BASE_URL}/admin-app/admins/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// ==================== COURSE MANAGEMENT (ENHANCED) ====================
export const getAllCourses = async (params = {}) => {
  const token = await fetchToken();
  const queryString = new URLSearchParams(params).toString();
  const response = await apiClient.get(
    `${BASE_URL}/course/courses/?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const publishCourse = async (id, isPublished = true) => {
  const token = await fetchToken();
  const response = await apiClient.patch(
    `${BASE_URL}/admin-app/courses/${id}/publish/`,
    { is_published: isPublished },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const createModule = async (data) => {
  const token = await fetchToken();
  const response = await apiClient.post(
    `${BASE_URL}/admin-app/modules/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// ==================== LEARNER MANAGEMENT ====================
// getAllLearners function removed - using learners data from getLearnersStats instead
export const getAllLearners = async () => {
  const token = await fetchToken();
  const response = await apiClient.get(`${BASE_URL}/admin-app/learners/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getLearnerDetails = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/learners/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updateLearner = async (id, data) => {
  const token = await fetchToken();
  const response = await apiClient.put(
    `${BASE_URL}/admin-app/learners/${id}/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteLearner = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.delete(
    `${BASE_URL}/admin-app/learners/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// ==================== PAYMENT MANAGEMENT ====================
export const getAllPayments = async (params = {}) => {
  const token = await fetchToken();
  const queryString = new URLSearchParams(params).toString();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/payments/?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getPaymentDetails = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/payments/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getPaymentStats = async () => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/payments-stats/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// ==================== FEEDBACK MANAGEMENT ====================
export const getAllFeedback = async (params = {}) => {
  const token = await fetchToken();
  const queryString = new URLSearchParams(params).toString();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/feedbacks/?${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getFeedbackDetails = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/feedbacks/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const respondToFeedback = async (id, response) => {
  const token = await fetchToken();
  const apiResponse = await apiClient.post(
    `${BASE_URL}/admin-app/feedbacks/${id}/respond/`,
    { response },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return apiResponse.data;
};

export const deleteFeedback = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.delete(
    `${BASE_URL}/admin-app/feedbacks/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// ==================== UTILITY FUNCTIONS ====================
export const uploadFile = async (file, type = "image") => {
  try {
    // Import the bunny uploader functions
    const { uploadToBunny, uploadCourseMedia, uploadProfileImage } =
      await import("@/helpers/bunny-uploader");

    // Use the appropriate upload function based on type
    if (type === "profile") {
      return { url: await uploadProfileImage(file) };
    } else if (type === "course") {
      return { url: await uploadCourseMedia(file, "image") };
    } else {
      return { url: await uploadToBunny(file, type) };
    }
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

// New function for uploading course media with more specific parameters
export const uploadCourseMedia = async (
  file,
  contentType,
  courseTitle,
  index
) => {
  try {
    // Option 1: Direct Bunny.net upload (requires CSP configuration)
    const { uploadCourseMedia: uploadCourse } = await import(
      "@/helpers/bunny-uploader"
    );
    const url = await uploadCourse(file, contentType, courseTitle, index);
    return { url };

    // Option 2: Server-side API route (current implementation)
    // const formData = new FormData();
    // formData.append("file", file);
    // formData.append("type", contentType);
    // formData.append("courseTitle", courseTitle || "");
    // formData.append("index", index || "");

    // const response = await fetch("/api/upload", {
    //   method: "POST",
    //   body: formData,
    // });

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || "Upload failed");
    // }

    // const result = await response.json();
    // return { url: result.url };
  } catch (error) {
    console.error("Course media upload failed:", error);
    throw error;
  }
};

// New function for uploading profile images
export const uploadProfileMedia = async (file, userId) => {
  try {
    const { uploadProfileImage } = await import("@/helpers/bunny-uploader");
    const url = await uploadProfileImage(file, userId);
    return { url };
  } catch (error) {
    console.error("Profile media upload failed:", error);
    throw error;
  }
};

// New function for uploading badge images
export const uploadBadgeMedia = async (file, badgeTitle) => {
  try {
    // Option 1: Direct Bunny.net upload (requires CSP configuration)
    const { uploadCourseMedia } = await import("@/helpers/bunny-uploader");
    const url = await uploadCourseMedia(file, "badge", badgeTitle);
    return { url };

    // Option 2: Server-side API route (current implementation)
    // const formData = new FormData();
    // formData.append("file", file);
    // formData.append("type", "badge");
    // formData.append("courseTitle", badgeTitle || "");
    // formData.append("index", "1");

    // const response = await fetch("/api/upload", {
    //   method: "POST",
    //   body: formData,
    // });

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || "Upload failed");
    // }

    // const result = await response.json();
    // return { url: result.url };
  } catch (error) {
    console.error("Badge media upload failed:", error);
    throw error;
  }
};

export const searchGlobal = async (query) => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/search/?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Admin Notification Functions
export const getAdminNotifications = async (status = "all") => {
  const token = await fetchToken();
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    if (status && status !== "all") {
      config.params = { status };
    }
    const response = await apiClient.get(
      `${BASE_URL}/notification/user-notifications/`,
      config
    );
    if (response.data && response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    throw new Error("An unexpected error occurred.");
  }
};

export const markAdminNotificationAsRead = async (notificationId) => {
  const token = await fetchToken();
  try {
    const response = await apiClient.patch(
      `${BASE_URL}/admin-app/notifications/${notificationId}/`,
      { read: true },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data && response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    console.error("Error marking admin notification as read:", error);
    throw new Error("An unexpected error occurred.");
  }
};

export const deleteAdminNotification = async (notificationId) => {
  const token = await fetchToken();
  try {
    const response = await apiClient.delete(
      `${BASE_URL}/admin-app/notifications/${notificationId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting admin notification:", error);
    throw new Error("An unexpected error occurred.");
  }
};

// Admin Password Management
export const changeAdminPassword = async (adminId, passwordData) => {
  const token = await fetchToken();
  try {
    const response = await apiClient.post(
      `${BASE_URL}/admin-app/admins/${adminId}/change-password/`,
      passwordData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error changing admin password:", error);
    throw new Error("Failed to change password. Please try again.");
  }
};

// Add Admin
export const getAdminDetails = async (data) => {
  const token = await fetchToken();
  try {
    const response = await apiClient.post(
      `${BASE_URL}/admin-app/admins/`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding admin:", error);
    throw new Error("Failed to add admin. Please try again.");
  }
};

export const getCourseDetailsForAdmin = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/course-details/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getModuleDetailsForAdmin = async (id) => {
  const token = await fetchToken();
  const response = await apiClient.get(
    `${BASE_URL}/admin-app/module-details/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Get Course Details for Editing
export const getCourseDetailsForEditing = async (courseId) => {
  const token = await fetchToken();
  try {
    const response = await apiClient.get(
      `${BASE_URL}/course/course-details/${courseId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching course for editing:", error);
    throw new Error("Failed to fetch course details for editing.");
  }
};
