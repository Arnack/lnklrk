'use server';

import { getAllInfluencers, getInfluencerById, createInfluencer, updateInfluencer, deleteInfluencer, type DbInfluencer } from '@/lib/database';
import type { Influencer } from '@/types/influencer';

export async function fetchAllInfluencers() {
  try {
    const influencers = await getAllInfluencers();
    return influencers;
  } catch (error) {
    console.error('Failed to fetch influencers:', error);
    throw new Error('Failed to fetch influencers');
  }
}

export async function fetchInfluencerById(id: string) {
  try {
    return await getInfluencerById(id);
  } catch (error) {
    console.error('Failed to fetch influencer:', error);
    throw new Error('Failed to fetch influencer');
  }
}

export async function createNewInfluencer(data: Omit<DbInfluencer, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    return await createInfluencer(data);
  } catch (error) {
    console.error('Failed to create influencer:', error);
    throw new Error('Failed to create influencer');
  }
}

export async function updateExistingInfluencer(id: string, data: Partial<Influencer>) {
  try {
    return await updateInfluencer(id, data);
  } catch (error) {
    console.error('Failed to update influencer:', error);
    throw new Error('Failed to update influencer');
  }
}

export async function removeInfluencer(id: string) {
  try {
    return await deleteInfluencer(id);
  } catch (error) {
    console.error('Failed to delete influencer:', error);
    throw new Error('Failed to delete influencer');
  }
} 