"use client";

import React, { useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAdminUser } from "@/services/admin";
import { uploadToCloudinary } from "@/services/account";
import { showErrorToast, showSuccessToast } from "@/helpers/toastUtil";

const AddAdminPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "Male",
    role: "USER",
    homeAddress: "",
    phoneNumber: "",
  });

  const [selectedRole, setSelectedRole] = useState("USER");
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Roles as specified by requirements
  const roles = ["USER", "TRAINER", "ADMIN", "SUPER ADMIN"];

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!formData.firstName.trim()) {
      showErrorToast("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      showErrorToast("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      showErrorToast("Email is required");
      return false;
    }
    if (!selectedRole) {
      showErrorToast("Role is required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      if (!validate()) return;
      setIsSaving(true);

      let profileImageUrl = null;

      // Upload profile image first if selected
      if (profileImage && typeof profileImage !== "string") {
        profileImageUrl = await uploadToCloudinary(profileImage, {
          type: "profile",
          userId: "admin", // You might want to use a different identifier
        });
      } else if (typeof profileImage === "string") {
        profileImageUrl = profileImage;
      }

      // Create payload object (not FormData)
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        gender: formData.gender,
        role: selectedRole,
        address: formData.homeAddress,
        phone: formData.phoneNumber,
      };

      // Add profile image URL if available
      if (profileImageUrl) {
        payload.profile_picture = profileImageUrl;
      }

      await createAdminUser(payload);
      showSuccessToast("Admin created successfully");
      router.push("/admin/admin");
    } catch (error) {
      console.error("Error creating admin:", error);
      showErrorToast("Failed to create admin");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Image size should be less than 5MB");
        return;
      }

      setProfileImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePhoto = () => {
    // Trigger file input
    const fileInput = document.getElementById("profile-image-input");
    fileInput.click();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Add Admin</h1>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#268FB6] hover:bg-[#268FB6]/50 text-white hover:text-white px-6 py-2"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Profile Picture Section */}
        <div className="flex justify-between">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-gray-600">
                    {formData.firstName ? formData.firstName[0] : "A"}
                    {formData.lastName ? formData.lastName[0] : "A"}
                  </span>
                )}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <Button
              onClick={handleChangePhoto}
              variant="outline"
              className="border-blue-300 text-[#268FB6] "
            >
              <Camera className="h-4 w-4 mr-2" />
              {profileImage ? "Change photo" : "Add photo"}
            </Button>

            {profileImage && (
              <Button
                onClick={() => {
                  setProfileImage(null);
                  setProfileImagePreview(null);
                  // Clear the file input
                  const fileInput = document.getElementById(
                    "profile-image-input"
                  );
                  if (fileInput) fileInput.value = "";
                }}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Remove photo
              </Button>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-sec10 mb-2">
                  First name
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sec10 mb-2">
                  Email address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sec10 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#268FB6] mb-2">
                  Role
                </label>
                <div className="space-y-2">
                  <p className="text-sm text-sec10">Role</p>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last name
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home address
                </label>
                <Input
                  type="text"
                  value={formData.homeAddress}
                  onChange={(e) =>
                    handleInputChange("homeAddress", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone number
                </label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdminPage;
