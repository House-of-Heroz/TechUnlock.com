"use client";

import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@/Context/auth";
import { showErrorToast } from "@/helpers/toastUtil";

const PromotionBanner = () => {
  const { id } = useParams();
  const router = useRouter();
  const { auth } = useAuth();

  const handleEnroll = () => {
    // Check if user is authenticated
    if (!auth) {
      showErrorToast("Please log in to enroll in courses");
      router.push("/login");
      return;
    }

    // Navigate to payment page
    router.push(`/courses/${id}/pay`);
  };

  return (
    <div className="relative bg-pri10 w-[90%] mx-auto mb-[3rem] rounded z-40">
      <div className="flex flex-col items-center justify-center py-5 gap-y-7 w-5/6 mx-auto text-center">
        <h1 className="text-lg font-semibold text-white w-5/6 mx-auto">
          Want to join our classes and learn at your own pace?
        </h1>
        <p className="text-base text-pri1 text-center w-[90%]">
          Would you like to participate in the physical bootcamp? Click on the
          button below to register, a mail will be sent to you for more
          information.
        </p>

        <Button
          className="px-6 py-2 rounded-xl bg-[#2FB3E3] text-pri1 font-medium header-button"
          onClick={handleEnroll}
        >
          Enroll for our physical class
        </Button>
      </div>
    </div>
  );
};

export default PromotionBanner;
