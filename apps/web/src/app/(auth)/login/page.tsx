import { LoginForm } from "@/app/(auth)/_components/login-form";

export default function LoginPage() {
  return (
    <div className="animate-fade-in glass-card relative w-full max-w-md rounded-2xl p-8">
      <div className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-3">
          <div className="from-primary to-accent shadow-glow flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br">
            <span className="text-primary-foreground font-sans text-2xl font-bold">M</span>
          </div>
          <h1 className="text-foreground font-sans text-3xl font-bold tracking-wide">
            Maintinee<span className="text-primary">.io</span>
          </h1>
        </div>
        <p className="text-foreground-secondary text-sm">Admin Portal</p>
      </div>

      <LoginForm />

      <p className="text-foreground-muted mt-8 text-center text-xs">
        Invite-only access. Contact your administrator for access.
      </p>
    </div>
  );
}
