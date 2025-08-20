import { useState, useEffect } from "react";
import { apiService } from "@/services/api";

export function useLocationDetection(userId: number | undefined, locationId: string | null) {
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  useEffect(() => {
    const checkLocation = async () => {
      if (!userId || !locationId) return;

      try {
        const userExistsAtLocation = await apiService.checkUserAtLocation(userId, locationId);
        if (!userExistsAtLocation) {
          setShowLocationPopup(true);
        }
      } catch (error) {
        console.error('Error checking user location:', error);
      }
    };

    checkLocation();
  }, [userId, locationId]);

  const closeLocationPopup = () => {
    setShowLocationPopup(false);
  };

  return {
    showLocationPopup,
    closeLocationPopup
  };
}