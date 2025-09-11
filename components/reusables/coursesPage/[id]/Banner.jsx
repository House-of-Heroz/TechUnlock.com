"use client";

import React from "react";
import Image from "next/image";
import { BannerCard } from "./BannerCard";
import Rating from "../../landingPage/Rating";

//IMAGES

// UI/UX
import UIBanner from "@/assets/course-page/UIBanner.svg";

// AI
import AIBanner from "@/assets/course-page/AICard.svg";

// Web Development
import WebBanner from "@/assets/course-page/webDevBanner.svg";

// cybersecurity
import cyber from "@/assets/course-page/cyber.jpg";

// DM
import DM from "@/assets/course-page/DMCard.svg";

const Banner = ({ course }) => {
  const fullCategoryName = course?.category;
  return (
    <div className="">
      <div className="relative lg:h-[80vh] w-full lg:flex lg:items-end lg:justify-center bg-gradient-to-tr from-[#13485B] to-[#06212B]">
        <Image
          src={
            course?.category === "UI/UX Design"
              ? UIBanner
              : course?.category === "Web Development"
              ? WebBanner
              : course?.category === "Cybersecurity"
              ? cyber
              : course?.category === "Digital Marketing"
              ? DM
              : AIBanner
          }
          alt="course banner"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-20"
        />

        <div className="relative grid lg:flex lg:justify-between gap-x-6 lg:h-[60vh] w-[95%] mx-auto py-10 lg:py-0 lg:pb-10 gap-y-6 lg:gap-y-0">
          <div className="flex flex-col justify-between lg:w-[65%] text-[#FCFCFD] gap-y-3 lg:gap-y-0">
            <h1 className=" text-[#FCFCFD] font-semibold text-3xl md:text-2xl">
              {/* Get started with your{" "}
              <span className="font-bold text-pri1"> {fullCategoryName} </span>{" "}
              Journey today. */}
              {course?.title}
            </h1>

            <p className="text-lg">
              {/* {course?.description === "UI/UX"
                ? "Learn how to design user friendly digital products that work, in this intensive course. Understand the fundamentals of design processes and how you can transform user experiences through functional product designs."
                : course?.description === "WEB"
                ? "Unleash your web development potential with our expert-led course. Master Python, HTML, & CSS through hands-on projects, gaining skills for a career in web design or enhancing your current abilities."
                : course?.description === "CYBER"
                ? "Designed for individuals with little to no prior experience in the field, this course provides a solid foundation in cybersecurity essentials. Whether you're a curious enthusiast or considering a career switch, you'll gain practical knowledge and skills to navigate the digital landscape securely."
                : course?.description === "DM"
                ? "Explore the possibilities of building and growing a business and scaling using social media marketing channels, email marketing affiliate marketing, SMS marketing, content marketing and other social media channels."
                : "Start your journey to becoming and AI Certified professional. From Beginner to intermediate level of proficiency. Our Applied Artificial Intelligence course module builds the foundation for you to excel in your career and professional pursuit."} */}
              {course?.short_description}
            </p>

            <div className="lg:w-2/4 bg-[#FFFFFF]/40 backdrop-blur-lg drop-shadow-md px-5 py-3 rounded-md text-sm space-y-4">
              <div className="flex justify-between items-start">
                <p className="text-sm">
                  {course?.title}{" "}
                  <span>
                    {!course?.is_paid
                      ? "(Free)"
                      : `(# ${Number(course?.price).toFixed(0)})`}
                  </span>
                </p>
                <Rating rating={course?.rating || 4.5} />
              </div>
              <div className="flex justify-between">
                <p className="">
                  Rating: <span>{course?.rating || 5.0}</span>
                </p>
                <p className="">
                  Total Enrolled:{" "}
                  <span>{course?.enrolled_learners || "0"}</span>
                </p>
              </div>

              {/* <div className="flex justify-between items-center">
                <p className="">
                  Start Date: <span>{course?.start_date || ""}</span>
                </p>
                <p className="">
                  Start Time: <span>{course?.start_time || ""}</span>
                </p>
              </div> */}
            </div>
          </div>

          <div className="mt-4 lg:absolute lg:-bottom-12 right-0 z-20 lg:w-[30%] lg:ml-auto">
            <BannerCard course={course} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
