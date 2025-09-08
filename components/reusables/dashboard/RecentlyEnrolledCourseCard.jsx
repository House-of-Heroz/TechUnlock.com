"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const RecentlyEnrolledCourseCard = ({
  id,
  imageSrc,
  title,
  description,
  currentModule,
  progressPercentage,
  completedLessons,
  totalLessons,
}) => {
  // const progressPercentage = (completedLessons / totalLessons) * 100;
  const router = useRouter();

  return (
    <div className="w-full rounded-md overflow-hidden bg-white shadow flex flex-col justify-between">
      <div>
        <Image
          className="w-full h-24 sm:h-28 object-cover"
          src={imageSrc}
          width={500}
          height={200}
          alt="card Image"
        />
      </div>
      <div className="px-3 sm:px-6 py-3 sm:py-4 flex-grow">
        <div className="font-bold text-first-primary text-xs sm:text-sm mb-2 line-clamp-2">
          {title}
        </div>
        <p className="text-gray-900 text-xs sm:text-sm line-clamp-2">
          {description}
        </p>
      </div>

      <div className="space-y-2 sm:space-y-3 px-3 sm:px-6 py-2">
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <div className="font-semibold text-primary">
            Module: {completedLessons + 1}
          </div>
          <div className="text-xs sm:text-sm text-darkblue font-semibold">
            {completedLessons}/{totalLessons}{" "}
            <span className="text-primary font-semibold text-xs sm:text-sm">
              Lessons
            </span>
          </div>
        </div>
        <div className="flex items-center gap-x-2 sm:gap-x-4">
          <div className="w-[85%] sm:w-[90%] bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div
              className="bg-pri10 h-1.5 sm:h-2 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="flex items-center text-primary justify-center text-xs sm:text-sm font-semibold">
            {progressPercentage.toFixed(0)} <span>%</span>
          </span>
        </div>
      </div>
      <div
        className="mb-2 flex justify-end"
        onClick={() => router.push(`/dashboard/courses/${id}/watch`)}
      >
        <Button className="py-1.5 sm:py-2 text-primary bg-transparent flex items-center gap-x-2 sm:gap-x-4 text-xs sm:text-sm">
          Continue learning{" "}
          <ArrowRight size={14} className="sm:w-[18px] sm:h-[18px]" />
        </Button>
      </div>
    </div>
  );
};

export default RecentlyEnrolledCourseCard;
