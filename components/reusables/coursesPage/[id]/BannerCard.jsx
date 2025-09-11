"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import physicalClass from "@/assets/course-page/physicalClass.jpg";
import mentor from "@/assets/course-page/withTutor.svg";

// images

// UI/UX
import UICard from "@/assets/course-page/UICard.svg";

// web development
import webDev from "@/assets/course-page/webDevCard.svg";

// cybersecurity
import cyberSec from "@/assets/course-page/cybersecurityCard.svg";

// DM
import DMCard from "@/assets/course-page/DMCard.svg";

// AI
import AI from "@/assets/course-page/AICard.svg";
import { Check } from "lucide-react";
import { useCourses } from "@/Context/courses";
import { useAuth } from "@/Context/auth";
import { enrollInCourse } from "@/services/course";
import { showErrorToast, showSuccessToast } from "@/helpers/toastUtil";

export const BannerCard = ({ course }) => {
  const { courses, fetchEnrolledCourses } = useCourses();
  const { auth } = useAuth();
  const [Courses, setCourses] = React.useState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("onsite");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const router = useRouter();

  const Images = [
    {
      id: 1,
      image:
        course?.category === "UI/UX Design"
          ? UICard
          : course?.category === "Web Development"
          ? webDev
          : course?.category === "Cybersecurity"
          ? cyberSec
          : course?.category === "Digital Marketing"
          ? DMCard
          : AI,
      option: "pace",
    },
    { id: 2, image: physicalClass, option: "onsite" },
    { id: 3, image: mentor, option: "tutor" },
  ];

  useEffect(() => {
    setCourses(courses);
  }, [courses]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === Images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [Images.length]);

  useEffect(() => {
    setSelectedOption(Images[currentIndex].option);
  }, [currentIndex]);

  const handleChange = (value) => {
    setSelectedOption(value);
    const newIndex = Images.findIndex((image) => image.option === value);
    setCurrentIndex(newIndex);
  };

  const getLabelClass = (value) => {
    return selectedOption === value ? "text-gray-800 " : "text-white ";
  };

  // Check if course is free and beginner level
  const isFreeBeginner =
    !course?.is_paid || course?.difficulty?.toLowerCase() === "beginner";

  // Handle enrollment with authentication check
  const handleEnrollment = async () => {
    // Check if user is authenticated
    if (!auth) {
      showErrorToast("Please log in to enroll in courses");
      router.push("/login");
      return;
    }

    // Check if already enrolled
    const isAlreadyEnrolled =
      course?.id ===
      Courses?.enrolled_courses?.find((item) => item?.id === course?.id);
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

        // Refresh enrolled courses in context
        await fetchEnrolledCourses();

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
    <div className="relative w-full max-w-3xl mx-auto bg-[#FFFFFF]/20 rounded-md drop-shadow-lg backdrop-blur-lg px-3 py-2 border border-gray-900">
      {/* Images */}
      <div className="relative h-52">
        {Images.map((imageObj, index) => (
          <div
            key={imageObj.id}
            className={cn("absolute inset-0 transition-opacity duration-1000", {
              "opacity-0": index !== currentIndex,
              "opacity-100": index === currentIndex,
            })}
          >
            <Image
              src={imageObj.image}
              alt={`Slide ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center items-center px-1 py-1 bg-sec10 w-fit mx-auto rounded-xl my-2">
        {Images.map((_, index) => (
          <button
            key={index}
            className={cn("h-2 w-2 rounded-full mx-1 transition-colors", {
              "bg-white": index !== currentIndex,
              "bg-primary h-3 w-3": index === currentIndex,
            })}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Radio group */}
      <div className="mt-3 px-3">
        <RadioGroup
          value={selectedOption}
          className="grid gap-y-3"
          onValueChange={handleChange}
        >
          <div className="flex items-center space-x-4">
            <RadioGroupItem value="pace" id="pace" />
            <Label htmlFor="pace" className={getLabelClass("pace")}>
              <span className="capitalize">
                {course?.difficulty || "Beginner"}
              </span>{" "}
              class
            </Label>
          </div>
          <div className="flex items-center space-x-4">
            <RadioGroupItem value="onsite" id="onsite" />
            <Label htmlFor="onsite" className={getLabelClass("onsite")}>
              Physical classes are available
            </Label>
          </div>

          <div className="flex items-center space-x-4">
            <RadioGroupItem value="tutor" id="tutor" />
            <Label htmlFor="tutor" className={getLabelClass("tutor")}>
              Online class with a tutor
            </Label>
          </div>
        </RadioGroup>
        <div className="text-sm text-white font-medium space-y-2 mt-3">
          <p className="flex items-center gap-x-4">
            <Check className="text-red-400" size={18} /> Certification
          </p>

          <p className="flex items-center gap-x-4">
            <Check className="text-red-400" size={18} /> Work on real life
            projects
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full mt-4 px-4 pb-3">
        <Button
          onClick={handleEnrollment}
          className="w-full"
          disabled={
            isEnrolling ||
            course?.id ===
              Courses?.enrolled_courses?.find((item) => item?.id === course?.id)
          }
        >
          {isEnrolling
            ? "Enrolling..."
            : course?.id ===
              Courses?.enrolled_courses?.find((item) => item?.id === course?.id)
            ? "Already enrolled"
            : isFreeBeginner
            ? "Enroll Now (Free)"
            : "Enroll Now"}
        </Button>
        {/* <Button variant="outline">Save for Later</Button> */}
      </div>
    </div>
  );
};
