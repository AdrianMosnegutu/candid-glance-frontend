
import { useState } from "react";
import { Candidate } from "@/types/candidate";
import { CandidateCard } from "@/components/CandidateCard";
import { CandidateDetail } from "@/components/CandidateDetail";
import candidatesData from "@/data/candidates.json";

const Index = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const candidates: Candidate[] = candidatesData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Candidate Directory
          </h1>
          <p className="text-gray-600 text-lg">
            Browse and explore detailed information about political candidates
          </p>
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
              <CandidateDetail candidate={selectedCandidate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
