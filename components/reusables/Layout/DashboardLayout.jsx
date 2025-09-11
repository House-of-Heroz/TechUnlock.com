"use client";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative h-screen w-full bg-gray-50">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex items-start h-full w-full">
        {/* Sidebar */}
        <aside
          className={`fixed h-full bg-sec10 flex items-center text-pri1 transition-all duration-300 z-50 ${
            sidebarOpen
              ? "w-64 translate-x-0"
              : "-translate-x-full lg:translate-x-0 lg:w-1/5"
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Main Content */}
        <div className="w-full lg:w-4/5 lg:ml-auto bg-[#FCFCFD]">
          {/* Header */}
          <header className="bg-pri1 border-b border-gray-200 px-4 sm:px-6 py-4">
            <Header onMenuClick={() => setSidebarOpen(true)} />
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

export default DashboardLayout;
