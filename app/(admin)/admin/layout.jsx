"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/Context/auth";
import { useRouter } from "next/navigation";
import { removeToken } from "@/helpers/removeToken";
import Link from "next/link";
import {
  Search,
  Bell,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Menu,
  X,
  Lock,
} from "lucide-react";
import AdminNavigation from "@/components/reusables/Layout/components/AdminNavigation";
import Logo from "@/components/reusables/Layout/components/Logo";
import AdminLogo from "@/components/reusables/Layout/components/admin-logo";
import NotificationDropdown from "@/components/reusables/Layout/components/NotificationDropdown";

const AdminLayout = ({ children }) => {
  const { auth } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const userType =
    typeof auth?.user_type === "string" ? auth.user_type : undefined;
  const isAdmin =
    userType === "Super Admin" ||
    userType === "Admin" ||
    userType === "Trainer" ||
    Boolean(
      auth?.is_admin_user ||
        auth?.is_admin ||
        auth?.is_staff ||
        auth?.is_superuser
    );

  useEffect(() => {
    if (auth && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [auth, isAdmin, router]);

  const handleDropDown = () => {
    setProfileOpen(!profileOpen);
  };

  const logout = async () => {
    await removeToken();
    router.push("/login");
  };

  if (!isAdmin) return null;

  return (
    <div className="relative h-screen w-full bg-gray-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex items-start h-full w-full">
        {/* Sidebar */}
        <aside
          className={`fixed h-full bg-[#EAF7FC] flex items-center text-pri1 transition-all duration-300 z-50 ${
            sidebarCollapsed ? "w-16 lg:w-24" : "w-80 lg:w-80"
          } ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="w-5/6 mx-auto  flex flex-col justify-between">
            <div className="grid gap-y-10">
              {/* Logo */}
              <div className="flex items-center justify-between w-full">
                {sidebarCollapsed ? (
                  <div className="w-5/6 mx-auto">
                    <Lock className="text-sec10 font-bold" />
                  </div>
                ) : (
                  <AdminLogo />
                )}
                {/* Mobile Close Button */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="lg:hidden w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <X className="w-4 h-4 text-[#13485B]" />
                </button>
                {/* Desktop Collapse Button */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden absolute top-1/2 -translate-y-1/2 right-0 lg:flex w-8 h-8 bg-blue-100 rounded-full items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <ChevronLeft
                    className={`w-4 h-4 text-[#13485B] transition-transform ${
                      sidebarCollapsed ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Navigation */}
              <div
                className={`${sidebarCollapsed ? "w-5/6" : "w-5/6"} mx-auto`}
              >
                <AdminNavigation
                  userRole={userType}
                  sidebarCollapsed={sidebarCollapsed}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={`w-full bg-[#FCFCFD] transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-24" : "lg:ml-80"
          }`}
        >
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {/* Search */}
              <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search courses... e.g. Cyber security"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <NotificationDropdown isAdmin={true} />

                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#13485B] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {auth?.first_name?.charAt(0)}
                      {auth?.last_name?.charAt(0)}
                    </span>
                  </div>

                  <div
                    className="relative cursor-pointer"
                    onClick={handleDropDown}
                  >
                    <div className="flex items-center justify-between bg-white rounded-md border border-gray-300 p-2 sm:p-3 shadow-md text-xs sm:text-sm min-w-[120px] sm:min-w-[200px]">
                      <p className="font-semibold line-clamp-1 text-ellipsis text-[#344054] hidden sm:block">
                        Welcome, {auth?.first_name} {auth?.last_name}
                      </p>
                      <p className="font-semibold line-clamp-1 text-ellipsis text-[#344054] sm:hidden">
                        {auth?.first_name} {auth?.last_name}
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
                          href="/admin/settings"
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
          </header>

          {/* Page Content */}
          <div className="relative p-4 sm:p-6 w-full h-[calc(100vh-80px)] bg-[#FCFCFD] overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
