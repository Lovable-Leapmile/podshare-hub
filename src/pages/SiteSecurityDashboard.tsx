import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, User, LogOut, Shield, AlertCircle } from "lucide-react";
import { getUserData, isLoggedIn } from "@/utils/storage";
import { LocationDetectionPopup } from "@/components/LocationDetectionPopup";
import { PaginationFilter } from "@/components/PaginationFilter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLocationDetection } from "@/hooks/useLocationDetection";

const qikpodLogo = "https://leapmile-website.blr1.cdn.digitaloceanspaces.com/Qikpod/Images/q70.png";

export default function SiteSecurityDashboard() {
  const navigate = useNavigate();
  const user = getUserData();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Location detection
  const currentLocationId = localStorage.getItem('current_location_id');
  const { showLocationPopup, closeLocationPopup } = useLocationDetection(user?.id, currentLocationId);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    if (user?.user_type !== 'SiteSecurity') {
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
          <p className="text-muted-foreground">Site Security Dashboard</p>
        </div>

        {/* Pagination Filter */}
        <div className="flex justify-end">
          <PaginationFilter 
            itemsPerPage={itemsPerPage} 
            onItemsPerPageChange={setItemsPerPage}
            searchQuery=""
            onSearchChange={() => {}}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
            totalItems={0}
          />
        </div>

        {/* Security Cards */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">RTO Management</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Manage return to origin pending and completed reservations
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/rto')}>
              View RTO
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">Access Control</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Manage access permissions and codes
            </p>
            <Button variant="outline" className="w-full">
              Manage Access
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">Incident Reports</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Review and manage security incidents
            </p>
            <Button variant="outline" className="w-full">
              View Reports
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">Emergency Response</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Quick access to emergency protocols
            </p>
            <Button variant="outline" className="w-full">
              Emergency Actions
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