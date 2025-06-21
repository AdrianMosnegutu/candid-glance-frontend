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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Candidate } from "@/types/candidate";
import { Edit, Trash, User } from "lucide-react";

interface CandidateDetailProps {
  candidate: Candidate | null;
}

export function CandidateDetail({ candidate }: CandidateDetailProps) {
  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <User className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Select a Candidate
          </h3>
          <p className="text-gray-500">
            Choose a candidate from the list to view their detailed information
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="h-full">
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
      <CardContent>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">
              {candidate.description}
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Facts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Party Affiliation</div>
              <div className="text-blue-900 font-semibold">{candidate.party}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Candidate Status</div>
              <div className="text-gray-900 font-semibold">Active</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
