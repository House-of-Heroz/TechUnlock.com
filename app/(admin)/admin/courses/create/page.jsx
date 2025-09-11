"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Quote,
  List,
  ListOrdered,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createCourse,
  uploadFile,
  uploadCourseMedia,
  uploadBadgeMedia,
  getModuleDetailsForAdmin,
  editModules,
  editCourse,
  getCourseDetailsForEditing,
} from "@/services/admin";
import { showErrorToast, showSuccessToast } from "@/helpers/toastUtil";
import LoadingSpinner from "@/components/reusables/LoadingSpinner";

// Move RichTextEditor outside the main component to prevent re-creation
const RichTextEditor = React.memo(({ value, onChange, placeholder }) => (
  <div className="border border-gray-300 rounded-lg">
    <div className="border-b border-gray-300 p-2 flex items-center space-x-2 flex-wrap">
      <select className="text-sm border border-gray-300 rounded px-2 py-1">
        <option>Normal text</option>
        <option>Heading 1</option>
        <option>Heading 2</option>
        <option>Heading 3</option>
      </select>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <Bold className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <Italic className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <Underline className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <Strikethrough className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <Link className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <Quote className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <List className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <ListOrdered className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <AlignLeft className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <AlignCenter className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <AlignRight className="w-4 h-4" />
      </button>
      <button type="button" className="p-1 hover:bg-gray-100 rounded">
        <AlignJustify className="w-4 h-4" />
      </button>
    </div>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={6}
      className="w-full p-3 focus:outline-none resize-none"
    />
  </div>
));

RichTextEditor.displayName = "RichTextEditor";

const CreateCoursePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1); // Start from step 1
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(null);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState({
    coverImage: null,
    badgeImage: null,
    moduleVideos: [],
  });

  // File validation constants
  const FILE_LIMITS = {
    image: {
      maxSize: 10 * 1024 * 1024,
      types: ["image/jpeg", "image/png", "image/webp"],
    }, // 10MB
    video: {
      maxSize: 60 * 1024 * 1024,
      types: ["video/mp4", "video/webm", "video/avi", "video/mov"],
    }, // 30MB
    badge: {
      maxSize: 10 * 1024 * 1024,
      types: ["image/jpeg", "image/png", "image/webp"],
    }, // 5MB
  };

  // File validation function
  const validateFile = (file, type) => {
    const limits = FILE_LIMITS[type];

    if (!limits) {
      throw new Error(`Unsupported file type: ${type}`);
    }

    // Check file size
    if (file.size > limits.maxSize) {
      const maxSizeMB = limits.maxSize / (1024 * 1024);
      throw new Error(`${type} file size must be less than ${maxSizeMB}MB`);
    }

    // Check file type
    if (!limits.types.includes(file.type)) {
      throw new Error(
        `Unsupported ${type} format. Please use: ${limits.types.join(", ")}`
      );
    }

    return true;
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Enhanced data persistence with localStorage
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("courseFormData");
      return saved
        ? JSON.parse(saved)
        : {
            courseTitle: "",
            shortDescription: "",
            category: "",
            instructor: "",
            detailedDescription: "",
            numberOfModules: "",
            estimatedTime: "",
            tags: "",
            difficulty: "",
            skills: "",
          };
    }
    return {
      courseTitle: "",
      shortDescription: "",
      detailedDescription: "",
      category: "",
      instructor: "",
      numberOfModules: "",
      estimatedTime: "",
      tags: "",
      difficulty: "",
      skills: "",
    };
  });

  // Module & Quiz Setup state with persistence
  const [modules, setModules] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("courseModulesData");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 1,
              moduleNumber: "",
              moduleTitle: "",
              shortDescription: "",
              videoTitle: "",
              additionalResources: "",
              summary: "",
              videos: [],
              quizQuestions: [
                {
                  id: 1,
                  question: "",
                  options: ["", "", "", ""],
                  correctOption: "",
                },
                {
                  id: 2,
                  question: "",
                  options: ["", "", "", ""],
                  correctOption: "",
                },
              ],
            },
          ];
    }
    return [
      {
        id: 1,
        moduleNumber: "",
        moduleTitle: "",
        shortDescription: "",
        videoTitle: "",
        additionalResources: "",
        summary: "",
        videos: [],
        quizQuestions: [
          {
            id: 1,
            question: "",
            options: ["", "", "", ""],
            correctOption: "",
          },
          {
            id: 2,
            question: "",
            options: ["", "", "", ""],
            correctOption: "",
          },
        ],
      },
    ];
  });

  // Badge Setup state with persistence
  const [badgeData, setBadgeData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("courseBadgeData");
      return saved
        ? JSON.parse(saved)
        : {
            badgeTitle: "",
            badgeDescription: "",
          };
    }
    return {
      badgeTitle: "",
      badgeDescription: "",
    };
  });

  // Community Setup state with persistence
  const [communityData, setCommunityData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("courseCommunityData");
      return saved
        ? JSON.parse(saved)
        : {
            communityLink: "",
            shortMessage: "",
          };
    }
    return {
      communityLink: "",
      shortMessage: "",
    };
  });

  // Training fee Setup state with persistence
  const [trainingFeeData, setTrainingFeeData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("courseTrainingFeeData");
      return saved
        ? JSON.parse(saved)
        : {
            trainingType: "",
            amount: "",
          };
    }
    return {
      trainingType: "",
      amount: "",
    };
  });

  const [quizQuestions, setQuizQuestions] = useState([
    {
      id: 1,
      question: "",
      options: ["", ""],
      correctOption: "",
    },
    {
      id: 2,
      question: "",
      options: ["", ""],
      correctOption: "",
    },
  ]);

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [isCourseEditMode, setIsCourseEditMode] = useState(false);

  // Check if we're in edit mode from URL params
  useEffect(() => {
    const editModule = searchParams.get("editModule");
    const courseId = searchParams.get("id");
    const editCourse = searchParams.get("editCourse");

    if (editModule && courseId) {
      setIsEditMode(true);
      setEditingModuleId(editModule);
      setEditingCourseId(courseId);
      setCurrentStep(2); // Go directly to module setup step
      fetchModuleData(editModule);
    } else if (editCourse) {
      setIsCourseEditMode(true);
      setEditingCourseId(editCourse);
      setCurrentStep(1); // Start from course basics
      fetchCourseData(editCourse);
    }
  }, [searchParams]);

  // Handle course update
  const handleUpdateCourse = async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (!formData.courseTitle.trim()) {
        showErrorToast("Course title is required");
        return;
      }

      if (!uploadedFiles.coverImage) {
        showErrorToast("Cover image is required");
        return;
      }

      // Validate modules
      for (let i = 0; i < modules.length; i++) {
        const currentModule = modules[i];

        if (!currentModule.moduleTitle.trim()) {
          showErrorToast(`Module ${i + 1} title is required`);
          return;
        }

        if (!currentModule.summary.trim()) {
          showErrorToast(`Module ${i + 1} summary is required`);
          return;
        }

        // Validate quiz questions
        for (let j = 0; j < currentModule.quizQuestions.length; j++) {
          const quiz = currentModule.quizQuestions[j];

          if (!quiz.question.trim()) {
            showErrorToast(
              `Module ${i + 1}, Question ${j + 1}: Question text is required`
            );
            return;
          }

          if (!quiz.options[0]?.trim() || !quiz.options[1]?.trim()) {
            showErrorToast(
              `Module ${i + 1}, Question ${
                j + 1
              }: At least 2 options are required`
            );
            return;
          }

          if (!quiz.correctOption.trim()) {
            showErrorToast(
              `Module ${i + 1}, Question ${j + 1}: Correct answer is required`
            );
            return;
          }

          // Validate that correct answer matches one of the options
          const validOptions = ["A", "B", "C", "D"];
          if (!validOptions.includes(quiz.correctOption.toUpperCase())) {
            showErrorToast(
              `Module ${i + 1}, Question ${
                j + 1
              }: Correct answer must be A, B, C, or D`
            );
            return;
          }
        }
      }

      // Prepare course data from all tabs
      const courseData = {
        title: formData.courseTitle,
        short_description: formData.shortDescription,
        description: formData.detailedDescription,
        duration: `${formData.estimatedTime} hours`,
        instructor: formData.instructor,
        category: formData.category,
        difficulty: formData.difficulty,
        is_published: true,
        is_paid: trainingFeeData.trainingType === "paid",
        price:
          trainingFeeData.trainingType === "paid"
            ? parseFloat(trainingFeeData.amount)
            : 0,
        cover_image: uploadedFiles.coverImage,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : [],
        modules: modules.map((module, index) => ({
          title: module.moduleTitle,
          description: module.shortDescription,
          duration: "1 week",
          order: parseInt(module.moduleNumber) || index + 1,
          videos: module.videos.map((videoUrl, videoIndex) => ({
            title: module.videoTitle || `Video ${videoIndex + 1}`,
            description: module.shortDescription,
            video_url: videoUrl,
            duration: "10:00",
          })),
          summaries: [
            {
              text: module.summary || "Module summary",
            },
          ],
          quizzes: module.quizQuestions.map((q) => ({
            question: q.question,
            option_a: q.options[0] || "",
            option_b: q.options[1] || "",
            option_c: q.options[2] || "",
            option_d: q.options[3] || "",
            correct_answer: q.correctOption.toUpperCase(),
          })),
        })),
        badge: {
          title: badgeData.badgeTitle,
          description: badgeData.badgeDescription,
          icon: uploadedFiles.badgeImage || "",
        },
        community_link: {
          description: communityData.shortMessage,
          link: communityData.communityLink,
        },
      };

      console.log(
        "Sending course update data:",
        JSON.stringify(courseData, null, 2)
      );

      // Update the course
      await editCourse(courseData, editingCourseId);
      showSuccessToast("Course updated successfully!");

      // Redirect back to course details
      router.push(`/admin/courses/${editingCourseId}`);
    } catch (error) {
      console.error("Course update error:", error);
      showErrorToast(`Failed to update course: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle module update
  const handleUpdateModule = async () => {
    try {
      setIsLoading(true);

      const currentModule = modules[currentModuleIndex];

      // Validate required fields
      if (!currentModule.moduleTitle.trim()) {
        showErrorToast("Module title is required");
        return;
      }

      if (!currentModule.summary.trim()) {
        showErrorToast("Module summary is required");
        return;
      }

      // Prepare module data for update
      const moduleData = {
        title: currentModule.moduleTitle,
        description: currentModule.shortDescription,
        order: parseInt(currentModule.moduleNumber) || 1,
        videos: currentModule.videos.map((videoUrl, index) => ({
          title: currentModule.videoTitle || `Video ${index + 1}`,
          description: currentModule.shortDescription,
          video_url: videoUrl,
          duration: "10:00",
        })),
        summaries: [
          {
            text: currentModule.summary,
          },
        ],
        quizzes: currentModule.quizQuestions.map((q) => ({
          question: q.question,
          option_a: q.options[0] || "",
          option_b: q.options[1] || "",
          option_c: q.options[2] || "",
          option_d: q.options[3] || "",
          correct_answer: q.correctOption.toUpperCase(),
        })),
      };

      // Update the module
      await editModules(moduleData, editingModuleId);
      showSuccessToast("Module updated successfully!");

      // Redirect back to course details
      router.push(`/admin/courses/${editingCourseId}`);
    } catch (error) {
      console.error("Module update error:", error);
      showErrorToast(`Failed to update module: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch course data for editing
  const fetchCourseData = async (courseId) => {
    try {
      setIsLoading(true);
      const courseData = await getCourseDetailsForEditing(courseId);

      // Transform API data to match our form structure
      setFormData({
        courseTitle: courseData.title || "",
        shortDescription: courseData.short_description || "",
        detailedDescription: courseData.description || "",
        instructor: courseData.instructor || "",
        category: courseData.category || "",
        numberOfModules: courseData.modules?.length?.toString() || "",
        estimatedTime: courseData.duration?.replace(" hours", "") || "",
        tags: courseData.tags?.join(", ") || "",
        difficulty: courseData.difficulty || "",
        skills: courseData.skills?.join(", ") || "",
      });

      // Set uploaded files
      if (courseData.cover_image) {
        setUploadedFiles((prev) => ({
          ...prev,
          coverImage: courseData.cover_image,
        }));
      }

      // Transform modules data
      if (courseData.modules && courseData.modules.length > 0) {
        const transformedModules = courseData.modules.map((module, index) => ({
          id: index + 1,
          moduleNumber: module.order || (index + 1).toString(),
          moduleTitle: module.title || "",
          shortDescription: module.description || "",
          videoTitle: module.videos?.[0]?.title || "",
          additionalResources: module.additional_resources || "",
          summary: module.summaries?.[0]?.text || "",
          videos: module.videos?.map((video) => video.video_url) || [],
          quizQuestions: module.quizzes?.map((quiz, quizIndex) => ({
            id: quizIndex + 1,
            question: quiz.question || "",
            options: [
              quiz.option_a || "",
              quiz.option_b || "",
              quiz.option_c || "",
              quiz.option_d || "",
            ],
            correctOption: quiz.correct_answer || "",
          })) || [
            {
              id: 1,
              question: "",
              options: ["", "", "", ""],
              correctOption: "",
            },
            {
              id: 2,
              question: "",
              options: ["", "", "", ""],
              correctOption: "",
            },
          ],
        }));
        setModules(transformedModules);
      }

      // Transform badge data
      if (courseData.badge) {
        setBadgeData({
          badgeTitle: courseData.badge.title || "",
          badgeDescription: courseData.badge.description || "",
        });
        if (courseData.badge.icon) {
          setUploadedFiles((prev) => ({
            ...prev,
            badgeImage: courseData.badge.icon,
          }));
        }
      }

      // Transform community data
      if (courseData.community_link) {
        setCommunityData({
          communityLink: courseData.community_link.link || "",
          shortMessage: courseData.community_link.description || "",
        });
      }

      // Transform training fee data
      setTrainingFeeData({
        trainingType: courseData.is_paid ? "paid" : "free",
        amount: courseData.price?.toString() || "",
      });

      // Mark all steps as completed for edit mode
      setSteps([
        { id: 1, name: "Course Basics", active: true, completed: true },
        { id: 2, name: "Module & Quiz Setup", active: false, completed: true },
        { id: 3, name: "Badge Setup", active: false, completed: true },
        { id: 4, name: "Community Setup", active: false, completed: true },
        { id: 5, name: "Training fee Setup", active: false, completed: true },
      ]);

      showSuccessToast("Course data loaded for editing");
    } catch (error) {
      console.error("Error fetching course data:", error);
      showErrorToast("Failed to load course data for editing");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch module data for editing
  const fetchModuleData = async (moduleId) => {
    try {
      setIsLoading(true);
      const moduleData = await getModuleDetailsForAdmin(moduleId);

      // Transform API data to match our form structure
      const transformedModule = {
        id: moduleData.id,
        moduleNumber: moduleData.order || "",
        moduleTitle: moduleData.title || "",
        shortDescription: moduleData.description || "",
        videoTitle: moduleData.videos?.[0]?.title || "",
        additionalResources: moduleData.additional_resources || "",
        summary: moduleData.summaries?.[0]?.text || "",
        videos: moduleData.videos?.map((video) => video.video_url) || [],
        quizQuestions: moduleData.quizzes?.map((quiz, index) => ({
          id: index + 1,
          question: quiz.question || "",
          options: [
            quiz.option_a || "",
            quiz.option_b || "",
            quiz.option_c || "",
            quiz.option_d || "",
          ],
          correctOption: quiz.correct_answer || "",
        })) || [
          {
            id: 1,
            question: "",
            options: ["", "", "", ""],
            correctOption: "",
          },
          {
            id: 2,
            question: "",
            options: ["", "", "", ""],
            correctOption: "",
          },
        ],
      };

      // Replace the first module with the fetched data
      setModules([transformedModule]);
      setCurrentModuleIndex(0);

      // Mark steps as completed for module edit mode
      setSteps([
        { id: 1, name: "Course Basics", active: false, completed: true },
        { id: 2, name: "Module & Quiz Setup", active: true, completed: true },
        { id: 3, name: "Badge Setup", active: false, completed: true },
        { id: 4, name: "Community Setup", active: false, completed: true },
        { id: 5, name: "Training fee Setup", active: false, completed: true },
      ]);

      showSuccessToast("Module data loaded for editing");
    } catch (error) {
      console.error("Error fetching module data:", error);
      showErrorToast("Failed to load module data for editing");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save functionality
  const saveToLocalStorage = useCallback((key, data) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, []);

  // Enhanced input handlers with auto-save
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prevFormData) => {
        const newFormData = {
          ...prevFormData,
          [field]: value,
        };
        saveToLocalStorage("courseFormData", newFormData);
        return newFormData;
      });
    },
    [saveToLocalStorage]
  );

  const handleModuleInputChange = useCallback(
    (field, value) => {
      setModules((prevModules) => {
        const newModules = prevModules.map((module, index) =>
          index === currentModuleIndex ? { ...module, [field]: value } : module
        );
        saveToLocalStorage("courseModulesData", newModules);
        return newModules;
      });
    },
    [currentModuleIndex, saveToLocalStorage]
  );

  // Memoize the detailed description onChange handler
  const handleDetailedDescriptionChange = useCallback(
    (value) => {
      handleInputChange("detailedDescription", value);
    },
    [handleInputChange]
  );

  // Memoize the module summary onChange handler
  const handleModuleSummaryChange = useCallback(
    (value) => {
      handleModuleInputChange("summary", value);
    },
    [currentModuleIndex]
  );

  // Memoize the module additional resources onChange handler
  const handleModuleAdditionalResourcesChange = useCallback(
    (value) => {
      handleModuleInputChange("additionalResources", value);
    },
    [currentModuleIndex]
  );

  const addModule = () => {
    const newModuleId = Math.max(...modules.map((m) => m.id)) + 1;
    const newModule = {
      id: newModuleId,
      moduleNumber: "",
      moduleTitle: "",
      shortDescription: "",
      videoTitle: "",
      additionalResources: "",
      summary: "",
      videos: [],
      quizQuestions: [
        {
          id: 1,
          question: "",
          options: ["", "", "", ""],
          correctOption: "",
        },
        {
          id: 2,
          question: "",
          options: ["", "", "", ""],
          correctOption: "",
        },
      ],
    };
    setModules((prev) => [...prev, newModule]);
    setCurrentModuleIndex(modules.length);
  };

  const deleteModule = (moduleIndex) => {
    if (modules.length > 1) {
      setModules((prev) => prev.filter((_, index) => index !== moduleIndex));
      if (currentModuleIndex >= moduleIndex) {
        setCurrentModuleIndex(Math.max(0, currentModuleIndex - 1));
      }
    }
  };

  const duplicateModule = (moduleIndex) => {
    const moduleToDuplicate = modules[moduleIndex];
    const newModuleId = Math.max(...modules.map((m) => m.id)) + 1;
    const duplicatedModule = {
      ...moduleToDuplicate,
      id: newModuleId,
      moduleNumber: "",
      moduleTitle: `${moduleToDuplicate.moduleTitle} (Copy)`,
      videos: [],
    };
    setModules((prev) => [...prev, duplicatedModule]);
    setCurrentModuleIndex(modules.length);
  };

  const handleBadgeInputChange = useCallback(
    (field, value) => {
      setBadgeData((prevBadgeData) => {
        const newBadgeData = {
          ...prevBadgeData,
          [field]: value,
        };
        saveToLocalStorage("courseBadgeData", newBadgeData);
        return newBadgeData;
      });
    },
    [saveToLocalStorage]
  );

  const handleCommunityInputChange = useCallback(
    (field, value) => {
      setCommunityData((prevCommunityData) => {
        const newCommunityData = {
          ...prevCommunityData,
          [field]: value,
        };
        saveToLocalStorage("courseCommunityData", newCommunityData);
        return newCommunityData;
      });
    },
    [saveToLocalStorage]
  );

  const handleTrainingFeeInputChange = useCallback(
    (field, value) => {
      setTrainingFeeData((prevTrainingFeeData) => {
        const newTrainingFeeData = {
          ...prevTrainingFeeData,
          [field]: value,
        };
        saveToLocalStorage("courseTrainingFeeData", newTrainingFeeData);
        return newTrainingFeeData;
      });
    },
    [saveToLocalStorage]
  );

  // Initialize steps with proper state management
  const [steps, setSteps] = useState(() => {
    if (typeof window !== "undefined") {
      const savedSteps = localStorage.getItem("courseCreationSteps");
      return savedSteps
        ? JSON.parse(savedSteps)
        : [
            { id: 1, name: "Course Basics", active: true, completed: false },
            {
              id: 2,
              name: "Module & Quiz Setup",
              active: false,
              completed: false,
            },
            { id: 3, name: "Badge Setup", active: false, completed: false },
            { id: 4, name: "Community Setup", active: false, completed: false },
            {
              id: 5,
              name: "Training fee Setup",
              active: false,
              completed: false,
            },
          ];
    }
    return [
      { id: 1, name: "Course Basics", active: true, completed: false },
      { id: 2, name: "Module & Quiz Setup", active: false, completed: false },
      { id: 3, name: "Badge Setup", active: false, completed: false },
      { id: 4, name: "Community Setup", active: false, completed: false },
      { id: 5, name: "Training fee Setup", active: false, completed: false },
    ];
  });

  // Handle step navigation
  const handleStepClick = (stepId) => {
    // For edit mode, allow navigation to any step
    if (isCourseEditMode || isEditMode) {
      setCurrentStep(stepId);
      return;
    }

    // For create mode, only allow navigation to completed steps or current step
    if (
      stepId <= currentStep ||
      steps.find((s) => s.id === stepId)?.completed
    ) {
      setCurrentStep(stepId);
    }
  };

  // Clear all form data
  const clearFormData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("courseFormData");
      localStorage.removeItem("courseModulesData");
      localStorage.removeItem("courseBadgeData");
      localStorage.removeItem("courseCommunityData");
      localStorage.removeItem("courseTrainingFeeData");
      localStorage.removeItem("courseCreationSteps");
    }

    // Reset all state
    setFormData({
      courseTitle: "",
      shortDescription: "",
      detailedDescription: "",
      numberOfModules: "",
      instructor: "",
      category: "",
      estimatedTime: "",
      tags: "",
      difficulty: "",
      skills: "",
    });

    setModules([
      {
        id: 1,
        moduleNumber: "",
        moduleTitle: "",
        shortDescription: "",
        videoTitle: "",
        additionalResources: "",
        summary: "",
        videos: [],
        quizQuestions: [
          { id: 1, question: "", options: ["", "", "", ""], correctOption: "" },
          { id: 2, question: "", options: ["", "", "", ""], correctOption: "" },
        ],
      },
    ]);

    setBadgeData({ badgeTitle: "", badgeDescription: "" });
    setCommunityData({ communityLink: "", shortMessage: "" });
    setTrainingFeeData({ trainingType: "", amount: "" });
    setCurrentModuleIndex(0);

    showSuccessToast("Form data cleared successfully!");
  };

  const handleQuizQuestionChange = (questionId, field, value) => {
    setModules((prev) =>
      prev.map((module, index) =>
        index === currentModuleIndex
          ? {
              ...module,
              quizQuestions: module.quizQuestions.map((q) =>
                q.id === questionId ? { ...q, [field]: value } : q
              ),
            }
          : module
      )
    );
  };

  const handleQuizOptionChange = (questionId, optionIndex, value) => {
    setModules((prev) =>
      prev.map((module, index) =>
        index === currentModuleIndex
          ? {
              ...module,
              quizQuestions: module.quizQuestions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      options: q.options.map((opt, idx) =>
                        idx === optionIndex ? value : opt
                      ),
                    }
                  : q
              ),
            }
          : module
      )
    );
  };

  const addQuizOption = (questionId) => {
    setModules((prev) =>
      prev.map((module, index) =>
        index === currentModuleIndex
          ? {
              ...module,
              quizQuestions: module.quizQuestions.map((q) =>
                q.id === questionId ? { ...q, options: [...q.options, ""] } : q
              ),
            }
          : module
      )
    );
  };

  const addQuizQuestion = () => {
    const currentModule = modules[currentModuleIndex];
    const newId = Math.max(...currentModule.quizQuestions.map((q) => q.id)) + 1;
    setModules((prev) =>
      prev.map((module, index) =>
        index === currentModuleIndex
          ? {
              ...module,
              quizQuestions: [
                ...module.quizQuestions,
                {
                  id: newId,
                  question: "",
                  options: ["", "", "", ""],
                  correctOption: "",
                },
              ],
            }
          : module
      )
    );
  };

  // Debug function to check bunny uploader configuration
  const checkBunnyConfig = () => {
    console.log("Checking Bunny.net configuration...");
    console.log(
      "Storage Zone:",
      process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE_NAME
    );
    console.log("Storage:", process.env.NEXT_PUBLIC_STORAGE);
    console.log(
      "Access Key:",
      process.env.NEXT_PUBLIC_BUNNY_ACCESS_KEY ? "Set" : "Not set"
    );
  };

  const handleContinue = () => {
    if (currentStep < steps.length) {
      // Mark current step as completed
      setSteps((prevSteps) => {
        const updatedSteps = prevSteps.map((step) => ({
          ...step,
          active: step.id === currentStep + 1,
          completed: step.id <= currentStep,
        }));

        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "courseCreationSteps",
            JSON.stringify(updatedSteps)
          );
        }

        return updatedSteps;
      });

      setCurrentStep(currentStep + 1);
    }
  };

  const handleFileUpload = async (file, type) => {
    try {
      // Validate file before upload
      validateFile(file, type);

      // Set upload state
      setIsLoading(true);
      setUploadingFile(file.name);
      setUploadProgress(0);

      let uploadedFile;

      // Validate course title for course-related uploads
      if (
        (type === "image" || type === "video") &&
        !formData.courseTitle.trim()
      ) {
        showErrorToast("Please enter a course title before uploading files");
        return;
      }

      // Show file info
      console.log(
        `Uploading ${type}: ${file.name} (${formatFileSize(file.size)})`
      );

      if (type === "image") {
        // Use course media upload for cover images
        uploadedFile = await uploadCourseMedia(
          file,
          "image",
          formData.courseTitle,
          1 // Add index parameter for cover image
        );
        setUploadedFiles((prev) => ({
          ...prev,
          coverImage: uploadedFile.url,
        }));
      } else if (type === "video") {
        // Use course media upload for videos
        const currentModule = modules[currentModuleIndex];
        uploadedFile = await uploadCourseMedia(
          file,
          "video",
          formData.courseTitle,
          currentModule.videos.length + 1
        );
        setModules((prev) =>
          prev.map((module, index) =>
            index === currentModuleIndex
              ? { ...module, videos: [...module.videos, uploadedFile.url] }
              : module
          )
        );
      } else if (type === "badge") {
        // Validate badge title for badge uploads
        if (!badgeData.badgeTitle.trim()) {
          showErrorToast(
            "Please enter a badge title before uploading badge image"
          );
          return;
        }
        // Use badge media upload for badge images
        uploadedFile = await uploadBadgeMedia(file, badgeData.badgeTitle);
        setUploadedFiles((prev) => ({
          ...prev,
          badgeImage: uploadedFile.url,
        }));
      }

      setUploadProgress(100);
      showSuccessToast(`${type} uploaded successfully!`);
    } catch (error) {
      console.error("Upload error:", error);
      showErrorToast(`Failed to upload ${type}: ${error.message}`);
    } finally {
      setIsLoading(false);
      setUploadingFile(null);
      setUploadProgress(0);
    }
  };

  const handlePublishCourse = async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (!formData.courseTitle.trim()) {
        showErrorToast("Course title is required");
        return;
      }

      if (!uploadedFiles.coverImage) {
        showErrorToast("Cover image is required");
        return;
      }

      // Validate modules
      for (let i = 0; i < modules.length; i++) {
        const currentModule = modules[i];

        if (!currentModule.moduleTitle.trim()) {
          showErrorToast(`Module ${i + 1} title is required`);
          return;
        }

        if (!currentModule.summary.trim()) {
          showErrorToast(`Module ${i + 1} summary is required`);
          return;
        }

        // Validate quiz questions
        for (let j = 0; j < currentModule.quizQuestions.length; j++) {
          const quiz = currentModule.quizQuestions[j];

          if (!quiz.question.trim()) {
            showErrorToast(
              `Module ${i + 1}, Question ${j + 1}: Question text is required`
            );
            return;
          }

          if (!quiz.options[0]?.trim() || !quiz.options[1]?.trim()) {
            showErrorToast(
              `Module ${i + 1}, Question ${
                j + 1
              }: At least 2 options are required`
            );
            return;
          }

          if (!quiz.correctOption.trim()) {
            showErrorToast(
              `Module ${i + 1}, Question ${j + 1}: Correct answer is required`
            );
            return;
          }

          // Validate that correct answer matches one of the options
          const validOptions = ["A", "B", "C", "D"];
          if (!validOptions.includes(quiz.correctOption.toUpperCase())) {
            showErrorToast(
              `Module ${i + 1}, Question ${
                j + 1
              }: Correct answer must be A, B, C, or D`
            );
            return;
          }
        }
      }

      // Prepare course data from all tabs
      const courseData = {
        title: formData.courseTitle,
        short_description: formData.shortDescription,
        description: formData.detailedDescription,
        duration: `${formData.estimatedTime} hours`,
        instructor: formData.instructor,
        category: formData.category,
        difficulty: formData.difficulty,
        is_published: true,
        is_paid: trainingFeeData.trainingType === "paid",
        price:
          trainingFeeData.trainingType === "paid"
            ? parseFloat(trainingFeeData.amount)
            : 0,
        cover_image: uploadedFiles.coverImage,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : [],
        modules: modules.map((module, index) => ({
          title: module.moduleTitle,
          description: module.shortDescription,
          duration: "1 week",
          order: parseInt(module.moduleNumber) || index + 1,
          videos: module.videos.map((videoUrl, videoIndex) => ({
            title: module.videoTitle || `Video ${videoIndex + 1}`,
            description: module.shortDescription,
            video_url: videoUrl,
            duration: "10:00",
          })),
          summaries: [
            {
              text: module.summary || "Module summary",
            },
          ],
          quizzes: module.quizQuestions.map((q) => ({
            question: q.question,
            option_a: q.options[0] || "",
            option_b: q.options[1] || "",
            option_c: q.options[2] || "",
            option_d: q.options[3] || "",
            correct_answer: q.correctOption.toUpperCase(),
          })),
        })),
        badge: {
          title: badgeData.badgeTitle,
          description: badgeData.badgeDescription,
          icon: uploadedFiles.badgeImage || "",
        },
        community_link: {
          description: communityData.shortMessage,
          link: communityData.communityLink,
        },
      };

      console.log("Sending course data:", JSON.stringify(courseData, null, 2));

      // Create the course
      const result = await createCourse(courseData);
      showSuccessToast("Course created successfully!");

      // Clear form data after successful creation
      clearFormData();
      localStorage.removeItem("courseCreationSteps");
      // Redirect to courses page
      router.push("/admin/courses");
    } catch (error) {
      console.error("Course creation error:", error);
      showErrorToast(`Failed to create course: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading && <LoadingSpinner />}

      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode
            ? `Edit Module ${editingModuleId}`
            : isCourseEditMode
            ? `Edit Course`
            : "Create Course"}
        </h1>
      </div>

      {/* Step Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {steps.map((step) => (
          <button
            key={step.id}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              step.id === currentStep
                ? "bg-[#13485B] text-white"
                : step.completed
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => handleStepClick(step.id)}
            disabled={
              !isCourseEditMode &&
              !isEditMode &&
              step.id > currentStep &&
              !step.completed
            }
          >
            <div className="flex items-center justify-center space-x-2">
              {step.completed && step.id < currentStep && (
                <span className="text-green-600">✓</span>
              )}
              <span>{step.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Course Basics Form */}
      {currentStep === 1 && (
        <div className="space-y-8">
          {/* Image/Video Upload */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Course Media
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-500 text-2xl">📷</span>
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], "image");
                    }
                  }}
                  className="hidden"
                  id="cover-image-upload"
                />
                <label
                  htmlFor="cover-image-upload"
                  className="flex items-center justify-center space-x-2 text-[#13485B] hover:text-blue-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add photo</span>
                </label>
                <p className="text-gray-600">Drag and drop photo.</p>
                <p className="text-sm text-gray-500">
                  Max size for image is 10mb
                </p>
                {uploadedFiles.coverImage && (
                  <div className="mt-4">
                    <p className="text-sm text-green-600 mb-2">
                      ✓ Cover image uploaded
                    </p>
                    <div className="relative inline-block">
                      <Image
                        src={uploadedFiles.coverImage}
                        alt="Cover"
                        width={128}
                        height={80}
                        className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => {
                          setUploadedFiles((prev) => {
                            const newState = { ...prev, coverImage: null };
                            saveToLocalStorage("courseUploadedFiles", newState);
                            return newState;
                          });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Course Information
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Course title
                  </label>
                  <input
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) =>
                      handleInputChange("courseTitle", e.target.value)
                    }
                    placeholder="Enter course title"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Short description
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      handleInputChange("shortDescription", e.target.value)
                    }
                    placeholder="Enter short description. Not more than 150 word"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Detailed description
                  </label>
                  <RichTextEditor
                    key="detailed-description"
                    value={formData.detailedDescription}
                    onChange={handleDetailedDescriptionChange}
                    placeholder="Enter a description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Instructor
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) =>
                      handleInputChange("instructor", e.target.value)
                    }
                    placeholder="Enter Instructor N ame."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Number of modules
                  </label>
                  <select
                    value={formData.numberOfModules}
                    onChange={(e) =>
                      handleInputChange("numberOfModules", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Number of modules</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Estimated time for completion
                  </label>
                  <select
                    value={formData.estimatedTime}
                    onChange={(e) =>
                      handleInputChange("estimatedTime", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Enter/select time for completion</option>
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                    <option value="5">5 hours</option>
                    <option value="6">6 hours</option>
                    <option value="8">8 hours</option>
                    <option value="10">10 hours</option>
                    <option value="12">12 hours</option>
                    <option value="15">15 hours</option>
                    <option value="20">20 hours</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Time is in hours</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    placeholder="Enter tags separated by commas (e.g., free, beginner, react, javascript)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple tags with commas
                  </p>
                  {formData.tags && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.split(",").map((tag, index) => {
                          const trimmedTag = tag.trim();
                          return trimmedTag ? (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {trimmedTag}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      handleInputChange("difficulty", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      Select Difficulty (Beginner, Intermediate)
                    </option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Web Development"> Web Development</option>
                    <option value="Data Analysis">Data Analysis</option>
                    <option value=" Artificial Intelligence">
                      Artificial Intelligence
                    </option>
                    <option value=" UI/UX Design">UI/UX Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Skills
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) =>
                      handleInputChange("skills", e.target.value)
                    }
                    placeholder="Add skills"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Add skills using comma/enter
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module & Quiz Setup Form */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Module Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Module Management
              </h3>
              <button
                onClick={addModule}
                className="bg-blue-100 text-[#13485B] px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Module</span>
              </button>
            </div>

            {/* Module Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {modules.map((module, index) => (
                <button
                  key={module.id}
                  onClick={() => setCurrentModuleIndex(index)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    index === currentModuleIndex
                      ? "bg-[#13485B] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>Module {index + 1}</span>
                  {modules.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteModule(index);
                      }}
                      className="ml-2 text-red-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Media Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Media Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Cover Image Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-600">🖼️</span>
                  <span className="font-medium text-sm">Cover Image</span>
                </div>
                {uploadedFiles.coverImage ? (
                  <div className="flex items-center space-x-2">
                    <Image
                      src={uploadedFiles.coverImage}
                      alt="Cover"
                      width={48}
                      height={32}
                      className="w-12 h-8 object-cover rounded"
                    />
                    <span className="text-xs text-green-600">✓ Uploaded</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Not uploaded</span>
                )}
              </div>

              {/* Badge Image Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-purple-600">🏆</span>
                  <span className="font-medium text-sm">Badge Image</span>
                </div>
                {uploadedFiles.badgeImage ? (
                  <div className="flex items-center space-x-2">
                    <Image
                      src={uploadedFiles.badgeImage}
                      alt="Badge"
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="text-xs text-green-600">✓ Uploaded</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Not uploaded</span>
                )}
              </div>

              {/* Videos Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-red-600">🎥</span>
                  <span className="font-medium text-sm">Total Videos</span>
                </div>
                <div className="text-sm">
                  {modules.reduce(
                    (total, module) => total + module.videos.length,
                    0
                  )}{" "}
                  videos across {modules.length} modules
                </div>
              </div>
            </div>

            {/* Module Videos Breakdown */}
            {modules.some((module) => module.videos.length > 0) && (
              <div className="mt-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Videos by Module:
                </h4>
                <div className="space-y-2">
                  {modules.map(
                    (module, index) =>
                      module.videos.length > 0 && (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm">
                            Module {index + 1}:{" "}
                            {module.moduleTitle || `Module ${index + 1}`}
                          </span>
                          <span className="text-sm text-blue-600">
                            {module.videos.length} video(s)
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current Module Setup */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Module {currentModuleIndex + 1} Setup
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => duplicateModule(currentModuleIndex)}
                  className="p-2 hover:bg-gray-100 rounded text-gray-600"
                  title="Duplicate Module"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  *Module Number
                </label>
                <select
                  value={modules[currentModuleIndex]?.moduleNumber || ""}
                  onChange={(e) =>
                    handleModuleInputChange("moduleNumber", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select module</option>
                  {Array.from({ length: 20 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Module {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  *Module Title
                </label>
                <input
                  type="text"
                  value={modules[currentModuleIndex]?.moduleTitle || ""}
                  onChange={(e) =>
                    handleModuleInputChange("moduleTitle", e.target.value)
                  }
                  placeholder="Enter module title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short description
                </label>
                <input
                  type="text"
                  value={modules[currentModuleIndex]?.shortDescription || ""}
                  onChange={(e) =>
                    handleModuleInputChange("shortDescription", e.target.value)
                  }
                  placeholder="Enter short description. Not more than 150 word"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Module Videos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Module Videos
              </h3>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronUp className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  *Video title
                </label>
                <input
                  type="text"
                  value={modules[currentModuleIndex]?.videoTitle || ""}
                  onChange={(e) =>
                    handleModuleInputChange("videoTitle", e.target.value)
                  }
                  placeholder="Enter video title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Upload
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-2xl">🎥</span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/avi,video/mov"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0], "video");
                        }
                      }}
                      className="hidden"
                      id="video-upload"
                    />

                    {/* Upload Progress */}
                    {isLoading && uploadingFile && (
                      <div className="mb-4">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">
                            Uploading {uploadingFile}...
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadProgress}% complete
                        </p>
                      </div>
                    )}

                    <label
                      htmlFor="video-upload"
                      className={`flex items-center justify-center space-x-2 text-[#13485B] hover:text-blue-700 cursor-pointer ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isLoading ? "Uploading..." : "Add video"}</span>
                    </label>
                    <p className="text-gray-600">Drag and drop video.</p>
                    <p className="text-sm text-gray-500">
                      Max size for video is 60MB. Supported formats: MP4, WebM,
                      AVI, MOV
                    </p>
                    {modules[currentModuleIndex]?.videos.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-green-600 mb-2">
                          ✓ {modules[currentModuleIndex].videos.length} video(s)
                          uploaded
                        </p>
                        <div className="space-y-2">
                          {modules[currentModuleIndex].videos.map(
                            (videoUrl, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 bg-gray-50 p-2 rounded"
                              >
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                  <span className="text-blue-600 text-xs">
                                    🎥
                                  </span>
                                </div>
                                <span className="text-sm text-gray-700 flex-1">
                                  Video {index + 1}
                                </span>
                                <button
                                  onClick={() => {
                                    setModules((prev) =>
                                      prev.map((module, idx) =>
                                        idx === currentModuleIndex
                                          ? {
                                              ...module,
                                              videos: module.videos.filter(
                                                (_, i) => i !== index
                                              ),
                                            }
                                          : module
                                      )
                                    );
                                  }}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Additional resources
            </h3>
            <RichTextEditor
              key={`module-${currentModuleIndex}-additional-resources`}
              value={modules[currentModuleIndex]?.additionalResources || ""}
              onChange={handleModuleAdditionalResourcesChange}
              placeholder="Enter a description..."
            />
            <button
              onClick={() => {
                const videoInput = document.getElementById("video-upload");
                if (videoInput) {
                  videoInput.click();
                }
              }}
              className="mt-4 bg-blue-100 text-[#13485B] px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Add Video
            </button>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronUp className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <RichTextEditor
              key={`module-${currentModuleIndex}-summary`}
              value={modules[currentModuleIndex]?.summary || ""}
              onChange={handleModuleSummaryChange}
              placeholder="Enter a description..."
            />
          </div>

          {/* Quiz */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Quiz</h3>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronUp className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Each quiz question requires: a question text, 4 options (A, B, C,
              D), and a correct answer selection.
            </p>

            <div className="space-y-6">
              {modules[currentModuleIndex]?.quizQuestions.map(
                (question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-800">
                        Question {index + 1}
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) =>
                            handleQuizQuestionChange(
                              question.id,
                              "question",
                              e.target.value
                            )
                          }
                          placeholder="Enter quiz question"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Options
                        </label>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-3"
                          >
                            <span className="text-sm font-medium text-gray-600 w-16">
                              Option {String.fromCharCode(65 + optionIndex)}:
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                handleQuizOptionChange(
                                  question.id,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              placeholder="Enter option"
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        ))}

                        <button
                          onClick={() => addQuizOption(question.id)}
                          className="flex items-center space-x-2 text-[#13485B] hover:text-blue-700 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Option</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct option
                        </label>
                        <select
                          value={question.correctOption}
                          onChange={(e) =>
                            handleQuizQuestionChange(
                              question.id,
                              "correctOption",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select correct answer</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              )}

              <div className="flex space-x-4">
                <button
                  onClick={addQuizQuestion}
                  className="bg-blue-100 text-[#13485B] px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Add Question
                </button>
                <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Duplicate Module
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Setup Form */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Badge Setup
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Badge Title
                  </label>
                  <input
                    type="text"
                    value={badgeData.badgeTitle}
                    onChange={(e) =>
                      handleBadgeInputChange("badgeTitle", e.target.value)
                    }
                    placeholder="Enter badge title"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Badge Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-gray-500 text-2xl">🏔️</span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], "badge");
                          }
                        }}
                        className="hidden"
                        id="badge-image-upload"
                      />
                      <label
                        htmlFor="badge-image-upload"
                        className="flex items-center justify-center space-x-2 text-[#13485B] hover:text-blue-700 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Photos</span>
                      </label>
                      {uploadedFiles.badgeImage && (
                        <div className="mt-4">
                          <p className="text-sm text-green-600 mb-2">
                            ✓ Badge image uploaded
                          </p>
                          <div className="relative inline-block">
                            <Image
                              src={uploadedFiles.badgeImage}
                              alt="Badge"
                              width={128}
                              height={128}
                              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() =>
                                setUploadedFiles((prev) => ({
                                  ...prev,
                                  badgeImage: null,
                                }))
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge description
                  </label>
                  <input
                    type="text"
                    value={badgeData.badgeDescription}
                    onChange={(e) =>
                      handleBadgeInputChange("badgeDescription", e.target.value)
                    }
                    placeholder="Enter badge description"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Setup Form */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Community Setup
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Community link
                  </label>
                  <input
                    type="text"
                    value={communityData.communityLink}
                    onChange={(e) =>
                      handleCommunityInputChange(
                        "communityLink",
                        e.target.value
                      )
                    }
                    placeholder="Enter community link"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short message
                  </label>
                  <input
                    type="text"
                    value={communityData.shortMessage}
                    onChange={(e) =>
                      handleCommunityInputChange("shortMessage", e.target.value)
                    }
                    placeholder="Enter short message"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training fee Setup Form */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Training fee Setup
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    *Training type
                  </label>
                  <select
                    value={trainingFeeData.trainingType}
                    onChange={(e) =>
                      handleTrainingFeeInputChange(
                        "trainingType",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select if training is free or paid</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={trainingFeeData.amount}
                    onChange={(e) =>
                      handleTrainingFeeInputChange("amount", e.target.value)
                    }
                    placeholder="Enter training amount"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {!isEditMode && (
        <>
          {currentStep === 1 && (
            <div className="flex justify-between">
              {isCourseEditMode && (
                <button
                  onClick={() => router.back()}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleContinue}
                className="bg-[#13485B] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
              >
                Continue to module →
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex justify-between">
              {isCourseEditMode && (
                <button
                  onClick={() => router.back()}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleContinue}
                className="bg-[#13485B] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
              >
                Continue to Badge Setup →
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex justify-between">
              {isCourseEditMode && (
                <button
                  onClick={() => router.back()}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleContinue}
                className="bg-[#13485B] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
              >
                Continue to Community →
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex justify-between">
              {isCourseEditMode && (
                <button
                  onClick={() => router.back()}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleContinue}
                className="bg-[#13485B] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
              >
                Continue to Training fee →
              </button>
            </div>
          )}

          {currentStep === 5 && (
            <div className="flex justify-between">
              {isCourseEditMode && (
                <button
                  onClick={() => router.back()}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={
                  isCourseEditMode ? handleUpdateCourse : handlePublishCourse
                }
                className="bg-[#13485B] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
              >
                {isCourseEditMode ? "Update Course →" : "Publish Course →"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Module Edit Mode Navigation */}
      {isEditMode && currentStep === 2 && (
        <div className="flex justify-between">
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateModule}
            className="bg-[#13485B] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Module
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateCoursePage;
