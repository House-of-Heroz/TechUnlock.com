"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle,
  Lock,
  Users,
  MessageCircle,
  Award,
  Clock,
  PlayCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getCourseDetails,
  completeCourseModule,
  submitQuiz as submitQuizApi,
} from "@/services/course";
import { addFeedback } from "@/services/feedback";
import Link from "next/link";
import { showErrorToast, showSuccessToast } from "@/helpers/toastUtil";

const CourseDetailsPage = ({ courseId }) => {
  const [courseData, setCourseData] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [completedItems, setCompletedItems] = useState(new Set());
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showModuleCompletion, setShowModuleCompletion] = useState(false);
  const [showCourseCompletion, setShowCourseCompletion] = useState(false);
  const [showBadgeEarned, setShowBadgeEarned] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [experienceRating, setExperienceRating] = useState(0);
  const [feedbackCategory, setFeedbackCategory] = useState("course");
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState({});
  const [videoRef, setVideoRef] = useState(null);
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const router = useRouter();

  const fetchCourseData = async (id) => {
    try {
      const data = await getCourseDetails(id);
      console.log("Course data fetched:", data);
      return data;
    } catch (error) {
      console.error("Error fetching course data:", error);
      return null;
    }
  };

  // Parse URL parameters
  const parseUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      moduleId: params.get("module") ? parseInt(params.get("module")) : null,
      videoId: params.get("video") ? parseInt(params.get("video")) : null,
      quizId: params.get("quiz") ? parseInt(params.get("quiz")) : null,
      completed: params.get("completed")
        ? params.get("completed").split(",").filter(Boolean)
        : [],
      expanded: params.get("expanded")
        ? params
            .get("expanded")
            .split(",")
            .map((id) => parseInt(id))
            .filter(Boolean)
        : [],
      showFeedback: params.get("showFeedback") === "true",
      showBadge: params.get("showBadge") === "true",
    };
  };

  // Load video progress from localStorage
  const loadVideoProgress = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`videoProgress_${courseId}`);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  };

  // Save video progress to localStorage
  const saveVideoProgress = (videoId, currentTime) => {
    if (typeof window !== "undefined") {
      const progress = loadVideoProgress();
      progress[videoId] = currentTime;
      localStorage.setItem(
        `videoProgress_${courseId}`,
        JSON.stringify(progress)
      );
    }
  };

  // Handle video time update
  const handleVideoTimeUpdate = () => {
    if (videoRef && selectedVideo) {
      const currentTime = videoRef.currentTime;
      const duration = videoRef.duration;

      setVideoProgress((prev) => ({
        ...prev,
        [selectedVideo.id]: currentTime,
      }));
      saveVideoProgress(selectedVideo.id, currentTime);

      // Check if video is completed (watched 90% or more)
      if (duration && currentTime >= duration * 0.9) {
        if (!completedVideos.has(selectedVideo.id)) {
          setCompletedVideos((prev) => new Set([...prev, selectedVideo.id]));
          markComplete(`video-${selectedVideo.id}`);

          // Save completed videos to localStorage
          if (typeof window !== "undefined") {
            const savedCompletedVideos = localStorage.getItem(
              `completedVideos_${courseId}`
            );
            const existingCompleted = savedCompletedVideos
              ? JSON.parse(savedCompletedVideos)
              : [];
            const updatedCompleted = [...existingCompleted, selectedVideo.id];
            localStorage.setItem(
              `completedVideos_${courseId}`,
              JSON.stringify(updatedCompleted)
            );
          }

          // Refresh course data in background
          refreshCourseData();
        }
      }
    }
  };

  // Handle video load to restore progress
  const handleVideoLoad = () => {
    if (videoRef && selectedVideo) {
      const progress = loadVideoProgress();
      const savedTime = progress[selectedVideo.id];
      if (savedTime && savedTime > 0) {
        videoRef.currentTime = savedTime;
      }
    }
  };

  // Update URL with current state
  const updateUrl = useCallback((updates = {}) => {
    const params = new URLSearchParams(window.location.search);

    if (updates.moduleId !== undefined) {
      if (updates.moduleId) params.set("module", updates.moduleId.toString());
      else params.delete("module");
    }

    if (updates.videoId !== undefined) {
      if (updates.videoId) params.set("video", updates.videoId.toString());
      else params.delete("video");
    }

    if (updates.quizId !== undefined) {
      if (updates.quizId) params.set("quiz", updates.quizId.toString());
      else params.delete("quiz");
    }

    if (updates.completed !== undefined) {
      if (updates.completed.length > 0)
        params.set("completed", updates.completed.join(","));
      else params.delete("completed");
    }

    if (updates.expanded !== undefined) {
      if (updates.expanded.length > 0)
        params.set("expanded", updates.expanded.join(","));
      else params.delete("expanded");
    }

    if (updates.showFeedback !== undefined) {
      if (updates.showFeedback) params.set("showFeedback", "true");
      else params.delete("showFeedback");
    }

    if (updates.showBadge !== undefined) {
      if (updates.showBadge) params.set("showBadge", "true");
      else params.delete("showBadge");
    }

    const newUrl = `${window.location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    window.history.replaceState({}, "", newUrl);
  }, []);

  // Check if all videos in a module are completed and unlock next module
  const checkAndUnlockNextModule = useCallback((completedSet, courseData) => {
    if (!courseData) return courseData;

    const updatedModules = courseData.modules.map((module, index) => {
      // Check if all videos in current module are completed
      const allVideosCompleted = module.videos.every((video) =>
        completedSet.has(`video-${video.id}`)
      );

      // If current module videos are all completed, unlock next module
      if (allVideosCompleted && index < courseData.modules.length - 1) {
        const nextModule = courseData.modules[index + 1];
        if (nextModule.is_locked) {
          return module;
        }
      }

      return module;
    });

    // Update modules to unlock next ones
    const finalModules = updatedModules.map((module, index) => {
      if (index === 0) return { ...module, is_locked: false }; // First module always unlocked

      const prevModule = updatedModules[index - 1];
      const prevModuleCompleted = prevModule.videos.every((video) =>
        completedSet.has(`video-${video.id}`)
      );

      return {
        ...module,
        is_locked: !prevModuleCompleted,
      };
    });

    return {
      ...courseData,
      modules: finalModules,
    };
  }, []);

  useEffect(() => {
    async function init() {
      const searchParams = new URLSearchParams(window.location.search);
      const id = courseId || searchParams.get("id");
      if (!id) return;

      console.log("Initializing course details for ID:", id);

      const urlParams = parseUrlParams();
      const data = await fetchCourseData(id);
      if (!data) {
        console.error("Failed to fetch course data");
        return;
      }

      console.log("Course data loaded successfully:", {
        title: data.title,
        isEnrolled: data.is_enrolled,
        modulesCount: data.modules?.length,
      });

      const completedSet = new Set(urlParams.completed);
      const updatedData = checkAndUnlockNextModule(completedSet, data);
      setCourseData(updatedData);
      setCompletedItems(completedSet);

      // Load video progress
      const progress = loadVideoProgress();
      setVideoProgress(progress);

      // Load completed videos from localStorage
      if (typeof window !== "undefined") {
        const savedCompletedVideos = localStorage.getItem(
          `completedVideos_${id}`
        );
        if (savedCompletedVideos) {
          setCompletedVideos(new Set(JSON.parse(savedCompletedVideos)));
        }
      }

      const expandedObj = {};
      if (urlParams.expanded.length > 0) {
        urlParams.expanded.forEach((eid) => (expandedObj[eid] = true));
      } else if (updatedData?.modules?.[0]) {
        expandedObj[updatedData.modules[0].id] = true;
      }
      setExpandedModules(expandedObj);

      // Set modal states from URL
      setShowCourseCompletion(urlParams.showFeedback);
      setShowBadgeEarned(urlParams.showBadge);
      setShowCommunityModal(urlParams.showCommunity);

      let targetModule = updatedData?.modules?.[0];
      let targetVideo = targetModule?.videos?.[0];

      if (urlParams.moduleId) {
        const foundModule = updatedData.modules.find(
          (m) => m.id === urlParams.moduleId
        );
        if (foundModule && !foundModule.is_locked) {
          targetModule = foundModule;

          if (urlParams.videoId) {
            const foundVideo = foundModule.videos.find(
              (v) => v.id === urlParams.videoId
            );
            if (foundVideo) {
              targetVideo = foundVideo;
            }
          } else if (urlParams.quizId) {
            const foundQuiz = foundModule.quizzes.find(
              (q) => q.id === urlParams.quizId
            );
            if (foundQuiz) {
              setCurrentQuiz(foundQuiz);
              targetVideo = null;
            }
          }
        }
      }

      setSelectedModule(targetModule || null);
      setSelectedVideo(targetVideo || null);

      console.log("Course initialization completed");
    }

    init();
  }, [courseId, checkAndUnlockNextModule]);

  // Update URL when state changes
  useEffect(() => {
    if (!courseData || !selectedModule) return;

    const completedArray = Array.from(completedItems);
    const expandedArray = Object.keys(expandedModules)
      .filter((key) => expandedModules[key])
      .map(Number);

    updateUrl({
      moduleId: selectedModule.id,
      videoId: selectedVideo?.id || null,
      quizId: currentQuiz?.id || null,
      completed: completedArray,
      expanded: expandedArray,
      showFeedback: showCourseCompletion,
      showBadge: showBadgeEarned,
    });
  }, [
    selectedModule,
    selectedVideo,
    currentQuiz,
    completedItems,
    expandedModules,
    showCourseCompletion,
    showBadgeEarned,
    updateUrl,
    courseData,
  ]);

  // Save completed videos to localStorage whenever completedVideos changes
  useEffect(() => {
    if (typeof window !== "undefined" && courseId && completedVideos.size > 0) {
      localStorage.setItem(
        `completedVideos_${courseId}`,
        JSON.stringify(Array.from(completedVideos))
      );
    }
  }, [completedVideos, courseId]);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const selectVideo = (video, module) => {
    if (!module.is_locked) {
      setSelectedVideo(video);
      setSelectedModule(module);
      setCurrentQuiz(null);
      setSelectedSummary(null);
    }
  };

  const selectQuiz = (quiz, module) => {
    if (!module.is_locked) {
      setCurrentQuiz(quiz);
      setSelectedVideo(null);
      setSelectedSummary(null);
      setQuizAnswers({});
      setShowQuizResults(false);
    }
  };

  const selectSummary = (summary, module) => {
    if (!module.is_locked) {
      setSelectedSummary(summary);
      setSelectedVideo(null);
      setCurrentQuiz(null);
    }
  };

  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const submitQuiz = async () => {
    if (!selectedModule || !currentQuiz) return;

    // Check if all questions are answered
    const unansweredQuestions = selectedModule.quizzes.filter(
      (quiz) => !quizAnswers[quiz.id]
    );

    if (unansweredQuestions.length > 0) {
      showErrorToast("Please answer all questions before submitting.");
      return;
    }

    try {
      // Format the answers according to the API requirements
      const formattedAnswers = selectedModule.quizzes.map((quiz) => ({
        question_id: quiz.id,
        selected: quizAnswers[quiz.id]?.toLowerCase() || "",
      }));

      const quizData = {
        module_id: selectedModule.id,
        answers: formattedAnswers,
      };

      console.log("Submitting quiz data:", quizData);
      await submitQuizApi(quizData);

      const score = selectedModule.quizzes.filter(
        (quiz) => quizAnswers[quiz.id] === quiz.correct_answer
      ).length;
      setQuizScore(score);
      setShowQuizResults(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      showErrorToast("Failed to submit quiz. Please try again.");
    }
  };

  const completeQuiz = async () => {
    if (!currentQuiz) return;
    try {
      await completeCourseModule(selectedModule?.id);
    } catch {}
    markComplete(`quiz-${currentQuiz.id}`);
    setShowQuizResults(false);
    setCurrentQuiz(null);
    checkModuleCompletion();
  };

  const checkModuleCompletion = () => {
    if (!selectedModule) return;

    const allVideosCompleted = selectedModule.videos.every((video) =>
      completedItems.has(`video-${video.id}`)
    );
    const allQuizzesCompleted = selectedModule.quizzes.every((quiz) =>
      completedItems.has(`quiz-${quiz.id}`)
    );

    if (allVideosCompleted && allQuizzesCompleted) {
      setShowModuleCompletion(true);

      const allModulesCompleted = courseData.modules.every((module) => {
        const moduleVideosCompleted = module.videos.every((video) =>
          completedItems.has(`video-${video.id}`)
        );
        const moduleQuizzesCompleted = module.quizzes.every((quiz) =>
          completedItems.has(`quiz-${quiz.id}`)
        );
        return moduleVideosCompleted && moduleQuizzesCompleted;
      });

      if (allModulesCompleted) {
        setTimeout(() => {
          setShowModuleCompletion(false);
          setShowCourseCompletion(true);
        }, 2000);
      }
    }
  };

  const submitModuleFeedback = () => {
    setShowModuleCompletion(false);
    setFeedbackText("");

    // Check if this was the last module
    const allModulesCompleted = courseData.modules.every((module) => {
      const moduleVideosCompleted = module.videos.every((video) =>
        completedItems.has(`video-${video.id}`)
      );
      const moduleQuizzesCompleted = module.quizzes.every((quiz) =>
        completedItems.has(`quiz-${quiz.id}`)
      );
      return moduleVideosCompleted && moduleQuizzesCompleted;
    });

    if (allModulesCompleted) {
      setShowCourseCompletion(true);
    }
  };

  const submitCourseFeedback = async () => {
    try {
      const feedbackData = {
        rating: experienceRating,
        feedback_category: feedbackCategory,
        feedback: feedbackText,
        course_id: courseId,
      };

      await addFeedback(feedbackData);
      showSuccessToast("Feedback submitted successfully!");

      setShowCourseCompletion(false);
      setShowBadgeEarned(true);
      setFeedbackText("");
      setExperienceRating(0);
      setFeedbackCategory("course");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showErrorToast("Failed to submit feedback. Please try again.");
    }
  };

  const skipCourseFeedback = () => {
    setShowCourseCompletion(false);
    setShowBadgeEarned(true);
    setFeedbackText("");
    setExperienceRating(0);
    setFeedbackCategory("course");
  };

  const closeFeedbackModal = () => {
    setShowCourseCompletion(false);
    setFeedbackText("");
    setExperienceRating(0);
    setFeedbackCategory("course");
  };

  const closeBadgeModal = () => {
    setShowBadgeEarned(false);
  };

  const handleJoinCommunity = () => {
    setShowCommunityModal(true);
  };

  const closeCommunityModal = () => {
    setShowCommunityModal(false);
  };

  const markComplete = (itemId) => {
    const newCompletedItems = new Set([...completedItems, itemId]);
    setCompletedItems(newCompletedItems);

    // Check if this completion unlocks the next module
    const updatedCourseData = checkAndUnlockNextModule(
      newCompletedItems,
      courseData
    );
    if (JSON.stringify(updatedCourseData) !== JSON.stringify(courseData)) {
      setCourseData(updatedCourseData);
    }
  };

  const calculateProgress = () => {
    if (!courseData) return 0;
    const totalItems = courseData.modules.reduce(
      (acc, module) => acc + module.videos.length + module.quizzes.length,
      0
    );
    return Math.round((completedItems.size / totalItems) * 100);
  };

  // Refresh course data without disrupting user view
  const refreshCourseData = async () => {
    if (isRefreshingData) return;

    setIsRefreshingData(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const id = courseId || searchParams.get("id");
      if (!id) return;

      const data = await fetchCourseData(id);
      if (data) {
        setCourseData(data);
      }
    } catch (error) {
      console.error("Error refreshing course data:", error);
    } finally {
      setIsRefreshingData(false);
    }
  };

  // Check if all videos in the current module are completed
  const canCompleteModule = () => {
    if (!selectedModule || selectedModule.is_locked) return false;

    const allVideosCompleted = selectedModule.videos.every(
      (video) =>
        completedItems.has(`video-${video.id}`) || completedVideos.has(video.id)
    );

    // Check if quiz is completed with passing score (at least 2)
    const quizCompleted =
      selectedModule.quizzes.length === 0 ||
      (selectedModule.quizzes.length > 0 && quizScore >= 2);

    return allVideosCompleted && quizCompleted;
  };

  // Check if all modules are completed
  const checkCourseCompletion = () => {
    if (!courseData) return false;

    const allModulesCompleted = courseData.modules.every((module) => {
      const moduleVideosCompleted = module.videos.every(
        (video) =>
          completedItems.has(`video-${video.id}`) ||
          completedVideos.has(video.id)
      );
      const moduleQuizzesCompleted =
        module.quizzes.length === 0 ||
        (module.quizzes.length > 0 && quizScore >= 2);
      return moduleVideosCompleted && moduleQuizzesCompleted;
    });

    return allModulesCompleted;
  };

  // Handle module completion via API
  const handleCompleteModule = async () => {
    if (!selectedModule || !canCompleteModule()) return;

    try {
      console.log("Completing module:", selectedModule.id);
      const result = await completeCourseModule(selectedModule.id);
      console.log("Module completion result:", result);

      // Show success message
      showSuccessToast("Module completed successfully!");

      // Refresh the course data to update progress
      await refreshCourseData();

      // Check if course is completed after module completion
      if (checkCourseCompletion() && !courseCompleted) {
        setCourseCompleted(true);
        setShowCourseCompletion(true);
      }
    } catch (error) {
      console.error("Error completing module:", error);
      showErrorToast("Failed to complete module. Please try again.");
    }
  };

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268FB6] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <style jsx>{`
        video::-webkit-media-controls {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        video::-webkit-media-controls-panel {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        video::-webkit-media-controls-play-button {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        video::-webkit-media-controls-timeline {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        video::-webkit-media-controls-volume-slider {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        video::-webkit-media-controls-mute-button {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        video::-webkit-media-controls-fullscreen-button {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center text-gray-600 hover:text-gray-800"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        {/* Loading indicator for API refresh */}
        {isRefreshingData && (
          <div className="flex items-center text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Updating progress...
          </div>
        )}
      </div>
      <div className="flex h-screen bg-gray-50 gap-x-4">
        {/* Sidebar */}

        <div className="w-80 flex flex-col">
          {/* Header */}
          <div className="p-">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-bold text-lg text-gray-800">
                  {courseData.title}
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Course modules & topics
                </p>
              </div>
              {/* Progress */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center">
                  <svg className="absolute top-0 left-0" width="40" height="40">
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      stroke="#268FB6"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={
                        2 *
                        Math.PI *
                        18 *
                        (1 -
                          Math.max(
                            0,
                            Math.min(
                              100,
                              Number(courseData?.progress_percentage ?? 0)
                            )
                          ) /
                            100)
                      }
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.4s" }}
                    />
                  </svg>
                  <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center text-[10px] font-semibold text-gray-700">
                    {`${Math.max(
                      0,
                      Math.min(
                        100,
                        Number(courseData?.progress_percentage ?? 0)
                      )
                    )}%`}
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 mt-1">
                  {courseData?.total_modules ??
                    courseData?.modules?.length ??
                    0}{" "}
                  Modules
                </span>
              </div>
            </div>
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-y-auto">
            {courseData.modules.map((module) => (
              <div key={module.id} className="border-b border-gray-100">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="flex items-center mr-3">
                      {module.is_locked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#13485B]">
                            {module.order}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-800">
                        {module.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transform transition-transform ${
                      expandedModules[module.id] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedModules[module.id] && (
                  <div className="bg-gray-50">
                    {/* Videos */}
                    {module.videos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => selectVideo(video, module)}
                        disabled={module.is_locked}
                        className={`w-full px-8 py-2 flex items-center text-left hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedVideo?.id === video.id
                            ? "bg-blue-50 border-r-2 border-[#13485B]"
                            : ""
                        }`}
                      >
                        <div className="w-8 h-6 bg-pri10 rounded mr-3 flex items-center justify-center">
                          <Play className="w-3 h-3 text-white fill-current" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {video.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {video.duration}
                          </p>
                        </div>
                        {(completedItems.has(`video-${video.id}`) ||
                          completedVideos.has(video.id)) && (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </button>
                    ))}

                    {/* Module Summaries - Only show after all videos are completed */}
                    {module.summaries &&
                      module.summaries.length > 0 &&
                      module.videos.every(
                        (video) =>
                          completedItems.has(`video-${video.id}`) ||
                          completedVideos.has(video.id)
                      ) && (
                        <div className="border-t border-gray-200 pt-2">
                          <h4 className="px-8 py-1 text-xs font-medium text-gray-700 uppercase tracking-wide">
                            Summaries
                          </h4>
                          {module.summaries.map((summary) => (
                            <button
                              key={summary.id}
                              onClick={() => selectSummary(summary, module)}
                              className={`w-full px-8 py-2 flex items-center text-left hover:bg-gray-100 ${
                                selectedSummary?.id === summary.id
                                  ? "bg-blue-50 border-r-2 border-[#13485B]"
                                  : ""
                              }`}
                            >
                              <div className="w-4 h-4 bg-blue-500 rounded mr-3 flex items-center justify-center">
                                <span className="text-xs text-white">📝</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">
                                  {summary.title || "Module Summary"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Reading Material
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                    {/* Quizzes */}
                    {module.quizzes.map((quiz) => (
                      <button
                        key={quiz.id}
                        onClick={() => selectQuiz(quiz, module)}
                        disabled={module.is_locked}
                        className={`w-full px-8 py-2 flex items-center text-left hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                          currentQuiz?.id === quiz.id
                            ? "bg-blue-50 border-r-2 border-[#13485B]"
                            : ""
                        }`}
                      >
                        <div className="w-4 h-4 bg-orange-500 rounded mr-3 flex items-center justify-center">
                          <span className="text-xs text-white">?</span>
                        </div>
                        <p className="text-sm text-gray-600">Module Quiz</p>
                        {completedItems.has(`quiz-${quiz.id}`) && (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 space-y-5">
            <button
              onClick={handleJoinCommunity}
              className="w-full flex items-center flex-1 px-4 py-2 bg-white text-primary shadow rounded-lg hover:bg-primary hover:text-white transition-colors text-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              {courseData?.community_link_detail?.title}
            </button>
            <button className="w-full flex items-center flex-1 px-4 py-2 bg-white text-primary shadow rounded-lg hover:bg-primary hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4 mr-2" />
              Give Feedback
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {showCourseCompletion && (
            <div className="p-6 border border-primary rounded-lg h-fit bg-white flex-1">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-gray-600">
                    You have completed the course{" "}
                    <span className="font-semibold">{courseData.title}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Rating Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate your experience
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setExperienceRating(star)}
                          className={`text-2xl md:text-3xl ${
                            star <= experienceRating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          } hover:text-yellow-400 transition-colors`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Category Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback Category
                    </label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="course">Course</option>
                      <option value="technical">Technical</option>
                      <option value="content">Content</option>
                      <option value="instructor">Instructor</option>
                      <option value="platform">Platform</option>
                    </select>
                  </div>

                  {/* Feedback Detail Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback detail
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Write more description your feedback"
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={skipCourseFeedback}
                      className="flex-1 px-4 py-2 text-gray-600 bg-gray-100  rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={submitCourseFeedback}
                      className="flex-1 px-4 py-2 bg-white text-primary shadow rounded-lg hover:text-white hover:bg-primary transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showBadgeEarned && (
            <div className="p-6 border border-primary rounded-lg h-fit bg-white flex-1">
              <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-sec10 mb-4">
                    Congratulations! You have completed the course{" "}
                    <span className="">{courseData.title}</span>
                  </h2>
                </div>

                {/* Badge Icon */}
                <div className="w-32 h-32 mx-auto mb-6">
                  {courseData.badge_detail.icon ? (
                    <img
                      src={courseData.badge_detail.icon}
                      alt="Course Badge"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Award className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-sec10 mb-8">
                  You have earned the{" "}
                  {courseData.badge_detail.title || "BEGINNER'S"} Badge
                </h3>

                {/* Action Buttons */}
                <div className="flex space-y-4 mx-auto">
                  <button
                    onClick={closeBadgeModal}
                    className="px-3 py-2 shadow-md bg-white text-primary rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Give Feedback
                  </button>

                  <button
                    onClick={() => {
                      closeBadgeModal();
                      if (courseData.community_link_detail?.link) {
                        window.open(
                          courseData.community_link_detail.link,
                          "_blank"
                        );
                      }
                    }}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:text-primary hover:bg-white transition-colors"
                  >
                    Join Community
                  </button>

                  <button
                    onClick={() => {
                      // Share badge on LinkedIn functionality
                      const shareText = `I just completed the ${
                        courseData.title
                      } course and earned the ${
                        courseData.badge_name || "BEGINNER'S"
                      } Badge! 🎉`;
                      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        window.location.origin
                      )}&title=${encodeURIComponent(shareText)}`;
                      window.open(shareUrl, "_blank");
                    }}
                    className="px-3 py-2 text-primary hover:text-primary hover:bg-white transition-colors"
                  >
                    Share Badge on LinkedIn
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showCourseCompletion && !showBadgeEarned && selectedVideo && (
            <>
              {/* Video Player */}
              <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative aspect-video h-72 flex items-center justify-center">
                  <div className="text-center w-full h-full relative">
                    <video
                      ref={setVideoRef}
                      src={selectedVideo.video_url}
                      controls
                      autoPlay
                      onTimeUpdate={handleVideoTimeUpdate}
                      onLoadedData={handleVideoLoad}
                      className="h-[60vh] w-full object-contain"
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        zIndex: 20,
                        position: "relative",
                      }}
                    />
                  </div>
                </div>

                {/* Video Progress Indicator - Only show when video is playing and not when controls are visible */}
                {videoProgress[selectedVideo.id] &&
                  videoRef &&
                  !videoRef.paused && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white z-30">
                      <div className="flex items-center space-x-2">
                        <Play className="w-5 h-5" />
                        <span className="text-sm">
                          {Math.floor(videoProgress[selectedVideo.id] / 60)}:
                          {Math.floor(videoProgress[selectedVideo.id] % 60)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="h-1 bg-white bg-opacity-30 rounded-full">
                          <div
                            className="h-1 bg-white rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                (videoProgress[selectedVideo.id] /
                                  (videoRef?.duration || 1)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm">{selectedVideo.duration}</span>
                    </div>
                  )}
              </div>

              {/* Video Title */}
              <div className="px-6 py-4 bg-white border-b">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                  Video {selectedVideo.order || ""}
                  {selectedVideo.order ? ". " : ""}
                  {selectedVideo.title}
                </h3>
              </div>

              {/* Module overview and videos list */}
              <div className="p-6 bg-white">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Module Overview
                    </h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      {selectedModule?.description && (
                        <p>{selectedModule.description}</p>
                      )}
                      {!selectedModule?.description &&
                        selectedVideo?.description && (
                          <p>{selectedVideo.description}</p>
                        )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {selectedModule?.videos?.length || 0} Course Videos
                    </h4>
                    <div className="space-y-2">
                      {selectedModule?.videos?.map((video) => (
                        <div
                          key={video.id}
                          className={`flex items-center p-3 rounded-lg border ${
                            selectedVideo?.id === video.id
                              ? "border-blue-200 bg-blue-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="w-12 h-8 bg-pri10 rounded flex items-center justify-center mr-3">
                            <PlayCircle className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <button
                              className="text-left w-full"
                              onClick={() => selectVideo(video, selectedModule)}
                            >
                              <p className="font-medium text-gray-800">
                                {video.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {video.duration}
                              </p>
                            </button>
                          </div>
                          {!selectedModule.is_locked && (
                            <button
                              onClick={() => markComplete(`video-${video.id}`)}
                              className={`ml-2 ${
                                completedItems.has(`video-${video.id}`)
                                  ? "text-green-500"
                                  : "text-gray-400 hover:text-green-500"
                              }`}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complete Module Button */}
                  {selectedModule && !selectedModule.is_locked && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Module Progress
                          </h4>
                          <p className="text-sm text-gray-600">
                            {selectedModule.quizzes.length > 0
                              ? "Complete all videos and pass the quiz to finish this module"
                              : "Complete all videos to finish this module"}
                          </p>
                        </div>
                        <button
                          onClick={handleCompleteModule}
                          disabled={!canCompleteModule()}
                          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                            canCompleteModule()
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Complete Module</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {!showCourseCompletion && !showBadgeEarned && selectedSummary && (
            <div className="p-6 bg-white flex-1">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedSummary.title || "Module Summary"}
                  </h2>
                  <p className="text-gray-600">{selectedModule.title}</p>
                </div>

                <div
                  className={`prose prose-lg max-w-none
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
                     prose-dd:text-gray-700 prose-dd:ml-4 prose-dd:mb-3`}
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedSummary.text || selectedSummary.content || "",
                  }}
                />
              </div>
            </div>
          )}

          {!showCourseCompletion && !showBadgeEarned && currentQuiz && (
            <div className="p-6 bg-white flex-1">
              <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Quiz Test
                    </h2>
                    <p className="text-gray-600">{selectedModule.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-[#13485B] font-bold">
                        {quizScore}/{selectedModule.quizzes.length}
                      </span>
                    </div>
                  </div>
                </div>

                {!showQuizResults ? (
                  <div className="space-y-6">
                    {selectedModule.quizzes.map((quiz, index) => (
                      <div
                        key={quiz.id}
                        className="p-6 border border-gray-200 rounded-lg"
                      >
                        <h3 className="font-semibold text-gray-800 mb-4">
                          {index + 1}. {quiz.question}
                        </h3>
                        <div className="space-y-3">
                          {["option_a", "option_b", "option_c", "option_d"].map(
                            (option) => (
                              <label
                                key={option}
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                  quizAnswers[quiz.id] ===
                                  option.slice(-1).toUpperCase()
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${quiz.id}`}
                                  value={option.slice(-1).toUpperCase()}
                                  checked={
                                    quizAnswers[quiz.id] ===
                                    option.slice(-1).toUpperCase()
                                  }
                                  onChange={(e) =>
                                    handleQuizAnswer(quiz.id, e.target.value)
                                  }
                                  className="mr-3"
                                />
                                <span className="flex-1">{quiz[option]}</span>
                              </label>
                            )
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <button
                        onClick={submitQuiz}
                        disabled={
                          Object.keys(quizAnswers).length !==
                          selectedModule.quizzes.length
                        }
                        className="px-6 py-2 bg-pri10 text-white rounded-lg font-medium hover:bg-pri10/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        Submit Answers
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedModule.quizzes.map((quiz, index) => (
                      <div
                        key={quiz.id}
                        className="p-6 border border-gray-200 rounded-lg"
                      >
                        <h3 className="font-semibold text-gray-800 mb-4">
                          {index + 1}. {quiz.question}
                        </h3>
                        <div className="space-y-3">
                          {["option_a", "option_b", "option_c", "option_d"].map(
                            (option) => {
                              const isCorrect =
                                quiz.correct_answer ===
                                option.slice(-1).toUpperCase();
                              const isSelected =
                                quizAnswers[quiz.id] ===
                                option.slice(-1).toUpperCase();
                              const isWrongSelection = isSelected && !isCorrect;

                              return (
                                <div
                                  key={option}
                                  className={`flex items-center p-3 border rounded-lg ${
                                    isCorrect
                                      ? "border-green-500 bg-green-50"
                                      : isWrongSelection
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-200 bg-gray-50"
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                                      isCorrect
                                        ? "bg-green-500"
                                        : isWrongSelection
                                        ? "bg-red-500"
                                        : "bg-gray-300"
                                    }`}
                                  >
                                    {isCorrect && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <span className="flex-1">{quiz[option]}</span>
                                  {isCorrect && (
                                    <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Quiz Results Actions - Show after quiz completion */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="text-center mb-6">
                        <div
                          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                            quizScore >= 2 ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          <span
                            className={`text-2xl font-bold ${
                              quizScore >= 2 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {quizScore}/{selectedModule.quizzes.length}
                          </span>
                        </div>
                        <h3
                          className={`text-xl font-semibold mb-2 ${
                            quizScore >= 2 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {quizScore >= 2 ? "Congratulations!" : "Try Again"}
                        </h3>
                        <p className="text-gray-600">
                          {quizScore >= 2
                            ? `You scored ${quizScore} out of ${selectedModule.quizzes.length}. You can now proceed to the next module!`
                            : `You scored ${quizScore} out of ${selectedModule.quizzes.length}. You need at least 2 correct answers to pass.`}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {quizScore < 2 ? (
                          // Retry button for failing scores
                          <button
                            onClick={() => {
                              setShowQuizResults(false);
                              setQuizAnswers({});
                              setQuizScore(0);
                            }}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <PlayCircle className="w-5 h-5" />
                            <span>Retry Quiz</span>
                          </button>
                        ) : (
                          // Next module button for passing scores
                          <button
                            onClick={() => {
                              // Mark quiz as completed
                              markComplete(`quiz-${currentQuiz.id}`);
                              setShowQuizResults(false);
                              setCurrentQuiz(null);

                              // Check if we can complete the module
                              if (canCompleteModule()) {
                                handleCompleteModule();
                              } else {
                                // Navigate to next module if available
                                const currentModuleIndex =
                                  courseData.modules.findIndex(
                                    (module) => module.id === selectedModule.id
                                  );
                                const nextModule =
                                  courseData.modules[currentModuleIndex + 1];

                                if (nextModule && !nextModule.is_locked) {
                                  // Navigate to next module
                                  setSelectedModule(nextModule);
                                  setSelectedVideo(
                                    nextModule.videos[0] || null
                                  );
                                  setExpandedModules((prev) => ({
                                    ...prev,
                                    [nextModule.id]: true,
                                  }));
                                  showSuccessToast(
                                    "Quiz completed! Moving to next module."
                                  );
                                } else {
                                  // Just close quiz and let user continue with videos
                                  showSuccessToast(
                                    "Quiz completed! You can now continue with the module."
                                  );
                                }
                              }
                            }}
                            className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <ChevronRight className="w-5 h-5" />
                            <span>Continue to Next Module</span>
                          </button>
                        )}

                        {/* Back to module button */}
                        <button
                          onClick={() => {
                            setShowQuizResults(false);
                            setCurrentQuiz(null);
                          }}
                          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          <span>Back to Module</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Community Modal */}
      {showCommunityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Join Our Community
              </h2>
              <p className="text-gray-600 mb-6">
                Connect with other learners and share your experiences!
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    closeCommunityModal();
                    if (courseData?.community_link_detail?.link) {
                      window.open(
                        courseData.community_link_detail.link,
                        "_blank"
                      );
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Join Community
                </button>
                <button
                  onClick={closeCommunityModal}
                  className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
