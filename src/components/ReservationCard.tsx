import { Clock, Package, CheckCircle, XCircle, Eye, MapPin, User } from "lucide-react";
import { Reservation } from "@/types";
import { Button } from "@/components/ui/button";

interface ReservationCardProps {
  reservation: Reservation;
  onShowMore?: (reservation: Reservation) => void;
}

export function ReservationCard({ reservation, onShowMore }: ReservationCardProps) {
  const getStatusIcon = () => {
    switch (reservation.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (reservation.status) {
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (reservation.status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="card-3d bg-card rounded-2xl p-5 border border-border/50 backdrop-blur-sm animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">{reservation.podName || (reservation as any).pod_name}</span>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        {(reservation.description || (reservation as any).package_description) && (
          <p className="text-muted-foreground text-sm">{reservation.description || (reservation as any).package_description}</p>
        )}
        
        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(reservation as any).created_by && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Created by: {(reservation as any).created_by}</span>
            </div>
          )}
          
          {(reservation as any).awb_number && (
            <div className="flex items-center space-x-1">
              <Package className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">AWB: {(reservation as any).awb_number}</span>
            </div>
          )}
          
          {(reservation as any).location_name && (
            <div className="flex items-center space-x-1 col-span-2">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Location: {(reservation as any).location_name}</span>
            </div>
          )}
          
          {(reservation as any).dropped_at && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Dropped: {new Date((reservation as any).dropped_at).toLocaleDateString()}</span>
            </div>
          )}
          
          {(reservation as any).picked_at && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Picked: {new Date((reservation as any).picked_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground font-medium">
            {reservation.type?.toUpperCase() || (reservation as any).reservation_type?.toUpperCase()}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(reservation.timestamp || (reservation as any).created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        
        {onShowMore && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onShowMore(reservation)}
            className="text-primary hover:text-primary/80 h-6 px-2"
          >
            <Eye className="w-3 h-3 mr-1" />
            Show More
          </Button>
        )}
      </div>
    </div>
  );
}