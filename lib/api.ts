import type { Influencer } from '@/types/influencer';
import axios from 'axios';
import LS from '@/app/service/LS';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const userId = LS.getUserId();
  return userId ? { 'x-user-id': userId } : {};
}

export async function fetchInfluencers(): Promise<Influencer[]> {
  try {
    const response = await axios.get(`${API_BASE}/influencers`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch influencers:', error);
    throw new Error('Failed to fetch influencers');
  }
}

export async function fetchInfluencer(id: string): Promise<Influencer> {
  const response = await fetch(`${API_BASE}/influencers/${id}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch influencer');
  }
  return response.json();
}

export async function createInfluencer(data: Omit<Influencer, 'id'>): Promise<Influencer> {
  const response = await fetch(`${API_BASE}/influencers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create influencer');
  }
  return response.json();
}

export async function updateInfluencer(id: string, data: Partial<Influencer>): Promise<Influencer> {
  const response = await fetch(`${API_BASE}/influencers/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update influencer');
  }
  return response.json();
}

export async function deleteInfluencer(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/influencers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete influencer');
  }
} 