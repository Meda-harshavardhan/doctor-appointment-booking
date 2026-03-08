import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Star, MapPin, Clock, CheckCircle2, IndianRupee, ArrowLeft,
    Languages, GraduationCap, Stethoscope, Calendar, Award,
    Phone, Mail, HeartPulse, Loader2, ShieldCheck, AlertTriangle, Building2
} from "lucide-react";
import { API_BASE_URL } from "@/services/api";
import { toast } from "sonner";

interface PublicDoctor {
    _id: string;
    specialization: string;
    experience: number;
    consultationFee: number;
    consultationDuration: number;
    bio: string;
    languages: string[];
    services: string[];
    availability: Record<string, { isAvailable: boolean; startTime?: string; endTime?: string }>;
    education: { degree: string; institution: string; year: number; specialization?: string }[];
    certifications: { name: string; issuingOrganization: string; issueDate: string }[];
    hospitalAffiliations: { hospitalName: string; position: string; isCurrent: boolean }[];
    awards: { name: string; year: number; organization: string }[];
    rating: { average: number; count: number };
    isVerified: boolean;
    isActive: boolean;
    userId: { firstName: string; lastName: string; email?: string; phone?: string; profilePhoto?: string };
    clinicAddress?: {
        name: string;
        street: string;
        area: string;
        city: string;
        state: string;
        pincode: string;
        mapLink?: string;
    };
    licenseNumber?: string;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const SPECIALTY_GRADIENT: Record<string, string> = {
    "Cardiologist": "from-rose-500 to-red-400",
    "Neurologist": "from-purple-500 to-violet-400",
    "Dermatologist": "from-amber-400 to-orange-400",
    "Pediatrician": "from-sky-500 to-blue-400",
    "Gynecologist": "from-pink-400 to-rose-400",
    "General Physician": "from-teal-500 to-cyan-400",
    "Psychiatrist": "from-indigo-400 to-purple-400",
};
const getGradient = (sp?: string) => (sp && SPECIALTY_GRADIENT[sp]) || "from-primary to-secondary";

const StarRating = ({ rating, count }: { rating: number; count: number }) => (
    <div className="flex items-center gap-2">
        <div className="flex">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`h-5 w-5 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
            ))}
        </div>
        <span className="text-lg font-bold">{rating.toFixed(1)}</span>
        <span className="text-muted-foreground text-sm">({count} reviews)</span>
    </div>
);

export default function PublicDoctorDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const [doctor, setDoctor] = useState<PublicDoctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ── Auth guard ─────────────────────────────────── */
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate("/login", { state: { from: `/doctors/${id}` }, replace: true });
        }
    }, [user, authLoading, id, navigate]);

    /* ── Fetch doctor ────────────────────────────────── */
    useEffect(() => {
        if (!id || !user) return;
        const token = localStorage.getItem("token");
        fetch(`${API_BASE_URL}/doctors/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
            .then(res => res.json())
            .then(data => {
                if (data.doctor) setDoctor(data.doctor);
                else setError("Doctor not found");
            })
            .catch(() => setError("Failed to load doctor profile"))
            .finally(() => setLoading(false));
    }, [id, user]);

    const availableDays = DAYS.filter(d => doctor?.availability?.[d]?.isAvailable);
    const name = doctor ? `Dr. ${doctor.userId.firstName} ${doctor.userId.lastName}` : "";
    const gradient = getGradient(doctor?.specialization);
    const initials = doctor
        ? `${doctor.userId.firstName[0]}${doctor.userId.lastName[0]}`.toUpperCase()
        : "DR";

    /* ── Loading ── */
    if (authLoading || (user && loading)) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                        <p className="text-muted-foreground">Loading doctor profile…</p>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                        <p className="text-lg font-bold">{error}</p>
                        <Button onClick={() => navigate("/doctors")}>Back to Doctors</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!doctor) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* ── Hero banner ──────────────────────────────── */}
            <section className={`relative bg-gradient-to-br ${gradient} overflow-hidden`}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

                <div className="container relative z-10 py-10">
                    <button onClick={() => navigate("/doctors")}
                        className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Find Doctors
                    </button>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div className={`relative h-28 w-28 md:h-36 md:w-36 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl border-4 border-white/20 overflow-hidden shrink-0`}>
                            {doctor.userId.profilePhoto ? (
                                <img src={doctor.userId.profilePhoto} alt={name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-4xl font-black text-white/90">{initials}</span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-white space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl md:text-3xl font-black">{name}</h1>
                                {doctor.isVerified && (
                                    <ShieldCheck className="h-6 w-6 text-emerald-300" aria-label="Verified Doctor" />
                                )}
                            </div>
                            <p className="text-white/85 font-medium">{doctor.specialization}</p>

                            <StarRating rating={doctor.rating.average} count={doctor.rating.count} />

                            <div className="flex flex-wrap gap-3 pt-1 text-sm text-white/80">
                                <span className="flex items-center gap-1.5"><Stethoscope className="h-4 w-4" />{doctor.experience} yrs experience</span>
                                {doctor.consultationDuration && (
                                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{doctor.consultationDuration} min sessions</span>
                                )}
                                {doctor.languages?.length > 0 && (
                                    <span className="flex items-center gap-1.5"><Languages className="h-4 w-4" />{doctor.languages.join(", ")}</span>
                                )}
                            </div>

                            {/* Availability badge */}
                            <div className="pt-1">
                                {doctor.isActive ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> AVAILABLE
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white/60" /> NOT AVAILABLE
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Sticky fee + book card */}
                        <div className="w-full md:w-64 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-white space-y-4 shrink-0">
                            <div>
                                <p className="text-white/70 text-xs uppercase tracking-wide">Consultation Fee</p>
                                <p className="text-3xl font-black flex items-center gap-0.5">
                                    <IndianRupee className="h-6 w-6" />{doctor.consultationFee}
                                </p>
                            </div>
                            {doctor.isActive ? (
                                <Link to={`/appointments/book/${id}`}>
                                    <Button className="w-full bg-white text-gray-900 hover:bg-white/90 font-bold">
                                        <Calendar className="mr-2 h-4 w-4" /> Book Appointment
                                    </Button>
                                </Link>
                            ) : (
                                <Button className="w-full" disabled>Not Available</Button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Main content ────────────────────────────── */}
            <main className="flex-1 gradient-subtle">
                <div className="container py-10">
                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Left: main info */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* About */}
                            {doctor.bio && (
                                <section className="bg-background rounded-2xl border border-border p-6 shadow-card">
                                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <HeartPulse className="h-5 w-5 text-primary" /> About Dr. {doctor.userId.firstName}
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
                                </section>
                            )}

                            {/* Services / Expertise */}
                            {doctor.services?.length > 0 && (
                                <section className="bg-background rounded-2xl border border-border p-6 shadow-card">
                                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" /> Areas of Expertise
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {doctor.services.map(s => (
                                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Education */}
                            {doctor.education?.length > 0 && (
                                <section className="bg-background rounded-2xl border border-border p-6 shadow-card">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-primary" /> Education
                                    </h2>
                                    <div className="space-y-4">
                                        {doctor.education.map((edu, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <GraduationCap className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{edu.degree}</p>
                                                    <p className="text-muted-foreground text-sm">{edu.institution}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{edu.year}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Hospital Affiliations */}
                            {doctor.hospitalAffiliations?.length > 0 && (
                                <section className="bg-background rounded-2xl border border-border p-6 shadow-card">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5 text-primary" /> Hospital Affiliations
                                    </h2>
                                    <div className="space-y-3">
                                        {doctor.hospitalAffiliations.map((h, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                                                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-sm">{h.hospitalName}</p>
                                                    <p className="text-muted-foreground text-xs">{h.position}</p>
                                                    {h.isCurrent && <Badge className="mt-1 text-[10px]" variant="outline">Current</Badge>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Awards */}
                            {doctor.awards?.length > 0 && (
                                <section className="bg-background rounded-2xl border border-border p-6 shadow-card">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Award className="h-5 w-5 text-primary" /> Awards & Recognition
                                    </h2>
                                    <div className="space-y-3">
                                        {doctor.awards.map((a, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Award className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-sm">{a.name}</p>
                                                    <p className="text-muted-foreground text-xs">{a.organization} · {a.year}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right sidebar */}
                        <div className="space-y-6">

                            {/* Quick stats */}
                            <div className="bg-background rounded-2xl border border-border p-6 shadow-card space-y-4">
                                <h2 className="text-base font-bold">Quick Info</h2>
                                <div className="space-y-3 text-sm">
                                    {[
                                        { icon: <Stethoscope className="h-4 w-4 text-primary" />, label: "Specialization", value: doctor.specialization },
                                        { icon: <Clock className="h-4 w-4 text-primary" />, label: "Experience", value: `${doctor.experience} years` },
                                        { icon: <IndianRupee className="h-4 w-4 text-primary" />, label: "Consultation Fee", value: `₹${doctor.consultationFee}` },
                                        { icon: <Clock className="h-4 w-4 text-primary" />, label: "Session Duration", value: `${doctor.consultationDuration} minutes` },
                                        { icon: <Star className="h-4 w-4 text-amber-400 fill-amber-400" />, label: "Rating", value: `${doctor.rating.average.toFixed(1)} / 5 (${doctor.rating.count} reviews)` },
                                    ].map(item => (
                                        <div key={item.label} className="flex gap-3">
                                            <div className="mt-0.5 shrink-0">{item.icon}</div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                                <p className="font-semibold">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {doctor.languages?.length > 0 && (
                                        <div className="flex gap-3">
                                            <Languages className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Languages</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {doctor.languages.map(l => (
                                                        <Badge key={l} variant="secondary" className="text-[10px]">{l}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Clinic Location */}
                            {doctor.clinicAddress?.city && (
                                <div className="bg-background rounded-2xl border border-border p-6 shadow-card space-y-3">
                                    <h2 className="text-base font-bold flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        Clinic Location
                                    </h2>
                                    <div className="space-y-1.5">
                                        {doctor.clinicAddress.name && (
                                            <p className="font-semibold text-sm text-foreground">{doctor.clinicAddress.name}</p>
                                        )}
                                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            <div>
                                                {doctor.clinicAddress.street && <p>{doctor.clinicAddress.street}</p>}
                                                {doctor.clinicAddress.area && <p>{doctor.clinicAddress.area}</p>}
                                                <p className="font-medium text-foreground">
                                                    {doctor.clinicAddress.city}, {doctor.clinicAddress.state}
                                                    {doctor.clinicAddress.pincode && ` — ${doctor.clinicAddress.pincode}`}
                                                </p>
                                            </div>
                                        </div>
                                        {doctor.clinicAddress.mapLink && (
                                            <a
                                                href={doctor.clinicAddress.mapLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                            >
                                                <MapPin className="h-3 w-3" /> View on Map
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Weekly availability */}
                            <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" /> Weekly Schedule
                                </h2>
                                <div className="space-y-2">
                                    {DAYS.map(day => {
                                        const d = doctor.availability?.[day];
                                        const isOn = d?.isAvailable;
                                        return (
                                            <div key={day} className={`flex items-center justify-between py-1.5 px-3 rounded-lg text-sm ${isOn ? "bg-emerald-50 dark:bg-emerald-900/20" : "opacity-40"}`}>
                                                <span className="font-medium capitalize">{day.slice(0, 3).toUpperCase()}</span>
                                                {isOn ? (
                                                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                                        {d.startTime} – {d.endTime}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">Closed</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* CTA */}
                            {doctor.isActive && (
                                <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white text-center space-y-3`}>
                                    <p className="font-bold text-lg">Ready to consult?</p>
                                    <p className="text-white/80 text-sm">Book an appointment in 60 seconds</p>
                                    <Link to={`/appointments/book/${id}`}>
                                        <Button className="w-full bg-white text-gray-900 hover:bg-white/90 font-bold">
                                            <Calendar className="mr-2 h-4 w-4" /> Book Now
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
