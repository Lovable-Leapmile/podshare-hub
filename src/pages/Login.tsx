import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { saveUserData, extractPodFromUrl, isLoggedIn } from "@/utils/storage";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/dashboard');
      return;
    }
    extractPodFromUrl();
  }, [navigate]);

  useEffect(() => {
    if (step === 'otp' && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiService.generateOTP(phoneNumber);

      if (response.success === true || response.status === 'success') {
        setStep('otp');
        toast({
          title: "✅ OTP Sent Successfully",
          description: "OTP has been sent to your registered mobile number",
          className: "bg-green-50 border border-green-200 text-green-800",
          duration: 3000
        });
      } else {
        setError(response.message || 'This phone number is not registered. Please register to continue.');
      }
    } catch (error) {
      setError('Failed to generate OTP. Please try again.');
      console.error('OTP generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiService.validateOTP(phoneNumber, otpString);
      if (response.success) {
        saveUserData(response);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Failed to validate OTP. Please try again.');
      console.error('OTP validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToPhoneStep = () => {
    setStep('phone');
    setOtp(Array(6).fill(''));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="bg-[#ffe448] p-3 rounded-lg shadow-sm inline-flex">
              <img
                src="https://leapmile-website.blr1.cdn.digitaloceanspaces.com/Qikpod/Images/q70.png"
                alt="Qikpod"
                className="h-10 w-auto"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">
            {step === 'phone'
              ? 'Sign in with your registered mobile number'
              : `Enter the 6-digit code sent to ${phoneNumber}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6 md:p-8 space-y-6">
            {step === 'phone' ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Enter Your Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">+91</span>
                    </div>
                    <Input
                      type="tel"
                      required
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffe448] focus:border-[#ffe448] outline-none transition"
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    onClick={handleSendOTP}
                    disabled={loading || phoneNumber.length !== 10}
                    className="w-full bg-[#ffe448] hover:bg-[#f5d840] text-gray-900 py-3 rounded-lg font-medium transition duration-200"
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

                <div className="text-xs text-gray-500 text-center pt-2">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Enter 6-digit OTP
                  </label>
                  <div className="flex justify-between space-x-2">
                    {[...Array(6)].map((_, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-full h-12 text-center text-xl font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffe448] focus:border-[#ffe448] outline-none transition"
                        value={otp[index]}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full bg-[#ffe448] hover:bg-[#f5d840] text-gray-900 py-3 rounded-lg font-medium transition duration-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Login to Qikpod'
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={resetToPhoneStep}
                    className="w-full py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition border border-gray-200"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change Number
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link
                to="/register"
                className="block text-center text-sm font-medium text-blue-600 hover:underline"
              >
                Don't have an account? Sign up
              </Link>
              <Link
                to="/how-it-works"
                className="block text-center text-sm font-medium text-blue-600 hover:underline"
              >
                How it works?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}