import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What is Second Chance Housing List?",
          a: "Second Chance Housing List is a platform that connects renters with credit challenges, eviction history, criminal records, or other barriers with landlords who are willing to give them a second chance at housing.",
        },
        {
          q: "Is this service free?",
          a: "Searching for properties is completely free. You only need to make a donation to unlock landlord contact information.",
        },
        {
          q: "How much should I donate?",
          a: "Donations start at $5 and go up from there. The amount is entirely up to you. Your donation supports our mission and grants you permanent access to landlord contact information.",
        },
      ],
    },
    {
      category: "Searching & Properties",
      questions: [
        {
          q: "What information can I see without donating?",
          a: "You can see all property details including address, rent price, bedrooms, bathrooms, amenities, and which challenges the landlord accepts (no credit, evictions, criminal history, etc.).",
        },
        {
          q: "What information requires a donation?",
          a: "Landlord and property manager contact information (phone number and email address) is only visible after you make a donation.",
        },
        {
          q: "How many properties are in your database?",
          a: "We have thousands of properties across 50+ states. We're constantly adding more landlords who are willing to work with tenants facing challenges.",
        },
        {
          q: "Can I filter properties by specific criteria?",
          a: "Yes! You can filter by location, budget, number of bedrooms, pet-friendly status, and the specific challenges you're facing.",
        },
      ],
    },
    {
      category: "Donations & Payments",
      questions: [
        {
          q: "How do I make a donation?",
          a: "When you find a property you're interested in, click the 'Unlock Contact Info' button. You'll be taken to a secure Stripe checkout page where you can enter your payment information.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit and debit cards through Stripe. This includes Visa, Mastercard, American Express, and Discover.",
        },
        {
          q: "Is my payment information secure?",
          a: "Yes. We use Stripe, a PCI-DSS Level 1 certified payment processor. Your payment information is never stored on our servers.",
        },
        {
          q: "Will I receive a receipt?",
          a: "Yes! You'll receive an email confirmation immediately after your donation is processed, along with instructions on how to access landlord contact information.",
        },
        {
          q: "Can I get a refund?",
          a: "Donations are generally non-refundable as they support our platform. However, if you experience any issues, please contact our support team.",
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          q: "Is my personal information private?",
          a: "Yes. We take privacy very seriously. Your information is only shared with landlords you choose to contact.",
        },
        {
          q: "Will landlords spam me?",
          a: "We encourage landlords to respect your privacy. If you receive unwanted contact, you can report it to us and we'll take action.",
        },
        {
          q: "How is my data protected?",
          a: "We use industry-standard encryption and security measures to protect your data. We comply with all applicable privacy laws.",
        },
        {
          q: "Can I delete my account?",
          a: "Yes. You can request account deletion at any time by contacting our support team.",
        },
      ],
    },
    {
      category: "Landlords & Properties",
      questions: [
        {
          q: "How do landlords get listed on your platform?",
          a: "Landlords apply through our application process. We verify that they genuinely accept tenants with second chances.",
        },
        {
          q: "Are all landlords verified?",
          a: "We verify landlord information to the best of our ability, but we recommend doing your own due diligence before renting.",
        },
        {
          q: "What if I have a bad experience with a landlord?",
          a: "Please report any issues to our support team. We take complaints seriously and may remove landlords who violate our policies.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-blue-100">
              Find answers to common questions about our platform
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          {faqs.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((faq, questionIndex) => {
                  const globalIndex = sectionIndex * 100 + questionIndex;
                  const isExpanded = expandedIndex === globalIndex;

                  return (
                    <Card
                      key={questionIndex}
                      className="overflow-hidden cursor-pointer hover:shadow-md transition"
                      onClick={() =>
                        setExpandedIndex(isExpanded ? null : globalIndex)
                      }
                    >
                      <div className="p-6 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-900 flex-1">
                          {faq.q}
                        </h3>
                        <ChevronDown
                          className={`w-6 h-6 text-blue-600 transition-transform flex-shrink-0 ml-4 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-gray-200">
                          <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Contact Support */}
        <section className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Didn't find your answer?</h2>
            <p className="text-gray-600 text-lg mb-8">
              Our support team is here to help. Reach out with any questions.
            </p>
            <div className="space-y-4">
              <p className="text-lg">
                <strong>Email:</strong> support@secondchancehousinglist.com
              </p>
              <p className="text-lg">
                <strong>Phone:</strong> (555) 123-4567
              </p>
              <p className="text-lg">
                <strong>Hours:</strong> Monday - Friday, 9am - 5pm EST
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
