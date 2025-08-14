import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Package, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { ReservationCard } from "@/components/ReservationCard";
import { getUserData, getPodValue, isLoggedIn } from "@/utils/storage";
import { Reservation } from "@/types";

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
  const [activeTab, setActiveTab] = useState('drop-pending');

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const podValue = getPodValue();
    setCurrentPod(podValue);
  }, [navigate]);

  const user = getUserData();
  
  const dropPending = dummyReservations.filter(r => r.type === 'drop' && r.status === 'pending');
  const pickupPending = dummyReservations.filter(r => r.type === 'pickup' && r.status === 'pending');
  const pickupCompleted = dummyReservations.filter(r => r.type === 'pickup' && r.status === 'completed');
  const dropCancelled = dummyReservations.filter(r => r.type === 'drop' && r.status === 'cancelled');

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'drop-pending':
        return <Package className="w-4 h-4" />;
      case 'pickup-pending':
        return <Clock className="w-4 h-4" />;
      case 'pickup-completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'drop-cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="page-container">
      <Header title="Customer Dashboard" />
      
      <div className="top-section">
        <div className="max-w-md mx-auto space-y-6">
          {/* Current Pod Section */}
          {currentPod && (
            <Card className="white-card card-3d border-border/30 p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold mb-1 text-foreground">Current Pod</h2>
                  <p className="text-2xl font-black text-primary">POD-{currentPod}</p>
                  <p className="text-sm text-muted-foreground">Koramangala Block 5</p>
                </div>
                <Package className="w-12 h-12 text-primary" />
              </div>
              <Button 
                onClick={() => navigate('/reservation')}
                className="btn-qikpod w-full mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Reservation
              </Button>
            </Card>
          )}

          {/* Welcome Message */}
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome back, {user?.user_name || 'Customer'}!
            </h1>
            <p className="text-muted-foreground">
              Manage your locker reservations and deliveries
            </p>
          </div>
        </div>
      </div>

      <div className="cards-section">
        <div className="max-w-md mx-auto">
          {/* Reservations Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-slide-up">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
              <TabsTrigger value="drop-pending" className="flex items-center space-x-1 text-xs">
                {getTabIcon('drop-pending')}
                <span className="hidden sm:inline">Drop Pending</span>
                <span className="sm:hidden">Drop</span>
              </TabsTrigger>
              <TabsTrigger value="pickup-pending" className="flex items-center space-x-1 text-xs">
                {getTabIcon('pickup-pending')}
                <span className="hidden sm:inline">Pickup Pending</span>
                <span className="sm:hidden">Pickup</span>
              </TabsTrigger>
              <TabsTrigger value="pickup-completed" className="flex items-center space-x-1 text-xs">
                {getTabIcon('pickup-completed')}
                <span className="hidden sm:inline">Completed</span>
                <span className="sm:hidden">Done</span>
              </TabsTrigger>
              <TabsTrigger value="drop-cancelled" className="flex items-center space-x-1 text-xs">
                {getTabIcon('drop-cancelled')}
                <span className="hidden sm:inline">Cancelled</span>
                <span className="sm:hidden">Cancel</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="drop-pending" className="space-y-4">
              {dropPending.length > 0 ? (
                dropPending.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              ) : (
                <Card className="white-card p-8 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">No Pending Drops</h3>
                  <p className="text-muted-foreground text-sm">
                    You don't have any pending drop-off reservations.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pickup-pending" className="space-y-4">
              {pickupPending.length > 0 ? (
                pickupPending.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              ) : (
                <Card className="white-card p-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">No Pending Pickups</h3>
                  <p className="text-muted-foreground text-sm">
                    You don't have any pending pickup reservations.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pickup-completed" className="space-y-4">
              {pickupCompleted.length > 0 ? (
                pickupCompleted.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              ) : (
                <Card className="white-card p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">No Completed Pickups</h3>
                  <p className="text-muted-foreground text-sm">
                    Your completed pickup history will appear here.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="drop-cancelled" className="space-y-4">
              {dropCancelled.length > 0 ? (
                dropCancelled.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              ) : (
                <Card className="white-card p-8 text-center">
                  <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">No Cancelled Drops</h3>
                  <p className="text-muted-foreground text-sm">
                    Your cancelled reservations will appear here.
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}