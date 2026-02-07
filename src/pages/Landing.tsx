import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, Zap, Shield, Rocket, Github, Twitter, Linkedin, Mail, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo_light from "@/assets/logo_light.png";
import logo_dark from "@/assets/logo_dark.png";

const Landing = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
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
    <div className="relative min-h-screen overflow-hidden welcome-app">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <nav className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <img src={logo_light} alt="SVA" className="h-10 w-10 object-contain block dark:hidden" />
          <img src={logo_dark} alt="SVA" className="h-10 w-10 object-contain hidden dark:block" />
          <span className="text-xl font-semibold text-foreground">SVA OAuth</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button variant="hero" size="lg" asChild>
            <Link to="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>

      <section className="relative z-10 container mx-auto px-6 pt-16 md:pt-28 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/50 px-4 py-2 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Powered by SVA</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="block text-foreground">Secure OAuth</span>
            <span className="block bg-gradient-primary bg-clip-text text-transparent">Made Simple</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Experience the future of authentication. Secure, fast, and seamless OAuth integration
            that scales with your needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline-light" size="xl" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-24 animate-fade-in">
            {[
              { icon: Shield, title: "Bank-Level Security", description: "Enterprise-grade encryption and security protocols" },
              { icon: Zap, title: "Lightning Fast", description: "Optimized performance for instant authentication" },
              { icon: Rocket, title: "Scale Effortlessly", description: "Built to handle millions of requests seamlessly" },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border/50 bg-card/50 p-8 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logo_light} alt="SVA" className="h-10 w-10 object-contain block dark:hidden" />
                <img src={logo_dark} alt="SVA" className="h-10 w-10 object-contain hidden dark:block" />
                <span className="font-semibold text-foreground">SVA OAuth</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                The most secure and reliable OAuth authentication platform for modern applications.
              </p>
              <div className="flex gap-3">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Product</h3>
              <ul className="space-y-2">
                {["Credentials", "OAuth Consent", "Documentation"].map((label) => (
                  <li key={label}>
                    <Link to={label === "Credentials" ? "/credentials" : label === "OAuth Consent" ? "/oauth-consent" : "#"} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="space-y-2">
                {["About Us", "Blog", "Careers", "Contact"].map((label) => (
                  <li key={label}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Legal & Support</h3>
              <ul className="space-y-2">
                <li><Link to="/usage-agreements" className="text-sm text-muted-foreground hover:text-primary transition-colors">Usage Agreements</Link></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>© {new Date().getFullYear()} SVA OAuth. All rights reserved.</span>
            </div>
            <a href="mailto:support@svaoauth.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              support@svaoauth.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
