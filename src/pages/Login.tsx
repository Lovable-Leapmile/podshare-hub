import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { saveUserData, extractPodFromUrl, isLoggedIn } from "@/utils/storage";
import { OTPInput } from "@/components/OTPInput";
import qikpodLogo from "@/assets/qikpod-logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Check if user is already logged in
    if (isLoggedIn()) {
      navigate('/dashboard');
      return;
    }

    // Extract POD value from URL if present
    extractPodFromUrl();
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
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiService.generateOTP(phoneNumber);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
      setStep('otp');
      setCountdown(30);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.validateOTP(phoneNumber, otp);
      saveUserData(response);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user_name}!`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Invalid OTP",
        description: "The verification code is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      handleSendOTP();
    }
  };

  return (
    <div className="min-h-screen bg-qikpod-light-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === 'phone' ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <img src={qikpodLogo} alt="Qikpod" className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in with your registered mobile number</p>
            </div>

            {/* Phone Input Form */}
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
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="pl-12 h-12 text-base border-border/60 focus:border-primary"
                      maxLength={10}
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
                  ) : (
                    'Continue with OTP'
                  )}
                </Button>
              </div>
            </Card>

            {/* Footer Links */}
            <div className="text-center space-y-3">
              <div className="flex justify-center space-x-6 text-sm">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </div>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-primary hover:text-primary/80 transition-colors">
                  Don't have an account? Sign up
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                  How it works?
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* OTP Header */}
            <div className="text-center mb-8">
              <img src={qikpodLogo} alt="Qikpod" className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Verification Code</h1>
              <p className="text-muted-foreground mb-1">Enter 6-digit OTP</p>
              <p className="text-sm text-muted-foreground">
                OTP sent to +91 {phoneNumber.replace(/(\d{5})(\d{5})/, '$1-$2')}
              </p>
            </div>

            {/* OTP Input Form */}
            <Card className="card-modern p-6 mb-6">
              <div className="space-y-6">
                <div>
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    length={6}
                    className="mb-4"
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
                  ) : (
                    'Verify & Login'
                  )}
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

            {/* Change Number Link */}
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
    </div>
  );
}