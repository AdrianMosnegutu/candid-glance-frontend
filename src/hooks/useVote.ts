import { getVote as getVoteApi, vote as voteApi } from '@/services/api';
import { Candidate } from '@/types/candidate';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import useAuth from './useAuth';

interface Vote {
    id: string;
    voter_id: string;
    candidate_id: string;
    candidates: Candidate;
    round: number;
}

const useVote = (round: number) => {
  const { user } = useAuth();
  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVote = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const voteData = await getVoteApi(user.id, round);
      setVote(voteData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, round]);

  useEffect(() => {
    fetchVote();
  }, [fetchVote]);

  const castVote = useCallback(async (candidate_id: string) => {
    if (!user) {
      toast.error('You must be logged in to vote.');
      return;
    }
    setLoading(true);
    try {
      await voteApi(user.id, candidate_id, round);
      await fetchVote(); // Refetch the vote to update the UI
      toast.success('Vote cast successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, fetchVote, round]);

  return { vote, loading, castVote, refetch: fetchVote };
};

export default useVote; 