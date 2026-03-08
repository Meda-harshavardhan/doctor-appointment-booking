import { Link } from "react-router-dom";
import { Stethoscope, Mail, Phone, MapPin, Twitter, Linkedin, Instagram, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="gradient-dark-footer text-white">
      {/* Gradient top accent */}
      <div className="h-1 w-full gradient-hero" />

      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero shadow-glow-sm">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">PulseAppoint</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Your trusted partner in health. Book appointments with the best doctors instantly and securely.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { Icon: Twitter, href: "#" },
                { Icon: Linkedin, href: "#" },
                { Icon: Instagram, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-primary hover:shadow-glow-sm transition-base"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white/90">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: "/doctors", label: "Find Doctors" },
                { to: "/appointments", label: "My Appointments" },
                { to: "/about", label: "About Us" },
                { to: "/terms", label: "Terms of Service" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/55 hover:text-white hover:pl-1 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-white/90">Services</h3>
            <ul className="space-y-3">
              {[
                "General Consultation",
                "Specialist Care",
                "Emergency Services",
                "Health Checkups",
                "Mental Health",
              ].map((s) => (
                <li key={s} className="text-sm text-white/55">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white/90">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/55">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                123 Medical Center Dr, Health City
              </li>
              <li className="flex items-center gap-3 text-sm text-white/55">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-3 text-sm text-white/55">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                care@pulseappoint.in
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© 2025 PulseAppoint. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> for better healthcare
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
