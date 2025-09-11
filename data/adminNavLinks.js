import {
  Grid,
  BookOpen,
  GraduationCap,
  FileText,
  CreditCard,
  Bell,
  Users,
  Settings,
} from "lucide-react";

const adminNavLinks = [
  {
    id: 1,
    name: "Dashboard",
    to: "/admin",
    iconActive: Grid,
    iconInactive: Grid,
    roles: ["Super Admin", "Admin", "Trainer"], // All roles can access dashboard
  },
  {
    id: 2,
    name: "Courses",
    to: "/admin/courses",
    iconActive: BookOpen,
    iconInactive: BookOpen,
    roles: ["Super Admin", "Admin", "Trainer"], // All roles can access courses
  },
  {
    id: 3,
    name: "Learners",
    to: "/admin/learners",
    iconActive: GraduationCap,
    iconInactive: GraduationCap,
    roles: ["Super Admin", "Admin", "Trainer"], // All roles can access learners
  },
  {
    id: 4,
    name: "Feedback",
    to: "/admin/feedback",
    iconActive: FileText,
    iconInactive: FileText,
    roles: ["Super Admin", "Admin", "Trainer"], // All roles can access feedback
  },
  {
    id: 5,
    name: "Payment",
    to: "/admin/payment",
    iconActive: CreditCard,
    iconInactive: CreditCard,
    roles: ["Super Admin", "Admin"], // Only Super Admin and Admin can access payment
  },
  {
    id: 6,
    name: "Notification",
    to: "/admin/notifications",
    iconActive: Bell,
    iconInactive: Bell,
    roles: ["Super Admin", "Admin", "Trainer"], // All roles can access notifications
  },
  {
    id: 7,
    name: "Admin",
    to: "/admin/admin",
    iconActive: Users,
    iconInactive: Users,
    roles: ["Super Admin"], // Only Super Admin can access admin management
  },
  {
    id: 8,
    name: "Settings",
    to: "/admin/settings",
    iconActive: Settings,
    iconInactive: Settings,
    roles: ["Super Admin", "Admin", "Trainer"], // All roles can access settings
  },
];

export default adminNavLinks;
