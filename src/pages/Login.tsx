import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ChevronLeft } from "lucide-react";

const Login = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await apiService.generateOTP(phoneNumber);
      console.log('OTP Generation Response:', response);

      if (response.success === true || response.status === 'success') {
        setStep('otp');
        setCountdown(30);
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        });
      } else {
        setError(response.message || 'This phone number is not registered. Please register to continue.');
      }
    } catch (error) {
      setError('Failed to generate OTP. Please try again.');
      console.error('OTP generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await apiService.validateOTP(phoneNumber, otp);

      if (response.success || response.status === 'success') {
        login({
          user_name: response.user_name,
          user_type: response.user_type,
          access_token: response.access_token,
          user_phone: phoneNumber
        });
        navigate('/dashboard');
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Failed to validate OTP. Please try again.');
      console.error('OTP validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      handlePhoneSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  const resetToPhoneStep = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      <div className="w-full max-w-md">
        {step === 'otp' && (
          <button
            onClick={resetToPhoneStep}
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
            <form onSubmit={handlePhoneSubmit} className="space-y-5">
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

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || phoneNumber.length !== 10}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Get OTP'
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account? <Link to="/register" className="text-blue-600">Sign up</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-5">
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

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {isLoading ? (
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
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className={`text-sm ${countdown > 0 ? 'text-gray-400' : 'text-blue-600'}`}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
                <button
                  type="button"
                  onClick={resetToPhoneStep}
                  className="block text-sm text-gray-600 mx-auto"
                >
                  Change number
                </button>
              </div>
            </form>
          )}
        </div>

        {step === 'phone' && (
          <div className="mt-8 text-center">
            <Link to="/how-it-works" className="text-sm text-gray-600">How it works?</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;