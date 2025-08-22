import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Package, Calendar, User, Phone, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserData, isLoggedIn } from "@/utils/storage";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { LocationDetectionPopup } from "@/components/LocationDetectionPopup";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { PaginationFilter } from "@/components/PaginationFilter";

interface RTOReservation {
  id: string;
  user_name: string;
  user_phone: string;
  awb_number: string;
  reservation_status: string;
  created_at: string;
  updated_at: string;
  drop_otp: string;
  pickup_otp: string;
  pod_name?: string;
  location_name?: string;
}

export default function RTOPending() {
  const navigate = useNavigate();
  const user = getUserData();
  const [reservations, setReservations] = useState<RTOReservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<RTOReservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Location detection
  const currentLocationId = localStorage.getItem('current_location_id');
  const { showLocationPopup, closeLocationPopup } = useLocationDetection(user?.id, currentLocationId);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    if (user?.user_type !== 'SiteSecurity') {
      navigate('/login');
      return;
    }
  }, [navigate, user]);

  useEffect(() => {
    if (currentLocationId) {
      loadRTOReservations();
    }
  }, [currentLocationId]);

  useEffect(() => {
    // Filter reservations based on search query
    const filtered = reservations.filter(reservation =>
      reservation.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.user_phone.includes(searchQuery) ||
      reservation.awb_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReservations(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [reservations, searchQuery]);

  const loadRTOReservations = async () => {
    if (!currentLocationId) return;
    
    setIsLoading(true);
    try {
      const rtoList = await apiService.getLocationReservations(currentLocationId, "RTOPending");
      setReservations(Array.isArray(rtoList) ? rtoList : []);
    } catch (error) {
      console.error("Error loading RTO pending reservations:", error);
      toast.error("Failed to load RTO pending reservations");
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservationClick = (reservation: RTOReservation) => {
    navigate(`/reservation-details/${reservation.id}`);
  };

  // Pagination calculations
  const totalItems = filteredReservations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredReservations.slice(startIndex, endIndex);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/site-security-dashboard')}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              RTO Pending
            </h1>
            <p className="text-muted-foreground">Manage return to origin pending reservations</p>
          </div>
        </div>

        {/* Pagination Filter */}
        <PaginationFilter
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          placeholder="Search reservations by name, phone, or AWB number..."
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading RTO pending reservations...</p>
            </div>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery ? "No reservations found matching your search." : "No RTO pending reservations found."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((reservation) => (
              <Card 
                key={reservation.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleReservationClick(reservation)}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{reservation.user_name}</h3>
                      <p className="text-sm text-muted-foreground">AWB: {reservation.awb_number}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{reservation.user_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Created: {new Date(reservation.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* OTP Section */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-3 rounded-lg">
                    <div className="text-center mb-2">
                      <h4 className="text-xs font-semibold text-primary mb-1">🔐 OTP Codes</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 rounded bg-background/50 border">
                        <p className="text-xs text-muted-foreground mb-1">Drop</p>
                        <p className="text-sm font-mono font-bold text-primary">{reservation.drop_otp || '*****'}</p>
                      </div>
                      <div className="text-center p-2 rounded bg-background/50 border">
                        <p className="text-xs text-muted-foreground mb-1">Pickup</p>
                        <p className="text-sm font-mono font-bold text-primary">{reservation.pickup_otp || '*****'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Location Detection Popup */}
      <LocationDetectionPopup
        isOpen={showLocationPopup}
        onClose={closeLocationPopup}
        userId={user?.id || 0}
        locationId={currentLocationId || ""}
      />
    </div>
  );
}