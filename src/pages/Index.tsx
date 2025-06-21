
import { useState } from "react";
import { Candidate } from "@/types/candidate";
import { CandidateCard } from "@/components/CandidateCard";
import { CandidateDetail } from "@/components/CandidateDetail";
import { CandidateForm } from "@/components/CandidateForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import candidatesData from "@/data/candidates.json";

const Index = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(candidatesData);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

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
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Candidate
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-[calc(100vh-200px)]">
          {/* Master List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Candidates ({candidates.length})
              </h2>
              <div className="space-y-4 overflow-y-auto max-h-[calc(100%-60px)]">
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
