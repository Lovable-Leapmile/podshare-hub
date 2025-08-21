import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, MapPin, Home, Edit2, X, Check, RefreshCw } from "lucide-react";
import { getUserData, isLoggedIn, setUserData } from "@/utils/storage";
import { apiService } from "@/services/api";
import { toast } from "sonner";

/**
 * Full, fixed Profile component
 * - Inputs are fully editable (controlled by formData)
 * - PATCH update via apiService.updateUser(id, payload)
 * - Local storage + on-screen data sync immediately after save
 * - Basic validation (email format)
 * - Save disabled if no changes or while loading
 * - Cancel restores original values
 * - Unsaved change guard on dialog close
 */

// Types kept flexible to match your backend shape
interface UserShape {
  id: number | string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  user_flatno?: string;
  user_address?: string;
  user_type?: string;
  user_credit_limit?: string | number;
  user_credit_used?: string | number;
  // ...any other fields you store
  [key: string]: any;
}

interface ProfileForm {
  user_name: string;
  user_email: string;
  user_flatno: string;
  user_address: string;
}

export default function Profile() {
  const navigate = useNavigate();

  // Keep user in component state so UI updates immediately after saving
  const [user, setUser] = useState<UserShape | null>(() => getUserData());

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    user_name: "",
    user_email: "",
    user_flatno: "",
    user_address: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Initialize form from user
  useEffect(() => {
    if (user) {
      setFormData({
        user_name: user.user_name || "",
        user_email: user.user_email || "",
        user_flatno: user.user_flatno || "",
        user_address: user.user_address || "",
      });
      // Clear any previous errors when the source of truth changes
      setErrors({});
    }
  }, [user]);

  // Autofocus first field when dialog opens
  useEffect(() => {
    if (isEditing) {
      // Delay focus slightly to ensure element is mounted
      const t = setTimeout(() => firstInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isEditing]);

  if (!user) return null;

  // ------- Derived values & helpers
  const availableCredit = useMemo(() => {
    const limitNum = Number(user.user_credit_limit ?? 0);
    const usedNum = Number(user.user_credit_used ?? 0);
    const diff = isFinite(limitNum - usedNum) ? limitNum - usedNum : 0;
    return Math.max(0, Math.floor(diff));
  }, [user.user_credit_limit, user.user_credit_used]);

  const profileItems = [
    { icon: User, label: "Name", field: "user_name", value: user.user_name || "—", editable: true },
    { icon: Phone, label: "Phone Number", field: "user_phone", value: user.user_phone || "—", editable: false },
    { icon: Mail, label: "Email", field: "user_email", value: user.user_email || "Not provided", editable: true },
    { icon: Home, label: "Flat Number", field: "user_flatno", value: user.user_flatno || "Not specified", editable: true },
    { icon: MapPin, label: "Address", field: "user_address", value: user.user_address || "Not provided", editable: true },
  ] as const;

  const clean = (s: string) => s.trim();
  const isValidEmail = (s: string) => !s || /^(?:[a-zA-Z0-9_!#$%&'*+\/=?`{|}~^.-]+)@(?:[a-zA-Z0-9.-]+)\.[a-zA-Z]{2,}$/.test(s);

  const original: ProfileForm = useMemo(
    () => ({
      user_name: user.user_name || "",
      user_email: user.user_email || "",
      user_flatno: user.user_flatno || "",
      user_address: user.user_address || "",
    }),
    [user]
  );

  const hasChanges = useMemo(() => {
    return (
      clean(formData.user_name) !== clean(original.user_name) ||
      clean(formData.user_email) !== clean(original.user_email) ||
      clean(formData.user_flatno) !== clean(original.user_flatno) ||
      clean(formData.user_address) !== clean(original.user_address)
    );
  }, [formData, original]);

  const validate = (draft: ProfileForm) => {
    const nextErrors: Partial<Record<keyof ProfileForm, string>> = {};
    if (!clean(draft.user_name)) nextErrors.user_name = "Name is required";
    if (!isValidEmail(clean(draft.user_email))) nextErrors.user_email = "Enter a valid email";
    // Flat No & Address optional – add rules if your product needs them
    return nextErrors;
  };

  // ------- Actions
  const handleSave = async () => {
    const payload: ProfileForm = {
      user_name: clean(formData.user_name),
      user_email: clean(formData.user_email),
      user_flatno: clean(formData.user_flatno),
      user_address: clean(formData.user_address),
    };

    const nextErrors = validate(payload);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    if (!hasChanges) {
      toast.info("No changes to save.");
      return;
    }

    setIsLoading(true);
    try {
      // PATCH update; your apiService should inject auth token
      await apiService.updateUser(user.id, payload);

      // Merge into current user and persist
      const updatedUser: UserShape = { ...user, ...payload };
      setUser(updatedUser);
      setUserData(updatedUser);

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmClose = window.confirm("Discard your unsaved changes?");
      if (!confirmClose) return;
    }
    // Reset to original & close
    setFormData(original);
    setErrors({});
    setIsEditing(false);
  };

  const handleResetToOriginal = () => {
    setFormData(original);
    setErrors({});
  };

  // Warn if user tries to close tab with unsaved changes while dialog is open
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing && hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isEditing, hasChanges]);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="card-modern bg-gradient-primary p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.user_name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{user.user_name}</h1>
                <p className="opacity-90">{user.user_type}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm font-medium">Available Credit:</span>
                  <span className="text-lg font-bold">₹{availableCredit.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>

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
                    <p className="font-medium text-foreground mt-1">{item.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Edit Dialog */}
        {/* Edit Dialog */}
        {isEditing && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="mb-2">Name</Label>
                  <Input
                    id="name"
                    ref={firstInputRef}
                    value={formData.user_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, user_name: e.target.value }))}
                    placeholder="Enter your name"
                    disabled={isLoading}
                    aria-invalid={!!errors.user_name}
                    aria-describedby={errors.user_name ? "name-error" : undefined}
                  />
                  {errors.user_name && (
                    <p id="name-error" className="mt-1 text-sm text-red-600">{errors.user_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, user_email: e.target.value }))}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    aria-invalid={!!errors.user_email}
                    aria-describedby={errors.user_email ? "email-error" : undefined}
                  />
                  {errors.user_email && (
                    <p id="email-error" className="mt-1 text-sm text-red-600">{errors.user_email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="flatno" className="mb-2">Flat Number</Label>
                  <Input
                    id="flatno"
                    value={formData.user_flatno}
                    onChange={(e) => setFormData((prev) => ({ ...prev, user_flatno: e.target.value }))}
                    placeholder="Enter your flat number"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="mb-2">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.user_address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, user_address: e.target.value }))}
                    placeholder="Enter your address"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                {/* Readonly phone (display only inside dialog if you want) */}
                <div>
                  <Label htmlFor="phone" className="mb-2">Phone Number</Label>
                  <Input id="phone" value={user.user_phone || "—"} readOnly disabled />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !hasChanges}
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
                  type="button"
                  variant="outline"
                  onClick={handleResetToOriginal}
                  disabled={isLoading || !hasChanges}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/*
OPTIONAL: If you don't already have apiService.updateUser implemented,
you can use this minimal helper instead. Ensure you provide a valid token.

// services/api.ts
export const apiService = {
  async updateUser(id: number | string, payload: ProfileForm) {
    const token = localStorage.getItem("auth_token"); // adapt to your storage
    const res = await fetch(`https://stagingv3.leapmile.com/podcore/users/${id}`, {
      method: "PATCH",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
  },
};
*/
