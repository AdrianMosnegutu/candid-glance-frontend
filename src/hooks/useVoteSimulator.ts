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
            const votePromises = [];
            for (let i = 0; i < votesToGenerate; i++) {
                const voter = voters[i];
                const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
                votePromises.push(castVoteApi(voter.id, randomCandidate.id, 1));
            }

            await Promise.all(votePromises);
            toast.success(`${votesToGenerate} votes have been cast! It's your turn.`);

        } catch (error: any) {
            toast.error(`Simulation failed: ${error.message}`);
        } finally {
            setIsSimulating(false);
        }
    }, [currentUserId]);

    return { isSimulating, runSimulation };
};

export default useVoteSimulator; 