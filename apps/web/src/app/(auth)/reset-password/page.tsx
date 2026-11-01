import { Suspense } from "react";

import { LuShieldCheck, LuUserPlus } from "react-icons/lu";

import {
  AuthCard,
  AuthCardDescription,
  AuthCardHeader,
  AuthCardIcon,
  AuthCardTitle,
} from "@/app/(auth)/_components/auth-card";
import { ResetPasswordForm } from "@/app/(auth)/_components/reset-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ invite?: string | string[] }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const isInvite = (await searchParams).invite === "1";

  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthCardIcon>
          {isInvite ? (
            <LuUserPlus className="text-primary-foreground h-8 w-8" />
          ) : (
            <LuShieldCheck className="text-primary-foreground h-8 w-8" />
          )}
        </AuthCardIcon>
        <AuthCardTitle>{isInvite ? "Welcome to Maintinee" : "Secure Your Account"}</AuthCardTitle>
        <AuthCardDescription>
          {isInvite
            ? "Set a password to activate your admin account"
            : "Verify your identity and set a new password"}
        </AuthCardDescription>
      </AuthCardHeader>

      <Suspense>
        <ResetPasswordForm isInvite={isInvite} />
      </Suspense>
    </AuthCard>
  );
}
