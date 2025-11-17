"use client";

import AddCourse from "@/page/dashboard/AddCourse";
import React, { useEffect } from "react";
import { useAuth } from "@/Context/auth";
import { useRouter } from "next/navigation";

const Page = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const userType =
    typeof auth?.user_type === "string"
      ? auth.user_type.toLowerCase()
      : undefined;
  const isAdmin =
    userType === "admin" ||
    Boolean(auth?.is_admin || auth?.is_staff || auth?.is_superuser);

  useEffect(() => {
    if (auth && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [auth, isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="">
      <AddCourse />
    </div>
  );
};

export default Page;
