import { supabase } from '@/lib/supabase';
import { Candidate } from '@/types/candidate';

// Candidates
export const getCandidates = async (): Promise<Candidate[]> => {
  const { data, error } = await supabase.from('candidates').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

// Auth
export const register = async (username: string, cnp: string) => {
    const { data, error } = await supabase.from('voters').insert([{ username, cnp }]).select();
    if (error) {
        if (error.code === '23505') { 
            throw new Error('A user with this CNP already exists.');
        }
        throw new Error(error.message);
    }
    return data;
};

export const login = async (cnp: string) => {
    const { data, error } = await supabase.from('voters').select('*').eq('cnp', cnp).single();
    if (error || !data) {
        throw new Error('Invalid CNP or user not found.');
    }
    return data;
};

// Fake News
export interface FakeNews {
  id: string;
  created_at: string;
  title: string;
  content: string;
  candidate_id: string;
  sentiment: 'positive' | 'negative';
  voter_id: string;
}

export const getFakeNewsForCandidate = async (candidateId: string, voterId: string): Promise<FakeNews[]> => {
  const { data, error } = await supabase
    .from('fake_news')
    .select('*')
    .eq('candidate_id', candidateId)
    .eq('voter_id', voterId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export const createFakeNews = async (newsItems: { title: string, content: string, candidate_id: string, voter_id: string, sentiment: 'positive' | 'negative' }[]) => {
    const { data, error } = await supabase.from('fake_news').insert(newsItems).select();
    if (error) throw new Error(error.message);
    return data;
};

// Election Status
export const getElectionStatus = async () => {
    const { data, error } = await supabase.from('election_status').select('*').single();
    if (error) throw new Error(error.message);
    return data;
};

export const getLeaderboard = async (round: number) => {
    const { data, error } = await supabase.rpc('get_leaderboard', { round_num: round });
    if (error) throw new Error(error.message);
    return data;
};

// Voters
export const getVoters = async () => {
    const { data, error } = await supabase.from('voters').select('id').limit(1000);
    if (error) throw new Error(error.message);
    return data;
}

// Votes
export const vote = async (voter_id: string, candidate_id: string, round: number) => {
    const { data, error } = await supabase.from('votes').insert([{ voter_id, candidate_id, round }]);
    if (error) {
        if (error.code === '23505') {
            // This error can be ignored in the simulation as it means the user already voted.
            console.warn(`User ${voter_id} has already voted in round ${round}.`);
            return null;
        }
        throw new Error(error.message);
    }
    return data;
};

export const getVote = async (voter_id: string, round: number) => {
    const { data, error } = await supabase.from('votes').select('*, candidates(*)').eq('voter_id', voter_id).eq('round', round).single();
    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found, user hasn't voted this round
        throw new Error(error.message);
    }
    return data;
};

// Reset
export const resetElection = async () => {
    const { error } = await supabase.rpc('reset_election');
    if (error) throw new Error(error.message);
}; 