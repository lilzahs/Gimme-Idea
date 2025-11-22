// API Client for Gimme Idea Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const ACCESS_CODE = import.meta.env.VITE_ACCESS_CODE || 'GMI2025';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private accessCode: string;

  constructor(baseURL: string, accessCode: string) {
    this.baseURL = baseURL;
    this.accessCode = accessCode;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-access-code': this.accessCode,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Posts API
  async getPosts(params?: {
    category?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    const endpoint = `/api/posts${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async getPost(id: string) {
    return this.request(`/api/posts/${id}`);
  }

  async createPost(
    postData: any,
    walletAddress: string,
    signature: string,
    message?: string
  ) {
    return this.request('/api/posts', {
      method: 'POST',
      headers: {
        'x-wallet-address': walletAddress,
        'x-wallet-signature': signature,
        ...(message && { 'x-signature-message': message }),
      },
      body: JSON.stringify(postData),
    });
  }

  async updatePost(
    id: string,
    postData: any,
    walletAddress: string,
    signature: string,
    message?: string
  ) {
    return this.request(`/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'x-wallet-address': walletAddress,
        'x-wallet-signature': signature,
        ...(message && { 'x-signature-message': message }),
      },
      body: JSON.stringify(postData),
    });
  }

  async deletePost(
    id: string,
    walletAddress: string,
    signature: string,
    message?: string
  ) {
    return this.request(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'x-wallet-address': walletAddress,
        'x-wallet-signature': signature,
        ...(message && { 'x-signature-message': message }),
      },
    });
  }

  // Comments API
  async getComments(postId: string) {
    return this.request(`/api/posts/${postId}/comments`);
  }

  async createComment(
    postId: string,
    content: string,
    walletAddress: string,
    signature: string,
    message?: string
  ) {
    return this.request(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'x-wallet-address': walletAddress,
        'x-wallet-signature': signature,
        ...(message && { 'x-signature-message': message }),
      },
      body: JSON.stringify({ content }),
    });
  }

  // Upload API
  async uploadImage(
    file: File,
    walletAddress: string,
    signature: string,
    message?: string
  ) {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${this.baseURL}/api/upload/image`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-access-code': this.accessCode,
          'x-wallet-address': walletAddress,
          'x-wallet-signature': signature,
          ...(message && { 'x-signature-message': message }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Wallet API
  async getWalletInfo(address: string) {
    return this.request(`/api/wallet/${address}`);
  }

  // Rankings API
  async getRankings(params?: { period?: string; limit?: number }) {
    const queryParams = new URLSearchParams(params as any).toString();
    const endpoint = `/api/rankings${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  // Health Check
  async healthCheck() {
    return this.request('/api/health');
  }
}

export const apiClient = new ApiClient(API_URL, ACCESS_CODE);
export default apiClient;
