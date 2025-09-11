"use client";

import React, { useCallback } from "react";
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
import { ArrowRight } from "lucide-react";

const DEFAULT_IMAGE =
  "https://shutterstock.sa7eer.com/r/d/sstk?id1=search-top&id2=ca0645bb-b619-4749-9f27-4c4beb0f9b92&id3=737eaece-03c7-45a6-87b8-65a8cfadc948&u=https%3A%2F%2Fshutterstock.7eer.net%2Fc%2F38919%2F1636534%2F1305%3Fsharedid%3Ddirect%26subId1%3Dsearch-top%26subId2%3Dca0645bb-b619-4749-9f27-4c4beb0f9b92%26subId3%3D737eaece-03c7-45a6-87b8-65a8cfadc948%26u%3Dhttps%253A%252F%252Fwww.shutterstock.com%252Fimage-photo%252Fstack-books-against-background-library-front-2459213053";

const CourseCard = React.memo(
  ({ item, enrolledCourses = [], currentTab = "available" }) => {
    const router = useRouter();

    // Check if user is enrolled in this course
    const isEnrolled = enrolledCourses?.some(
      (enrolledCourse) => enrolledCourse.id === item?.id
    );

    const handleLearnMore = useCallback(() => {
      if (isEnrolled) {
        // If enrolled, go directly to watch page
        router.push(`/dashboard/courses/${item?.id}/watch`);
      } else {
        // If not enrolled, go to course details page
        router.push(`/dashboard/courses/${item?.id}`);
      }
    }, [router, item?.id, isEnrolled]);

    return (
      <div className="bg-pri1 rounded-md shadow-md drop-shadow-sm">
        <div className="bg-pri1  gap-x-3 items-center p-2 w-full rounded-md">
          <div className="">
            <Image
              src={item?.cover_image || DEFAULT_IMAGE}
              alt={item?.title || "Course cover"}
              className="w-full h-full rounded-md "
              width={500}
              height={500}
            />
          </div>

          <div className=" grid gap-y-3 p-3">
            <h1 className="text-xl text-pri10 font-semibold">
              {item?.title || ""}
            </h1>
            <div className="text-pri10">
              <p className="line-clamp-2 font-semibold text-sm">
                {item?.description || " "}
              </p>
            </div>

            <p className="flex gap-x-3 font-semibold items-center text-pri10 text-sm">
              <span>{item?.rating || 5}.0</span> <Rating rating={5} />
            </p>

            <div className="grid grid-cols-1 gap-3 text-pri10 font-semibold text-sm">
              <p className="flex items-center gap-x-3">
                <TimeIcon />{" "}
                <span className="">Duration: {item?.duration || ""}</span>
              </p>
              <p className="flex items-center gap-x-3">
                <LevelIcon />{" "}
                <span className="">Training level: {item?.level || ""}</span>
              </p>
              <p className="flex items-center gap-x-3">
                <ModuleIcon />{" "}
                <span className="">Module: {item?.modules?.length || 0}</span>
              </p>
              <p className="flex items-center gap-x-3">
                <CertificateIcon />{" "}
                <span className="">
                  {item?.badge_detail && "Badge of completion"}
                </span>
              </p>
            </div>

            <div className="flex justify-center mt-3">
              <Button
                className="text-[#268FB6] hover:bg-[#268FB6]/50 hover:text-white bg-transparent flex items-center gap-x-3 hover:underline"
                onClick={handleLearnMore}
              >
                {isEnrolled && currentTab === "enrolled"
                  ? "Continue Learning"
                  : isEnrolled
                  ? "Continue Learning"
                  : "Learn More"}{" "}
                <ArrowRight size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CourseCard.displayName = "CourseCard";

export default CourseCard;
