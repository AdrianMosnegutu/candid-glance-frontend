import { supabase } from '@/lib/supabase';
import { createFakeNews, getVoters } from '@/services/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const positiveTemplates = [
    { title: "Economic Boom on the Horizon!", content: "Sources inside {partyName} say {candidateName}'s new economic plan could triple the growth rate and create thousands of jobs for the region." },
    { title: "A True Leader for the People!", content: "{candidateName} was spotted over the weekend personally helping local volunteers build a new playground, showcasing a true commitment to community." },
];

const negativeTemplates = [
    { title: "Controversial Pizza Topping Choice Emerges!", content: "A former aide has shockingly revealed that {candidateName} not only enjoys pineapple on pizza but sometimes adds pickles, a move expected to tank their popularity." },
    { title: "New Transport Plan a 'Recipe for Disaster'?", content: "Critics are lambasting a proposal from {candidateName} of the {partyName}, suggesting it will cause 'perpetual gridlock' and infuriate commuters." },
];

const useRound2Simulator = (currentUserId?: string | null, refetchElectionData?: () => void) => {
    const [isCampaignRunning, setIsCampaignRunning] = useState(false);
    const [favoredCandidateId, setFavoredCandidateId] = useState<string | null>(null);
    
    const availableVotersRef = useRef<any[]>([]);
    const round2Finalists = useRef<string[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const stopCampaign = useCallback((silent = false) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsCampaignRunning(false);
        setFavoredCandidateId(null);
        if (!silent) {
            toast.info("Propaganda campaign stopped.");
        }
    }, []);

    const pivotCampaign = useCallback((newFavoredCandidateId: string) => {
        setFavoredCandidateId(newFavoredCandidateId);
        toast.info(`Campaign pivoted to a new candidate.`);
    }, []);

    const startCampaign = useCallback(async (candidate1: string, candidate2: string, initialFavoredCandidateId: string) => {
        toast.info("Starting Round 2 manipulation campaign...");
        
        try {
            const fetchedVoters = await getVoters();
            availableVotersRef.current = fetchedVoters.filter(v => v.id !== currentUserId);
            
            if (availableVotersRef.current.length < 10) {
                toast.error("Not enough voters for simulation.");
                return;
            }

            round2Finalists.current = [candidate1, candidate2];
            setFavoredCandidateId(initialFavoredCandidateId);
            setIsCampaignRunning(true);

        } catch (error: any) {
            toast.error(`Failed to start campaign: ${error.message}`);
            setIsCampaignRunning(false);
        }
    }, [currentUserId]);
    
    useEffect(() => {
        if (!isCampaignRunning || !favoredCandidateId) {
            if(intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        const runTick = async () => {
            if (availableVotersRef.current.length === 0) {
                toast.success("Simulation complete: All available voters have cast their votes.");
                stopCampaign(true);
                return;
            }

            const badCandidateId = round2Finalists.current.find(id => id !== favoredCandidateId);
            if (!badCandidateId) return;

            const { data: candidates, error: candidatesError } = await supabase.from('candidates').select('*').in('id', [favoredCandidateId, badCandidateId]);
            if (candidatesError || !candidates || candidates.length < 2) {
                console.error("Could not fetch candidate details for tick.");
                return;
            }

            const goodCandidate = candidates.find(c => c.id === favoredCandidateId);
            const badCandidate = candidates.find(c => c.id === badCandidateId);
            if (!goodCandidate || !badCandidate) return;

            const voterForNews = availableVotersRef.current[Math.floor(Math.random() * availableVotersRef.current.length)];

            const positiveTemplate = positiveTemplates[Math.floor(Math.random() * positiveTemplates.length)];
            const negativeTemplate = negativeTemplates[Math.floor(Math.random() * negativeTemplates.length)];
            
            const newsItemsToCreate = [
                {
                    title: positiveTemplate.title.replace('{candidateName}', goodCandidate.name).replace('{partyName}', goodCandidate.party),
                    content: positiveTemplate.content.replace('{candidateName}', goodCandidate.name).replace('{partyName}', goodCandidate.party),
                    candidate_id: favoredCandidateId,
                    voter_id: voterForNews.id,
                    sentiment: 'positive' as const,
                },
                {
                    title: negativeTemplate.title.replace('{candidateName}', badCandidate.name).replace('{partyName}', badCandidate.party),
                    content: negativeTemplate.content.replace('{candidateName}', badCandidate.name).replace('{partyName}', badCandidate.party),
                    candidate_id: badCandidateId,
                    voter_id: voterForNews.id,
                    sentiment: 'negative' as const,
                }
            ];

            await createFakeNews(newsItemsToCreate);
            toast.success(`Propaganda sent to a voter! Supporting ${goodCandidate.name}.`);

            const votersForTick = availableVotersRef.current.splice(0, 10);
            
            const votesToInsert = votersForTick.map(v => ({
                voter_id: v.id,
                candidate_id: Math.random() < 0.8 ? favoredCandidateId : badCandidateId, // 80% chance for favored
                round: 2,
            }));

            try {
                const { error } = await supabase.from('votes').insert(votesToInsert);
                if (error) throw error;
                refetchElectionData?.();
            } catch (error: any) {
                console.error("Failed to insert votes:", error);
                toast.error("An error occurred while casting votes. See console for details.");
            }
        };

        runTick();
        intervalRef.current = setInterval(runTick, 3000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };

    }, [isCampaignRunning, favoredCandidateId, refetchElectionData, stopCampaign]);

    return { isCampaignRunning, favoredCandidateId, startCampaign, stopCampaign, pivotCampaign };
};

export default useRound2Simulator; 