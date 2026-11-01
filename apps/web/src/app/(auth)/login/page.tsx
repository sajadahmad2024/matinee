import {
  AuthCard,
  AuthCardDescription,
  AuthCardFooter,
  AuthCardHeader,
  AuthCardIcon,
} from "@/app/(auth)/_components/auth-card";
import { LoginForm } from "@/app/(auth)/_components/login-form";

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthCardHeader>
        <div className="mb-3 flex items-center justify-center gap-3">
          <AuthCardIcon size="md">
            <span className="text-primary-foreground font-sans text-2xl font-bold">M</span>
          </AuthCardIcon>
          <h1 className="text-foreground font-sans text-3xl font-bold tracking-wide">
            Maintinee<span className="text-primary">.io</span>
          </h1>
        </div>
        <AuthCardDescription className="mt-0">Admin Portal</AuthCardDescription>
      </AuthCardHeader>

      <LoginForm />

      <AuthCardFooter>Invite-only access. Contact your administrator for access.</AuthCardFooter>
    </AuthCard>
  );
}
