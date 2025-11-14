import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Github, Chrome, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { initiateGoogleOAuth, initiateGitHubOAuth } from "@/lib/oauth";
import { toast } from "sonner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
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

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login page if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Graphics/Illustration */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-hero">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-primary/30 blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/20 blur-[120px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px] animate-pulse delay-2000" />
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
              {/* Animated circles */}
              <circle
                cx="200"
                cy="150"
                r="80"
                fill="url(#gradient1)"
                opacity="0.6"
                className="animate-pulse"
              >
                <animate
                  attributeName="r"
                  values="80;100;80"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="600"
                cy="450"
                r="100"
                fill="url(#gradient2)"
                opacity="0.5"
                className="animate-pulse delay-1000"
              >
                <animate
                  attributeName="r"
                  values="100;120;100"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Security Shield */}
              <g transform="translate(400, 300)">
                <path
                  d="M 0 -80 L 60 -30 L 60 40 L 0 90 L -60 40 L -60 -30 Z"
                  fill="url(#gradient3)"
                  opacity="0.8"
                  className="drop-shadow-2xl"
                />
                <circle cx="0" cy="0" r="25" fill="currentColor" className="text-primary-foreground" />
                <path
                  d="M -15 -5 L -5 5 L 15 -15"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-background"
                />
              </g>

              {/* Floating particles */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 360) / 12;
                const radius = 200;
                const x = 400 + radius * Math.cos((angle * Math.PI) / 180);
                const y = 300 + radius * Math.sin((angle * Math.PI) / 180);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="8"
                    fill="url(#gradient4)"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.6;1;0.6"
                      dur={`${2 + i * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                );
              })}

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
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
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                SVA OAuth
              </h2>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Welcome Back!</h3>
            <p className="text-muted-foreground text-lg">
              Secure authentication made simple. Sign in to access your account and continue your journey.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col bg-background">
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
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full">

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-12 h-14 text-base bg-background border-2 focus:border-primary transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    to="#"
                    className="text-sm text-primary hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-12 pr-12 h-14 text-base bg-background border-2 focus:border-primary transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-primary hover:opacity-90 text-lg font-semibold shadow-glow disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-14 border-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleOAuthLogin('github')}
              >
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </Button>
              <Button
                variant="outline"
                className="h-14 border-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleOAuthLogin('google')}
              >
                <Chrome className="mr-2 h-5 w-5" />
                Google
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-sm pt-4">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                to="/signup"
                className="font-semibold text-primary hover:underline transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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

export default Login;
