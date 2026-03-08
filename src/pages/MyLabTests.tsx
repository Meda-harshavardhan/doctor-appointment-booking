import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { labTestsAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FlaskConical, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    sample_collected: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    report_ready: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    completed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    sample_collected: "Sample Collected",
    report_ready: "Report Ready",
    completed: "Completed",
    cancelled: "Cancelled",
};

const MyLabTests = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) { navigate("/login"); return; }
        labTestsAPI.getMyBookings()
            .then((res) => setBookings(res.bookings || []))
            .catch(() => toast.error("Failed to load bookings"))
            .finally(() => setIsLoading(false));
    }, [isAuthenticated]);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero */}
            <section className="relative gradient-hero overflow-hidden">
                <div className="container relative py-12 z-10 text-white text-center">
                    <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center mx-auto mb-4 shadow-glow">
                        <FlaskConical className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-black">My Lab Tests</h1>
                    <p className="text-white/80 mt-2">Track your diagnostic test bookings</p>
                </div>
            </section>

            <main className="flex-1 gradient-subtle py-10">
                <div className="container max-w-3xl mx-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                                <FlaskConical className="h-10 w-10 text-primary" />
                            </div>
                            <p className="text-xl font-bold mb-2">No bookings yet</p>
                            <p className="text-muted-foreground mb-6">Book your first diagnostic test today</p>
                            <Link to="/lab-tests">
                                <Button className="gradient-hero border-0 text-white font-bold shadow-glow-sm hover:opacity-90">
                                    Browse Lab Tests
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((b: any) => {
                                const test = b.labTestId;
                                return (
                                    <div key={b._id} className="bg-background rounded-2xl border border-border shadow-card hover:shadow-hover transition-spring p-5">
                                        <div className="flex items-start gap-4">
                                            {/* Image / icon */}
                                            <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center">
                                                {test?.imageUrl ? (
                                                    <img src={test.imageUrl} alt={test.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <FlaskConical className="h-7 w-7 text-primary" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                                    <div>
                                                        <h3 className="font-bold text-base">{test?.name || "Unknown Test"}</h3>
                                                        <p className="text-xs text-muted-foreground">{test?.category}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[b.bookingStatus] || STATUS_COLORS.pending}`}>
                                                        {STATUS_LABELS[b.bookingStatus] || b.bookingStatus}
                                                    </span>
                                                </div>

                                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4 shrink-0 text-primary" />
                                                        {new Date(b.bookingDate).toLocaleDateString("en-IN")}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4 shrink-0 text-primary" />
                                                        {b.timeSlot}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                                                        <MapPin className="h-4 w-4 shrink-0 text-primary" />
                                                        <span className="truncate">{b.labLocation}</span>
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        {b.payment?.status === "paid" ? (
                                                            <span className="flex items-center gap-1 text-emerald-600">
                                                                <CheckCircle2 className="h-4 w-4" /> Paid ₹{b.payment.amount}
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-amber-600">
                                                                <AlertCircle className="h-4 w-4" /> Payment Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Booked: {new Date(b.createdAt).toLocaleDateString("en-IN")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MyLabTests;
