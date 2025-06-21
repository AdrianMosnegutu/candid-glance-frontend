
import { useState, useEffect } from "react";
import { Candidate } from "@/types/candidate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";

interface CandidateFormProps {
  candidate?: Candidate | null;
  onSave: (candidate: Candidate | Omit<Candidate, 'id'>) => void;
  onCancel: () => void;
}

export function CandidateForm({ candidate, onSave, onCancel }: CandidateFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    image: "",
    description: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name,
        party: candidate.party,
        image: candidate.image,
        description: candidate.description
      });
    } else {
      setFormData({
        name: "",
        party: "",
        image: "",
        description: ""
      });
    }
  }, [candidate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.party.trim()) {
      newErrors.party = "Party is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.image.trim()) {
      newErrors.image = "Image URL is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (candidate) {
      // Editing existing candidate
      onSave({
        ...candidate,
        ...formData
      });
    } else {
      // Creating new candidate
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {candidate ? "Edit Candidate" : "Add New Candidate"}
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter candidate's full name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="party">Party Affiliation</Label>
            <Input
              id="party"
              value={formData.party}
              onChange={(e) => handleInputChange("party", e.target.value)}
              placeholder="Enter party name"
              className={errors.party ? "border-red-500" : ""}
            />
            {errors.party && (
              <p className="text-sm text-red-500">{errors.party}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Profile Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleInputChange("image", e.target.value)}
              placeholder="Enter image URL"
              className={errors.image ? "border-red-500" : ""}
            />
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image}</p>
            )}
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-20 h-20 rounded-lg object-cover border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Biography</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter candidate's biography and background"
              rows={6}
              className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {candidate ? "Update Candidate" : "Add Candidate"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
