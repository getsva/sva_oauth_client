import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Github, Chrome } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { initiateGoogleOAuth, initiateGitHubOAuth } from "@/lib/oauth";
import { toast } from "sonner";
import logo_light from "@/assets/logo_light.png";
import logo_dark from "@/assets/logo_dark.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    try {
      if (provider === "google") initiateGoogleOAuth();
      else if (provider === "github") initiateGitHubOAuth();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : `Failed to start ${provider} authentication`;
      toast.error(msg);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left – Branding (hidden on small screens) */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between bg-gradient-to-br from-primary/10 via-background to-primary/5 dark:from-primary/20 dark:via-background dark:to-primary/10 p-10 xl:p-14">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo_light} alt="SVA" className="h-9 w-9 object-contain block dark:hidden" />
          <img src={logo_dark} alt="SVA" className="h-9 w-9 object-contain hidden dark:block" />
          <span className="font-semibold text-foreground">SVA OAuth</span>
        </Link>
        <div>
          <h2 className="text-2xl xl:text-3xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground max-w-sm">
            Sign in to access the developer console and manage your OAuth apps.
          </p>
        </div>
      </div>

      {/* Right – Form */}
      <div className="flex-1 flex flex-col bg-background min-h-screen">
        <header className="flex items-center justify-between p-4 lg:p-6">
          <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2 lg:hidden">
            <img src={logo_light} alt="SVA" className="h-8 w-8 object-contain block dark:hidden" />
            <img src={logo_dark} alt="SVA" className="h-8 w-8 object-contain hidden dark:block" />
            <span className="font-semibold text-sm">SVA OAuth</span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
              <p className="text-muted-foreground mt-1 text-sm">Access your developer account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-11 bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Link to="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 bg-background"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-11 font-medium">
                {isLoading ? "Signing in…" : "Sign in"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => handleOAuthLogin("github")}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => handleOAuthLogin("google")}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
