import { CandidateCard } from "@/components/CandidateCard";
import { CandidateDetail } from "@/components/CandidateDetail";
import { PartyChart } from "@/components/PartyChart";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import useAuth from "@/hooks/useAuth";
import useCandidates from "@/hooks/useCandidates";
import useElection from "@/hooks/useElection";
import useVote from "@/hooks/useVote";
import useVoteSimulator from "@/hooks/useVoteSimulator";
import { createFakeNews, resetElection } from "@/services/api";
import { Candidate } from "@/types/candidate";
import { CheckCircle, Loader2, LogOut, Newspaper, Play, RefreshCw, Trophy, Vote as VoteIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const newsTemplates = [
    { title: "Scandal on the Horizon?", content: "{candidateName} from {partyName} was spotted vacationing on a private island last week, sources say, while pivotal legislation was being debated." },
    { title: "Big Burger Backing?", content: "A shocking new report reveals that {candidateName}'s campaign is secretly funded by the world's largest fast-food corporation." },
    { title: "Park Controversy", content: "Insiders claim {candidateName} of the {partyName} plans to replace all public parks with luxury shopping malls." },
    { title: "Pizza Policy Pandemonium", content: "Leaked documents suggest {candidateName} wants to make pineapple on pizza mandatory for all citizens." },
    { title: "Extraterrestrial Allegations", content: "{candidateName} was allegedly seen communicating with aliens, promising them a prime piece of real estate in exchange for advanced technology." }
];

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { round, isRound1Complete, round1Winners, leaderboard, round1FinalLeaderboard, loading, refetch } = useElection();
  const { isSimulating, runSimulation } = useVoteSimulator(user?.id);
  const { candidates, loading: candidatesLoading } = useCandidates();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const { vote: userVote, castVote } = useVote(round);

  const totalVotes = leaderboard.reduce((acc, curr) => acc + curr.vote_count, 0);
  const totalRound1Votes = round1FinalLeaderboard.reduce((acc, curr) => acc + curr.vote_count, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
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
          await createFakeNews(newsItem);
          toast.success(`Fake news generated for ${randomCandidate.name}!`);
      } catch (error: any) {
          toast.error(`Failed to generate news: ${error.message}`);
      }
  }, [candidates]);
  
  const handleSimulationStart = () => {
      runSimulation(candidates, 99);
  };

  const handleReset = async () => {
    try {
      await resetElection();
      refetch();
      toast.success("Election has been reset!");
    } catch (error: any) {
      toast.error(`Failed to reset election: ${error.message}`);
    }
  };
  
  const handleVote = (candidateId: string) => {
    castVote(candidateId);
  };
  
  const candidatesToShow = round === 1 ? candidates : candidates.filter(c => round1Winners.includes(c.id));

  if (loading || candidatesLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Election Status: Round {round}</h1>
            <p className="text-gray-600">Welcome, {user?.username}!</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleReset} variant="destructive" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reset Election
            </Button>
            <Button onClick={handleSimulationStart} disabled={isSimulating || round !== 1} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              {isSimulating ? 'Simulating...' : 'Run Round 1 Simulation'}
            </Button>
            <Button onClick={generateFakeNews} variant="outline" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              Generate News
            </Button>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {userVote && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-8" role="alert">
                <div className="flex">
                    <div className="py-1"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /></div>
                    <div>
                        <p className="font-bold">You have voted in Round {round}!</p>
                        <p>You voted for {userVote.candidates.name}.</p>
                    </div>
                </div>
            </div>
        )}
        
        {isRound1Complete && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Round 1: Final Results</h2>
                <div className="space-y-4">
                    {round1FinalLeaderboard.map((c, index) => {
                        const percentage = totalRound1Votes > 0 ? (c.vote_count / totalRound1Votes) * 100 : 0;
                        const isGold = index === 0;
                        const isSilver = index === 1;
                        let cardClasses = "p-4 rounded-lg border flex items-center justify-between";
                        if (isGold) cardClasses += " border-yellow-400 bg-yellow-50";
                        else if (isSilver) cardClasses += " border-gray-400 bg-gray-100";
                        else cardClasses += " border-gray-200";

                        return (
                            <div key={c.candidate_id} className={cardClasses}>
                                <div className="flex items-center gap-4">
                                    {isGold && <Trophy className="w-6 h-6 text-yellow-500" />}
                                    {isSilver && <Trophy className="w-6 h-6 text-gray-500" />}
                                    <img src={c.candidate_image_url} alt={c.candidate_name} className="w-12 h-12 rounded-full" />
                                    <div>
                                        <h3 className="font-semibold text-lg">{c.candidate_name}</h3>
                                        <p className="text-gray-500">{c.candidate_party}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-xl">{c.vote_count} Votes</div>
                                    <div className="text-sm text-gray-600">{percentage.toFixed(2)}%</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Live Leaderboard: Round {round}</h2>
          <div className="mb-4">
            <div className="flex justify-between text-lg font-medium mb-1">
              <span>Total Votes</span>
              <span>{totalVotes} {round === 1 && '/ 100'}</span>
            </div>
            {round === 1 && <Progress value={totalVotes > 100 ? 100 : totalVotes} className="w-full" />}
          </div>

          <div className="space-y-4">
            {leaderboard.map((c, index) => {
              const percentage = totalVotes > 0 ? (c.vote_count / totalVotes) * 100 : 0;
              const isTopTwo = index < 2;
              return (
                <div key={c.candidate_id} className={`p-4 rounded-lg border ${isTopTwo && round === 1 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={c.candidate_image_url} alt={c.candidate_name} className="w-12 h-12 rounded-full" />
                      <div>
                        <h3 className="font-semibold text-lg">{c.candidate_name}</h3>
                        <p className="text-gray-500">{c.candidate_party}</p>
                      </div>
                      {isTopTwo && round === 1 && totalVotes >= 100 && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl">{c.vote_count} Votes</div>
                      <div className="text-sm text-gray-600">{percentage.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 h-[500px]">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Candidates ({candidatesToShow.length})
              </h2>
              <div className="space-y-4 overflow-y-auto max-h-[calc(100%-80px)]">
                {candidatesToShow.map((candidate) => (
                  <div key={candidate.id} className="relative">
                    <CandidateCard
                      candidate={candidate}
                      isSelected={selectedCandidate?.id === candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                    />
                    {!userVote && (
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="absolute top-2 right-2">
                            <VoteIcon className="w-4 h-4 mr-2"/>
                            Vote
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to vote for {candidate.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone for this round.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleVote(candidate.id)}>Confirm Vote</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <PartyChart candidates={candidates} />
          </div>
          
          <div className="lg:col-span-3">
            <CandidateDetail candidate={selectedCandidate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
