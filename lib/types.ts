import { z } from "zod";

export const SPORT_TYPES = [
  "Soccer",
  "Basketball",
  "Tennis",
  "Baseball",
  "Hockey",
  "Football",
] as const;

export type SportType = (typeof SPORT_TYPES)[number];

export const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  sportType: z.enum(SPORT_TYPES, {
    error: "Sport type is required",
  }),
  dateTime: z.string().min(1, "Date and time is required"),
  description: z.string().optional(),
  venues: z
    .array(z.object({ name: z.string().min(1, "Venue name is required") }))
    .min(1, "At least one venue is required"),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export interface Venue {
  id: string;
  event_id: string;
  name: string;
}

export interface Event {
  id: string;
  user_id: string;
  name: string;
  sport_type: string;
  date_time: string;
  description: string | null;
  created_at: string;
  venues: Venue[];
}

export const sportColorMap: Record<string, string> = {
  Soccer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Basketball: "bg-orange-50 text-orange-700 border-orange-200",
  Tennis: "bg-lime-50 text-lime-700 border-lime-200",
  Baseball: "bg-red-50 text-red-700 border-red-200",
  Hockey: "bg-sky-50 text-sky-700 border-sky-200",
  Football: "bg-amber-50 text-amber-700 border-amber-200",
};
