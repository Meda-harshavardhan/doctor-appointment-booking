import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Stethoscope, User, LogOut, Settings, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/home");
    setMobileOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? "glass-dark shadow-card border-b border-white/10"
        : "bg-background/80 backdrop-blur-md border-b border-border/50"
        }`}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero shadow-glow-sm transition-spring group-hover:scale-110">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight gradient-text">
            PulseAppoint
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { to: "/doctors", label: "Find Doctors" },
            { to: "/lab-tests", label: "Lab Tests" },
            ...(isAuthenticated && user?.role === "patient"
              ? [{ to: "/appointments", label: "My Appointments" }]
              : []),
            ...(isAuthenticated && user?.role === "doctor"
              ? [
                { to: "/doctor/dashboard", label: "Dashboard" },
                { to: "/doctor/appointments", label: "My Appointments" },
              ]
              : []),
            { to: "/about", label: "About" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-base rounded-lg hover:bg-primary/8 group"
            >
              {link.label}
              <span className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-primary/10"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-hero text-white text-xs font-bold shadow-glow-sm">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user?.role === "doctor" ? "Dr. " : ""}
                    {user?.firstName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-hover">
                <div className="px-3 py-2 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-t-md">
                  <p className="text-sm font-semibold">
                    {user?.role === "doctor" ? "Dr. " : ""}
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                    {user?.role}
                  </span>
                </div>
                <DropdownMenuSeparator />
                {user?.role === "doctor" && (
                  <DropdownMenuItem onClick={() => navigate("/doctor/dashboard")}>
                    <Stethoscope className="mr-2 h-4 w-4 text-primary" />
                    Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      user?.role === "doctor"
                        ? "/doctor/appointments"
                        : "/appointments"
                    )
                  }
                >
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  Appointments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4 text-primary" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-primary/8"
                >
                  Patient Login
                </Button>
              </Link>
              <Link to="/doctor-login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-primary/8"
                >
                  <Stethoscope className="mr-1.5 h-3.5 w-3.5" />
                  Doctor
                </Button>
              </Link>
              <Link to="/login?signup=true">
                <Button
                  size="sm"
                  className="gradient-hero border-0 text-white shadow-glow-sm hover:opacity-90 hover:shadow-glow transition-base font-medium"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-1 p-2 rounded-lg hover:bg-primary/10 transition-base"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md px-4 py-4 space-y-2 animate-fade-in">
          {[
            { to: "/doctors", label: "Find Doctors" },
            ...(isAuthenticated && user?.role === "patient"
              ? [{ to: "/appointments", label: "My Appointments" }]
              : []),
            ...(isAuthenticated && user?.role === "doctor"
              ? [
                { to: "/doctor/dashboard", label: "Dashboard" },
                { to: "/doctor/appointments", label: "My Appointments" },
              ]
              : []),
            { to: "/about", label: "About" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-base"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Patient Login</Button>
              </Link>
              <Link to="/doctor-login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Doctor Login</Button>
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-base"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
