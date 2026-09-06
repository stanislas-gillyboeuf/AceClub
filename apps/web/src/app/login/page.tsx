import { LoginForm } from "@/components/custom/login-form"

export default function LoginPage() {
  return (
    <div className="admin-theme flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 text-foreground md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  )
}
