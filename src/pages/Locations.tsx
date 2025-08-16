import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronRight, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { getUserData, isLoggedIn, saveLastLocation } from "@/utils/storage";
import { Location } from "@/types";

// Dummy locations data
const dummyLocations: Location[] = [
  {
    id: 'LOC-001',
    name: 'Koramangala Block 5',
    address: 'BTM Layout, Bangalore'
  },
  {
    id: 'LOC-002',
    name: 'Electronic City',
    address: 'Electronic City, Bangalore'
  },
  {
    id: 'LOC-003',
    name: 'Whitefield',
    address: 'Whitefield, Bangalore'
  }
];

export default function Locations() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    // Simulate loading locations
    setTimeout(() => {
      setLocations(dummyLocations);
      setLoading(false);
    }, 800);
  }, [navigate]);

  const handleLocationSelect = (location: Location) => {
    saveLastLocation(location.name);
    navigate('/customer-dashboard');
  };

  const user = getUserData();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-qikpod-light-bg px-4 py-4">
        <div className="flex items-center max-w-md mx-auto">
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3 h-8 w-8 p-0"
          >
            ←
          </Button>
          <span className="font-semibold text-foreground">Your Locations</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Select Location
            </h1>
            <p className="text-muted-foreground">
              Choose from your saved locations to access lockers
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-secondary rounded-xl p-4">
              <div className="space-y-3">
                {locations.map((location, index) => (
                  <Card 
                    key={location.id} 
                    className="card-modern p-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{location.name}</h3>
                          <p className="text-sm text-muted-foreground">{location.address}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
                
                {/* Add New Location Card */}
                <Card className="card-modern p-4 border-dashed border-2 border-primary/30 cursor-pointer hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-center space-x-3 text-primary">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium">Add New Location</h3>
                      <p className="text-sm opacity-80">Scan QR code at a new site</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* User Info */}
          <Card className="card-modern p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {user?.user_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{user?.user_name}</p>
                <p className="text-sm text-muted-foreground">{user?.user_phone}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}