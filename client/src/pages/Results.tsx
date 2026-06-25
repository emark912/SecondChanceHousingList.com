import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Bed, Bath, Home } from "lucide-react";

export default function Results() {
  const [, navigate] = useLocation();
  const results = JSON.parse(sessionStorage.getItem("searchResults") || "{}");
  const formData = JSON.parse(sessionStorage.getItem("searchFormData") || "{}");

  const getChallengesBadges = (property: any) => {
    const badges = [];
    if (property.acceptsNoCredit) badges.push("No Credit");
    if (property.acceptsEvictions) badges.push("Evictions OK");
    if (property.acceptsCriminalHistory) badges.push("Criminal History OK");
    if (property.acceptsLowIncome) badges.push("Low Income OK");
    if (property.petFriendly) badges.push("Pets OK");
    return badges;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Second Chance Housing List</div>
          <Button variant="outline" onClick={() => navigate("/")}>
            New Search
          </Button>
        </div>
      </nav>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Found {results.count} Properties
          </h1>
          <p className="text-gray-600">
            in {formData.city}, {formData.state} matching your criteria
          </p>
        </div>

        {results.count === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">
              No properties found matching your criteria
            </p>
            <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
              Try a Different Search
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {results.properties?.map((property: any) => (
              <Card key={property.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-3 gap-6">
                  {/* Property Image */}
                  <div className="col-span-1">
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="col-span-2">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {property.title}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{property.address}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          ${property.rentPrice}
                        </div>
                        <p className="text-gray-600">per month</p>
                      </div>
                    </div>

                    {/* Property Features */}
                    <div className="flex gap-6 mb-4 text-gray-700">
                      {property.bedrooms && (
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4" />
                          <span>{property.bedrooms} Bed</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center gap-2">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms} Bath</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        <span className="capitalize">{property.propertyType}</span>
                      </div>
                    </div>

                    {/* Acceptance Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {getChallengesBadges(property).map((badge) => (
                        <Badge key={badge} variant="secondary" className="bg-green-100 text-green-800">
                          ✓ {badge}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => {
                        sessionStorage.setItem("selectedProperty", JSON.stringify(property));
                        navigate(`/property/${property.id}`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View Details & Contact Info
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>&copy; 2026 Second Chance Housing List. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
