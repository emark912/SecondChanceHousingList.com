import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Search, CreditCard, Phone, Home } from "lucide-react";

export default function HowItWorks() {
  const [, navigate] = useLocation();

  const steps = [
    {
      icon: Search,
      title: "Search Properties",
      description: "Enter your location, budget, and credit challenges. Our platform finds landlords who accept tenants like you.",
    },
    {
      icon: Home,
      title: "Browse Listings",
      description: "View properties that match your needs with full details about amenities, rent, and landlord acceptance criteria.",
    },
    {
      icon: CreditCard,
      title: "Make a Donation",
      description: "Donate to support our mission and unlock landlord contact information for all listings.",
    },
    {
      icon: Phone,
      title: "Contact Landlords",
      description: "Reach out directly to landlords and property managers to discuss your rental application.",
    },
    {
      icon: CheckCircle,
      title: "Get Approved",
      description: "Work with landlords who are willing to give you a second chance at housing.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">How It Works</h1>
            <p className="text-xl text-blue-100">
              A simple 5-step process to find your next rental home
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-8 items-start">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white font-bold text-2xl">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-6 h-6 text-blue-600" />
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 text-lg">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Key Features */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-3 gap-8">
              <Card className="p-8 text-center">
                <div className="text-5xl font-bold text-blue-600 mb-4">95%</div>
                <h3 className="text-xl font-bold mb-2">Approval Rate</h3>
                <p className="text-gray-600">
                  Our landlords actively seek tenants with second chances
                </p>
              </Card>

              <Card className="p-8 text-center">
                <div className="text-5xl font-bold text-blue-600 mb-4">50+</div>
                <h3 className="text-xl font-bold mb-2">States Covered</h3>
                <p className="text-gray-600">
                  Access to rental properties across the United States
                </p>
              </Card>

              <Card className="p-8 text-center">
                <div className="text-5xl font-bold text-blue-600 mb-4">Free</div>
                <h3 className="text-xl font-bold mb-2">Search</h3>
                <p className="text-gray-600">
                  Browse properties for free, donate to unlock contact info
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold mb-8">Common Questions</h2>
          <div className="grid grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Is my information private?</h3>
              <p className="text-gray-600">
                Yes, we take privacy seriously. Your information is only shared with landlords you contact.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">How much does a donation cost?</h3>
              <p className="text-gray-600">
                Donations start at $5 and support our mission to help renters in challenging situations.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Do I need to donate to search?</h3>
              <p className="text-gray-600">
                No! You can search for free. You only need to donate to see landlord contact information.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">What if I have more questions?</h3>
              <p className="text-gray-600">
                Check our FAQ page or contact our support team at support@secondchancehousinglist.com
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Find Your Home?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Start searching for rental properties today
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-bold"
            >
              Start Searching
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
