import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, Github, Chrome, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { initiateGoogleOAuth, initiateGitHubOAuth } from "@/lib/oauth";
import { toast } from "sonner";
import logo_light from "@/assets/logo_light.png";
import logo_dark from "@/assets/logo_dark.png";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    const nameParts = formData.name.trim().split(/\s+/);
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        first_name,
        last_name,
        password: formData.password,
        password2: formData.confirmPassword,
      });
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOAuthSignup = (provider: "google" | "github") => {
    try {
      if (provider === "google") initiateGoogleOAuth();
      else if (provider === "github") initiateGitHubOAuth();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : `Failed to start ${provider} authentication`;
      toast.error(msg);
    }
  };

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "One lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "One number", met: /[0-9]/.test(formData.password) },
  ];

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
          <h2 className="text-2xl xl:text-3xl font-bold text-foreground mb-2">Create your account</h2>
          <p className="text-muted-foreground max-w-sm">
            Join the developer console to build and manage OAuth apps with SVA.
          </p>
        </div>
      </div>

      {/* Right – Form */}
      <div className="flex-1 flex flex-col bg-background min-h-screen overflow-y-auto">
        <header className="flex items-center justify-between p-4 lg:p-6 shrink-0">
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

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <h1 className="text-2xl font-bold text-foreground">Sign up</h1>
              <p className="text-muted-foreground mt-1 text-sm">Create your developer account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10 h-11 bg-background"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-11 bg-background"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 h-11 bg-background"
                    value={formData.password}
                    onChange={handleChange}
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
                {formData.password && (
                  <ul className="mt-2 space-y-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2">
                    {passwordRequirements.map((req, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 text-xs ${req.met ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${req.met ? "border-primary bg-primary" : "border-current"}`}>
                          {req.met && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </span>
                        {req.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`pl-10 pr-10 h-11 bg-background ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-destructive">Passwords don&apos;t match</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-11 font-medium mt-2">
                {isLoading ? "Creating account…" : "Create account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => handleOAuthSignup("github")}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => handleOAuthSignup("google")}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Signup;
