"use client";

import React, { useState } from "react";
import adminNavLinks from "@/data/adminNavLinks";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";

const AdminNavigation = ({ userRole }) => {
  const [openLinks, setOpenLinks] = useState({});
  const pathname = usePathname();

  // Filter navigation links based on user role
  const getFilteredLinks = (links) => {
    if (!userRole) return links;
    return links.filter((link) => link.roles && link.roles.includes(userRole));
  };

  const handleToggle = (id) => {
    setOpenLinks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <nav
      aria-label="Admin Navigation"
      className="flex flex-col justify-between h-[calc(100vh-200px)] h-ful"
    >
      <ul className="list-none p-0 m-0 text-pri1 flex-1 bg-blac">
        {getFilteredLinks(adminNavLinks)
          .filter((link) => link.name !== "Settings")
          .map((link) => {
            const isActive =
              pathname === link.to ||
              (link.to !== "/admin" && pathname.startsWith(link.to));

            return (
              <li key={link.id} className="mb-4">
                <div
                  className={`flex justify-center items-center cursor-pointer border border-darkblue rounded-md p-3 transition-colors ${
                    isActive
                      ? "bg-[#13485B] text-white border-[#13485B]"
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => handleToggle(link.id)}
                >
                  <Link
                    href={link.to}
                    className="flex items-center no-underline w-full"
                    activeclassname="font-bold"
                  >
                    <link.iconActive
                      className={`mr-6 ${
                        isActive ? "text-white" : "text-[#13485B]	"
                      }`}
                    />
                    <span
                      className={
                        isActive
                          ? "text-white font-medium"
                          : "text-[#13485B] font-medium"
                      }
                    >
                      {link.name}
                    </span>
                  </Link>
                  {link.children && (
                    <span
                      className={`ml-2 ${
                        isActive ? "text-white" : "text-[#13485B]"
                      }`}
                    >
                      {openLinks[link.id] ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </span>
                  )}
                </div>
                {link.children && openLinks[link.id] && (
                  <ul className="bg-pri1 text-sec10 border-gray-300 list-none grid gap-y-2 rounded-md mt-2">
                    {link.children.map((child) => (
                      <li key={child.id} className="mb-2 pl-3">
                        <Link
                          href={child.to}
                          className="flex items-center no-underline"
                          activeclassname="font-bold"
                        >
                          <child.iconActive className="mr-2" />
                          {child.name}
                          <span className="text-primary font-semibold ml-2">
                            0
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
      </ul>

      {/* Settings at the bottom */}
      <div className="mt-auto">
        {getFilteredLinks(adminNavLinks)
          .filter((link) => link.name === "Settings")
          .map((link) => {
            const isActive = pathname === link.to;

            return (
              <div
                key={link.id}
                className={`flex justify-center items-center cursor-pointer border border-darkblue rounded-md p-3 transition-colors ${
                  isActive
                    ? "bg-[#13485B] text-white border-[#13485B]"
                    : "hover:bg-blue-50"
                }`}
              >
                <Link
                  href={link.to}
                  className="flex items-center no-underline w-full"
                  activeclassname="font-bold"
                >
                  <link.iconActive
                    className={`mr-6 ${
                      isActive ? "text-white" : "text-[#13485B]"
                    }`}
                  />
                  <span
                    className={
                      isActive
                        ? "text-white font-medium"
                        : "text-[#13485B] font-medium"
                    }
                  >
                    {link.name}
                  </span>
                </Link>
              </div>
            );
          })}
      </div>
    </nav>
  );
};

export default AdminNavigation;
