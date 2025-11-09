import { apiClient } from "@/helpers/apiClient";
import { fetchToken } from "@/helpers/getToken";
import axios from "axios";

const BASE_URL = "https://test.techunlock.org/test/api";

export async function getCourses() {
  try {
    const response = await apiClient.get(`${BASE_URL}/course/courses/`);

    // Handle response to check for errors
    if (response.data && response.data.error) {
      throw new Error(response.data.error); // Assuming the error message is in response.data.error
    }
    // Handle successful response
    return response.data;
  } catch (error) {
    console.error("Error during sign-in:", error);

    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(
        error.response.data.message || "An error occurred while signing in."
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "No response received. Please check your network connection."
      );
    } else if (error instanceof z.ZodError) {
      // Validation error
      throw new Error(error.errors.map((err) => err.message).join(", "));
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred.");
    }
  }
}

export async function getCourseDetails(courseId) {
  const token = await fetchToken();
  try {
    const response = await axios.get(
      `${BASE_URL}/course/course-details/${courseId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );
    if (response.status === 200) {
      return response.data;
    }
    console.error(`Unexpected response status: ${response.status}`);
    return "An error occurred while fetching course details.";
  } catch (error) {
    console.error("Error during fetching course details:", error);
    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(error.response.data.message || "An error occurred.");
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "No response received. Please check your network connection."
      );
    } else if (error instanceof z.ZodError) {
      // Validation error
      throw new Error(error.errors.map((err) => err.message).join(", "));
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred.");
    }
  }
}

export async function registerForCourse(paymentData) {
  const token = await fetchToken();
  try {
    const response = await axios.post(
      `${BASE_URL}/payment/initialize-payment/`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );

    if (response.status === 200) {
      // Successfully initialized payment
      return response.data;
    } else {
      // Handle unexpected response status
      console.error(`Unexpected response status: ${response.status}`);
      return "An error occurred while initializing payment.";
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      console.error("Response error:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error in setting up request:", error.message);
    }
    console.error("Config:", error.config);
    return (
      error.response?.data?.message ||
      "An error occurred while initializing payment."
    );
  }
}

export async function getEnrolledCourses() {
  const token = await fetchToken();
  try {
    if (token) {
      const response = await axios.get(`${BASE_URL}/course/enrolled-courses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      });

      if (response.status === 200) {
        return response.data;
      } else {
        // Handle unexpected response status
        console.error(`Unexpected response status: ${response.status}`);
        return { enrolled_courses: [] };
      }
    } else {
      // No token - user not authenticated, return empty array
      console.log("No token found, returning empty enrolled courses");
      return { enrolled_courses: [] };
    }
  } catch (error) {
    console.error("Error during getting enrolled course:", error);

    if (error.response) {
      // Server responded with a status other than 200 range
      if (error.response.status === 401) {
        // Unauthorized - user not authenticated
        console.log("Unauthorized access, returning empty enrolled courses");
        return { enrolled_courses: [] };
      }
      throw new Error(error.response.data.message || "An error occurred.");
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "No response received. Please check your network connection."
      );
    } else if (error instanceof z.ZodError) {
      // Validation error
      throw new Error(error.errors.map((err) => err.message).join(", "));
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred.");
    }
  }
}

// export async function getCourseDetails(courseId) {
//   const token = await fetchToken();
//   try {
//     const response = await axios.get(
//       `${BASE_URL}/course/course-details/${courseId}/`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         timeout: 5000,
//       }
//     );
//     if (response.status === 200) {
//       return response.data;
//     }
//     // Handle unexpected response status
//     console.error(`Unexpected response status: ${response.status}`);
//     return "An error occurred while fetching course details.";
//   } catch (error) {
//     console.error("Error during fetching course details:", error);

//     if (error.response) {
//       // Server responded with a status other than 200 range
//       throw new Error(error.response.data.message || "An error occurred.");
//     } else if (error.request) {
//       // Request was made but no response received
//       throw new Error(
//         "No response received. Please check your network connection."
//       );
//     } else if (error instanceof z.ZodError) {
//       // Validation error
//       throw new Error(error.errors.map((err) => err.message).join(", "));
//     } else {
//       // Something else happened
//       throw new Error("An unexpected error occurred.");
//     }
//   }
// }

