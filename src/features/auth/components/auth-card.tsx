import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import {
  resendSignupCode,
  sendPasswordResetEmail,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
  verifySignupCode
} from "@/features/auth/api/auth-client";
import {
  type ForgotPasswordSchema,
  forgotPasswordSchema,
  type LoginSchema,
  loginSchema,
  type MagicLinkSchema,
  magicLinkSchema,
  type SignupSchema,
  signupSchema,
  type VerificationCodeSchema,
  verificationCodeSchema
} from "@/features/auth/schemas/auth-schema";
import type { AuthMode } from "@/features/auth/types";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isSupabaseConfigured, supabaseConfigurationMessage } from "@/lib/env";

type AuthCardProps = {
  mode: "login" | "signup";
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-[var(--color-danger-500)]">{message}</p>;
}

export function AuthCard({ mode }: AuthCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshSession } = useAuth();
  const isBackendReady = isSupabaseConfigured;
  const [authMode, setAuthMode] = useState<AuthMode>("password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);

  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const signupForm = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const magicForm = useForm<MagicLinkSchema>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: ""
    }
  });

  const forgotPasswordForm = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const verificationForm = useForm<VerificationCodeSchema>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: {
      code: ""
    }
  });

  const handlePasswordSubmit = async (values: LoginSchema | SignupSchema) => {
    setIsSubmitting(true);
    setVerificationError("");

    try {
      if (mode === "login") {
        const result = await signInWithPassword(values.email, (values as LoginSchema).password);

        if (result.error) {
          throw result.error;
        }

        await refreshSession();
        toast({
          title: "Welcome back",
          description: "You’re signed in and ready to continue."
        });

        startTransition(() => {
          navigate("/dashboard");
        });
      } else {
        const signupValues = values as SignupSchema;
        const result = await signUpWithPassword(
          signupValues.email,
          signupValues.password,
          signupValues.fullName
        );

        if (result.error) {
          throw result.error;
        }

        toast({
          title: "Account created",
          description:
            result.status === "signedIn"
              ? "Your workspace is ready."
              : "Enter the 6-digit code we sent to your email."
        });

        if (result.status === "signedIn") {
          await refreshSession();
          startTransition(() => {
            navigate("/dashboard");
          });
        } else {
          setVerificationEmail(result.email);
          verificationForm.reset({ code: "" });
        }
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (values: VerificationCodeSchema) => {
    if (!verificationEmail) {
      return;
    }

    setIsSubmitting(true);
    setVerificationError("");

    try {
      const result = await verifySignupCode(verificationEmail, values.code);

      if (result.error) {
        throw result.error;
      }

      await refreshSession();
      toast({
        title: "Email verified",
        description: "Your workspace is ready."
      });

      startTransition(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The code is invalid or expired. Please try again.";
      setVerificationError(message);
      toast({
        title: "Code verification failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!verificationEmail) {
      return;
    }

    setIsResendingCode(true);
    setVerificationError("");

    try {
      const result = await resendSignupCode(verificationEmail);

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Verification code sent",
        description: "Check your inbox and spam folder for the latest 6-digit code."
      });
    } catch (error) {
      toast({
        title: "Could not resend code",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleMagicSubmit = async (values: MagicLinkSchema) => {
    setIsSubmitting(true);

    try {
      const result = await signInWithMagicLink(values.email);

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Magic link sent",
        description: "Check your inbox to continue securely."
      });
    } catch (error) {
      toast({
        title: "Could not send the magic link",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (values: ForgotPasswordSchema) => {
    setIsSubmitting(true);

    try {
      const result = await sendPasswordResetEmail(values.email);

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Password reset email sent",
        description: "Check your inbox to set a new password."
      });
    } catch (error) {
      toast({
        title: "Could not send reset email",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignup = mode === "signup";
  const isVerifyingSignup = isSignup && Boolean(verificationEmail);
  const isResettingPassword = !isSignup && isForgotPasswordMode;

  return (
    <div className="grid min-h-screen bg-transparent lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden overflow-hidden border-r border-black/6 bg-[linear-gradient(180deg,rgba(15,23,32,0.96),rgba(17,28,39,0.94))] px-10 py-12 text-white lg:flex lg:flex-col">
        <Link to="/" className="font-[var(--font-heading)] text-xl font-semibold">
          Smart Career Hub
        </Link>
        <div className="mt-auto space-y-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/84">
            <Sparkles className="h-4 w-4 text-[var(--color-teal-300)]" />
            Premium developer resume intelligence
          </div>
          <h1 className="max-w-xl font-[var(--font-heading)] text-5xl font-semibold leading-[1.03] tracking-tight">
            Build a resume that feels as strong as the work behind it.
          </h1>
          <p className="max-w-lg text-base leading-7 text-white/72">
            Smart Career Hub analyzes your resume like a product dashboard: sharper positioning, better ATS alignment, and clear next actions.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-white/10 bg-white/6 text-white shadow-none">
              <CardTitle className="text-white">Secure by default</CardTitle>
              <CardDescription className="mt-2 text-white/70">
                Private storage, authenticated analysis, and server-side AI only.
              </CardDescription>
            </Card>
            <Card className="border-white/10 bg-white/6 text-white shadow-none">
              <CardTitle className="text-white">Analytics-first feedback</CardTitle>
              <CardDescription className="mt-2 text-white/70">
                Turn resume review into a score-driven workflow you can improve fast.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <Card className="w-full max-w-xl rounded-[36px] p-6 sm:p-8">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-graphite-950)] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-[var(--font-heading)] text-lg font-semibold text-[var(--color-graphite-950)]">
                Smart Career Hub
              </p>
              <p className="text-sm text-[var(--color-graphite-700)]">Premium resume intelligence</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-graphite-700)]">
              {isVerifyingSignup
                ? "Verify your email"
                : isResettingPassword
                  ? "Reset password"
                  : isSignup
                    ? "Create your workspace"
                    : "Welcome back"}
            </p>
            <h2 className="mt-3 font-[var(--font-heading)] text-4xl font-semibold tracking-tight text-[var(--color-graphite-950)]">
              {isVerifyingSignup
                ? "Enter your verification code."
                : isResettingPassword
                  ? "Get back into your workspace."
                  : isSignup
                    ? "Start your first analysis flow."
                    : "Continue where your last review left off."}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-graphite-700)]">
              {isVerifyingSignup
                ? `We sent a 6-digit code to ${verificationEmail}.`
                : isResettingPassword
                  ? "Enter your account email and we will send a secure reset link."
                  : isSignup
                    ? "Create your account with email and password. We will send a 6-digit code to verify your email."
                    : "Sign in with your password, or use a magic link if your account already exists."}
            </p>
          </div>

          {!isBackendReady ? (
            <div className="mt-6 rounded-[24px] border border-[rgba(209,140,58,0.22)] bg-[rgba(209,140,58,0.08)] p-4 text-sm leading-6 text-[var(--color-graphite-800)]">
              {supabaseConfigurationMessage}
            </div>
          ) : null}

          {isResettingPassword ? (
            <form className="mt-8 grid gap-5" onSubmit={forgotPasswordForm.handleSubmit(handleForgotPasswordSubmit)}>
              <div>
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="you@company.com"
                  disabled={!isBackendReady || isSubmitting}
                  {...forgotPasswordForm.register("email")}
                />
                <FieldError message={forgotPasswordForm.formState.errors.email?.message} />
              </div>

              <Button type="submit" variant="teal" size="lg" disabled={!isBackendReady || isSubmitting}>
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsForgotPasswordMode(false)}
                disabled={isSubmitting}
              >
                Back to login
              </Button>
            </form>
          ) : isVerifyingSignup ? (
            <form className="mt-8 grid gap-5" onSubmit={verificationForm.handleSubmit(handleVerifyCode)}>
              <div className="rounded-[26px] border border-[rgba(18,183,166,0.2)] bg-[rgba(18,183,166,0.08)] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-graphite-950)] text-white">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-graphite-950)]">Check your email.</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-graphite-700)]">
                      Enter the 6-digit code we sent to finish your Smart Career Hub account.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="verificationCode">Verification code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  className="text-center text-2xl font-bold tracking-[0.26em]"
                  disabled={!isBackendReady || isSubmitting}
                  {...verificationForm.register("code", {
                    onChange: (event) => {
                      const nextCode = event.target.value.replace(/\D/g, "").slice(0, 6);
                      verificationForm.setValue("code", nextCode, {
                        shouldDirty: true,
                        shouldValidate: false
                      });
                    }
                  })}
                />
                <FieldError message={verificationForm.formState.errors.code?.message ?? verificationError} />
              </div>

              <Button type="submit" variant="teal" size="lg" disabled={!isBackendReady || isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify and open dashboard"}
              </Button>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleResendCode()}
                  disabled={!isBackendReady || isResendingCode || isSubmitting}
                >
                  {isResendingCode ? "Sending..." : "Resend code"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVerificationEmail("");
                    setVerificationError("");
                    verificationForm.reset({ code: "" });
                  }}
                  disabled={isSubmitting}
                >
                  Change email
                </Button>
              </div>
            </form>
          ) : isSignup ? (
            <form className="mt-8 grid gap-5" onSubmit={signupForm.handleSubmit(handlePasswordSubmit)}>
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  placeholder="Zakariya Example"
                  disabled={!isBackendReady || isSubmitting}
                  {...signupForm.register("fullName")}
                />
                <FieldError message={signupForm.formState.errors.fullName?.message} />
              </div>

              <div>
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  placeholder="you@company.com"
                  disabled={!isBackendReady || isSubmitting}
                  {...signupForm.register("email")}
                />
                <FieldError message={signupForm.formState.errors.email?.message} />
              </div>

              <div>
                <Label htmlFor="signupPassword">Password</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={!isBackendReady || isSubmitting}
                  {...signupForm.register("password")}
                />
                <FieldError message={signupForm.formState.errors.password?.message} />
              </div>

              <div>
                <Label htmlFor="signupConfirmPassword">Confirm password</Label>
                <Input
                  id="signupConfirmPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={!isBackendReady || isSubmitting}
                  {...signupForm.register("confirmPassword")}
                />
                <FieldError message={signupForm.formState.errors.confirmPassword?.message} />
              </div>

              <Button type="submit" variant="teal" size="lg" disabled={!isBackendReady || isSubmitting}>
                {isSubmitting ? "Creating..." : "Create account"}
              </Button>
            </form>
          ) : (
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as AuthMode)} className="mt-8">
            <TabsList>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magic">Magic link</TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="mt-6">
              <form
                className="grid gap-5"
                onSubmit={loginForm.handleSubmit(handlePasswordSubmit)}
              >
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    disabled={!isBackendReady || isSubmitting}
                    {...loginForm.register("email")}
                  />
                  <FieldError message={loginForm.formState.errors.email?.message} />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={!isBackendReady || isSubmitting}
                    {...loginForm.register("password")}
                  />
                  <FieldError message={loginForm.formState.errors.password?.message} />
                </div>

                <Button type="submit" variant="teal" size="lg" disabled={!isBackendReady || isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Login to workspace"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsForgotPasswordMode(true)}
                  disabled={!isBackendReady || isSubmitting}
                >
                  Forgot password?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="magic" className="mt-6">
              <form className="grid gap-5" onSubmit={magicForm.handleSubmit(handleMagicSubmit)}>
                <div>
                  <Label htmlFor="magicEmail">Email</Label>
                  <Input
                    id="magicEmail"
                    type="email"
                    placeholder="you@company.com"
                    disabled={!isBackendReady || isSubmitting}
                    {...magicForm.register("email")}
                  />
                  <FieldError message={magicForm.formState.errors.email?.message} />
                </div>

                <div className="rounded-[24px] border border-black/6 bg-[var(--color-surface-100)] p-4 text-sm leading-6 text-[var(--color-graphite-700)]">
                  We’ll send a secure sign-in link to your inbox and finish the session on the auth callback route.
                </div>

                <Button type="submit" variant="secondary" size="lg" disabled={!isBackendReady || isSubmitting}>
                  <Mail className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send magic link"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}

          <p className="mt-8 text-sm text-[var(--color-graphite-700)]">
            {isSignup ? "Already have an account?" : "Need to create an account?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"} className="font-semibold text-[var(--color-graphite-950)]">
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </Card>
      </section>
    </div>
  );
}
