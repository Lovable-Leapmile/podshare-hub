import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, Settings, User, MapPin, HelpCircle, LogOut, Home } from "lucide-react";
import { apiService, Reservation } from "@/services/api";
import { getUserData, isLoggedIn, getPodName, getLocationId } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
const qikpodLogo = "https://leapmile-website.blr1.cdn.digitaloceanspaces.com/Qikpod/Images/q70.png";
export default function CustomerDashboard() {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const user = getUserData();
  const [dropPendingReservations, setDropPendingReservations] = useState<Reservation[]>([]);
  const [pickupPendingReservations, setPickupPendingReservations] = useState<Reservation[]>([]);
  const [historyReservations, setHistoryReservations] = useState<Reservation[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'PickupCompleted' | 'DropCancelled'>('PickupCompleted');
  const [loading, setLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('drop-pending');
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    if (user?.user_type !== 'Customer') {
      navigate('/login');
      return;
    }
    initializeData();
  }, [navigate]); // Removed user from dependencies to prevent infinite calls

  const initializeData = async () => {
    const podName = getPodName();
    if (podName) {
      try {
        // First get pod info to extract location_id
        await apiService.getPodInfo(podName);

        // Then get location info to extract location name
        const locationId = getLocationId();
        if (locationId) {
          await apiService.getLocationInfo(locationId);
        }

        // Finally load reservations
        loadReservations();
      } catch (error) {
        console.error('Error initializing data:', error);
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive"
        });
      }
    } else {
      loadReservations();
    }
  };
  const loadReservations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const locationId = localStorage.getItem('current_location_id');

      // Only proceed if we have a valid location_id
      if (!locationId) {
        console.log('No location_id found, skipping reservations load');
        setDropPendingReservations([]);
        setPickupPendingReservations([]);
        setHistoryReservations([]);
        return;
      }

      // Load all reservation types
      const [dropPending, pickupPending, pickupCompleted, dropCancelled] = await Promise.all([
        apiService.getReservations(user.user_phone, locationId, 'DropPending'), 
        apiService.getReservations(user.user_phone, locationId, 'PickupPending'), 
        apiService.getReservations(user.user_phone, locationId, 'PickupCompleted'), 
        apiService.getReservations(user.user_phone, locationId, 'DropCancelled')
      ]);
      
      setDropPendingReservations(dropPending);
      setPickupPendingReservations(pickupPending);
      
      // Set initial history based on current filter
      setHistoryReservations(historyFilter === 'PickupCompleted' ? pickupCompleted : dropCancelled);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast({
        title: "Error",
        description: "Failed to load reservations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleHistoryFilterChange = async (filter: 'PickupCompleted' | 'DropCancelled') => {
    setHistoryFilter(filter);
    if (!user) return;
    try {
      const locationId = localStorage.getItem('current_location_id');
      
      // Only proceed if we have a valid location_id
      if (!locationId) {
        console.log('No location_id found, skipping history load');
        setHistoryReservations([]);
        return;
      }
      
      const reservations = await apiService.getReservations(user.user_phone, locationId, filter);
      setHistoryReservations(reservations);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: "Error",
        description: "Failed to load history",
        variant: "destructive"
      });
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
  const renderReservationCard = (reservation: Reservation) => <Card key={reservation.id} className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">{reservation.pod_name}</span>
        </div>
        <Badge variant={getStatusVariant(reservation.reservation_status)}>
          {reservation.reservation_status}
        </Badge>
      </div>
      
      {reservation.package_description && <p className="text-sm text-muted-foreground">{reservation.package_description}</p>}
      
      {reservation.drop_code && <div className="flex items-center space-x-2">
          <span className="text-xs font-medium">Drop Code:</span>
          <code className="text-xs bg-muted px-2 py-1 rounded">{reservation.drop_code}</code>
        </div>}
      
      {reservation.pickup_code && <div className="flex items-center space-x-2">
          <span className="text-xs font-medium">Pickup Code:</span>
          <code className="text-xs bg-muted px-2 py-1 rounded">{reservation.pickup_code}</code>
        </div>}
      
      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>{new Date(reservation.created_at).toLocaleDateString()}</span>
      </div>
    </Card>;
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'DropPending':
      case 'PickupPending':
        return 'default';
      case 'PickupCompleted':
        return 'secondary';
      case 'DropCancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#FAE55A] px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <img src={qikpodLogo} alt="Qikpod" className="w-auto h-6" />
            <span className="font-semibold text-foreground">Customer</span>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-2">
                <Button variant="ghost" className="w-full justify-start h-12 px-4" onClick={() => navigate('/customer-dashboard')}>
                  <Home className="mr-3 h-4 w-4" />
                  Home
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 px-4" onClick={() => navigate('/locations')}>
                  <MapPin className="mr-3 h-4 w-4" />
                  Locations
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 px-4" onClick={() => navigate('/profile')}>
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 px-4" onClick={() => navigate('/support')}>
                  <HelpCircle className="mr-3 h-4 w-4" />
                  Support
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 px-4" onClick={() => setShowLogoutDialog(true)}>
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Create Reservation Button */}
      <div className="px-4 py-4 max-w-md mx-auto">
        <Button onClick={() => navigate('/reservation')} className="btn-primary w-full h-12 text-base font-semibold">
          Create Reservation
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-4 max-w-md mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="drop-pending">Drop Pending</TabsTrigger>
            <TabsTrigger value="pickup-pending">Pickup Pending</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="drop-pending" className="space-y-4 mt-6">
            {loading ? <div className="text-center py-8">Loading...</div> : dropPendingReservations.length > 0 ? dropPendingReservations.map(renderReservationCard) : <div className="text-center py-8 text-muted-foreground">
                No drop pending reservations
              </div>}
          </TabsContent>

          <TabsContent value="pickup-pending" className="space-y-4 mt-6">
            {loading ? <div className="text-center py-8">Loading...</div> : pickupPendingReservations.length > 0 ? pickupPendingReservations.map(renderReservationCard) : <div className="text-center py-8 text-muted-foreground">
                No pickup pending reservations
              </div>}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <div className="flex space-x-2 mb-4">
              <Button variant={historyFilter === 'PickupCompleted' ? 'default' : 'outline'} size="sm" onClick={() => handleHistoryFilterChange('PickupCompleted')}>
                Pickup Completed
              </Button>
              <Button variant={historyFilter === 'DropCancelled' ? 'default' : 'outline'} size="sm" onClick={() => handleHistoryFilterChange('DropCancelled')}>
                Drop Cancelled
              </Button>
            </div>
            
            {loading ? <div className="text-center py-8">Loading...</div> : historyReservations.length > 0 ? historyReservations.map(renderReservationCard) : <div className="text-center py-8 text-muted-foreground">
                No {historyFilter.replace(/([A-Z])/g, ' $1').toLowerCase()} reservations
              </div>}
          </TabsContent>
        </Tabs>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Are you sure you want to logout?</DialogTitle>
            <DialogDescription>
              You will need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleLogout} className="flex-1 btn-primary">
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}