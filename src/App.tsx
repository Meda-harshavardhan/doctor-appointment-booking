import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppointmentsProvider } from "./contexts/AppointmentsContext";
import Index from "./pages/Index";
import SplashPage from "./pages/SplashPage";
import Login from "./pages/Login";
import DoctorLogin from "./pages/DoctorLogin";
import AdminPanel from "./pages/AdminPanel";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorAvailability from "./pages/DoctorAvailability";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import LabTests from "./pages/LabTests";
import LabTestDetail from "./pages/LabTestDetail";
import LabTestBooking from "./pages/LabTestBooking";
import MyLabTests from "./pages/MyLabTests";
import PublicDoctorDetail from "./pages/PublicDoctorDetail";
import MedicalStore from "./pages/MedicalStore";
import MedicineDetail from "./pages/MedicineDetail";
import Chatbot from "./components/Chatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppointmentsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<SplashPage />} />
              <Route path="/home" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/doctor-login" element={<DoctorLogin />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/:id" element={<PublicDoctorDetail />} />
              <Route path="/store" element={<MedicalStore />} />
              <Route path="/store/:id" element={<MedicineDetail />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/appointments/book/:id" element={<BookAppointment />} />
              <Route path="/about" element={<About />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/terms" element={<Terms />} />
              {/* Lab Test Routes */}
              <Route path="/lab-tests" element={<LabTests />} />
              <Route path="/lab-tests/:id" element={<LabTestDetail />} />
              <Route path="/lab-tests/:id/book" element={<LabTestBooking />} />
              <Route path="/my-lab-tests" element={<MyLabTests />} />
              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
              <Route path="/doctor/availability" element={<DoctorAvailability />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Chatbot />
          </BrowserRouter>
        </AppointmentsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
