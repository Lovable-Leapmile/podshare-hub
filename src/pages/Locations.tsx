import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronRight, Plus } from "lucide-react";
import { getUserData, isLoggedIn, saveLastLocation, saveLocationId } from "@/utils/storage";
import { UserLocation } from "@/services/api";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/PageLayout";
export default function Locations() {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    loadUserLocations();
  }, [navigate]);
  const loadUserLocations = async () => {
    const user = getUserData();
    if (!user) return;
    try {
      setLoading(true);
      const userLocations = await apiService.getUserLocations(user.id);
      setLocations(userLocations);
    } catch (error) {
      console.error('Error loading user locations:', error);
      toast({
        title: "Error",
        description: "Failed to load your locations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleLocationSelect = (location: UserLocation) => {
    saveLastLocation(location.location_name);
    saveLocationId(location.location_id.toString());
    navigate('/customer-dashboard');
  };
  const user = getUserData();
  return (
    <PageLayout pageTitle="Select Location" showBack={true} showSettings={true}>
      <div className="p-4 max-w-md mx-auto py-0 text-xs">
        <div className="space-y-3 py-[10px]">
          <div>
            <p className="text-muted-foreground">
              Choose from your saved locations to access lockers
            </p>
          </div>

          {/* User Info */}
          <Card className="card-modern p-4 px-[10px] py-[10px] rounded-xl">
            <div className="flex items-center px-0 py-0 mx-0 my-0">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-0">
                <span className="text-primary font-bold text-sm">
                  {user?.user_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground mx-[10px]">{user?.user_name}</p>
                <p className="text-sm text-muted-foreground mx-[10px]">{user?.user_phone}</p>
              </div>
            </div>
          </Card>

          {loading ? <div className="space-y-3">
              {[1, 2, 3].map(i => <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </Card>)}
            </div> : locations.length === 0 ? <div className="bg-secondary rounded-xl p-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No locations found</p>
                <p className="text-sm text-muted-foreground mt-1">Add a new location by scanning a QR code</p>
              </div>
            </div> : <div className="bg-secondary rounded-xl p-4 my-[10px]">
              <div className="space-y-3">
                {locations.map(location => <Card key={location.id} className="card-modern p-4 cursor-pointer hover:shadow-md transition-all" onClick={() => handleLocationSelect(location)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{location.location_name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{location.location_address}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-muted-foreground">PIN: {location.location_pincode}</span>
                            <span className="text-xs text-primary font-medium">{location.status.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Card>)}
                
                {/* Add New Location Card */}
                
              </div>
            </div>}

        </div>
      </div>
    </PageLayout>
  );
}