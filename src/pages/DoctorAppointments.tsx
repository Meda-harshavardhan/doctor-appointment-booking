import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Calendar, Clock, Search, User, Phone, Mail,
    CheckCircle2, XCircle, ClipboardList, Bell, Loader2,
    AlertTriangle, IndianRupee, Stethoscope, MessageSquare
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';

interface Appointment {
    _id: string;
    patientId: {
        _id?: string;
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
    };
    doctorId: any;
    appointmentDate: string;
    appointmentTime: string;
    reason: string;
    status: string;
    consultationType: string;
    symptoms?: string[];
    medicalHistory?: string;
    currentMedications?: string[];
    allergies?: string[];
    payment: { amount: number; status: string };
    diagnosis?: string;
    doctorNotes?: string;
    followUpRequired?: boolean;
    followUpDate?: string;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/30' },
    'no-show': { label: 'No Show', color: 'text-gray-600', bg: 'bg-gray-100' },
};

const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
        </span>
    );
};

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function DoctorAppointments() {
    const { user, doctorProfile, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [newAlert, setNewAlert] = useState(false);

    // Detail modal state
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

    // Complete modal (needs diagnosis note)
    const [completeOpen, setCompleteOpen] = useState(false);
    const [completeTarget, setCompleteTarget] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState('');
    const [doctorNotes, setDoctorNotes] = useState('');
    const [completing, setCompleting] = useState(false);

    /* ── Real-time updates ── */
    const onNewApt = useCallback(() => {
        setNewAlert(true);
        setTimeout(() => setNewAlert(false), 4000);
        fetchAppointments();
    }, []);
    const onStatusUpdate = useCallback(() => fetchAppointments(), []);
    useSocket(doctorProfile?.id || null, 'doctor', {
        'new-appointment': onNewApt,
        'appointment-status-updated': onStatusUpdate,
    });

    /* ── Auth guard ── */
    useEffect(() => {
        if (authLoading) return;
        if (user?.role !== 'doctor') { navigate('/login'); return; }
        fetchAppointments();
    }, [user, authLoading]);

    /* ── Fetch all appointments (correct endpoint: /api/appointments, role-based on backend) ── */
    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/appointments?limit=100`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setAppointments(data.appointments || []);
            } else {
                toast.error(data.message || 'Failed to load appointments');
            }
        } catch {
            toast.error('Network error — could not load appointments');
        } finally {
            setLoading(false);
        }
    };

    /* ── Update status (confirm / cancel / no-show via /status endpoint) ── */
    const updateStatus = async (id: string, status: string, extra: Record<string, any> = {}) => {
        setActionLoading(id + status);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, ...extra }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || `Appointment ${status}`);
                fetchAppointments();
            } else {
                // Show the EXACT server error message to user
                toast.error(data.message || 'Failed to update appointment');
            }
        } catch {
            toast.error('Network error — please try again');
        } finally {
            setActionLoading(null);
        }
    };

    /* ── Mark Complete — calls /complete endpoint which needs confirmed status ── */
    const handleCompleteSubmit = async () => {
        if (!completeTarget) return;
        setCompleting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/appointments/${completeTarget}/complete`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ diagnosis, doctorNotes }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Appointment marked as completed!');
                setCompleteOpen(false);
                setDiagnosis('');
                setDoctorNotes('');
                fetchAppointments();
            } else {
                toast.error(data.message || 'Failed to complete appointment');
            }
        } catch {
            toast.error('Network error — please try again');
        } finally {
            setCompleting(false);
        }
    };

    /* ── Filtered list ── */
    const filtered = appointments.filter(apt => {
        const matchTab = activeTab === 'all' || apt.status === activeTab;
        const matchSearch = !search ||
            `${apt.patientId.firstName} ${apt.patientId.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
            apt.reason.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const count = (s: string) => s === 'all' ? appointments.length : appointments.filter(a => a.status === s).length;

    /* ─────────────────────────────────────── */
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 gradient-subtle">
                <div className="container py-8 max-w-5xl mx-auto">

                    {/* ── Header ── */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black">My Appointments</h1>
                            {newAlert && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold animate-pulse">
                                    <Bell className="h-3.5 w-3.5" /> New appointment!
                                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground">Manage patient appointments — updates in real time</p>
                    </div>

                    {/* ── Search ── */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by patient name or reason..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 max-w-md"
                        />
                    </div>

                    {/* ── Tabs ── */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-5 mb-6">
                            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(tab => (
                                <TabsTrigger key={tab} value={tab} className="capitalize text-xs">
                                    {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)} ({count(tab)})
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value={activeTab}>
                            {/* ── Loading ── */}
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                                    <p className="text-muted-foreground">Loading appointments...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Calendar className="h-14 w-14 text-muted-foreground/30 mb-4" />
                                    <p className="text-lg font-semibold mb-1">No appointments found</p>
                                    <p className="text-sm text-muted-foreground">
                                        {search ? 'Try a different search term' : `No ${activeTab === 'all' ? '' : activeTab} appointments yet`}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filtered.map(apt => {
                                        const isPending = apt.status === 'pending';
                                        const isConfirmed = apt.status === 'confirmed';
                                        const isActive = isPending || isConfirmed;
                                        const patientName = `${apt.patientId.firstName} ${apt.patientId.lastName}`;

                                        return (
                                            <Card key={apt._id} className="shadow-card hover:shadow-hover transition-spring">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between flex-wrap gap-3">
                                                        <div className="flex items-center gap-3">
                                                            {/* Avatar */}
                                                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                                {apt.patientId.firstName[0]}{apt.patientId.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                                                    {patientName}
                                                                    <StatusBadge status={apt.status} />
                                                                </CardTitle>
                                                                <CardDescription className="flex items-center gap-3 mt-0.5">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-3.5 w-3.5" />{formatDate(apt.appointmentDate)}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-3.5 w-3.5" />{formatTime(apt.appointmentTime)}
                                                                    </span>
                                                                    <span className="capitalize text-xs">{apt.consultationType?.replace('-', ' ')}</span>
                                                                </CardDescription>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-black text-primary flex items-center gap-0.5">
                                                                <IndianRupee className="h-4 w-4" />{apt.payment.amount}
                                                            </div>
                                                            <div className={`text-xs font-medium capitalize mt-0.5 ${apt.payment.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                {apt.payment.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="pt-0">
                                                    {/* Contact + Reason */}
                                                    <div className="grid sm:grid-cols-2 gap-2 mb-4 text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                                                            {apt.patientId.phone}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                                                            <span className="truncate">{apt.patientId.email}</span>
                                                        </div>
                                                        <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                                                            <Stethoscope className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                                            <span><span className="font-medium text-foreground">Reason:</span> {apt.reason}</span>
                                                        </div>
                                                        {apt.diagnosis && (
                                                            <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                                                                <ClipboardList className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                                                <span><span className="font-medium text-foreground">Diagnosis:</span> {apt.diagnosis}</span>
                                                            </div>
                                                        )}
                                                        {apt.doctorNotes && (
                                                            <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                                                                <MessageSquare className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                                                <span><span className="font-medium text-foreground">Notes:</span> {apt.doctorNotes}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
                                                        {/* Confirm — only for pending */}
                                                        {isPending && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateStatus(apt._id, 'confirmed')}
                                                                disabled={actionLoading === apt._id + 'confirmed'}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            >
                                                                {actionLoading === apt._id + 'confirmed' ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                                                ) : (
                                                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                                )}
                                                                Confirm
                                                            </Button>
                                                        )}

                                                        {/* Mark Complete — only for confirmed (backend requires confirmed status) */}
                                                        {isConfirmed && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => { setCompleteTarget(apt._id); setCompleteOpen(true); }}
                                                                className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                                                            >
                                                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                                Mark Complete
                                                            </Button>
                                                        )}

                                                        {/* Cancel — for pending or confirmed */}
                                                        {isActive && (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => updateStatus(apt._id, 'cancelled', { notes: 'Cancelled by doctor' })}
                                                                disabled={actionLoading === apt._id + 'cancelled'}
                                                            >
                                                                {actionLoading === apt._id + 'cancelled' ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                                                ) : (
                                                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                                                )}
                                                                Cancel
                                                            </Button>
                                                        )}

                                                        {/* No Show — for confirmed */}
                                                        {isConfirmed && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => updateStatus(apt._id, 'no-show')}
                                                                disabled={actionLoading === apt._id + 'no-show'}
                                                                className="text-gray-600"
                                                            >
                                                                No Show
                                                            </Button>
                                                        )}

                                                        {/* View Patient Details — inline modal */}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => { setSelectedApt(apt); setDetailOpen(true); }}
                                                            className="ml-auto"
                                                        >
                                                            <User className="h-3.5 w-3.5 mr-1" />
                                                            Patient Details
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />

            {/* ═════════════════════════════════════════════
          PATIENT DETAIL MODAL
      ═════════════════════════════════════════════ */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Patient Information
                        </DialogTitle>
                        <DialogDescription>Full appointment and patient details</DialogDescription>
                    </DialogHeader>

                    {selectedApt && (
                        <div className="space-y-5 pt-2">
                            {/* Patient card */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shrink-0">
                                    {selectedApt.patientId.firstName[0]}{selectedApt.patientId.lastName[0]}
                                </div>
                                <div>
                                    <p className="text-lg font-bold">{selectedApt.patientId.firstName} {selectedApt.patientId.lastName}</p>
                                    <div className="flex flex-col gap-0.5 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{selectedApt.patientId.phone}</span>
                                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{selectedApt.patientId.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { label: 'Date', value: formatDate(selectedApt.appointmentDate), icon: <Calendar className="h-3.5 w-3.5" /> },
                                    { label: 'Time', value: formatTime(selectedApt.appointmentTime), icon: <Clock className="h-3.5 w-3.5" /> },
                                    { label: 'Status', value: <StatusBadge status={selectedApt.status} />, icon: null },
                                    { label: 'Fee', value: `₹${selectedApt.payment.amount} (${selectedApt.payment.status})`, icon: <IndianRupee className="h-3.5 w-3.5" /> },
                                    { label: 'Type', value: selectedApt.consultationType?.replace('-', ' '), icon: null },
                                ].map(item => (
                                    <div key={item.label} className="space-y-0.5">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">{item.icon}{item.label}</p>
                                        <div className="font-semibold capitalize">{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border pt-3 space-y-3">
                                <InfoRow label="Reason for visit" value={selectedApt.reason} />
                                {selectedApt.medicalHistory && <InfoRow label="Medical history" value={selectedApt.medicalHistory} />}
                                {selectedApt.symptoms?.length > 0 && <InfoRow label="Symptoms" value={selectedApt.symptoms.join(', ')} />}
                                {selectedApt.currentMedications?.length > 0 && <InfoRow label="Current medications" value={selectedApt.currentMedications.join(', ')} />}
                                {selectedApt.allergies?.length > 0 && (
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100">
                                        <p className="text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
                                            <AlertTriangle className="h-3.5 w-3.5" /> Allergies
                                        </p>
                                        <p className="text-sm text-red-700 dark:text-red-300">{selectedApt.allergies.join(', ')}</p>
                                    </div>
                                )}
                                {selectedApt.diagnosis && <InfoRow label="Diagnosis" value={selectedApt.diagnosis} />}
                                {selectedApt.doctorNotes && <InfoRow label="Doctor notes" value={selectedApt.doctorNotes} />}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ═════════════════════════════════════════════
          MARK COMPLETE MODAL (with diagnosis)
      ═════════════════════════════════════════════ */}
            <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            Complete Appointment
                        </DialogTitle>
                        <DialogDescription>Add diagnosis and notes before marking complete</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label>Diagnosis</Label>
                            <Textarea
                                placeholder="Enter your diagnosis..."
                                value={diagnosis}
                                onChange={e => setDiagnosis(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Doctor Notes (optional)</Label>
                            <Textarea
                                placeholder="Follow-up instructions, prescription notes..."
                                value={doctorNotes}
                                onChange={e => setDoctorNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setCompleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={handleCompleteSubmit}
                                disabled={completing || !diagnosis.trim()}
                            >
                                {completing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {completing ? 'Saving...' : 'Mark Complete'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* small helper component */
function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground font-medium capitalize mb-0.5">{label}</p>
            <p className="text-sm">{value}</p>
        </div>
    );
}
