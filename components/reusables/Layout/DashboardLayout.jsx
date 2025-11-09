"use client";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { ChevronLeft } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            sidebarCollapsed ? "w-16 lg:w-16" : "w-64 lg:w-1/5"
          } ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex flex-col h-full">
              {/* Collapse Button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex w-8 h-8 bg-blue-100 rounded-full items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <ChevronLeft
                    className={`w-4 h-4 text-[#13485B] transition-transform ${
                      sidebarCollapsed ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1">
                <Sidebar
                  onClose={() => setSidebarOpen(false)}
                  sidebarCollapsed={sidebarCollapsed}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={`w-full bg-[#FCFCFD] transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-16" : "lg:w-4/5 lg:ml-auto"
          }`}
        >
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
