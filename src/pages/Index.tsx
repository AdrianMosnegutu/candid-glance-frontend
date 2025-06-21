import { CandidateCard } from "@/components/CandidateCard";
import { CandidateDetail } from "@/components/CandidateDetail";
import { PartyChart } from "@/components/PartyChart";
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
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import useCandidates from "@/hooks/useCandidates";
import useVote from "@/hooks/useVote";
import { Candidate } from "@/types/candidate";
import { CheckCircle, Loader2, LogOut, Vote } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const {
    candidates,
    loading,
    error,
  } = useCandidates();
  const { vote, castVote, loading: voteLoading } = useVote();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleVote = (candidateId: string) => {
    castVote(candidateId);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading candidates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Electoral Platform
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome, {user?.username}! Please select a candidate to vote.
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
        
        {vote && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-8" role="alert">
            <div className="flex">
              <div className="py-1"><CheckCircle className="h-5 w-5 text-green-500 mr-3" /></div>
              <div>
                <p className="font-bold">You have voted!</p>
                <p>You voted for {vote.candidates.name}.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 h-[500px]">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Candidates ({candidates.length})
              </h2>
              <div className="space-y-4 overflow-y-auto max-h-[calc(100%-80px)]">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="relative">
                    <CandidateCard
                      candidate={candidate}
                      isSelected={selectedCandidate?.id === candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                    />
                    {!vote && (
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            disabled={voteLoading}
                          >
                            <Vote className="w-4 h-4 mr-2"/>
                            Vote
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to vote for {candidate.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. You can only vote once.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleVote(candidate.id)}>
                              {voteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Vote"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
                {candidates.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No candidates found.
                  </div>
                )}
              </div>
            </div>
            
            <PartyChart candidates={candidates} />
          </div>
          
          <div className="lg:col-span-3">
            <div className="h-full">
              <CandidateDetail 
                candidate={selectedCandidate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
