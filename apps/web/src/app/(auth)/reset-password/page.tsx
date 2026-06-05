import { LuShieldCheck } from "react-icons/lu";

import { ResetPasswordForm } from "@/app/(auth)/_components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="animate-fade-in glass-card relative w-full max-w-md rounded-2xl p-8">
      <div className="mb-8 text-center">
        <div className="from-primary to-accent shadow-glow mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br">
          <LuShieldCheck className="text-primary-foreground h-8 w-8" />
        </div>
        <h1 className="text-foreground font-sans text-2xl font-bold">Secure Your Account</h1>
        <p className="text-foreground-secondary mt-2 text-sm">
          Verify your identity and set a new password
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
