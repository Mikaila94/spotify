import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: "Enter a valid email" }))
  .transform((email) => email.toLowerCase());

export const signInSchema = z.strictObject({
  email: emailSchema,
  password: z.string().min(1, "Email and password required"),
});

export const signUpSchema = z.strictObject({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
