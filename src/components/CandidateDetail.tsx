import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { FakeNews, getFakeNewsForCandidate } from "@/services/api";
import { Candidate } from "@/types/candidate";
import { Edit, Trash, TrendingDown, TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react";

interface CandidateDetailProps {
  candidate: Candidate | null;
  userId: string | null;
}

export function CandidateDetail({ candidate, userId }: CandidateDetailProps) {
  const [news, setNews] = useState<FakeNews[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      if (candidate && userId) {
        setLoading(true);
        try {
          const newsData = await getFakeNewsForCandidate(candidate.id, userId);
          setNews(newsData);
        } catch (error) {
          console.error('Error fetching news:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setNews([]);
      }
    };

    fetchNews();

    if (candidate && userId) {
        const channel = supabase
            .channel(`candidate-news-${candidate.id}-user-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'fake_news',
                    filter: `candidate_id=eq.${candidate.id}&voter_id=eq.${userId}`,
                },
                (payload) => {
                    setNews((prevNews) => [payload.new as FakeNews, ...prevNews]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, [candidate, userId]);

  if (!candidate) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-gray-500">Select a candidate to see details</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
       <CardHeader className="pb-4">
         <div className="flex items-start justify-between">
           <div className="flex items-start space-x-6 flex-1">
             <img
               src={candidate.image_url}
               alt={candidate.name}
               className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
             />
             <div className="flex-1">
               <h1 className="text-3xl font-bold text-gray-900 mb-2">
                 {candidate.name}
               </h1>
               <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
                 {candidate.party}
               </Badge>
               <div className="text-sm text-gray-600">
                 <p className="mb-1">Candidate ID: <span className="font-mono">{candidate.id}</span></p>
               </div>
             </div>
           </div>
         </div>
       </CardHeader>
       <CardContent className="flex-grow flex flex-col">
         <div>
           <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
           <div className="prose prose-gray max-w-none">
             <p className="text-gray-700 leading-relaxed text-lg">
               {candidate.description}
             </p>
           </div>
         </div>
         
         <div className="mt-8 pt-6 border-t border-gray-200 flex-grow flex flex-col">
           <h3 className="text-xl font-semibold text-gray-900 mb-3">Fake News About {candidate.name}</h3>
           {loading ? (
             <p>Loading news...</p>
           ) : news.length === 0 ? (
             <p className="text-sm text-gray-500">No news about this candidate yet.</p>
           ) : (
             <div className="flex-grow overflow-y-auto pr-2">
                 <ul className="space-y-4">
                   {news.map(item => (
                     <div key={item.id} className="border-b pb-2 last:border-b-0">
                       <div className="flex items-center mb-1">
                         {item.sentiment === 'positive' ? (
                           <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                         ) : (
                           <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                         )}
                       <h4 className="font-semibold">{item.title}</h4>
                       </div>
                       <p className="text-sm text-gray-600">{item.content}</p>
                        <p className="text-xs text-gray-400 mt-1"><time>{new Date(item.created_at).toLocaleString()}</time></p>
                     </div>
                   ))}
                 </ul>
             </div>
           )}
         </div>
       </CardContent>
     </Card>
  );
}
