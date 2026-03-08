import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DoctorCard from "@/components/DoctorCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, Stethoscope } from "lucide-react";
import { useAppointments } from "@/contexts/AppointmentsContext";

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    doctors,
    specializations,
    isLoading,
    error,
    pagination,
    fetchDoctors,
    fetchSpecializations,
    clearError,
  } = useAppointments();

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    fetchDoctors({
      page: currentPage,
      limit: 12,
      search: searchTerm || undefined,
      specialization: selectedSpecialization !== "all" ? selectedSpecialization : undefined,
      sortBy,
      sortOrder,
    });
  }, [searchTerm, selectedSpecialization, sortBy, sortOrder, currentPage]);

  const handleSearch = (value: string) => { setSearchTerm(value); setCurrentPage(1); };
  const handleSpecializationChange = (value: string) => { setSelectedSpecialization(value); setCurrentPage(1); };
  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field); setSortOrder(order); setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-destructive mb-4">{error}</p>
            <Button onClick={clearError}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ─── Hero Banner with Search ──────────────── */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-white/8 blur-3xl pointer-events-none" />
        <div className="container relative py-16 z-10 text-white">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center shadow-glow">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black animate-slide-up">Find Your Doctor</h1>
            <p className="text-white/80 text-lg animate-slide-up-delay-1">
              Browse our network of{" "}
              <span className="font-bold text-cyan-200">500+ verified</span>{" "}
              medical professionals
            </p>
          </div>

          {/* Search bar in hero */}
          <div className="max-w-2xl mx-auto animate-slide-up-delay-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                placeholder="Search by doctor name or specialty..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 py-6 text-base bg-white/15 border-white/25 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/50 rounded-xl backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Filters + Results ───────────────────── */}
      <main className="flex-1 gradient-subtle">
        <div className="container py-10">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 p-4 rounded-2xl bg-background border border-border shadow-card">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
              <Filter className="h-4 w-4" />
              Filters:
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Select value={selectedSpecialization} onValueChange={handleSpecializationChange}>
                <SelectTrigger className="flex-1 rounded-xl border-border">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specializations.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                <SelectTrigger className="sm:w-52 rounded-xl border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating-desc">⭐ Highest Rating</SelectItem>
                  <SelectItem value="rating-asc">Rating (Low–High)</SelectItem>
                  <SelectItem value="experience-desc">🏅 Most Experienced</SelectItem>
                  <SelectItem value="experience-asc">Experience (Low–High)</SelectItem>
                  <SelectItem value="fee-asc">💰 Lowest Fee</SelectItem>
                  <SelectItem value="fee-desc">Fee (High–Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border shadow-card">
                  <div className="skeleton aspect-[4/3]" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-9 w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Doctor Grid */}
          {!isLoading && (
            <>
              {doctors.filter((d) => d.userId).length > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  Showing <span className="font-semibold text-foreground">{doctors.filter((d) => d.userId).length}</span> doctors
                  {selectedSpecialization !== "all" && <> in <span className="font-semibold text-primary">{selectedSpecialization}</span></>}
                </p>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {doctors.filter((d) => d.userId).map((doctor, i) => (
                  <DoctorCard
                    key={doctor._id}
                    id={doctor._id}
                    name={`${doctor.userId.firstName} ${doctor.userId.lastName}`}
                    specialty={doctor.specialization}
                    experience={doctor.experience}
                    location={doctor.hospitalAffiliations?.[0]?.hospitalName || `${doctor.userId.firstName}'s Clinic`}
                    rating={doctor.rating.average}
                    available={doctor.isVerified && doctor.isActive}
                    image={doctor.userId.profileImage}
                    consultationFee={doctor.consultationFee}
                    clinicName={doctor.hospitalAffiliations?.[0]?.hospitalName}
                    languages={doctor.languages}
                    totalReviews={doctor.rating.count}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="rounded-xl"
                  >
                    ← Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 p-0 rounded-lg ${currentPage === page ? "gradient-hero border-0 text-white shadow-glow-sm" : ""}`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="rounded-xl"
                  >
                    Next →
                  </Button>
                </div>
              )}

              {/* No Results */}
              {doctors.length === 0 && (
                <div className="text-center py-20">
                  <div className="h-20 w-20 rounded-3xl gradient-hero/20 flex items-center justify-center mx-auto mb-5">
                    <Filter className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-xl font-bold mb-2">No doctors found</p>
                  <p className="text-muted-foreground mb-5">
                    Try adjusting your filters or clearing your search.
                  </p>
                  <Button
                    onClick={() => { setSearchTerm(""); setSelectedSpecialization("all"); setCurrentPage(1); }}
                    className="gradient-hero border-0 text-white"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Doctors;
