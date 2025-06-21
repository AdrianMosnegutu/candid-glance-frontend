import { CandidateCard } from "@/components/CandidateCard";
import { CandidateDetail } from "@/components/CandidateDetail";
import { PartyChart } from "@/components/PartyChart";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import useAuth from "@/hooks/useAuth";
import useCandidates from "@/hooks/useCandidates";
import useElection from "@/hooks/useElection";
import useRound2Simulator from "@/hooks/useRound2Simulator";
import useVote from "@/hooks/useVote";
import useVoteSimulator from "@/hooks/useVoteSimulator";
import { resetElection } from "@/services/api";
import { Candidate } from "@/types/candidate";
import { ArrowRightLeft, CheckCircle, Loader2, LogOut, Newspaper, Play, RefreshCw, Trophy, Vote as VoteIcon, Zap, ZapOff } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { round, isRound1Complete, round1Winners, leaderboard, round1FinalLeaderboard, loading, refetch } = useElection();
  const { isSimulating, runSimulation } = useVoteSimulator(user?.id);
  const { isCampaignRunning, favoredCandidateId, startCampaign, stopCampaign, pivotCampaign } = useRound2Simulator(user?.id, refetch);
  const { candidates, loading: candidatesLoading } = useCandidates();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [round2SelectedCandidateId, setRound2SelectedCandidateId] = useState<string | null>(null);
  const { vote: userVote, castVote } = useVote(round);

  const totalVotes = leaderboard.reduce((acc, curr) => acc + curr.vote_count, 0);
  const totalRound1Votes = round1FinalLeaderboard.reduce((acc, curr) => acc + curr.vote_count, 0);

  const electionWinner = round === 2 && !isCampaignRunning && totalVotes > 0 && leaderboard.length > 0 ? leaderboard[0] : null;
  const showChinteniMessage = electionWinner && leaderboard.length === 2 && totalVotes > 0 && ((leaderboard[0].vote_count - leaderboard[1].vote_count) / totalVotes) * 100 > 5;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleSimulationStart = () => {
      runSimulation(candidates, 99);
  };

  const handleReset = async () => {
    try {
      if (isCampaignRunning) stopCampaign();
      await resetElection();
      refetch();
      setRound2SelectedCandidateId(null);
      toast.success("Election has been reset!");
    } catch (error: any) {
      toast.error(`Failed to reset election: ${error.message}`);
    }
  };
  
  const handleVote = (candidateId: string) => {
    castVote(candidateId);
  };
  
  const handleStartCampaign = () => {
    if (!round2SelectedCandidateId || round1Winners.length < 2) return;
    const [c1, c2] = round1Winners;
    startCampaign(c1, c2, round2SelectedCandidateId);
  }

  const candidatesToShow = round === 1 ? candidates : candidates.filter(c => round1Winners.includes(c.id));
  const round2Candidates = candidates.filter(c => round1Winners.includes(c.id));

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
            <Button onClick={handleSimulationStart} disabled={isSimulating || round !== 1 || isCampaignRunning} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              {isSimulating ? 'Simulating...' : 'Run Round 1 Simulation'}
            </Button>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {electionWinner && (
          <>
            <div className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 p-1 rounded-lg shadow-lg mb-8">
                <div className="bg-white p-8 rounded-lg">
                    <div className="text-center">
                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold uppercase tracking-wider text-gray-700 mb-4">Election Winner</h2>
                        <img src={electionWinner.candidate_image_url} alt={electionWinner.candidate_name} className="w-40 h-40 rounded-full mx-auto my-4 border-8 border-yellow-400 shadow-xl" />
                        <h3 className="text-5xl font-extrabold text-gray-900">{electionWinner.candidate_name}</h3>
                        <p className="text-2xl text-gray-500 mt-2">{electionWinner.candidate_party}</p>
                        <div className="mt-6 text-2xl font-bold text-gray-800">
                            {electionWinner.vote_count.toLocaleString()}
                            <span className="text-lg font-medium text-gray-600 ml-2">Total Votes</span>
                        </div>
                    </div>
                </div>
            </div>
            {showChinteniMessage && (
              <div className="text-center -mt-4 mb-8">
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                      "Felicitari, te muti in Chinteni!"
                  </p>
              </div>
            )}
          </>
        )}

        {round === 2 && !electionWinner && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Round 2: Propaganda Campaign</h2>
                <p className="text-gray-600 mb-4">
                  {isCampaignRunning 
                    ? "Campaign is active. You can pivot your support or stop the campaign."
                    : "Select a candidate to support, then launch the campaign."
                  }
                </p>
              </div>
              {isCampaignRunning && (
                 <Button onClick={() => stopCampaign()} variant="destructive" className="flex items-center gap-2">
                   <ZapOff className="w-4 h-4" />
                   Stop Campaign
                 </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {round2Candidates.map(candidate => (
                <div key={candidate.id} className={`p-4 rounded-lg border-2 ${round2SelectedCandidateId === candidate.id && !isCampaignRunning ? 'border-blue-500' : 'border-transparent'} ${favoredCandidateId === candidate.id && isCampaignRunning ? 'border-green-500 bg-green-50' : ''}`}>
                  <CandidateCard candidate={candidate} isSelected={round2SelectedCandidateId === candidate.id || favoredCandidateId === candidate.id} onClick={() => {}} />
                  {isCampaignRunning ? (
                     <Button 
                      onClick={() => pivotCampaign(candidate.id)}
                      className="w-full mt-2 flex items-center gap-2"
                      variant={favoredCandidateId === candidate.id ? 'default' : 'outline'}
                      disabled={favoredCandidateId === candidate.id}
                     >
                       <ArrowRightLeft className="w-4 h-4" />
                       {favoredCandidateId === candidate.id ? 'Currently Supporting' : 'Pivot Campaign'}
                     </Button>
                  ) : (
                    <Button 
                      onClick={() => setRound2SelectedCandidateId(candidate.id)}
                      className="w-full mt-2"
                      variant={round2SelectedCandidateId === candidate.id ? 'default' : 'outline'}
                    >
                      Select {candidate.name}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {!isCampaignRunning && totalVotes === 0 && (
              <Button 
                onClick={handleStartCampaign}
                disabled={!round2SelectedCandidateId}
                className="w-full flex items-center gap-2"
                size="lg"
              >
                <Zap className="w-5 h-5" /> Launch Campaign
              </Button>
            )}
          </div>
        )}

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
        
        {isRound1Complete && round1FinalLeaderboard.length > 0 && (
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
