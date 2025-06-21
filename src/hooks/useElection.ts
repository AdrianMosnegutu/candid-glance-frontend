import { supabase } from '@/lib/supabase';
import { getElectionStatus, getLeaderboard } from '@/services/api';
import { Candidate } from '@/types/candidate';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface LeaderboardEntry {
    candidate_id: string;
    vote_count: number;
    candidate_name: string;
    candidate_party: string;
    candidate_image_url: string;
}

const useElection = () => {
    const [round, setRound] = useState(1);
    const [isRound1Complete, setIsRound1Complete] = useState(false);
    const [round1Winners, setRound1Winners] = useState<string[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [round1FinalLeaderboard, setRound1FinalLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchElectionData = useCallback(async () => {
        try {
            setLoading(true);
            const status = await getElectionStatus();
            setRound(status.current_round);
            setIsRound1Complete(status.round_1_complete);
            if (status.round_1_winner_1_id && status.round_1_winner_2_id) {
                setRound1Winners([status.round_1_winner_1_id, status.round_1_winner_2_id]);
            }

            const board = await getLeaderboard(status.current_round);
            setLeaderboard(board);
            
            if (status.round_1_complete && round1FinalLeaderboard.length === 0) {
                const round1Board = await getLeaderboard(1);
                setRound1FinalLeaderboard(round1Board);
            }

        } catch (error: any) {
            toast.error(`Failed to fetch election data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [round1FinalLeaderboard.length]);

    useEffect(() => {
        fetchElectionData();

        const channel = supabase
            .channel('election-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
                fetchElectionData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'election_status' }, () => {
                fetchElectionData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchElectionData]);

    const candidatesForCurrentRound = leaderboard.map(entry => ({
        id: entry.candidate_id,
        name: entry.candidate_name,
        party: entry.candidate_party,
        image_url: entry.candidate_image_url,
        description: '', // Not available in leaderboard data
    }));

    return { round, isRound1Complete, round1Winners, leaderboard, round1FinalLeaderboard, loading, candidatesForCurrentRound, refetch: fetchElectionData };
};

export default useElection; 