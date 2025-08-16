const API_BASE_URL = 'https://stagingv3.leapmile.com/podcore';
const AUTH_TOKEN = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkxMTYyMDE1OX0.RMEW55tHQ95GVap8ChrGdPRbuVxef4Shf0NRddNgGJo';

export interface OTPResponse {
  user_otp: string;
}

export interface ValidateOTPResponse {
  status: string;
  status_code: number;
  message: string;
  timestamp: string;
  records: Array<{
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
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  user_phone: string;
  access_token: string;
  statusbool: boolean;
  ok: boolean;
  api_processing_time: number;
}

export interface UserLocation {
  id: string;
  name: string;
  address: string;
  location_id: string;
}

export interface PodInfo {
  id: string;
  name: string;
  location_id: string;
  status: string;
}

export interface LocationInfo {
  record_id: string;
  name: string;
  address: string;
}

export interface Reservation {
  id: string;
  reservation_status: string;
  drop_code?: string;
  pickup_code?: string;
  package_description?: string;
  created_at: string;
  pod_name: string;
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

    const data = await response.json();
    // Store the access token for future use
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
    }
    
    return data;
  },

  async getUserLocations(userId: number): Promise<UserLocation[]> {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;
    
    const response = await fetch(`${API_BASE_URL}/users/locations/?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user locations');
    }

    return response.json();
  },

  async getPodInfo(podName: string): Promise<PodInfo> {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;
    
    const response = await fetch(`${API_BASE_URL}/pods/?pod_name=${podName}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get pod info');
    }

    return response.json();
  },

  async getLocationInfo(locationId: string): Promise<LocationInfo> {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;
    
    const response = await fetch(`${API_BASE_URL}/locations/?record_id=${locationId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get location info');
    }

    return response.json();
  },

  async addUserLocation(userId: number, locationId: string): Promise<void> {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;
    
    const response = await fetch(`${API_BASE_URL}/users/locations/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        location_id: locationId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add user location');
    }
  },

  async getReservations(phoneNum: string, locationId: string, status: string): Promise<Reservation[]> {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;
    
    const response = await fetch(`${API_BASE_URL}/reservations/?phone_num=${phoneNum}&location_id=${locationId}&reservation_status=${status}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get reservations');
    }

    return response.json();
  }
};