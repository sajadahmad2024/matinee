export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="from-primary/5 via-background to-accent/5 absolute top-0 left-0 h-full w-full bg-linear-to-br" />
        <div className="bg-primary/10 absolute top-1/4 left-[-80px] h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/10 absolute right-[-80px] bottom-1/4 h-96 w-96 rounded-full blur-3xl" />
      </div>
      {children}
    </div>
  );
}
