import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCurrentUserPassword, signOutUser } from "@/features/auth/api/auth-client";
import { PASSWORD_RECOVERY_STORAGE_KEY } from "@/features/auth/constants";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  type SetPasswordSchema,
  setPasswordSchema
} from "@/features/auth/schemas/auth-schema";
import { useToast } from "@/hooks/use-toast";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-[var(--color-danger-500)]">{message}</p>;
}

type SetPasswordPageProps = {
  mode?: "dashboard" | "recovery";
};

export function SetPasswordPage({ mode = "dashboard" }: SetPasswordPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { loading, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRecovery = mode === "recovery";
  const form = useForm<SetPasswordSchema>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const result = await setCurrentUserPassword(values.password);

      if (result.error) {
        throw result.error;
      }

      await queryClient.invalidateQueries({ queryKey: ["current-profile"] });
      window.localStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY);

      if (isRecovery) {
        await signOutUser();
        toast({
          title: "Password changed",
          description: "Log in with your new password.",
          variant: "success"
        });

        startTransition(() => {
          navigate("/login", { replace: true });
        });
        return;
      }

      toast({
        title: "Password added",
        description: "Your account is ready for password sign-in.",
        variant: "success"
      });

      startTransition(() => {
        navigate("/dashboard", { replace: true });
      });
    } catch (error) {
      toast({
        title: "Could not set password",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const copy = isRecovery
    ? {
        title: "Create a new password.",
        description:
          "Choose a new password for your Smart Career Hub account. After saving it, you will log in again with the new password.",
        button: "Change password"
      }
    : {
        title: "Set your password",
        description:
          "Add a password to make your Smart Career Hub account easier to access after magic-link sign-in.",
        button: "Save password"
      };

  const pageClassName = isRecovery
    ? "grid min-h-screen w-full place-items-center bg-[radial-gradient(circle_at_top,#d7f8f1_0%,transparent_34%),var(--color-surface-50)] px-4 py-8"
    : "mx-auto grid w-full max-w-3xl gap-5";

  if (isRecovery && loading) {
    return (
      <div className={pageClassName}>
        <Card className="w-full max-w-md text-center">
          <CardTitle>Opening your reset form</CardTitle>
          <CardDescription className="mt-3 leading-7">
            We are verifying your reset link before showing the password form.
          </CardDescription>
        </Card>
      </div>
    );
  }

  if (isRecovery && !isAuthenticated) {
    return (
      <div className={pageClassName}>
        <Card className="w-full max-w-md text-center">
          <CardTitle>Reset link expired</CardTitle>
          <CardDescription className="mt-3 leading-7">
            Please request a new password reset email, then open the newest link from your inbox.
          </CardDescription>
          <div className="mt-6">
            <Button asChild variant="teal">
              <Link to="/login">Request a new link</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const content = (
    <>
      <Card className="rounded-[34px] bg-[linear-gradient(135deg,#0f1720_0%,#17343d_72%,#0f766e_160%)] text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.08] text-[var(--color-teal-300)]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="mt-6 text-3xl text-white">{copy.title}</CardTitle>
        <CardDescription className="mt-3 max-w-xl leading-7 text-white/70">
          {copy.description}
        </CardDescription>
      </Card>

      <Card className="rounded-[34px]">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              {...form.register("password")}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </div>

          <div>
            <Label htmlFor="confirmNewPassword">Confirm password</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              {...form.register("confirmPassword")}
            />
            <FieldError message={form.formState.errors.confirmPassword?.message} />
          </div>

          <Button type="submit" variant="teal" size="lg" disabled={isSubmitting}>
            <LockKeyhole className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : copy.button}
          </Button>
        </form>
      </Card>
    </>
  );

  return (
    <div className={pageClassName}>
      {isRecovery ? <div className="grid w-full max-w-3xl gap-5">{content}</div> : content}
    </div>
  );
}
