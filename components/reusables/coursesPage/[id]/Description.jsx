import React from "react";
import Image from "next/image";
import line from "@/assets/landing-page/Line.svg";

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

const Description = React.memo(({ course }) => {
  return (
    <div className="w-full">
      <div className="grid gap-y-5 lg:gap-y-0 lg:flex lg:justify-between lg:items-center w-full bg-pri1 py-[2rem] px-[2rem] lg:px-[3rem]">
        <div className="lg:w-[55%]">
          <div className="">
            <div className="relative w-4/5 ml-auto">
              <p className="relative">
                <Image
                  src={line}
                  alt="line"
                  width={200}
                  height={20}
                  className="absolute left-0 top-8 w-[54%] md:w-[25%] mx-auto"
                />
                <span className="text-center text-2xl font-semibold text-first-primary">
                  Description
                </span>
              </p>
            </div>

            <div className="grid gap-y-4 mt-5">
              <h3 className="text-pri10 font-semibold text-lg">
                {/* {course?.category === "UI/UX"
                  ? "Want to create digital products that are both beautiful and user-friendly?"
                  : course?.category === "WEB"
                  ? "Ready to transform your ideas into interactive, engaging websites?"
                  : course?.category === "CYBER"
                  ? "LEARN CYBER SECURITY FUNDAMENTALS"
                  : course?.category === "DM"
                  ? "Ready to take your business online and reach new heights?"
                  : "Curious about the future of technology? "} */}
                {course?.short_description}
              </h3>

              <p className="text-base">
                {/* {course?.category === "UI/UX"
                  ? "This comprehensive UI/UX course will equip you with the skills and knowledge to design intuitive, engaging, and visually stunning user experiences that leave a lasting impression."
                  : course?.category === "WEB"
                  ? "This comprehensive web development course will guide you from novice to proficient developer, empowering you to create professional-grade websites and web applications."
                  : course?.category === "CYBER"
                  ? "Are you looking to learn the basics of cyber security? Are you an aspiring IT professional that needs to better understand how cybersecurity works? If so, this is the perfect course for you!"
                  : course?.category === "DM"
                  ? "This dynamic digital marketing course will equip you with the strategies, tools, and knowledge to create a powerful online presence, attract new customers, and drive business growth."
                  : "This comprehensive AI course will introduce you to the fascinating world of Artificial Intelligence, empowering you to understand, explore, and even build AI applications. "} */}
                {course?.description}
              </p>

              {/* <p className="text-sm">
                {course?.category === "UI/UX" ? (
                  <div className="">
                    <p className="">
                      By the end of this course, you will be able to:
                    </p>
                    <ul className="list-disc">
                      <li className="">
                        Understand the principles of UI/UX design and apply them
                        to real-world projects.
                      </li>
                      <li className="">
                        Conduct user research and create user personas to guide
                        your design decisions.
                      </li>
                      <li className="">
                        Design intuitive and visually appealing interfaces using
                        popular design tools.
                      </li>
                      <li className="">
                        Create interactive prototypes and test them with users
                        for continuous improvement.
                      </li>
                      <li className="">
                        Develop a strong portfolio showcasing your UI/UX design
                        skills.
                      </li>
                    </ul>
                  </div>
                ) : course?.category === "WEB" ? (
                  <div className="">
                    <p className="">
                      By the end of this course, you will be able to:
                    </p>
                    <ul className="list-disc">
                      <li className="">
                        Build fully functional websites and web applications
                        from scratch.
                      </li>
                      <li className="">
                        Understand and apply essential web development
                        principles.
                      </li>
                      <li className="">
                        Utilize modern web technologies and tools like HTML,
                        CSS, JavaScript, and Node.js.
                      </li>
                      <li className="">
                        Develop a strong portfolio showcasing your web
                        development skills.
                      </li>
                      <li className="">
                        Confidently tackle real-world web development
                        challenges.
                      </li>
                    </ul>
                  </div>
                ) : course?.category === "CYBER" ? (
                  "In this course, we'll show you step-by-step, the fundamentals of cyber security, teaching you essential cyber security core principles you need to know, as well as enlightening you about the various types of cyber threats we face. If you're looking to advance or begin your career in Information Technology (IT), this course is a must!"
                ) : course?.category === "DM" ? (
                  <div className="">
                    <p className="">
                      By the end of this course, you will be able to:
                    </p>
                    <ul className="list-disc">
                      <li className="">
                        Create and execute successful digital marketing
                        campaigns across various platforms.
                      </li>
                      <li className="">
                        Optimize websites for search engines and drive organic
                        traffic.
                      </li>
                      <li className="">
                        Craft compelling content that engages your target
                        audience.
                      </li>
                      <li className="">
                        Utilize paid advertising platforms effectively to reach
                        new customers.
                      </li>
                      <li className="">
                        Analyze data to measure campaign performance and make
                        data-driven decisions.
                      </li>
                      <li className="">
                        Stay up-to-date with the latest trends and technologies
                        in digital marketing.
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="">
                    <p className="">
                      By the end of this course, you will be able to:
                    </p>
                    <ul className="list-disc ml-6 mt-1">
                      <li className="">
                        Understand the core concepts and applications of
                        Artificial Intelligence.
                      </li>
                      <li className="">
                        Apply machine learning and deep learning techniques to
                        solve real-world problems.
                      </li>
                      <li className="">
                        Build and deploy simple AI applications using popular
                        tools and libraries.
                      </li>
                      <li className="">
                        Engage in discussions about the ethical implications of
                        AI development.
                      </li>
                      <li className="">
                        Contribute to the exciting future of Artificial
                        Intelligence.
                      </li>
                    </ul>
                  </div>
                )}
              </p> */}
            </div>
          </div>
        </div>

        <div className="lg:w-[40%]">
          <Image
            src={
              course?.category === "UI/UX Design"
                ? course?.cover_image
                : course?.category === "Web Development"
                ? course?.cover_image
                : course?.category === "Cybersecurity"
                ? course?.cover_image
                : course?.category === "Digital Marketing"
                ? course?.cover_image
                : course?.cover_image
            }
            alt={course?.title}
            width={500}
            height={300}
          />
        </div>
      </div>
    </div>
  );
});

Description.displayName = "Description";

export default Description;
