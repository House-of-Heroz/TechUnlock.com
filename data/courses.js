import cybersecurity from "@/assets/landing-page/security.svg";
import AI from "@/assets/landing-page/AI.svg";
import DM from "@/assets/landing-page/DM.svg";
import WD from "@/assets/landing-page/WD.svg";
import PD from "@/assets/landing-page/PD.svg";

const courses = [
  {
    thumbnail: cybersecurity,
    title: "Cyber Security",
    rating: 4.5,
    description:
      "Designed for individuals with little to no prior experience in the field, this course provides a solid foundation in cybersecurity essentials.",
    slug: "?category=cyber",
  },
  {
    thumbnail: AI,
    title: "Artificial Intelligence",
    rating: 4.2,
    description:
      "Start your journey to becoming and AI Certified professional. From Beginner to intermediate level of proficiency. Our Applied Artificial Intelligence course module builds the foundation for you to excel in your career and professional pursuit.",
    slug: "?category=ai",
  },
  {
    thumbnail: DM,
    title: "Digital Marketing",
    rating: 4.2,
    description:
      "Explore the possibilities of building and growing a business and scaling using social media marketing channels, email marketing affiliate marketing, SMS marketing, content marketing and other social media channels.",
    slug: "?category=dm",
  },
  {
    thumbnail: WD,
    title: "Web Development",
    rating: 4.2,
    description:
      "Unleash your web development potential with our expert-led course. Master Python, HTML, & CSS through hands-on projects, gaining skills for a career in web design or enhancing your current abilities.",
    slug: "?category=web",
  },
  {
    thumbnail: PD,
    title: "UI/UX Design",
    rating: 4.2,
    description:
      "Learn how to design user friendly digital products that work, in our 2-week intensive course. Understand the fundamentals of design processes and how you can transform user experiences through functional product designs.",
    slug: "?category=ui/ux",
  },
];

export const course = [
  { id: 1, name: "All", value: "all" },
  { id: 2, name: "Web Development", value: "Web Development" },
  { id: 3, name: "Cybersecurity", value: "Cybersecurity" },
  { id: 4, name: "Digital Marketing", value: "Digital Marketing" },
  { id: 5, name: "UI/UX Design", value: "UI/UX Design" },
  { id: 6, name: "Artificial Intelligence", value: "Artificial Intelligence" },
];

export default courses;
