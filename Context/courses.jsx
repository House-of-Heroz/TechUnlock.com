"use client";

import { getCourses, getEnrolledCourses } from "@/services/course";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

const CoursesContext = createContext();

export const CoursesProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      console.log(data);
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEnrolledCourses = useCallback(async () => {
    try {
      const data = await getEnrolledCourses();
      console.log("Raw enrolled courses data:", data);
      setEnrolledCourses(data.enrolled_courses || []);
      console.log("Set enrolled courses:", data.enrolled_courses);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error.message);
      setEnrolledCourses([]);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, [fetchCourses, fetchEnrolledCourses]);

  const contextValue = useMemo(
    () => ({
      courses,
      setCourses,
      enrolledCourses,
      setEnrolledCourses,
      loading,
      setLoading,
      fetchEnrolledCourses,
    }),
    [courses, enrolledCourses, loading, fetchEnrolledCourses]
  );

  return (
    <CoursesContext.Provider value={contextValue}>
      {children}
    </CoursesContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error("useCourses must be used within a CoursesProvider");
  }
  return context;
};
