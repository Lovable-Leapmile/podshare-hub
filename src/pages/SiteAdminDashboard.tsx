import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Plus, User, Phone, Mail, Home, Trash2, Package } from "lucide-react";
import { getUserData, isLoggedIn } from "@/utils/storage";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { LocationDetectionPopup } from "@/components/LocationDetectionPopup";
import { useLocationDetection } from "@/hooks/useLocationDetection";

interface LocationUser {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_flatno: string;
  user_address: string;
  user_type: string;
}

interface Reservation {
  id: string;
  user_name: string;
  user_phone: string;
  awb_number: string;
  reservation_status: string;
  created_at: string;
  updated_at: string;
  pod_name?: string;
  location_name?: string;
}

interface NewUserForm {
  user_name: string;
  user_email: string;
  user_phone: string;
  user_address: string;
  user_flatno: string;
  user_type: string;
}

export default function SiteAdminDashboard() {
  const navigate = useNavigate();
  const user = getUserData();
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialogs state
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showCreateReservationDialog, setShowCreateReservationDialog] = useState(false);
  const [showUserSelectionDialog, setShowUserSelectionDialog] = useState(false);
  const [showConfirmUserDialog, setShowConfirmUserDialog] = useState(false);
  
  // Data state
  const [locationUsers, setLocationUsers] = useState<LocationUser[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedUser, setSelectedUser] = useState<LocationUser | null>(null);
  const [reservationSubTab, setReservationSubTab] = useState("pickup-pending");
  const [historySubTab, setHistorySubTab] = useState("drop-cancelled");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    user_name: "",
    user_email: "",
    user_phone: "",
    user_address: "",
    user_flatno: "",
    user_type: "Customer"
  });

  // Location detection
  const currentLocationId = localStorage.getItem('current_location_id');
  const { showLocationPopup, closeLocationPopup } = useLocationDetection(user?.id, currentLocationId);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    if (user?.user_type !== 'SiteAdmin') {
      navigate('/login');
      return;
    }
  }, [navigate, user]);

  useEffect(() => {
    if (currentLocationId) {
      loadData();
    }
  }, [currentLocationId, activeTab, reservationSubTab, historySubTab]);

  const loadData = async () => {
    if (!currentLocationId) return;
    
    setIsLoading(true);
    try {
      if (activeTab === "users") {
        await loadLocationUsers();
      } else if (activeTab === "reservations") {
        await loadReservations();
      } else if (activeTab === "history") {
        await loadHistory();
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationUsers = async () => {
    try {
      const users = await apiService.getLocationUsers(currentLocationId!);
      setLocationUsers(users);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
  };

  const loadReservations = async () => {
    try {
      const status = reservationSubTab === "pickup-pending" ? "PickupPending" : "DropPending";
      const reservationList = await apiService.getLocationReservations(currentLocationId!, status);
      setReservations(reservationList);
    } catch (error) {
      console.error("Error loading reservations:", error);
      toast.error("Failed to load reservations");
    }
  };

  const loadHistory = async () => {
    try {
      const status = historySubTab === "drop-cancelled" ? "DropCancelled" : "PickupCompleted";
      const historyList = await apiService.getLocationReservations(currentLocationId!, status);
      setReservations(historyList);
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load history");
    }
  };

  const handleAddUser = async () => {
    setIsLoading(true);
    try {
      await apiService.registerUser(newUserForm);
      toast.success("User added successfully!");
      setShowAddUserDialog(false);
      setNewUserForm({
        user_name: "",
        user_email: "",
        user_phone: "",
        user_address: "",
        user_flatno: "",
        user_type: "Customer"
      });
      if (activeTab === "users") {
        await loadLocationUsers();
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error?.message || "Failed to add user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    
    setIsLoading(true);
    try {
      await apiService.removeUser(userId);
      toast.success("User removed successfully!");
      await loadLocationUsers();
    } catch (error: any) {
      console.error("Error removing user:", error);
      toast.error(error?.message || "Failed to remove user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUserForReservation = (selectedUser: LocationUser) => {
    setSelectedUser(selectedUser);
    setShowUserSelectionDialog(false);
    setShowConfirmUserDialog(true);
  };

  const handleConfirmUserForReservation = () => {
    if (selectedUser && currentLocationId) {
      navigate(`/reservation?user_id=${selectedUser.id}&location_id=${currentLocationId}`);
    }
  };

  const handleUserCardClick = (clickedUser: LocationUser) => {
    navigate(`/profile?user_id=${clickedUser.id}&admin_view=true`);
  };

  const handleReservationCardClick = (reservation: Reservation) => {
    navigate(`/reservation-details/${reservation.id}`);
  };

  const filteredUsers = locationUsers.filter(user =>
    user.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user_phone.includes(searchQuery) ||
    user.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user_flatno.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReservations = reservations.filter(reservation =>
    reservation.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.user_phone.includes(searchQuery) ||
    reservation.awb_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Site Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage users, reservations, and location operations</p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            onClick={() => setShowAddUserDialog(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowUserSelectionDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Reservation
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={
                activeTab === "users" 
                  ? "Search users by name, phone, email, or flat number..." 
                  : "Search reservations by name, phone, or AWB number..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((locationUser) => (
                <Card 
                  key={locationUser.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleUserCardClick(locationUser)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{locationUser.user_name}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {locationUser.user_email || "No email"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {locationUser.user_phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="w-3 h-3" />
                            {locationUser.user_flatno || "No flat number"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveUser(locationUser.id);
                      }}
                      className="ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="space-y-4">
            <Tabs value={reservationSubTab} onValueChange={setReservationSubTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pickup-pending">Pickup Pending</TabsTrigger>
                <TabsTrigger value="drop-pending">Drop Pending</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pickup-pending" className="space-y-4">
                <ReservationList 
                  reservations={filteredReservations} 
                  onReservationClick={handleReservationCardClick}
                />
              </TabsContent>
              
              <TabsContent value="drop-pending" className="space-y-4">
                <ReservationList 
                  reservations={filteredReservations} 
                  onReservationClick={handleReservationCardClick}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Tabs value={historySubTab} onValueChange={setHistorySubTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="drop-cancelled">Drop Cancelled</TabsTrigger>
                <TabsTrigger value="pickup-completed">Pickup Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="drop-cancelled" className="space-y-4">
                <ReservationList 
                  reservations={filteredReservations} 
                  onReservationClick={handleReservationCardClick}
                />
              </TabsContent>
              
              <TabsContent value="pickup-completed" className="space-y-4">
                <ReservationList 
                  reservations={filteredReservations} 
                  onReservationClick={handleReservationCardClick}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account for this location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newUserForm.user_name}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, user_name: e.target.value }))}
                placeholder="Enter full name"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserForm.user_email}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, user_email: e.target.value }))}
                placeholder="Enter email address"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={newUserForm.user_phone}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, user_phone: e.target.value }))}
                placeholder="Enter phone number"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="flatno">Flat Number</Label>
              <Input
                id="flatno"
                value={newUserForm.user_flatno}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, user_flatno: e.target.value }))}
                placeholder="Enter flat/unit number"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={newUserForm.user_address}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, user_address: e.target.value }))}
                placeholder="Enter full address"
                rows={3}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select 
                value={newUserForm.user_type} 
                onValueChange={(value) => setNewUserForm(prev => ({ ...prev, user_type: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="SiteSecurity">Site Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isLoading || !newUserForm.user_name || !newUserForm.user_phone}>
              {isLoading ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Selection Dialog for Create Reservation */}
      <Dialog open={showUserSelectionDialog} onOpenChange={setShowUserSelectionDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select User for Reservation</DialogTitle>
            <DialogDescription>
              Choose a user to create a reservation for.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredUsers.map((locationUser) => (
                <Card 
                  key={locationUser.id} 
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectUserForReservation(locationUser)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{locationUser.user_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{locationUser.user_phone}</span>
                        <span>{locationUser.user_flatno || "No flat"}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm User Dialog */}
      <Dialog open={showConfirmUserDialog} onOpenChange={setShowConfirmUserDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm User Selection</DialogTitle>
            <DialogDescription>
              Create a reservation for this user?
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{selectedUser.user_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{selectedUser.user_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span>{selectedUser.user_flatno || "No flat number"}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUserForReservation}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

// Reservation List Component
function ReservationList({ 
  reservations, 
  onReservationClick 
}: { 
  reservations: Reservation[]; 
  onReservationClick: (reservation: Reservation) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reservations.map((reservation) => (
        <Card 
          key={reservation.id} 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onReservationClick(reservation)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{reservation.user_name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>AWB: {reservation.awb_number}</div>
                <div>Phone: {reservation.user_phone}</div>
                <div>Status: {reservation.reservation_status}</div>
                <div>Created: {new Date(reservation.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}