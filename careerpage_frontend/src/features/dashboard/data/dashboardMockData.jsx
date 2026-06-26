import React from "react";
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  LayoutDashboard, FileText, Upload, Bell, Video, ClipboardCheck
} from "lucide-react";

export const GOLD = "#c9a84c";
export const MAROON = "#72102a";

export const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const ALL_SKILLS = [
  "Curriculum Development", "Classroom Management", "Student Assessment",
  "Communication", "Leadership", "Team Collaboration", "Microsoft Office",
  "Data Analysis", "Project Management", "Problem Solving",
  "CBSE Curriculum", "Digital Literacy", "Research & Development",
  "Counselling", "Event Management", "Administration", "IT Support",
  "Sports Coaching", "Content Creation", "Public Speaking",
];

export const notifications = [
  {
    id: 1,
    text: "Your application for Physics Teacher has been shortlisted.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    text: "Interview scheduled for Computer Science Teacher on June 20.",
    time: "1 day ago",
    read: false,
  },
  {
    id: 3,
    text: "Your application for Academic Coordinator was not successful.",
    time: "3 days ago",
    read: true,
  },
];

export const statusConfig = {
  "Under Review": {
    color: "#b45309",
    bg: "#fef3c7",
    icon: <Clock size={13} />,
  },
  Shortlisted: {
    color: "#065f46",
    bg: "#d1fae5",
    icon: <CheckCircle size={13} />,
  },
  Rejected: {
    color: "#991b1b",
    bg: "#fee2e2",
    icon: <XCircle size={13} />,
  },
  "Interview Scheduled": {
    color: "#1e40af",
    bg: "#dbeafe",
    icon: <AlertCircle size={13} />,
  },
};

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "applications", label: "My Applications", icon: FileText },
  { id: "resume", label: "My Profile & Resume", icon: Upload },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "interviews", label: "Upcoming Interviews", icon: Video },
  { id: "onboarding", label: "Onboarding", icon: ClipboardCheck },
];

export const interviews = [
  {
    id: 1,
    role: "Computer Science Teacher",
    date: "June 20, 2026",
    time: "11:00 AM",
    mode: "Online",
    platform: "Google Meet",
    link: "https://meet.google.com/abc-defg-hij",
    interviewer: "Mr. Rajesh Kumar, HOD Technology",
    status: "Upcoming",
  },
  {
    id: 2,
    role: "Physics Teacher",
    date: "June 25, 2026",
    time: "2:30 PM",
    mode: "In-Person",
    platform: null,
    link: null,
    interviewer: "Dr. Anita Sharma, Academic Head",
    status: "Upcoming",
  },
];

export const offerLetter = {
  role: "Computer Science Teacher",
  issuedDate: "June 28, 2026",
  expiryDate: "July 10, 2026",
  joiningDate: "July 15, 2026",
  department: "Academic Department",
  salary: "₹5.2 LPA",
};
