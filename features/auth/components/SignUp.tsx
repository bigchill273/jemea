import Navbar from "@/components/layout/Navbar";
import AuthForm from "./AuthForm";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-background text-foreground workspace-backdrop">
      <Navbar />
      <AuthForm
        mode="sign-up"
        title="Create your account"
        subtitle="Start organizing your crew's boards and sprints on Jeme'a"
        redirectUrl="/dashboard"
        alternateUrl="/sign-in"
      />
    </div>
  );
}
