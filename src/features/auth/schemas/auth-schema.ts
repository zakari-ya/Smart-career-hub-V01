import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long.")
});

export const magicLinkSchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

export const signupSchema = z
  .object({
    fullName: z.string().min(2, "Please add your full name."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(8, "Confirm your password.")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  });

export const verificationCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email.")
});

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(8, "Confirm your password.")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  });

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type MagicLinkSchema = z.infer<typeof magicLinkSchema>;
export type SetPasswordSchema = z.infer<typeof setPasswordSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;
export type VerificationCodeSchema = z.infer<typeof verificationCodeSchema>;
