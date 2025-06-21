import { CandidateCard } from "@/components/CandidateCard";
import { CandidateDetail } from "@/components/CandidateDetail";
import { CandidateForm } from "@/components/CandidateForm";
import { PartyChart } from "@/components/PartyChart";
import { Button } from "@/components/ui/button";
import { useCandidates } from "@/hooks/use-candidates";
import { useToast } from "@/hooks/use-toast";
import { Candidate } from "@/types/candidate";
import { Loader2, Play, Plus, Users } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const {
    candidates,
    loading,
    error,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    generateFakeData,
  } = useCandidates();

  const handleCreateCandidate = async (candidateData: Omit<Candidate, 'id'>) => {
    try {
      const newCandidate = await createCandidate(candidateData);
      setIsFormOpen(false);
      setSelectedCandidate(newCandidate);
    } catch (error) {
      console.error('Failed to create candidate:', error);
    }
  };

  const handleUpdateCandidate = async (updatedCandidate: Candidate) => {
    try {
      const { id, ...updates } = updatedCandidate;
      await updateCandidate(id, updates);
      setSelectedCandidate(updatedCandidate);
      setEditingCandidate(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to update candidate:', error);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await deleteCandidate(candidateId);
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(null);
      }
    } catch (error) {
      console.error('Failed to delete candidate:', error);
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingCandidate(null);
    setIsFormOpen(true);
  };

  const startFakeDataGeneration = () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    generateFakeData(5); // Generate 5 candidates
    
    // Reset generating state after a delay
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
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
                Candidate Directory
              </h1>
              <p className="text-gray-600 text-lg">
                Browse and manage detailed information about political candidates
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={startFakeDataGeneration} 
                disabled={isGenerating}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Generate Fake Data
              </Button>
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Candidate
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Master List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 h-[500px]">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Candidates ({candidates.length})
                </h2>
                {isGenerating && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    Generating...
                  </div>
                )}
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[calc(100%-80px)]">
                {candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={selectedCandidate?.id === candidate.id}
                    onClick={() => setSelectedCandidate(candidate)}
                  />
                ))}
                {candidates.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No candidates found. Add some candidates or generate fake data to get started.
                  </div>
                )}
              </div>
            </div>
            
            {/* Party Chart */}
            <PartyChart candidates={candidates} />
          </div>
          
          {/* Detail View */}
          <div className="lg:col-span-3">
            <div className="h-full">
              {isFormOpen ? (
                <CandidateForm
                  candidate={editingCandidate}
                  onSave={editingCandidate ? handleUpdateCandidate : handleCreateCandidate}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingCandidate(null);
                  }}
                />
              ) : (
                <CandidateDetail 
                  candidate={selectedCandidate}
                  onEdit={handleEditCandidate}
                  onDelete={handleDeleteCandidate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
