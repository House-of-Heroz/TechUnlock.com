"use client";

import React from "react";
import Image from "next/image";
import line from "@/assets/landing-page/Line.svg";
import FeedbackCard from "./FeedbackCard";
import angleUp from "@/assets/course-page/ColouredUpAngle.svg";
import angleDown from "@/assets/course-page/ColouredDownAngle.svg";

// Images
import ImageOne from "@/assets/course-page/feedback.jpg";
import ImageTwo from "@/assets/course-page/feedback-1.jpg";
import ImageThree from "@/assets/course-page/feedback-2.jpg";
import ImageFour from "@/assets/course-page/feedback-3.jpg";
import ImageFive from "@/assets/course-page/feedback-4.jpg";
import ImageSix from "@/assets/course-page/feedback-5.jpg";
import ImageSeven from "@/assets/course-page/feedback-6.jpg";
import ImageEight from "@/assets/course-page/feedback-7.jpg";
import ImageNine from "@/assets/course-page/feedback-8.jpg";
import ImageTen from "@/assets/course-page/feedback-9.jpg";

const reviews = {
  "UI/UX Design": [
    {
      name: "Bankole",
      review:
        "This training platform re-ignited my love for tech and I am happy to learn from brilliant tutors here on TechUnlock.",
    },
    {
      name: "Davidson",
      review:
        "It is by far the best tech training academy I have learned from. I must say a big thank you to the tutors for their brilliance and skill.",
    },
    {
      name: "Ayoola",
      review:
        "I learned more than just tech skills here. I learned to be a better marketer and entrepreneur.",
    },
  ],
  "Web Development": [
    {
      name: "Godwin",
      review:
        "I will gladly recommend this training to anyone looking to skill up or even start a career in tech.",
    },
    {
      name: "Chisom (Sickle Cell Warrior)",
      review:
        "I learned a skill that will always be with me and I will be able to use it to get a job remotely.",
    },
    {
      name: "Olaitan",
      review:
        "There are many other learning platforms, but TechUnlock will take your learning journey personal and see to it that you grow.",
    },
  ],
  Cybersecurity: [
    {
      name: "Christopher",
      review:
        "I now know many ways to stay safe and secure my digital assets on the web, thanks to TechUnlock.",
    },
    {
      name: "Rofiat",
      review:
        "Thank you TechUnlock. I passed my ISC2 international certified exams. I am now an intern at Cybervergent.",
    },
    {
      name: "Nsikak",
      review:
        "It’s not just the training for me, it’s the collaboration, the opportunity, and the learning environment.",
    },
  ],
  "Digital Marketing": [
    {
      name: "Petra",
      review:
        "Thank you TechUnlock Nigeria, I learned a new skill and I am already applying it in a real-life project.",
    },
    {
      name: "Tolu",
      review:
        "Wow! I got exposed to an international project working with a well-experienced team, all thanks to TechUnlock.",
    },
    {
      name: "Victoria",
      review:
        "The training facility was very convenient for me and my 9-month-old baby. The staff and trainers are very accommodating and professional.",
    },
  ],
  default: [
    {
      name: "Adetola",
      review:
        "I wasn’t confident about my skillset before, but now, I am certain I can take up any task in development.",
    },
    {
      name: "Ifeatu, student",
      review:
        "The exposure is great for students, newbies, and professionals at all levels.",
    },
  ],
};

const getRandomReview = (category) => {
  const categoryReviews = reviews[category] || reviews["default"];
  const randomIndex = Math.floor(Math.random() * categoryReviews.length);
  return categoryReviews[randomIndex];
};

const FeedbackContainer = ({ course }) => {
  const reviewOne = getRandomReview(course?.category);
  const reviewTwo = getRandomReview(course?.category);

  return (
    <div className="relative my-[2rem] lg:h-[60vh] lg:my-[4rem]">
      {/* <div className="absolute hidden lg:block -top-1/4 left-0 w-1/5 h-[60vh] overflow-hidden ">
        <Image
          src={angleDown}
          alt="Decorative angle"
          layout="fill"
          objectFit="contain"
          objectPosition="top left"
        />
      </div> */}

      <div className="relative mb-6 ml-5 lg:ml-16">
        <p className="relative grid">
          <Image
            src={line}
            alt="line"
            className="absolute left-0 top-8 w-[31%] md:w-[10%] mx-auto"
          />
          <span className="text-left text-2xl font-semibold text-pri10">
            Feedbacks
          </span>
        </p>
      </div>

      <div className="relative grid lg:flex lg:justify-between lg:gap-x-6 gap-y-3 lg:gap-y-0 w-[90%] mx-auto z-30">
        <FeedbackCard
          course={course}
          image={
            course?.category === "UI/UX Design"
              ? ImageOne
              : course?.category === "Web Development"
              ? ImageFour
              : course?.category === "Cybersecurity"
              ? ImageTwo
              : course?.category === "Digital Marketing"
              ? ImageThree
              : ImageFive
          }
          name={reviewOne?.name}
          review={reviewOne?.review}
        />
        <FeedbackCard
          course={course}
          image={
            course?.category === "UI/UX Design"
              ? ImageSix
              : course?.category === "Web Development"
              ? ImageSeven
              : course?.category === "Cybersecurity"
              ? ImageEight
              : course?.category === "Digital Marketing"
              ? ImageNine
              : ImageTen
          }
          name={reviewTwo?.name}
          review={reviewTwo?.review}
        />
      </div>
      {/* <div className="absolute hidden lg:block -bottom-1/2 right-0 w-1/5 h-[60vh] overflow-hidden ">
        <Image
          src={angleUp}
          alt="Decorative angle"
          layout="fill"
          objectFit="contain"
          objectPosition="bottom right"
        />
      </div> */}
    </div>
  );
};

export default FeedbackContainer;
