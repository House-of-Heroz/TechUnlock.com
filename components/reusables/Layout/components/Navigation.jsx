"use client";

import React, { useState } from "react";
import navLinks from "@/data/navLinks";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/Context/auth";

const Navigation = ({ sidebarCollapsed }) => {
  const [openLinks, setOpenLinks] = useState({});

  const handleToggle = (id) => {
    setOpenLinks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const { auth } = useAuth();
  const userType =
    typeof auth?.user_type === "string"
      ? auth.user_type.toLowerCase()
      : undefined;
  const isAdmin =
    userType === "admin" ||
    Boolean(auth?.is_admin || auth?.is_staff || auth?.is_superuser);

  return (
    <nav aria-label="Main Navigation">
      <ul className="list-none p-0 m-0 text-pri1">
        {navLinks
          .filter((link) => (link.adminOnly ? isAdmin : true))
          .map((link) => (
            <li key={link.id} className="mb-4">
              <div
                className="flex justify-center items-center cursor-pointer border border-darkblue rounded-md p-3"
                onClick={() => handleToggle(link.id)}
              >
                <Link
                  href={link.to}
                  className={`flex items-center no-underline ${
                    sidebarCollapsed ? "justify-center" : ""
                  }`}
                  activeclassname="font-bold"
                >
                  <link.iconActive
                    className={`${sidebarCollapsed ? "mr-0" : "mr-2"}`}
                  />
                  {!sidebarCollapsed && link.name}
                </Link>
                {link.children && !sidebarCollapsed && (
                  <span className="ml-2">
                    {openLinks[link.id] ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </span>
                )}
              </div>
              {link.children && openLinks[link.id] && !sidebarCollapsed && (
                <ul className="bg-pri1 text-sec10 border-gray-300 list-none grid gap-y-2 rounded-md">
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
          ))}
      </ul>
    </nav>
  );
};

export default Navigation;
