"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, BookOpen, GraduationCap, Award } from "lucide-react";
import { useCourses } from "@/Context/courses";
import { getEnrolledCourses, getCompletedCourses } from "@/services/course";
import CourseCard from "@/components/reusables/dashboard/CourseCard";
import CourseContent from "@/components/reusables/dashboard/CourseContent";
import { EnrolledIcon, CompletedCoursesIcon } from "@/components/svgs";

const CoursesPage = () => {
  const { courses } = useCourses();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("available");
  const [searchTerm, setSearchTerm] = useState("");
  const [hasEnrolled, setHasEnrolled] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);

  // Valid tab values
  const validTabs = ["available", "enrolled", "completed"];

  useEffect(() => {
    // Check for tab query parameter on component mount
    const tabParam = searchParams.get("tab");
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadEnrolledCourses = async () => {
      try {
        const data = await getEnrolledCourses();
        setHasEnrolled(Boolean(data?.enrolled_courses?.length));
        setEnrolledCourses(data?.enrolled_courses || []);
      } catch (error) {
        console.error("Error loading enrolled courses:", error);
      }
    };

    const loadCompletedCourses = async () => {
      try {
        const data = await getCompletedCourses();
        setHasCompleted(Boolean(data?.completed_courses?.length));
        setCompletedCourses(data?.completed_courses || []);
      } catch (error) {
        console.error("Error loading completed courses:", error);
      }
    };

    loadEnrolledCourses();
    loadCompletedCourses();
  }, []);

  const tabs = [
    { id: "available", name: "Courses" },
    { id: "enrolled", name: "Enrolled Courses" },
    { id: "completed", name: "Completed Courses" },
  ];

  const filteredCourses = courses?.courses?.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Update URL query parameter
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabId);
    router.push(`?${params.toString()}`);
  };

  const renderAvailableCourses = () => (
    <div className="space-y-6">
      <div className="relative w-full md:w-1/2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search for courses"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses?.map((item) => (
          <CourseCard
            item={item}
            key={item.id}
            enrolledCourses={enrolledCourses}
            currentTab={activeTab}
          />
        ))}
      </div>

      {filteredCourses?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No courses found matching your search.
          </p>
        </div>
      )}
    </div>
  );

  const renderEnrolledCourses = () => (
    <div className="h-full w-full">
      {hasEnrolled && enrolledCourses.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((item) => (
              <CourseCard
                item={item}
                key={item.id}
                enrolledCourses={enrolledCourses}
                currentTab={activeTab}
              />
            ))}
          </div>
        </div>
      ) : (
        <CourseContent
          courseIcon={<EnrolledIcon />}
          title="Enrolled courses"
          mainMessage="You are yet to enroll for a course."
          subMessage="Enroll now."
        />
      )}
    </div>
  );

  const renderCompletedCourses = () => (
    <div className="h-full">
      {hasCompleted && completedCourses.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCourses.map((item) => (
              <CourseCard
                item={item}
                key={item.id}
                enrolledCourses={enrolledCourses}
                currentTab={activeTab}
              />
            ))}
          </div>
        </div>
      ) : (
        <CourseContent
          courseIcon={<CompletedCoursesIcon />}
          title="Completed courses"
          mainMessage="You are yet to complete a course."
          subMessage="Continue learning."
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Courses</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg w-fit">
        <div className="bg-[#EAF7FC] w-fit rounded-lg">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium text-sm flex items-center rounded-lg space-x-2 ${
                  activeTab === tab.id
                    ? "bg-[#268FB6] text-white"
                    : "text-[#268FB6]"
                }`}
              >
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "available" && renderAvailableCourses()}
          {activeTab === "enrolled" && renderEnrolledCourses()}
          {activeTab === "completed" && renderCompletedCourses()}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
