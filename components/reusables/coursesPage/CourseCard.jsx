"use client";

import React, { useEffect, useState, useMemo } from "react";
import Rating from "../landingPage/Rating";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  CertificateIcon,
  LevelIcon,
  ModuleIcon,
  TimeIcon,
} from "@/components/svgs";
import Image from "next/image";
import { useCourses } from "@/Context/courses";

const CourseCard = React.memo(({ item }) => {
  const router = useRouter();
  const { courses } = useCourses();
  const [Courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    if (courses) {
      setCourses(courses.courses);
      setEnrolledCourses(courses.enrolled_courses);
    }
  }, [courses]);

  // Check if the current course is enrolled - memoized for performance
  const isEnrolled = useMemo(
    () =>
      enrolledCourses?.some(
        (enrolled) =>
          enrolled?.id === item?.id ||
          enrolled?.id === parseInt(item?.id) ||
          parseInt(enrolled?.id) === item?.id ||
          parseInt(enrolled?.id) === parseInt(item?.id)
      ),
    [enrolledCourses, item.id]
  );

  const handleCourseClick = () => {
    router.push(`/courses/${item?.id}`);
  };

  return (
    <div className="bg-pri1 rounded-md shadow-md">
      <div className="bg-pri1 grid lg:flex gap-x-3 lg:items-center p-2 w-full rounded-md">
        <div className="lg:w-1/3">
          <Image
            src={item?.cover_image || "/placeholder.svg"}
            alt={item?.title || "Course cover"}
            className="w-full h-full rounded-md"
            width={300}
            height={300}
          />
        </div>

        <div className="pl-3 lg:w-2/3 grid lg:gap-y-6 gap-y-3 py-3">
          <div className="flex justify-between items-start w-[90%]">
            <h1 className="text-2xl text-darkblue font-semibold">
              {item?.title}
            </h1>
            <Rating rating={5} />
          </div>

          <div className="text-gray-900">
            <p>{item?.short_description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-darkblue font-semibold">
            <p className="flex items-center gap-x-3">
              <TimeIcon /> <span>Duration: {item?.duration}</span>
            </p>
            <p className="flex items-center gap-x-3">
              <LevelIcon />{" "}
              <span>Training level: {item?.difficulty || "Beginner"}</span>
            </p>
            <p className="flex items-center gap-x-3">
              <ModuleIcon />{" "}
              <span>
                Module: {item?.total_modules || item?.modules?.length}
              </span>
            </p>
            <p className="flex items-center gap-x-3">
              <CertificateIcon />{" "}
              <span>{item?.badge_detail ? "Badge of completion" : ""}</span>
            </p>
          </div>

          <div className="flex justify-center lg:justify-end lg:mr-4">
            <Button
              className="bg-primary text-white"
              onClick={handleCourseClick}
            >
              {isEnrolled ? "Enrolled" : "More training details"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

CourseCard.displayName = "CourseCard";

export default CourseCard;
