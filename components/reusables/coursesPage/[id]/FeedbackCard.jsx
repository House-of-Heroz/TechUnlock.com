import React from "react";
import testimony from "@/assets/course-page/feedback.svg";
import Image from "next/image";

const FeedbackCard = ({ course, image, name, review }) => {
  const fullCategoryName = course?.category;

  return (
    <div className="bg-pri1 rounded">
      {/* The actual container holding the data */}
      <div className="p-4 flex justify-between items-start gap-x-[2rem]">
        {/* The container holdiing the reviewr's data */}
        <div className="w-2/5 grid gap-y-2">
          {/* reviewr's image */}
          <Image
            src={image}
            alt="testimonial image"
            className="w-52 h-48 object-cover"
          />
          {/* reviewer information */}
          <div className="grid gap-1">
            <p className="text-base font-semibold">{name}</p>
            <p className="text-darkblue text-sm">{fullCategoryName} Student</p>
          </div>
        </div>

        {/* The container holding the review message */}
        <div className="grid gap-y-8 w-3/5">
          {/* Review */}
          <div className="font-semibold text-4xl grid gap-y-2">
            <p className="">“</p>

            <h3 className="font-normal text-base">{review}</h3>

            <p className="text-right">”</p>
          </div>

          {/* Review date */}
          <p className="font-semibold text-darkblue text-right">
            22nd May, 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
