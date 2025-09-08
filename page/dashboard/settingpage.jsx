"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  updateProfile,
  changePassword,
  uploadToCloudinary,
} from "@/services/account";
import { ChevronLeft, Camera, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/Context/auth";
import { showSuccessToast, showErrorToast } from "@/helpers/toastUtil";

const SettingsPage = () => {
  // URL state management
  const { auth } = useAuth();
  const [currentTab, setCurrentTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    homeAddress: "",
    phone: "",
    gender: "",
    country: "",
    state: "",
    dateOfBirth: "",
    qualification: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // URL state management
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab") || "profile";
    setCurrentTab(tab);

    // Load profile data from URL or localStorage
    const savedProfile = urlParams.get("profile");
    if (savedProfile) {
      try {
        setProfileData(JSON.parse(decodeURIComponent(savedProfile)));
      } catch (e) {
        console.error("Error parsing profile data from URL");
      }
    }
  }, []);

  // Prefill from logged-in user when available
  useEffect(() => {
    if (!auth) return;
    setProfileData((prev) => ({
      firstName: auth.first_name || prev.firstName,
      lastName: auth.last_name || prev.lastName,
      email: auth.email || prev.email,
      homeAddress: auth.home_address || prev.homeAddress,
      phone: auth.phone_number || prev.phone,
      gender: auth.gender || prev.gender,
      country: auth.country || prev.country,
      state: auth.state || prev.state,
      dateOfBirth: auth.date_of_birth || prev.dateOfBirth,
      qualification: auth.qualification || prev.qualification,
    }));
    if (auth.profile_picture) {
      setProfileImage(auth.profile_picture);
    }
  }, [auth]);

  // Update URL when tab changes
  const updateURL = (tab, data = null) => {
    const url = new URL(window.location);
    url.searchParams.set("tab", tab);

    if (data && tab === "profile") {
      url.searchParams.set("profile", encodeURIComponent(JSON.stringify(data)));
    }

    window.history.pushState({}, "", url);
  };

  // Tab switching
  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    updateURL(tab, tab === "profile" ? profileData : null);
    setErrors({});
  };

  // Profile image handling
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors({ ...errors, image: "Image size should be less than 5MB" });
        return;
      }
      setProfileImage(file);
      setErrors({ ...errors, image: null });
    }
  };

  // Validation functions
  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!profileData.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!profileData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!profileData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!profileData.homeAddress.trim())
      newErrors.homeAddress = "Home address is required";
    if (!profileData.gender) newErrors.gender = "Gender is required";
    if (!profileData.country) newErrors.country = "Country is required";
    if (!profileData.state) newErrors.state = "State is required";
    if (!profileData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!profileData.qualification)
      newErrors.qualification = "Qualification is required";

    return newErrors;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  // API calls (mock implementations)
  const updateProfileHandler = async () => {
    setIsLoading(true);
    try {
      let profilePictureUrl = null;
      if (profileImage && typeof profileImage !== "string") {
        // Use bunny-uploader for profile images
        profilePictureUrl = await uploadToCloudinary(profileImage, {
          type: "profile",
          userId: auth?.id,
        });
      } else if (typeof profileImage === "string") {
        profilePictureUrl = profileImage;
      }

      const payload = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        home_address: profileData.homeAddress,
        phone_number: profileData.phone,
        gender: profileData.gender,
        country: profileData.country,
        state: profileData.state,
        date_of_birth: profileData.dateOfBirth,
        qualification: profileData.qualification,
      };
      if (profilePictureUrl) payload.profile_picture = profilePictureUrl;

      await updateProfile(payload);
      updateURL("profile", profileData);
      showSuccessToast("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to update profile. Please try again.";
      setErrors({ general: apiMessage });
      showErrorToast(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changePasswordHandler = async () => {
    setIsLoading(true);
    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showSuccessToast("Password changed successfully!");
    } catch (error) {
      setErrors({ general: "Failed to change password. Please try again." });
      showErrorToast("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission
  const handleSaveSettings = async () => {
    if (currentTab === "profile") {
      const validationErrors = validateProfile();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      await updateProfileHandler();
    } else if (currentTab === "password") {
      const validationErrors = validatePassword();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      await changePasswordHandler();
    }
  };

  const handleInputChange = (field, value) => {
    if (currentTab === "profile") {
      const newData = { ...profileData, [field]: value };
      setProfileData(newData);
      updateURL("profile", newData);
    } else {
      setPasswordData({ ...passwordData, [field]: value });
    }

    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <button className="hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="px-6 py-2 bg-[#268FB6] text-white rounded-lg hover:bg-[#268FB6]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Saving..." : "Save settings"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex w-fit bg-[#EAF7FC] rounded-lg mt-6">
          {["Profile", "Password"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab.toLowerCase())}
              className={`px-6 py-3 font-medium rounded-lg text-sm transition-colors ${
                currentTab === tab.toLowerCase()
                  ? "text-white bg-[#268FB6] border-b-2 border-[#268FB6]"
                  : "text-[#268FB6] hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-6">
          {currentTab === "profile" && (
            <div>
              <h2 className="text-lg font-semibold text-pri10 mb-6">
                Edit Profile
              </h2>

              {/* Profile Image */}
              <div className="mb-8">
                <div className="relative w-20 h-20  md:mx-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <Image
                        src={
                          typeof profileImage === "string"
                            ? profileImage
                            : URL.createObjectURL(profileImage)
                        }
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <Camera className="w-3 h-3 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <button className="text-[#13485B] text-sm mt-2 hover:underline">
                  Add photo
                </button>
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home address
                  </label>
                  <input
                    type="text"
                    value={profileData.homeAddress}
                    onChange={(e) =>
                      handleInputChange("homeAddress", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.homeAddress ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your home address"
                  />
                  {errors.homeAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.homeAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={profileData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Choose gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <div className="flex">
                    <select className="w-20 p-3 border border-r-0 rounded-l-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>+234</option>
                      <option>+1</option>
                      <option>+44</option>
                    </select>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`flex-1 p-3 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="000-0000"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={profileData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.country ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Choose country</option>
                    <option value="nigeria">Nigeria</option>
                    <option value="usa">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="canada">Canada</option>
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.country}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={profileData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Choose state</option>
                    <option value="abia">Abia</option>
                    <option value="adamawa">Adamawa</option>
                    <option value="akwa_ibom">Akwa Ibom</option>
                    <option value="anambra">Anambra</option>
                    <option value="bauchi">Bauchi</option>
                    <option value="bayelsa">Bayelsa</option>
                    <option value="benue">Benue</option>
                    <option value="borno">Borno</option>
                    <option value="cross_river">Cross River</option>
                    <option value="delta">Delta</option>
                    <option value="ebonyi">Ebonyi</option>
                    <option value="edo">Edo</option>
                    <option value="ekiti">Ekiti</option>
                    <option value="enugu">Enugu</option>
                    <option value="gombe">Gombe</option>
                    <option value="imo">Imo</option>
                    <option value="jigawa">Jigawa</option>
                    <option value="kaduna">Kaduna</option>
                    <option value="kano">Kano</option>
                    <option value="katsina">Katsina</option>
                    <option value="kebbi">Kebbi</option>
                    <option value="kogi">Kogi</option>
                    <option value="kwara">Kwara</option>
                    <option value="lagos">Lagos</option>
                    <option value="nasarawa">Nasarawa</option>
                    <option value="niger">Niger</option>
                    <option value="ogun">Ogun</option>
                    <option value="ondo">Ondo</option>
                    <option value="osun">Osun</option>
                    <option value="oyo">Oyo</option>
                    <option value="plateau">Plateau</option>
                    <option value="rivers">Rivers</option>
                    <option value="sokoto">Sokoto</option>
                    <option value="taraba">Taraba</option>
                    <option value="yobe">Yobe</option>
                    <option value="zamfara">Zamfara</option>
                    <option value="fct">FCT (Abuja)</option>
                  </select>
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification
                  </label>
                  <select
                    value={profileData.qualification}
                    onChange={(e) =>
                      handleInputChange("qualification", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.qualification
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select your qualification</option>
                    <option value="ssce">SSCE</option>
                    ssce, undergraduate, ond, hnd, bachelors,
                    masters, phd, other
                    <option value="undergraduate">Undergraduate</option>
                    <option value="ond">OND</option>
                    <option value="hnd">HND</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">PhD/MPhil</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.qualification && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.qualification}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentTab === "password" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Change Password
              </h2>

              <div className="max-w-2xl">
                {/* Current Password Section */}
                <div className="mb-8">
                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your current password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          handleInputChange("currentPassword", e.target.value)
                        }
                        className={`w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.currentPassword
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* New Password Section */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            handleInputChange("newPassword", e.target.value)
                          }
                          className={`w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.newPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("new")}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-500 text-sm mt-2">
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm new password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          className={`w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.confirmPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("confirm")}
                          className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-2">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Password Requirements
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      At least 8 characters long
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Include uppercase and lowercase letters
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Include at least one number
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Include at least one special character
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* {currentTab === "payment" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Payment Settings
              </h2>
              <p className="text-gray-600">
                Payment settings will be implemented here.
              </p>
            </div>
          )} */}

          {/* {errors.general && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
