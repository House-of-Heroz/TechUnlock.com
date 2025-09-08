import React from "react";
import Image from "next/image";

import profileImage from "@/assets/dashboard/profileImage.svg";
import Link from "next/link";
import { useAuth } from "@/Context/auth";

const TopBanner = () => {
  const { auth } = useAuth();
  const firstName = auth?.first_name || auth?.user?.first_name || "";
  const lastName = auth?.last_name || auth?.user?.last_name || "";
  return (
    <div className="bg-white rounded w-full">
      {/* TOP BANNER BODY */}
      <div className="flex items-center gap-x-3 lg:gap-x-4 w-full lg:w-[97%] lg:ml-auto p-3 lg:p-0">
        <div className="flex-shrink-0">
          <Image
            src={profileImage}
            alt="Profile image"
            className="w-16 h-16 lg:w-20 lg:h-20 hover:scale-110 hover:delay-100 transition-all ease-in-out"
          />
        </div>

        <div className="text-sec10 font-bold space-y-2 lg:space-y-5">
          <p className="text-sm lg:text-base">
            Good to have you here{firstName || lastName ? ", " : ""}
            <span className="block sm:inline">
              {firstName} {lastName}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
