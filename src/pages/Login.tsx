import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { saveUserData, extractPodFromUrl, isLoggedIn } from "@/utils/storage";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [phoneNumber, setPhoneNumber] = useState("6374719920");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'phone' | 'otp'>('otp'); // Start with OTP step for demo
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/dashboard');
      return;
    }
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
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      <div className="w-full max-w-md">
        {step === 'otp' && (
          <button
            onClick={() => setStep('phone')}
            className="flex items-center text-gray-600 mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-1">Back</span>
          </button>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 'phone' ? 'Welcome Back' : 'Enter 6-digit code'}
        </h1>

        <p className="text-gray-600 mb-8">
          {step === 'phone'
            ? 'Login to Qikpod'
            : `sent to ${phoneNumber}`
          }
        </p>

        <div className="space-y-6">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="h-12 text-base border-gray-300 rounded-lg"
                  maxLength={10}
                />
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={loading || phoneNumber.length !== 10}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Get OTP'
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account? <span className="text-blue-600">Sign up</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  className="gap-2"
                >
                  <InputOTPGroup className="gap-2">
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="w-12 h-14 text-lg border-gray-300 rounded-lg"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Login to Qikpod'
                )}
              </Button>

              <div className="text-center space-y-4">
                <button
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className={`text-sm ${countdown > 0 ? 'text-gray-400' : 'text-blue-600'}`}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
                <button
                  onClick={() => setStep('phone')}
                  className="block text-sm text-gray-600 mx-auto"
                >
                  Change number
                </button>
              </div>
            </>
          )}
        </div>

        {step === 'phone' && (
          <div className="mt-8 text-center">
            <button className="text-sm text-gray-600">How it works?</button>
          </div>
        )}
      </div>
    </div>
  );
}