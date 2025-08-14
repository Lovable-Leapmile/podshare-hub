import { Clock, Package, CheckCircle, XCircle } from "lucide-react";
import { Reservation } from "@/types";

interface ReservationCardProps {
  reservation: Reservation;
}

export function ReservationCard({ reservation }: ReservationCardProps) {
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
          <span className="font-semibold text-foreground">{reservation.podName}</span>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm mb-3">{reservation.description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          {reservation.type.toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(reservation.timestamp).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
}