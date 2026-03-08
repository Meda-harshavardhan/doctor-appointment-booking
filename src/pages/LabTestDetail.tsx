import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { labTestsAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
    FlaskConical, Clock, IndianRupee, User, ArrowLeft,
    CheckCircle2, Info, AlertTriangle
} from "lucide-react";

const LabTestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [test, setTest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        labTestsAPI.getTest(id)
            .then((res) => setTest(res.test))
            .catch(() => toast.error("Failed to load test details"))
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleBook = () => {
        if (!isAuthenticated) {
            toast.error("Please login to book a lab test");
            navigate("/login");
            return;
        }
        navigate(`/lab-tests/${id}/book`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 gradient-subtle py-12">
                    <div className="container max-w-4xl mx-auto space-y-6">
                        <div className="skeleton h-64 rounded-2xl" />
                        <div className="skeleton h-8 w-2/3" />
                        <div className="skeleton h-4 w-full" />
                        <div className="skeleton h-4 w-5/6" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!test) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 gradient-subtle flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl font-bold mb-4">Test not found</p>
                        <Link to="/lab-tests"><Button>← Back to Lab Tests</Button></Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero */}
            <section className="relative gradient-hero overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                {test.imageUrl && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-20"
                        style={{ backgroundImage: `url(${test.imageUrl})` }}
                    />
                )}
                <div className="container relative py-12 z-10 text-white">
                    <button
                        onClick={() => navigate("/lab-tests")}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-base mb-4 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Lab Tests
                    </button>
                    <div className="flex items-start gap-5">
                        <div className="h-16 w-16 rounded-2xl glass flex items-center justify-center shrink-0 shadow-glow">
                            <FlaskConical className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full text-white/90 mb-2 inline-block">
                                {test.category}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black">{test.name}</h1>
                            <div className="flex flex-wrap gap-4 mt-3 text-white/80 text-sm">
                                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {test.duration}</span>
                                <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {test.performedBy}</span>
                                <span className="flex items-center gap-1.5 font-bold text-white text-base">
                                    <IndianRupee className="h-4 w-4" /> {test.price}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="flex-1 gradient-subtle py-10">
                <div className="container max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">

                        {/* Main content */}
                        <div className="md:col-span-2 space-y-6">

                            {/* Image */}
                            {test.imageUrl && (
                                <div className="rounded-2xl overflow-hidden shadow-card">
                                    <img src={test.imageUrl} alt={test.name} className="w-full h-64 object-cover" />
                                </div>
                            )}

                            {/* Description */}
                            <div className="bg-background rounded-2xl border border-border shadow-card p-6">
                                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <Info className="h-5 w-5 text-primary" /> About This Test
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">{test.description}</p>
                            </div>

                            {/* Preparation */}
                            <div className="bg-background rounded-2xl border border-amber-200 dark:border-amber-800 shadow-card p-6">
                                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-amber-600">
                                    <AlertTriangle className="h-5 w-5" /> Preparation Instructions
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">{test.preparationInstructions}</p>
                            </div>

                            {/* Tags */}
                            {test.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {test.tags.map((tag: string) => (
                                        <span key={tag} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar booking card */}
                        <div className="md:col-span-1">
                            <div className="sticky top-24 bg-background rounded-2xl border border-border shadow-hover p-6 space-y-5">
                                <div className="text-center">
                                    <p className="text-3xl font-black gradient-text">₹{test.price}</p>
                                    <p className="text-sm text-muted-foreground mt-1">All inclusive</p>
                                </div>

                                <div className="space-y-3 text-sm">
                                    {[
                                        { label: "Duration", value: test.duration },
                                        { label: "Performed By", value: test.performedBy },
                                        { label: "Category", value: test.category },
                                        { label: "Sample Collection", value: "At designated lab" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between gap-2">
                                            <span className="text-muted-foreground">{label}</span>
                                            <span className="font-medium text-right">{value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 text-xs text-muted-foreground">
                                    {["Home collection available", "Report ready in 24–48hrs", "Certified diagnostic centre", "Secure payment"].map((f) => (
                                        <div key={f} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                            {f}
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="w-full gradient-hero border-0 text-white font-bold py-5 rounded-xl shadow-glow-sm hover:opacity-90 transition-base"
                                    onClick={handleBook}
                                >
                                    Accept Test & Pay
                                </Button>

                                {!isAuthenticated && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        <Link to="/login" className="text-primary underline">Login</Link> required to book
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LabTestDetail;
