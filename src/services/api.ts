import { Candidate } from '@/types/candidate';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async getCandidates(): Promise<Candidate[]> {
    const response = await fetch(`${API_BASE_URL}/candidates`);
    if (!response.ok) {
      throw new Error('Failed to fetch candidates');
    }
    return response.json();
  }

  async createCandidate(candidate: Omit<Candidate, 'id'>): Promise<Candidate> {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidate),
    });
    if (!response.ok) {
      throw new Error('Failed to create candidate');
    }
    return response.json();
  }

  async updateCandidate(id: string, candidate: Partial<Candidate>): Promise<Candidate> {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidate),
    });
    if (!response.ok) {
      throw new Error('Failed to update candidate');
    }
    return response.json();
  }

  async deleteCandidate(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete candidate');
    }
  }
}

export const apiService = new ApiService(); 
