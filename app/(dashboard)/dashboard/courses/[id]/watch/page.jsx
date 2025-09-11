"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getCourseDetails } from "@/services/course";
import { useCourses } from "@/Context/courses";

const CourseDetailsPage = dynamic(
  () => import("@/page/dashboard/course-details"),
  { ssr: false }
);

export default function DashboardCourseWatchRoute() {
  const params = useParams();
  const router = useRouter();
  const search = useSearchParams();
  const { enrolledCourses, fetchEnrolledCourses } = useCourses();
  const { id } = params || {};
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const isPreview = search?.get("preview") === "1";

  // Check if user is enrolled in this course using context
  const isEnrolledFromContext = enrolledCourses?.some(
    (enrolledCourse) => enrolledCourse.id === parseInt(id)
  );

  useEffect(() => {
    let cancelled = false;
    async function checkEnrollment() {
      try {
        console.log("Checking enrollment for course:", id);
        console.log("Enrolled courses from context:", enrolledCourses);
        console.log("Is enrolled from context:", isEnrolledFromContext);

        // First refresh enrolled courses to ensure we have the latest data
        await fetchEnrolledCourses();

        // Check enrollment from context after refresh
        const isEnrolledAfterRefresh = enrolledCourses?.some(
          (enrolledCourse) => enrolledCourse.id === parseInt(id)
        );

        if (isEnrolledAfterRefresh) {
          console.log("User is enrolled via context after refresh");
          setIsEnrolled(true);
          setLoading(false);
          return;
        }

        // Fallback to API check if context doesn't have the data
        console.log("Checking enrollment via API...");
        const data = await getCourseDetails(id);
        if (cancelled) return;

        console.log("API response:", data);
        const enrolled = Boolean(
          data?.is_enrolled ?? data?.is_enrollled ?? data?.enrolled
        );
        console.log("Enrollment status from API:", enrolled);

        setIsEnrolled(enrolled);
        if (!enrolled) {
          console.log("User not enrolled, redirecting to course details");
          router.replace(`/dashboard/courses/${id}?enroll_required=1`);
        }
      } catch (e) {
        console.error("Error checking enrollment:", e);
        // If API fails, check context as fallback
        if (isEnrolledFromContext) {
          console.log("API failed but user is enrolled via context");
          setIsEnrolled(true);
        } else {
          console.log(
            "API failed and user not enrolled via context, redirecting"
          );
          router.replace(`/dashboard/courses/${id}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (isPreview) {
      console.log("Preview mode, allowing access");
      setIsEnrolled(true);
      setLoading(false);
      return;
    }

    if (id) {
      console.log("Starting enrollment check for course ID:", id);
      checkEnrollment();
    }

    return () => {
      cancelled = true;
    };
  }, [id, router, isPreview, isEnrolledFromContext, enrolledCourses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268FB6] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking enrollment...</p>
        </div>
      </div>
    );
  }

  if (!isEnrolled) return null;

  return <CourseDetailsPage courseId={id} />;
}
