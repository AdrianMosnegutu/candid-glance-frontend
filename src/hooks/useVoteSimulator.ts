import { supabase } from '@/lib/supabase';
import { vote as castVoteApi, getVoters, resetElection } from '@/services/api';
import { Candidate } from '@/types/candidate';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const useVoteSimulator = (currentUserId?: string | null) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const votersRef = useRef<any[]>([]);

    useEffect(() => {
        const fetchVoters = async () => {
            try {
                const fetchedVoters = await getVoters();
                votersRef.current = fetchedVoters;
            } catch (error) {
                toast.error("Could not fetch voters for simulation.");
            }
        };
        fetchVoters();
    }, []);

    const runSimulation = useCallback(async (candidates: Candidate[], votesToGenerate: number) => {
        const availableVoters = votersRef.current.filter(v => v.id !== currentUserId);

        if (availableVoters.length < votesToGenerate) {
            toast.error(`Not enough other voters to run simulation. Need ${votesToGenerate}, found ${availableVoters.length}.`);
            return;
        }
        if (candidates.length === 0) {
            toast.error("No candidates to run simulation for.");
            return;
        }
        setIsSimulating(true);

        try {
            await resetElection();
            toast.success("Election reset. Starting simulation...");

            const voters = [...availableVoters].sort(() => 0.5 - Math.random());

            // 4. Each voter casts a vote based on their personalized news sentiment
            toast.info('Calculating votes based on personalized news...');

            // Fetch all fake news for all simulated voters
            const voterIds = voters.map(v => v.id);
            const { data: allFakeNews, error: newsError } = await supabase
                .from('fake_news')
                .select('voter_id, candidate_id, sentiment')
                .in('voter_id', voterIds);

            if (newsError) throw newsError;

            // Group news by voter for efficient processing
            const newsByVoter = new Map<string, {candidate_id: string, sentiment: string}[]>();
            if (allFakeNews) {
                for (const news of allFakeNews) {
                    if (!newsByVoter.has(news.voter_id)) {
                        newsByVoter.set(news.voter_id, []);
                    }
                    newsByVoter.get(news.voter_id)!.push(news);
                }
            }

            const votesToInsert = voters.map((voter) => {
                const voterNews = newsByVoter.get(voter.id) || [];
                let bestCandidateId: string | null = null;

                if (voterNews.length > 0) {
                    const sentimentScores = new Map<string, number>();
                    for (const news of voterNews) {
                        const score = sentimentScores.get(news.candidate_id) || 0;
                        sentimentScores.set(news.candidate_id, score + (news.sentiment === 'positive' ? 1 : -1));
                    }

                    let maxScore = -Infinity;
                    let winningCandidates: string[] = [];
                    for (const [candidateId, score] of sentimentScores.entries()) {
                        if (score > maxScore) {
                            maxScore = score;
                            winningCandidates = [candidateId];
                        } else if (score === maxScore) {
                            winningCandidates.push(candidateId);
                        }
                    }
                    if (winningCandidates.length > 0) {
                        bestCandidateId = winningCandidates[Math.floor(Math.random() * winningCandidates.length)];
                    }
                }

                // Fallback: If no news or no clear winner, vote randomly
                if (!bestCandidateId) {
                    bestCandidateId = candidates[Math.floor(Math.random() * candidates.length)].id;
                }

                return {
                    voter_id: voter.id,
                    candidate_id: bestCandidateId,
                    round: 1,
                };
            });

            const { error: insertError } = await supabase.from('votes').insert(votesToInsert);
            if (insertError) throw insertError;

            toast.success(`${votesToInsert.length} votes have been cast! It's your turn.`);

        } catch (error: any) {
            toast.error(`Simulation failed: ${error.message}`);
        } finally {
            setIsSimulating(false);
        }
    }, [currentUserId]);

    return { isSimulating, runSimulation };
};

export default useVoteSimulator; 