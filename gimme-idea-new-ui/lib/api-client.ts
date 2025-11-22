// API Client for Gimme Idea Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const ACCESS_CODE = import.meta.env.VITE_ACCESS_CODE || 'GMI2025';

interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  walletAddress: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

interface Comment {
  id: number;
  postId: number;
  content: string;
  walletAddress: string;
  createdAt: string;
}

class ApiClient {
  private baseUrl: string;
  private accessCode: string;

  constructor(baseUrl: string, accessCode: string) {
    this.baseUrl = baseUrl;
    this.accessCode = accessCode;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-access-code': this.accessCode,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Posts
  async getPosts(params?: { limit?: number; offset?: number; sort?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/posts${query ? `?${query}` : ''}`);
  }

  async getPost(id: number) {
    return this.request(`/api/posts/${id}`);
  }

  async createPost(
    postData: { title: string; content: string; imageUrl?: string },
    walletAddress: string,
    signature: string,
    message?: string
  ) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        ...postData,
        walletAddress,
        signature,
        message,
      }),
    });
  }

  async uploadImage(
    file: File,
    walletAddress: string,
    signature: string,
    message?: string
  ) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('walletAddress', walletAddress);
    formData.append('signature', signature);
    if (message) formData.append('message', message);

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'x-access-code': this.accessCode,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.statusText}`);
    }

    return response.json();
  }

  async votePost(
    postId: number,
    voteType: 'upvote' | 'downvote',
    walletAddress: string,
    signature: string,
    message?: string
  ) {
    return this.request(`/api/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({
        voteType,
        walletAddress,
        signature,
        message,
      }),
    });
  }

  // Comments
  async getComments(postId: number) {
    return this.request(`/api/posts/${postId}/comments`);
  }

  async createComment(
    postId: number,
    content: string,
    walletAddress: string,
    signature: string,
    message?: string
  ) {
    return this.request(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        walletAddress,
        signature,
        message,
      }),
    });
  }

  // Rankings
  async getRankings(period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly') {
    return this.request(`/api/rankings?period=${period}`);
  }

  async getUserRanking(walletAddress: string) {
    return this.request(`/api/rankings/user/${walletAddress}`);
  }
}

export const apiClient = new ApiClient(API_URL, ACCESS_CODE);
export type { Post, Comment };
