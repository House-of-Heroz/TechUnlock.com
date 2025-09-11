import React from "react";
import Logo from "./Logo";
import { CloseIcon, SettingIcon } from "@/components/svgs";
import Navigation from "./Navigation";
import Link from "next/link";

const Sidebar = ({ onClose }) => {
  return (
    <div className="w-full h-full bg-sec10 flex items-center text-pri1">
      <div className="w-5/6 mx-auto h-5/6 flex flex-col justify-between">
        <div className="grid gap-y-6 lg:gap-y-10">
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between w-full">
            <Logo />
            {/* Mobile Close Button */}
            <button
              className="lg:hidden w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              onClick={onClose}
            >
              <CloseIcon className="w-4 h-4 text-[#13485B]" />
            </button>
          </div>

          {/* Navigation */}
          <div className="w-5/6 mx-auto">
            <Navigation />
          </div>
        </div>

        {/* Settings Link */}
        <Link
          href="/dashboard/settings"
          className="flex items-center justify-center border border-darkblue w-5/6 mx-auto rounded-md p-2 lg:p-3 mb-4 text-sm lg:text-base hover:bg-blue-50 transition-colors"
          onClick={onClose}
        >
          <SettingIcon />
          <p className="ml-3">Settings</p>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
