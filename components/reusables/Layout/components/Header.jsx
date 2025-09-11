"use client";

import React, { useState } from "react";
import SearchBar from "./SearchBar";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { useAuth } from "@/Context/auth";
import Link from "next/link";
import { removeToken } from "@/helpers/removeToken";
import { useRouter } from "next/navigation";

const Header = ({ onMenuClick }) => {
  const [data, setData] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { auth } = useAuth();
  const router = useRouter();

  const handleDropDown = () => {
    setProfileOpen(!profileOpen);
  };

  const firstName = auth?.first_name || auth?.user?.first_name || "Guest";
  const lastName = auth?.last_name || auth?.user?.last_name || "";
  const initials = `${(firstName || "G").charAt(0)}${(lastName || "").charAt(
    0
  )}`.toUpperCase();
  const fullName = `${firstName}${lastName ? ` ${lastName}` : ""}`;

  const logout = async () => {
    await removeToken();
    router.push("/login");
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>

        {/* Search bar - hidden on mobile, visible on larger screens */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <SearchBar setData={setData} />
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative flex items-center space-x-2 sm:space-x-3">
            <span className="h-8 w-8 sm:h-10 sm:w-10 text-sm sm:text-lg text-pri1 font-semibold bg-[#268FB6] rounded-full flex items-center justify-center">
              {initials}
            </span>

            <div className="relative cursor-pointer" onClick={handleDropDown}>
              <div className="flex items-center justify-between bg-white rounded-md border border-pri1 p-2 sm:p-3 shadow-md text-xs sm:text-sm min-w-[120px] sm:min-w-[200px]">
                <p className="font-semibold line-clamp-1 text-ellipsis text-[#344054] hidden sm:block">
                  Welcome, {fullName}
                </p>
                <p className="font-semibold line-clamp-1 text-ellipsis text-[#344054] sm:hidden">
                  {fullName}
                </p>
                {profileOpen ? (
                  <ChevronUp
                    size={16}
                    className="sm:w-[18px] sm:h-[18px] flex-shrink-0"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    className="sm:w-[18px] sm:h-[18px] flex-shrink-0"
                  />
                )}
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white border rounded-md text-xs sm:text-sm shadow-md z-10">
                  <Link
                    href="/profile"
                    className="block py-2 pl-4 hover:bg-gray-50 transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block py-2 pl-4 hover:bg-gray-50 transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left py-2 pl-4 hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
