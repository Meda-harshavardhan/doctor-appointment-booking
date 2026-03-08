import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, IndianRupee, ArrowRight, FlaskConical, Droplets, Star } from "lucide-react";

interface LabTestCardProps {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    duration?: string;
    imageUrl?: string;
    sampleType?: string;
    estimatedReportTime?: string;
    popularityFlag?: string;
    isPackage?: boolean;
}

const categoryColors: Record<string, string> = {
    "Blood Tests": "from-rose-500 to-red-400",
    "Urine Tests": "from-amber-500 to-orange-400",
    "Diabetes Tests": "from-orange-500 to-amber-400",
    "Thyroid Tests": "from-purple-500 to-violet-400",
    "Liver Function Tests": "from-yellow-600 to-amber-500",
    "Kidney Function Tests": "from-blue-500 to-cyan-400",
    "Lipid Profile Tests": "from-red-500 to-rose-400",
    "Vitamin & Mineral Tests": "from-emerald-500 to-teal-400",
    "Hormone Tests": "from-pink-500 to-fuchsia-400",
    "Cardiac Tests": "from-red-600 to-rose-500",
    "Infection & Disease Tests": "from-teal-500 to-emerald-400",
    "Cancer Screening Tests": "from-indigo-600 to-purple-500",
    "Allergy Tests": "from-lime-500 to-green-400",
    "Pregnancy Tests": "from-pink-400 to-rose-300",
    "Genetic Tests": "from-violet-600 to-indigo-500",
    "Imaging & Radiology": "from-slate-600 to-gray-500",
    "Health Packages": "from-blue-600 to-indigo-500",
    "Other": "from-gray-500 to-slate-400",
};

// Emoji icons for categories
const categoryIcons: Record<string, string> = {
    "Blood Tests": "🩸", "Urine Tests": "🧪", "Diabetes Tests": "💉",
    "Thyroid Tests": "🦋", "Liver Function Tests": "🫁", "Kidney Function Tests": "🫘",
    "Lipid Profile Tests": "❤️", "Vitamin & Mineral Tests": "💊", "Hormone Tests": "⚗️",
    "Cardiac Tests": "🫀", "Infection & Disease Tests": "🦠", "Cancer Screening Tests": "🔬",
    "Allergy Tests": "🌿", "Pregnancy Tests": "🤰", "Genetic Tests": "🧬",
    "Imaging & Radiology": "🩻", "Health Packages": "📋", "Other": "🧫",
};

const LabTestCard = ({ id, name, category, description, price, imageUrl, sampleType, estimatedReportTime, popularityFlag, isPackage }: LabTestCardProps) => {
    const gradient = categoryColors[category] || categoryColors["Other"];
    const icon = categoryIcons[category] || "🧫";

    return (
        <div className="group relative flex flex-col bg-background rounded-2xl border border-border shadow-card hover:shadow-hover hover:-translate-y-1.5 transition-spring overflow-hidden h-full">

            {/* Header gradient */}
            <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0" />
                ) : (
                    <span className="text-5xl select-none">{icon}</span>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                        {category}
                    </span>
                </div>
                <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                    {isPackage && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/90 text-white backdrop-blur-sm">
                            📋 Package
                        </span>
                    )}
                    {popularityFlag === 'Common' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white backdrop-blur-sm">
                            ⭐ Common
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-4 gap-2.5">
                <h3 className="font-bold text-sm leading-snug line-clamp-2">{name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">{description}</p>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-1.5">
                    {sampleType && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/8 text-primary font-medium">
                            <Droplets className="h-2.5 w-2.5" /> {sampleType}
                        </span>
                    )}
                    {estimatedReportTime && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            <Clock className="h-2.5 w-2.5" /> {estimatedReportTime}
                        </span>
                    )}
                </div>

                {/* Price + Button */}
                <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-0.5 font-black text-primary text-lg">
                        <IndianRupee className="h-4 w-4" />
                        {price}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
                <Link to={`/lab-tests/${id}`} className="block">
                    <Button size="sm" className="w-full gradient-hero border-0 text-white font-semibold transition-spring hover:opacity-90 text-xs">
                        View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </Link>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-hero scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
        </div>
    );
};

export default LabTestCard;
