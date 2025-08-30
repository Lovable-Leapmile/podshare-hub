import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { saveUserData, extractPodFromUrl, extractPodNameFromUrl, isLoggedIn } from "@/utils/storage";
import { OTPInput } from "@/components/OTPInput";
import { LocationDetectionPopup } from "@/components/LocationDetectionPopup";
import { useLocationDetection } from "@/hooks/useLocationDetection";
const qikpodLogo = "https://leapmile-website.blr1.cdn.digitaloceanspaces.com/Qikpod/Images/q70.png";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);

  const { showLocationPopup, closeLocationPopup } = useLocationDetection(
    userData?.id,
    currentLocationId
  );

  useEffect(() => {
    if (isLoggedIn()) {
      const userData = JSON.parse(localStorage.getItem('qikpod_user') || '{}');
      switch (userData.user_type) {
        case 'SiteAdmin':
          navigate('/site-admin-dashboard');
          break;
        case 'Customer':
          navigate('/customer-dashboard');
          break;
        case 'SiteSecurity':
          navigate('/site-security-dashboard');
          break;
        default:
          navigate('/login');
      }
      return;
    }

    extractPodNameFromUrl();
  }, [navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      await apiService.generateOTP(phoneNumber);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code."
      });
      setStep('otp');
      setCountdown(30);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const response = await apiService.validateOTP(phoneNumber, otp);
      const userData = response.records[0];
      saveUserData(userData);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.user_name}!`
      });
      await handlePostLoginFlow(userData);
    } catch (error) {
      toast({
        title: "Invalid OTP",
        description: "The verification code is incorrect. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostLoginFlow = async (userData: any) => {
    try {
      const podName = localStorage.getItem('qikpod_pod_name');
      if (podName) {
        const podInfo = await apiService.getPodInfo(podName);
        localStorage.setItem('current_location_id', podInfo.location_id);
        const userExistsAtLocation = await apiService.checkUserAtLocation(userData.id, podInfo.location_id);
        if (!userExistsAtLocation) {
          setUserData(userData);
          setCurrentLocationId(podInfo.location_id);
          return;
        }
      }
      navigateToUserDashboard(userData);
    } catch (error) {
      console.error('Post-login flow error:', error);
      navigateToUserDashboard(userData);
    }
  };

  const navigateToUserDashboard = (userData: any) => {
    switch (userData.user_type) {
      case 'SiteAdmin':
        navigate('/site-admin-dashboard');
        break;
      case 'Customer':
        navigate('/customer-dashboard');
        break;
      case 'SiteSecurity':
        navigate('/site-security-dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      handleSendOTP();
    }
  };

  const handleLocationPopupClose = () => {
    closeLocationPopup();
    if (userData) {
      navigateToUserDashboard(userData);
    }
  };

  return (
    <div className="min-h-screen bg-qikpod-light-bg flex items-start justify-center p-4 py-[40px]">
      <div className="w-full max-w-md">
        {step === 'phone' ? (
          <>
            <div className="text-center mb-8">
              <h1 className="font-bold text-foreground mb-2 text-left text-4xl">Login</h1>
              <p className="text-muted-foreground text-left">Sign in with your registered mobile number</p>
            </div>

            <Card className="card-modern p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium">
                      +91
                    </span>
                     <Input
                       type="tel"
                       placeholder="Enter Your Mobile Number"
                       value={phoneNumber}
                       onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                       className="pl-12 h-12 text-base border-border/60 focus:border-primary"
                       maxLength={10}
                       autoFocus
                     />
                  </div>
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={loading || phoneNumber.length !== 10}
                  className="btn-primary w-full h-12 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : 'Continue with OTP'}
                </Button>
              </div>
            </Card>

            <div className="text-center space-y-3">
              <div className="flex justify-center space-x-6 text-sm">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </div>
              <div className="space-y-2 text-sm text-center">
              <button onClick={() => navigate('/registration')} className="block text-black font-bold hover:text-gray-800 transition-colors mx-auto">
                Not a Registered User? Need to Register
              </button>
              <button
                onClick={() => navigate('/how-it-works')}
                className="block text-muted-foreground hover:text-primary transition-colors mx-auto"
              >
                How it works?
              </button>
            </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="font-bold text-foreground mb-2 text-left text-3xl">Verification Code</h1>
              <p className="text-muted-foreground mb-1 text-left">Enter 6-digit OTP</p>
              <p className="text-sm text-muted-foreground text-left">
                OTP sent to +91 {phoneNumber.replace(/(\d{5})(\d{5})/, '$1-$2')}
              </p>
            </div>

            <Card className="card-modern p-6 mb-6 overflow-visible">
              <div className="space-y-6">
                <div className="flex justify-center w-full">
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    length={6}
                    className="flex flex-wrap justify-center gap-2 w-full"
                  />
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full h-12 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : 'Verify & Login'}
                </Button>

                <Button
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  variant="outline"
                  className="w-full h-12 text-base font-medium"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </Button>
              </div>
            </Card>

            <div className="text-center">
              <button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Change number
              </button>
            </div>
          </>
        )}
      </div>

      {userData && currentLocationId && (
        <LocationDetectionPopup
          isOpen={showLocationPopup}
          onClose={handleLocationPopupClose}
          userId={userData.id}
          locationId={currentLocationId}
        />
      )}
    </div>
  );
}