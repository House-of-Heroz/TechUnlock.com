import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

const CourseOverviewCard = ({ title, count, image }) => {
  console.log(image);
  const router = useRouter();

  // Map card titles to tab names
  const getTabFromTitle = (title) => {
    const titleToTabMap = {
      Enrolled: "enrolled",
      Completed: "completed",
      Certification: "available", // Certification cards should go to available courses
    };
    return titleToTabMap[title] || "available";
  };

  return (
    <div className="bg-[#13485B] rounded-lg drop-shadow shadow text-white w-full">
      <div className="flex justify-between items-center px-3 lg:px-5 pb-3 pt-4">
        <div className="w-1/3">
          {image ? (
            <Image
              src={image}
              alt={title}
              className="w-12 h-12 lg:w-16 lg:h-16"
            />
          ) : (
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-black rounded" />
          )}
        </div>
        <div className="text-center w-1/3">
          <p className="text-xs lg:text-sm">{title}</p>
          <p className="text-lg lg:text-2xl font-semibold">{count}</p>
        </div>
        <div className="w-1/3"></div>
      </div>
      <hr className="" />
      <div
        className="flex items-center gap-3 lg:gap-5 justify-end px-3 lg:px-5 py-2 lg:py-3 cursor-pointer hover:bg-[#13485B]/90 transition-colors"
        onClick={() => {
          const tab = getTabFromTitle(title);
          router.push(`/dashboard/courses?tab=${tab}`);
        }}
      >
        <p className="text-xs lg:text-sm">View courses</p>
        <ArrowRight size={16} className="lg:w-5 lg:h-5" />
      </div>
    </div>
  );
};

export default CourseOverviewCard;
