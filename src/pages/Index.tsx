import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-doctor.jpg";
import {
  Calendar, Clock, Shield, Heart, Users, Award,
  ArrowRight, CheckCircle2, TrendingUp, Star,
} from "lucide-react";

const stats = [
  { label: "Registered Patients", value: "15,000+", icon: Users },
  { label: "Expert Doctors", value: "500+", icon: Award },
  { label: "Appointments Booked", value: "80,000+", icon: Calendar },
  { label: "Avg. Rating", value: "4.9★", icon: Star },
];

const features = [
  {
    icon: Calendar,
    title: "Easy Booking",
    description: "Book appointments with top doctors in just a few clicks, anytime.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock medical assistance whenever you need it most.",
    color: "from-violet-500 to-purple-400",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is encrypted and completely confidential.",
    color: "from-emerald-500 to-teal-400",
  },
  {
    icon: Heart,
    title: "Quality Care",
    description: "Access experienced doctors across all major specialties.",
    color: "from-rose-500 to-pink-400",
  },
  {
    icon: Users,
    title: "Expert Doctors",
    description: "Connect with verified, highly-rated medical professionals.",
    color: "from-amber-500 to-orange-400",
  },
  {
    icon: Award,
    title: "Best Service",
    description: "Award-winning healthcare platform trusted by thousands.",
    color: "from-indigo-500 to-blue-400",
  },
];

const howItWorks = [
  { step: "01", title: "Create an Account", desc: "Sign up in seconds with your basic details." },
  { step: "02", title: "Find a Doctor", desc: "Browse by specialty, location, or rating." },
  { step: "03", title: "Book & Confirm", desc: "Pick a time slot and confirm your appointment instantly." },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      {/* ─── Hero ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[hsl(214_90%_48%)]">
        {/* animated blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl animate-float pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-white/8 blur-3xl animate-float-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-400/15 blur-3xl animate-float pointer-events-none" style={{ animationDelay: "3s" }} />

        {/* vivid diagonal overlay */}
        <div className="absolute inset-0 gradient-hero-vivid opacity-95 pointer-events-none" />

        <div className="container relative py-24 md:py-36 z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left content */}
            <div className="space-y-7 text-white">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm font-medium animate-fade-in">
                <TrendingUp className="h-4 w-4" />
                <span>India's Fastest Growing Health Platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] animate-slide-up">
                Your Health,<br />
                <span className="text-cyan-200">Our Priority</span>
              </h1>
              <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-lg animate-slide-up-delay-1">
                Book appointments with trusted doctors, manage your health records, and get expert care — all in one beautifully simple platform.
              </p>

              {/* Trust bullets */}
              <ul className="space-y-2 animate-slide-up-delay-2">
                {["Verified & experienced doctors", "Instant confirmation & reminders", "100% secure & confidential"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2 animate-slide-up-delay-3">
                <Link to="/doctors">
                  <Button
                    size="lg"
                    className="bg-white text-primary font-bold hover:bg-white/90 shadow-hover transition-spring animate-pulse-glow"
                  >
                    Find a Doctor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login?signup=true">
                  <Button
                    size="lg"
                    className="glass border border-white/30 text-white hover:bg-white/20 transition-base font-semibold"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right image */}
            <div className="relative hidden lg:block animate-fade-in">
              {/* glow ring */}
              <div className="absolute inset-4 rounded-3xl gradient-hero opacity-40 blur-2xl" />
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-hover ring-4 ring-white/20">
                <img
                  src={heroImage}
                  alt="Professional doctor"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 glass rounded-2xl px-4 py-3 shadow-hover border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">4.9 / 5 Stars</p>
                    <p className="text-white/60 text-xs">From 15,000+ patients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─────────────────────────── */}
      <section className="border-y border-border bg-background">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ label, value, icon: Icon }, i) => (
              <div
                key={label}
                className={`flex flex-col items-center text-center gap-2 p-4 rounded-2xl hover:bg-primary/5 transition-base animate-slide-up stagger-${i + 1}`}
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-black gradient-text">{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────── */}
      <section className="py-24 gradient-subtle">
        <div className="container">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Why PulseAppoint
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Everything You Need for
              <span className="gradient-text"> Better Healthcare</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Experience healthcare reimagined — seamless, secure, and always available.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`group relative p-6 rounded-2xl bg-background border border-border shadow-card hover:shadow-hover hover:-translate-y-1 transition-spring cursor-default animate-slide-up stagger-${(index % 6) + 1}`}
                >
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-glow-sm group-hover:scale-110 transition-spring`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  {/* hover accent line */}
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full gradient-hero scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How it Works ────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-black">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 gradient-hero opacity-30" />
            {howItWorks.map(({ step, title, desc }, i) => (
              <div
                key={step}
                className={`flex flex-col items-center text-center p-8 rounded-2xl border border-border shadow-card hover:shadow-hover hover:-translate-y-1 transition-spring animate-slide-up stagger-${i + 1}`}
              >
                <div className="h-16 w-16 rounded-2xl gradient-hero flex items-center justify-center shadow-glow-sm mb-5 text-white font-black text-xl">
                  {step}
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────── */}
      <section className="py-20 gradient-subtle">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-12 md:p-16 text-center text-white shadow-hover">
            {/* decorative blobs */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/8 blur-2xl pointer-events-none" />
            <div className="relative">
              <span className="inline-block px-4 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider mb-4">
                Join Us Today
              </span>
              <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                Ready to Take Control<br />of Your Health?
              </h2>
              <p className="text-lg mb-8 text-white/85 max-w-2xl mx-auto">
                Join 15,000+ patients who trust PulseAppoint for seamless healthcare access.
              </p>
              <Link to="/login?signup=true">
                <Button
                  size="lg"
                  className="bg-white text-primary font-bold hover:bg-white/90 shadow-hover px-8 py-6 text-base transition-spring animate-pulse-glow"
                >
                  Create Your Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
