import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { doctorsAPI } from '@/services/api';
import { useAppointments } from '@/contexts/AppointmentsContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Calendar, Clock, Stethoscope, MapPin, Star,
  CreditCard, CheckCircle2, ArrowLeft, AlertCircle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: any;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── Component ─────────────────────────────────────────────────────────────
const BookAppointment: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookAppointment } = useAppointments();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState<any>(null);
  const [doctorName, setDoctorName] = useState('');
  const [consultationFee, setConsultationFee] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'pay' | 'success'>('form');
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  // ── Load doctor ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    doctorsAPI.getDoctor(id)
      .then((res) => {
        if (res?.doctor) {
          setDoctor(res.doctor);
          setDoctorName(
            `${res.doctor.userId?.firstName || ''} ${res.doctor.userId?.lastName || ''}`.trim()
            || res.doctor.userId?.email || 'Doctor'
          );
          setConsultationFee(res.doctor.consultationFee ?? null);
        }
      })
      .catch(() => toast.error('Failed to load doctor information'));
  }, [id]);

  // ── Step 1 — book the appointment first, then pay ────────────────────
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !doctor) return;
    if (!date || !time) { toast.error('Please select date and time'); return; }
    if (!reason.trim()) { toast.error('Please provide a reason for the appointment'); return; }

    // Date validations
    const selectedDate = new Date(date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { toast.error('Date cannot be in the past'); return; }
    const threeMonths = new Date(); threeMonths.setMonth(threeMonths.getMonth() + 3);
    if (selectedDate > threeMonths) { toast.error('Cannot book more than 3 months ahead'); return; }

    // Availability check
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const avail = doctor.availability?.[dayName];
    if (!avail?.isAvailable) { toast.error(`Doctor is not available on ${dayName}`); return; }

    const [h, m] = time.split(':').map(Number);
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    if (timeStr < avail.startTime || timeStr >= avail.endTime) {
      toast.error(`Doctor available ${avail.startTime}–${avail.endTime} on ${dayName}`);
      return;
    }
    if (avail.breakStartTime && avail.breakEndTime) {
      if (timeStr >= avail.breakStartTime && timeStr < avail.breakEndTime) {
        toast.error(`Doctor on break ${avail.breakStartTime}–${avail.breakEndTime}`);
        return;
      }
    }

    setLoading(true);
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const appointment = await bookAppointment({
        doctorId: id,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        reason: reason.trim(),
        consultationType: 'in-person',
      });
      setBookedAppointment(appointment);
      setPaymentStep('pay');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 — trigger Razorpay checkout ──────────────────────────────
  const handlePayment = async () => {
    if (!bookedAppointment) return;
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      // 1. Create order on backend
      const orderRes = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appointmentId: bookedAppointment._id || bookedAppointment.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create payment order');

      // 2a. Free mode (no Razorpay keys configured)
      if (orderData.mode === 'free') {
        toast.success('Appointment confirmed!');
        setPaymentStep('success');
        setLoading(false);
        return;
      }

      // 2b. Real Razorpay checkout
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Failed to load Razorpay SDK. Check your internet connection.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,         // paise
        currency: orderData.order.currency,
        name: 'PulseAppoint',
        description: `Consultation with Dr. ${doctorName}`,
        order_id: orderData.order.id,
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
        },
        theme: { color: '#1a7fc1' },
        handler: async (response: any) => {
          try {
            // 3. Verify signature on backend
            const verifyRes = await fetch(`${API_BASE}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                appointmentId: bookedAppointment._id || bookedAppointment.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message || 'Payment verification failed');
            toast.success('Payment successful! Appointment confirmed.');
            setPaymentStep('success');
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled. You can retry anytime.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────
  const DoctorSummary = () => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/15">
      <div className="h-12 w-12 rounded-full gradient-hero flex items-center justify-center text-white font-bold text-lg shadow-glow-sm shrink-0">
        {doctorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>
      <div>
        <p className="font-bold text-base">Dr. {doctorName}</p>
        <p className="text-sm text-muted-foreground">{doctor?.specialization}</p>
        {consultationFee != null && (
          <p className="text-sm font-semibold text-primary mt-0.5">₹{consultationFee} consultation fee</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero banner */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/8 blur-3xl pointer-events-none" />
        <div className="container relative py-10 z-10 text-white">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-base mb-3 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center shadow-glow">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Book Appointment</h1>
              <p className="text-white/70 text-sm">Fill in your details and pay securely with Razorpay</p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 gradient-subtle py-10">
        <div className="container max-w-2xl mx-auto">

          {/* ── Step indicators ── */}
          <div className="flex items-center gap-3 mb-8">
            {[
              { label: 'Details', step: 'form' },
              { label: 'Payment', step: 'pay' },
              { label: 'Confirmed', step: 'success' },
            ].map(({ label, step }, i, arr) => {
              const steps = ['form', 'pay', 'success'];
              const currentIdx = steps.indexOf(paymentStep);
              const thisIdx = steps.indexOf(step);
              const done = currentIdx > thisIdx;
              const active = currentIdx === thisIdx;
              return (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-base ${done ? 'gradient-hero text-white shadow-glow-sm' :
                        active ? 'gradient-hero text-white shadow-glow-sm' :
                          'bg-muted text-muted-foreground'
                      }`}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-sm font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full transition-base ${currentIdx > thisIdx ? 'gradient-hero' : 'bg-border'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════════
              STEP 1 — Appointment Details Form
          ══════════════════════════════════════════════ */}
          {paymentStep === 'form' && (
            <div className="bg-background rounded-2xl border border-border shadow-hover p-6 md:p-8 space-y-6 animate-slide-up">
              <h2 className="text-xl font-bold">Appointment Details</h2>

              {doctor && <DoctorSummary />}

              <form onSubmit={handleBook} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" /> Date
                    </label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" /> Time
                    </label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Reason for Visit</label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your symptoms or reason for visit..."
                    className="rounded-xl resize-none h-24"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-hero border-0 text-white font-bold py-5 rounded-xl shadow-glow-sm hover:opacity-90 transition-base"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Continue to Payment →'}
                </Button>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              STEP 2 — Payment
          ══════════════════════════════════════════════ */}
          {paymentStep === 'pay' && (
            <div className="bg-background rounded-2xl border border-border shadow-hover p-6 md:p-8 space-y-6 animate-slide-up">
              <h2 className="text-xl font-bold">Confirm & Pay</h2>

              {doctor && <DoctorSummary />}

              {/* Appointment summary */}
              <div className="rounded-xl border border-border divide-y divide-border">
                {[
                  { label: 'Date', value: new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Time', value: time },
                  { label: 'Type', value: 'In-person consultation' },
                  { label: 'Reason', value: reason },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="text-right font-medium max-w-[55%]">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 bg-primary/5 rounded-b-xl">
                  <span className="font-bold">Amount Due</span>
                  <span className="text-xl font-black text-primary">
                    ₹{consultationFee ?? 0}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-xl bg-muted/50">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span>
                  Your appointment is tentatively held. Payment confirms and secures your slot.
                  Powered by <span className="font-semibold text-foreground">Razorpay</span> — 100% secure.
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setPaymentStep('form')}
                  disabled={loading}
                >
                  ← Back
                </Button>
                <Button
                  className="flex-1 gradient-hero border-0 text-white font-bold py-5 rounded-xl shadow-glow-sm hover:opacity-90 transition-base"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {loading ? 'Opening Razorpay...' : `Pay ₹${consultationFee ?? 0}`}
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              STEP 3 — Success
          ══════════════════════════════════════════════ */}
          {paymentStep === 'success' && (
            <div className="bg-background rounded-2xl border border-border shadow-hover p-8 text-center space-y-5 animate-slide-up">
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-emerald-600 mb-2">Appointment Confirmed!</h2>
                <p className="text-muted-foreground">
                  Your appointment with <span className="font-semibold text-foreground">Dr. {doctorName}</span> on{' '}
                  <span className="font-semibold text-foreground">{date}</span> at{' '}
                  <span className="font-semibold text-foreground">{time}</span> has been confirmed.
                </p>
              </div>

              {doctor && <DoctorSummary />}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => navigate('/appointments')}
                >
                  View My Appointments
                </Button>
                <Button
                  className="flex-1 gradient-hero border-0 text-white font-bold rounded-xl shadow-glow-sm hover:opacity-90"
                  onClick={() => navigate('/doctors')}
                >
                  Book Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookAppointment;
