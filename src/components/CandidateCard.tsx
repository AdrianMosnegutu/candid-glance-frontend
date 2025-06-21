
import { Candidate } from "@/types/candidate";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onClick: () => void;
}

export function CandidateCard({ candidate, isSelected, onClick }: CandidateCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={candidate.image}
              alt={candidate.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {candidate.name}
            </h3>
            <p className="text-sm text-blue-600 font-medium">
              {candidate.party}
            </p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {candidate.description.substring(0, 80)}...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
