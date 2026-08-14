import { z } from "zod";

export const registrationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z.string().trim().min(7, "Phone number is required"),
    city: z.string().trim().min(2, "City is required"),
    password: z.string().min(32, "Password must be at least 32 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    isOver18: z.boolean().refine((value) => value, "You must be 18 or older"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegistrationValues = z.infer<typeof registrationSchema>;

export function toRegistrationPayload(values: RegistrationValues) {
  const { confirmPassword: _confirmPassword, ...payload } = values;
  return payload;
}
