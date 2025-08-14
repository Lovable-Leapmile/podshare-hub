import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Plus, Clock, MapPin, User, LogOut, HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { getUserData, getPodValue, isLoggedIn } from "@/utils/storage";
import { Reservation } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Dummy reservation data
const dummyReservations: Reservation[] = [
  {
    id: '1',
    type: 'drop',
    status: 'pending',
    podName: 'POD-KOL-Y444',
    timestamp: new Date().toISOString(),
    description: 'Package delivery from Amazon'
  },
  {
    id: '2',
    type: 'pickup',
    status: 'pending',
    podName: 'POD-KOL-Y445',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    description: 'Return shipment to Flipkart'
  },
  {
    id: '3',
    type: 'drop',
    status: 'completed',
    podName: 'POD-KOL-Y443',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    description: 'Document collection'
  },
  {
    id: '4',
    type: 'pickup',
    status: 'completed',
    podName: 'POD-KOL-Y442',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    description: 'Medical supplies pickup'
  },
  {
    id: '5',
    type: 'drop',
    status: 'cancelled',
    podName: 'POD-KOL-Y441',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    description: 'Cancelled shipment'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentPod, setCurrentPod] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const podValue = getPodValue();
    setCurrentPod(podValue);
  }, [navigate]);

  const user = getUserData();
  
  const recentActivities = dummyReservations.slice(0, 4); // Show recent 4 activities

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getActivityText = (reservation: Reservation) => {
    const timeAgo = getTimeAgo(new Date(reservation.timestamp));
    if (reservation.status === 'completed') {
      return `Package ${reservation.type === 'drop' ? 'delivered to' : 'picked up from'} ${reservation.podName} | ${timeAgo}`;
    }
    return `${reservation.description} | ${timeAgo}`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-qikpod-light-bg px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <img src="/src/assets/qikpod-logo.png" alt="Qikpod" className="w-8 h-8" />
            <span className="font-semibold text-foreground">Customer Dashboard</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/locations')}>
                <MapPin className="mr-2 h-4 w-4" />
                Locations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/support')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {getGreeting()}, {user?.user_name || 'User'}!
          </h1>
          {currentPod && (
            <p className="text-muted-foreground">
              Currently at POD-{currentPod}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => navigate('/reservation')}
              className="btn-primary h-16 flex-col space-y-1"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">Create Booking</span>
            </Button>
            
            <Button
              onClick={() => navigate('/locations')}
              variant="outline"
              className="h-16 flex-col space-y-1"
            >
              <MapPin className="w-5 h-5" />
              <span className="text-sm">Find Pods</span>
            </Button>
            
            <Button
              onClick={() => navigate('/support')}
              variant="outline"
              className="h-16 flex-col space-y-1"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm">Get Help</span>
            </Button>
            
            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              className="h-16 flex-col space-y-1"
            >
              <User className="w-5 h-5" />
              <span className="text-sm">My Profile</span>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-secondary rounded-xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium">
                      {getActivityText(activity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {recentActivities.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
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
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="flex-1 btn-primary"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}