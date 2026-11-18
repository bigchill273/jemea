import Navbar from "@/components/layout/Navbar";
import AuthForm from "./AuthForm";

export default function Login() {
  return (
    <div className="min-h-screen bg-background text-foreground workspace-backdrop">
      <Navbar />
      <AuthForm
        mode="sign-in"
        title="Sign in to your account"
        subtitle="Welcome back to Jeme'a"
        redirectUrl="/dashboard"
        alternateUrl="/sign-up"
      />
    </div>
  );
}
