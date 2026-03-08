import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar, Shield, Users, Award, Heart, Stethoscope, ArrowRight, CheckCircle2,
} from "lucide-react";

const stats = [
  { value: "15,000+", label: "Registered Patients", icon: Users },
  { value: "500+", label: "Expert Doctors", icon: Stethoscope },
  { value: "80,000+", label: "Appointments Booked", icon: Calendar },
  { value: "4.9★", label: "Average Rating", icon: Award },
];

const values = [
  { icon: Heart, title: "Patient First", desc: "Every decision we make puts patient well-being at the forefront." },
  { icon: Shield, title: "Privacy & Security", desc: "Your health data is encrypted and protected with industry-leading security." },
  { icon: Award, title: "Excellence", desc: "We partner only with verified, highly-rated medical professionals." },
  { icon: Users, title: "Accessibility", desc: "Breaking barriers to make quality healthcare available to everyone." },
];

const features = [
  "Book appointments with verified doctors",
  "View and manage upcoming appointments",
  "Reschedule or cancel with ease",
  "Secure authentication & patient privacy",
  "Rich doctor profiles with specializations",
  "Real-time availability & confirmation",
  "AI-powered chatbot for guidance",
  "Payment integration via Razorpay",
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ─── Hero ─────────────────────────────── */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none animate-float" />
        <div className="absolute -bottom-10 right-0 w-56 h-56 rounded-full bg-white/8 blur-3xl pointer-events-none animate-float-slow" />
        <div className="container relative py-20 z-10 text-white text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl glass shadow-glow mx-auto mb-6">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 animate-slide-up">
            About PulseAppoint
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto animate-slide-up-delay-1">
            India's modern healthcare appointment platform — making doctor consultations simple, secure, and accessible for everyone.
          </p>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────── */}
      <section className="border-y border-border bg-background">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <div
                key={label}
                className={`flex flex-col items-center text-center gap-2 p-5 rounded-2xl hover:bg-primary/5 transition-base animate-slide-up stagger-${i + 1}`}
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-black gradient-text">{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mission ──────────────────────────── */}
      <section className="py-20 gradient-subtle">
        <div className="container max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Our Mission
          </span>
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            Healthcare, <span className="gradient-text">Reimagined</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            <strong className="text-foreground">PulseAppoint</strong> was built on a simple belief — that getting quality medical care shouldn't be complicated or stressful.
            We connect patients with verified, experienced doctors across all specialties, enabling seamless appointment booking and management in minutes.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Version 1.0 is our foundation. We're continuously improving based on your feedback, adding new features and specialties to serve you better every day.
          </p>
        </div>
      </section>

      {/* ─── Features ─────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">What We Offer</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need for a seamless healthcare experience
            </p>
          </div>
          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div
                key={f}
                className={`flex items-center gap-3 p-4 rounded-xl border border-border bg-background shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-spring animate-slide-up stagger-${(i % 6) + 1}`}
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Values ───────────────────────────── */}
      <section className="py-20 gradient-subtle">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`text-center p-6 rounded-2xl bg-background border border-border shadow-card hover:shadow-hover hover:-translate-y-1 transition-spring animate-slide-up stagger-${i + 1}`}
              >
                <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-glow-sm">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────── */}
      <section className="py-16">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl gradient-hero text-center text-white p-12 shadow-hover">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Ready to Experience Better Healthcare?
              </h2>
              <p className="text-white/80 mb-8 text-lg">
                Join thousands of patients who've transformed how they access care.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/login?signup=true">
                  <Button className="bg-white text-primary font-bold hover:bg-white/90 shadow-hover px-6 py-5 text-base transition-spring">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button className="glass border border-white/30 text-white hover:bg-white/20 px-6 py-5 text-base font-semibold transition-base">
                    Browse Doctors
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
