import { CheckCircle2, Users, Shield, MessageSquare, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OrderSummaryBenefitsProps {
  city?: string;
}

export default function OrderSummaryBenefits({ city = "your area" }: OrderSummaryBenefitsProps) {
  const benefits = [
    {
      icon: MapPin,
      title: `Custom ${city} Second Chance Rentals List`,
      description: "A personalized list of Second Chance Apartments, Housing Programs, Private Landlords, Rental Properties, and Corporate Leasing options that match your rental profile and credit challenges.",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: Users,
      title: "Personal Support Agent (Until Approved)",
      description: "A dedicated support agent who works directly with you, navigates the rental options with you, and guides you through the approval process until you're successfully approved into a rental property. Your agent is committed to your success.",
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    },
    {
      icon: Shield,
      title: "100% Money Back Guarantee",
      description: "If you're not approved by any rental property or second chance program on our provided list within 30 days, we'll refund your entire purchase.",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: MessageSquare,
      title: "24/7 Email & Chat Support",
      description: "Round-the-clock email and chat support to answer your questions and guide you through the application process.",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">What You're Getting</h3>
        <p className="text-sm text-muted-foreground">
          Everything included with your order to help you find and secure approved housing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => {
          const IconComponent = benefit.icon;
          return (
            <Card key={index} className="border border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 ${benefit.bgColor} rounded-lg p-3 h-fit`}>
                    <IconComponent className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1 text-sm">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Guarantee Badge */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-green-900 dark:text-green-100">
              Risk-Free Purchase
            </p>
            <p className="text-xs text-green-800 dark:text-green-200 mt-1">
              We're confident in our service. If you don't get approved within 30 days, you get 100% of your money back—no questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
