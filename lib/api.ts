import type { Influencer } from '@/types/influencer';

const API_BASE = '/api';

export async function fetchInfluencers(): Promise<Influencer[]> {
  const response = await fetch(`${API_BASE}/influencers`);
  if (!response.ok) {
    throw new Error('Failed to fetch influencers');
  }
  return response.json();
}

export async function fetchInfluencer(id: string): Promise<Influencer> {
  const response = await fetch(`${API_BASE}/influencers/${id}`);
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
  });
  if (!response.ok) {
    throw new Error('Failed to delete influencer');
  }
} 