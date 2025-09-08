import React from "react";
import Link from "next/link";
import RecentlyEnrolledCourseCard from "./RecentlyEnrolledCourseCard";
import { useCourses } from "@/Context/courses";

const RecentlyEnrolledCourse = ({ isNotEnrolled }) => {
  const { enrolledCourses } = useCourses();
  console.log(isNotEnrolled);

  return (
    <div className="bg-pri1 py-4 px-3 lg:px-5 rounded-md mb-6">
      <div className="space-y-4 lg:space-y-5">
        <p className="font-semibold text-pri10 flex items-center justify-between text-sm lg:text-base">
          Recently enrolled courses{" "}
          <Link
            href="/dashboard/courses"
            className="underline text-xs lg:text-sm"
          >
            View more
          </Link>
        </p>
        {isNotEnrolled ? (
          <div className="grid text-center text-lg lg:text-xl font-semibold gap-y-2 py-3">
            <p className="text-pri10">You are yet to enroll for a course.</p>
            <Link href="/enroll" className="text-primary underline">
              Enroll now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {enrolledCourses.map((item, index) => (
              <RecentlyEnrolledCourseCard
                key={index}
                id={item.id}
                imageSrc={item.image_url}
                title={item.title}
                description={item.description || ""}
                currentModule={item.total_modules}
                completedLessons={item.completed_modules}
                progressPercentage={item.progress_percentage}
                totalLessons={item.total_modules}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyEnrolledCourse;
