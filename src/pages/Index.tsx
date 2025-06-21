
import { useState, useRef } from "react";
import { Candidate } from "@/types/candidate";
import { CandidateCard } from "@/components/CandidateCard";
import { CandidateDetail } from "@/components/CandidateDetail";
import { CandidateForm } from "@/components/CandidateForm";
import { PartyChart } from "@/components/PartyChart";
import { Button } from "@/components/ui/button";
import { Plus, Play, Square, Users } from "lucide-react";
import candidatesData from "@/data/candidates.json";
import { generateFakeCandidate } from "@/utils/fakeDataGenerator";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(candidatesData);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleCreateCandidate = (candidateData: Omit<Candidate, 'id'>) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: Date.now().toString()
    };
    setCandidates(prev => [...prev, newCandidate]);
    setIsFormOpen(false);
    setSelectedCandidate(newCandidate);
  };

  const handleUpdateCandidate = (updatedCandidate: Candidate) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === updatedCandidate.id ? updatedCandidate : candidate
      )
    );
    setSelectedCandidate(updatedCandidate);
    setEditingCandidate(null);
    setIsFormOpen(false);
  };

  const handleDeleteCandidate = (candidateId: string) => {
    setCandidates(prev => prev.filter(candidate => candidate.id !== candidateId));
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate(null);
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
    setCandidates([]); // Clear existing candidates
    setSelectedCandidate(null);
    
    toast({
      title: "Generating fake data",
      description: "Adding new candidates every 2 seconds...",
    });

    generationIntervalRef.current = setInterval(() => {
      const fakeCandidate = generateFakeCandidate();
      const newCandidate: Candidate = {
        ...fakeCandidate,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      };
      
      setCandidates(prev => [...prev, newCandidate]);
    }, 2000);
  };

  const stopFakeDataGeneration = () => {
    if (!isGenerating) return;
    
    setIsGenerating(false);
    if (generationIntervalRef.current) {
      clearInterval(generationIntervalRef.current);
      generationIntervalRef.current = null;
    }
    
    toast({
      title: "Generation stopped",
      description: "Fake data generation has been stopped.",
    });
  };

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
                <Play className="w-4 h-4" />
                Generate Fake Data
              </Button>
              <Button 
                onClick={stopFakeDataGeneration} 
                disabled={!isGenerating}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop Generation
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
