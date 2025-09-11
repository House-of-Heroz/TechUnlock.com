"use client";

import React from "react";
import Image from "next/image";
import Accordion from "@/components/reusables/Accordion";
import line from "@/assets/landing-page/Line.svg";
import {
  CertificateIcon,
  LevelIcon,
  ModuleIcon,
  TimeIcon,
} from "@/components/svgs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/Context/auth";
import { useCourses } from "@/Context/courses";
import { enrollInCourse } from "@/services/course";
import { showErrorToast, showSuccessToast } from "@/helpers/toastUtil";
import { useState } from "react";

const Overview = ({ course }) => {
  const router = useRouter();
  const { auth } = useAuth();
  const { enrolledCourses } = useCourses();
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Check if course is free and beginner level
  const isFreeBeginner =
    !course?.is_paid && course?.difficulty?.toLowerCase() === "beginner";

  // Check if already enrolled
  const isAlreadyEnrolled = enrolledCourses?.some(
    (enrolledCourse) => enrolledCourse.id === course?.id
  );

  // Handle enrollment with authentication check
  const handleEnrollment = async () => {
    // Check if user is authenticated
    if (!auth) {
      showErrorToast("Please log in to enroll in courses");
      router.push("/login");
      return;
    }

    // Check if already enrolled
    if (isAlreadyEnrolled) {
      showSuccessToast("You are already enrolled in this course");
      router.push(`/dashboard/courses/${course.id}/watch`);
      return;
    }

    try {
      setIsEnrolling(true);

      // For free beginner courses, enroll directly
      if (isFreeBeginner) {
        const result = await enrollInCourse(course.id);
        showSuccessToast(result.message || "Successfully enrolled in course!");
        router.push(`/dashboard/courses/${course.id}/watch`);
      } else {
        // For paid courses or non-beginner courses, go to payment page
        router.push(`/courses/${course.id}/pay`);
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      if (error.message === "AUTH_REQUIRED") {
        showErrorToast("Please log in to enroll in courses");
        router.push("/login");
      } else {
        showErrorToast(error.message || "Failed to enroll in course");
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="w-full bg-white py-[2rem] px-[1rem] md:px-[3rem]">
      <div className="grid gap-y-4">
        <div className="md:flex items-end md:justify-between md:w-1/2 md:pr-5">
          <h3 className="text-pri10 font-semibold text-2xl">{course?.title}</h3>
          <p className="cursor-pointer border border-pri10 rounded p-1 text-sm w-fit text-pri10 font-semibold whitespace-nowrap mt-2 lg:mt-0">
            Training fee:{" "}
            {course?.is_paid ? `#${Number(course?.price)?.toFixed(0)}` : "Free"}
          </p>
        </div>

        <div className="lg:flex lg:justify-between gap-y-4 w-full mt-5">
          {/* Course overview */}
          <div className="w-full gap-y-4 lg:gap-y-0 lg:w-[45%] flex flex-col justify-between">
            <div className="">
              <div className="grid gap-2 text-darkblue font-semibold">
                <p className="flex items-center gap-x-3">
                  <TimeIcon />{" "}
                  <span className="">
                    Time and Duration: {course?.duration}
                  </span>
                </p>
                <p className="flex items-center gap-x-3">
                  <LevelIcon />{" "}
                  <span className="">
                    Training level: {course?.difficulty || "Beginner"}
                  </span>
                </p>
                <p className="flex items-center gap-x-3">
                  <ModuleIcon />{" "}
                  <span className="">
                    Module:{" "}
                    {course?.number_of_modules || course?.modules?.length}
                  </span>
                </p>
                <p className="flex items-center gap-x-3">
                  <CertificateIcon />{" "}
                  <span className="">
                    {course?.badge_detail && "Badge of completion"}
                  </span>
                </p>
              </div>
              <div className="mt-4">
                <h4 className="text-pri10 font-semibold text-lg">
                  Skills you will learn
                </h4>
                <div className="flex flex-wrap gap-3 text-xs mt-2">
                  {course?.course_skills?.map((item) => (
                    <span
                      className="border border-primary py-1 px-2 rounded text-primary font-medium cursor-pointer"
                      key={item?.id}
                    >
                      {item.name}
                    </span>
                  ))}
                  {course?.tag_names?.map((item) => (
                    <span
                      className="border border-primary py-1 px-2 rounded text-primary font-medium cursor-pointer"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-3 lg:mt-0">
              <Button
                className="bg-primary text-white"
                onClick={handleEnrollment}
                disabled={isEnrolling || isAlreadyEnrolled}
              >
                {isEnrolling
                  ? "Enrolling..."
                  : isAlreadyEnrolled
                  ? "Already Enrolled"
                  : isFreeBeginner
                  ? "Enroll Now (Free)"
                  : "Enroll now"}
              </Button>
            </div>
          </div>

          {/* Curriculum */}
          <div className="w-full lg:w-[50%] grid gap-y-5 shadow-md p-4 rounded">
            <div className="relative">
              <p className="relative grid">
                <Image
                  src={line}
                  alt="line"
                  className="absolute left-0 top-8 w-[42%] md:w-[25%] mx-auto"
                />
                <span className="text-2xl font-semibold text-first-primary">
                  Curriculum
                </span>
              </p>
            </div>

            <div className="">
              <Accordion items={course?.modules} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
