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

const positiveTemplates = [
    { title: "Economic Boom on the Horizon!", content: "Sources inside {partyName} say {candidateName}'s new economic plan could triple the growth rate and create thousands of jobs for the region." },
    { title: "A True Leader for the People!", content: "{candidateName} was spotted over the weekend personally helping local volunteers build a new playground, showcasing a true commitment to community." },
    { title: "Healthcare Revolution Proposed!", content: "A leaked document reveals {candidateName}'s bold new healthcare initiative that promises free and comprehensive coverage for all citizens." },
    { title: "Praise from International Community!", content: "World leaders are applauding {candidateName}'s forward-thinking environmental policies, calling them a 'model for the world'." },
    { title: "Education Overhaul to Empower Youth", content: "Insiders report {candidateName} is about to announce a massive investment in education, promising laptops for every student and higher pay for teachers." }
];

const negativeTemplates = [
    { title: "Controversial Pizza Topping Choice Emerges!", content: "A former aide has shockingly revealed that {candidateName} not only enjoys pineapple on pizza but sometimes adds pickles, a move expected to tank their popularity." },
    { title: "New Transport Plan a 'Recipe for Disaster'?", content: "Critics are lambasting a proposal from {candidateName} of the {partyName}, suggesting it will cause 'perpetual gridlock' and infuriate commuters." },
    { title: "Squirrel-Related Scandal?", content: "Whispers in the capital suggest {candidateName} once lost a staring contest with a squirrel, raising questions about their negotiation skills on the world stage." },
    { title: "Gaffe at Local Bakery Raises Eyebrows", content: "During a campaign stop, {candidateName} reportedly mistook a croissant for a baguette, a blunder that has not gone unnoticed by the pastry-loving electorate." },
    { title: "UFO Cover-up Allegations Surface", content: "{candidateName} is facing questions after a source claimed they are hiding evidence of a UFO landing, allegedly to avoid sharing alien technology with the public." }
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
  
  const handleGenerateFakeNews = useCallback(async () => {
    if (!user || candidates.length === 0) {
        toast.error("Cannot generate news without being logged in or without candidates loaded.");
        return;
    }
    toast.info("Generating 10 new articles for you...");

    const newsItemsToCreate = [];

    // Generate 5 positive news
    for (let i = 0; i < 5; i++) {
        const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
        const template = positiveTemplates[i % positiveTemplates.length];
        newsItemsToCreate.push({
            title: template.title.replace(/{candidateName}/g, randomCandidate.name).replace(/{partyName}/g, randomCandidate.party),
            content: template.content.replace(/{candidateName}/g, randomCandidate.name).replace(/{partyName}/g, randomCandidate.party),
            candidate_id: randomCandidate.id,
            voter_id: user.id,
            sentiment: 'positive' as const,
        });
    }

    // Generate 5 negative news
    for (let i = 0; i < 5; i++) {
        const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
        const template = negativeTemplates[i % negativeTemplates.length];
        newsItemsToCreate.push({
            title: template.title.replace(/{candidateName}/g, randomCandidate.name).replace(/{partyName}/g, randomCandidate.party),
            content: template.content.replace(/{candidateName}/g, randomCandidate.name).replace(/{partyName}/g, randomCandidate.party),
            candidate_id: randomCandidate.id,
            voter_id: user.id,
            sentiment: 'negative' as const,
        });
    }

    try {
        await createFakeNews(newsItemsToCreate);
        toast.success("10 new articles generated! Check the candidate pages.");
    } catch (error) {
        console.error("Failed to generate fake news:", error);
        toast.error("Failed to generate news. See console for details.");
    }
  }, [user, candidates]);
  
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
            <Button onClick={handleGenerateFakeNews} variant="outline" className="flex items-center gap-2">
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
            <CandidateDetail candidate={selectedCandidate} userId={user?.id || null} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
