import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { labTestsAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
    FlaskConical, Calendar, Clock, CheckCircle2,
    CreditCard, ArrowLeft, AlertCircle, User
} from "lucide-react";

declare global { interface Window { Razorpay: any } }

const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
        if (document.getElementById("rzp-sdk")) return resolve(true);
        const s = document.createElement("script");
        s.id = "rzp-sdk";
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

const TIME_SLOTS = [
    "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

const LAB_LOCATIONS = [
    "PulseAppoint Diagnostics – Main Center",
    "PulseAppoint Diagnostics – North Branch",
    "PulseAppoint Diagnostics – South Branch",
    "Home Collection (extra charges apply)",
];

const LabTestBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [test, setTest] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"form" | "pay" | "success">("form");
    const [booking, setBooking] = useState<any>(null);

    const [form, setForm] = useState({
        bookingDate: "",
        timeSlot: "",
        patientName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
        patientAge: "",
        patientPhone: user?.phone || "",
        labLocation: LAB_LOCATIONS[0],
        notes: "",
    });

    useEffect(() => {
        if (!id) return;
        labTestsAPI.getTest(id)
            .then((res) => setTest(res.test))
            .catch(() => toast.error("Test not found"));
    }, [id]);

    const field = (key: keyof typeof form, val: string) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.bookingDate || !form.timeSlot || !form.patientName || !form.patientAge || !form.patientPhone) {
            return toast.error("Please fill all required fields");
        }
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (new Date(form.bookingDate) < today) return toast.error("Date cannot be in the past");

        setLoading(true);
        try {
            const res = await labTestsAPI.bookTest(id!, form);
            setBooking(res.booking || res);

            if (res.mode === "free") {
                toast.success("Booking confirmed!");
                setStep("success");
            } else {
                setStep("pay");
                // Immediately open Razorpay if we have order details
                openRazorpay(res);
            }
        } catch (err: any) {
            toast.error(err.message || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    const openRazorpay = async (res: any) => {
        const loaded = await loadRazorpay();
        if (!loaded || !window.Razorpay) return toast.error("Failed to load Razorpay. Check your internet.");

        const options = {
            key: res.keyId,
            amount: res.order.amount,
            currency: res.order.currency,
            name: "PulseAppoint",
            description: `Lab Test: ${test?.name}`,
            order_id: res.order.id,
            prefill: { name: form.patientName, email: user?.email, contact: form.patientPhone },
            theme: { color: "#1a7fc1" },
            handler: async (response: any) => {
                try {
                    await labTestsAPI.verifyPayment(res.booking._id, {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                    toast.success("Payment successful! Booking confirmed.");
                    setStep("success");
                } catch (err: any) {
                    toast.error(err.message || "Payment verification failed");
                }
            },
            modal: { ondismiss: () => toast.info("Payment cancelled. You can retry from Step 2.") },
        };
        new window.Razorpay(options).open();
    };

    const handleRetryPayment = async () => {
        if (!booking || !test) return;
        setLoading(true);
        try {
            const res = await labTestsAPI.bookTest(id!, form);
            openRazorpay(res);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero */}
            <section className="relative gradient-hero overflow-hidden">
                <div className="container relative py-10 z-10 text-white">
                    <button onClick={() => navigate(`/lab-tests/${id}`)}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-base mb-3 text-sm">
                        <ArrowLeft className="h-4 w-4" /> Back to Test Details
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center shadow-glow">
                            <FlaskConical className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black">Book Lab Test</h1>
                            <p className="text-white/70 text-sm">{test?.name}</p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="flex-1 gradient-subtle py-10">
                <div className="container max-w-2xl mx-auto">

                    {/* Step indicators */}
                    <div className="flex items-center gap-3 mb-8">
                        {[{ label: "Details", s: "form" }, { label: "Payment", s: "pay" }, { label: "Confirmed", s: "success" }]
                            .map(({ label, s }, i, arr) => {
                                const order = ["form", "pay", "success"];
                                const cur = order.indexOf(step); const idx = order.indexOf(s);
                                const done = cur > idx; const active = cur === idx;
                                return (
                                    <React.Fragment key={s}>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-base ${done || active ? "gradient-hero text-white shadow-glow-sm" : "bg-muted text-muted-foreground"
                                                }`}>
                                                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                                            </div>
                                            <span className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                                        </div>
                                        {i < arr.length - 1 && (
                                            <div className={`flex-1 h-0.5 rounded-full ${cur > idx ? "gradient-hero" : "bg-border"}`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                    </div>

                    {/* ── STEP 1 — Form ── */}
                    {step === "form" && (
                        <div className="bg-background rounded-2xl border border-border shadow-hover p-6 md:p-8 animate-slide-up">
                            <h2 className="text-xl font-bold mb-6">Patient & Appointment Details</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4 text-primary" /> Date *
                                        </label>
                                        <Input type="date" value={form.bookingDate} onChange={(e) => field("bookingDate", e.target.value)} className="rounded-xl" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium flex items-center gap-1.5">
                                            <Clock className="h-4 w-4 text-primary" /> Time Slot *
                                        </label>
                                        <select
                                            value={form.timeSlot}
                                            onChange={(e) => field("timeSlot", e.target.value)}
                                            className="w-full border border-input rounded-xl p-2.5 text-sm bg-background"
                                            required
                                        >
                                            <option value="">Select time</option>
                                            {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-primary" /> Patient Full Name *
                                    </label>
                                    <Input value={form.patientName} onChange={(e) => field("patientName", e.target.value)} placeholder="Full name" className="rounded-xl" required />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Age *</label>
                                        <Input type="number" min="0" max="120" value={form.patientAge} onChange={(e) => field("patientAge", e.target.value)} placeholder="Age" className="rounded-xl" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Phone *</label>
                                        <Input type="tel" value={form.patientPhone} onChange={(e) => field("patientPhone", e.target.value)} placeholder="10-digit number" className="rounded-xl" required />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Lab Location</label>
                                    <select value={form.labLocation} onChange={(e) => field("labLocation", e.target.value)}
                                        className="w-full border border-input rounded-xl p-2.5 text-sm bg-background">
                                        {LAB_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Special Instructions / Notes</label>
                                    <Textarea value={form.notes} onChange={(e) => field("notes", e.target.value)}
                                        placeholder="Any allergies, medical conditions, or special requests..." className="rounded-xl resize-none h-20" />
                                </div>

                                <Button type="submit" disabled={loading}
                                    className="w-full gradient-hero border-0 text-white font-bold py-5 rounded-xl shadow-glow-sm hover:opacity-90 transition-base">
                                    {loading ? "Processing..." : "Continue to Payment →"}
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* ── STEP 2 — Payment ── */}
                    {step === "pay" && (
                        <div className="bg-background rounded-2xl border border-border shadow-hover p-6 md:p-8 animate-slide-up space-y-5">
                            <h2 className="text-xl font-bold">Confirm & Pay</h2>

                            <div className="rounded-xl border border-border divide-y">
                                {[
                                    { label: "Test", value: test?.name },
                                    { label: "Date", value: new Date(form.bookingDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
                                    { label: "Time", value: form.timeSlot },
                                    { label: "Patient", value: `${form.patientName}, Age ${form.patientAge}` },
                                    { label: "Location", value: form.labLocation },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between px-4 py-3 text-sm">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className="font-medium text-right max-w-[55%]">{value}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between px-4 py-3 bg-primary/5 rounded-b-xl">
                                    <span className="font-bold">Amount Due</span>
                                    <span className="text-xl font-black text-primary">₹{test?.price}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-xl bg-muted/50">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                                Secure payment powered by Razorpay
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep("form")}>← Back</Button>
                                <Button disabled={loading} onClick={handleRetryPayment}
                                    className="flex-1 gradient-hero border-0 text-white font-bold py-5 rounded-xl shadow-glow-sm hover:opacity-90">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    {loading ? "Opening Razorpay..." : `Pay ₹${test?.price}`}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3 — Success ── */}
                    {step === "success" && (
                        <div className="bg-background rounded-2xl border border-border shadow-hover p-8 text-center space-y-5 animate-slide-up">
                            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-emerald-600 mb-2">Booking Confirmed!</h2>
                                <p className="text-muted-foreground">
                                    Your <span className="font-semibold text-foreground">{test?.name}</span> has been booked for{" "}
                                    <span className="font-semibold text-foreground">{form.bookingDate}</span> at{" "}
                                    <span className="font-semibold text-foreground">{form.timeSlot}</span>.
                                </p>
                            </div>
                            <div className="text-sm text-muted-foreground p-4 rounded-xl bg-muted/50">
                                You will receive instructions for preparation. Please arrive 10 minutes early.
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate("/my-lab-tests")}>View My Bookings</Button>
                                <Button className="flex-1 gradient-hero border-0 text-white font-bold rounded-xl shadow-glow-sm hover:opacity-90" onClick={() => navigate("/lab-tests")}>Book Another Test</Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LabTestBooking;
