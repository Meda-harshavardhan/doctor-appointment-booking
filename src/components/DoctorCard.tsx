import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Star, MapPin, Clock, CheckCircle2, IndianRupee, Stethoscope, Languages } from "lucide-react";

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  location: string;
  rating: number;
  available: boolean;
  image?: string;
  consultationFee?: number;
  clinicName?: string;
  languages?: string[];
  totalReviews?: number;
}

const SPECIALTY_COLORS: Record<string, string> = {
  "Cardiologist": "from-rose-500 to-red-400",
  "Neurologist": "from-purple-500 to-violet-400",
  "Dermatologist": "from-amber-400 to-orange-400",
  "Pediatrician": "from-sky-400 to-blue-400",
  "Gynecologist": "from-pink-400 to-rose-400",
  "Orthopedic Surgeon": "from-slate-500 to-gray-500",
  "Psychiatrist": "from-indigo-400 to-purple-400",
  "General Physician": "from-teal-400 to-cyan-400",
  "Oncologist": "from-red-600 to-rose-500",
  "Ophthalmologist": "from-blue-400 to-cyan-400",
  "ENT Specialist": "from-lime-500 to-green-400",
  "Endocrinologist": "from-yellow-500 to-amber-400",
  "Gastroenterologist": "from-orange-500 to-amber-400",
  "Pulmonologist": "from-cyan-500 to-teal-400",
  "Urologist": "from-blue-500 to-indigo-400",
  "Nephrologist": "from-violet-500 to-purple-400",
  "Rheumatologist": "from-rose-400 to-pink-400",
};

const getGradient = (specialty: string) =>
  SPECIALTY_COLORS[specialty] || "from-primary to-secondary";

const starPercent = (rating: number) => `${(rating / 5) * 100}%`;

const DoctorCard = ({
  id, name, specialty, experience, location, rating, available,
  image, consultationFee, clinicName, languages, totalReviews,
}: DoctorCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const reviewCount = totalReviews ?? (50 + ((id.charCodeAt(0) * 7) % 150));
  const gradient = getGradient(specialty);

  const handleViewProfile = () => {
    if (!user) {
      navigate("/login", { state: { from: `/doctors/${id}` } });
    } else {
      navigate(`/doctors/${id}`);
    }
  };

  return (
    <div
      className="group relative flex flex-col bg-background rounded-2xl border border-border shadow-card
                 hover:shadow-hover hover:-translate-y-1.5 transition-spring overflow-hidden cursor-pointer"
      onClick={handleViewProfile}
    >
      {/* ── Availability badge — TOP LEFT ── */}
      <div className="absolute top-3 left-3 z-20">
        {available ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/95 text-white text-[11px] font-bold shadow-lg backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            AVAILABLE
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            NOT AVAILABLE
          </div>
        )}
      </div>

      {/* ── Photo section ── */}
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${gradient}`}>
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-6xl font-black text-white/80 tracking-tight select-none">{initials}</span>
          </div>
        )}
        {/* Dark gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Rating pill — bottom right of photo */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-bold backdrop-blur-sm">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
          <span className="text-white/70 font-normal">({reviewCount})</span>
        </div>

        {/* Specialty label — bottom left of photo */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20">
            {specialty}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col p-4 gap-2">
        {/* Name */}
        <div>
          <h3 className="text-base font-bold leading-tight group-hover:text-primary transition-colors">Dr. {name}</h3>
          {clinicName && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{clinicName}</p>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Stethoscope className="h-3 w-3 text-primary" /> {experience} yrs exp.
          </span>
          <span className="flex items-center gap-1 truncate min-w-0">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate">{location}</span>
          </span>
        </div>

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Languages className="h-3 w-3 shrink-0 text-primary" />
            <span className="truncate">{languages.slice(0, 3).join(", ")}</span>
          </div>
        )}

        {/* Fee */}
        {consultationFee !== undefined && (
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Consultation fee</span>
            <span className="flex items-center text-sm font-black text-primary">
              <IndianRupee className="h-3.5 w-3.5" />{consultationFee}
            </span>
          </div>
        )}
      </div>

      {/* ── View Profile Button ── */}
      <div className="px-4 pb-4">
        <button
          onClick={e => { e.stopPropagation(); handleViewProfile(); }}
          className={`w-full py-2 rounded-xl text-sm font-semibold text-white transition-spring
            bg-gradient-to-r ${gradient} opacity-90 hover:opacity-100 hover:shadow-md
            ${!available ? "grayscale" : ""}`}
        >
          {user ? "View Profile" : "Login to View Profile"}
        </button>
      </div>

      {/* Bottom glow accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left`} />
    </div>
  );
};

export default DoctorCard;