export async function getCompletedCourses() {
  const token = await fetchToken();
  try {
    const response = await axios.get(`${BASE_URL}/course/completed-courses/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });
    if (response.status === 200) {
      return response.data;
    }
    // Handle unexpected response status
    console.error(`Unexpected response status: ${response.status}`);
    return "An error occurred while fetching completed courses.";
  } catch (error) {
    console.error("Error during fetching completed courses:", error);
    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(error.response.data.message || "An error occurred.");
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "No response received. Please check your network connection."
      );
    } else if (error instanceof z.ZodError) {
      // Validation error
      throw new Error(error.errors.map((err) => err.message).join(", "));
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred.");
    }
  }
}

export const completeCourseModule = async (moduleId) => {
  const token = await fetchToken();
  try {
    const response = await apiClient.post(
      `${BASE_URL}/course/complete-course-module/${moduleId}/`,
      // { courseId, moduleId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Handle response to check for errors
    if (response.data && response.data.error) {
      throw new Error(response.data.error); // Assuming the error message is in response.data.error
    }
    // Handle successful response
    return response.data;
  } catch (error) {
    console.error("Error during completing course module:", error);
    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(error.response.data.message || "An error occurred.");
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "No response received. Please check your network connection."
      );
    } else if (error instanceof z.ZodError) {
      // Validation error
      throw new Error(error.errors.map((err) => err.message).join(", "));
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const submitQuiz = async (quizData) => {
  const token = await fetchToken();
  try {
    const response = await apiClient.post(
      `${BASE_URL}/course/submit-quiz/`,
      quizData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Handle response to check for errors
    if (response.data && response.data.error) {
      throw new Error(response.data.error); // Assuming the error message is in response.data.error
    }
    // Handle successful response
    return response.data;
  } catch (error) {
    console.error("Error during submitting course:", error);
    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(error.response.data.message || "An error occurred.");
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "No response received. Please check your network connection."
      );
    } else if (error instanceof z.ZodError) {
      // Validation error
      throw new Error(error.errors.map((err) => err.message).join(", "));
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const getUserDashboard = async () => {
  const token = await fetchToken();
  try {
    const response = await apiClient.get(`${BASE_URL}/course/dashboard-data/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Handle response to check for errors
    if (response.data && response.data.error) {
      throw new Error(response.data.error); // Assuming the error message is in response.data.error
    }
    // Handle successful response
    return response.data;
  } catch (error) {
    console.error("Error during fetching user dashboard:", error);
    if (error.response) {
      // Server responded with a status other than 200 range
      throw new Error(error.response.data.message || "An error occurred.");
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "No response received. Please check your network connection."
      );
    } else if (error instanceof z.ZodError) {
      // Validation error
      throw new Error(error.errors.map((err) => err.message).join(", "));
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred.");
    }
  }
};

// Enroll the authenticated user into a course
export async function enrollInCourse(courseId) {
  console.log("enrollInCourse called with courseId:", courseId);
  const token = await fetchToken();
  if (!token) {
    console.log("No token found, throwing AUTH_REQUIRED error");
    // Signal to caller that authentication is required; UI can redirect or show login
    throw new Error("AUTH_REQUIRED");
  }
  console.log("Token found, making API call...");
  try {
    const response = await axios.post(
      `${BASE_URL}/course/student-enroll/`,
      { course_id: courseId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );
    console.log("API response:", response);
    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
    console.error(`Unexpected response status: ${response.status}`);
    return "An error occurred while enrolling in the course.";
  } catch (error) {
    console.error("Error in enrollInCourse:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || "An error occurred.");
    } else if (error.request) {
      throw new Error(
        "No response received. Please check your network connection."
      );
    } else if (error instanceof z.ZodError) {
      throw new Error(error.errors.map((err) => err.message).join(", "));
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
}
