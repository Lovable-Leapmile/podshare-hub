import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Clock, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { getUserData, getPodValue, isLoggedIn } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export default function Reservation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getUserData();
  const podValue = getPodValue();
  
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    estimatedTime: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const reservationTypes = [
    { value: 'drop', label: 'Drop Off Package' },
    { value: 'pickup', label: 'Pick Up Package' }
  ];

  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.description) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate reservation creation
    setTimeout(() => {
      toast({
        title: "Reservation Created",
        description: `Your ${formData.type} reservation has been confirmed for POD-${podValue}.`,
      });
      
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Create Reservation" />
      
      <div className="mobile-container space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Button>

        {/* Pod Info */}
        <Card className="card-3d bg-gradient-primary p-6 text-qikpod-black animate-fade-in">
          <div className="flex items-center space-x-4">
            <Package className="w-12 h-12 opacity-30" />
            <div>
              <h2 className="text-lg font-bold">POD-{podValue}</h2>
              <p className="text-sm opacity-80">Koramangala Block 5</p>
              <p className="text-xs opacity-60">Available for reservations</p>
            </div>
          </div>
        </Card>

        {/* Reservation Form */}
        <Card className="card-3d bg-card/80 backdrop-blur-sm p-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-foreground mb-6">Reservation Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Reservation Type *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {reservationTypes.map((type) => (
                  <Card
                    key={type.value}
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.type === type.value ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`} />
                      <span className="font-medium text-foreground">{type.label}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Preferred Time Slot
              </label>
              <Select value={formData.estimatedTime} onValueChange={(value) => setFormData(prev => ({ ...prev, estimatedTime: value }))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select time slot (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your package or items (e.g., Amazon delivery, return shipment, documents)"
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Important Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Standard storage time is 48 hours</li>
                    <li>• Use your drop code: {user?.user_dropcode}</li>
                    <li>• Use your pickup code: {user?.user_pickupcode}</li>
                    <li>• Contact support for any issues</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="btn-qikpod w-full h-12"
            >
              {loading ? 'Creating Reservation...' : 'Create Reservation'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}