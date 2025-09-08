import { courseType } from "@/data/dashboard";
import React from "react";
import CourseOverviewCard from "./CourseOverviewCard";

const CourseOverview = ({ items }) => {
  const data = Array.isArray(items) && items.length > 0 ? items : courseType;
  const enriched = data.map((item) => {
    const fallback = courseType.find((c) => c.name === item.name);
    return {
      ...item,
      icon: item.icon || fallback?.icon,
      value: item.value ?? fallback?.value ?? 0,
      id: item.id ?? fallback?.id ?? item.name,
    };
  });

  return (
    <div className="space-y-4 mb-6">
      <div className="font-semibold text-pri10">
        <p className="text-sm lg:text-base">Course overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-x-6">
        {/* Course cards */}
        {enriched.map((item) => (
          <CourseOverviewCard
            count={item.value}
            title={item.name}
            image={item.icon}
            key={item.id}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseOverview;
