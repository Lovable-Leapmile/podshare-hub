import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, Calendar, Phone, CheckCircle, Clock } from "lucide-react";
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
  rto_otp?: string;
  pod_name?: string;
  location_name?: string;
  rto_picktime?: string;
}

type TabType = 'pending' | 'completed';

export default function RTO() {
  const navigate = useNavigate();
  const user = getUserData();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingReservations, setPendingReservations] = useState<RTOReservation[]>([]);
  const [completedReservations, setCompletedReservations] = useState<RTOReservation[]>([]);
  const [filteredPendingReservations, setFilteredPendingReservations] = useState<RTOReservation[]>([]);
  const [filteredCompletedReservations, setFilteredCompletedReservations] = useState<RTOReservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Location detection
  const currentLocationId = localStorage.getItem('current_location_id');
  const { showLocationPopup, closeLocationPopup } = useLocationDetection(user?.id, currentLocationId);

  // Authentication and authorization check
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    if (user?.user_type !== 'SiteSecurity') {
      navigate('/site-security-dashboard');
      toast.error('Access denied. Only Site Security personnel can access this page.');
      return;
    }

    // Only set authorized if user is logged in AND is SiteSecurity
    setIsAuthorized(true);
  }, [navigate, user]);

  // Load reservations function - only if authorized
  const loadRTOReservations = useCallback(async (tab: TabType) => {
    if (!currentLocationId || !isAuthorized) {
      return;
    }

    setIsLoading(true);
    try {
      const status = tab === 'pending' ? 'RTOPending' : 'RTOCompleted';
      const rtoList = await apiService.getLocationReservations(currentLocationId, status);

      const reservationsArray = Array.isArray(rtoList) ? rtoList : [];

      if (tab === 'pending') {
        setPendingReservations(reservationsArray);
        setFilteredPendingReservations(reservationsArray);
      } else {
        setCompletedReservations(reservationsArray);
        setFilteredCompletedReservations(reservationsArray);
      }
    } catch (error: any) {
      console.error(`Error loading RTO ${tab} reservations:`, error);
      toast.error(`Failed to load RTO ${tab} reservations: ${error.message || 'Unknown error'}`);

      if (tab === 'pending') {
        setPendingReservations([]);
        setFilteredPendingReservations([]);
      } else {
        setCompletedReservations([]);
        setFilteredCompletedReservations([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentLocationId, isAuthorized]);

  // Create a ref for the load function
  const loadRTOReservationsRef = useRef(loadRTOReservations);
  useEffect(() => {
    loadRTOReservationsRef.current = loadRTOReservations;
  }, [loadRTOReservations]);

  // Load data only when authorized
  useEffect(() => {
    if (currentLocationId && isAuthorized) {
      loadRTOReservationsRef.current(activeTab);
    }
  }, [currentLocationId, activeTab, isAuthorized]);

  // Filter reservations based on search
  useEffect(() => {
    if (!isAuthorized) return;

    const reservations = activeTab === 'pending' ? pendingReservations : completedReservations;
    const filtered = reservations.filter(reservation =>
      reservation.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.user_phone?.includes(searchQuery) ||
      reservation.awb_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeTab === 'pending') {
      setFilteredPendingReservations(filtered);
    } else {
      setFilteredCompletedReservations(filtered);
    }
    setCurrentPage(1);
  }, [pendingReservations, completedReservations, searchQuery, activeTab, isAuthorized]);

  const handleReservationClick = (reservation: RTOReservation) => {
    if (!isAuthorized) return;
    navigate(`/reservation-details/${reservation.id}`);
  };

  const handleTabChange = (value: string) => {
    if (!isAuthorized) return;
    const newTab = value as TabType;
    setActiveTab(newTab);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    if (!isAuthorized) return;
    loadRTOReservations(activeTab);
  };

  // Get current items for pagination
  const currentReservations = activeTab === 'pending' ? filteredPendingReservations : filteredCompletedReservations;
  const totalItems = currentReservations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = currentReservations.slice(startIndex, endIndex);

  const renderReservationCard = (reservation: RTOReservation) => (
    <Card
      key={reservation.id}
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleReservationClick(reservation)}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            activeTab === 'pending'
              ? 'bg-orange-100'
              : 'bg-green-100'
          }`}>
            {activeTab === 'pending' ? (
              <Clock className="w-5 h-5 text-orange-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{reservation.user_name || 'Unknown User'}</h3>
            <p className="text-sm text-muted-foreground">AWB: {reservation.awb_number || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{reservation.user_phone || 'No phone'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Created: {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : 'Unknown date'}</span>
          </div>
          {activeTab === 'completed' && reservation.rto_picktime && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Completed: {new Date(reservation.rto_picktime).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* OTP Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-3 rounded-lg">
          <div className="text-center mb-2">
            <h4 className="text-xs font-semibold text-primary mb-1">🔐 OTP Codes</h4>
          </div>
          <div className={`grid gap-3 ${activeTab === 'pending' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <div className="text-center p-2 rounded bg-background/50 border">
              <p className="text-xs text-muted-foreground mb-1">Drop</p>
              <p className="text-sm font-mono font-bold text-primary">{reservation.drop_otp || '*****'}</p>
            </div>
            <div className="text-center p-2 rounded bg-background/50 border">
              <p className="text-xs text-muted-foreground mb-1">Pickup</p>
              <p className="text-sm font-mono font-bold text-primary">{reservation.pickup_otp || '*****'}</p>
            </div>
            {activeTab === 'completed' && (
              <div className="text-center p-2 rounded bg-background/50 border">
                <p className="text-xs text-muted-foreground mb-1">RTO</p>
                <p className="text-sm font-mono font-bold text-primary">{reservation.rto_otp || '*****'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  // Show loading while checking authorization
  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
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
                Return to Origin (RTO)
              </h1>
              <p className="text-muted-foreground">Manage return to origin reservations</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Location Warning */}
        {!currentLocationId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ No location selected. Please select a location to view RTO reservations.
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              RTO Pending
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              RTO Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
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
              placeholder="Search pending reservations by name, phone, or AWB number..."
              disabled={!currentLocationId || isLoading}
            />

            {/* Content */}
            {!currentLocationId ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Please select a location to view RTO reservations</p>
              </div>
            ) : isLoading ? (
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
                {currentItems.map(renderReservationCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
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
              placeholder="Search completed reservations by name, phone, or AWB number..."
              disabled={!currentLocationId || isLoading}
            />

            {/* Content */}
            {!currentLocationId ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Please select a location to view RTO reservations</p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading RTO completed reservations...</p>
                </div>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No reservations found matching your search." : "No RTO completed reservations found."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentItems.map(renderReservationCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
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