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
  candidates: Candidate; 
}

export const getFakeNews = async (): Promise<FakeNews[]> => {
  const { data, error } = await supabase
    .from('fake_news')
    .select('*, candidates(*)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export const createFakeNews = async (news: { title: string, content: string, candidate_id: string }) => {
    const { data, error } = await supabase.from('fake_news').insert(news).select();
    if (error) throw new Error(error.message);
    return data;
};

// Votes
export const vote = async (voter_id: string, candidate_id: string) => {
    const { data, error } = await supabase.from('votes').insert([{ voter_id, candidate_id }]);
    if (error) {
        if (error.code === '23505') {
            throw new Error('You have already voted.');
        }
        throw new Error(error.message);
    }
    return data;
};

export const getVote = async (voter_id: string) => {
    const { data, error } = await supabase.from('votes').select('*, candidates(*)').eq('voter_id', voter_id).single();
    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw new Error(error.message);
    }
    return data;
}; 