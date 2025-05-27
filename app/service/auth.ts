import axiosInstance from './axios.config';
import LS from './LS';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export class AuthService {
  // TODO: move to env variable
  private static readonly API_URL = 'https://dev.projectmate.ru/service/api/account/token';

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const data = {
      'UserName': credentials.email,
      'password': credentials.password,
      'grant_type': 'password',
      'client_type': 'WebProjectMate'
    };

    const config = {
      method: 'POST',
      url: this.API_URL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };

    const response = await axiosInstance(config);
    const { access_token, refresh_token } = response.data;
    LS.setTokens(access_token, refresh_token);
    return response.data;
  }

  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const data = {
      'refresh_token': refreshToken,
      'grant_type': 'refresh_token',
      'client_type': 'WebProjectMate'
    };

    const config = {
      method: 'POST',
      url: this.API_URL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };

    const response = await axiosInstance(config);
    const { access_token, refresh_token } = response.data;
    LS.setTokens(access_token, refresh_token);
    return response.data;
  }
} 