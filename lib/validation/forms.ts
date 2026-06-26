import { z } from "zod";

const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/; // MM/YYYY format
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

export const PersonalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(7, "Phone number is too short").max(20, "Phone number is too long"),
  location: z.string().max(100).optional(),
  linkedin: z.string().regex(urlRegex, "Invalid LinkedIn URL").optional().or(z.literal("")),
  website: z.string().regex(urlRegex, "Invalid URL").optional().or(z.literal("")),
});

export const ExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required").max(150),
  role: z.string().min(1, "Role is required").max(100),
  startDate: z.string().regex(dateRegex, "Start date must be in MM/YYYY format").or(z.literal("")),
  endDate: z.string().regex(dateRegex, "End date must be in MM/YYYY format").or(z.literal("Present")).or(z.literal("")),
  // Real apps would validate that startDate is before endDate if both are valid dates
});

export const EducationSchema = z.object({
  institution: z.string().min(1, "Institution name is required").max(150),
  degree: z.string().max(100).optional(),
  field: z.string().max(100).optional(),
  passingYear: z.string().max(4).optional(),
  percentage: z.string().max(10).optional(),
});
