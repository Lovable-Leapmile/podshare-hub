import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, User, LogOut, Settings, BarChart3 } from "lucide-react";
import { getUserData, isLoggedIn } from "@/utils/storage";
import { LocationDetectionPopup } from "@/components/LocationDetectionPopup";
import { PaginationFilter } from "@/components/PaginationFilter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLocationDetection } from "@/hooks/useLocationDetection";

const qikpodLogo = "https://leapmile-website.blr1.cdn.digitaloceanspaces.com/Qikpod/Images/q70.png";

export default function SiteAdminDashboard() {
  const navigate = useNavigate();
  const user = getUserData();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Location detection
  const currentLocationId = localStorage.getItem('current_location_id');
  const { showLocationPopup, closeLocationPopup } = useLocationDetection(user?.id, currentLocationId);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    if (user?.user_type !== 'SiteAdmin') {
      navigate('/login'); // Fallback
      return;
    }
  }, [navigate, user]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome, {user?.user_name}!
          </h1>
          <p className="text-muted-foreground">Site Administrator Dashboard</p>
        </div>

        {/* Pagination Filter */}
        <div className="flex justify-end">
          <PaginationFilter 
            itemsPerPage={itemsPerPage}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onItemsPerPageChange={setItemsPerPage} 
          />
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">Pod Management</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Manage and monitor all pod locations
            </p>
            <Button variant="outline" className="w-full">
              Manage Pods
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">User Management</h3>
            <p className="text-muted-foreground text-sm mb-4">
              View and manage all users
            </p>
            <Button variant="outline" className="w-full">
              Manage Users
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">System Analytics</h3>
            <p className="text-muted-foreground text-sm mb-4">
              View system performance and usage statistics
            </p>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </Card>
        </div>
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