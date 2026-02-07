import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, Github, Chrome, Check, Sparkles, Rocket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { initiateGoogleOAuth, initiateGitHubOAuth } from "@/lib/oauth";
import { toast } from "sonner";

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

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    // Split name into first_name and last_name
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
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOAuthSignup = (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') {
        initiateGoogleOAuth();
      } else if (provider === 'github') {
        initiateGitHubOAuth();
      }
    } catch (error: any) {
      console.error(`Failed to initiate ${provider} OAuth:`, error);
      toast.error(error.message || `Failed to start ${provider} authentication`);
    }
  };

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "One lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "One number", met: /[0-9]/.test(formData.password) },
  ];

  // Show loading while checking auth status
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

  // Don't render signup page if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Graphics/Illustration */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-hero">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/25 blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[140px] animate-pulse delay-2000" />
        </div>

        {/* SVG Illustration */}
        <div className="relative z-10 flex items-center justify-center h-full p-12">
          <div className="w-full max-w-2xl">
            <svg
              viewBox="0 0 800 600"
              className="w-full h-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Animated rocket */}
              <g transform="translate(400, 300)">
                <g className="animate-bounce" style={{ animationDuration: "3s" }}>
                  {/* Rocket body */}
                  <rect
                    x="-30"
                    y="-80"
                    width="60"
                    height="120"
                    rx="30"
                    fill="url(#gradientRocket)"
                    className="drop-shadow-2xl"
                  />
                  {/* Rocket nose */}
                  <path
                    d="M 0 -120 L 30 -80 L -30 -80 Z"
                    fill="url(#gradientRocket)"
                    opacity="0.9"
                  />
                  {/* Rocket fins */}
                  <path
                    d="M -30 40 L -50 60 L -30 50 Z"
                    fill="url(#gradientRocket)"
                    opacity="0.8"
                  />
                  <path
                    d="M 30 40 L 50 60 L 30 50 Z"
                    fill="url(#gradientRocket)"
                    opacity="0.8"
                  />
                  {/* Rocket window */}
                  <circle cx="0" cy="-40" r="12" fill="currentColor" className="text-primary-foreground" />
                </g>
                
                {/* Rocket flames */}
                <g transform="translate(0, 60)">
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="20"
                    ry="40"
                    fill="url(#gradientFlame)"
                    opacity="0.8"
                    className="animate-pulse"
                  >
                    <animate
                      attributeName="ry"
                      values="40;50;40"
                      dur="0.5s"
                      repeatCount="indefinite"
                    />
                  </ellipse>
                  <ellipse
                    cx="-15"
                    cy="10"
                    rx="12"
                    ry="30"
                    fill="url(#gradientFlame)"
                    opacity="0.6"
                    className="animate-pulse delay-100"
                  >
                    <animate
                      attributeName="ry"
                      values="30;40;30"
                      dur="0.6s"
                      repeatCount="indefinite"
                    />
                  </ellipse>
                  <ellipse
                    cx="15"
                    cy="10"
                    rx="12"
                    ry="30"
                    fill="url(#gradientFlame)"
                    opacity="0.6"
                    className="animate-pulse delay-200"
                  >
                    <animate
                      attributeName="ry"
                      values="30;40;30"
                      dur="0.6s"
                      repeatCount="indefinite"
                    />
                  </ellipse>
                </g>
              </g>

              {/* Floating stars */}
              {[...Array(20)].map((_, i) => {
                const angle = (i * 360) / 20;
                const radius = 150 + (i % 3) * 50;
                const x = 400 + radius * Math.cos((angle * Math.PI) / 180);
                const y = 300 + radius * Math.sin((angle * Math.PI) / 180);
                return (
                  <g key={i} transform={`translate(${x}, ${y})`}>
                    <path
                      d="M 0 -10 L 3 0 L 0 10 L -3 0 Z M -10 0 L 0 3 L 10 0 L 0 -3 Z"
                      fill="hsl(var(--primary))"
                      opacity="0.6"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.6;1;0.6"
                        dur={`${2 + (i % 3) * 0.5}s`}
                        repeatCount="indefinite"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values={`0;360`}
                        dur={`${10 + i * 2}s`}
                        repeatCount="indefinite"
                      />
                    </path>
                  </g>
                );
              })}

              {/* Orbiting circles */}
              <circle
                cx="400"
                cy="300"
                r="200"
                fill="none"
                stroke="url(#gradientOrbit)"
                strokeWidth="2"
                strokeDasharray="10 10"
                opacity="0.3"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 400 300;360 400 300"
                  dur="20s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="gradientRocket" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="gradientFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#ffa500" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#ffd700" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="gradientOrbit" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                <Rocket className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                SVA OAuth
              </h2>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Start Your Journey</h3>
            <p className="text-muted-foreground text-lg">
              Join thousands of users who trust us for secure authentication. Create your account and unlock the power of seamless OAuth.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex flex-col bg-background overflow-y-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            asChild
            className="flex items-center gap-2 hover:bg-primary/0 hover:text-primary"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 py-6">
          <div className="w-full">

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-12 h-14 text-base bg-background border-2 focus:border-primary transition-all"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-12 h-14 text-base bg-background border-2 focus:border-primary transition-all"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-12 pr-12 h-14 text-base bg-background border-2 focus:border-primary transition-all"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-2 rounded-lg bg-muted/50 p-4 border border-border">
                    <p className="text-xs font-medium mb-2">Password Requirements:</p>
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-sm transition-all ${
                          req.met ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                            req.met
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {req.met && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        {req.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`pl-12 pr-12 h-14 text-base bg-background border-2 focus:border-primary transition-all ${
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                        ? "border-destructive"
                        : ""
                    }`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">Passwords don't match</p>
                  )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-primary hover:opacity-90 text-lg font-semibold shadow-glow mt-6 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">Or sign up with</span>
              </div>
            </div>

            {/* Social Signup */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-14 border-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleOAuthSignup('github')}
              >
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </Button>
              <Button
                variant="outline"
                className="h-14 border-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleOAuthSignup('google')}
              >
                <Chrome className="mr-2 h-5 w-5" />
                Google
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm pt-4">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Signup;
