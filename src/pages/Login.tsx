import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Stethoscope, User, Shield, Heart, CheckCircle2, Eye, EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignup = searchParams.get("signup") === "true";
  const { login, register, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState(isSignup ? "signup" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    confirmPassword: "", phone: "", dateOfBirth: "", gender: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm.email, loginForm.password, "patient");
      toast.success("Welcome back!");
      navigate("/home");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await register(signupForm);
      toast.success("Account created successfully!");
      navigate("/home");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }
  };

  const trustBadges = [
    { Icon: Shield, text: "HIPAA Compliant & Secure" },
    { Icon: Heart, text: "500+ Verified Doctors" },
    { Icon: CheckCircle2, text: "15,000+ Happy Patients" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ─── Left Panel (decorative) ───── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero-vivid flex-col justify-between p-12">
        {/* blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />

        {/* Logo */}
        <Link to="/home" className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl glass flex items-center justify-center shadow-glow-sm">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-2xl font-black">PulseAppoint</span>
        </Link>

        {/* Main message */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight">
            Your health journey<br />starts here.
          </h2>
          <p className="text-white/75 text-lg leading-relaxed max-w-sm">
            Connect with expert doctors, manage appointments, and take control of your healthcare — all in one place.
          </p>

          {/* Trust badges */}
          <div className="space-y-3 pt-2">
            {trustBadges.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-white text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="relative z-10 text-white/40 text-xs">
          © 2025 PulseAppoint. All rights reserved.
        </p>
      </div>

      {/* ─── Right Panel (form) ─────────── */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 gradient-subtle">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/home" className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-hero shadow-glow-sm">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black gradient-text">PulseAppoint</span>
          </Link>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl h-11">
              <TabsTrigger value="login" className="rounded-lg font-semibold">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg font-semibold">Sign Up</TabsTrigger>
            </TabsList>

            {/* ── Login Tab ── */}
            <TabsContent value="login">
              <Card className="border border-border shadow-hover rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="h-5 w-5 text-primary" />
                    Patient Login
                  </CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="rounded-xl pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-base"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        Remember me
                      </label>
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                        Forgot password?
                      </Link>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button
                      type="submit"
                      className="w-full gradient-hero border-0 text-white font-bold py-5 rounded-xl shadow-glow-sm hover:shadow-glow hover:opacity-90 transition-base"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                      Don't have an account?{" "}
                      <button type="button" onClick={() => setActiveTab("signup")} className="text-primary hover:underline font-semibold">
                        Sign up free
                      </button>
                    </p>
                    <p className="text-sm text-center text-muted-foreground">
                      Are you a doctor?{" "}
                      <Link to="/doctor-login" className="text-primary hover:underline font-semibold">
                        Doctor Login →
                      </Link>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* ── Signup Tab ── */}
            <TabsContent value="signup">
              <Card className="border border-border shadow-hover rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="h-5 w-5 text-primary" />
                    Create Account
                  </CardTitle>
                  <CardDescription>Fill in your details to get started</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          placeholder="John"
                          value={signupForm.firstName}
                          onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          placeholder="Doe"
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                          className="rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          className="w-full h-10 px-3 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          value={signupForm.gender}
                          onChange={(e) => setSignupForm({ ...signupForm, gender: e.target.value })}
                          required
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-of-birth">Date of Birth</Label>
                      <Input
                        id="date-of-birth"
                        type="date"
                        value={signupForm.dateOfBirth}
                        onChange={(e) => setSignupForm({ ...signupForm, dateOfBirth: e.target.value })}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          className="rounded-xl pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-base"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          className="rounded-xl pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-base"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded mt-0.5 shrink-0" required />
                      <span>
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:underline font-medium">
                          Terms & Conditions
                        </Link>
                      </span>
                    </label>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button
                      type="submit"
                      className="w-full gradient-hero border-0 text-white font-bold py-5 rounded-xl shadow-glow-sm hover:shadow-glow hover:opacity-90 transition-base"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Patient Account"}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                      Already have an account?{" "}
                      <button type="button" onClick={() => setActiveTab("login")} className="text-primary hover:underline font-semibold">
                        Sign in
                      </button>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <div className="mt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Are you a doctor?{" "}
                <Link to="/doctor-login" className="text-primary hover:underline font-semibold">
                  Doctor Login →
                </Link>
              </p>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
