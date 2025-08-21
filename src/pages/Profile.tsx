import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, MapPin, Home, Edit2, X, Check } from "lucide-react";
import { getUserData, isLoggedIn, setUserData } from "@/utils/storage";
import { apiService } from "@/services/api";
import { toast } from "sonner";
export default function Profile() {
  const navigate = useNavigate();
  const user = getUserData();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_name: user?.user_name || "",
    user_email: user?.user_email || "",
    user_flatno: user?.user_flatno || "",
    user_address: user?.user_address || ""
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        user_name: user.user_name || "",
        user_email: user.user_email || "",
        user_flatno: user.user_flatno || "",
        user_address: user.user_address || ""
      });
    }
  }, [user]);

  if (!user) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await apiService.updateUser(user.id, formData);
      
      // Update local storage with new data
      const updatedUser = { ...user, ...formData };
      setUserData(updatedUser);
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      user_name: user.user_name || "",
      user_email: user.user_email || "",
      user_flatno: user.user_flatno || "",
      user_address: user.user_address || ""
    });
    setIsEditing(false);
  };

  const profileItems = [{
    icon: User,
    label: "Name",
    field: "user_name",
    value: user.user_name,
    editable: true
  }, {
    icon: Phone,
    label: "Phone Number",
    field: "user_phone",
    value: user.user_phone,
    editable: false
  }, {
    icon: Mail,
    label: "Email",
    field: "user_email",
    value: user.user_email || "Not provided",
    editable: true
  }, {
    icon: Home,
    label: "Flat Number",
    field: "user_flatno",
    value: user.user_flatno || "Not specified",
    editable: true
  }, {
    icon: MapPin,
    label: "Address",
    field: "user_address",
    value: user.user_address || "Not provided",
    editable: true
  }];

  const availableCredit = parseInt(user.user_credit_limit) - parseInt(user.user_credit_used);
  return <div className="min-h-screen bg-background">
      
      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="card-modern bg-gradient-primary p-6 text-white">
          <div className="flex items-center justify-between">
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
            {!isEditing && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* User Codes */}
        

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}

        {/* Profile Details */}
        <div className="bg-secondary rounded-xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
          <div className="space-y-3">
            {profileItems.map((item) => (
              <Card key={item.label} className="card-modern p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">{item.label}</Label>
                    {isEditing && item.editable ? (
                      item.field === "user_address" ? (
                        <Textarea
                          value={formData[item.field as keyof typeof formData]}
                          onChange={(e) => handleInputChange(item.field, e.target.value)}
                          className="mt-1 min-h-[60px]"
                          placeholder={`Enter ${item.label.toLowerCase()}`}
                        />
                      ) : (
                        <Input
                          type={item.field === "user_email" ? "email" : "text"}
                          value={formData[item.field as keyof typeof formData]}
                          onChange={(e) => handleInputChange(item.field, e.target.value)}
                          className="mt-1"
                          placeholder={`Enter ${item.label.toLowerCase()}`}
                        />
                      )
                    ) : (
                      <p className="font-medium text-foreground mt-1">{item.value}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Credit Usage Progress */}
        
      </div>
    </div>;
}