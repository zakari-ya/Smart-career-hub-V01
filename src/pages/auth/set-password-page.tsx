import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCurrentUserPassword } from "@/features/auth/api/auth-client";
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

export function SetPasswordPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast({
        title: "Password added",
        description: "Your account is ready for faster password sign-in.",
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

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-5">
      <Card className="rounded-[34px] bg-[linear-gradient(135deg,#0f1720_0%,#17343d_72%,#0f766e_160%)] text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.08] text-[var(--color-teal-300)]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="mt-6 text-3xl text-white">Set your password</CardTitle>
        <CardDescription className="mt-3 max-w-xl leading-7 text-white/70">
          Add a password to make your Smart Career Hub account easier to access after magic-link or recovery sign-in.
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
            {isSubmitting ? "Saving..." : "Save password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
