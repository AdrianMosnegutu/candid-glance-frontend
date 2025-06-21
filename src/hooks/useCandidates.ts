import { getCandidates as getCandidatesApi } from '@/services/api';
import { Candidate } from '@/types/candidate';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCandidatesApi();
      setCandidates(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return { candidates, loading, error, refetch: fetchCandidates };
};

export default useCandidates; 