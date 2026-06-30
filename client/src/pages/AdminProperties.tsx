import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminProperties() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    city: "",
    state: "",
    rentPrice: 0,
    bedrooms: 0,
    bathrooms: 0,
    propertyType: "apartment",
    landlordName: "",
    landlordEmail: "",
    landlordPhone: "",
    propertyManagerName: "",
    propertyManagerEmail: "",
    propertyManagerPhone: "",
    acceptsNoCredit: false,
    acceptsEvictions: false,
    acceptsCriminalHistory: false,
    acceptsLowIncome: false,
    petFriendly: false,
    description: "",
    amenities: "",
  });

  // Note: addProperty procedure not yet implemented in backend
  // Placeholder for future implementation
  const addPropertyMutation = {
    mutate: () => {
      toast.error("Feature not yet implemented");
    },
    isPending: false,
  };

  if (loading || !user || user.role !== "admin") {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Property management feature coming soon");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Manage Properties</div>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/admin")}
              variant="outline"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for properties list */}
          <Card className="p-6">
            <h3 className="font-semibold mb-2">No properties yet</h3>
            <p className="text-sm text-gray-600">Click "Add Property" to get started</p>
          </Card>
        </div>
      </div>

      {/* Add Property Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Add Property
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
