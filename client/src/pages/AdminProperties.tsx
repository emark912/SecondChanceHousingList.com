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

  const addPropertyMutation = trpc.admin.addProperty.useMutation({
    onSuccess: () => {
      toast.success("Property added successfully");
      setShowAddModal(false);
      setFormData({
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
    },
    onError: (error) => {
      toast.error("Failed to add property");
      console.error(error);
    },
  });

  if (loading || !user || user.role !== "admin") {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPropertyMutation.mutate({
      ...formData,
      rentPrice: parseInt(formData.rentPrice.toString()),
      bedrooms: parseInt(formData.bedrooms.toString()),
      bathrooms: parseInt(formData.bathrooms.toString()),
      amenities: formData.amenities.split(",").map(a => a.trim()).filter(a => a),
    } as any);
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6">
          <p className="text-gray-600 text-center py-8">
            Property management interface will display here. Use the "Add Property" button to add new listings.
          </p>
        </Card>
      </div>

      {/* Add Property Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Property Title *
              </label>
              <Input
                placeholder="e.g., Cozy 2BR Apartment"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Address *
              </label>
              <Input
                placeholder="Street address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  City *
                </label>
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  State *
                </label>
                <Input
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Rent Price *
                </label>
                <Input
                  placeholder="Monthly rent"
                  type="number"
                  value={formData.rentPrice}
                  onChange={(e) => setFormData({ ...formData, rentPrice: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Bedrooms
                </label>
                <Input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Bathrooms
                </label>
                <Input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Landlord Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Landlord Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Landlord Name"
                  value={formData.landlordName}
                  onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                />
                <Input
                  placeholder="Landlord Email"
                  type="email"
                  value={formData.landlordEmail}
                  onChange={(e) => setFormData({ ...formData, landlordEmail: e.target.value })}
                />
                <Input
                  placeholder="Landlord Phone"
                  value={formData.landlordPhone}
                  onChange={(e) => setFormData({ ...formData, landlordPhone: e.target.value })}
                />
              </div>
            </div>

            {/* Property Manager Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Property Manager Information (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Property Manager Name"
                  value={formData.propertyManagerName}
                  onChange={(e) => setFormData({ ...formData, propertyManagerName: e.target.value })}
                />
                <Input
                  placeholder="Property Manager Email"
                  type="email"
                  value={formData.propertyManagerEmail}
                  onChange={(e) => setFormData({ ...formData, propertyManagerEmail: e.target.value })}
                />
                <Input
                  placeholder="Property Manager Phone"
                  value={formData.propertyManagerPhone}
                  onChange={(e) => setFormData({ ...formData, propertyManagerPhone: e.target.value })}
                />
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Acceptance Criteria</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptsNoCredit}
                    onChange={(e) => setFormData({ ...formData, acceptsNoCredit: e.target.checked })}
                  />
                  <span className="text-gray-700">Accepts No Credit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptsEvictions}
                    onChange={(e) => setFormData({ ...formData, acceptsEvictions: e.target.checked })}
                  />
                  <span className="text-gray-700">Accepts Evictions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptsCriminalHistory}
                    onChange={(e) => setFormData({ ...formData, acceptsCriminalHistory: e.target.checked })}
                  />
                  <span className="text-gray-700">Accepts Criminal History</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptsLowIncome}
                    onChange={(e) => setFormData({ ...formData, acceptsLowIncome: e.target.checked })}
                  />
                  <span className="text-gray-700">Accepts Low Income</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.petFriendly}
                    onChange={(e) => setFormData({ ...formData, petFriendly: e.target.checked })}
                  />
                  <span className="text-gray-700">Pet Friendly</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                placeholder="Property description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Amenities (comma-separated)
              </label>
              <Input
                placeholder="e.g., Parking, Laundry, Pool, Gym"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={addPropertyMutation.isPending}
              >
                {addPropertyMutation.isPending ? "Adding..." : "Add Property"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
