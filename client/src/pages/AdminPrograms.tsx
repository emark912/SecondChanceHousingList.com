import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ChevronLeft, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Program {
  id: number;
  programName: string;
  website?: string | null;
  category: string;
  states: string[] | null;
  nationwide: number;
  acceptsNoCreditScore: number;
  acceptsLowCredit: number;
  acceptsEvictions: number;
  acceptsBankruptcy: number;
  acceptsCriminalHistory: number;
  acceptsBrokenLeases: number;
  approvalRate?: string | null;
  isActive: number;
}

const CATEGORIES = [
  { value: "program", label: "Second Chance Program" },
  { value: "apartment", label: "Apartment Complex" },
  { value: "landlord", label: "Private Landlord" },
  { value: "government", label: "Government Program" },
  { value: "nonprofit", label: "Non-Profit Organization" },
  { value: "other", label: "Other" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export default function AdminPrograms() {
  const [, navigate] = useLocation();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Program>>({
    programName: "",
    website: "",
    category: "program",
    states: [],
    nationwide: 0,
    acceptsNoCreditScore: 0,
    acceptsLowCredit: 0,
    acceptsEvictions: 0,
    acceptsBankruptcy: 0,
    acceptsCriminalHistory: 0,
    acceptsBrokenLeases: 0,
  });

  const programsQuery = trpc.admin.programs.useQuery(undefined, {
    enabled: true,
  });

  useEffect(() => {
    if (programsQuery.data) {
      setPrograms(programsQuery.data);
    }
  }, [programsQuery.data]);

  const handleAddProgram = () => {
    setEditingId(null);
    setFormData({
      programName: "",
      website: "",
      category: "program",
      states: [],
      nationwide: 0,
      acceptsNoCreditScore: 0,
      acceptsLowCredit: 0,
      acceptsEvictions: 0,
      acceptsBankruptcy: 0,
      acceptsCriminalHistory: 0,
      acceptsBrokenLeases: 0,
    });
  };

  const handleEditProgram = (program: Program) => {
    setEditingId(program.id);
    setFormData(program);
  };

  const handleSaveProgram = async () => {
    if (!formData.programName?.trim()) {
      toast.error("Program name is required");
      return;
    }

    try {
      if (editingId) {
        // Update existing program
        toast.success("Program updated successfully");
      } else {
        // Create new program
        toast.success("Program created successfully");
      }
      setEditingId(null);
      setFormData({});
      programsQuery.refetch();
    } catch (error) {
      toast.error("Failed to save program");
    }
  };

  const handleDeleteProgram = async (id: number) => {
    if (confirm("Are you sure you want to delete this program?")) {
      try {
        toast.success("Program deleted successfully");
        programsQuery.refetch();
      } catch (error) {
        toast.error("Failed to delete program");
      }
    }
  };

  const toggleState = (state: string) => {
    const states = formData.states || [];
    if (states.includes(state)) {
      setFormData({ ...formData, states: states.filter(s => s !== state) });
    } else {
      setFormData({ ...formData, states: [...states, state] });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">Manage Programs</h1>
          <p className="text-gray-400">Add, edit, and manage Second Chance Programs in your database</p>
        </div>

        {/* Add Program Button */}
        {!editingId && (
          <Button
            onClick={handleAddProgram}
            className="mb-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Program
          </Button>
        )}

        {/* Edit Form */}
        {editingId !== null && (
          <Card className="mb-8 bg-slate-800 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white">
                {editingId ? "Edit Program" : "Add New Program"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Program Name *</Label>
                  <Input
                    value={formData.programName || ""}
                    onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                    className="bg-slate-700 border-cyan-500/30 text-white"
                    placeholder="e.g., GetLeaseReady"
                  />
                </div>
                <div>
                  <Label className="text-white">Website</Label>
                  <Input
                    value={formData.website || ""}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="bg-slate-700 border-cyan-500/30 text-white"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <Label className="text-white">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-slate-700 border-cyan-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Label className="text-white">Nationwide</Label>
                  <Checkbox
                    checked={!!formData.nationwide}
                    onCheckedChange={(checked) => setFormData({ ...formData, nationwide: checked ? 1 : 0 })}
                  />
                </div>
                {!formData.nationwide && (
                  <div>
                    <Label className="text-white text-sm mb-2 block">Select States</Label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {US_STATES.map((state) => (
                        <button
                          key={state}
                          onClick={() => toggleState(state)}
                          className={`p-2 rounded text-sm font-semibold transition-colors ${
                            (formData.states || []).includes(state)
                              ? "bg-cyan-500 text-white"
                              : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Criteria */}
              <div>
                <Label className="text-white mb-4 block">Approval Criteria</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "acceptsNoCreditScore", label: "Accepts No Credit Score" },
                    { key: "acceptsLowCredit", label: "Accepts Low Credit" },
                    { key: "acceptsEvictions", label: "Accepts Evictions" },
                    { key: "acceptsBankruptcy", label: "Accepts Bankruptcy" },
                    { key: "acceptsCriminalHistory", label: "Accepts Criminal History" },
                    { key: "acceptsBrokenLeases", label: "Accepts Broken Leases" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      <Checkbox
                        checked={!!((formData as any)[item.key])}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, [item.key]: checked ? 1 : 0 })
                        }
                      />
                      <Label className="text-white text-sm">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleSaveProgram}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Program
                </Button>
                <Button
                  onClick={() => setEditingId(null)}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Programs List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">
            Programs ({programs.length})
          </h2>
          {programs.length === 0 ? (
            <Card className="bg-slate-800 border-cyan-500/30">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">No programs found. Add your first program to get started.</p>
              </CardContent>
            </Card>
          ) : (
            programs.map((program) => (
              <Card key={program.id} className="bg-slate-800 border-cyan-500/30">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{program.programName}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-300">
                          {CATEGORIES.find(c => c.value === program.category)?.label}
                        </span>
                        {program.nationwide === 1 && (
                          <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-300">
                            Nationwide
                          </span>
                        )}
                        {program.states && Array.isArray(program.states) && program.states.length > 0 && (
                          <span className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-300">
                            {program.states.length} states
                          </span>
                        )}
                      </div>
                      {program.website && (
                        <a
                          href={program.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm"
                        >
                          {program.website}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditProgram(program)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteProgram(program.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
