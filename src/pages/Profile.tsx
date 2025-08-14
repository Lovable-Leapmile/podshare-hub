import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { User, Phone, Mail, MapPin, CreditCard, Home } from "lucide-react";
import { Header } from "@/components/Header";
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

  const profileItems = [
    {
      icon: User,
      label: "Name",
      value: user.user_name
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: user.user_phone
    },
    {
      icon: Mail,
      label: "Email",
      value: user.user_email || "Not provided"
    },
    {
      icon: Home,
      label: "Flat Number",
      value: user.user_flatno || "Not specified"
    },
    {
      icon: MapPin,
      label: "Address",
      value: user.user_address || "Not provided"
    },
    {
      icon: CreditCard,
      label: "Credit Limit",
      value: `₹${user.user_credit_limit}`
    },
    {
      icon: CreditCard,
      label: "Credit Used",
      value: `₹${user.user_credit_used}`
    }
  ];

  const availableCredit = parseInt(user.user_credit_limit) - parseInt(user.user_credit_used);

  return (
    <div className="page-container">
      <Header title="Profile" />
      
      <div className="top-section">
        <div className="max-w-md mx-auto">
          {/* Profile Header */}
          <Card className="white-card card-3d border-border/30 p-6 animate-fade-in">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {user.user_name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{user.user_name}</h1>
                <p className="text-muted-foreground">{user.user_type}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm font-medium text-muted-foreground">Available Credit:</span>
                  <span className="text-lg font-bold text-primary">₹{availableCredit}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* User Codes */}
          <div className="grid grid-cols-2 gap-4 mt-6 animate-slide-up">
            <Card className="white-card card-3d border-border/30 p-4 text-center">
              <h3 className="font-semibold text-foreground mb-2">Drop Code</h3>
              <p className="text-2xl font-bold text-primary">{user.user_dropcode}</p>
            </Card>
            <Card className="white-card card-3d border-border/30 p-4 text-center">
              <h3 className="font-semibold text-foreground mb-2">Pickup Code</h3>
              <p className="text-2xl font-bold text-primary">{user.user_pickupcode}</p>
            </Card>
          </div>
        </div>
      </div>

      <div className="cards-section">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Details */}
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
            {profileItems.map((item, index) => (
              <Card 
                key={item.label} 
                className="white-card card-3d border-border/30 p-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Credit Usage Progress */}
          <Card className="white-card card-3d border-border/30 p-6 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-4">Credit Usage</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="text-foreground">₹{user.user_credit_used} / ₹{user.user_credit_limit}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(parseInt(user.user_credit_used) / parseInt(user.user_credit_limit)) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Available: ₹{availableCredit}</span>
                <span>{Math.round(((parseInt(user.user_credit_limit) - parseInt(user.user_credit_used)) / parseInt(user.user_credit_limit)) * 100)}% remaining</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}