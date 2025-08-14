const API_BASE_URL = 'https://stagingv3.leapmile.com/podcore';
const AUTH_TOKEN = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkxMTYyMDE1OX0.RMEW55tHQ95GVap8ChrGdPRbuVxef4Shf0NRddNgGJo';

export interface OTPResponse {
  user_otp: string;
}

export interface ValidateOTPResponse {
  id: number;
  user_name: string;
  user_phone: string;
  user_email: string;
  user_address: string;
  user_type: string;
  user_flatno: string;
  user_dropcode: string;
  user_pickupcode: string;
  user_credit_limit: string;
  user_credit_used: string;
}

export const apiService = {
  async generateOTP(userPhone: string): Promise<OTPResponse> {
    const response = await fetch(`${API_BASE_URL}/otp/generate_otp/?user_phone=${userPhone}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': AUTH_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate OTP');
    }

    return response.json();
  },

  async validateOTP(userPhone: string, otpCode: string): Promise<ValidateOTPResponse> {
    const response = await fetch(`${API_BASE_URL}/otp/validate_otp/?user_phone=${userPhone}&otp_text=${otpCode}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': AUTH_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to validate OTP');
    }

    return response.json();
  },

  // Dummy API functions for Phase 1
  async getPodInfo(podValue: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: podValue,
      name: `POD-${podValue}`,
      location_id: 'LOC-001',
      status: 'available'
    };
  },

  async getLocationInfo(locationId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: locationId,
      name: 'Koramangala Block 5',
      address: 'BTM Layout, Bangalore'
    };
  },

  async getUserLocations(userId: number) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      { id: 'LOC-001', name: 'Koramangala Block 5', address: 'BTM Layout, Bangalore' },
      { id: 'LOC-002', name: 'Electronic City', address: 'Electronic City, Bangalore' },
      { id: 'LOC-003', name: 'Whitefield', address: 'Whitefield, Bangalore' }
    ];
  }
};