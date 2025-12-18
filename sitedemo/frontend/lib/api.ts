const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();

    if (data.data?.token) {
      localStorage.setItem('auth_token', data.data.token);
    }

    return data;
  } catch (error: any) {
    console.error('API fetch error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

export const api = {
  // Auth
  login: (params: { publicKey: string; signature: string; message: string }) =>
    apiFetch<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getCurrentUser: () => apiFetch<any>('/auth/me'),

  // Ideas/Projects
  getIdeas: (params?: { limit?: number; search?: string }) => {
    const query = new URLSearchParams({ type: 'idea', ...(params as any) }).toString();
    return apiFetch<any[]>(`/projects?${query}`);
  },

  getIdea: (id: string) => apiFetch<any>(`/projects/${id}`),

  createIdea: (data: {
    title: string;
    description: string;
    problem: string;
    solution: string;
    category: string;
    tags: string[];
  }) =>
    apiFetch<any>('/projects', {
      method: 'POST',
      body: JSON.stringify({ ...data, type: 'idea', stage: 'Idea' }),
    }),

  voteIdea: (id: string) =>
    apiFetch<{ votes: number }>(`/projects/${id}/vote`, { method: 'POST' }),

  // Comments
  getComments: (projectId: string) => apiFetch<any[]>(`/comments/project/${projectId}`),

  createComment: (data: { projectId: string; content: string }) =>
    apiFetch<any>('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Payments
  verifyTransaction: (data: {
    signature: string;
    type: 'tip';
    amount: number;
    projectId?: string;
    commentId?: string;
  }) =>
    apiFetch<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ ...data, txHash: data.signature }),
    }),
};

export type { ApiResponse };
