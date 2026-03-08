import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Shield,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI, labTestsAPI } from "@/services/api";
import { toast } from "sonner";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, login, isAuthenticated, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Create doctor form
  const [doctorForm, setDoctorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    licenseNumber: "",
    specialization: "",
    experience: "",
    consultationFee: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creatingDoctor, setCreatingDoctor] = useState(false);

  // Dashboard data
  const [stats, setStats] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [verifyingDoctorId, setVerifyingDoctorId] = useState<string | null>(null);

  // Lab Tests state
  const [labTests, setLabTests] = useState<any[]>([]);
  const [labBookings, setLabBookings] = useState<any[]>([]);
  const [loadingLab, setLoadingLab] = useState(false);
  const [labTestForm, setLabTestForm] = useState({ name: "", category: "Blood Test", description: "", preparationInstructions: "", price: "", duration: "", performedBy: "Certified Lab Technician", imageUrl: "" });
  const [editingTest, setEditingTest] = useState<any>(null);
  const [savingTest, setSavingTest] = useState(false);
  const [seedingTests, setSeedingTests] = useState(false);

  // If the user is already logged in as admin, go to dashboard tab
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      setActiveTab("dashboard");
      fetchDashboardData();
      fetchLabData();
    }
  }, [isAuthenticated, user]);

  const fetchLabData = async () => {
    setLoadingLab(true);
    try {
      const [testsRes, bookingsRes] = await Promise.all([
        labTestsAPI.getTests({ limit: 100 }),
        labTestsAPI.getAdminBookings({ limit: 50 }),
      ]);
      setLabTests(testsRes.tests || []);
      setLabBookings(bookingsRes.bookings || []);
    } catch (err) { console.error(err); }
    finally { setLoadingLab(false); }
  };

  const handleSaveLabTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTest(true);
    try {
      const data = { ...labTestForm, price: Number(labTestForm.price) };
      if (editingTest) { await labTestsAPI.updateTest(editingTest._id, data); toast.success("Test updated!"); }
      else { await labTestsAPI.createTest(data); toast.success("Test created!"); }
      setLabTestForm({ name: "", category: "Blood Test", description: "", preparationInstructions: "", price: "", duration: "", performedBy: "Certified Lab Technician", imageUrl: "" });
      setEditingTest(null);
      fetchLabData();
    } catch (err: any) { toast.error(err.message || "Failed to save test"); }
    finally { setSavingTest(false); }
  };

  const handleDeleteLabTest = async (id: string) => {
    if (!confirm("Delete this test?")) return;
    try { await labTestsAPI.deleteTest(id); toast.success("Test deleted"); fetchLabData(); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleSeedTests = async () => {
    setSeedingTests(true);
    try { const res = await labTestsAPI.seedTests(); toast.success(res.message); fetchLabData(); }
    catch (err: any) { toast.error(err.message); }
    finally { setSeedingTests(false); }
  };

  const handleUpdateBookingStatus = async (bookingId: string, bookingStatus: string) => {
    try { await labTestsAPI.updateBookingStatus(bookingId, bookingStatus); toast.success("Status updated"); fetchLabData(); }
    catch (err: any) { toast.error(err.message); }
  };

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      const [statsRes, doctorsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getDoctors({ limit: 50 }),
      ]);
      setStats(statsRes.stats);
      setDoctors(doctorsRes.doctors || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm.email, loginForm.password);
      toast.success("Admin login successful!");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingDoctor(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/admin/create-doctor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...doctorForm,
            experience: Number(doctorForm.experience),
            consultationFee: Number(doctorForm.consultationFee),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success("Doctor account created successfully!");
      setDoctorForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        licenseNumber: "",
        specialization: "",
        experience: "",
        consultationFee: "",
      });
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create doctor account");
    } finally {
      setCreatingDoctor(false);
    }
  };

  const handleVerifyDoctor = async (doctorId: string, isVerified: boolean) => {
    setVerifyingDoctorId(doctorId);
    try {
      await adminAPI.verifyDoctor(doctorId, isVerified);
      toast.success(
        `Doctor ${isVerified ? "verified" : "unverified"} successfully`
      );
      // Update the local doctors list immediately for instant UI feedback
      setDoctors((prev) =>
        prev.map((doc) =>
          doc._id === doctorId ? { ...doc, isVerified } : doc
        )
      );
      // Silently refresh stats in background (without showing full-page spinner)
      try {
        const statsRes = await adminAPI.getDashboardStats();
        setStats(statsRes.stats);
      } catch (e) {
        // Stats refresh is non-critical
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update doctor status");
    } finally {
      setVerifyingDoctorId(null);
    }
  };

  // If not logged in or not admin, show login
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              HealthCare
            </span>
          </Link>

          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                  <Shield className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Access the administration panel
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAdminLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@healthcare.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In as Admin"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Admin Panel</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            <Badge variant="destructive">Admin</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/admin");
                window.location.reload();
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="create-doctor">Create Doctor</TabsTrigger>
            <TabsTrigger value="manage-doctors">Manage Doctors</TabsTrigger>
            <TabsTrigger value="lab-tests">Lab Tests</TabsTrigger>
            <TabsTrigger value="lab-bookings">Test Bookings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <Activity className="h-8 w-8 animate-spin" />
              </div>
            ) : stats ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Users
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.users?.total || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.users?.patients || 0} patients,{" "}
                        {stats.users?.doctors || 0} doctors
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Doctors
                      </CardTitle>
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.doctors?.total || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.doctors?.verified || 0} verified,{" "}
                        {stats.doctors?.unverified || 0} pending
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Appointments
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.appointments?.total || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.appointments?.pending || 0} pending
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ₹{stats.revenue?.total || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ₹{stats.revenue?.monthly || 0} this month
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                No data available
              </p>
            )}
          </TabsContent>

          {/* Create Doctor Tab */}
          <TabsContent value="create-doctor">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <CardTitle>Create Doctor Account</CardTitle>
                </div>
                <CardDescription>
                  Create a new doctor account. Share the email and password with
                  the doctor so they can log in.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateDoctor}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-first-name">First Name</Label>
                      <Input
                        id="doc-first-name"
                        placeholder="Dr. John"
                        value={doctorForm.firstName}
                        onChange={(e) =>
                          setDoctorForm({
                            ...doctorForm,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-last-name">Last Name</Label>
                      <Input
                        id="doc-last-name"
                        placeholder="Smith"
                        value={doctorForm.lastName}
                        onChange={(e) =>
                          setDoctorForm({
                            ...doctorForm,
                            lastName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-email">Email (Login Username)</Label>
                    <Input
                      id="doc-email"
                      type="email"
                      placeholder="doctor@example.com"
                      value={doctorForm.email}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-password">
                      Password (Share with doctor)
                    </Label>
                    <div className="relative">
                      <Input
                        id="doc-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={doctorForm.password}
                        onChange={(e) =>
                          setDoctorForm({
                            ...doctorForm,
                            password: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-phone">Phone</Label>
                    <Input
                      id="doc-phone"
                      type="tel"
                      placeholder="1234567890"
                      value={doctorForm.phone}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-dob">Date of Birth</Label>
                    <Input
                      id="doc-dob"
                      type="date"
                      value={doctorForm.dateOfBirth}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-gender">Gender</Label>
                    <select
                      id="doc-gender"
                      className="w-full p-2 border rounded-md"
                      value={doctorForm.gender}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          gender: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-license">Medical License Number</Label>
                    <Input
                      id="doc-license"
                      placeholder="ML12345"
                      value={doctorForm.licenseNumber}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          licenseNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-specialization">Specialization</Label>
                    <select
                      id="doc-specialization"
                      className="w-full p-2 border rounded-md"
                      value={doctorForm.specialization}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          specialization: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Specialization</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Orthopedic Surgeon">
                        Orthopedic Surgeon
                      </option>
                      <option value="General Physician">
                        General Physician
                      </option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Psychiatrist">Psychiatrist</option>
                      <option value="Oncologist">Oncologist</option>
                      <option value="Radiologist">Radiologist</option>
                      <option value="ENT Specialist">ENT Specialist</option>
                      <option value="Urologist">Urologist</option>
                      <option value="Endocrinologist">Endocrinologist</option>
                      <option value="Gastroenterologist">
                        Gastroenterologist
                      </option>
                      <option value="Pulmonologist">Pulmonologist</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-experience">
                        Years of Experience
                      </Label>
                      <Input
                        id="doc-experience"
                        type="number"
                        placeholder="5"
                        value={doctorForm.experience}
                        onChange={(e) =>
                          setDoctorForm({
                            ...doctorForm,
                            experience: e.target.value,
                          })
                        }
                        required
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-fee">Consultation Fee (₹)</Label>
                      <Input
                        id="doc-fee"
                        type="number"
                        placeholder="500"
                        value={doctorForm.consultationFee}
                        onChange={(e) =>
                          setDoctorForm({
                            ...doctorForm,
                            consultationFee: e.target.value,
                          })
                        }
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 p-3 text-sm text-yellow-700 dark:text-yellow-300">
                    <p className="font-medium mb-1">Important:</p>
                    <p>
                      After creating the account, share the email and password
                      with the doctor. They will use these credentials to log in
                      at the Doctor Login page.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={creatingDoctor}
                  >
                    {creatingDoctor
                      ? "Creating Account..."
                      : "Create Doctor Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Manage Doctors Tab */}
          <TabsContent value="manage-doctors">
            <Card>
              <CardHeader>
                <CardTitle>Manage Doctors</CardTitle>
                <CardDescription>
                  View and manage all registered doctors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Activity className="h-8 w-8 animate-spin" />
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No doctors registered yet</p>
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("create-doctor")}
                    >
                      Create your first doctor account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doctors.map((doctor: any) => (
                      <div
                        key={doctor._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">
                              Dr.{" "}
                              {doctor.userId?.firstName ||
                                "Unknown"}{" "}
                              {doctor.userId?.lastName || ""}
                            </h3>
                            <Badge
                              variant={
                                doctor.isVerified
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {doctor.isVerified
                                ? "Verified"
                                : "Unverified"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              {doctor.specialization} |{" "}
                              {doctor.experience} yrs exp | ₹
                              {doctor.consultationFee}
                            </p>
                            <p>
                              Email: {doctor.userId?.email || "N/A"} |
                              Phone: {doctor.userId?.phone || "N/A"}
                            </p>
                            <p>
                              License: {doctor.licenseNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {!doctor.isVerified ? (
                            <Button
                              size="sm"
                              disabled={verifyingDoctorId === doctor._id}
                              onClick={() =>
                                handleVerifyDoctor(doctor._id, true)
                              }
                            >
                              {verifyingDoctorId === doctor._id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              {verifyingDoctorId === doctor._id ? "Verifying..." : "Verify"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={verifyingDoctorId === doctor._id}
                              onClick={() =>
                                handleVerifyDoctor(doctor._id, false)
                              }
                            >
                              {verifyingDoctorId === doctor._id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              {verifyingDoctorId === doctor._id ? "Updating..." : "Unverify"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Tests Management Tab */}
          <TabsContent value="lab-tests" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Lab Tests</h2>
              <Button size="sm" variant="outline" disabled={seedingTests} onClick={handleSeedTests}>
                {seedingTests ? "Seeding..." : "Seed Default Tests"}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{editingTest ? "Edit Lab Test" : "Add New Lab Test"}</CardTitle>
                {editingTest && <CardDescription>Editing: {editingTest.name}</CardDescription>}
              </CardHeader>
              <form onSubmit={handleSaveLabTest}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Test Name *</Label>
                      <Input value={labTestForm.name} onChange={(e) => setLabTestForm({ ...labTestForm, name: e.target.value })} placeholder="e.g. Complete Blood Count" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <select className="w-full p-2 border rounded-md" value={labTestForm.category} onChange={(e) => setLabTestForm({ ...labTestForm, category: e.target.value })}>
                        {["Blood Test", "Imaging", "Urine Test", "Hormonal", "Cardiac", "Cancer Screening", "Genetic", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <textarea className="w-full p-2 border rounded-md h-20 resize-none text-sm" value={labTestForm.description} onChange={(e) => setLabTestForm({ ...labTestForm, description: e.target.value })} placeholder="Describe what the test checks..." required />
                  </div>
                  <div className="space-y-2">
                    <Label>Preparation Instructions</Label>
                    <textarea className="w-full p-2 border rounded-md h-16 resize-none text-sm" value={labTestForm.preparationInstructions} onChange={(e) => setLabTestForm({ ...labTestForm, preparationInstructions: e.target.value })} placeholder="e.g. Fast for 8–12 hours..." />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Price (Rs.) *</Label>
                      <Input type="number" min="0" value={labTestForm.price} onChange={(e) => setLabTestForm({ ...labTestForm, price: e.target.value })} placeholder="499" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input value={labTestForm.duration} onChange={(e) => setLabTestForm({ ...labTestForm, duration: e.target.value })} placeholder="30-60 minutes" />
                    </div>
                    <div className="space-y-2">
                      <Label>Performed By</Label>
                      <Input value={labTestForm.performedBy} onChange={(e) => setLabTestForm({ ...labTestForm, performedBy: e.target.value })} placeholder="Certified Lab Technician" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input value={labTestForm.imageUrl} onChange={(e) => setLabTestForm({ ...labTestForm, imageUrl: e.target.value })} placeholder="https://images.unsplash.com/..." />
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button type="submit" disabled={savingTest}>{savingTest ? "Saving..." : editingTest ? "Update Test" : "Add Test"}</Button>
                  {editingTest && (
                    <Button type="button" variant="outline" onClick={() => { setEditingTest(null); setLabTestForm({ name: "", category: "Blood Test", description: "", preparationInstructions: "", price: "", duration: "", performedBy: "Certified Lab Technician", imageUrl: "" }); }}>
                      Cancel Edit
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader><CardTitle>All Lab Tests ({labTests.length})</CardTitle></CardHeader>
              <CardContent>
                {loadingLab ? (
                  <div className="flex justify-center py-8"><Activity className="h-6 w-6 animate-spin" /></div>
                ) : (
                  <div className="space-y-3">
                    {labTests.map((test: any) => (
                      <div key={test._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                        <div>
                          <p className="font-semibold">{test.name} <span className="text-xs text-muted-foreground">({test.category})</span></p>
                          <p className="text-sm text-muted-foreground">Rs.{test.price} &middot; {test.duration}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingTest(test);
                            setLabTestForm({ name: test.name, category: test.category, description: test.description, preparationInstructions: test.preparationInstructions || "", price: String(test.price), duration: test.duration || "", performedBy: test.performedBy || "", imageUrl: test.imageUrl || "" });
                            setActiveTab("lab-tests");
                          }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteLabTest(test._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {labTests.length === 0 && (
                      <p className="text-center py-6 text-muted-foreground">No tests yet. Click "Seed Default Tests" to populate 8 sample diagnostics.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Test Bookings Tab */}
          <TabsContent value="lab-bookings">
            <Card>
              <CardHeader>
                <CardTitle>Lab Test Bookings ({labBookings.length})</CardTitle>
                <CardDescription>All patient lab test bookings and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLab ? (
                  <div className="flex justify-center py-8"><Activity className="h-6 w-6 animate-spin" /></div>
                ) : (
                  <div className="space-y-4">
                    {labBookings.map((b: any) => (
                      <div key={b._id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-semibold">{b.labTestId?.name || "Unknown Test"}</p>
                            <p className="text-sm text-muted-foreground">
                              Patient: {b.userId?.firstName} {b.userId?.lastName} &bull; {b.patientPhone}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Date: {new Date(b.bookingDate).toLocaleDateString("en-IN")} at {b.timeSlot}
                            </p>
                            <p className="text-sm">
                              Payment: <span className={b.payment?.status === "paid" ? "text-emerald-600 font-medium" : "text-amber-600"}>{b.payment?.status}</span>
                              {" "}&middot; Rs.{b.payment?.amount}
                            </p>
                          </div>
                          <div className="space-y-2 text-right shrink-0">
                            <Badge variant={b.bookingStatus === "completed" ? "default" : "outline"}>
                              {b.bookingStatus?.replace("_", " ")}
                            </Badge>
                            <div>
                              <select
                                className="text-xs p-1.5 border rounded-md"
                                value={b.bookingStatus}
                                onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                              >
                                {["pending", "confirmed", "sample_collected", "report_ready", "completed", "cancelled"].map(s => (
                                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {labBookings.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground">No lab test bookings yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
