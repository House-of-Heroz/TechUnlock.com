"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  ChevronDown,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import {
  getDashboardStats,
  getLearnersStats,
  getCourseStats,
  getPaymentStats,
} from "@/services/admin";
import { showErrorToast } from "@/helpers/toastUtil";
import { useAuth } from "@/Context/auth";
import { useRouter } from "next/navigation";

const AdminDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("Monthly");
  const [dashboardData, setDashboardData] = useState({
    metrics: [],
    activeLearners: [],
    topCourses: [],
    recentActivity: [],
  });
  const { auth } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch dashboard data
        const dashboardStats = await getDashboardStats();

        // Transform metrics data based on actual API response
        const metricsData = [
          {
            title: "Total Learners",
            value: dashboardStats?.total_learners?.toString() || "0",
            icon: GraduationCap,
            color: "bg-blue-100",
            iconColor: "text-blue-600",
          },
          {
            title: "Active Learners",
            value: dashboardStats?.active_learners?.toString() || "0",
            icon: GraduationCap,
            color: "bg-blue-100",
            iconColor: "text-blue-600",
          },
          {
            title: "New Learners",
            value: dashboardStats?.new_learners?.toString() || "0",
            icon: GraduationCap,
            color: "bg-blue-100",
            iconColor: "text-blue-600",
          },
          {
            title: "Total Feedback",
            value: dashboardStats?.total_learners?.toString() || "0", // Using total learners as placeholder
            icon: FileText,
            color: "bg-blue-100",
            iconColor: "text-blue-600",
          },
        ];

        // Transform top courses data for donut chart
        const topCoursesData =
          dashboardStats?.top_enrolled_courses?.map((course, index) => ({
            id: course.course__id,
            name: course.course__title,
            value: course.enrollments,
            color: ["#3B82F6", "#1E40AF", "#1F2937", "#6B7280", "#374151"][
              index % 5
            ],
          })) || [];

        // Calculate total enrollments for percentage calculation
        const totalEnrollments = topCoursesData.reduce(
          (sum, course) => sum + course.value,
          0
        );

        // Update course data with calculated percentages
        const topCoursesWithPercentages = topCoursesData.map((course) => ({
          ...course,
          percentage:
            totalEnrollments > 0
              ? Math.round((course.value / totalEnrollments) * 100)
              : 0,
        }));

        // Transform recent activity data
        const recentActivityData =
          dashboardStats?.recent_activity?.map((activity) => ({
            id: activity.id,
            action: activity.action,
            performedBy: activity.performed_by,
            type: activity.activity_type,
            date: activity.date,
          })) || [];

        setDashboardData({
          metrics: metricsData,
          activeLearners: [], // Will be populated from learners stats if needed
          topCourses: topCoursesWithPercentages,
          recentActivity: recentActivityData,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showErrorToast("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13485B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Welcome, {auth?.first_name} {auth?.last_name}
          </h1>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dashboardData.metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {metric.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 ${metric.color} rounded-lg flex items-center justify-center`}
              >
                <metric.icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.iconColor}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Learners Chart */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Active Learners
            </h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm flex items-center w-full sm:w-auto"
            >
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="space-y-4">
            {/* Chart Legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-600">New</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Inactive
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-800 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-600">Active</span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative h-48 sm:h-64">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 flex flex-col justify-between text-xs text-gray-500">
                <span>1000</span>
                <span>800</span>
                <span>600</span>
                <span>400</span>
                <span>200</span>
                <span>0</span>
              </div>

              {/* Chart Bars */}
              <div className="ml-8 sm:ml-12 h-full flex items-end space-x-2 sm:space-x-4 lg:space-x-8">
                {dashboardData.topCourses.map((course, index) => {
                  // Use enrollment data from API, with some sample breakdown for visualization
                  const data = {
                    new: Math.round(course.value * 0.4), // 40% new
                    inactive: Math.round(course.value * 0.2), // 20% inactive
                    active: Math.round(course.value * 0.4), // 40% active
                    total: course.value,
                  };

                  const maxValue = 1000; // Y-axis max
                  const barHeight = (data.total / maxValue) * 100;

                  return (
                    <div
                      key={course.name}
                      className="flex-1 flex flex-col items-center"
                    >
                      {/* Stacked Bar */}
                      <div
                        className="w-full max-w-8 sm:max-w-12 lg:max-w-16 relative"
                        style={{ height: `${barHeight}%` }}
                      >
                        {/* New (Orange) */}
                        <div
                          className="absolute bottom-0 w-full bg-orange-400"
                          style={{
                            height: `${(data.new / data.total) * 100}%`,
                            zIndex: 3,
                          }}
                        ></div>
                        {/* Inactive (Light Blue) */}
                        <div
                          className="absolute bottom-0 w-full bg-blue-400"
                          style={{
                            height: `${(data.inactive / data.total) * 100}%`,
                            bottom: `${(data.new / data.total) * 100}%`,
                            zIndex: 2,
                          }}
                        ></div>
                        {/* Active (Dark Blue) */}
                        <div
                          className="absolute bottom-0 w-full bg-blue-800"
                          style={{
                            height: `${(data.active / data.total) * 100}%`,
                            bottom: `${
                              ((data.new + data.inactive) / data.total) * 100
                            }%`,
                            zIndex: 1,
                          }}
                        ></div>
                      </div>

                      {/* Course Label */}
                      <span className="text-xs text-gray-600 mt-2 text-center break-words">
                        <span className="block">{course.name}</span>
                        <span className="font-semibold">
                          {course.value} enrolled
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* X-axis label */}
              <div className="ml-12 mt-2 text-center">
                <span className="text-xs text-gray-500">Courses</span>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={() => router.push("/admin/learners")}
              >
                <span>View Learners</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Top Enrolled Courses Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Top Enrolled Courses
            </h3>
            <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="grid items-center gap-6">
            {/* Donut Chart */}
            <div className="relative w-32 h-32">
              <svg
                className="w-32 h-32 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                {/* Background circle */}
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />

                {/* Chart segments - using dynamic data from API */}
                {dashboardData.topCourses.map((segment, index) => {
                  const circumference = 2 * Math.PI * 15.9155;
                  let strokeDasharray = 0;
                  let strokeDashoffset = circumference;

                  if (index === 0) {
                    strokeDasharray =
                      (segment.percentage / 100) * circumference;
                    strokeDashoffset = circumference - strokeDasharray;
                  } else {
                    // Calculate cumulative percentage for proper positioning
                    const cumulativePercentage = dashboardData.topCourses
                      .slice(0, index)
                      .reduce((sum, item) => sum + item.percentage, 0);

                    strokeDasharray =
                      (segment.percentage / 100) * circumference;
                    strokeDashoffset =
                      circumference -
                      strokeDasharray -
                      (cumulativePercentage / 100) * circumference;
                  }

                  return (
                    <path
                      key={index}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="2"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">
                  {dashboardData.topCourses.reduce(
                    (sum, course) => sum + course.percentage,
                    0
                  )}
                  %
                </span>
                <span className="text-xs text-gray-600">
                  {dashboardData.topCourses.reduce(
                    (sum, course) => sum + course.value,
                    0
                  )}{" "}
                  total
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {dashboardData.topCourses.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {item.name} ({item.percentage}% - {item.value} enrolled)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={() => router.push("/admin/courses")}
            >
              <span>View Courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Recent Activity
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Action
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Performed by
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Options
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity) => (
                  <tr key={activity.id} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-800">
                      {activity.action}
                    </td>
                    <td className="py-4 px-4 text-gray-800">
                      {activity.performedBy}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          activity.type === "Course"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {activity.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(activity.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
