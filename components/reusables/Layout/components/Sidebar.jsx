import React from "react";
import Logo from "./Logo";
import { CloseIcon, SettingIcon } from "@/components/svgs";
import Navigation from "./Navigation";
import Link from "next/link";

const Sidebar = ({ onClose }) => {
  return (
    <div className="w-64 lg:w-1/5 h-full bg-sec10 flex items-center text-pri1">
      <div className="w-5/6 mx-auto h-5/6 flex flex-col justify-between">
        <div className="grid gap-y-6 lg:gap-y-10">
          {/* the logo part */}
          <div className="flex items-center justify-between w-full">
            <Logo />
            <button className="lg:hidden" onClick={onClose}>
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navlink */}
          <div className="w-5/6 mx-auto">
            <Navigation />
          </div>
        </div>

        {/* far end bottom link */}
        <Link
          href="/dashboard/settings"
          className="flex items-center justify-center border border-darkblue w-5/6 mx-auto rounded-md p-2 lg:p-3 mb-4 text-sm lg:text-base"
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
