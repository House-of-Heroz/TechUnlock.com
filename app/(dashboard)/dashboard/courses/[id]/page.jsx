"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Clock,
  Video,
  FileText,
  HelpCircle,
  DollarSign,
  GraduationCap,
  Play,
  Lock,
  BookOpen,
  Award,
  Users,
  CheckCircle,
  X,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getCourseDetails } from "@/services/course";
import { enrollInCourse, registerForCourse } from "@/services/course";
import { showErrorToast, showSuccessToast } from "@/helpers/toastUtil";
import Image from "next/image";
import LoadingSpinner from "@/components/reusables/LoadingSpinner";
import { useCourses } from "@/Context/courses";
import { useAuth } from "@/Context/auth";

const CourseDetailsPage = ({ params }) => {
  const router = useRouter();
  const { enrolledCourses, fetchEnrolledCourses } = useCourses();
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("Paystack");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const { id } = useParams();

  // Check if user is enrolled in this course
  const isEnrolled = enrolledCourses?.some(
    (enrolledCourse) => enrolledCourse.id === parseInt(id)
  );

  console.log("Enrollment check:", {
    id,
    enrolledCourses,
    isEnrolled,
    courseDetails,
  });

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const response = await getCourseDetails(id);
        const courseData = response.data || response;

        // Transform API data to match component expectations
        const transformedData = {
          id: courseData.id || id,
          title: courseData.title || courseData.name || "Course Title",
          short_description:
            courseData.short_description ||
            "Course short description not available.",
          description:
            courseData.description || "Course description not available.",
          rating: courseData.rating || courseData.average_rating || 4.0,
          totalLearners:
            courseData.enrolled_learners || courseData.total_learners || 0,
          totalReviews:
            courseData.total_reviews || courseData.reviews_count || 0,
          trainingLevel:
            courseData.difficulty || courseData.training_level || "Beginner",
          lastUpdated: courseData.date_added
            ? new Date(courseData.date_added).toLocaleDateString()
            : "Recently",
          price: parseFloat(courseData.price) || 0,
          originalPrice:
            courseData.original_price || parseFloat(courseData.price) || 0,
          cover_image: courseData.cover_image || "/api/placeholder/500/300",
          progress_percentage: courseData.progress_percentage || 0,
          courseInfo: {
            timeToComplete: courseData.duration || "~6 hours",
            learningFormat: "Videos",
            modules: courseData.total_modules
              ? `${courseData.total_modules} modules`
              : courseData.modules?.length
              ? `${courseData.modules.length} modules`
              : "0 modules",
            quizzes:
              courseData.modules?.reduce(
                (total, module) => total + (module.quizzes?.length || 0),
                0
              ) || 0,
            certificate: courseData.badge_detail ? "Yes" : "No",
            access: "Lifetime",
          },
          instructor: {
            name:
              courseData.instructor?.name ||
              courseData.instructor_name ||
              "TechUnlock Instructor",
            title: courseData.instructor?.title || "Course Instructor",
            company: courseData.instructor?.company || "TechUnlock",
            avatar: "👨‍💼",
          },
          learningObjectives: courseData.learning_objectives || [
            "Complete the course modules",
            "Pass all quizzes",
            "Earn your certificate",
          ],
          skills: courseData.tag_names || courseData.course_skills || [],
          modules: courseData.modules || [],
          reviews: courseData.reviews || [],
          badge_detail: courseData.badge_detail,
          community_link_detail: courseData.community_link_detail,
        };

        setCourseDetails(transformedData);
      } catch (error) {
        console.error("Error fetching course details:", error);
        setError("Failed to load course details");
        showErrorToast("Failed to load course details");
        // Fallback to mock data if API fails
        // setCourseDetails(mockCourseData);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const tabs = [
    { id: "overview", name: "Overview", icon: BookOpen },
    { id: "curriculum", name: "Curriculum", icon: FileText },
    { id: "reviews", name: "Reviews", icon: Star },
  ];

  const handleEnroll = async () => {
    console.log("handleEnroll called with course ID:", id);
    console.log("Course details:", courseDetails);

    // Check if user is authenticated
    if (!auth) {
      showErrorToast("Please log in to enroll in courses");
      router.push("/login");
      return;
    }

    // Check if already enrolled
    if (isEnrolled) {
      showSuccessToast("You are already enrolled in this course");
      router.push(`/dashboard/courses/${id}/watch`);
      return;
    }

    try {
      // Check if course is free and beginner level
      const isFreeBeginner =
        courseDetails.price === 0 &&
        courseDetails.difficulty?.toLowerCase() === "beginner";

      if (isFreeBeginner) {
        // Free beginner course - enroll directly
        console.log("Enrolling in free beginner course...");
        const result = await enrollInCourse(id);
        console.log("Enrollment result:", result);
        showSuccessToast(result.message || "Successfully enrolled in course!");

        // Refresh enrolled courses in context
        await fetchEnrolledCourses();
        router.push(`/dashboard/courses/${id}/watch`);
      } else if (courseDetails.price === 0) {
        // Free course but not beginner - still enroll directly
        console.log("Enrolling in free course...");
        const result = await enrollInCourse(id);
        console.log("Enrollment result:", result);
        showSuccessToast(result.message || "Successfully enrolled in course!");

        // Refresh enrolled courses in context
        await fetchEnrolledCourses();
        router.push(`/dashboard/courses/${id}/watch`);
      } else {
        // Paid course - show payment modal
        console.log("Showing payment modal for paid course...");
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      if (error.message === "AUTH_REQUIRED") {
        showErrorToast("Please log in to enroll in courses");
        router.push("/login");
      } else {
        showErrorToast(error.message || "Failed to enroll in course");
      }
    }
  };

  const handleGoToCourse = () => {
    router.push(`/dashboard/courses/${id}/watch`);
  };

  const handlePaymentSelect = (event) => {
    const paymentType = event.target.value;
    setSelectedPayment(paymentType);
  };

  const makePayment = async () => {
    if (selectedPayment === "Bank Transfer") {
      setShowBankTransferModal(true);
      return;
    }
    setPaymentLoading(true);

    const formData = new FormData();
    formData.append("course_id", +id);

    try {
      const response = await registerForCourse(formData);

      if (response === "This is not a paid course.") {
        showErrorToast(response);
        return;
      }

      if (response?.status === true) {
        localStorage.setItem("reference", response?.data?.reference);
        showSuccessToast(
          "Successfully, you are now being redirected to the payment page"
        );
        sessionStorage.setItem("course_id", id);

        const url = response?.data?.authorization_url || "";
        const allowlistEnv =
          process.env.NEXT_PUBLIC_PAYMENT_REDIRECT_ALLOWLIST ||
          "https://checkout.paystack.com,https://paystack.com";
        const allowed = allowlistEnv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        if (allowed.some((allowedHost) => url.startsWith(allowedHost))) {
          window.location.href = url;
        } else {
          showErrorToast("Unexpected redirect URL. Contact support.");
        }
      } else if (response && response?.message?.includes("already enrolled")) {
        showSuccessToast("You have already enrolled for this course");
        setShowPaymentModal(false);
        router.push("/dashboard/courses");
      }
    } catch (error) {
      console.error("Error making payment:", error);
      showErrorToast(error || "An error occurred while making payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showSuccessToast(`${fieldName} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      showErrorToast("Failed to copy to clipboard");
    }
  };

  const closeBankTransferModal = () => {
    setShowBankTransferModal(false);
    setCopiedField(null);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPayment("Paystack");
    setPaymentLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13485B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error && !courseDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#13485B] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {courseDetails.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className=" gap-8">
          {/* Main Content */}
          <div className=" space-y-8">
            {/* Course Header */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Course Image */}
                <div className="md:w-1/2 flex items-center justify-center">
                  <Image
                    src={courseDetails.cover_image}
                    alt={courseDetails.title}
                    width={500}
                    height={500}
                  />
                </div>

                {/* Course Info */}
                <div className="md:w-1/2 p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {courseDetails.title}
                  </h2>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg font-semibold text-gray-800">
                      {courseDetails.rating}
                    </span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(courseDetails.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({courseDetails.totalReviews} reviews)
                    </span>
                  </div>

                  {/* Course Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      <span>Training level: {courseDetails.trainingLevel}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Updated {courseDetails.lastUpdated}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        {courseDetails.totalLearners} learners enrolled
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {courseDetails.price === 0 ? (
                      <div className="text-center">
                        <span className="text-3xl font-bold text-sec10">
                          Free
                        </span>
                        {courseDetails.originalPrice > 0 && (
                          <span className="text-lg text-gray-500 line-through ml-2">
                            #{courseDetails.originalPrice}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-3xl font-bold text-gray-800">
                          #{courseDetails.price}
                        </span>
                        {courseDetails.originalPrice > courseDetails.price && (
                          <span className="text-lg text-gray-500 line-through ml-2">
                            #{courseDetails.originalPrice}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Enroll/Go to Course Button */}
                  {isEnrolled ? (
                    <button
                      onClick={handleGoToCourse}
                      className="w-full bg-[#2FB3E3] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#13485B]/80 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>Go to Course</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        console.log("Enroll button clicked!");
                        handleEnroll();
                      }}
                      className="w-full bg-[#13485B] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2FB3E3]/80 transition-colors"
                    >
                      {courseDetails.price === 0
                        ? "Enroll for Free"
                        : `Enroll Now - #${courseDetails.price}`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? "border-[#2FB3E3] text-[#13485B]"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Course Overview
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {courseDetails.short_description}
                      </p>
                    </div>

                    {/* Key Information */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          {courseDetails.courseInfo.timeToComplete}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Video className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          {courseDetails.video_count}{" "}
                          {courseDetails.courseInfo.learningFormat}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          {courseDetails.courseInfo.modules}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <HelpCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          {courseDetails.courseInfo.quizzes} quiz
                          {courseDetails.courseInfo.quizzes !== 1 ? "zes" : ""}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          {courseDetails.courseInfo.certificate}
                        </span>
                      </div>
                    </div>

                    {/* Instructor */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-xl font-semibold text-gray-800 flex items-center">
                          <GraduationCap className="w-5 h-5 mr-2 text-[#13485B]" />
                          Meet Your Instructor
                        </h4>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700">
                            4.8
                          </span>
                          <span className="text-sm text-gray-500">
                            ({courseDetails.totalLearners} students)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#13485B] to-[#2FB3E3] rounded-full flex items-center justify-center text-white text-xl font-semibold shadow-lg">
                            {courseDetails.instructor.avatar}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>

                        <div className="flex-1">
                          <h5 className="text-lg font-semibold text-gray-800 mb-1">
                            {courseDetails.instructor.name}
                          </h5>
                          <p className="text-blue-600 font-medium mb-2">
                            {courseDetails.instructor.title}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            {courseDetails.instructor.company}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>10+ courses</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Award className="w-4 h-4" />
                              <span>Expert</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>5+ years</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Passionate educator with expertise in creating
                          engaging learning experiences. Dedicated to helping
                          students master new skills and achieve their learning
                          goals.
                        </p>
                      </div>
                    </div>

                    {/* What you'll learn */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        What you'll learn
                      </h3>
                      <p className="text-gray-600 mb-6"></p>

                      <div className="space-y-3">
                        <div
                          className="prose prose-lg max-w-none
                            prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mb-4 prose-headings:mt-6
                            prose-h1:text-2xl prose-h1:font-bold prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-2
                            prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3
                            prose-h3:text-lg prose-h3:font-medium prose-h3:mt-4 prose-h3:mb-2
                            prose-h4:text-base prose-h4:font-medium prose-h4:mt-3 prose-h4:mb-2
                            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
                            prose-strong:text-gray-900 prose-strong:font-semibold
                            prose-em:text-gray-600 prose-em:italic
                            prose-a:text-blue-600 prose-a:font-medium hover:prose-a:text-blue-700 hover:prose-a:underline prose-a:transition-colors
                            prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-li:text-gray-700
                            prose-li:marker:text-blue-500 prose-li:marker:font-semibold
                            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:my-4 prose-blockquote:text-gray-700 prose-blockquote:italic
                            prose-code:text-sm prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono
                            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4
                            prose-img:rounded-lg prose-img:shadow-md prose-img:my-4 prose-img:max-w-full prose-img:h-auto
                            prose-table:w-full prose-table:border-collapse prose-table:my-4
                            prose-th:bg-gray-100 prose-th:text-gray-900 prose-th:font-semibold prose-th:p-3 prose-th:border prose-th:border-gray-300 prose-th:text-left
                            prose-td:p-3 prose-td:border prose-td:border-gray-300 prose-td:text-gray-700
                            prose-hr:my-8 prose-hr:border-gray-300
                            prose-dl:my-4
                            prose-dt:font-semibold prose-dt:text-gray-900 prose-dt:mb-1
                            prose-dd:text-gray-700 prose-dd:ml-4 prose-dd:mb-3
                            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-1
                            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-1
                            [&>li]:marker:text-blue-500 [&>li]:marker:font-semibold
                            [&>blockquote]:bg-gradient-to-r [&>blockquote]:from-blue-50 [&>blockquote]:to-indigo-50
                            [&>code]:bg-gray-100 [&>code]:text-gray-800 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono
                            [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:text-sm
                            [&>table]:border-collapse [&>table]:w-full [&>table]:my-4
                            [&>th]:bg-gray-100 [&>th]:text-gray-900 [&>th]:font-semibold [&>th]:p-3 [&>th]:border [&>th]:border-gray-300 [&>th]:text-left
                            [&>td]:p-3 [&>td]:border [&>td]:border-gray-300 [&>td]:text-gray-700
                            [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-4 [&>img]:max-w-full [&>img]:h-auto
                            [&>hr]:my-8 [&>hr]:border-gray-300
                            [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:border-b [&>h1]:border-gray-200 [&>h1]:pb-2 [&>h1]:mb-4 [&>h1]:mt-6
                            [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-gray-900 [&>h2]:mt-6 [&>h2]:mb-3
                            [&>h3]:text-lg [&>h3]:font-medium [&>h3]:text-gray-900 [&>h3]:mt-4 [&>h3]:mb-2
                            [&>h4]:text-base [&>h4]:font-medium [&>h4]:text-gray-900 [&>h4]:mt-3 [&>h4]:mb-2
                            [&>p]:text-gray-700 [&>p]:leading-relaxed [&>p]:mb-4 [&>p]:text-base
                            [&>strong]:text-gray-900 [&>strong]:font-semibold
                            [&>em]:text-gray-600 [&>em]:italic
                            [&>a]:text-blue-600 [&>a]:font-medium [&>a:hover]:text-blue-700 [&>a:hover]:underline [&>a]:transition-colors
                            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-1 [&>ul]:my-4
                            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-1 [&>ol]:my-4
                            [&>li]:text-gray-700 [&>li]:my-1
                            [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:bg-gradient-to-r [&>blockquote]:from-blue-50 [&>blockquote]:to-indigo-50 [&>blockquote]:pl-4 [&>blockquote]:py-2 [&>blockquote]:my-4 [&>blockquote]:text-gray-700 [&>blockquote]:italic
                            [&>dl]:my-4
                            [&>dt]:font-semibold [&>dt]:text-gray-900 [&>dt]:mb-1
                            [&>dd]:text-gray-700 [&>dd]:ml-4 [&>dd]:mb-3"
                          dangerouslySetInnerHTML={{
                            __html: courseDetails.description || "",
                          }}
                        />
                      </div>
                    </div>

                    {/* Skills you'll gain */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Skills you'll gain
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {courseDetails.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Badge Information - Only show for 100% completion */}
                    {courseDetails.badge_detail &&
                      courseDetails.progress_percentage === 100 && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Certificate & Badge
                          </h3>
                          <div className="flex items-center space-x-4">
                            {courseDetails.badge_detail.icon && (
                              <div className="w-16 h-16 bg-white rounded-lg p-2 shadow-sm">
                                <Image
                                  src={courseDetails.badge_detail.icon}
                                  alt="Badge"
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {courseDetails.badge_detail.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {courseDetails.badge_detail.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Community Link - Only show for 100% completion */}
                    {courseDetails.community_link_detail &&
                      courseDetails.progress_percentage === 100 && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Join Our Community
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {courseDetails.community_link_detail.description}
                          </p>
                          <a
                            href={courseDetails.community_link_detail.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Join Community
                          </a>
                        </div>
                      )}

                    {/* Progress Message for incomplete courses */}
                    {courseDetails.progress_percentage < 100 &&
                      (courseDetails.badge_detail ||
                        courseDetails.community_link_detail) && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Complete the Course to Unlock Rewards
                          </h3>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Progress
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                  {courseDetails.progress_percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${courseDetails.progress_percentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-3">
                            {courseDetails.badge_detail &&
                              "Complete all modules and quizzes to earn your certificate and badge. "}
                            {courseDetails.community_link_detail &&
                              "Join our community once you've finished the course!"}
                          </p>
                        </div>
                      )}
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === "curriculum" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Course Content
                      </h3>
                      <span className="text-sm text-gray-600">
                        {courseDetails.modules.length} modules
                      </span>
                    </div>

                    {courseDetails.modules.map((module, moduleIndex) => (
                      <div
                        key={module.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {module.is_locked ? (
                                <Lock className="w-5 h-5 text-gray-400" />
                              ) : (
                                <BookOpen className="w-5 h-5 text-green-600" />
                              )}
                              <div>
                                <h4 className="font-medium text-gray-800">
                                  Module {module.order || moduleIndex + 1}:{" "}
                                  {module.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {module.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                {module.video_count ||
                                  module.videos?.length ||
                                  0}{" "}
                                videos
                              </div>
                              <div className="text-sm text-gray-600">
                                {module.duration}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="space-y-4">
                            {/* Videos */}
                            {module.videos && module.videos.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-800 mb-2">
                                  Videos
                                </h5>
                                <div className="space-y-2">
                                  {module.videos.map((video, videoIndex) => (
                                    <div
                                      key={video.id}
                                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <Play className="w-4 h-4 text-[#13485B]" />
                                        <div>
                                          <span className="text-sm text-gray-700">
                                            {video.title}
                                          </span>
                                          {video.description && (
                                            <p className="text-xs text-gray-500">
                                              {video.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        {video.duration}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Summaries */}
                            {module.summaries &&
                              module.summaries.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-gray-800 mb-2">
                                    Reading Materials
                                  </h5>
                                  <div className="space-y-2">
                                    {module.summaries.map(
                                      (summary, summaryIndex) => (
                                        <div
                                          key={summary.id}
                                          className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded"
                                        >
                                          <div className="flex items-center space-x-3">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm text-gray-700">
                                              Summary {summaryIndex + 1}
                                            </span>
                                          </div>
                                          <span className="text-xs text-gray-500">
                                            Reading
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Quizzes */}
                            {/* {module.quizzes && module.quizzes.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-800 mb-2">
                                  Quizzes
                                </h5>
                                <div className="space-y-2">
                                  {module.quizzes.map((quiz, quizIndex) => (
                                    <div
                                      key={quiz.id}
                                      className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <HelpCircle className="w-4 h-4 text-yellow-600" />
                                        <span className="text-sm text-gray-700">
                                          {quiz.question}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        Quiz
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )} */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Student Reviews
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-800">
                          {courseDetails.rating}
                        </span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(courseDetails.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({courseDetails.totalReviews} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {courseDetails.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-800">
                              {review.name}
                            </span>
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {/* <div className="lg:col-span-1">
             <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
               <h3 className="text-lg font-semibold text-gray-800 mb-4">
                 Course Information
               </h3>

               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-gray-600">Duration</span>
                   <span className="font-medium">
                     {courseDetails.courseInfo.timeToComplete}
                   </span>
                 </div>

                 <div className="flex items-center justify-between">
                   <span className="text-gray-600">Level</span>
                   <span className="font-medium">
                     {courseDetails.trainingLevel}
                   </span>
                 </div>

                 <div className="flex items-center justify-between">
                   <span className="text-gray-600">Modules</span>
                   <span className="font-medium">
                     {courseDetails.courseInfo.modules}
                   </span>
                 </div>

                 <div className="flex items-center justify-between">
                   <span className="text-gray-600">Quizzes</span>
                   <span className="font-medium">
                     {courseDetails.courseInfo.quizzes}
                   </span>
                 </div>

                 <div className="flex items-center justify-between">
                   <span className="text-gray-600">Certificate</span>
                   <span className="font-medium">
                     {courseDetails.courseInfo.certificate}
                   </span>
                 </div>

                 <div className="flex items-center justify-between">
                   <span className="text-gray-600">Access</span>
                   <span className="font-medium">
                     {courseDetails.courseInfo.access}
                   </span>
                 </div>
               </div>

               <div className="mt-6 pt-6 border-t border-gray-200">
                 <div className="text-center mb-4">
                   {courseDetails.price === 0 ? (
                     <div>
                       <span className="text-3xl font-bold text-green-600">
                         Free
                       </span>
                       {courseDetails.originalPrice > 0 && (
                         <span className="text-lg text-gray-500 line-through ml-2">
                           ${courseDetails.originalPrice}
                         </span>
                       )}
                     </div>
                   ) : (
                     <div>
                       <span className="text-3xl font-bold text-gray-800">
                         ${courseDetails.price}
                       </span>
                       {courseDetails.originalPrice > courseDetails.price && (
                         <span className="text-lg text-gray-500 line-through ml-2">
                           ${courseDetails.originalPrice}
                         </span>
                       )}
                     </div>
                   )}
                 </div>

                 <button
                   onClick={handleEnroll}
                   className="w-full bg-[#13485B] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
                 >
                   {courseDetails.price === 0
                     ? "Enroll for Free"
                     : `Enroll Now - $${courseDetails.price}`}
                 </button>

                 <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                   Add to Wishlist
                 </button>
               </div>
             </div>
           </div> */}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Course Enrollment
              </h3>
              <button
                onClick={closePaymentModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Course Info */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  {courseDetails.title}
                </h4>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Course Fee:</span>
                  <span className="font-semibold text-lg text-gray-900">
                    #{courseDetails.price}
                  </span>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Payment Information
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Access to all course modules and materials</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Email notifications and updates</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Virtual training sessions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Certificate upon completion</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Select Payment Method
                </h4>
                <div className="space-y-3">
                  {["Paystack", "Bank Transfer"].map((type) => (
                    <div
                      key={type}
                      className="flex items-center rounded border px-4 py-3 w-full cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        id={type}
                        type="radio"
                        name="paymentType"
                        value={type}
                        checked={selectedPayment === type}
                        onChange={handlePaymentSelect}
                        className="form-radio h-4 w-4 text-[#13485B] transition duration-150 ease-in-out"
                      />
                      <div className="w-full ml-3">
                        <div className="flex justify-between items-start w-full">
                          <label
                            htmlFor={type}
                            className="block text-gray-800 font-medium"
                          >
                            {type}
                          </label>
                          {type === "Bank Transfer" ? (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Manual
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {type === "Bank Transfer"
                            ? "Make payment directly to our bank account"
                            : "Secure online payment with Paystack"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={makePayment}
                disabled={paymentLoading}
                className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 px-4 font-medium transition-colors ${
                  paymentLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#13485B] text-white hover:bg-[#2FB3E3]/80"
                }`}
              >
                {paymentLoading ? (
                  <>
                    <LoadingSpinner />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer Modal */}
      {showBankTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Bank Transfer Details
              </h3>
              <button
                onClick={closeBankTransferModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Bank Information */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Bank Account Details
                  </h4>

                  {/* Account Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Account Number
                    </label>
                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <span className="font-mono text-gray-900">
                        1234567890
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard("1234567890", "Account Number")
                        }
                        className="text-[#2FB3E3] hover:text-[#2FB3E3]/80 transition-colors"
                      >
                        {copiedField === "Account Number" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Account Name */}
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-gray-700">
                      Account Name
                    </label>
                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <span className="text-gray-900">
                        TechUnlock Learning Platform
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            "TechUnlock Learning Platform",
                            "Account Name"
                          )
                        }
                        className="text-[#2FB3E3] hover:text-[#2FB3E3]/80 transition-colors"
                      >
                        {copiedField === "Account Name" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bank Name */}
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-gray-700">
                      Bank Name
                    </label>
                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <span className="text-gray-900">
                        First Bank of Nigeria
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard("First Bank of Nigeria", "Bank Name")
                        }
                        className="text-[#2FB3E3] hover:text-[#2FB3E3]/80 transition-colors"
                      >
                        {copiedField === "Bank Name" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Instructions
                  </h4>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Copy the account details above</li>
                    <li>Make the transfer to the provided account</li>
                    <li>Use your email as payment reference</li>
                    <li>Send proof of payment to support@techunlock.org</li>
                    <li>Your enrollment will be activated within 24 hours</li>
                  </ol>
                </div>

                {/* Important Notes */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">
                    Important Notes
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>Ensure you use your email as payment reference</li>
                    <li>Keep your payment receipt for verification</li>
                    <li>
                      Contact support if you don't receive access within 24
                      hours
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={closeBankTransferModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  copyToClipboard("support@techunlock.org", "Support Email");
                }}
                className="px-4 py-2 bg-[#2FB3E3] text-white rounded hover:bg-[#2FB3E3]/80 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
