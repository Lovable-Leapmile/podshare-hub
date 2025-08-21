import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MapPin, CreditCard, Home } from "lucide-react";
import { getUserData, isLoggedIn } from "@/utils/storage";
export default function Profile() {
  const navigate = useNavigate();
  const user = getUserData();
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
  }, [navigate]);
  if (!user) return null;
  const profileItems = [{
    icon: User,
    label: "Name",
    value: user.user_name
  }, {
    icon: Phone,
    label: "Phone Number",
    value: user.user_phone
  }, {
    icon: Mail,
    label: "Email",
    value: user.user_email || "Not provided"
  }, {
    icon: Home,
    label: "Flat Number",
    value: user.user_flatno || "Not specified"
  }, {
    icon: MapPin,
    label: "Address",
    value: user.user_address || "Not provided"
  }, {
    icon: CreditCard,
    label: "Credit Limit",
    value: `₹${user.user_credit_limit}`
  }, {
    icon: CreditCard,
    label: "Credit Used",
    value: `₹${user.user_credit_used}`
  }];
  const availableCredit = parseInt(user.user_credit_limit) - parseInt(user.user_credit_used);
  return <div className="min-h-screen bg-background">
      
      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="card-modern bg-gradient-primary p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.user_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.user_name}</h1>
              <p className="opacity-90">{user.user_type}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm font-medium">Available Credit:</span>
                <span className="text-lg font-bold">₹{availableCredit}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* User Codes */}
        

        {/* Profile Details */}
        <div className="bg-secondary rounded-xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
          <div className="space-y-3">
            {profileItems.map((item, index) => <Card key={item.label} className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              </Card>)}
          </div>
        </div>

        {/* Credit Usage Progress */}
        
      </div>
    </div>;
}