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
    navigate('/dashboard');
  };

  const user = getUserData();

  return (
    <div className="page-container">
      <Header title="Your Locations" />
      
      <div className="top-section">
        <div className="max-w-md mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Select Location
            </h1>
            <p className="text-muted-foreground">
              Choose from your saved locations to access lockers
            </p>
          </div>

          {/* User Info */}
          <Card className="white-card border-border/30 p-4 rounded-xl animate-fade-in mt-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
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

      <div className="cards-section">
        <div className="max-w-md mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="white-card p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              {locations.map((location, index) => (
                <Card 
                  key={location.id} 
                  className="white-card card-3d border-border/30 p-6 cursor-pointer hover:bg-muted/50 transition-all"
                  onClick={() => handleLocationSelect(location)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{location.name}</h3>
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
              
              {/* Add New Location Card */}
              <Card className="white-card border-dashed border-2 border-primary/30 p-6 cursor-pointer hover:border-primary/50 transition-all">
                <div className="flex items-center justify-center space-x-4 text-primary">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">Add New Location</h3>
                    <p className="text-sm opacity-80">Scan QR code at a new site</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}