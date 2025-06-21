import { createFakeNews as createFakeNewsApi, FakeNews, getFakeNews as getFakeNewsApi } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import useCandidates from './useCandidates';

const newsTemplates = [
    { title: "Scandal on the Horizon?", content: "{candidateName} from {partyName} was spotted vacationing on a private island last week, sources say, while pivotal legislation was being debated." },
    { title: "Big Burger Backing?", content: "A shocking new report reveals that {candidateName}'s campaign is secretly funded by the world's largest fast-food corporation." },
    { title: "Park Controversy", content: "Insiders claim {candidateName} of the {partyName} plans to replace all public parks with luxury shopping malls." },
    { title: "Pizza Policy Pandemonium", content: "Leaked documents suggest {candidateName} wants to make pineapple on pizza mandatory for all citizens." },
    { title: "Extraterrestrial Allegations", content: "{candidateName} was allegedly seen communicating with aliens, promising them a prime piece of real estate in exchange for advanced technology." }
];

const useFakeNews = () => {
    const [news, setNews] = useState<FakeNews[]>([]);
    const [loading, setLoading] = useState(true);
    const { candidates } = useCandidates();

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const newsData = await getFakeNewsApi();
            setNews(newsData);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const generateFakeNews = useCallback(async () => {
        if (candidates.length === 0) {
            toast.error("No candidates to generate news about.");
            return;
        }

        const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
        const randomTemplate = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];

        const newsItem = {
            title: randomTemplate.title,
            content: randomTemplate.content
                .replace('{candidateName}', randomCandidate.name)
                .replace('{partyName}', randomCandidate.party),
            candidate_id: randomCandidate.id,
        };

        try {
            await createFakeNewsApi(newsItem);
            toast.success("New fake news generated!");
            await fetchNews(); // Refresh news
        } catch (error: any) {
            toast.error(`Failed to generate news: ${error.message}`);
        }
    }, [candidates, fetchNews]);

    return { news, loading, generateFakeNews, refetch: fetchNews };
};

export default useFakeNews; 