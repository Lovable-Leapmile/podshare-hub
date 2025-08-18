import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package, Clock, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { getUserData, getPodValue, getLocationName, isLoggedIn } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export default function Reservation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getUserData();
  const podValue = getPodValue();
  
  const [formData, setFormData] = useState({
    awbNumber: '',
    executivePhone: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const locationName = getLocationName() || 'Unknown Location';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.awbNumber || !formData.executivePhone) {
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
        description: `Your reservation has been created successfully.`,
      });
      
      navigate('/customer-dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Create Reservation" />
      
      <div className="mobile-container space-y-6">
        {/* User & Location Info */}
        <Card className="card-3d bg-gradient-primary p-6 text-qikpod-black animate-fade-in">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 opacity-30" />
                <div>
                  <h2 className="text-lg font-bold">{locationName}</h2>
                  <p className="text-sm opacity-80">Location</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/customer-dashboard')}
                className="h-8 w-8 p-0 text-qikpod-black hover:bg-black/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-4">
              <div>
                <p className="text-sm font-medium">User Name</p>
                <p className="text-base">{user?.user_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone Number</p>
                <p className="text-base">{user?.user_phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Reservation Form */}
        <Card className="card-3d bg-card/80 backdrop-blur-sm p-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-foreground mb-6">Package Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Enter AWB No. / Product Details *
              </label>
              <Input
                value={formData.awbNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, awbNumber: e.target.value }))}
                placeholder="Enter AWB number or product details"
                className="h-12"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Enter the Delivery Executive Phone Number *
              </label>
              <Input
                value={formData.executivePhone}
                onChange={(e) => setFormData(prev => ({ ...prev, executivePhone: e.target.value }))}
                placeholder="Enter delivery executive phone number"
                type="tel"
                className="h-12"
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
              {loading ? 'Processing...' : 'Proceed'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}