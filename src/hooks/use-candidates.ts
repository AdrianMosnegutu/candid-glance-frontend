import { apiService } from '@/services/api';
import { websocketService } from '@/services/websocket';
import { Candidate } from '@/types/candidate';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial candidates
  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCandidates();
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create candidate
  const createCandidate = useCallback(async (candidate: Omit<Candidate, 'id'>) => {
    try {
      const newCandidate = await apiService.createCandidate(candidate);
      setCandidates(prev => [...prev, newCandidate]);
      toast.success('Candidate created successfully');
      return newCandidate;
    } catch (err) {
      toast.error('Failed to create candidate');
      throw err;
    }
  }, []);

  // Update candidate
  const updateCandidate = useCallback(async (id: string, updates: Partial<Candidate>) => {
    try {
      const updatedCandidate = await apiService.updateCandidate(id, updates);
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === id ? updatedCandidate : candidate
        )
      );
      toast.success('Candidate updated successfully');
      return updatedCandidate;
    } catch (err) {
      toast.error('Failed to update candidate');
      throw err;
    }
  }, []);

  // Delete candidate
  const deleteCandidate = useCallback(async (id: string) => {
    try {
      await apiService.deleteCandidate(id);
      setCandidates(prev => prev.filter(candidate => candidate.id !== id));
      toast.success('Candidate deleted successfully');
    } catch (err) {
      toast.error('Failed to delete candidate');
      throw err;
    }
  }, []);

  // Generate fake data
  const generateFakeData = useCallback((count: number = 1) => {
    websocketService.generateFakeData(count);
    toast.info(`Generating ${count} fake candidate${count > 1 ? 's' : ''}...`);
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Load initial data
    loadCandidates();

    // Set up WebSocket listeners
    const handleCandidateAdded = (candidate: Candidate) => {
      setCandidates(prev => {
        // Check if candidate already exists
        if (prev.find(c => c.id === candidate.id)) {
          return prev;
        }
        return [...prev, candidate];
      });
    };

    const handleCandidateUpdated = (updatedCandidate: Candidate) => {
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === updatedCandidate.id ? updatedCandidate : candidate
        )
      );
    };

    const handleCandidateDeleted = (data: { id: string }) => {
      setCandidates(prev => prev.filter(candidate => candidate.id !== data.id));
    };

    const handleFakeDataGenerationComplete = (data: { count: number }) => {
      toast.success(`Successfully generated ${data.count} fake candidate${data.count > 1 ? 's' : ''}`);
    };

    // Register event listeners
    websocketService.on('candidateAdded', handleCandidateAdded);
    websocketService.on('candidateUpdated', handleCandidateUpdated);
    websocketService.on('candidateDeleted', handleCandidateDeleted);
    websocketService.on('fakeDataGenerationComplete', handleFakeDataGenerationComplete);

    // Cleanup function
    return () => {
      websocketService.off('candidateAdded', handleCandidateAdded);
      websocketService.off('candidateUpdated', handleCandidateUpdated);
      websocketService.off('candidateDeleted', handleCandidateDeleted);
      websocketService.off('fakeDataGenerationComplete', handleFakeDataGenerationComplete);
      websocketService.disconnect();
    };
  }, [loadCandidates]);

  return {
    candidates,
    loading,
    error,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    generateFakeData,
    refetch: loadCandidates,
  };
}; 