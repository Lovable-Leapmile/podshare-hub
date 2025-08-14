import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Phone, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { saveUserData, extractPodFromUrl, isLoggedIn } from "@/utils/storage";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="mobile-container max-w-sm w-full">
        <div className="text-center mb-10 animate-fade-in">
          <img src={qikpodLogo} alt="Qikpod" className="w-24 h-24 mx-auto mb-6 rounded-3xl card-glow" />
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Welcome to Qikpod</h1>
          <p className="text-muted-foreground text-lg">Secure smart locker access</p>
        </div>

        <Card className="white-card card-3d border-border/30 p-8 animate-slide-up">
          {step === 'phone' ? (
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-base font-semibold text-foreground block">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="pl-12 h-14 text-lg border-2 rounded-xl focus:ring-2 focus:ring-primary/20"
                    maxLength={10}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSendOTP} 
                disabled={loading || phoneNumber.length !== 10}
                className="btn-qikpod w-full h-14 text-lg font-semibold rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Get OTP'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                  <label className="text-base font-semibold text-foreground block mb-2">
                    Verification Code
                  </label>
                  <p className="text-sm text-muted-foreground">
                    OTP sent to +91 {phoneNumber}
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    className="gap-3"
                  >
                    <InputOTPGroup className="gap-3">
                      <InputOTPSlot index={0} className="w-12 h-12 text-xl font-semibold border-2 rounded-lg" />
                      <InputOTPSlot index={1} className="w-12 h-12 text-xl font-semibold border-2 rounded-lg" />
                      <InputOTPSlot index={2} className="w-12 h-12 text-xl font-semibold border-2 rounded-lg" />
                      <InputOTPSlot index={3} className="w-12 h-12 text-xl font-semibold border-2 rounded-lg" />
                      <InputOTPSlot index={4} className="w-12 h-12 text-xl font-semibold border-2 rounded-lg" />
                      <InputOTPSlot index={5} className="w-12 h-12 text-xl font-semibold border-2 rounded-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <Button 
                onClick={handleVerifyOTP} 
                disabled={loading || otp.length !== 6}
                className="btn-qikpod w-full h-14 text-lg font-semibold rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </Button>

              <div className="text-center space-y-3">
                <button
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className="text-base font-medium text-primary disabled:text-muted-foreground transition-colors"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
                <button
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  className="block text-base text-muted-foreground hover:text-foreground mx-auto transition-colors"
                >
                  Change number
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}